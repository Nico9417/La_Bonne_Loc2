USE labonloc;

-- Table des utilisateurs
CREATE TABLE utilisateurs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    mot_de_passe VARCHAR(255) NOT NULL, 
    role ENUM('client', 'loueur') DEFAULT 'client',
    date_creation DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table des véhicules à louer
CREATE TABLE vehicules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL, 
    localisation VARCHAR(150) NOT NULL,
    prix_heure INT NOT NULL,
    image_url VARCHAR(255),
    disponible BOOLEAN DEFAULT TRUE,
    loueur_id INT NOT NULL,
    date_ajout DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (loueur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE
);

CREATE TABLE reservations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    utilisateur_id INT NOT NULL,
    vehicule_id INT NOT NULL,
    date_reservation DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    date_debut DATETIME NOT NULL,
    duree_heures INT NOT NULL CHECK (duree_heures > 0),
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE,
    FOREIGN KEY (vehicule_id) REFERENCES vehicules(id) ON DELETE CASCADE
);

CREATE TABLE avis (
    id INT AUTO_INCREMENT PRIMARY KEY,
    utilisateur_id INT NOT NULL,
    vehicule_id INT NOT NULL,
    commentaire TEXT,
    note INT CHECK (note >= 1 AND note <= 5),
    date_avis DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE,
    FOREIGN KEY (vehicule_id) REFERENCES vehicules(id) ON DELETE CASCADE
);