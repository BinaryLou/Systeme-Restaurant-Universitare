-- UTILISATEURS
INSERT INTO utilisateur
(nom, prenom, email, apogee, mot_de_passe_hash, solde, code_qr)
VALUES
(
  'Loukrati',
  'Abderrahmane',
  'Loukrati@ensa.ma',
  'A1234',
  '$2b$10$500yg65u4MpF8CQWxvwus.fe.H3GgWGp.E/DNzmsYOG.zZPIH6lNe', -- 123456
  600.00,
  UUID()
),
(
  'Benali',
  'Sara',
  'sara@ensa.ma',
  'A12345',
  '$2b$10$500yg65u4MpF8CQWxvwus.fe.H3GgWGp.E/DNzmsYOG.zZPIH6lNe', -- 123456
  600.00,
  UUID()
),
(
  'Karim',
  'Ahmed',
  'ahmed@ensa.ma',
  'A123456',
  '$2b$10$500yg65u4MpF8CQWxvwus.fe.H3GgWGp.E/DNzmsYOG.zZPIH6lNe', -- 123456
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
  '$2b$10$500yg65u4MpF8CQWxvwus.fe.H3GgWGp.E/DNzmsYOG.zZPIH6lNe' -- 123456
);

-- SERVICES REPAS
INSERT INTO service_repas
(type_repas, heure_debut, heure_fin)
VALUES
('DEJEUNER', '11:00:00', '14:30:00'),
('DINER', '17:00:00', '20:00:00');

-- RESERVATIONS
INSERT INTO reservation
(date_repas, statut, id_utilisateur, id_service)
VALUES
(CURDATE(), 'RESERVEE', 1, 1),
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
  created_by_admin_id,
  updated_by_admin_id
) VALUES
(
  1,
  'Menu standard du lundi',
  JSON_OBJECT(
    'entree', 'Salade verte',
    'plat', 'Poulet rôti',
    'accompagnement', 'Riz',
    'dessert', 'Fruit de saison'
  ),
  JSON_OBJECT(
    'entree', 'Soupe de légumes',
    'plat', 'Poisson grillé',
    'accompagnement', 'Pommes vapeur',
    'dessert', 'Yaourt'
  ),
  TRUE,
  FALSE,
  1,
  1
),
(
  2,
  'Menu standard du mardi',
  JSON_OBJECT(
    'entree', 'Carottes râpées',
    'plat', 'Boeuf mijoté',
    'accompagnement', 'Purée',
    'dessert', 'Orange'
  ),
  JSON_OBJECT(
    'entree', 'Harira',
    'plat', 'Omelette fromage',
    'accompagnement', 'Salade',
    'dessert', 'Pomme'
  ),
  TRUE,
  FALSE,
  1,
  1
),
(
  3,
  'Menu standard du mercredi',
  JSON_OBJECT(
    'entree', 'Salade marocaine',
    'plat', 'Tajine de poulet',
    'accompagnement', 'Semoule',
    'dessert', 'Banane'
  ),
  JSON_OBJECT(
    'entree', 'Velouté',
    'plat', 'Pâtes bolognaise',
    'accompagnement', 'Pain',
    'dessert', 'Yaourt aux fruits'
  ),
  TRUE,
  FALSE,
  1,
  1
),
(
  4,
  'Menu standard du jeudi',
  JSON_OBJECT(
    'entree', 'Betteraves',
    'plat', 'Kefta sauce tomate',
    'accompagnement', 'Riz',
    'dessert', 'Poire'
  ),
  JSON_OBJECT(
    'entree', 'Soupe de lentilles',
    'plat', 'Quiche légumes',
    'accompagnement', 'Salade verte',
    'dessert', 'Compote'
  ),
  TRUE,
  FALSE,
  1,
  1
),
(
  5,
  'Menu standard du vendredi',
  JSON_OBJECT(
    'entree', 'Concombre tomate',
    'plat', 'Couscous',
    'accompagnement', 'Légumes',
    'dessert', 'Raisin'
  ),
  JSON_OBJECT(
    'entree', 'Chorba',
    'plat', 'Pizza maison',
    'accompagnement', 'Salade',
    'dessert', 'Flan'
  ),
  TRUE,
  FALSE,
  1,
  1
),
(
  6,
  'Menu standard du samedi',
  JSON_OBJECT(
    'entree', 'Macédoine',
    'plat', 'Escalope panée',
    'accompagnement', 'Frites',
    'dessert', 'Pêche'
  ),
  JSON_OBJECT(
    'entree', 'Soupe du chef',
    'plat', 'Gratin de légumes',
    'accompagnement', 'Pain complet',
    'dessert', 'Yaourt nature'
  ),
  TRUE,
  FALSE,
  1,
  1
),
(
  7,
  'Restaurant fermé le dimanche',
  NULL,
  NULL,
  TRUE,
  TRUE,
  1,
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
  created_by_admin_id,
  updated_by_admin_id
) VALUES
(
  '2026-01-28',
  3,
  'Menu exceptionnel du 28 janvier',
  JSON_OBJECT(
    'entree', 'Salade spéciale',
    'plat', 'Tajine viande pruneaux',
    'accompagnement', 'Semoule royale',
    'dessert', 'Pâtisserie marocaine'
  ),
  JSON_OBJECT(
    'entree', 'Harira spéciale',
    'plat', 'Poisson au four',
    'accompagnement', 'Légumes sautés',
    'dessert', 'Crème dessert'
  ),
  TRUE,
  FALSE,
  'Journée spéciale campus',
  1,
  1
),
(
  '2026-01-30',
  5,
  'Fermeture exceptionnelle',
  NULL,
  NULL,
  TRUE,
  TRUE,
  'Maintenance exceptionnelle',
  1,
  1
);