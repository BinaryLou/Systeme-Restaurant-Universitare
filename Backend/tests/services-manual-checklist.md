# Services Manual Test Checklist

## Issue
S2-06 [TEST] Add services manual test checklist

## Goal
Validate the Services Admin module manually before merge.

This checklist covers the following protected endpoints:

- `GET /api/services`
- `POST /api/services`
- `PUT /api/services/:id`
- `DELETE /api/services/:id`

All these routes must be protected by:

- `verifyJwt`
- `requireRole("ADMIN")`

The expected API response format follows the project standard.

---

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

---

## Preconditions

Before starting the tests, verify that:

- the backend server is running
- the MySQL database is running
- the database schema has been imported
- the `service_repas` table exists
- at least one ADMIN account exists
- at least one non-admin user account exists
- a valid `ADMIN_TOKEN` is available
- a valid `USER_TOKEN` is available

---

## Business Rules to Validate

- only ADMIN users can manage services
- `type_repas` must be `DEJEUNER` or `DINER`
- `heure_debut` and `heure_fin` must be valid times
- `heure_debut` must be strictly earlier than `heure_fin`

---

## Test Data

### Valid payload
```json
{
  "type_repas": "DEJEUNER",
  "heure_debut": "12:00",
  "heure_fin": "14:00"
}
```

### Valid payload 2
```json
{
  "type_repas": "DINER",
  "heure_debut": "19:00",
  "heure_fin": "21:00"
}
```

### Invalid payload - invalid type
```json
{
  "type_repas": "BREAKFAST",
  "heure_debut": "12:00",
  "heure_fin": "14:00"
}
```

### Invalid payload - invalid time order
```json
{
  "type_repas": "DINER",
  "heure_debut": "20:00",
  "heure_fin": "19:00"
}
```

### Invalid payload - invalid format
```json
{
  "type_repas": "DEJEUNER",
  "heure_debut": "abc",
  "heure_fin": "14:00"
}
```

### Invalid payload - missing field
```json
{
  "type_repas": "DEJEUNER",
  "heure_debut": "12:00"
}
```

---

# Manual Test Cases

## 1. GET /api/services with ADMIN token
**Request**
- Method: `GET`
- URL: `/api/services`
- Headers:
  - `Authorization: Bearer <ADMIN_TOKEN>`

**Expected**
- HTTP `200`
- `status = success`
- `message` present
- `data` is an array
- each service contains:
  - `id_service`
  - `type_repas`
  - `heure_debut`
  - `heure_fin`

**Status**
- [x] Passed
- [ ] Failed


---

## 2. GET /api/services without token
**Request**
- Method: `GET`
- URL: `/api/services`

**Expected**
- HTTP `401`
- clear authentication error message

**Status**
- [x] Passed
- [ ] Failed


---

## 3. GET /api/services with non-admin token
**Request**
- Method: `GET`
- URL: `/api/services`
- Headers:
  - `Authorization: Bearer <USER_TOKEN>`

**Expected**
- HTTP `403`
- clear authorization error message

**Status**
- [x] Passed
- [ ] Failed


---

## 4. POST /api/services with valid ADMIN payload
**Request**
- Method: `POST`
- URL: `/api/services`
- Headers:
  - `Authorization: Bearer <ADMIN_TOKEN>`
  - `Content-Type: application/json`
- Body:
```json
{
  "type_repas": "DEJEUNER",
  "heure_debut": "12:00",
  "heure_fin": "14:00"
}
```

**Expected**
- HTTP `201`
- `status = success`
- success message present
- created service returned in `data` or created id returned
- row inserted in database

**Status**
- [x] Passed
- [ ] Failed


---

## 5. POST /api/services with invalid type_repas
**Request**
- Method: `POST`
- URL: `/api/services`
- Headers:
  - `Authorization: Bearer <ADMIN_TOKEN>`
  - `Content-Type: application/json`
- Body:
```json
{
  "type_repas": "BREAKFAST",
  "heure_debut": "12:00",
  "heure_fin": "14:00"
}
```

**Expected**
- HTTP `400`
- clear validation error message
- no row inserted in database

**Status**
- [x] Passed
- [ ] Failed


---

## 6. POST /api/services with invalid time order
**Request**
- Method: `POST`
- URL: `/api/services`
- Headers:
  - `Authorization: Bearer <ADMIN_TOKEN>`
  - `Content-Type: application/json`
- Body:
```json
{
  "type_repas": "DINER",
  "heure_debut": "20:00",
  "heure_fin": "19:00"
}
```

**Expected**
- HTTP `400`
- clear validation error message
- no row inserted in database

**Status**
- [x] Passed
- [ ] Failed


---

## 7. POST /api/services with invalid time format
**Request**
- Method: `POST`
- URL: `/api/services`
- Headers:
  - `Authorization: Bearer <ADMIN_TOKEN>`
  - `Content-Type: application/json`
- Body:
```json
{
  "type_repas": "DEJEUNER",
  "heure_debut": "abc",
  "heure_fin": "14:00"
}
```

**Expected**
- HTTP `400`
- clear validation error message
- no row inserted in database

**Status**
- [x] Passed
- [ ] Failed


---

## 8. POST /api/services with missing field
**Request**
- Method: `POST`
- URL: `/api/services`
- Headers:
  - `Authorization: Bearer <ADMIN_TOKEN>`
  - `Content-Type: application/json`
- Body:
```json
{
  "type_repas": "DEJEUNER",
  "heure_debut": "12:00"
}
```

**Expected**
- HTTP `400`
- clear validation error message
- no row inserted in database

**Status**
- [x] Passed
- [ ] Failed


---

## 9. POST /api/services without token
**Request**
- Method: `POST`
- URL: `/api/services`
- Body: valid payload

**Expected**
- HTTP `401`

**Status**
- [x] Passed
- [ ] Failed


---

## 10. POST /api/services with non-admin token
**Request**
- Method: `POST`
- URL: `/api/services`
- Headers:
  - `Authorization: Bearer <USER_TOKEN>`
  - `Content-Type: application/json`
- Body: valid payload

**Expected**
- HTTP `403`

**Status**
- [x] Passed
- [ ] Failed


---

## 11. PUT /api/services/:id with valid payload
**Request**
- Method: `PUT`
- URL: `/api/services/:id`
- Headers:
  - `Authorization: Bearer <ADMIN_TOKEN>`
  - `Content-Type: application/json`
- Body:
```json
{
  "type_repas": "DEJEUNER",
  "heure_debut": "11:30",
  "heure_fin": "13:30"
}
```

**Expected**
- HTTP `200`
- `status = success`
- success message present
- service updated in database

**Status**
- [x] Passed
- [ ] Failed


---

## 12. PUT /api/services/:id with non-existing id
**Request**
- Method: `PUT`
- URL: `/api/services/999999`
- Headers:
  - `Authorization: Bearer <ADMIN_TOKEN>`
  - `Content-Type: application/json`
- Body: valid payload

**Expected**
- HTTP `404`
- clear message indicating service not found

**Status**
- [x] Passed
- [ ] Failed


---

## 13. PUT /api/services/:id with invalid payload
**Request**
- Method: `PUT`
- URL: `/api/services/:id`
- Headers:
  - `Authorization: Bearer <ADMIN_TOKEN>`
  - `Content-Type: application/json`
- Body:
```json
{
  "type_repas": "DINER",
  "heure_debut": "abc",
  "heure_fin": "23:00"
}
```

**Expected**
- HTTP `400`
- validation error message
- database unchanged

**Status**
- [x] Passed
- [ ] Failed


---

## 14. PUT /api/services/:id without token
**Request**
- Method: `PUT`
- URL: `/api/services/:id`
- Body: valid payload

**Expected**
- HTTP `401`

**Status**
- [x] Passed
- [ ] Failed


---

## 15. PUT /api/services/:id with non-admin token
**Request**
- Method: `PUT`
- URL: `/api/services/:id`
- Headers:
  - `Authorization: Bearer <USER_TOKEN>`
  - `Content-Type: application/json`
- Body: valid payload

**Expected**
- HTTP `403`

**Status**
- [x] Passed
- [ ] Failed


---

## 16. DELETE /api/services/:id with ADMIN token
**Request**
- Method: `DELETE`
- URL: `/api/services/:id`
- Headers:
  - `Authorization: Bearer <ADMIN_TOKEN>`

**Expected**
- HTTP `200` or `204`
- success message if `200`
- row removed from database

**Status**
- [x] Passed
- [ ] Failed

---

## 17. DELETE /api/services/:id with non-existing id
**Request**
- Method: `DELETE`
- URL: `/api/services/999999`
- Headers:
  - `Authorization: Bearer <ADMIN_TOKEN>`

**Expected**
- HTTP `404`
- clear error message

**Status**
- [x] Passed
- [ ] Failed


---

## 18. DELETE /api/services/:id without token
**Request**
- Method: `DELETE`
- URL: `/api/services/:id`

**Expected**
- HTTP `401`

**Status**
- [x] Passed
- [ ] Failed


---

## 19. DELETE /api/services/:id with non-admin token
**Request**
- Method: `DELETE`
- URL: `/api/services/:id`
- Headers:
  - `Authorization: Bearer <USER_TOKEN>`

**Expected**
- HTTP `403`

**Status**
- [x] Passed
- [ ] Failed


---

## Database Verification

After each successful mutation:

- verify inserted row after `POST`
- verify updated row after `PUT`
- verify deleted row after `DELETE`

Suggested SQL:
```sql
SELECT * FROM service_repas;
```

---

## Final Validation Checklist

- [x] All services routes tested
- [x] Success cases tested
- [x] Validation errors tested
- [x] Authentication errors tested
- [x] Authorization errors tested
- [x] Database effects verified
- [x] API response format verified
- [x] Ready for Pull Request

---

