<div align="center">
  <img src="./Frontend/src/assets/logo-ru.png" alt="RU Ticket Logo" width="200"/>
  
  # 🎓 RU Ticket - Système Restaurant Universitaire
  
  **Une solution complète, moderne et sécurisée pour la gestion des repas universitaires.**
  
  [![React](https://img.shields.io/badge/Frontend-React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
  [![TailwindCSS](https://img.shields.io/badge/Style-Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  [![NodeJS](https://img.shields.io/badge/Backend-Node.js_22-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
  [![Express](https://img.shields.io/badge/API-Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
  [![MySQL](https://img.shields.io/badge/Database-MySQL_8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
  [![Docker](https://img.shields.io/badge/Deployment-Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

</div>

---

## 📖 À propos du projet

**RU Ticket** est une plateforme intégrée conçue pour simplifier la vie des étudiants et du personnel des restaurants universitaires. L'application permet la réservation de repas, la gestion des soldes, et le contrôle d'accès fluide via un système de QR Code sécurisé.

### ✨ Fonctionnalités principales

- 🔐 **Authentification sécurisée** : Système JWT avec Refresh Tokens et mots de passe chiffrés.
- 📱 **QR Code anti-fraude** : Chaque étudiant dispose d'un QR code permanent pour un accès rapide.
- 📅 **Gestion des réservations** : Réservation anticipée de J à J+30 avec annulation possible.
- 💳 **Portefeuille Virtuel** : Solde en ligne mis à jour en temps réel à chaque transaction.
- 📊 **Tableau de bord Admin** : Gestion des menus, services et analyse des statistiques.
- 🛠 **Scanner Personnel** : Interface dédiée au personnel pour le scan des accès (protégée par PIN).

---

## 🏗 Architecture du projet

Le projet est divisé en trois microservices conteneurisés pour assurer modularité et scalabilité :

```text
📦 Systeme-Restaurant-Universitare
 ┣ 📂 Backend/         # API Node.js / Express
 ┣ 📂 Frontend/        # SPA React / Vite / Tailwind
 ┣ 📂 Database/        # Scripts d'initialisation (Schéma et Seeds)
 ┣ 📜 docker-compose.yml # Orchestration des conteneurs
 ┗ 📜 README.md
```

---

## 🚀 Guide d'installation rapide (via Docker)

Pour garantir une intégration parfaite et éviter tout problème de versionnage (Node, bases de données, etc.), le projet est **entièrement conteneurisé** via Docker.

### 📋 Prérequis
- [Docker](https://www.docker.com/products/docker-desktop/) installé sur votre machine.
- [Docker Compose](https://docs.docker.com/compose/install/) (généralement inclus avec Docker Desktop).

### ⚙️ Lancement en 3 étapes

1. **Cloner le dépôt et se placer à la racine :**
   ```bash
   # Naviguer à la racine du projet
   cd Systeme-Restaurant-Universitare
   ```

2. **(Optionnel) Nettoyage des anciens volumes :**
   Si vous avez déjà lancé la base de données par le passé et souhaitez repartir sur une base propre avec les données de test (seeds), exécutez d'abord :
   ```bash
   docker compose down -v
   ```

3. **Construire et lancer l'application :**
   Lancez la construction et le démarrage de tous les services en mode détaché :
   ```bash
   docker compose up -d --build
   ```

### 🌐 Accès aux services

Une fois les conteneurs démarrés, vos services seront accessibles aux adresses suivantes :
- 🖥️ **Frontend (Application Web) :** [http://localhost:3000](http://localhost:3000)
- 🔌 **Backend (API Rest) :** [http://localhost:5000](http://localhost:5000)
- 🗄️ **Base de données (MySQL) :** `localhost:3307` *(identifiant: `ru_user`, mot de passe: `rupassword`)*

---

## 📚 Documentation Technique

Pour faciliter l'intégration et la maintenance, une documentation détaillée est à votre disposition dans le dossier `Backend/docs/` :

- 🔗 **Endpoints et Formats :** [api-documentation.md](./Backend/docs/api-documentation.md)  
  *Contient la liste complète des routes API, les formats exacts de requêtes (Body) et de réponses JSON attendus.*
  
- 📜 **Règles métier & Authentification :** [auth-business-rules.md](./Backend/docs/auth-business-rules.md)  
  *Détaille les rôles (`USER`, `ADMIN`, `SCAN`), la gestion des JWT / Cookies, et les règles strictes (horaires de réservation, annulations, etc).*

---

<div align="center">
  <sub>Fait avec ❤️ par l'équipe de développement. Bon appétit ! 🍲</sub>
</div>