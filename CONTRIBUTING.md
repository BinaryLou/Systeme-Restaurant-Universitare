# 🤝 Guide de Contribution — RU Digital Backend

Bienvenue dans le projet RU Digital Backend.

Ce document définit les règles de collaboration, les standards de code et le workflow de l’équipe.

L’objectif est de garantir une organisation professionnelle et un code maintenable.

---

# 📌 1. Stratégie de Branches

Nous utilisons la structure suivante :

- `main` → Code prêt pour production
- `develop` → Branche d’intégration
- `feature/*` → Nouvelles fonctionnalités
- `hotfix/*` → Corrections urgentes

⚠️ Les commits directs sur `main` sont interdits.

Toujours créer une branche à partir de `develop`.

Exemple :

git checkout develop  
git pull  
git checkout -b feature/reservation-transaction  

---

# 📌 2. Convention des Commits

Tous les commits doivent suivre cette structure :

- feat: nouvelle fonctionnalité
- fix: correction de bug
- refactor: amélioration du code
- docs: documentation
- chore: configuration ou maintenance

Exemples :

feat: implémentation de l'authentification JWT  
fix: empêcher la double réservation  
refactor: nettoyage du middleware d'erreur  

Éviter les messages vagues comme :

update  
changes  
fix bug  

---

# 📌 3. Règles des Pull Requests

Toute fonctionnalité doit passer par une Pull Request.

Étapes :

1. Pousser la branche feature
2. Créer une Pull Request vers `develop`
3. Décrire clairement :
   - Ce qui a été implémenté
   - Comment tester
4. Assigner un reviewer
5. Fusionner uniquement après validation

Exemple de description :

## 🎯 Ce qui a été implémenté :
- Transaction SQL pour réservation
- Décrémentation du solde
- Gestion contrainte UNIQUE

## 🧪 Comment tester :
1. Se connecter
2. Créer une réservation
3. Tester une réservation en double

---

# 📌 4. Checklist de Code Review

Avant d'approuver une PR, vérifier :

- Lisibilité du code
- Gestion correcte des erreurs
- Validation des entrées
- Respect des règles de sécurité
- Absence de duplication
- Codes HTTP corrects

---

# 📌 5. Standard des Réponses API

Toutes les réponses doivent respecter ce format :

Succès :

{
  "status": "success",
  "data": {},
  "message": "Opération réussie"
}

Erreur :

{
  "status": "error",
  "message": "Message d'erreur"
}

---

# 📌 6. Règles Base de Données

- Toujours utiliser des requêtes paramétrées
- Utiliser des transactions pour les opérations critiques
- Ne jamais exposer les champs sensibles
- Respecter les contraintes UNIQUE
- Gérer les erreurs SQL proprement

---

# 📌 7. Sécurité Obligatoire

- Les mots de passe doivent être hashés (bcrypt)
- Les tokens JWT doivent expirer
- Utiliser des cookies httpOnly
- Valider toutes les entrées utilisateur
- Appliquer un rate limiting sur les routes sensibles

---

# 📌 8. Workflow des Issues

Chaque tâche doit :

- Être créée sous forme d’Issue GitHub
- Être assignée à un membre
- Contenir des critères d’acceptation clairs
- Être liée à une Pull Request

Dans la PR, ajouter :

Closes #NuméroIssue

---

# 📌 9. Politique de Test

Avant de merger :

- Tester localement
- Tester les cas limites
- Tester les erreurs
- Tester les opérations en double
- Vérifier les règles métier

---

# 📌 10. Professionnalisme

- Commits clairs et propres
- PR de petite taille
- Communication des blocages
- Respect des délais

---

🎯 Objectif : Construire un projet robuste, sécurisé et professionnel.
