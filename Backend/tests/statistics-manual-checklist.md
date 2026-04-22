# Statistics Manual Test Checklist

## Issue
S8-09 [TEST] Statistics manual validation

## Goal
Valider manuellement le module statistiques admin avant merge.
Cette checklist couvre les endpoints dashboard, statistiques détaillées, export Excel/PDF, sécurité ADMIN et validation des filtres.

## Endpoints concernés
- `GET /api/admin/dashboard/stats`
- `GET /api/admin/statistics`
- `GET /api/admin/statistics/export/excel`
- `GET /api/admin/statistics/export/pdf`

## Expected Success Response
```json
{
  "status": "success",
  "data": {},
  "message": "Opération réussie"
}
```

## Expected Error Response
```json
{
  "status": "error",
  "message": "Message d'erreur clair"
}
```

## Preconditions
- le backend est lancé
- la base de données contient des réservations de test
- au moins un compte ADMIN existe
- au moins un compte non admin existe
- les routes statistiques sont branchées dans `app.js`
- `verifyJwt` et `requireRole("ADMIN")` sont actifs
- les endpoints export Excel et PDF sont implémentés
- la logique `no-show` est déjà définie dans le service

## Business Rules to Validate
- accès réservé aux admins
- agrégation supportée pour `day`, `week`, `month`
- les périodes vides doivent retourner des valeurs cohérentes
- les valeurs numériques absentes doivent être normalisées à `0`
- les filtres invalides doivent retourner une erreur HTTP `400`
- les exports doivent refléter les filtres actifs
- cohérence entre dashboard, detailed statistics et exports

## Test Data

### Admin token
```txt
Bearer <ADMIN_JWT>
```

### Non admin token
```txt
Bearer <USER_JWT>
```

### Valid query examples
```txt
GET /api/admin/dashboard/stats
GET /api/admin/statistics?period=day&date=2026-04-20
GET /api/admin/statistics?period=week&startDate=2026-04-14&endDate=2026-04-20
GET /api/admin/statistics?period=month&month=4&year=2026
GET /api/admin/statistics/export/excel?period=month&month=4&year=2026
GET /api/admin/statistics/export/pdf?period=week&startDate=2026-04-14&endDate=2026-04-20
```

### Invalid query examples
```txt
GET /api/admin/statistics?period=year
GET /api/admin/statistics?period=month&month=13&year=2026
GET /api/admin/statistics?period=day&date=invalid-date
GET /api/admin/statistics/export/pdf?format=doc
GET /api/admin/statistics?period=week&startDate=2026-04-20&endDate=2026-04-14
```

---

# Manual Test Cases

## 1. Dashboard stats avec admin
**Request**
- Method: `GET`
- URL: `/api/admin/dashboard/stats`
- Headers:
  - `Authorization: Bearer <ADMIN_JWT>`

**Expected**
- HTTP `200`
- réponse au format standard
- présence des KPI principaux
- données dashboard cohérentes
- aucune valeur `null` critique

**Status**
- [x] Passed
- [ ] Failed

---

## 2. Dashboard stats sans token
**Request**
- Method: `GET`
- URL: `/api/admin/dashboard/stats`

**Expected**
- HTTP `401`
- accès refusé
- message d’erreur clair

**Status**
- [x] Passed
- [ ] Failed

---

## 3. Dashboard stats avec user non admin
**Request**
- Method: `GET`
- URL: `/api/admin/dashboard/stats`
- Headers:
  - `Authorization: Bearer <USER_JWT>`

**Expected**
- HTTP `403`
- accès refusé
- protection ADMIN confirmée

**Status**
- [x] Passed
- [ ] Failed

---

## 4. Statistiques jour valides
**Request**
- Method: `GET`
- URL: `/api/admin/statistics?period=day&date=2026-04-20`
- Headers:
  - `Authorization: Bearer <ADMIN_JWT>`

**Expected**
- HTTP `200`
- réponse structurée
- statistiques du jour renvoyées
- agrégation cohérente

**Status**
- [x] Passed
- [ ] Failed

---

## 5. Statistiques semaine valides
**Request**
- Method: `GET`
- URL: `/api/admin/statistics?period=week&startDate=2026-04-14&endDate=2026-04-20`
- Headers:
  - `Authorization: Bearer <ADMIN_JWT>`

**Expected**
- HTTP `200`
- réponse structurée
- statistiques de la semaine renvoyées
- cohérence avec les réservations en base

**Status**
- [x] Passed
- [ ] Failed

---

## 6. Statistiques mois valides
**Request**
- Method: `GET`
- URL: `/api/admin/statistics?period=month&month=4&year=2026`
- Headers:
  - `Authorization: Bearer <ADMIN_JWT>`

**Expected**
- HTTP `200`
- réponse structurée
- statistiques mensuelles renvoyées
- agrégation mensuelle correcte

**Status**
- [x] Passed
- [ ] Failed

---

## 7. Période sans données
**Request**
- Method: `GET`
- URL: `/api/admin/statistics?period=day&date=2026-01-01`
- Headers:
  - `Authorization: Bearer <ADMIN_JWT>`

**Expected**
- HTTP `200`
- réponse valide même sans données
- KPI à `0`
- pas de crash
- pas de `NaN`

**Status**
- [x] Passed
- [ ] Failed

---

## 8. Export Excel valide
**Request**
- Method: `GET`
- URL: `/api/admin/statistics/export/excel?period=month&month=4&year=2026`
- Headers:
  - `Authorization: Bearer <ADMIN_JWT>`

**Expected**
- HTTP `200`
- fichier Excel téléchargé
- nom de fichier cohérent
- contenu aligné avec les statistiques API

**Status**
- [x] Passed
- [ ] Failed

---

## 9. Export PDF valide
**Request**
- Method: `GET`
- URL: `/api/admin/statistics/export/pdf?period=week&startDate=2026-04-14&endDate=2026-04-20`
- Headers:
  - `Authorization: Bearer <ADMIN_JWT>`

**Expected**
- HTTP `200`
- fichier PDF téléchargé
- contenu lisible
- titre + période + KPIs visibles
- cohérence avec les statistiques API

**Status**
- [x] Passed
- [ ] Failed

---

## 10. Filtre period invalide
**Request**
- Method: `GET`
- URL: `/api/admin/statistics?period=year`
- Headers:
  - `Authorization: Bearer <ADMIN_JWT>`

**Expected**
- HTTP `400`
- message d’erreur clair
- la requête ne passe pas au service

**Status**
- [x] Passed
- [ ] Failed

---

## 11. Date invalide
**Request**
- Method: `GET`
- URL: `/api/admin/statistics?period=day&date=invalid-date`
- Headers:
  - `Authorization: Bearer <ADMIN_JWT>`

**Expected**
- HTTP `400`
- message d’erreur clair

**Status**
- [x] Passed
- [ ] Failed

---

## 12. Month invalide
**Request**
- Method: `GET`
- URL: `/api/admin/statistics?period=month&month=13&year=2026`
- Headers:
  - `Authorization: Bearer <ADMIN_JWT>`

**Expected**
- HTTP `400`
- validation du mois appliquée

**Status**
- [x] Passed
- [ ] Failed

---

## 13. Intervalle semaine invalide
**Request**
- Method: `GET`
- URL: `/api/admin/statistics?period=week&startDate=2026-04-20&endDate=2026-04-14`
- Headers:
  - `Authorization: Bearer <ADMIN_JWT>`

**Expected**
- HTTP `400`
- erreur claire sur l’intervalle de dates

**Status**
- [x] Passed
- [ ] Failed

---

## 14. Export Excel sans token
**Request**
- Method: `GET`
- URL: `/api/admin/statistics/export/excel?period=month&month=4&year=2026`

**Expected**
- HTTP `401`
- accès refusé

**Status**
- [x] Passed
- [ ] Failed

---

## 15. Export PDF avec user non admin
**Request**
- Method: `GET`
- URL: `/api/admin/statistics/export/pdf?period=day&date=2026-04-20`
- Headers:
  - `Authorization: Bearer <USER_JWT>`

**Expected**
- HTTP `403`
- accès refusé
- protection ADMIN confirmée

**Status**
- [x] Passed
- [ ] Failed

---

## Final Validation
- [x] dashboard admin validé
- [x] detailed statistics validées
- [x] export Excel validé
- [x] export PDF validé
- [x] sécurité ADMIN validée
- [x] validation des filtres validée
- [x] cohérence des données validée
