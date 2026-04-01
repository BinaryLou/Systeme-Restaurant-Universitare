# S5-08 — Password & Security Manual Checklist

## Objectif
Valider le bon fonctionnement des fonctionnalités :
- forgot password
- reset password
- change password
- sécurité des tokens

---

# 1. Forgot Password

## Cas 1 — Email existant
POST /api/auth/forgot-password

Body:
{
  "email": "email_valide@example.com"
}

✔️ Attendu:
- status: success
- dev_reset_token retourné (en dev)
- expires_at présent

---

## Cas 2 — Email inexistant
POST /api/auth/forgot-password

Body:
{
  "email": "fake@example.com"
}

✔️ Attendu:
- status: success
- même message (pas de fuite d’information)
- dev_reset_token = null

---

# 2. Reset Password

## Cas 3 — Reset valide
POST /api/auth/reset-password

Body:
{
  "token": "TOKEN_VALIDE",
  "new_password": "Password123!",
  "confirm_password": "Password123!"
}

✔️ Attendu:
- 200 OK
- mot de passe mis à jour
- token marqué comme utilisé

---

## Cas 4 — Token invalide
{
  "token": "fake-token",
  "new_password": "Password123!",
  "confirm_password": "Password123!"
}

✔️ Attendu:
- 400
- message: token invalide

---

##  Cas 5 — Token expiré
✔️ Étapes:
- générer token
- attendre expiration
- tester reset

✔️ Attendu:
- 400
- token refusé

---

## Cas 6 — Token déjà utilisé
✔️ Étapes:
- reset réussi
- rejouer même token

✔️ Attendu:
- 400

---

## Cas 7 — Confirmation différente
{
  "token": "TOKEN",
  "new_password": "Password123!",
  "confirm_password": "Password999!"
}

✔️ Attendu:
- 400

---

## Cas 8 — Mot de passe faible
{
  "token": "TOKEN",
  "new_password": "123",
  "confirm_password": "123"
}

✔️ Attendu:
- 400

---

# 🔄 3. Change Password

## Cas 9 — Change valide
PATCH /api/auth/change-password

Headers:
Authorization: Bearer <accessToken>

Body:
{
  "old_password": "AncienPassword",
  "new_password": "NewPassword123!",
  "confirm_password": "NewPassword123!"
}

✔️ Attendu:
- 200 OK
- mot de passe changé

---

## Cas 10 — Ancien mot de passe incorrect
✔️ Attendu:
- 400

---

## Cas 11 — Non authentifié
✔️ Attendu:
- 401

---

# 4. Sécurité des Tokens

## Cas 12 — Invalidation après reset password
✔️ Étapes:
- login → récupérer refreshToken
- reset password
- utiliser ancien refreshToken

✔️ Attendu:
- refus

---

## Cas 13 — Invalidation après change password
✔️ Étapes:
- login
- change password
- utiliser ancien refreshToken

✔️ Attendu:
- refus

---

## Cas 14 — Nouveau token fonctionne
✔️ Étapes:
- login après reset
✔️ Attendu:
- succès

---

# 🧹 5. Nettoyage des tokens expirés

## Cas 15 — Nettoyage DB
✔️ Étapes:
- créer tokens expirés
- lancer cleanup

✔️ Attendu:
- tokens supprimés

---

# Résultat attendu

✔️ Tous les cas passent  
✔️ Aucun bug critique  
✔️ Sécurité respectée  

---

# Definition of Done

- Tous les tests exécutés
- Résultats documentés
- Aucun bug bloquant
- PR prête à être mergée