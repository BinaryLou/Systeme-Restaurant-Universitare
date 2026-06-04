# 🚀 RU Digital --- Plan Complet Backend (Binôme)

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

# 🏁 Sprint 1 — Authentification

## Couvre

BF-01, BF-02

## Backend

- Login étudiant (Apogée + mot de passe)
- JWT access + refresh
- Middleware `verifyJwt`
- Middleware `requireRole`
- Gestion session

------------------------------------------------------------------------

# 🏁 Sprint 2 — Services (Admin)

## Couvre

BF-13

## Backend

- CRUD services (déjeuner / dîner)
- Validation horaires
- Middleware ADMIN

------------------------------------------------------------------------

# 🏁 Sprint 3 — Réservation + Solde 🔥 (CORE)

## Couvre

BF-06, BF-07, BF-08, BF-09, BF-10

## Backend

- Création de réservation
- Vérification règles métier :
  - Réservation entre J et J+30
  - Fermeture des réservations 12h avant service
  - Anti double réservation
  - Vérification solde suffisant

- Décrémentation du solde
- Historique des réservations
- Annulation (H-4)

## API

- POST `/api/reservations`
- GET `/api/reservations`
- PATCH `/api/reservations/:id/cancel`

------------------------------------------------------------------------

# 🏁 Sprint 4 — QR Code & Scan 🔥 (CORE)

## Couvre

BF-11, BF-12, BF-03

## Backend

- Génération QR code utilisateur
- Endpoint scan QR
- Vérifications :
  - Réservation du jour
  - Correspondance service
  - Statut non utilisé

- Mise à jour statut → UTILISEE
- Anti double scan
- Middleware PIN pour personnel

------------------------------------------------------------------------

# 🏁 Sprint 5 — Sécurité & Password

## Couvre

BF-04, BF-05

## Backend

- Forgot password
- Reset password
- Change password
- Hash mot de passe (bcrypt)
- Helmet
- CORS
- Rate limiting

------------------------------------------------------------------------

# 🏁 Sprint 6 — Tests & Optimisation 🔥

## Objectif

Stabiliser et sécuriser le projet.

## Backend

- Tests Postman sur tous les endpoints
- Tests cas limites :
  - Double réservation
  - Solde insuffisant
  - Dates invalides
  - Accès sans token

- Vérification transactions SQL
- Optimisation requêtes SQL
- Logs et gestion erreurs propres

------------------------------------------------------------------------

# 🏁 Sprint 7 — Menus (Admin)

## Couvre

BF-14

## Backend

- CRUD menus
- Validation :
  - Unicité (date + service)

- Liaison avec services

------------------------------------------------------------------------

# 🏁 Sprint 8 — Statistiques

## Couvre

BF-15

## Backend

- Nombre de réservations
- Taux de no-show
- Agrégation (jour / semaine / mois)
- Export (optionnel)

------------------------------------------------------------------------

# 🏁 Sprint 9 — Documentation & Préparation Soutenance

## Objectif

Finaliser et présenter le projet.

## Backend

- README propre
- Documentation API
- Explication architecture
- Checklist Postman
- Exemples de requêtes/réponses

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
