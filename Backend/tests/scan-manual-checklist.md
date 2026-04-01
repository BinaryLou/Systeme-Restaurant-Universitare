# Scan QR — Manual Checklist (Postman)

## Objectif

Vérifier le bon fonctionnement des endpoints liés au scan QR pour le personnel RU.

Cette checklist couvre :
- accès sécurisé via PIN
- validation du QR code
- règles métier (réservation, service, statut)
- protection anti double scan
- gestion des erreurs

---

## 1) Accès interface scan (PIN valide)

### Requête
POST /api/scan/access

### Headers
Content-Type: application/json

### Body
{
  "pin": "1234"
}

### Résultat attendu
- Status: 200
- Message: "Accès au scan autorisé"

---

## 2) Accès sans PIN

### Requête
POST /api/scan/access

### Body
{}

### Résultat attendu
- Status: 401 ou 400
- Message d’erreur

---

## 3) Accès avec PIN incorrect

### Requête
POST /api/scan/access

### Body
{
  "pin": "0000"
}

### Résultat attendu
- Status: 401
- Message: PIN invalide

---

## 4) Scan QR valide

### Préconditions
- utilisateur existe
- réservation aujourd’hui
- bon service
- statut = RESERVEE

### Requête
POST /api/scan

### Body
{
  "qr_code": "VALID_QR"
}

### Résultat attendu
- Status: 200
- Message: Scan effectué avec succès
- statut passe à UTILISEE

---

## 5) QR invalide

### Requête
POST /api/scan

### Body
{
  "qr_code": "INVALID_QR"
}

### Résultat attendu
- Status: 404 ou 400
- Message: utilisateur introuvable

---

## 6) Pas de réservation aujourd’hui

### Préconditions
- utilisateur existe
- aucune réservation pour aujourd’hui

### Résultat attendu
- Status: 400
- Message: aucune réservation

---

## 7) Mauvais service (ex: dîner au lieu de déjeuner)

### Résultat attendu
- Status: 400
- Message: service incorrect

---

## 8) Ticket déjà utilisé (anti double scan)

### Étapes
1. scanner une première fois (succès)
2. scanner une deuxième fois

### Résultat attendu
- Status: 400 ou 409
- Message: ticket déjà utilisé

---

## 9) Double scan rapide (concurrence)

### Étapes
- lancer 2 requêtes en même temps

### Résultat attendu
- une seule réussite
- l’autre refusée

---

## 10) Scan sans QR

### Body
{}

### Résultat attendu
- Status: 400
- Message: qr_code obligatoire

---

## 11) Scan avec mauvais format

### Body
{
  "qr_code": 123
}

### Résultat attendu
- Status: 400
- Message: format invalide

---

## 12) Scan sans PIN (si middleware appliqué)

### Résultat attendu
- Status: 401
- accès refusé

---

## Vérifications en base de données

Après scan valide :
- statut = UTILISEE
- date_validation ≠ NULL

---

## Checklist finale

- [ ] accès scan sécurisé
- [ ] scan valide fonctionne
- [ ] erreurs bien gérées
- [ ] anti double scan OK
- [ ] règles métier respectées
- [ ] réponses API correctes

---

## Conclusion

Le scan QR est considéré fonctionnel si :
- validation correcte
- aucune fraude possible
- aucune incohérence en base