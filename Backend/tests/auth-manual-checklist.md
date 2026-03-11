# S1-10 — Auth tests manual checklist

## Environnement
- Backend lancé sur http://localhost:5000
- Base de données connectée
- Comptes de test disponibles :
  - User: apogee + password
  - Admin: email + password

---

## 1. Login étudiant

### Cas nominal
- [ ] POST /api/auth/user/login avec identifiants valides
- [ ] Retourne 200
- [ ] Retourne accessToken
- [ ] Retourne user avec role USER
- [ ] Cookie refreshToken créé

### Cas négatif
- [ ] Mauvais mot de passe -> 401
- [ ] Apogée inexistant -> 401
- [ ] Champs manquants -> 400 ou erreur claire

---

## 2. Login admin

### Cas nominal
- [ ] POST /api/auth/admin/login avec identifiants valides
- [ ] Retourne 200
- [ ] Retourne accessToken
- [ ] Retourne admin avec role ADMIN
- [ ] Cookie refreshToken créé

### Cas négatif
- [ ] Mauvais mot de passe -> 401
- [ ] Email inexistant -> 401
- [ ] Champs manquants -> 400 ou erreur claire

---

## 3. requireAuth

### Cas nominal
- [ ] GET route protégée avec Bearer accessToken valide
- [ ] Retourne 200
- [ ] req.user injecté correctement

### Cas négatif
- [ ] Sans token -> 401
- [ ] Token invalide -> 401
- [ ] Token expiré -> 401

---

## 4. RBAC admin

### Cas nominal
- [ ] GET route admin avec accessToken ADMIN
- [ ] Retourne 200

### Cas négatif
- [ ] GET route admin avec accessToken USER -> 403
- [ ] Sans token -> 401

---

## 5. Refresh token

### Cas nominal
- [ ] POST /api/auth/refresh avec cookie refreshToken valide
- [ ] Retourne 200
- [ ] Retourne un nouveau accessToken

### Cas négatif
- [ ] Sans cookie -> 401
- [ ] Refresh token invalide -> 401
- [ ] Refresh token expiré -> 401
- [ ] Refresh token absent de la DB -> 401

---

## 6. Logout

### Cas nominal
- [ ] POST /api/auth/logout
- [ ] Retourne 200
- [ ] Cookie refreshToken supprimé
- [ ] Refresh ne fonctionne plus après logout

### Cas négatif / edge case
- [ ] Logout sans cookie -> 200
- [ ] Deux logout successifs -> 200

---

## Preuves
- [ ] Captures Thunder Client / Postman login user
- [ ] Captures login admin
- [ ] Capture requireAuth sans token
- [ ] Capture RBAC USER -> 403
- [ ] Capture refresh OK
- [ ] Capture refresh KO
- [ ] Capture logout OK
- [ ] Capture refresh après logout KO