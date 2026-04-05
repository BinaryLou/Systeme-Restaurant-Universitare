CREATE DATABASE IF NOT EXISTS ru_ticket;

USE ru_ticket;

-- TABLE: UTILISATEUR
CREATE TABLE utilisateur (
  id_utilisateur     BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  nom                VARCHAR(100) NOT NULL,
  prenom             VARCHAR(100) NOT NULL,
  email              VARCHAR(191) NOT NULL,
  apogee             VARCHAR(50) NOT NULL,
  mot_de_passe_hash  VARCHAR(255) NOT NULL,
  solde              DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  code_qr            VARCHAR(191) NOT NULL,
  created_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id_utilisateur),
  UNIQUE KEY uq_utilisateur_email (email),
  UNIQUE KEY uq_utilisateur_apogee (apogee),
  UNIQUE KEY uq_utilisateur_code_qr (code_qr)
);

-- TABLE: ADMINISTRATEUR
CREATE TABLE administrateur (
  id_admin           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  nom                VARCHAR(100) NOT NULL,
  prenom             VARCHAR(100) NOT NULL,
  email              VARCHAR(191) NOT NULL,
  mot_de_passe_hash  VARCHAR(255) NOT NULL,
  created_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id_admin),
  UNIQUE KEY uq_admin_email (email)
);

-- TABLE: SERVICE_REPAS
CREATE TABLE service_repas (
  id_service   BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  type_repas   ENUM('DEJEUNER','DINER') NOT NULL,
  heure_debut  TIME NOT NULL,
  heure_fin    TIME NOT NULL,
  created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id_service),
  CONSTRAINT chk_service_heures CHECK (heure_debut < heure_fin)
);

-- TABLE: RESERVATION
CREATE TABLE reservation (
  id_reservation   BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  date_creation    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  date_repas       DATE NOT NULL,
  statut           ENUM('EN_ATTENTE','ANNULEE','VALIDEE') NOT NULL DEFAULT 'EN_ATTENTE',
  date_validation  DATETIME NULL,
  id_utilisateur   BIGINT UNSIGNED NOT NULL,
  id_service       BIGINT UNSIGNED NOT NULL,
  created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id_reservation),
  KEY idx_res_user (id_utilisateur),
  KEY idx_res_service (id_service),
  KEY idx_res_date_repas (date_repas),
  KEY idx_res_statut (statut),
  UNIQUE KEY uq_reservation_user_service_date (id_utilisateur, id_service, date_repas),

  CONSTRAINT fk_reservation_utilisateur
    FOREIGN KEY (id_utilisateur) REFERENCES utilisateur(id_utilisateur)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,

  CONSTRAINT fk_reservation_service
    FOREIGN KEY (id_service) REFERENCES service_repas(id_service)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
);

-- TABLE: REFRESH TOKENS
CREATE TABLE refresh_tokens (
  id_refresh_token BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  token_hash       VARCHAR(255) NOT NULL,
  account_type     ENUM('USER', 'ADMIN') NOT NULL,
  user_id          BIGINT UNSIGNED NULL,
  admin_id         BIGINT UNSIGNED NULL,
  expires_at       DATETIME NOT NULL,
  revoked_at       DATETIME NULL,
  created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id_refresh_token),
  UNIQUE KEY uq_refresh_token_hash (token_hash),
  KEY idx_refresh_user_id (user_id),
  KEY idx_refresh_admin_id (admin_id),
  KEY idx_refresh_expires_at (expires_at),

  CONSTRAINT fk_refresh_user
    FOREIGN KEY (user_id) REFERENCES utilisateur(id_utilisateur)
    ON UPDATE CASCADE
    ON DELETE CASCADE,

  CONSTRAINT fk_refresh_admin
    FOREIGN KEY (admin_id) REFERENCES administrateur(id_admin)
    ON UPDATE CASCADE
    ON DELETE CASCADE
);

CREATE TABLE password_reset_tokens (
    id_reset_token INT AUTO_INCREMENT PRIMARY KEY,
    id_utilisateur BIGINT UNSIGNED NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    expires_at DATETIME NOT NULL,
    used_at DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_password_reset_tokens_user
        FOREIGN KEY (id_utilisateur)
        REFERENCES utilisateur(id_utilisateur)
        ON DELETE CASCADE,

    INDEX idx_password_reset_tokens_user (id_utilisateur),
    INDEX idx_password_reset_tokens_expires_at (expires_at),
    UNIQUE KEY uq_password_reset_token_hash (token_hash)
);

-- =========================================================
-- S7-01 : Weekly menus + menu exceptions
-- =========================================================

CREATE TABLE IF NOT EXISTS weekly_menus (
  id_weekly_menu BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  day_of_week TINYINT NOT NULL,
  label VARCHAR(150) NOT NULL,
  lunch_content JSON DEFAULT NULL,
  dinner_content JSON DEFAULT NULL,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  is_closed BOOLEAN NOT NULL DEFAULT FALSE,
  created_by_admin_id BIGINT UNSIGNED NOT NULL,
  updated_by_admin_id BIGINT UNSIGNED DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id_weekly_menu),
  CONSTRAINT uq_weekly_menus_day_of_week UNIQUE (day_of_week),
  CONSTRAINT chk_weekly_menus_day_of_week CHECK (day_of_week BETWEEN 1 AND 7),

  CONSTRAINT fk_weekly_menus_created_by_admin
    FOREIGN KEY (created_by_admin_id)
    REFERENCES administrateur(id_admin)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,

  CONSTRAINT fk_weekly_menus_updated_by_admin
    FOREIGN KEY (updated_by_admin_id)
    REFERENCES administrateur(id_admin)
    ON DELETE SET NULL
    ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS menu_exceptions (
  id_menu_exception BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  menu_date DATE NOT NULL,
  weekly_menu_id BIGINT UNSIGNED DEFAULT NULL,
  label VARCHAR(150) NOT NULL,
  lunch_content JSON DEFAULT NULL,
  dinner_content JSON DEFAULT NULL,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  is_closed BOOLEAN NOT NULL DEFAULT FALSE,
  reason VARCHAR(255) DEFAULT NULL,
  created_by_admin_id BIGINT UNSIGNED NOT NULL,
  updated_by_admin_id BIGINT UNSIGNED DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id_menu_exception),
  CONSTRAINT uq_menu_exceptions_menu_date UNIQUE (menu_date),

  CONSTRAINT fk_menu_exceptions_weekly_menu
    FOREIGN KEY (weekly_menu_id)
    REFERENCES weekly_menus(id_weekly_menu)
    ON DELETE SET NULL
    ON UPDATE CASCADE,

  CONSTRAINT fk_menu_exceptions_created_by_admin
    FOREIGN KEY (created_by_admin_id)
    REFERENCES administrateur(id_admin)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,

  CONSTRAINT fk_menu_exceptions_updated_by_admin
    FOREIGN KEY (updated_by_admin_id)
    REFERENCES administrateur(id_admin)
    ON DELETE SET NULL
    ON UPDATE CASCADE
);