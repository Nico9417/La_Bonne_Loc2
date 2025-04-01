function openForm() {
    const overlay = document.createElement('div');
    overlay.classList.add('modal-overlay');

    const modalContent = document.createElement('div');
    modalContent.classList.add('modal-content');

    modalContent.innerHTML = `
        <h3>Formulaire de réservation</h3>
        <form id="reservationForm">
            <label for="nom">Nom</label>
            <input type="text" id="nom" required>

            <label for="prenom">Prénom</label>
            <input type="text" id="prenom" required>

            <label for="identifiant">Identifiant utilisateur</label>
            <input type="text" id="identifiant" required placeholder="@username">

            <label for="age">Âge</label>
            <input type="number" id="age" required>

            <label for="adresse">Adresse</label>
            <input type="text" id="adresse" required>

            <label for="duree">Durée de la réservation (en heures)</label>
            <input type="number" id="duree" required>

            <button type="submit">Soumettre</button>
            <button type="button" onclick="closeForm()">Annuler</button>
        </form>
    `;

    overlay.appendChild(modalContent);
    document.body.appendChild(overlay);

    // Gestion de la soumission du formulaire
    modalContent.querySelector('#reservationForm').addEventListener('submit', function(event) {
        event.preventDefault();

        // Récupérer les valeurs du formulaire
        const nom = document.getElementById('nom').value;
        const prenom = document.getElementById('prenom').value;
        const identifiant = document.getElementById('identifiant').value;
        const age = document.getElementById('age').value;
        const adresse = document.getElementById('adresse').value;
        const duree = document.getElementById('duree').value;

        // Validation de l'identifiant utilisateur
        if (!identifiant.startsWith('@')) {
            alert('L\'identifiant utilisateur doit commencer par @');
            return;
        }

        // Validation de l'âge
        if (age < 18) {
            alert('Vous devez avoir au moins 18 ans pour réserver.');
            return;
        }

        // Afficher les informations de réservation dans la console
        alert(`Réservation confirmée !
            Nom : ${nom}
            Prénom : ${prenom}
            Identifiant : ${identifiant}
            Âge : ${age}
            Adresse : ${adresse}
            Durée : ${duree} heure(s)`);

        // Fermer le formulaire après soumission
        closeForm();
    });
}

// Fonction pour fermer la modale
function closeForm() {
    const overlay = document.querySelector('.modal-overlay');
    if (overlay) {
        document.body.removeChild(overlay);
    }
}

// Attacher l'événement de clic au bouton "Réserver"
document.getElementById('openFormButton').addEventListener('click', openForm);