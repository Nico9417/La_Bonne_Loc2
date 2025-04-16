document.addEventListener("DOMContentLoaded", async () => {
  const userInfoDiv = document.getElementById("userInfo");
  const userIconBtn = document.getElementById("userIcon");

  let userId = null;

  // 🔹 Vérifie si l'utilisateur est connecté
  try {
    const res = await fetch("http://localhost:3000/me", {
      credentials: "include"
    });

    const result = await res.json();

    if (result.loggedIn) {
      const email = result.user.email;
      userId = result.user.id;
      userInfoDiv.innerHTML = `<strong>Email :</strong><br>${email}`;
      userIconBtn.style.display = "inline-block";

      userIconBtn.addEventListener("click", () => {
        userInfoDiv.style.display =
          userInfoDiv.style.display === "none" ? "block" : "none";
      });
    } else {
      userIconBtn.style.display = "none";
    }
  } catch (err) {
    console.error("Erreur lors de la vérification de session :", err);
  }

  // 🔹 Chargement des véhicules
  const container = document.getElementById("vehicules-list");

  try {
    const res = await fetch("http://localhost:3000/vehicules");
    const vehicules = await res.json();

    vehicules.forEach(v => {
      container.innerHTML += generateVehiculeCard(v);

      // Ajout de marqueur sur la carte
      if (v.localisation.includes("Villejuif")) {
        L.marker([48.7944, 2.3621]).addTo(carte).bindPopup(`${v.nom} - €${(v.prix_heure / 100).toFixed(2)}`);
      } else if (v.localisation.includes("Paris")) {
        L.marker([48.8292, 2.3553]).addTo(carte).bindPopup(`${v.nom} - €${(v.prix_heure / 100).toFixed(2)}`);
      } else if (v.localisation.includes("Neuilly")) {
        L.marker([48.8858, 2.2698]).addTo(carte).bindPopup(`${v.nom} - €${(v.prix_heure / 100).toFixed(2)}`);
      }
    });
  } catch (err) {
    console.error("Erreur fetch véhicules :", err);
    container.innerHTML = "<p>Impossible de charger les véhicules.</p>";
  }

  // 🔹 Formulaire dynamique d'ajout de véhicule
  document.getElementById("ajouterVehiculeBtn").addEventListener("click", () => {
    const formContainer = document.getElementById("formContainer");

    formContainer.innerHTML = `
      <div class="card p-4 mx-auto" style="max-width: 500px;">
        <h4 class="mb-3">Ajouter un véhicule</h4>
        <form id="vehiculeForm">
          <div class="mb-3">
            <label for="nom" class="form-label">Nom</label>
            <input type="text" class="form-control" id="nom" required>
          </div>
          <div class="mb-3">
            <label for="type" class="form-label">Type</label>
            <input type="text" class="form-control" id="type" required>
          </div>
          <div class="mb-3">
            <label for="localisation" class="form-label">Localisation</label>
            <input type="text" class="form-control" id="localisation" required>
          </div>
          <div class="mb-3">
            <label for="prix_heure" class="form-label">Prix par heure (€)</label>
            <input type="number" class="form-control" id="prix_heure" required>
          </div>
          <button type="submit" class="btn btn-primary w-100">Ajouter</button>
        </form>
      </div>
    `;

    document.getElementById("vehiculeForm").addEventListener("submit", async (e) => {
      e.preventDefault();

      const nom = document.getElementById("nom").value;
      const type = document.getElementById("type").value;
      const localisation = document.getElementById("localisation").value;
      const prix_heure = parseFloat(document.getElementById("prix_heure").value);

      const vehiculeData = {
        nom,
        type,
        localisation,
        prix_heure: Math.round(prix_heure * 100)
      };

      try {
        const res = await fetch("http://localhost:3000/vehicules", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(vehiculeData)
        });

        const result = await res.json();

        if (result.success) {
          const v = result.vehicule;
          container.innerHTML += generateVehiculeCard(v);

          if (v.localisation.includes("Paris")) {
            L.marker([48.8292, 2.3553]).addTo(carte).bindPopup(`${v.nom} - €${(v.prix_heure / 100).toFixed(2)}`);
          }

          formContainer.innerHTML = "";
        } else {
          alert("Erreur lors de l'ajout du véhicule.");
        }
      } catch (err) {
        console.error("Erreur AJAX :", err);
        alert("Erreur serveur.");
      }
    });
  });

  // 🔹 Génère une carte HTML pour un véhicule
  function generateVehiculeCard(v) {
    const dispo = v.disponible;
    const isMine = v.loueur_id === userId;

    const monVehiculeTag = isMine
      ? `<p style="color: orange; font-weight: bold;">Mon véhicule</p>`
      : "";

    const buttonHTML = dispo
      ? `<a href="reservation.html?id=${v.id}" class="btn btn-primary w-100" ${isMine ? 'style="pointer-events: none; opacity: 0.6;"' : ''}>Réserver</a>`
      : `<button class="btn btn-secondary w-100" disabled>Réservé</button>`;

    return `
      <div class="col-md-4">
        <div class="card shadow-sm larger-card">
          <img src="../${v.image_url}" class="card-img-top" alt="${v.nom}">
          <div class="card-body">
            <h5 class="card-title">${v.nom}</h5>
            <p class="card-text"><strong>${v.localisation}</strong></p>
            <p class="price">€${(v.prix_heure / 100).toFixed(2)} / heure</p>
            ${monVehiculeTag}
            ${buttonHTML}
          </div>
        </div>
      </div>
    `;
  }
});
