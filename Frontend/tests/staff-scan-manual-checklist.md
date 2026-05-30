# Staff Scan Manual Test Checklist

## Issue

S12-05 - [TEST] Checklist de Tests Manuels Staff Scan

## Goal

Rédiger et dérouler la checklist de validation manuelle pour certifier la robustesse du module de scan avant sa mise en production locale, suivant les standards du projet.

---

## Preconditions

- Backend lancé sur `http://localhost:5000`
- Frontend lancé sur `http://localhost:3000`
- Base de données seedée avec des réservations valides et consommées
- Test sur smartphone réel en binôme pour valider le comportement physique de la caméra
- Accès staff avec PIN valide (`SCAN_PIN` configuré)

---

## Test Data

### Réservation valide
- QR Code d'une réservation du jour, au bon service, non consommée.

### Réservation déjà consommée
- QR Code d'une réservation déjà scannée (statut "utilisée").

### QR Code Invalide
- QR Code généré aléatoirement, format incorrect ou falsifié.

---

# Manual Test Cases

## 1. Scan Réussi (Cas Nominal)

**Steps**

1. Se connecter avec le PIN staff et accéder à `/staff/scan`
2. Autoriser l'accès à la caméra sur le smartphone
3. Scanner un QR Code valide (réservation du jour non consommée)

**Expected**

- Le scan est rapide et détecte le QR Code
- Message de succès clair (couleur verte) affichant la validation du ticket
- Le statut de la réservation passe à "utilisée"
- Le système est prêt pour le prochain scan sans nécessiter de rechargement

**Status**

- [x] Passed
- [ ] Failed

---

## 2. Ticket Déjà Consommé

**Steps**

1. Sur la page `/staff/scan`, scanner un QR Code d'une réservation déjà utilisée
2. Observer le résultat affiché

**Expected**

- Alerte rouge (ou blocage clair) "Ticket déjà consommé" ou "Déjà scanné"
- Le statut en base de données ne change pas
- Le système bloque l'entrée pour ce ticket

**Status**

- [x] Passed
- [ ] Failed

---

## 3. Code Invalide

**Steps**

1. Scanner un QR code qui ne correspond pas au format de l'application ou d'une autre application

**Expected**

- Alerte rouge "Code invalide" ou "QR Code non reconnu"
- Aucun crash de l'application
- Le scanner reste actif après le message d'erreur

**Status**

- [x] Passed
- [ ] Failed

---

## 4. Coupure Réseau

**Steps**

1. Charger la page `/staff/scan`
2. Couper le réseau (activer le mode avion ou désactiver Wi-Fi/Données mobiles)
3. Scanner un QR code (valide ou non)

**Expected**

- Le scan détecte le code mais la requête vers le serveur échoue
- Message d'erreur clair indiquant un problème de connexion ("Erreur réseau", etc.)
- Le système ne valide pas de ticket hors ligne et reste sécurisé

**Status**

- [x] Passed
- [ ] Failed

---

## 5. Comportement de la Caméra sur Smartphone Réel

**Steps**

1. Ouvrir l'application sur un smartphone réel
2. Vérifier le rendu de la caméra (cadrage, mise au point)
3. Changer l'orientation de l'appareil si permis (portrait / paysage)
4. Tester le bouton de changement de caméra si présent (avant/arrière)

**Expected**

- L'image est fluide, non déformée
- La zone de scan est clairement délimitée
- Le scan s'effectue sans difficulté de mise au point

**Status**

- [x] Passed
- [ ] Failed

---

# Final Validation

- [x] Le fichier `staff-scan-manual-checklist.md` est complété et présent dans le dossier de test.
- [x] 100% des cas d'utilisation décrits (saisie, scan, blocage, couleurs) passent la recette avec succès.
- [x] Tous les tests critiques sont passés.
