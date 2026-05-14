# Frontend Auth Manual Test Checklist

## Issue

S10-10 [TEST] Add frontend auth manual checklist

## Goal

Valider manuellement l’authentification frontend de Sprint 10 :

- login étudiant
- login admin
- accès personnel par PIN
- routes protégées
- logout
- refresh page avec session active

---

## Preconditions

- Backend lancé sur `http://localhost:5000`
- Frontend lancé sur `http://localhost:3000`
- Base de données seedée
- Un compte étudiant existe
- Un compte admin existe
- `SCAN_PIN` est configuré dans le backend `.env`
- Axios client configuré avec `VITE_API_BASE_URL=http://localhost:5000/api`

---

## Routes frontend à tester

- `/login`
- `/admin/login`
- `/student/dashboard`
- `/admin/dashboard`
- `/staff/pin`
- `/staff/scan`
- `/unauthorized`

---

## Test Data

### Étudiant valide

- Code Apogée : `A12345`
- Mot de passe : `123456`

### Admin valide

- Email : `admin@ensa.ma`
- Mot de passe : `123456`

### Personnel RU

- PIN : valeur de `SCAN_PIN` dans `.env`
- Exemple : `1234`

---

# Manual Test Cases

## 1. Login étudiant valide

**Steps**

1. Aller à `/login`
2. Saisir un Code Apogée valide
3. Saisir un mot de passe valide
4. Cliquer sur `Se connecter`

**Expected**

- Connexion réussie
- Redirection vers `/student/dashboard`
- Token sauvegardé dans `localStorage`
- Aucun message d’erreur affiché

**Status**

- [x] Passed
- [ ] Failed

---

## 2. Login étudiant invalide

**Steps**

1. Aller à `/login`
2. Saisir un Code Apogée invalide
3. Saisir un mauvais mot de passe
4. Cliquer sur `Se connecter`

**Expected**

- Pas de redirection
- Message d’erreur affiché
- Aucun token valide sauvegardé

**Status**

- [x] Passed
- [ ] Failed

---

## 3. Login admin valide

**Steps**

1. Aller à `/admin/login`
2. Saisir un email admin valide
3. Saisir un mot de passe valide
4. Cliquer sur `Se connecter`

**Expected**

- Connexion admin réussie
- Redirection vers `/admin/dashboard`
- Token sauvegardé dans `localStorage`
- Rôle admin reconnu

**Status**

- [x] Passed
- [ ] Failed

---

## 4. Login admin invalide

**Steps**

1. Aller à `/admin/login`
2. Saisir un email invalide
3. Saisir un mauvais mot de passe
4. Cliquer sur `Se connecter`

**Expected**

- Pas de redirection
- Message d’erreur affiché
- Aucun accès admin autorisé

**Status**

- [x] Passed
- [ ] Failed

---

## 5. Accès route protégée sans token

**Steps**

1. Supprimer `accessToken` et `ru_auth` du `localStorage`
2. Aller directement à `/student/dashboard`

**Expected**

- Redirection vers `/login`
- Accès dashboard refusé

**Status**

- [x] Passed
- [ ] Failed

---

## 6. Accès admin avec rôle étudiant

**Steps**

1. Se connecter comme étudiant
2. Aller directement à `/admin/dashboard`

**Expected**

- Accès refusé
- Redirection vers `/unauthorized` ou login selon logique actuelle

**Status**

- [x] Passed
- [ ] Failed

---

## 7. Accès étudiant avec rôle admin

**Steps**

1. Se connecter comme admin
2. Aller directement à `/student/dashboard`

**Expected**

- Accès refusé
- Redirection vers `/unauthorized` ou login selon logique actuelle

**Status**

- [x] Passed
- [ ] Failed

---

## 8. Logout étudiant

**Steps**

1. Se connecter comme étudiant
2. Cliquer sur logout
3. Aller à `/student/dashboard`

**Expected**

- Session supprimée
- Token supprimé
- Redirection vers `/login`

**Status**

- [x] Passed
- [ ] Failed

---

## 9. Refresh page avec token valide

**Steps**

1. Se connecter comme étudiant ou admin
2. Rafraîchir la page navigateur

**Expected**

- Utilisateur reste connecté
- Pas de retour au login
- Données auth restaurées depuis `localStorage`

**Status**

- [x] Passed
- [ ] Failed

---

## 10. Accès personnel avec PIN valide

**Steps**

1. Aller à `/staff/pin`
2. Saisir le PIN valide
3. Cliquer sur valider

**Expected**

- Accès autorisé
- Redirection vers `/staff/scan`
- PIN stocké dans `sessionStorage`

**Status**

- [x] Passed
- [ ] Failed

---

## 11. Accès personnel avec PIN invalide

**Steps**

1. Aller à `/staff/pin`
2. Saisir un PIN incorrect
3. Cliquer sur valider

**Expected**

- Pas de redirection
- Message d’erreur clair affiché
- Accès scanner refusé

**Status**

- [x] Passed
- [ ] Failed

---

## 12. Accès direct au scanner sans PIN

**Steps**

1. Supprimer `staffPin` du `sessionStorage`
2. Aller directement à `/staff/scan`

**Expected**

- Redirection vers `/staff/pin`
- Scanner non accessible directement

**Status**

- [x] Passed
- [ ] Failed

---

## 13. Responsive mobile

**Steps**

1. Ouvrir DevTools
2. Activer mobile view
3. Tester `/login`
4. Tester `/admin/login`
5. Tester `/staff/pin`

**Expected**

- Layout lisible
- Formulaire utilisable
- Boutons visibles
- Aucun overflow gênant

**Status**

- [X] Passed
- [ ] Failed

---

# Final Validation

- [x] Tous les tests critiques sont passés
- [x] Les erreurs sont claires
- [x] Les routes protégées fonctionnent
- [x] L’accès staff par PIN fonctionne
- [x] Le logout fonctionne
- [x] La session est restaurée après refresh
