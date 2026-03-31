# Scan QR — Manual Checklist (Postman)

## Objectif

Vérifier manuellement le bon fonctionnement des endpoints liés au scan QR pour le personnel RU.

Cette checklist couvre :
- l’accès sécurisé à l’interface de scan via PIN
- le scan d’un QR code étudiant
- la validation métier du ticket
- la protection anti double scan
- les cas d’erreur et de sécurité

## Références métier

Règles à respecter :
- le personnel accède à l’interface via PIN ou lien sécurisé
- le personnel ne possède pas de compte applicatif
- le système doit vérifier :
  - l’existence d’une réservation pour la date du jour
  - la correspondance avec le service et l’heure actuelle
  - le statut du ticket (non utilisé)
- si le scan est valide, le ticket doit être marqué comme `UTILISEE`
- un ticket utilisé ne peut plus être réutilisé

## Prérequis

Avant de commencer, vérifier que :

- le backend tourne localement
- la base MySQL est démarrée
- les tables sont migrées / seedées
- au moins un étudiant existe avec :
  - un `code_qr` valide
  - une réservation `RESERVEE` pour aujourd’hui
- les services déjeuner / dîner existent avec des horaires cohérents
- la variable d’environnement `SCAN_PIN` est définie

## Variables Postman recommandées

Créer une collection Postman avec les variables suivantes :

- `base_url` = `http://localhost:3000`
- `scan_pin` = valeur du PIN local
- `valid_qr` = QR d’un étudiant ayant une réservation valide aujourd’hui
- `used_qr` = QR déjà consommé
- `invalid_qr` = valeur inexistante, par ex. `qr_not_found_123`
- `wrong_pin` = `0000`

## Endpoints testés

### 1. Vérification accès scan
`POST /api/scan/access`

### 2. Scan QR
`POST /api/scan`

---

# 1) Test accès scan avec PIN valide

## Requête
**Method:** `POST`  
**URL:** `{{base_url}}/api/scan/access`

### Body JSON
```json
{
  "pin": "{{scan_pin}}"
}