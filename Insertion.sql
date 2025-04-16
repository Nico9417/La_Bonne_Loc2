use labonloc;

-- INSERT INTO utilisateurs (id, nom, email, mot_de_passe, role)
-- VALUES (1234, 'test', 'test@mail.com', 'test1234', 'client');

-- Trottinette électrique
INSERT INTO vehicules (nom, type, localisation, prix_heure, image_url, disponible, loueur_id)
VALUES (
  'Trottinette électrique',
  'trottinette',
  'Villejuif, Île-de-France',
  120, -- €1,20 => 120 centimes
  'img/trotinette_electrique.png',
  TRUE,
  1234
);

-- Vélo de Montagne
INSERT INTO vehicules (nom, type, localisation, prix_heure, image_url, disponible, loueur_id)
VALUES (
  'Vélo de Montagne',
  'vélo',
  'Paris 13, Île-de-France',
  245, -- €2,45 => 245 centimes
  'img/velo_montagne.png',
  TRUE,
  1234
);

-- Skateboard
INSERT INTO vehicules (nom, type, localisation, prix_heure, image_url, disponible, loueur_id)
VALUES (
  'Skateboard',
  'skateboard',
  'Neuilly-sur-Seine, Île-de-France',
  170, -- €1,70 => 170 centimes
  'img/skate.png',
  TRUE,
  1234
);

