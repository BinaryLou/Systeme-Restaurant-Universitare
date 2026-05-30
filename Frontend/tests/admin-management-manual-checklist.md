# Admin Management Manual Test Checklist

## Issue

S13-06 - [TEST] Checklist de Tests Manuels Administration

## Goal

Rédiger et dérouler la checklist de validation manuelle pour certifier la robustesse de la gestion des services, des menus hebdomadaires, des exceptions de menus (et fermetures exceptionnelles), ainsi que la protection de l'espace administration par le garde de routes (`AdminRouteGuard`).

---

## Preconditions

- Backend lancé sur `http://localhost:5000`
- Frontend lancé sur `http://localhost:3000`
- Base de données active et seedée
- Un compte étudiant fonctionnel (ex: `lougdali@ensa.ma` / `123456`)
- Un compte administrateur fonctionnel (ex: `admin@ensa.ma` / `123456`)

---

## Test Data

### Administrateur
- Email: `admin@ensa.ma`
- Mot de passe: `123456`

### Étudiant
- Email: `lougdali@ensa.ma`
- Mot de passe: `123456`

---

# Manual Test Cases

## 1. Modification des Horaires des Services (Cas Nominal)

**Steps**

1. Se connecter en tant qu'administrateur
2. Accéder à l'onglet "Gestion Services" dans la sidebar
3. Modifier l'heure de début et de fin du service **DEJEUNER** (ex: début 11:30, fin 14:30)
4. Cliquer sur "Enregistrer" ou l'icône de sauvegarde

**Expected**

- Le message de succès "Service mis à jour avec succès" s'affiche (toast vert)
- Les nouvelles heures sont persistées en base de données et s'affichent correctement sur l'interface
- Les heures restent identiques après rechargement de la page

**Status**

- [x] Passed
- [ ] Failed

---

## 2. Modification des Horaires avec Heure Fin < Heure Début (Cas Invalide)

**Steps**

1. Dans la page "Gestion Services", modifier l'heure de fin pour qu'elle soit antérieure à l'heure de début (ex: début 12:00, fin 11:30)
2. Cliquer sur "Enregistrer"

**Expected**

- Un message d'erreur clair s'affiche indiquant que l'heure de début doit être antérieure à l'heure de fin (contrainte CHECK de la base de données interceptée par le backend)
- Les données ne sont pas modifiées en base et l'ancienne valeur est restaurée ou maintenue à l'écran

**Status**

- [x] Passed
- [ ] Failed

---

## 3. Ajout et Publication d'un Menu Standard

**Steps**

1. Naviguer vers la page "Gestion Menus"
2. Cliquer sur un jour de la semaine non configuré (ou cliquer sur "Modifier" sur un jour existant comme Lundi)
3. Saisir les entrées, plats, accompagnements et desserts pour le Déjeuner et le Dîner
4. Cocher/Activer la publication du menu ("Publié")
5. Cliquer sur "Enregistrer"

**Expected**

- Notification de succès de l'enregistrement du menu
- Le jour en question affiche désormais un statut "Menu standard" et une coche verte sur le bouton du jour
- L'aperçu du calendrier affiche des points bleus pour ce jour de la semaine sur toutes les semaines du mois

**Status**

- [x] Passed
- [ ] Failed

---

## 4. Remplacement par un Menu Exceptionnel (Date Spécifique)

**Steps**

1. Dans la page "Gestion Menus", repérer l'Aperçu Calendrier sur la droite
2. Cliquer sur une date spécifique du calendrier (ex: 15 Juin 2026)
3. La modale "Créer une exception de menu" s'ouvre
4. Saisir un titre pour l'exception (ex: "Repas Spécial Fin d'Année")
5. Modifier les plats par rapport au menu standard
6. Cliquer sur "Enregistrer"

**Expected**

- Le message de confirmation s'affiche
- La date ciblée (le 15 Juin) affiche désormais un point orange (couleur distincte) dans le calendrier
- En cliquant à nouveau sur cette date, les données de l'exception s'affichent correctement dans la modale (chargées depuis le serveur)

**Status**

- [x] Passed
- [ ] Failed

---

## 5. Pré-remplir à partir du Menu Standard dans la Modale d'Exception

**Steps**

1. Cliquer sur une date du calendrier qui possède déjà un menu standard appliqué
2. Dans la modale d'exception, cliquer sur le bouton "Pré-remplir avec le menu standard"
3. Vérifier les champs de saisie (Entrée, Plat, Accompagnement, Dessert)

**Expected**

- Tous les champs sont automatiquement remplis avec les plats correspondants du menu hebdomadaire de ce jour de la semaine
- L'administrateur peut modifier ces plats pré-remplis pour affiner l'exception

**Status**

- [x] Passed
- [ ] Failed

---

## 6. Déclaration d'une Fermeture Exceptionnelle (Bloquer la Saisie)

**Steps**

1. Cliquer sur une date du calendrier
2. Dans la modale, cocher l'option "Marquer ce jour comme fermé (repas bloqués)"
3. Observer l'état des champs de saisie des plats

**Expected**

- Tous les champs de saisie pour le Déjeuner et le Dîner sont immédiatement masqués/désactivés (ou un message clair d'alerte rouge s'affiche) empêchant toute saisie de plats pour ce jour
- Cliquer sur "Enregistrer" sauvegarde l'exception de fermeture
- La date dans le calendrier apparaît désormais sous forme de case grisée (case fermée visuellement distincte)

**Status**

- [x] Passed
- [ ] Failed

---

## 7. Suppression d'une Exception de Menu

**Steps**

1. Cliquer sur une date du calendrier possédant un point orange (exception) ou grisée (fermeture)
2. Cliquer sur le bouton rouge "Supprimer l'exception"
3. Confirmer la suppression dans la boîte de dialogue native

**Expected**

- Notification de succès indiquant que l'exception est supprimée et le menu standard restauré
- La modale se ferme
- Le point orange ou la couleur grisée disparaît de la case du calendrier, qui récupère sa couleur/son point d'origine (bleu pour menu standard ou rien si aucun menu standard n'est configuré)

**Status**

- [x] Passed
- [ ] Failed

---

## 8. Blocage d'un Étudiant Connecté (Intrusion Espace Admin)

**Steps**

1. Se connecter sur l'application avec un compte étudiant (`lougdali@ensa.ma`)
2. Tenter d'accéder manuellement en saisissant l'URL `/admin/dashboard` ou `/admin/menus` dans la barre d'adresse du navigateur

**Expected**

- L'utilisateur est immédiatement bloqué par l'authentification/le garde de route (`AdminRouteGuard`)
- Il est redirigé automatiquement vers la page `/unauthorized` (qui affiche "Accès non autorisé") ou la page de connexion
- L'étudiant ne peut charger aucun composant ni voir aucune donnée de l'espace administration

**Status**

- [x] Passed
- [ ] Failed

---

## 9. Blocage d'un Utilisateur Anonyme (Intrusion Espace Admin)

**Steps**

1. S'assurer de ne pas être connecté (ou vider le `localStorage` de la session)
2. Saisir l'URL `/admin/dashboard` ou `/admin/menus` dans la barre d'adresse du navigateur

**Expected**

- L'accès est instantanément bloqué
- L'utilisateur est redirigé vers la page de login de l'administration (`/admin/login`)

**Status**

- [x] Passed
- [ ] Failed

---

# Final Validation

- [x] Le fichier `admin-management-manual-checklist.md` est rédigé, complet et archivé dans le dossier `Frontend/tests/`.
- [x] Tous les tests décrits ci-dessus ont été déroulés manuellement avec succès (Passed) sur l'environnement local.
- [x] Aucune régression n'a été détectée sur les autres parcours utilisateurs (étudiant, scan staff).
