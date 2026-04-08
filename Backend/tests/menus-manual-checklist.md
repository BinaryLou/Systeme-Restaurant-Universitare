# Checklist de test manuel — Menus

## Issue
S7-11 [TEST] Ajouter la checklist de tests manuels du module menus

## Objectif
Valider manuellement le module Menus Admin avant le merge.

Cette checklist couvre les endpoints protégés suivants :

- `GET /api/admin/weekly-menus`
- `GET /api/admin/weekly-menus/:dayOfWeek`
- `PUT /api/admin/weekly-menus/:dayOfWeek`
- `PATCH /api/admin/weekly-menus/:dayOfWeek/publish`
- `POST /api/admin/menu-exceptions`
- `PATCH /api/admin/menu-exceptions/:id`
- `DELETE /api/admin/menu-exceptions/:id`
- `GET /api/admin/menus/calendar`

Endpoint public :
- `GET /api/menus/by-date/:date`

Toutes les routes admin doivent être protégées par :

- `verifyJwt`
- `requireRole("ADMIN")`

---

## Format attendu de la réponse API

### Succès

```json
{
  "status": "success",
  "data": {},
  "message": "Opération réussie"
}
```

### Erreur

```json
{
  "status": "error",
  "message": "Message d'erreur clair"
}
```

---

## Préconditions

Avant de commencer les tests, vérifier que :

- le serveur backend est lancé
- la base de données est lancée
- le schéma est à jour
- la table `weekly_menus` existe
- la table `menu_exceptions` existe
- au moins un compte ADMIN existe
- au moins un utilisateur non admin existe
- un `ADMIN_TOKEN` valide est disponible
- un `USER_TOKEN` valide est disponible
- au moins un menu hebdomadaire existe en base
- les données de seed sont chargées

---

## Règles métier à valider

- seuls les utilisateurs ADMIN peuvent gérer les menus
- `dayOfWeek` doit être compris entre 1 et 7
- `menu_date` doit être une date valide au format `YYYY-MM-DD`
- `is_published` doit être un booléen
- `is_closed` doit être un booléen
- un menu fermé ne doit PAS contenir `lunch_content` ni `dinner_content`
- un menu ouvert doit contenir au moins l’un de `lunch_content` ou `dinner_content`
- une exception de menu remplace le menu hebdomadaire pour la même date
- seuls les menus publiés sont visibles publiquement
- un seul menu hebdomadaire par jour
- une seule exception par date

---

## Données de test

### Menu hebdomadaire valide
```json
{
  "label": "Menu Lundi",
  "lunch_content": { "main": "Tajine" },
  "dinner_content": { "main": "Soupe" },
  "is_published": true,
  "is_closed": false
}
```

### Menu hebdomadaire fermé valide
```json
{
  "label": "Dimanche fermé",
  "lunch_content": null,
  "dinner_content": null,
  "is_published": true,
  "is_closed": true
}
```

### Menu hebdomadaire invalide (fermé avec contenu)
```json
{
  "label": "Erreur fermeture",
  "lunch_content": { "main": "Plat interdit" },
  "dinner_content": null,
  "is_published": true,
  "is_closed": true
}
```

### Exception de menu valide
```json
{
  "menu_date": "2026-04-20",
  "weekly_menu_id": 1,
  "label": "Exception spéciale",
  "lunch_content": { "main": "Tajine viande" },
  "dinner_content": { "main": "Soupe" },
  "is_published": true,
  "is_closed": false,
  "reason": "Événement"
}
```

### Exception de menu invalide (date invalide)
```json
{
  "menu_date": "2026-02-30",
  "weekly_menu_id": 1,
  "label": "Date invalide",
  "lunch_content": { "main": "Plat" },
  "dinner_content": null,
  "is_published": true,
  "is_closed": false
}
```

---

# Cas de test manuels

## 1. GET /api/admin/weekly-menus avec token ADMIN

**Requête**
- Méthode : `GET`
- URL : `/api/admin/weekly-menus`
- Headers :
  - `Authorization: Bearer <ADMIN_TOKEN>`

**Attendu**
- HTTP `200`
- `status = success`
- `message` présent
- `data` est un tableau

**Statut**
- [x] Passed
- [ ] Failed

---

## 2. GET /api/admin/weekly-menus sans token

**Requête**
- Méthode : `GET`
- URL : `/api/admin/weekly-menus`

**Attendu**
- HTTP `401`
- message d’authentification clair

**Statut**
- [x] Passed
- [ ] Failed

---

## 3. GET /api/admin/weekly-menus avec token non admin

**Requête**
- Méthode : `GET`
- URL : `/api/admin/weekly-menus`
- Headers :
  - `Authorization: Bearer <USER_TOKEN>`

**Attendu**
- HTTP `403`
- message d’autorisation clair

**Statut**
- [x] Passed
- [ ] Failed

---

## 4. GET /api/admin/weekly-menus/:dayOfWeek avec jour valide

**Requête**
- Méthode : `GET`
- URL : `/api/admin/weekly-menus/1`
- Headers :
  - `Authorization: Bearer <ADMIN_TOKEN>`

**Attendu**
- HTTP `200`
- `status = success`
- un menu hebdomadaire retourné

**Statut**
- [x] Passed
- [ ] Failed

---

## 5. GET /api/admin/weekly-menus/:dayOfWeek avec jour invalide

**Requête**
- Méthode : `GET`
- URL : `/api/admin/weekly-menus/9`
- Headers :
  - `Authorization: Bearer <ADMIN_TOKEN>`

**Attendu**
- HTTP `400`
- message de validation clair

**Statut**
- [x] Passed
- [ ] Failed

---

## 6. PUT /api/admin/weekly-menus/:dayOfWeek avec payload valide

**Requête**
- Méthode : `PUT`
- URL : `/api/admin/weekly-menus/1`
- Headers :
  - `Authorization: Bearer <ADMIN_TOKEN>`
  - `Content-Type: application/json`
- Body :
```json
{
  "label": "Menu Lundi",
  "lunch_content": { "main": "Tajine" },
  "dinner_content": { "main": "Soupe" },
  "is_published": true,
  "is_closed": false
}
```

**Attendu**
- HTTP `200`
- `status = success`
- message de succès présent
- menu inséré ou mis à jour en base

**Statut**
- [x] Passed
- [ ] Failed

---

## 7. PUT /api/admin/weekly-menus/:dayOfWeek avec jour invalide

**Requête**
- Méthode : `PUT`
- URL : `/api/admin/weekly-menus/0`
- Headers :
  - `Authorization: Bearer <ADMIN_TOKEN>`
  - `Content-Type: application/json`
- Body : menu hebdomadaire valide

**Attendu**
- HTTP `400`
- message de validation clair
- base inchangée

**Statut**
- [x] Passed
- [ ] Failed

---

## 8. PUT /api/admin/weekly-menus/:dayOfWeek avec label manquant

**Requête**
- Méthode : `PUT`
- URL : `/api/admin/weekly-menus/2`
- Headers :
  - `Authorization: Bearer <ADMIN_TOKEN>`
  - `Content-Type: application/json`
- Body :
```json
{
  "lunch_content": { "main": "Couscous" },
  "dinner_content": null,
  "is_published": false,
  "is_closed": false
}
```

**Attendu**
- HTTP `400`
- message de validation clair
- base inchangée

**Statut**
- [x] Passed
- [ ] Failed

---

## 9. PUT /api/admin/weekly-menus/:dayOfWeek avec booléen invalide

**Requête**
- Méthode : `PUT`
- URL : `/api/admin/weekly-menus/2`
- Headers :
  - `Authorization: Bearer <ADMIN_TOKEN>`
  - `Content-Type: application/json`
- Body :
```json
{
  "label": "Menu Mardi",
  "lunch_content": { "main": "Couscous" },
  "dinner_content": null,
  "is_published": "true",
  "is_closed": false
}
```

**Attendu**
- HTTP `400`
- message de validation clair
- base inchangée

**Statut**
- [x] Passed
- [ ] Failed

---

## 10. PUT /api/admin/weekly-menus/:dayOfWeek menu fermé avec contenu

**Requête**
- Méthode : `PUT`
- URL : `/api/admin/weekly-menus/7`
- Headers :
  - `Authorization: Bearer <ADMIN_TOKEN>`
  - `Content-Type: application/json`
- Body :
```json
{
  "label": "Erreur fermeture",
  "lunch_content": { "main": "Plat interdit" },
  "dinner_content": null,
  "is_published": true,
  "is_closed": true
}
```

**Attendu**
- HTTP `400`
- message de validation clair
- base inchangée

**Statut**
- [x] Passed
- [ ] Failed

---

## 11. PUT /api/admin/weekly-menus/:dayOfWeek menu ouvert sans contenu

**Requête**
- Méthode : `PUT`
- URL : `/api/admin/weekly-menus/3`
- Headers :
  - `Authorization: Bearer <ADMIN_TOKEN>`
  - `Content-Type: application/json`
- Body :
```json
{
  "label": "Menu vide",
  "lunch_content": null,
  "dinner_content": null,
  "is_published": false,
  "is_closed": false
}
```

**Attendu**
- HTTP `400`
- message de validation clair
- base inchangée

**Statut**
- [x] Passed
- [ ] Failed

---

## 12. PUT /api/admin/weekly-menus/:dayOfWeek menu fermé valide

**Requête**
- Méthode : `PUT`
- URL : `/api/admin/weekly-menus/7`
- Headers :
  - `Authorization: Bearer <ADMIN_TOKEN>`
  - `Content-Type: application/json`
- Body :
```json
{
  "label": "Dimanche fermé",
  "lunch_content": null,
  "dinner_content": null,
  "is_published": true,
  "is_closed": true
}
```

**Attendu**
- HTTP `200`
- menu fermé bien enregistré

**Statut**
- [x] Passed
- [ ] Failed

---

## 13. PATCH /api/admin/weekly-menus/:dayOfWeek/publish avec payload valide

**Requête**
- Méthode : `PATCH`
- URL : `/api/admin/weekly-menus/1/publish`
- Headers :
  - `Authorization: Bearer <ADMIN_TOKEN>`
  - `Content-Type: application/json`
- Body :
```json
{
  "is_published": true
}
```

**Attendu**
- HTTP `200`
- statut de publication mis à jour

**Statut**
- [x] Passed
- [ ] Failed

---

## 14. PATCH /api/admin/weekly-menus/:dayOfWeek/publish avec payload invalide

**Requête**
- Méthode : `PATCH`
- URL : `/api/admin/weekly-menus/1/publish`
- Headers :
  - `Authorization: Bearer <ADMIN_TOKEN>`
  - `Content-Type: application/json`
- Body :
```json
{
  "is_published": "yes"
}
```

**Attendu**
- HTTP `400`
- message de validation clair

**Statut**
- [x] Passed
- [ ] Failed

---

## 15. POST /api/admin/menu-exceptions avec payload valide

**Requête**
- Méthode : `POST`
- URL : `/api/admin/menu-exceptions`
- Headers :
  - `Authorization: Bearer <ADMIN_TOKEN>`
  - `Content-Type: application/json`
- Body :
```json
{
  "menu_date": "2026-04-20",
  "weekly_menu_id": 1,
  "label": "Exception spéciale",
  "lunch_content": { "main": "Tajine viande" },
  "dinner_content": { "main": "Soupe" },
  "is_published": true,
  "is_closed": false,
  "reason": "Événement"
}
```

**Attendu**
- HTTP `201`
- `status = success`
- exception insérée en base

**Statut**
- [x] Passed
- [ ] Failed

---

## 16. POST /api/admin/menu-exceptions avec date invalide

**Requête**
- Méthode : `POST`
- URL : `/api/admin/menu-exceptions`
- Headers :
  - `Authorization: Bearer <ADMIN_TOKEN>`
  - `Content-Type: application/json`
- Body :
```json
{
  "menu_date": "2026-02-30",
  "weekly_menu_id": 1,
  "label": "Date invalide",
  "lunch_content": { "main": "Plat" },
  "dinner_content": null,
  "is_published": true,
  "is_closed": false
}
```

**Attendu**
- HTTP `400`
- message de validation clair
- base inchangée

**Statut**
- [x] Passed
- [ ] Failed

---

## 17. POST /api/admin/menu-exceptions exception fermée avec contenu

**Requête**
- Méthode : `POST`
- URL : `/api/admin/menu-exceptions`
- Headers :
  - `Authorization: Bearer <ADMIN_TOKEN>`
  - `Content-Type: application/json`
- Body :
```json
{
  "menu_date": "2026-04-25",
  "weekly_menu_id": 1,
  "label": "Fermeture spéciale",
  "lunch_content": { "main": "Plat interdit" },
  "dinner_content": null,
  "is_published": true,
  "is_closed": true,
  "reason": "Maintenance"
}
```

**Attendu**
- HTTP `400`
- message de validation clair
- base inchangée

**Statut**
- [x] Passed
- [ ] Failed

---

## 18. POST /api/admin/menu-exceptions exception ouverte sans contenu

**Requête**
- Méthode : `POST`
- URL : `/api/admin/menu-exceptions`
- Headers :
  - `Authorization: Bearer <ADMIN_TOKEN>`
  - `Content-Type: application/json`
- Body :
```json
{
  "menu_date": "2026-04-26",
  "weekly_menu_id": 1,
  "label": "Exception vide",
  "lunch_content": null,
  "dinner_content": null,
  "is_published": false,
  "is_closed": false,
  "reason": "Test"
}
```

**Attendu**
- HTTP `400`
- message de validation clair
- base inchangée

**Statut**
- [x] Passed
- [ ] Failed

---

## 19. PATCH /api/admin/menu-exceptions/:id avec payload valide

**Requête**
- Méthode : `PATCH`
- URL : `/api/admin/menu-exceptions/:id`
- Headers :
  - `Authorization: Bearer <ADMIN_TOKEN>`
  - `Content-Type: application/json`
- Body :
```json
{
  "label": "Exception mise à jour",
  "reason": "Changement fournisseur"
}
```

**Attendu**
- HTTP `200`
- `status = success`
- exception mise à jour en base

**Statut**
- [x] Passed
- [ ] Failed

---

## 20. PATCH /api/admin/menu-exceptions/:id avec id invalide

**Requête**
- Méthode : `PATCH`
- URL : `/api/admin/menu-exceptions/abc`
- Headers :
  - `Authorization: Bearer <ADMIN_TOKEN>`
  - `Content-Type: application/json`
- Body :
```json
{
  "label": "Test"
}
```

**Attendu**
- HTTP `400`
- message de validation clair

**Statut**
- [x] Passed
- [ ] Failed

---

## 21. PATCH /api/admin/menu-exceptions/:id avec id inexistant

**Requête**
- Méthode : `PATCH`
- URL : `/api/admin/menu-exceptions/999999`
- Headers :
  - `Authorization: Bearer <ADMIN_TOKEN>`
  - `Content-Type: application/json`
- Body :
```json
{
  "label": "Test"
}
```

**Attendu**
- HTTP `404`
- message clair indiquant que l’exception est introuvable

**Statut**
- [x] Passed
- [ ] Failed

---

## 22. DELETE /api/admin/menu-exceptions/:id avec id valide

**Requête**
- Méthode : `DELETE`
- URL : `/api/admin/menu-exceptions/:id`
- Headers :
  - `Authorization: Bearer <ADMIN_TOKEN>`

**Attendu**
- HTTP `200`
- message de succès présent
- ligne supprimée en base

**Statut**
- [x] Passed
- [ ] Failed

---

## 23. DELETE /api/admin/menu-exceptions/:id avec id inexistant

**Requête**
- Méthode : `DELETE`
- URL : `/api/admin/menu-exceptions/999999`
- Headers :
  - `Authorization: Bearer <ADMIN_TOKEN>`

**Attendu**
- HTTP `404`
- message clair indiquant que l’exception est introuvable

**Statut**
- [x] Passed
- [ ] Failed

---

## 24. GET /api/admin/menus/calendar avec query valide

**Requête**
- Méthode : `GET`
- URL : `/api/admin/menus/calendar?year=2026&month=4`
- Headers :
  - `Authorization: Bearer <ADMIN_TOKEN>`

**Attendu**
- HTTP `200`
- `status = success`
- la réponse contient :
  - `year`
  - `month`
  - un tableau `days`

**Statut**
- [x] Passed
- [ ] Failed

---

## 25. GET /api/admin/menus/calendar avec mois invalide

**Requête**
- Méthode : `GET`
- URL : `/api/admin/menus/calendar?year=2026&month=13`
- Headers :
  - `Authorization: Bearer <ADMIN_TOKEN>`

**Attendu**
- HTTP `400`
- message de validation clair

**Statut**
- [x] Passed
- [ ] Failed

---

## 26. GET /api/admin/menus/calendar avec paramètres manquants

**Requête**
- Méthode : `GET`
- URL : `/api/admin/menus/calendar`
- Headers :
  - `Authorization: Bearer <ADMIN_TOKEN>`

**Attendu**
- HTTP `400`
- message de validation clair

**Statut**
- [x] Passed
- [ ] Failed

---

## 27. GET /api/menus/by-date/:date retourne un menu standard

**Requête**
- Méthode : `GET`
- URL : `/api/menus/by-date/2026-04-21`

**Attendu**
- HTTP `200`
- `source = standard`

**Statut**
- [x] Passed
- [ ] Failed

---

## 28. GET /api/menus/by-date/:date retourne une exception

**Requête**
- Méthode : `GET`
- URL : `/api/menus/by-date/2026-04-20`

**Attendu**
- HTTP `200`
- `source = exception`

**Statut**
- [x] Passed
- [ ] Failed

---

## 29. GET /api/menus/by-date/:date retourne un jour fermé

**Requête**
- Méthode : `GET`
- URL : `/api/menus/by-date/2026-04-26`

**Attendu**
- HTTP `200`
- `is_closed = true`

**Statut**
- [x] Passed
- [ ] Failed

---

## 30. GET /api/menus/by-date/:date retourne aucun menu

**Requête**
- Méthode : `GET`
- URL : `/api/menus/by-date/2026-04-30`

**Attendu**
- HTTP `200`
- `source = none`

**Statut**
- [x] Passed
- [ ] Failed

---

## 31. GET /api/menus/by-date/:date avec date invalide

**Requête**
- Méthode : `GET`
- URL : `/api/menus/by-date/2026-02-30`

**Attendu**
- HTTP `400`
- message de validation clair

**Statut**
- [x] Passed
- [ ] Failed

---

## 32. Vérifier la priorité exception > menu hebdomadaire

**Étapes**
- créer un menu hebdomadaire publié pour un jour donné
- créer une exception publiée pour une date correspondant à ce jour
- appeler l’endpoint public avec cette date

**Attendu**
- HTTP `200`
- `source = exception`
- le contenu retourné correspond à l’exception, pas au menu hebdomadaire

**Statut**
- [x] Passed
- [ ] Failed

---

## 33. POST /api/admin/menu-exceptions avec token USER

**Requête**
- Méthode : `POST`
- URL : `/api/admin/menu-exceptions`
- Headers :
  - `Authorization: Bearer <USER_TOKEN>`
  - `Content-Type: application/json`
- Body : payload d’exception valide

**Attendu**
- HTTP `403`
- message d’autorisation clair

**Statut**
- [x] Passed
- [ ] Failed

---

## 34. POST /api/admin/menu-exceptions sans token

**Requête**
- Méthode : `POST`
- URL : `/api/admin/menu-exceptions`
- Headers :
  - `Content-Type: application/json`
- Body : payload d’exception valide

**Attendu**
- HTTP `401`
- message d’authentification clair

**Statut**
- [x] Passed
- [ ] Failed

---

## Vérification base de données

Après chaque mutation réussie :

- vérifier l’insertion après `POST`
- vérifier la mise à jour après `PUT` / `PATCH`
- vérifier la suppression après `DELETE`

SQL suggéré :
```sql
SELECT * FROM weekly_menus;
SELECT * FROM menu_exceptions;
```

---

## Checklist finale de validation

- [x] Toutes les routes menus ont été testées
- [x] Les cas de succès ont été testés
- [x] Les erreurs de validation ont été testées
- [x] Les erreurs d’authentification ont été testées
- [x] Les erreurs d’autorisation ont été testées
- [x] Les règles métier ont été vérifiées
- [x] Les effets en base ont été vérifiés
- [x] Le format de réponse API a été vérifié
- [x] Prêt pour Pull Request
