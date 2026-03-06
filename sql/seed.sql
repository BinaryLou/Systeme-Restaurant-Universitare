INSERT INTO utilisateurs (apogee, nom, email, mot_de_passe_hash, code_qr)
VALUES
('10001','Test1','test1@mail.com','hash1','QR10001'),
('10002','Test2','test2@mail.com','hash2','QR10002'),
('10003','Test3','test3@mail.com','hash3','QR10003');

INSERT INTO services (type_repas, heure_debut, heure_fin)
VALUES
('dejeuner','12:00:00','14:00:00'),
('diner','19:00:00','21:00:00');

INSERT INTO administrateurs (email, mot_de_passe_hash)
VALUES ('admin@ru.ma','adminhash');