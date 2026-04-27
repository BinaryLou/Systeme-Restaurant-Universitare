# Auth Flow & Business Rules — RU Ticket

## 🎯 Objectif

Ce document explique au frontend :
- comment utiliser l’authentification
- comment gérer les tokens
- quelles sont les règles métier importantes à respecter

---

# 🔐 1. Auth Flow

## Login étudiant
POST /api/auth/user/login

### Body
{
  "apogee": "A1234",
  "password": "Password123!"
}

### Response
{
  "status": "success",
  "data": {
    "accessToken": "..."
  }
}

---

## Utilisation du token

Authorization: Bearer <accessToken>

---

## Refresh Token

POST /api/auth/refresh

- le cookie `refreshToken` est envoyé automatiquement
- frontend reçoit un nouveau `accessToken`

---

## Logout

POST /api/auth/logout

- supprime le cookie refreshToken

---

# 👥 2. Rôles

- USER : Étudiant
- ADMIN : Administrateur
- SCAN : Personnel (PIN)

---

# ⚠️ 3. Gestion des erreurs

- 401 → token expiré → refresh
- 403 → accès refusé
- 400 → erreur validation
- 409 → conflit (doublon)

---

# 🧠 4. Business Rules

## Réservation
- J → J+30
- H-12 fermeture
- H-4 annulation
- pas de doublon
- solde suffisant

## Menus
- exception > standard
- menu non publié invisible
- is_closed → pas de repas

## Scan
- PIN obligatoire
- ticket du jour
- ticket déjà utilisé refusé
- réservation annulée refusée

---

# ⚡ 5. Bonnes pratiques frontend

## Stockage token
localStorage.setItem("accessToken", token);

## Ajouter token
Authorization: Bearer <token>

## Gestion expiration
if (error.status === 401) {
  refreshToken();
}

---

# ✅ Résultat

- frontend prêt pour auth
- intégration claire avec backend
