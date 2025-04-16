document.addEventListener("DOMContentLoaded", async () => {
    const userInfoDiv = document.getElementById("userInfo");
    const mesVehiculesDiv = document.getElementById("mesVehicules");
    const mesReservationsDiv = document.getElementById("mesReservations");
  
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
  
      // 🔹 Véhicules loués
      const loues = await fetch("http://localhost:3000/mes-vehicules", { credentials: "include" });
      const mesVehicules = await loues.json();
  
      mesVehicules.forEach(v => {
        mesVehiculesDiv.innerHTML += generateCard(v, "location");
      });
  
      // 🔹 Réservations
      const reservationsRes = await fetch("http://localhost:3000/mes-reservations", { credentials: "include" });
      const mesReservations = await reservationsRes.json();
  
      console.log("✅ Réservations récupérées :", mesReservations);
  
      mesReservations.forEach(r => {
        const v = r.vehicule || r.Vehicule; // fallback majuscule au cas où Sequelize nomme comme ça
        if (!v) return;
  
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
              <p><strong>Date début :</strong> ${new Date(r.date_debut).toLocaleString()}</p>
              <p><strong>Durée :</strong> ${r.duree_heures} heure(s)</p>
            </div>
          </div>
        `;
        mesReservationsDiv.innerHTML += card;
      });
  
    } catch (err) {
      console.error("Erreur chargement compte :", err);
      userInfoDiv.innerHTML = "<p>Erreur lors du chargement des informations.</p>";
    }
  
    function generateCard(v, type) {
      return `
        <div class="vehicule-card">
          <img src="../${v.image_url || 'img/default.jpg'}" alt="${v.nom}">
          <div class="card-body">
            <h4>${v.nom}</h4>
            <p><strong>Lieu :</strong> ${v.localisation}</p>
            <p><strong>Prix :</strong> €${(v.prix_heure / 100).toFixed(2)} / h</p>
            <p class="status ${v.disponible === false ? 'reserved' : ''}">
              ${v.disponible === false ? 'Réservé' : 'Disponible'}
            </p>
          </div>
        </div>
      `;
    }
  });