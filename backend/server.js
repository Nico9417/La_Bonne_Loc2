const express = require('express');
const cors = require('cors');
const session = require('express-session');
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('./db');

const Vehicule = require('./models/Vehicule');

const app = express();
const PORT = 3000;

app.use(cors({
  origin: 'http://localhost:5501',
  credentials: true
}));
app.use(express.json());

app.use(session({
  secret: 'labonneloc-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60,
    secure: false
  }
}));

// 🔹 Modèle Utilisateur
const Utilisateur = sequelize.define('utilisateur', {
  nom: DataTypes.STRING,
  email: DataTypes.STRING,
  mot_de_passe: DataTypes.STRING,
  role: DataTypes.STRING
}, {
  tableName: 'utilisateurs',
  timestamps: false
});

// 🔹 Modèle Réservation
const Reservation = sequelize.define('reservation', {
  utilisateur_id: DataTypes.INTEGER,
  vehicule_id: DataTypes.INTEGER,
  date_reservation: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.NOW
  },
  date_debut: DataTypes.DATE,
  duree_heures: DataTypes.INTEGER,
  avis_note: DataTypes.INTEGER,
  avis_commentaire: DataTypes.STRING
}, {
  tableName: 'reservations',
  timestamps: false
});

// 🔹 Associations Sequelize
Reservation.belongsTo(Vehicule, { foreignKey: 'vehicule_id' });
Vehicule.hasMany(Reservation, { foreignKey: 'vehicule_id' });

// 🔹 ROUTES

app.get('/vehicules', async (req, res) => {
  try {
    const vehicules = await Vehicule.findAll();
    res.json(vehicules);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error });
  }
});

app.post('/vehicules', async (req, res) => {
  const { nom, type, localisation, prix_heure } = req.body;

  if (!req.session.user) {
    return res.status(401).json({ success: false, message: "Non authentifié" });
  }

  try {
    const nouveauVehicule = await Vehicule.create({
      nom,
      type,
      localisation,
      prix_heure,
      image_url: "img/default.jpg",
      disponible: true,
      loueur_id: req.session.user.id
    });

    res.json({ success: true, vehicule: nouveauVehicule });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur serveur", error });
  }
});

app.post('/vehicules/:id/reserver', async (req, res) => {
  const vehiculeId = req.params.id;
  const { date_debut, duree_heures } = req.body;

  if (!req.session.user) {
    return res.status(401).json({ success: false, message: "Non connecté" });
  }

  try {
    const vehicule = await Vehicule.findByPk(vehiculeId);

    if (!vehicule || !vehicule.disponible) {
      return res.status(400).json({ success: false, message: "Véhicule non disponible" });
    }

    // 🔒 Empêcher la réservation de son propre véhicule
    if (vehicule.loueur_id === req.session.user.id) {
      return res.status(403).json({ success: false, message: "Vous ne pouvez pas réserver votre propre véhicule." });
    }

    await Reservation.create({
      utilisateur_id: req.session.user.id,
      vehicule_id: vehicule.id,
      date_debut,
      duree_heures
    });

    vehicule.disponible = false;
    await vehicule.save();

    res.json({ success: true, message: "Réservation effectuée." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur réservation", error });
  }
});

app.get('/mes-vehicules', async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ success: false, message: "Non connecté" });
  }

  try {
    const vehicules = await Vehicule.findAll({
      where: { loueur_id: req.session.user.id }
    });

    res.json(vehicules);
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur serveur", error });
  }
});

app.get('/mes-reservations', async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ success: false, message: "Non connecté" });
  }

  try {
    const reservations = await Reservation.findAll({
      where: { utilisateur_id: req.session.user.id },
      include: [{ model: Vehicule }]
    });

    res.json(reservations);
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur serveur", error });
  }
});

app.post('/login', async (req, res) => {
  const { email, mot_de_passe } = req.body;

  try {
    const user = await Utilisateur.findOne({
      where: { email, mot_de_passe }
    });

    if (!user) {
      return res.status(401).json({ success: false, message: "Identifiants incorrects" });
    }

    req.session.user = {
      id: user.id,
      nom: user.nom,
      email: user.email,
      role: user.role
    };

    res.json({ success: true, user: req.session.user });
  } catch (err) {
    res.status(500).json({ success: false, message: "Erreur serveur", err });
  }
});

app.get('/me', (req, res) => {
  if (req.session.user) {
    res.json({ loggedIn: true, user: req.session.user });
  } else {
    res.json({ loggedIn: false });
  }
});

app.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true, message: "Déconnecté" });
  });
});

app.post('/verifier-utilisateur', async (req, res) => {
  const { nom, email, mot_de_passe } = req.body;

  try {
    const utilisateur = await Utilisateur.findOne({
      where: { nom, email, mot_de_passe }
    });

    if (!utilisateur) {
      return res.status(404).json({ success: false, message: "Utilisateur non trouvé" });
    }

    res.json({ success: true, utilisateur });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur serveur", error });
  }
});

// 🛑 Supprimer un véhicule
app.delete("/vehicules/:id", async (req, res) => {
  try {
    const vehiculeId = req.params.id;

    // Vérifier que le véhicule est disponible avant suppression
    const vehicule = await Vehicule.findByPk(vehiculeId);

    if (!vehicule) {
      return res.status(404).json({ success: false, message: "Véhicule introuvable." });
    }

    if (!vehicule.disponible) {
      return res.status(400).json({ success: false, message: "Véhicule déjà réservé, impossible de supprimer." });
    }

    await vehicule.destroy();

    res.json({ success: true, message: "Véhicule supprimé avec succès." });
  } catch (err) {
    console.error("Erreur suppression véhicule :", err);
    res.status(500).json({ success: false, message: "Erreur serveur." });
  }
});

// 🚀 Route pour inscription
app.post("/register", async (req, res) => {
  const { nom, email, mot_de_passe, role } = req.body;

  if (!nom || !email || !mot_de_passe || !role) {
    return res.status(400).json({ success: false, message: "Tous les champs sont requis." });
  }

  try {
    const utilisateurExist = await Utilisateur.findOne({ where: { email } });

    if (utilisateurExist) {
      return res.status(400).json({ success: false, message: "Email déjà utilisé." });
    }

    const nouvelUtilisateur = await Utilisateur.create({
      nom,
      email,
      mot_de_passe,
      role
    });

    res.json({ success: true, message: "Utilisateur créé avec succès.", user: nouvelUtilisateur });
  } catch (err) {
    console.error("Erreur création utilisateur :", err);
    res.status(500).json({ success: false, message: "Erreur serveur." });
  }
});

// 🛠️ À appeler dès le démarrage pour mettre à jour les véhicules
async function majDisponibiliteVehicules() {
  try {
    const maintenant = new Date();

    const reservations = await Reservation.findAll({
      include: { model: Vehicule }
    });

    for (const reservation of reservations) {
      const dateDebut = new Date(reservation.date_debut);
      const dateFin = new Date(dateDebut.getTime() + reservation.duree_heures * 3600 * 1000);

      if (dateFin < maintenant) {
        const vehicule = await Vehicule.findByPk(reservation.vehicule_id);
        
        if (vehicule && vehicule.disponible === false) {
          vehicule.disponible = true;
          await vehicule.save();
          console.log(`✅ Véhicule ${vehicule.nom} est à nouveau disponible.`);
        }
      }
    }
  } catch (err) {
    console.error("Erreur mise à jour véhicules :", err);
  }
}

sequelize.sync()
  .then(async () => {
    await majDisponibiliteVehicules(); // ✅ update véhicules au bon moment
  })
  .catch(err => {
    console.error("Erreur synchronisation base :", err);
  });

// Route pour un avis
app.post("/avis", async (req, res) => {
  const { reservationId, note, commentaire } = req.body;

  if (!req.session.user) {
    return res.status(401).json({ success: false, message: "Non connecté" });
  }

  try {
    const reservation = await Reservation.findByPk(reservationId);

    if (!reservation) {
      return res.status(404).json({ success: false, message: "Réservation introuvable" });
    }

    reservation.avis_note = note;
    reservation.avis_commentaire = commentaire;
    await reservation.save();

    res.json({ success: true, message: "Avis enregistré avec succès." });
  } catch (err) {
    console.error("Erreur enregistrement avis :", err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// 🛑 Nouvelle route pour récupérer mes avis laissés
app.get('/mes-avis', async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ success: false, message: "Non connecté" });
  }

  try {
    const reservationsAvecAvis = await Reservation.findAll({
      where: {
        utilisateur_id: req.session.user.id,
        avis_note: { [Sequelize.Op.not]: null },
        avis_commentaire: { [Sequelize.Op.not]: null }
      },
      include: [{
        model: Vehicule,
        attributes: ['nom', 'image_url']
      }]
    });

    res.json(reservationsAvecAvis);
  } catch (error) {
    console.error("Erreur récupération avis :", error);
    res.status(500).json({ success: false, message: "Erreur serveur", error });
  }
});

app.get('/avis-recus', async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ success: false, message: "Non connecté" });
  }

  try {
    const reservationsAvecAvis = await Reservation.findAll({
      where: {
        avis_note: { [Sequelize.Op.not]: null },
        avis_commentaire: { [Sequelize.Op.not]: null }
      },
      include: [{
        model: Vehicule,
        attributes: ['nom', 'image_url'],
        where: { loueur_id: req.session.user.id }
      }]
    });

    res.json(reservationsAvecAvis);
  } catch (error) {
    console.error("Erreur récupération avis reçus :", error);
    res.status(500).json({ success: false, message: "Erreur serveur", error });
  }
});


app.listen(PORT, () => {
  console.log(`✅ Serveur backend démarré sur http://localhost:${PORT}`);
});