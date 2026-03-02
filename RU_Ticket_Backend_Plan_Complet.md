# 🚀 RU Ticket --- Plan Complet Backend (Binôme)

------------------------------------------------------------------------

# 1️⃣ Vision du Projet

Construire un backend professionnel, sécurisé et robuste pour le système
de réservation du Restaurant Universitaire (RU), incluant :

-   Authentification sécurisée (JWT + Refresh)
-   Gestion des réservations (J..J+30)
-   Gestion du solde virtuel (600 DH)
-   QR code permanent
-   Validation scan anti-fraude
-   Architecture propre et scalable
-   Workflow Git professionnel
-   Organisation Scrum par sprints

------------------------------------------------------------------------

# 2️⃣ Organisation de l'Équipe

## 👨‍💻 Personne A --- Lead Infrastructure & Sécurité

Responsable de : - Architecture backend - Middlewares (auth, RBAC,
validation) - JWT access & refresh - Cookies httpOnly - CORS, Helmet,
Rate limiting - Standardisation réponses API - Tests auth et
middleware - Documentation API

------------------------------------------------------------------------

## 👨‍💻 Personne B --- Lead Base de Données & Logique Métier

Responsable de : - Schéma MySQL + contraintes + index - Transactions SQL
critiques - Règles métier (dates, délais, anti doublon) - Gestion
solde - Logique scan QR - Optimisation requêtes - Tests réservation et
scan

------------------------------------------------------------------------

# 3️⃣ Méthodologie de Travail (Scrum)

-   Sprint = 1 semaine
-   Daily meeting = 10 minutes
-   Planning Sprint = 30 minutes
-   Review + Rétrospective = 30 minutes

------------------------------------------------------------------------

# 4️⃣ Workflow Git Professionnel

## Branches

-   main → production stable
-   develop → intégration
-   feature/\* → nouvelles fonctionnalités
-   hotfix/\* → corrections urgentes

## Règles

-   Pas de commit direct sur main
-   Pas de commit direct sur develop
-   1 Issue = 1 branche
-   Pull Request obligatoire
-   Code review obligatoire

## Convention des commits

-   feat: nouvelle fonctionnalité
-   fix: correction
-   refactor: amélioration interne
-   docs: documentation
-   chore: configuration

------------------------------------------------------------------------

# 5️⃣ Standard des Réponses API

## Succès

{ "status": "success", "data": {}, "message": "Opération réussie" }

## Erreur

{ "status": "error", "message": "Message d'erreur clair" }

------------------------------------------------------------------------

# 6️⃣ Definition of Done (DoD)

Une tâche est terminée si :

-   Code propre et lisible
-   Validation implémentée
-   Gestion erreurs correcte
-   Test manuel effectué
-   Pull Request reviewée et mergée
-   Issue fermée

------------------------------------------------------------------------

# 7️⃣ Plan des Sprints

------------------------------------------------------------------------

# 🏁 Sprint 0 --- Foundation (2 jours)

## Objectif

Mettre en place base technique solide.

### Personne A

-   Initialisation Express
-   Structure modulaire
-   Middleware erreur
-   Logger
-   Route /health
-   Config .env

### Personne B

-   Création base MySQL
-   Tables + contraintes UNIQUE
-   Clés étrangères
-   Seeds étudiants (solde 600)
-   Tests contraintes

------------------------------------------------------------------------

# 🏁 Sprint 1 --- Authentification

### Personne A

-   JWT access + refresh
-   Middleware auth
-   Middleware RBAC
-   Logout
-   Standardisation réponses

### Personne B

-   Table refresh tokens
-   Gestion expiration
-   Login admin
-   Tests auth

------------------------------------------------------------------------

# 🏁 Sprint 2 --- Services (Admin)

### Personne A

-   Middleware ADMIN
-   Validation horaires

### Personne B

-   CRUD services
-   Tests DB

------------------------------------------------------------------------

# 🏁 Sprint 3 --- Réservation + Solde

### Personne A

-   Validation J..J+30
-   Validation fermeture 12h
-   Controllers
-   Gestion erreurs métier

### Personne B

-   Transaction SQL
-   SELECT FOR UPDATE
-   INSERT réservation
-   UPDATE solde
-   Gestion ER_DUP_ENTRY
-   Historique réservations

------------------------------------------------------------------------

# 🏁 Sprint 4 --- QR & Scan

### Personne A

-   Génération QR
-   Middleware PIN
-   Rate limit scan

### Personne B

-   Validation réservation jour
-   Vérification service
-   Update statut UTILISEE
-   Anti double scan

------------------------------------------------------------------------

# 🏁 Sprint 5 --- Sécurité & Password

### Personne A

-   Forgot password
-   Change password
-   Helmet + CORS

### Personne B

-   Reset password
-   Expiration token
-   Tests sécurité

------------------------------------------------------------------------

# 🏁 Sprint 6 --- Tests & Optimisation

### Personne A

-   Tests auth
-   Documentation API

### Personne B

-   Tests transactions
-   Optimisation requêtes

------------------------------------------------------------------------

# 8️⃣ Pair Programming (Sprint critique)

Méthode Driver / Navigator :

Driver → écrit le code\
Navigator → analyse, détecte failles, pose questions

Inversion des rôles toutes les 30-45 minutes.

------------------------------------------------------------------------

# 9️⃣ Checklist Sécurité Finale

-   Mots de passe hashés
-   JWT expirent
-   Cookies httpOnly
-   Rate limit login & scan
-   Validation input partout
-   Transactions pour opérations critiques

------------------------------------------------------------------------

# 🔟 Objectif Final

À la fin du projet :

-   Backend stable
-   Transactions solides
-   Anti fraude QR
-   Architecture propre
-   Historique Git professionnel
-   Projet prêt pour stage

------------------------------------------------------------------------

Fin du document.
