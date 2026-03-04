CREATE TABLE utilisateurs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  apogee VARCHAR(20) NOT NULL UNIQUE,
  nom VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  mot_de_passe_hash VARCHAR(255) NOT NULL,
  solde DECIMAL(10,2) DEFAULT 600,
  code_qr VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE services (
  id INT AUTO_INCREMENT PRIMARY KEY,
  type_repas ENUM('dejeuner','diner') NOT NULL,
  heure_debut TIME NOT NULL,
  heure_fin TIME NOT NULL
);

CREATE TABLE reservations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_utilisateur INT NOT NULL,
  id_service INT NOT NULL,
  date_repas DATE NOT NULL,
  statut ENUM('RESERVEE','UTILISEE','ANNULEE') DEFAULT 'RESERVEE',

  UNIQUE (id_utilisateur, id_service, date_repas),

  FOREIGN KEY (id_utilisateur) REFERENCES utilisateurs(id) ON DELETE CASCADE,
  FOREIGN KEY (id_service) REFERENCES services(id) ON DELETE CASCADE
);

CREATE INDEX idx_reservation_date ON reservations(date_repas);
CREATE INDEX idx_reservation_user ON reservations(id_utilisateur);

CREATE TABLE administrateurs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(100) UNIQUE NOT NULL,
  mot_de_passe_hash VARCHAR(255) NOT NULL
);