// Fonction pour ouvrir le formulaire
async function openForm() {
  const overlay = document.createElement('div');
  overlay.classList.add('modal-overlay');

  const modalContent = document.createElement('div');
  modalContent.classList.add('modal-content');

  const urlParams = new URLSearchParams(window.location.search);
  const vehiculeId = urlParams.get('id');

  let vehiculeNom = "Véhicule sélectionné";
  try {
    const res = await fetch("http://localhost:3000/vehicules");
    const vehicules = await res.json();
    const vehicule = vehicules.find(v => v.id == vehiculeId);
    if (vehicule) vehiculeNom = vehicule.nom;
  } catch (err) {
    console.error("Erreur chargement du véhicule :", err);
  }

  modalContent.innerHTML = `
    <h3>Formulaire de réservation</h3>
    <form id="reservationForm">
        <label for="vehicule">Véhicule</label>
        <input type="text" id="vehicule" class="form-control mb-3" value="${vehiculeNom}" readonly>

        <label for="nom">Nom</label>
        <input type="text" id="nom" required class="form-control mb-2">

        <label for="email">Email</label>
        <input type="email" id="email" required class="form-control mb-2">

        <label for="mot_de_passe">Mot de passe</label>
        <input type="password" id="mot_de_passe" required class="form-control mb-3">

        <label for="date_debut">Date de début</label>
        <input type="datetime-local" id="date_debut" required class="form-control mb-2">

        <label for="duree">Durée (en heures)</label>
        <input type="number" id="duree" required min="1" class="form-control mb-3">

        <button type="submit" class="btn btn-success mt-2">Soumettre</button>
        <button type="button" onclick="closeForm()" class="btn btn-danger mt-2">Annuler</button>
    </form>
  `;

  overlay.appendChild(modalContent);
  document.body.appendChild(overlay);

  modalContent.querySelector('#reservationForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    const nom = document.getElementById('nom').value;
    const email = document.getElementById('email').value;
    const mot_de_passe = document.getElementById('mot_de_passe').value;
    const date_debut = document.getElementById('date_debut').value;
    const duree = parseInt(document.getElementById('duree').value);

    try {
      // Vérification de l'utilisateur
      const res = await fetch("http://localhost:3000/verifier-utilisateur", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nom, email, mot_de_passe })
      });

      const result = await res.json();

      if (!result.success) {
        alert("Utilisateur non trouvé. Vérifiez vos informations.");
        return;
      }

      // Réserver le véhicule
      const reserveRes = await fetch(`http://localhost:3000/vehicules/${vehiculeId}/reserver`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ date_debut, duree_heures: duree })
      });

      const reserveResult = await reserveRes.json();

      if (reserveResult.success) {
        alert(`Réservation confirmée pour le véhicule : ${vehiculeNom}`);
        closeForm();
        window.location.href = "Louer.html";
      } else {
        alert("Erreur lors de la réservation : " + reserveResult.message);
      }
    } catch (err) {
      console.error("Erreur réservation :", err);
      alert("Une erreur est survenue.");
    }
  });
}

// Fermer le formulaire
function closeForm() {
  const overlay = document.querySelector('.modal-overlay');
  if (overlay) {
    document.body.removeChild(overlay);
  }
}

// Bouton principal
document.getElementById('openFormButton').addEventListener('click', openForm);