# Frontend Student Space Manual Test Checklist

## Issue

S11-10 [TEST] Add frontend student space manual checklist

## Goal

Valider manuellement l’espace étudiant du Sprint 11 :

- Dashboard étudiant (solde, actions rapides)
- Réservation (choix date, service, affichage menu, messages succès/erreur)
- Historique des réservations (statuts, annulation et ses règles)
- QR Code étudiant (affichage, téléchargement, gestion d'erreurs)
- Adaptation responsive sur desktop et mobile

---

## Preconditions

- Backend lancé sur `http://localhost:5000`
- Frontend lancé sur `http://localhost:3000`
- Base de données seedée
- Un compte étudiant (rôle `USER`) existe
- Un compte admin (rôle `ADMIN`) existe (pour tester les restrictions d'accès)
- Axios client configuré avec `VITE_API_BASE_URL=http://localhost:5000/api`

---

## Routes frontend à tester

- `/login`
- `/student/dashboard`
- `/student/reserver`
- `/student/historique`
- `/student/qrcode`
- `/student/profil`
- `/unauthorized`

---

## Test Data

### Étudiant avec solde suffisant
- Code Apogée : `A12345` (ou tout code étudiant valide configuré)
- Mot de passe : `123456`
- Solde : `>= 4 DH` (prix d'un repas)

### Étudiant avec solde insuffisant
- Code Apogée : `A54321` (ou compte avec solde de 0 DH)
- Mot de passe : `123456`
- Solde : `< 4 DH`

---

# Manual Test Cases

## Auth / accès

### 1. Accès étudiant connecté à son espace
**Steps**
1. Se connecter avec un compte étudiant valide (`/login`).
2. Tenter d'accéder à `/student/dashboard`.

**Expected**
- Accès autorisé.
- Redirection automatique vers `/student/dashboard` après login.
- Token stocké dans `localStorage`.

**Status**
- [x] Passed
- [ ] Failed

---

### 2. Accès non connecté (Redirection)
**Steps**
1. Supprimer le token/session du `localStorage`.
2. Tenter d'accéder directement à `/student/dashboard`.

**Expected**
- Redirection automatique vers `/login`.
- L'accès à la route protégée est bloqué.

**Status**
- [x] Passed
- [ ] Failed

---

### 3. Utilisateur avec mauvais rôle bloqué
**Steps**
1. Se connecter en tant qu'Admin (`/admin/login`).
2. Tenter d'accéder directement à `/student/dashboard`.

**Expected**
- Accès refusé.
- Redirection vers `/unauthorized` ou `/login`.

**Status**
- [x] Passed
- [ ] Failed

---

## Dashboard

### 4. Affichage correct du dashboard
**Steps**
1. Se connecter comme étudiant et aller sur `/student/dashboard`.

**Expected**
- La page se charge correctement sans erreurs de console.
- La structure de la page est cohérente et lisible.

**Status**
- [x] Passed
- [ ] Failed

---

### 5. Visibilité du solde étudiant
**Steps**
1. Consulter le solde affiché sur `/student/dashboard`.

**Expected**
- Le solde de l'étudiant est visible et correspond aux données de la base de données.
- L'unité monétaire (ex: DH) est correctement affichée.

**Status**
- [x] Passed
- [ ] Failed

---

### 6. Actions rapides fonctionnelles
**Steps**
1. Identifier les raccourcis/actions rapides présents sur le dashboard.
2. Cliquer sur chacun d'eux pour vérifier qu'ils effectuent l'action attendue.

**Expected**
- Les interactions déclenchent les bonnes actions ou redirections.

**Status**
- [x] Passed
- [ ] Failed

---

### 7. Redirection bouton "Réserver"
**Steps**
1. Cliquer sur le bouton ou la carte de raccourci "Réserver" (ou "Faire une réservation") depuis le dashboard.

**Expected**
- Redirection vers `/student/reserver`.

**Status**
- [x] Passed
- [ ] Failed

---

### 8. Redirection bouton "QR Code"
**Steps**
1. Cliquer sur le bouton ou la carte de raccourci "QR Code" (ou "Mon QR Code") depuis le dashboard.

**Expected**
- Redirection vers `/student/qrcode`.

**Status**
- [x] Passed
- [ ] Failed

---

### 9. Redirection bouton "Historique"
**Steps**
1. Cliquer sur le bouton ou la carte de raccourci "Historique" (ou "Mes réservations") depuis le dashboard.

**Expected**
- Redirection vers `/student/historique`.

**Status**
- [x] Passed
- [ ] Failed

---

## Réservation

### 10. Sélection d'une date valide
**Steps**
1. Aller sur `/student/reserver`.
2. Ouvrir le sélecteur de date et choisir une date future valide (comprise entre aujourd'hui et J+30).

**Expected**
- La date sélectionnée est acceptée.
- Pas d'erreur affichée.

**Status**
- [x] Passed
- [ ] Failed

---

### 11. Sélection d'un service
**Steps**
1. Sélectionner un service parmi ceux disponibles (ex: Déjeuner, Dîner).

**Expected**
- Le choix du service est correctement pris en compte dans le formulaire de réservation.

**Status**
- [x] Passed
- [ ] Failed

---

### 12. Affichage du menu
**Steps**
1. Sélectionner une date et un service.

**Expected**
- Le menu correspondant à la date et au service sélectionnés s'affiche à l'écran (si disponible dans la base de données).

**Status**
- [x] Passed
- [ ] Failed

---

### 13. Réservation valide (Succès)
**Steps**
1. Sélectionner une date valide (entre aujourd'hui et J+30) et un service disponible.
2. S'assurer que le solde est suffisant.
3. Cliquer sur le bouton de validation de la réservation.

**Expected**
- La réservation est enregistrée avec succès.
- Un message de succès clair (Toast ou alerte) s'affiche.
- Le solde étudiant est déduit ou actualisé.

**Status**
- [x] Passed
- [ ] Failed

---

### 14. Réservation pour une date passée (Erreur)
**Steps**
1. Essayer de forcer ou choisir une date passée (ex: hier).
2. Tenter de soumettre la réservation.

**Expected**
- Le système bloque la sélection ou affiche un message d'erreur clair indiquant que la date est invalide/passée.
- La réservation n'est pas créée.

**Status**
- [x] Passed
- [ ] Failed

---

### 15. Réservation après J+30 (Erreur)
**Steps**
1. Tenter de choisir une date au-delà de 30 jours dans le futur (ex: J+31).
2. Tenter de soumettre la réservation.

**Expected**
- Le sélecteur de date bloque le choix de cette date, ou la soumission renvoie un message d'erreur clair indiquant que la réservation est limitée à 30 jours à l'avance.
- La réservation n'est pas créée.

**Status**
- [x] Passed
- [ ] Failed

---

### 16. Double réservation (Erreur)
**Steps**
1. Effectuer une réservation valide pour une date et un service spécifiques.
2. Tenter de refaire une réservation pour la même date et le même service.

**Expected**
- Une erreur claire s'affiche ("Vous avez déjà une réservation pour ce service" ou similaire).
- La deuxième réservation est refusée.

**Status**
- [x] Passed
- [ ] Failed

---

### 17. Solde insuffisant (Erreur)
**Steps**
1. Se connecter avec l'étudiant ayant un solde insuffisant (< 4 DH).
2. Tenter d'effectuer une réservation pour une date et un service valides.

**Expected**
- Le bouton de validation est désactivé ou la soumission renvoie un message d'erreur explicite : "Solde insuffisant" ou similaire.
- La réservation est refusée.

**Status**
- [x] Passed
- [ ] Failed

---

## Historique

### 18. Affichage de l'historique des réservations
**Steps**
1. Aller sur `/student/historique`.

**Expected**
- La liste des réservations passées et futures de l'étudiant s'affiche correctement sous forme de tableau ou de liste de cartes.

**Status**
- [x] Passed
- [ ] Failed

---

### 19. Visibilité des statuts
**Steps**
1. Examiner les éléments de l'historique.

**Expected**
- Chaque réservation affiche clairement son statut :
  - `RESERVEE` (réservation active à venir)
  - `VALIDEE` (consommée/scannée au RU)
  - `ANNULEE` (annulée par l'étudiant)
- Les statuts sont visuellement distincts (couleurs différentes, badges).

**Status**
- [x] Passed
- [ ] Failed

---

### 20. Condition d'affichage du bouton Annuler
**Steps**
1. Consulter les réservations à venir (annulables) et passées/consommées (non annulables).

**Expected**
- Le bouton "Annuler" s'affiche uniquement sur les réservations éligibles à l'annulation (ex: réservations futures et dans le délai autorisé).
- Le bouton n'apparaît pas pour les réservations passées, déjà validées ou déjà annulées.

**Status**
- [x] Passed
- [ ] Failed

---

### 21. Annulation valide (Mise à jour)
**Steps**
1. Trouver une réservation active et annulable.
2. Cliquer sur le bouton "Annuler".
3. Confirmer l'annulation si une boîte de dialogue s'affiche.

**Expected**
- L'annulation est traitée avec succès.
- Le statut passe immédiatement à `ANNULEE` dans l'interface.
- Le solde étudiant est recrédité (si applicable selon les règles de gestion).
- Un message de confirmation s'affiche.

**Status**
- [x] Passed
- [ ] Failed

---

### 22. Annulation hors délai (Erreur)
**Steps**
1. Tenter d'annuler une réservation en dehors du délai autorisé (ex: après l'heure limite du repas de la journée).

**Expected**
- L'annulation est refusée.
- Un message d'erreur clair s'affiche indiquant que le délai d'annulation est dépassé.

**Status**
- [x] Passed
- [ ] Failed

---

## QR Code

### 23. Affichage du QR Code
**Steps**
1. Aller sur `/student/qrcode`.

**Expected**
- Le QR Code personnel de l'étudiant est généré et s'affiche à l'écran.

**Status**
- [x] Passed
- [ ] Failed

---

### 24. Visibilité des informations étudiant
**Steps**
1. Consulter la page `/student/qrcode`.

**Expected**
- Les informations clés de l'étudiant (Nom, Prénom, Code Apogée, etc.) sont affichées à côté ou sous le QR Code pour vérification visuelle.

**Status**
- [x] Passed
- [ ] Failed

---

### 25. Téléchargement du QR Code
**Steps**
1. Cliquer sur le bouton de téléchargement du QR Code (ex: "Télécharger" ou icône de téléchargement).

**Expected**
- Un fichier image (PNG/JPEG) ou PDF contenant le QR Code et les informations est téléchargé sur l'appareil de l'utilisateur.

**Status**
- [x] Passed
- [ ] Failed

---

### 26. Erreur API (Gestion d'erreur)
**Steps**
1. Simuler une panne du serveur (ex: couper temporairement le backend ou bloquer la requête réseau vers `/api/student/qrcode`).
2. Charger la page `/student/qrcode`.

**Expected**
- L'application ne crash pas.
- Un message d'erreur explicite est affiché à l'utilisateur (ex: "Impossible de charger le QR Code, veuillez réessayer").

**Status**
- [x] Passed
- [ ] Failed

---

## Responsive

### 27. Affichage Desktop
**Steps**
1. Accéder à l'espace étudiant sur un grand écran (Desktop, résolution >= 1024px).

**Expected**
- La mise en page (layout) est propre, harmonieuse et alignée.
- Pas de texte tronqué ou d'éléments disproportionnés.

**Status**
- [x] Passed
- [ ] Failed

---

### 28. Affichage Mobile
**Steps**
1. Activer le mode responsive ou charger la page sur un appareil mobile (résolution <= 768px).
2. Parcourir toutes les pages de l'espace étudiant (Dashboard, Réservation, Historique, QR Code).

**Expected**
- Les pages s'adaptent parfaitement à l'écran mobile.
- Pas d'overflow horizontal (pas de barre de défilement horizontale).
- Les boutons et formulaires sont faciles à cliquer et utiliser au doigt.

**Status**
- [x] Passed
- [ ] Failed

---

### 29. Navigation fonctionnelle
**Steps**
1. Utiliser le menu de navigation (ex: barre de navigation mobile ou menu latéral/hamburger) sur mobile pour basculer entre les pages.

**Expected**
- La navigation s'ouvre, se ferme et redirige vers les bonnes pages sans encombre.

**Status**
- [x] Passed
- [ ] Failed

---

# Final Validation

- [x] La checklist couvre l'ensemble des fonctionnalités clés de l'espace étudiant
- [x] Les cas nominaux de réservation et d'accès sont définis
- [x] Les cas d'erreur (double réservation, solde insuffisant, hors délai, etc.) sont inclus
- [x] Les aspects de sécurité et protection des routes sont vérifiés
- [x] Le comportement responsive sur mobile et desktop est intégré
- [x] Le format du fichier est prêt pour le suivi et l'exécution
