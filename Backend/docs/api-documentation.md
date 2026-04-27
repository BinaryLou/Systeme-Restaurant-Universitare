# API Documentation — Système Restaurant Universitaire
> Branch : `docs/s9-01-api-documentation-handoff`  
> Base URL : `http://localhost:5000/api`  

---

## Conventions globales

### Format de réponse succès
```json
{
  "status": "success",
  "message": "Message descriptif",
  "data": {}
}
```

### Format de réponse erreur
```json
{
  "status": "error",
  "message": "Message d'erreur clair"
}
```

### Authentification
- **Token Bearer** : `Authorization: Bearer <accessToken>` dans le header HTTP
- **Refresh token** : Cookie `httpOnly` nommé `refreshToken` (géré automatiquement par le navigateur)
- **PIN scan** : Header `x-scan-pin` ou champ `pin` dans le body

---

## Codes HTTP utilisés

| Code | Signification |
|------|---------------|
| 200 | Succès |
| 201 | Ressource créée |
| 400 | Erreur de validation / règle métier |
| 401 | Non authentifié |
| 403 | Non autorisé (mauvais rôle) |
| 404 | Ressource introuvable |
| 409 | Conflit (doublon) |
| 500 | Erreur serveur interne |

---

# MODULE AUTH

## POST /api/auth/user/login
**Rôle requis** : aucun — public  
**Description** : Connexion étudiant

### Body
```json
{
  "apogee": "A1234",
  "password": "MonMotDePasse123!"
}
```

### Réponse succès 200
```json
{
  "status": "success",
  "message": "Connexion étudiant réussie",
  "data": {
    "user": {
      "id": 1,
      "apogee": "A1234",
      "nom": "Loukrati",
      "prenom": "Abderrahmane",
      "email": "loukrati@ensa.ma",
      "solde": 600.00,
      "code_qr": "uuid-string",
      "role": "USER"
    },
    "accessToken": "<jwt_access_token>"
  }
}
```
> Cookie `refreshToken` posé automatiquement (httpOnly, sameSite strict, 7 jours)

### Réponses erreur
| Code | Message |
|------|---------|
| 400 | Code Apogée et mot de passe sont obligatoires |
| 401 | Identifiants invalides |
| 429 | Trop de tentatives, veuillez réessayer plus tard |

---

## POST /api/auth/admin/login
**Rôle requis** : aucun — public  
**Description** : Connexion administrateur

### Body
```json
{
  "email": "admin@ensa.ma",
  "password": "MonMotDePasse123!"
}
```

### Réponse succès 200
```json
{
  "status": "success",
  "message": "Connexion administrateur réussie",
  "data": {
    "admin": {
      "id": 1,
      "email": "admin@ensa.ma",
      "nom": "Admin",
      "prenomnom": "RU",
      "role": "ADMIN"
    },
    "accessToken": "<jwt_access_token>"
  }
}
```
> Cookie `refreshToken` posé automatiquement

### Réponses erreur
| Code | Message |
|------|---------|
| 400 | Email et mot de passe sont requis |
| 401 | Identifiants invalides |
| 429 | Trop de tentatives, veuillez réessayer plus tard |

---

## POST /api/auth/refresh
**Rôle requis** : aucun  
**Description** : Renouveler l'access token via le refresh token (cookie)

### Body
Aucun. Le cookie `refreshToken` est lu automatiquement.

### Réponse succès 200
```json
{
  "status": "success",
  "message": "Nouveau access token généré",
  "data": {
    "accessToken": "<nouveau_jwt_access_token>"
  }
}
```
> Un nouveau cookie `refreshToken` est également posé (rotation)

### Réponses erreur
| Code | Message |
|------|---------|
| 401 | Refresh token manquant |
| 401 | Refresh token invalide ou expiré |
| 401 | Refresh token invalide ou introuvable |

---

## POST /api/auth/logout
**Rôle requis** : aucun  
**Description** : Déconnexion — révoque le refresh token

### Body
Aucun. Lit le cookie `refreshToken`.

### Réponse succès 200
```json
{
  "status": "success",
  "message": "Déconnexion réussie",
  "data": {}
}
```
> Cookie `refreshToken` supprimé. Retourne 200 même sans cookie présent.

---

## POST /api/auth/forgot-password
**Rôle requis** : aucun — public  
**Description** : Demande de réinitialisation de mot de passe

### Body
```json
{
  "email": "loukrati@ensa.ma"
}
```

### Réponse succès 200
```json
{
  "status": "success",
  "message": "Si un compte existe avec cet email, un lien de réinitialisation a été généré",
  "data": {
    "dev_reset_token": "abc123...",
    "expires_at": "2026-04-27T10:15:00.000Z"
  }
}
```
> ⚠️ En production, `data` est vide (pas de fuite d'information).  
> En développement, `dev_reset_token` contient le token en clair pour les tests.

### Réponses erreur
| Code | Message |
|------|---------|
| 400 | L'email est obligatoire |
| 400 | Format d'email invalide |

---

## POST /api/auth/reset-password
**Rôle requis** : aucun — public  
**Description** : Réinitialiser le mot de passe avec le token reçu

### Body
```json
{
  "token": "abc123...",
  "new_password": "NouveauPass123!",
  "confirm_password": "NouveauPass123!"
}
```

### Réponse succès 200
```json
{
  "status": "success",
  "message": "Mot de passe réinitialisé avec succès",
  "data": {
    "user": {
      "id": 1,
      "apogee": "A1234",
      "nom": "Loukrati",
      "prenom": "Abderrahmane",
      "email": "loukrati@ensa.ma"
    }
  }
}
```
> Tous les refresh tokens de l'utilisateur sont révoqués après reset.

### Réponses erreur
| Code | Message |
|------|---------|
| 400 | Le token est obligatoire |
| 400 | Le token est invalide, expiré ou déjà utilisé |
| 400 | Le mot de passe doit contenir au moins 8 caractères |
| 400 | Le mot de passe doit contenir majuscule, minuscule, chiffre et caractère spécial |
| 400 | La confirmation du mot de passe ne correspond pas |

---

## PATCH /api/auth/change-password
**Rôle requis** : USER (token Bearer requis)  
**Description** : Modifier le mot de passe de l'étudiant connecté

### Headers
```
Authorization: Bearer <accessToken>
```

### Body
```json
{
  "old_password": "AncienPass123!",
  "new_password": "NouveauPass456!",
  "confirm_password": "NouveauPass456!"
}
```

### Réponse succès 200
```json
{
  "status": "success",
  "message": "Mot de passe modifié avec succès",
  "data": {}
}
```
> Tous les refresh tokens de l'utilisateur sont révoqués.

### Réponses erreur
| Code | Message |
|------|---------|
| 400 | L'ancien mot de passe est obligatoire |
| 400 | Le mot de passe doit contenir au moins 8 caractères |
| 400 | Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial |
| 400 | La confirmation du mot de passe est obligatoire |
| 400 | La confirmation du nouveau mot de passe est invalide |
| 400 | Le nouveau mot de passe doit être différent de l'ancien |
| 400 | Ancien mot de passe incorrect |
| 401 | Missing Token |
| 404 | Utilisateur introuvable |

---

# MODULE SERVICES

> Tous les endpoints services sont réservés à l'**ADMIN**.

## GET /api/services
**Rôle requis** : ADMIN  
**Description** : Lister tous les services repas

### Headers
```
Authorization: Bearer <ADMIN_TOKEN>
```

### Réponse succès 200
```json
{
  "status": "success",
  "message": "Services récupérés avec succès",
  "data": [
    {
      "id_service": 1,
      "type_repas": "DEJEUNER",
      "heure_debut": "11:00",
      "heure_fin": "14:30",
      "created_at": "2026-01-01T00:00:00.000Z",
      "updated_at": "2026-01-01T00:00:00.000Z"
    },
    {
      "id_service": 2,
      "type_repas": "DINER",
      "heure_debut": "17:00",
      "heure_fin": "20:00",
      "created_at": "2026-01-01T00:00:00.000Z",
      "updated_at": "2026-01-01T00:00:00.000Z"
    }
  ]
}
```

### Réponses erreur
| Code | Message |
|------|---------|
| 401 | Missing Token |
| 403 | Forbidden |

---

## POST /api/services
**Rôle requis** : ADMIN  
**Description** : Créer un nouveau service repas

### Headers
```
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json
```

### Body
```json
{
  "type_repas": "DEJEUNER",
  "heure_debut": "11:00",
  "heure_fin": "14:30"
}
```

**Règles de validation :**
- `type_repas` : `DEJEUNER` ou `DINER` uniquement
- `heure_debut` / `heure_fin` : format `HH:MM` strict (ex: `11:00`)
- `heure_debut` doit être strictement inférieure à `heure_fin`

### Réponse succès 201
```json
{
  "status": "success",
  "message": "Service créé avec succès",
  "data": {
    "id_service": 3,
    "type_repas": "DEJEUNER",
    "heure_debut": "11:00",
    "heure_fin": "14:30",
    "created_at": "...",
    "updated_at": "..."
  }
}
```

### Réponses erreur
| Code | Message |
|------|---------|
| 400 | type_repas is required |
| 400 | type_repas must be DEJEUNER or DINER |
| 400 | heure_debut must use HH:MM format |
| 400 | heure_debut must be earlier than heure_fin |

---

## PUT /api/services/:id
**Rôle requis** : ADMIN  
**Description** : Modifier un service existant

### Params
- `id` : identifiant du service (entier positif)

### Body
```json
{
  "type_repas": "DEJEUNER",
  "heure_debut": "11:30",
  "heure_fin": "14:00"
}
```

### Réponse succès 200
```json
{
  "status": "success",
  "message": "Service mis à jour avec succès",
  "data": { "id_service": 1, "type_repas": "DEJEUNER", "heure_debut": "11:30", "heure_fin": "14:00" }
}
```

### Réponses erreur
| Code | Message |
|------|---------|
| 400 | Erreurs de validation (mêmes que POST) |
| 404 | Service introuvable |

---

## DELETE /api/services/:id
**Rôle requis** : ADMIN  
**Description** : Supprimer un service

### Params
- `id` : identifiant du service

### Réponse succès 200
```json
{
  "status": "success",
  "message": "Service supprimé avec succès",
  "data": null
}
```

### Réponses erreur
| Code | Message |
|------|---------|
| 404 | Service introuvable |
| 409 | Suppression impossible : ce service est déjà lié à un ou plusieurs menus |

---

# MODULE RÉSERVATIONS

> Tous les endpoints réservations sont réservés au rôle **USER**.

## GET /api/reservations
**Rôle requis** : USER  
**Description** : Historique des réservations de l'étudiant connecté

### Headers
```
Authorization: Bearer <USER_TOKEN>
```

### Réponse succès 200
```json
{
  "status": "success",
  "message": "Historique des réservations récupéré avec succès.",
  "data": {
    "items": [
      {
        "id_reservation": 1,
        "date_creation": "2026-04-27T08:00:00.000Z",
        "date_repas": "2026-04-27",
        "statut": "RESERVEE",
        "date_validation": null,
        "id_service": 1,
        "type_repas": "DEJEUNER",
        "heure_debut": "11:00",
        "heure_fin": "14:30"
      }
    ],
    "count": 1,
    "timezone": "Africa/Casablanca"
  }
}
```

**Valeurs possibles de `statut`** : `RESERVEE`, `VALIDEE`, `ANNULEE`

---

## POST /api/reservations
**Rôle requis** : USER  
**Description** : Créer une réservation

### Body
```json
{
  "date_repas": "2026-04-28",
  "id_service": 1
}
```

**Règles métier :**
- `date_repas` : format `YYYY-MM-DD`, entre aujourd'hui et J+30
- `id_service` : entier positif, service doit exister
- Pas de doublon pour le même étudiant / même service / même date
- Solde suffisant requis (prix par défaut : `DEFAULT_MEAL_PRICE` en env)
- Réservation du jour fermée 12h avant le début du service

### Réponse succès 201
```json
{
  "status": "success",
  "message": "Réservation créée avec succès.",
  "data": {
    "reservation": {
      "id_reservation": 5,
      "date_repas": "2026-04-28",
      "statut": "RESERVEE",
      "id_service": 1,
      "id_utilisateur": 1
    },
    "mealPrice": 2,
    "remainingBalance": 598,
    "timezone": "Africa/Casablanca",
    "service": {
      "id_service": 1,
      "type_repas": "DEJEUNER",
      "heure_debut": "11:00",
      "heure_fin": "14:30"
    }
  }
}
```

### Réponses erreur
| Code | Message |
|------|---------|
| 400 | date_repas est obligatoire |
| 400 | date_repas doit être au format YYYY-MM-DD |
| 400 | date_repas ne peut pas être dans le passé |
| 400 | date_repas doit être comprise entre aujourd'hui et J+30 |
| 400 | Les réservations du jour sont fermées 12 heures avant le début du service |
| 400 | Solde insuffisant pour effectuer la réservation |
| 404 | Service introuvable |
| 409 | Une réservation existe déjà pour cette date et ce service |

---

## PATCH /api/reservations/:id/cancel
**Rôle requis** : USER  
**Description** : Annuler une réservation

### Params
- `id` : identifiant de la réservation

### Règles métier
- L'annulation est possible jusqu'à **4h avant le début du service**
- Ne peut pas annuler une réservation déjà `VALIDEE` ou `ANNULEE`
- L'étudiant ne peut annuler que ses propres réservations

### Réponse succès 200
```json
{
  "status": "success",
  "message": "Réservation annulée avec succès.",
  "data": {
    "reservation": {
      "id_reservation": 5,
      "date_repas": "2026-04-28",
      "id_service": 1,
      "type_repas": "DEJEUNER",
      "heure_debut": "11:00",
      "heure_fin": "14:30",
      "statut": "ANNULEE"
    },
    "refunded": false,
    "timezone": "Africa/Casablanca"
  }
}
```

### Réponses erreur
| Code | Message |
|------|---------|
| 400 | L'annulation est autorisée jusqu'à 4 heures avant le début du service |
| 400 | Impossible d'annuler une réservation déjà utilisée |
| 400 | Cette réservation est déjà annulée |
| 404 | Réservation introuvable |

---

# MODULE SCAN

> Routes protégées par **PIN** (pas de JWT). Destinées au personnel du restaurant.

**Mécanisme d'authentification :**  
Header `x-scan-pin: <PIN>` **ou** champ `pin` dans le body.  
Le PIN est défini dans la variable d'environnement `SCAN_PIN`.

---

## POST /api/scan/access
**Rôle requis** : PIN valide  
**Description** : Vérifier que le PIN est correct avant d'afficher l'interface de scan

### Headers
```
x-scan-pin: 1234
Content-Type: application/json
```

### Réponse succès 200
```json
{
  "status": "success",
  "message": "Accès au scan autorisé",
  "data": {}
}
```

### Réponses erreur
| Code | Message |
|------|---------|
| 403 | PIN manquant |
| 403 | PIN invalide |

---

## POST /api/scan
**Rôle requis** : PIN valide  
**Description** : Scanner un QR code étudiant et valider la réservation

### Headers
```
x-scan-pin: 1234
Content-Type: application/json
```

### Body
```json
{
  "qr_code": "uuid-du-qr-etudiant"
}
```

**Logique métier :**
1. Recherche de l'utilisateur par QR code
2. Détermination du service actif par l'heure courante
3. Recherche d'une réservation `RESERVEE` pour aujourd'hui / ce service
4. Passage du statut à `VALIDEE`

### Réponse succès 200
```json
{
  "status": "success",
  "message": "Scan effectué avec succès",
  "data": {
    "user": {
      "id_utilisateur": 1,
      "apogee": "A1234",
      "nom": "Loukrati",
      "prenom": "Abderrahmane",
      "email": "loukrati@ensa.ma"
    },
    "service": {
      "id_service": 1,
      "type_repas": "DEJEUNER",
      "heure_debut": "11:00",
      "heure_fin": "14:30"
    },
    "reservation": {
      "id_reservation": 5,
      "date_repas": "2026-04-27",
      "statut_avant_validation": "RESERVEE",
      "statut": "VALIDEE",
      "date_validation": "2026-04-27T11:30:00.000Z"
    },
    "scan_context": {
      "scanned_at_date": "2026-04-27",
      "scanned_at_time": "11:30:00",
      "timezone": "Africa/Casablanca"
    }
  }
}
```

### Réponses erreur
| Code | Message |
|------|---------|
| 400 | Le champ qr_code est obligatoire |
| 400 | Aucun service actif pour le moment |
| 400 | Cette réservation est annulée |
| 400 | Statut de réservation invalide pour le scan |
| 404 | QR code invalide |
| 404 | Aucune réservation valide trouvée pour aujourd'hui |
| 409 | Ticket déjà utilisé |

---

# MODULE USERS

## GET /api/users/me/qr
**Rôle requis** : USER (token Bearer)  
**Description** : Récupérer le QR code de l'étudiant connecté

### Headers
```
Authorization: Bearer <USER_TOKEN>
```

### Réponse succès 200
```json
{
  "status": "success",
  "message": "QR récupéré avec succès",
  "data": {
    "user": {
      "id": 1,
      "apogee": "A1234",
      "nom": "Loukrati",
      "prenom": "Abderrahmane",
      "email": "loukrati@ensa.ma"
    },
    "qr_code_value": "uuid-string",
    "qr_code_image": "data:image/png;base64,..."
  }
}
```
> `qr_code_image` est une image PNG en base64, affichable directement avec `<img src="data:image/png;base64,...">`.

### Réponses erreur
| Code | Message |
|------|---------|
| 401 | Missing Token |
| 404 | Utilisateur introuvable |
| 404 | Aucun QR code associé à cet utilisateur |

---

# MODULE MENUS — ADMIN

> Tous les endpoints ci-dessous nécessitent `Authorization: Bearer <ADMIN_TOKEN>`.  
> Préfixe commun : `/api/admin`

---

## GET /api/admin/weekly-menus
**Description** : Lister tous les menus hebdomadaires (lundi→dimanche)

### Réponse succès 200
```json
{
  "status": "success",
  "message": "Menus hebdomadaires récupérés avec succès",
  "data": [
    {
      "id_weekly_menu": 1,
      "day_of_week": 1,
      "label": "Menu standard du lundi",
      "lunch_content": { "entree": "Salade verte", "plat": "Poulet rôti" },
      "dinner_content": { "entree": "Soupe", "plat": "Poisson grillé" },
      "is_published": true,
      "is_closed": false,
      "created_by_admin_id": 1,
      "updated_by_admin_id": 1,
      "created_at": "...",
      "updated_at": "..."
    }
  ]
}
```
> `day_of_week` : 1 = Lundi, 7 = Dimanche

---

## GET /api/admin/weekly-menus/:dayOfWeek
**Description** : Récupérer le menu d'un jour précis

### Params
- `dayOfWeek` : entier entre 1 et 7

### Réponse succès 200
```json
{
  "status": "success",
  "message": "Menu hebdomadaire récupéré avec succès",
  "data": { "id_weekly_menu": 1, "day_of_week": 1, "..." : "..." }
}
```

### Réponses erreur
| Code | Message |
|------|---------|
| 400 | dayOfWeek doit être un entier entre 1 et 7 |
| 404 | Menu hebdomadaire introuvable |

---

## PUT /api/admin/weekly-menus/:dayOfWeek
**Description** : Créer ou mettre à jour le menu d'un jour (upsert)

### Params
- `dayOfWeek` : entier entre 1 et 7

### Body
```json
{
  "label": "Menu Lundi",
  "lunch_content": { "entree": "Salade", "plat": "Tajine" },
  "dinner_content": { "entree": "Soupe", "plat": "Poisson" },
  "is_published": true,
  "is_closed": false
}
```

**Règles de validation :**
- `label` : chaîne non vide, obligatoire
- `is_published` et `is_closed` : booléens stricts
- Si `is_closed = true` → `lunch_content` et `dinner_content` doivent être `null`
- Si `is_closed = false` → au moins l'un des deux contenus doit être présent

**Exemple menu fermé (dimanche) :**
```json
{
  "label": "Dimanche fermé",
  "lunch_content": null,
  "dinner_content": null,
  "is_published": true,
  "is_closed": true
}
```

### Réponse succès 200
```json
{
  "status": "success",
  "message": "Menu hebdomadaire enregistré avec succès",
  "data": { "..." : "..." }
}
```

### Réponses erreur
| Code | Message |
|------|---------|
| 400 | Le champ label est obligatoire |
| 400 | is_published doit être un booléen |
| 400 | is_closed doit être un booléen |
| 400 | Si is_closed est false, il faut au moins lunch_content ou dinner_content… |

---

## PATCH /api/admin/weekly-menus/:dayOfWeek/publish
**Description** : Publier ou dépublier un menu hebdomadaire

### Body
```json
{
  "is_published": true
}
```

### Réponse succès 200
```json
{
  "status": "success",
  "message": "Statut de publication mis à jour avec succès",
  "data": { "..." : "..." }
}
```

---

## POST /api/admin/menu-exceptions
**Description** : Créer une exception de menu pour une date spécifique

### Body
```json
{
  "menu_date": "2026-05-01",
  "weekly_menu_id": 1,
  "label": "Fête du travail",
  "lunch_content": { "plat": "Couscous spécial" },
  "dinner_content": null,
  "is_published": true,
  "is_closed": false,
  "reason": "Journée fériée"
}
```

**Notes :**
- `menu_date` : format `YYYY-MM-DD`, unique (une seule exception par date)
- `weekly_menu_id` : optionnel, référence au menu hebdomadaire d'origine
- `reason` : optionnel, max 255 caractères
- Mêmes règles `is_closed` / contenu que weekly-menus

### Réponse succès 201
```json
{
  "status": "success",
  "message": "Exception de menu créée avec succès",
  "data": { "id_menu_exception": 5, "menu_date": "2026-05-01", "..." : "..." }
}
```

### Réponses erreur
| Code | Message |
|------|---------|
| 400 | menu_date doit être une date valide au format YYYY-MM-DD |
| 400 | weekly_menu_id doit être un entier positif |
| 400 | Règles is_closed / contenu |
| 409 | Doublon (unique constraint sur menu_date) |

---

## PATCH /api/admin/menu-exceptions/:id
**Description** : Modifier partiellement une exception de menu

### Params
- `id` : identifiant de l'exception (entier positif)

### Body (tous les champs sont optionnels)
```json
{
  "label": "Nouveau label",
  "reason": "Changement de fournisseur",
  "is_published": false
}
```

### Réponse succès 200
```json
{
  "status": "success",
  "message": "Exception de menu mise à jour avec succès",
  "data": { "..." : "..." }
}
```

### Réponses erreur
| Code | Message |
|------|---------|
| 400 | id doit être un entier positif |
| 404 | Exception de menu introuvable |

---

## DELETE /api/admin/menu-exceptions/:id
**Description** : Supprimer une exception de menu

### Params
- `id` : identifiant de l'exception

### Réponse succès 200
```json
{
  "status": "success",
  "message": "Exception de menu supprimée avec succès",
  "data": {}
}
```

### Réponses erreur
| Code | Message |
|------|---------|
| 400 | id doit être un entier positif |
| 404 | Exception de menu introuvable |

---

## GET /api/admin/menus/calendar
**Description** : Calendrier mensuel des menus (vue admin)

### Query params
| Param | Type | Obligatoire | Description |
|-------|------|-------------|-------------|
| `year` | integer | ✅ | Année (2000–2100) |
| `month` | integer | ✅ | Mois (1–12) |

### Exemple
```
GET /api/admin/menus/calendar?year=2026&month=4
```

### Réponse succès 200
```json
{
  "status": "success",
  "message": "Calendrier des menus récupéré avec succès",
  "data": {
    "year": 2026,
    "month": 4,
    "days": [
      {
        "date": "2026-04-01",
        "type": "standard",
        "is_closed": false,
        "has_menu": true,
        "source_id": 2,
        "label": "Menu standard du mardi"
      },
      {
        "date": "2026-04-05",
        "type": "exception",
        "is_closed": false,
        "has_menu": true,
        "source_id": 3,
        "label": "Exception spéciale"
      },
      {
        "date": "2026-04-06",
        "type": "closed",
        "is_closed": true,
        "has_menu": false,
        "source_id": 7,
        "label": "Dimanche fermé"
      }
    ]
  }
}
```

**Valeurs possibles de `type`** : `standard`, `exception`, `closed`, `none`

### Réponses erreur
| Code | Message |
|------|---------|
| 400 | year doit être une année valide |
| 400 | month doit être un entier entre 1 et 12 |

---

# MODULE MENUS — PUBLIC

## GET /api/menus/by-date/:date
**Rôle requis** : aucun — public  
**Description** : Récupérer le menu résolu pour une date donnée (exception si existante, sinon menu hebdomadaire)

### Params
- `date` : date au format `YYYY-MM-DD`

### Réponse succès 200
```json
{
  "status": "success",
  "message": "Menu récupéré avec succès",
  "data": {
    "date": "2026-04-28",
    "source": "standard",
    "label": "Menu standard du lundi",
    "is_closed": false,
    "is_published": true,
    "lunch_content": { "entree": "Salade verte", "plat": "Poulet rôti" },
    "dinner_content": { "entree": "Soupe", "plat": "Poisson grillé" },
    "weekly_menu_id": 1,
    "menu_exception_id": null,
    "reason": null
  }
}
```

**Valeurs possibles de `source`** :
- `standard` : menu hebdomadaire publié
- `exception` : exception publiée pour cette date (priorité sur le standard)
- `none` : aucun menu publié pour cette date

> Si le restaurant est fermé : `is_closed = true`, `lunch_content = null`, `dinner_content = null`

### Réponses erreur
| Code | Message |
|------|---------|
| 400 | Date de menu invalide |

---

# MODULE STATISTIQUES — ADMIN

> Tous les endpoints nécessitent `Authorization: Bearer <ADMIN_TOKEN>`.  
> Préfixe : `/api/admin`

---

## GET /api/admin/dashboard/stats
**Description** : Statistiques globales pour le dashboard

### Réponse succès 200
```json
{
  "status": "success",
  "message": "Statistiques du dashboard récupérées avec succès",
  "data": {
    "cards": {
      "totalReservations": 1250,
      "usedTickets": 980,
      "cancelledTickets": 45,
      "noShowCount": 225,
      "usageRate": 78,
      "cancellationRate": 4,
      "noShowRate": 18,
      "reservationsToday": 35,
      "reservationsThisWeek": 180,
      "reservedTickets": 225
    },
    "charts": {
      "dailyReservations": [
        { "label": "2026-04-21", "value": 28 },
        { "label": "2026-04-22", "value": 35 }
      ],
      "serviceSplit": [
        { "label": "DEJEUNER", "value": 820 },
        { "label": "DINER", "value": 430 }
      ]
    },
    "recentActivity": [
      {
        "id_reservation": 42,
        "date_repas": "2026-04-27",
        "statut": "RESERVEE",
        "type_repas": "DEJEUNER",
        "apogee": "A1234",
        "email": "loukrati@ensa.ma"
      }
    ]
  }
}
```

---

## GET /api/admin/statistics
**Description** : Statistiques détaillées filtrées par période

### Query params

**Pour `period=day` :**
| Param | Type | Obligatoire |
|-------|------|-------------|
| `period` | `"day"` | ✅ |
| `date` | `YYYY-MM-DD` | ✅ |

**Pour `period=week` :**
| Param | Type | Obligatoire |
|-------|------|-------------|
| `period` | `"week"` | ✅ |
| `startDate` | `YYYY-MM-DD` | ✅ |
| `endDate` | `YYYY-MM-DD` | ✅ |

**Pour `period=month` :**
| Param | Type | Obligatoire |
|-------|------|-------------|
| `period` | `"month"` | ✅ |
| `month` | integer (1–12) | ✅ |
| `year` | integer (4 chiffres) | ✅ |

### Exemples
```
GET /api/admin/statistics?period=day&date=2026-04-27
GET /api/admin/statistics?period=week&startDate=2026-04-21&endDate=2026-04-27
GET /api/admin/statistics?period=month&month=4&year=2026
```

### Réponse succès 200
```json
{
  "status": "success",
  "message": "Statistiques détaillées récupérées avec succès",
  "data": {
    "period": "week",
    "filters": { "startDate": "2026-04-21", "endDate": "2026-04-27" },
    "summary": {
      "totalReservations": 180,
      "usedTickets": 140,
      "cancelledTickets": 8,
      "noShowCount": 32,
      "usageRate": 78,
      "cancellationRate": 4,
      "noShowRate": 18,
      "reservedTickets": 32
    },
    "charts": {
      "reservationTrend": [
        { "label": "2026-04-21", "value": 28 },
        { "label": "2026-04-22", "value": 35 }
      ],
      "usageTrend": [
        { "label": "2026-04-21", "value": 22 },
        { "label": "2026-04-22", "value": 30 }
      ]
    }
  }
}
```

### Réponses erreur
| Code | Message |
|------|---------|
| 400 | Le paramètre period est obligatoire |
| 400 | period doit être day, week ou month |
| 400 | Le paramètre date est obligatoire pour period=day |
| 400 | date doit être au format YYYY-MM-DD |
| 400 | startDate doit être inférieure ou égale à endDate |
| 400 | month doit être compris entre 1 et 12 |
| 400 | year doit être une année valide sur 4 chiffres |

---

## GET /api/admin/statistics/export/excel
**Description** : Exporter les statistiques en fichier Excel (.xlsx)

### Query params
Identiques à `GET /api/admin/statistics` (period + filtres associés)

### Réponse succès 200
- Content-Type : `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- Content-Disposition : `attachment; filename="statistics-week-1714224000000.xlsx"`
- Body : buffer binaire Excel

> Le fichier contient 3 feuilles : Résumé, Reservation Trend, Usage Trend.

---

## GET /api/admin/statistics/export/pdf
**Description** : Exporter les statistiques en fichier PDF

### Query params
Identiques à `GET /api/admin/statistics`

### Réponse succès 200
- Content-Type : `application/pdf`
- Content-Disposition : `attachment; filename="statistics-month-1714224000000.pdf"`
- Body : buffer binaire PDF

---

# FRONTEND HANDOFF

## Résumé — Routes par acteur

### Routes publiques / sans access token
| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/api/auth/user/login` | Login étudiant |
| POST | `/api/auth/admin/login` | Login admin |
| POST | `/api/auth/refresh` | Renouveler l'access token via cookie refreshToken |
| POST | `/api/auth/logout` | Déconnexion via cookie refreshToken |
| POST | `/api/auth/forgot-password` | Demande reset mot de passe |
| POST | `/api/auth/reset-password` | Réinitialiser mot de passe |
| GET | `/api/menus/by-date/:date` | Menu public par date |

### Routes étudiant (token USER requis)
| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/users/me/qr` | QR code de l'étudiant |
| GET | `/api/reservations` | Historique des réservations |
| POST | `/api/reservations` | Créer une réservation |
| PATCH | `/api/reservations/:id/cancel` | Annuler une réservation |
| PATCH | `/api/auth/change-password` | Changer son mot de passe |

### Routes admin (token ADMIN requis)
| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/services` | Lister les services |
| POST | `/api/services` | Créer un service |
| PUT | `/api/services/:id` | Modifier un service |
| DELETE | `/api/services/:id` | Supprimer un service |
| GET | `/api/admin/weekly-menus` | Tous les menus hebdo |
| GET | `/api/admin/weekly-menus/:dayOfWeek` | Menu d'un jour |
| PUT | `/api/admin/weekly-menus/:dayOfWeek` | Créer/modifier menu hebdo |
| PATCH | `/api/admin/weekly-menus/:dayOfWeek/publish` | Publier/dépublier |
| POST | `/api/admin/menu-exceptions` | Créer une exception |
| PATCH | `/api/admin/menu-exceptions/:id` | Modifier une exception |
| DELETE | `/api/admin/menu-exceptions/:id` | Supprimer une exception |
| GET | `/api/admin/menus/calendar` | Calendrier mensuel |
| GET | `/api/admin/dashboard/stats` | Stats dashboard |
| GET | `/api/admin/statistics` | Stats détaillées |
| GET | `/api/admin/statistics/export/excel` | Export Excel |
| GET | `/api/admin/statistics/export/pdf` | Export PDF |

### Routes scan (PIN requis — personnel restaurant)
| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/api/scan/access` | Vérifier le PIN |
| POST | `/api/scan` | Scanner un QR code |

---

## Gestion des tokens côté frontend

### Stocker l'access token
```javascript
// Après login réussi
localStorage.setItem('accessToken', data.accessToken);
// ou dans un store (Redux, Zustand, Pinia...)
```

### Envoyer le token dans chaque requête protégée
```javascript
headers: {
  'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
}
```

### Gérer l'expiration (401)
Quand une requête retourne `401` avec un token expiré :
1. Appeler `POST /api/auth/refresh` (le cookie est envoyé automatiquement)
2. Récupérer le nouveau `accessToken`
3. Relancer la requête originale avec le nouveau token

### Déconnexion
```javascript
await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
localStorage.removeItem('accessToken');
```

---

## Ordre conseillé d'intégration frontend

### Phase 1 — Authentification (bloquant pour tout le reste)
1. `POST /api/auth/user/login`
2. `POST /api/auth/admin/login`
3. `POST /api/auth/refresh` (intercepteur Axios/Fetch)
4. `POST /api/auth/logout`

### Phase 2 — Côté étudiant
5. `GET /api/users/me/qr` — afficher le QR code
6. `GET /api/menus/by-date/:date` — voir le menu du jour
7. `POST /api/reservations` — créer une réservation
8. `GET /api/reservations` — voir son historique
9. `PATCH /api/reservations/:id/cancel` — annuler

> ⚠️ Note : le backend actuel n'expose pas de route publique ou USER pour récupérer la liste des services repas.  
> La route `GET /api/services` est réservée à l'ADMIN uniquement.

### Phase 3 — Mot de passe
11. `POST /api/auth/forgot-password`
12. `POST /api/auth/reset-password`
13. `PATCH /api/auth/change-password`

### Phase 4 — Interface admin — Gestion
14. `GET/POST/PUT/DELETE /api/services` — gérer les services
15. `GET/PUT/PATCH /api/admin/weekly-menus` — menus hebdomadaires
16. `POST/PATCH/DELETE /api/admin/menu-exceptions` — exceptions
17. `GET /api/admin/menus/calendar` — vue calendrier

### Phase 5 — Interface admin — Statistiques
18. `GET /api/admin/dashboard/stats` — dashboard
19. `GET /api/admin/statistics` — stats détaillées
20. `GET /api/admin/statistics/export/excel` — export Excel
21. `GET /api/admin/statistics/export/pdf` — export PDF

### Phase 6 — Interface scan (tablette / poste restaurant)
22. `POST /api/scan/access` — vérifier le PIN au démarrage
23. `POST /api/scan` — scanner les QR codes

---

## Notes importantes pour le frontend

- **CORS** : Le backend n'accepte que les requêtes depuis `FRONTEND_URL` (env). En dev : `http://localhost:3000`.
- **Credentials** : Toujours envoyer `credentials: 'include'` (ou `withCredentials: true`) pour que le cookie refreshToken soit transmis.
- **Rate limiting** : Max 10 requêtes / 15 min sur `/api/auth`. Max 300 / 15 min global.
- **Export fichiers** : Les endpoints export retournent un buffer binaire. Utiliser `response.blob()` puis `URL.createObjectURL()` pour déclencher le téléchargement.
- **Menus** : `lunch_content` et `dinner_content` sont des objets JSON libres — le schéma interne peut varier selon ce que l'admin a saisi.
- **QR code** : `qr_code_image` est une data URL base64 complète (`data:image/png;base64,...`) utilisable directement dans un `<img>`.