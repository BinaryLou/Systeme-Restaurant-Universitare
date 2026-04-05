USE ru_ticket;

-- UTILISATEURS
INSERT INTO utilisateur
(nom, prenom, email, apogee, mot_de_passe_hash, solde, code_qr)
VALUES
(
  'El Amrani',
  'Youssef',
  'youssef@ensa.ma',
  'A12345',
  '$2b$10$zQDbS9e7UmEYFkiHjdAu5ebZhnFKNcxsxi.2q/pXBs1eJS23SiwsK',
  600.00,
  UUID()
),
(
  'Benali',
  'Sara',
  'sara@ensa.ma',
  'A12346',
  '$2b$10$CICtmntKX/K09CmtsSCp8erGLiweJKbM3vTQoDiL/zjOx9Wd4jOIG',
  600.00,
  UUID()
),
(
  'Karim',
  'Ahmed',
  'ahmed@ensa.ma',
  'A12347',
  '$2b$10$gQ8vYJmP0C3pVxK1X6qCMeR9h2W7X8Y9Z0a1b2c3d4e5f6g7h8i',
  600.00,
  UUID()
);

-- ADMINISTRATEUR
INSERT INTO administrateur
(nom, prenom, email, mot_de_passe_hash)
VALUES
(
  'Admin',
  'RU',
  'admin@ensa.ma',
  '$2b$10$KhmaLc6B90AbPUBI/BIAdew2AHCPCxLXWSYK7sbYiiDbfd7F2GaS.'
);

-- SERVICES REPAS
INSERT INTO service_repas
(type_repas, heure_debut, heure_fin)
VALUES
('DEJEUNER', '11:00:00', '14:00:00'),
('DINER', '17:00:00', '20:00:00');

-- MENUS
INSERT INTO menu
(date_menu, description, id_service, id_admin)
VALUES
(CURDATE(), 'Poulet rôti + riz + salade', 1, 1),
(CURDATE(), 'Couscous + légumes', 2, 1);

-- RESERVATIONS
INSERT INTO reservation
(date_repas, statut, id_utilisateur, id_service)
VALUES
(CURDATE(), 'EN_ATTENTE', 1, 1),
(CURDATE(), 'VALIDEE', 2, 2),
(CURDATE(), 'ANNULEE', 3, 2);

INSERT INTO password_reset_tokens (
  id_utilisateur,
  token_hash,
  expires_at
)
VALUES (
  1,
  'hashed_token_mysql_test_1',
  DATE_ADD(NOW(), INTERVAL 1 HOUR)
);

INSERT INTO weekly_menus (
  day_of_week,
  label,
  lunch_content,
  dinner_content,
  is_published,
  is_closed,
  created_by_admin_id
)
VALUES (
  1,
  'Menu standard du lundi',
  JSON_OBJECT(
    'entree', 'Salade verte',
    'plat', 'Poulet rôti',
    'accompagnement', 'Riz',
    'dessert', 'Fruit'
  ),
  JSON_OBJECT(
    'entree', 'Soupe',
    'plat', 'Poisson grillé',
    'accompagnement', 'Pommes vapeur',
    'dessert', 'Yaourt'
  ),
  TRUE,
  FALSE,
  1
);

INSERT INTO menu_exceptions (
  menu_date,
  weekly_menu_id,
  label,
  lunch_content,
  dinner_content,
  is_published,
  is_closed,
  reason,
  created_by_admin_id
)
VALUES (
  '2026-01-28',
  1,
  'Menu exceptionnel du 28 janvier',
  JSON_OBJECT(
    'entree', 'Salade marocaine',
    'plat', 'Tajine de poulet',
    'accompagnement', 'Semoule',
    'dessert', 'Orange'
  ),
  JSON_OBJECT(
    'entree', 'Harira',
    'plat', 'Poisson au four',
    'accompagnement', 'Légumes',
    'dessert', 'Flan'
  ),
  TRUE,
  FALSE,
  'Journée spéciale',
  1
);