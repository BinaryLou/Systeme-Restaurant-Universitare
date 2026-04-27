# Final API Validation Checklist — Sprint 9

## Issue
S9-03 [TEST/DOC] Final API validation and cleanup

## Goal
Valider que l’API backend est stable, propre, sécurisée et prête pour l’intégration frontend.

---

# 1. Cleanup général

- [x] `adminRoutes` supprimé de `app.js`
- [x] `protectedRoutes` supprimé de `app.js`
- [x] `/api/health/db` supprimé
- [x] aucun endpoint `/test` ou `/debug`
- [x] aucun `console.log` inutile
- [x] routes bien organisées
- [x] middleware `errorHandler` actif
- [x] réponse 404 fonctionne

---

# 2. Health check

## GET `/api/health`

- [x] retourne `200`
- [x] retourne le format standard

Expected:
```json
{
  "status": "success",
  "message": "API running"
}
```

---

# 3. Auth API

## POST `/api/auth/user/login`

- [x] login étudiant valide
- [x] retourne `accessToken`
- [x] mauvais identifiants refusés

## POST `/api/auth/admin/login`

- [x] login admin valide
- [x] retourne `admin_access_token`
- [x] mauvais identifiants refusés

## POST `/api/auth/refresh`

- [x] refresh token valide
- [x] retourne nouveau access token
- [x] refuse si refresh token absent

## POST `/api/auth/logout`

- [x] logout réussi
- [x] cookie refreshToken supprimé

## PATCH `/api/auth/change-password`

- [x] refuse sans token
- [x] refuse ancien mot de passe incorrect
- [x] accepte changement valide

---

# 4. Student API

## GET `/api/reservations`

- [x] refuse sans token
- [x] refuse avec token admin
- [x] accepte avec token USER
- [x] retourne uniquement les réservations du user connecté

## POST `/api/reservations`

- [x] refuse sans token
- [x] crée réservation valide
- [x] refuse double réservation
- [x] refuse date invalide
- [x] refuse solde insuffisant
- [x] décrémente le solde si réservation créée

## PATCH `/api/reservations/:id/cancel`

- [x] refuse sans token
- [x] annule réservation valide
- [x] refuse réservation déjà annulée
- [x] refuse réservation déjà validée
- [x] refuse annulation hors délai H-4

## GET `/api/users/me/qr`

- [x] refuse sans token
- [x] accepte avec token USER
- [x] retourne QR code étudiant

---

# 5. Public Menus API

## GET `/api/menus/by-date/:date`

- [x] accepte sans token
- [x] retourne menu publié
- [x] refuse date invalide
- [x] applique exception menu si elle existe
- [x] ne retourne pas menu non publié

---

# 6. Admin Services API

## GET `/api/services`

- [x] refuse sans token
- [x] refuse token USER
- [x] accepte token ADMIN

## POST `/api/services`

- [x] crée service valide
- [x] refuse type_repas invalide
- [x] refuse heure invalide
- [x] refuse sans token USER/ADMIN incorrect

## PUT `/api/services/:id`

- [x] met à jour service existant
- [x] refuse service inexistant
- [x] refuse payload invalide

## DELETE `/api/services/:id`

- [x] supprime service existant
- [x] refuse service inexistant
- [x] refuse suppression si service lié à données importantes

---

# 7. Admin Menus API

## GET `/api/admin/weekly-menus`

- [x] refuse sans token
- [x] refuse token USER
- [x] accepte token ADMIN

## GET `/api/admin/weekly-menus/:dayOfWeek`

- [x] retourne menu du jour
- [x] refuse `dayOfWeek` invalide

## PUT `/api/admin/weekly-menus/:dayOfWeek`

- [x] crée ou met à jour menu hebdomadaire
- [x] refuse payload invalide

## PATCH `/api/admin/weekly-menus/:dayOfWeek/publish`

- [x] publie menu
- [x] dépublie menu

## POST `/api/admin/menu-exceptions`

- [x] crée exception menu valide
- [x] refuse date invalide
- [x] refuse payload invalide

## PATCH `/api/admin/menu-exceptions/:id`

- [x] modifie exception existante
- [x] refuse exception inexistante

## DELETE `/api/admin/menu-exceptions/:id`

- [x] supprime exception existante
- [x] refuse exception inexistante

## GET `/api/admin/menus/calendar`

- [x] retourne calendrier mensuel
- [x] refuse month/year invalides

---

# 8. Admin Statistics API

## GET `/api/admin/dashboard/stats`

- [x] refuse sans token
- [x] refuse token USER
- [x] accepte token ADMIN
- [x] retourne cards + charts + recentActivity

## GET `/api/admin/statistics`

- [x] filtre par jour
- [x] filtre par semaine
- [x] filtre par mois
- [x] refuse filtres invalides

## GET `/api/admin/statistics/export/excel`

- [x] export Excel fonctionne
- [x] refuse filtres invalides

## GET `/api/admin/statistics/export/pdf`

- [x] export PDF fonctionne
- [x] refuse filtres invalides

---

# 9. Scan API

## POST `/api/scan/access`

- [x] refuse PIN absent
- [x] refuse PIN invalide
- [x] accepte PIN valide

## POST `/api/scan`

- [x] refuse PIN absent
- [x] refuse PIN invalide
- [x] refuse QR invalide
- [x] valide ticket réservé
- [x] refuse ticket déjà utilisé
- [x] refuse réservation annulée
- [x] refuse ticket hors service courant

---

# 10. Format standard des réponses

## Success

- [x] toutes les réponses succès contiennent `status`
- [x] toutes les réponses succès contiennent `message`
- [x] les réponses avec données contiennent `data`

## Error

- [x] toutes les erreurs contiennent `status: "error"`
- [x] toutes les erreurs contiennent `message`
- [x] les status codes sont cohérents

---

# 11. Status codes à vérifier

- [x] `200` succès lecture / update / scan
- [x] `201` création
- [x] `400` validation error
- [x] `401` token absent ou invalide
- [x] `403` rôle refusé / PIN invalide
- [x] `404` ressource introuvable
- [x] `409` conflit / doublon
- [x] `429` rate limit auth

---

# 12. Résultat final

- [x] backend stable
- [x] routes test/debug supprimées
- [x] endpoints principaux validés
- [x] auth USER/ADMIN validée
- [x] scan PIN validé
- [x] réponses API cohérentes
- [x] backend prêt pour frontend


