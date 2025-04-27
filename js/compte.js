// Fonctions GLOBALES dispo pour le HTML
let noteSelectionnee = 0;
let reservationIdEnCours = null;

function ouvrirPopupAvis(reservationId) {
  reservationIdEnCours = reservationId;
  document.getElementById("avisPopup").style.display = "flex";
  genererEtoiles();
}

function fermerPopupAvis() {
  document.getElementById("avisPopup").style.display = "none";
  noteSelectionnee = 0;
  reservationIdEnCours = null;
}

function genererEtoiles() {
  const container = document.getElementById("etoilesContainer");
  container.innerHTML = "";

  for (let i = 1; i <= 5; i++) {
    const etoile = document.createElement("i");
    etoile.classList.add("fas", "fa-star");
    etoile.dataset.valeur = i;
    etoile.onclick = function() {
      noteSelectionnee = i;
      mettreAJourEtoiles();
    };
    container.appendChild(etoile);
  }
}

function mettreAJourEtoiles() {
  const etoiles = document.querySelectorAll("#etoilesContainer i");
  etoiles.forEach(etoile => {
    if (parseInt(etoile.dataset.valeur) <= noteSelectionnee) {
      etoile.classList.add("active");
    } else {
      etoile.classList.remove("active");
    }
  });
}

async function envoyerAvis() {
  const commentaire = document.getElementById("commentaire").value.trim();
  if (!noteSelectionnee || !commentaire) {
    alert("Merci de donner une note et un commentaire.");
    return;
  }

  try {
    const res = await fetch("http://localhost:3000/avis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        reservationId: reservationIdEnCours,
        note: noteSelectionnee,
        commentaire
      })
    });

    const result = await res.json();

    if (result.success) {
      alert("Merci pour votre avis !");
      fermerPopupAvis();
      window.location.reload();
    } else {
      alert("Erreur lors de l'envoi de l'avis.");
    }
  } catch (err) {
    console.error("Erreur lors de l'avis :", err);
  }
}

// === Code qui s'execute au chargement ===
document.addEventListener("DOMContentLoaded", async () => {
  console.log("Tentative de récupération des avis...");

  const resAvis = await fetch("http://localhost:3000/mes-avis", { credentials: "include" });
  const mesAvis = await resAvis.json();
  console.log("MES AVIS :", mesAvis);

  const resAvisRecus = await fetch("http://localhost:3000/avis-recus", { credentials: "include" });
  const avisRecus = await resAvisRecus.json();
  console.log("AVIS RECUS :", avisRecus);

  const userInfoDiv = document.getElementById("userInfo");
  const mesVehiculesDiv = document.getElementById("mesVehicules");
  const mesReservationsDiv = document.getElementById("mesReservations");
  const mesAvisLaissesDiv = document.getElementById("mesAvisLaisses");
  const mesAvisRecusDiv = document.getElementById("mesAvisRecus");

  try {
    const res = await fetch("http://localhost:3000/me", { credentials: "include" });
    const result = await res.json();

    if (!result.loggedIn) {
      userInfoDiv.innerHTML = "<p>Non connecté. Veuillez vous connecter.</p>";
      return;
    }

    const user = result.user;
    userInfoDiv.innerHTML = `
      <p><strong>Nom :</strong> ${user.nom}</p>
      <p><strong>Email :</strong> ${user.email}</p>
      <p><strong>Rôle :</strong> ${user.role}</p>
    `;

    // 🔹 Afficher véhicules en location
    const loues = await fetch("http://localhost:3000/mes-vehicules", { credentials: "include" });
    const mesVehicules = await loues.json();

    mesVehicules.forEach(v => {
      mesVehiculesDiv.innerHTML += generateVehiculeCard(v);
    });

    // 🔹 Afficher mes réservations
    const reservationsRes = await fetch("http://localhost:3000/mes-reservations", { credentials: "include" });
    const mesReservations = await reservationsRes.json();

    mesReservations.forEach(r => {
      const v = r.vehicule || r.Vehicule;
      if (!v) return;

      const dateDebut = new Date(r.date_debut);
      const duree = r.duree_heures || 1;
      const dateFin = new Date(dateDebut.getTime() + duree * 60 * 60 * 1000);
      const now = new Date();
      const reservationTerminee = now > dateFin;

      const card = `
        <div class="vehicule-card">
          <img src="../${v.image_url || 'img/default.jpg'}" alt="${v.nom || 'Sans nom'}">
          <div class="card-body">
            <h4>${v.nom}</h4>
            <p><strong>Lieu :</strong> ${v.localisation}</p>
            <p><strong>Prix :</strong> €${(v.prix_heure / 100).toFixed(2)} / h</p>
            <p class="status ${v.disponible === false ? 'reserved' : ''}">
              ${v.disponible === false ? 'Réservé' : 'Disponible'}
            </p>
            <p><strong>Date début :</strong> ${dateDebut.toLocaleString()}</p>
            <p><strong>Durée :</strong> ${r.duree_heures} heure(s)</p>

            ${reservationTerminee && !r.avis_note ? `
              <button class="avis-button" onclick="ouvrirPopupAvis(${r.id})">Donner un avis</button>
            ` : ''}

            ${r.avis_note ? `
              <div class="avis">
                <div class="etoiles">
                  ${'⭐'.repeat(r.avis_note)}
                </div>
                <p class="commentaire">${r.avis_commentaire}</p>
              </div>
            ` : ''}
          </div>
        </div>
      `;
      mesReservationsDiv.innerHTML += card;
    });

    // 🔹 Afficher MES AVIS LAISSÉS
    const avisLaissesRes = await fetch("http://localhost:3000/mes-avis", { credentials: "include" });
    const avisLaisses = await avisLaissesRes.json();

    avisLaisses.forEach(a => {
      if (!a.vehicule) return;

      const card = `
        <div class="vehicule-card">
          <img src="../${a.vehicule.image_url || 'img/default.jpg'}" alt="${a.vehicule.nom || 'Sans nom'}">
          <div class="card-body">
            <h4>${a.vehicule.nom}</h4>
            <div class="etoiles">
              ${'⭐'.repeat(a.avis_note)}
            </div>
            <p class="commentaire">${a.avis_commentaire}</p>
          </div>
        </div>
      `;
      mesAvisLaissesDiv.innerHTML += card;
    });

    // 🔹 Afficher AVIS RECUS sur MES VÉHICULES
    const avisRecusRes = await fetch("http://localhost:3000/avis-recus", { credentials: "include" });
    const avisRecus = await avisRecusRes.json();

    avisRecus.forEach(a => {
      if (!a.vehicule) return;
    
      const card = `
        <div class="vehicule-card">
          <img src="../${a.vehicule.image_url || 'img/default.jpg'}" alt="${a.vehicule.nom || 'Sans nom'}">
          <div class="card-body">
            <h4>${a.vehicule.nom}</h4>
            <div class="etoiles">
              ${'⭐'.repeat(a.avis_note)}
            </div>
            <p class="commentaire">${a.avis_commentaire}</p>
          </div>
        </div>
      `;
      mesAvisRecusDiv.innerHTML += card;
    });

  } catch (err) {
    console.error("Erreur chargement compte :", err);
    userInfoDiv.innerHTML = "<p>Erreur lors du chargement des informations.</p>";
  }

  function generateVehiculeCard(v) {
    return `
      <div class="vehicule-card" data-id="${v.id}">
        <img src="../${v.image_url || 'img/default.jpg'}" alt="${v.nom}">
        <div class="card-body">
          <h4>${v.nom}</h4>
          <p><strong>Lieu :</strong> ${v.localisation}</p>
          <p><strong>Prix :</strong> €${(v.prix_heure / 100).toFixed(2)} / h</p>
          <p class="status ${v.disponible === false ? 'reserved' : ''}">
            ${v.disponible === false ? 'Réservé' : 'Disponible'}
          </p>
          ${v.disponible ? `
            <button class="btn btn-danger btn-sm mt-2 delete-btn" data-id="${v.id}">
              Supprimer
            </button>` : ''}
        </div>
      </div>
    `;
  }

  // 🔥 Gestion suppression véhicule
  document.addEventListener("click", async (e) => {
    if (e.target.classList.contains("delete-btn")) {
      const id = e.target.dataset.id;
      if (confirm("Voulez-vous vraiment supprimer ce véhicule ?")) {
        try {
          const res = await fetch(`http://localhost:3000/vehicules/${id}`, {
            method: "DELETE",
            credentials: "include"
          });
          const result = await res.json();

          if (result.success) {
            document.querySelector(`.vehicule-card[data-id="${id}"]`).remove();
            alert("✅ Véhicule supprimé !");
          } else {
            alert("❌ Suppression impossible : " + result.message);
          }
        } catch (err) {
          console.error("Erreur suppression :", err);
          alert("Erreur serveur.");
        }
      }
    }
  });
});