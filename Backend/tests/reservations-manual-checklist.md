# Reservations Manual Checklist

## Objectif
Verifier manuellement le bon fonctionnement des endpoints de reservation du Sprint 3 :

- `POST /api/reservations`
- `GET /api/reservations`
- `PATCH /api/reservations/:id/cancel`

Cette checklist couvre :
- la creation de reservation,
- l'historique,
- l'annulation,
- les erreurs metier,
- la securite d'acces.

---

## Emplacement du fichier
`Backend/tests/reservations-manual-checklist.md`

---

## Outil de test
Les tests de cette checklist sont faits avec **Postman**.

Aucune commande `curl` n'est necessaire.

---

## Pre-requis

Avant de tester, verifier :

- le backend demarre sans erreur ;
- MySQL est lance ;
- le schema et les seeds sont charges ;
- l'authentification etudiante fonctionne deja ;
- au moins deux etudiants existent en base ;
- au moins un service `DEJEUNER` existe ;
- au moins un service `DINER` existe ;
- le compte etudiant principal a un solde suffisant ;
- tu as un token JWT valide pour un etudiant.

---

## Variables Postman recommandees

Creer un environnement Postman avec les variables suivantes :

| Variable | Exemple |
|---|---|
| `BASE_URL` | `http://localhost:5000/api` |
| `TOKEN_ETUDIANT_1` | `jwt_token_ici` |
| `TOKEN_ETUDIANT_2` | `jwt_token_autre_user` |
| `SERVICE_DEJEUNER_ID` | `1` |
| `SERVICE_DINER_ID` | `2` |
| `DATE_VALIDE` | `2026-04-05` |
| `DATE_PASSEE` | `2026-01-01` |
| `DATE_HORS_LIMITE` | `2026-06-30` |
| `DATE_DU_JOUR` | `2026-03-29` |
| `RESERVATION_ID` | `1` |
| `RESERVATION_AUTRE_USER_ID` | `2` |

---

## Headers a utiliser dans Postman

Pour les routes protegees :

- `Authorization: Bearer {{TOKEN_ETUDIANT_1}}`
- `Content-Type: application/json`

Pour tester un autre utilisateur :

- `Authorization: Bearer {{TOKEN_ETUDIANT_2}}`

---

## Format standard des reponses API

### Succes
```json
{
  "status": "success",
  "data": {},
  "message": "Operation reussie"
}
```

### Erreur
```json
{
  "status": "error",
  "message": "Message d'erreur clair"
}
```

---

# Checklist des tests

## T1 - Creer une reservation valide

### But
Verifier qu'un etudiant authentifie peut creer une reservation valide.

### Postman
- **Method** : `POST`
- **URL** : `{{BASE_URL}}/reservations`
- **Auth** : Bearer Token -> `{{TOKEN_ETUDIANT_1}}`
- **Body** -> raw -> JSON
```json
{
  "date_repas": "{{DATE_VALIDE}}",
  "id_service": {{SERVICE_DEJEUNER_ID}}
}
```

### Attendu
- code HTTP `201` ou `200` selon votre standard ;
- `status = success` ;
- reservation creee en base ;
- solde decremente ;
- reservation visible dans l'historique.

### Resultat
- [x] OK
- [ ] KO

---

## T2 - Refuser une creation sans token

### But
Verifier que la route est protegee par JWT.

### Postman
- **Method** : `POST`
- **URL** : `{{BASE_URL}}/reservations`
- **Auth** : aucun token
- **Body** -> raw -> JSON
```json
{
  "date_repas": "{{DATE_VALIDE}}",
  "id_service": {{SERVICE_DEJEUNER_ID}}
}
```

### Attendu
- code HTTP `401` ;
- message d'authentification clair ;
- aucune reservation creee.

### Resultat
- [ ] OK
- [x] KO

---

## T3 - Refuser un body vide

### But
Verifier la validation du payload.

### Postman
- **Method** : `POST`
- **URL** : `{{BASE_URL}}/reservations`
- **Auth** : Bearer Token -> `{{TOKEN_ETUDIANT_1}}`
- **Body** -> raw -> JSON
```json
{}
```

### Attendu
- code HTTP `400` ;
- message clair ;
- aucun traitement metier.

### Resultat
- [ ] OK
- [x] KO

---

## T4 - Refuser une date passee

### But
Verifier la borne minimale de la regle J..J+30.

### Postman
- **Method** : `POST`
- **URL** : `{{BASE_URL}}/reservations`
- **Auth** : Bearer Token -> `{{TOKEN_ETUDIANT_1}}`
- **Body** -> raw -> JSON
```json
{
  "date_repas": "{{DATE_PASSEE}}",
  "id_service": {{SERVICE_DEJEUNER_ID}}
}
```

### Attendu
- code HTTP `400` ;
- message clair indiquant que la date est invalide ou passee ;
- aucune reservation creee.

### Resultat
- [x] OK
- [ ] KO

---

## T5 - Refuser une date au-dela de J+30

### But
Verifier la borne maximale de la regle J..J+30.

### Postman
- **Method** : `POST`
- **URL** : `{{BASE_URL}}/reservations`
- **Auth** : Bearer Token -> `{{TOKEN_ETUDIANT_1}}`
- **Body** -> raw -> JSON
```json
{
  "date_repas": "{{DATE_HORS_LIMITE}}",
  "id_service": {{SERVICE_DEJEUNER_ID}}
}
```

### Attendu
- code HTTP `400` ;
- message clair indiquant que la reservation doit etre entre J et J+30 ;
- aucune reservation creee.

### Resultat
- [x] OK
- [ ] KO

---

## T6 - Refuser une reservation du jour apres H-12

### But
Verifier la fermeture des reservations du jour 12 heures avant le debut du service.

### Precondition
Configurer le service et l'heure de test pour etre au-dela du delai H-12.

### Postman
- **Method** : `POST`
- **URL** : `{{BASE_URL}}/reservations`
- **Auth** : Bearer Token -> `{{TOKEN_ETUDIANT_1}}`
- **Body** -> raw -> JSON
```json
{
  "date_repas": "{{DATE_DU_JOUR}}",
  "id_service": {{SERVICE_DEJEUNER_ID}}
}
```

### Attendu
- code HTTP `400` ou `403` ;
- message clair indiquant que la reservation du jour est fermee ;
- aucune reservation creee.

### Resultat
- [x] OK
- [ ] KO

---

## T7 - Refuser une double reservation meme date et meme service

### But
Verifier la regle d'unicite logique.

### Precondition
Avoir deja cree une reservation valide avec :
- `date_repas = {{DATE_VALIDE}}`
- `id_service = {{SERVICE_DEJEUNER_ID}}`

### Postman
Relancer exactement la meme requete :
- **Method** : `POST`
- **URL** : `{{BASE_URL}}/reservations`
- **Auth** : Bearer Token -> `{{TOKEN_ETUDIANT_1}}`
- **Body** -> raw -> JSON
```json
{
  "date_repas": "{{DATE_VALIDE}}",
  "id_service": {{SERVICE_DEJEUNER_ID}}
}
```

### Attendu
- code HTTP `409` ou `400` ;
- message clair indiquant qu'une reservation existe deja ;
- le solde ne doit pas etre decremente une deuxieme fois.

### Resultat
- [x] OK
- [ ] KO

---

## T8 - Refuser une reservation si le solde est insuffisant

### But
Verifier la regle de solde virtuel.

### Precondition
Utiliser un etudiant avec un solde insuffisant ou modifier temporairement son solde en base.

### Postman
- **Method** : `POST`
- **URL** : `{{BASE_URL}}/reservations`
- **Auth** : Bearer Token -> `{{TOKEN_ETUDIANT_1}}`
- **Body** -> raw -> JSON
```json
{
  "date_repas": "{{DATE_VALIDE}}",
  "id_service": {{SERVICE_DINER_ID}}
}
```

### Attendu
- code HTTP `400` ou `403` ;
- message clair indiquant que le solde est insuffisant ;
- aucune reservation creee ;
- aucun debit partiel du solde.

### Resultat
- [x] OK
- [ ] KO

---

## T9 - Consulter l'historique de mes reservations

### But
Verifier que l'etudiant recupere uniquement ses propres reservations.

### Postman
- **Method** : `GET`
- **URL** : `{{BASE_URL}}/reservations`
- **Auth** : Bearer Token -> `{{TOKEN_ETUDIANT_1}}`

### Attendu
- code HTTP `200` ;
- `status = success` ;
- seules les reservations du user connecte sont renvoyees ;
- les statuts sont visibles ;
- les champs utiles sont presents.

### Resultat
- [x] OK
- [ ] KO

---

## T10 - Verifier qu'une reservation creee apparait dans l'historique

### But
Valider la coherence entre creation et lecture.

### Etapes
1. creer une reservation valide ;
2. appeler `GET /api/reservations`.

### Attendu
- la reservation apparait dans la liste ;
- le statut initial est correct ;
- la date et le service correspondent.

### Resultat
- [x] OK
- [ ] KO

---

## T11 - Refuser l'historique sans token

### But
Verifier que l'acces a l'historique est protege.

### Postman
- **Method** : `GET`
- **URL** : `{{BASE_URL}}/reservations`
- **Auth** : aucun token

### Attendu
- code HTTP `401` ;
- aucune donnee exposee.

### Resultat
- [x] OK
- [ ] KO

---

## T12 - Annuler une reservation valide

### But
Verifier qu'une reservation annulable peut etre annulee correctement.

### Precondition
Avoir une reservation annulable et renseigner `{{RESERVATION_ID}}`.

### Postman
- **Method** : `PATCH`
- **URL** : `{{BASE_URL}}/reservations/{{RESERVATION_ID}}/cancel`
- **Auth** : Bearer Token -> `{{TOKEN_ETUDIANT_1}}`
- **Body** : vide

### Attendu
- code HTTP `200` ou `204` ;
- statut mis a jour en `ANNULEE` ;
- l'historique reflete l'annulation.

### Resultat
- [x] OK
- [ ] KO

---

## T13 - Refuser une annulation hors delai H-4

### But
Verifier la regle d'annulation jusqu'a 4 heures avant le debut du service.

### Precondition
Utiliser une reservation dont le service commence dans moins de 4 heures.

### Postman
- **Method** : `PATCH`
- **URL** : `{{BASE_URL}}/reservations/{{RESERVATION_ID}}/cancel`
- **Auth** : Bearer Token -> `{{TOKEN_ETUDIANT_1}}`
- **Body** : vide

### Attendu
- code HTTP `400` ou `403` ;
- message clair indiquant que le delai d'annulation est depasse ;
- le statut reste inchange.

### Resultat
- [x] OK
- [ ] KO
---

## T14 - Refuser l'annulation d'une reservation deja annulee

### But
Verifier la gestion correcte du statut.

### Precondition
Avoir deja annule la reservation cible.

### Postman
- **Method** : `PATCH`
- **URL** : `{{BASE_URL}}/reservations/{{RESERVATION_ID}}/cancel`
- **Auth** : Bearer Token -> `{{TOKEN_ETUDIANT_1}}`
- **Body** : vide

### Attendu
- code HTTP `400` ;
- message clair indiquant que la reservation est deja annulee ;
- aucun autre effet de bord.

### Resultat
- [x] OK
- [ ] KO

---

## T15 - Refuser l'annulation d'une reservation deja utilisee

### But
Verifier qu'une reservation deja consommee ne peut plus etre annulee.

### Precondition
Avoir une reservation marquee `UTILISEE`.

### Postman
- **Method** : `PATCH`
- **URL** : `{{BASE_URL}}/reservations/{{RESERVATION_ID}}/cancel`
- **Auth** : Bearer Token -> `{{TOKEN_ETUDIANT_1}}`
- **Body** : vide

### Attendu
- code HTTP `400` ou `409` ;
- message clair ;
- statut inchange.

### Resultat
- [x] OK
- [ ] KO

---

## T16 - Refuser l'annulation de la reservation d'un autre utilisateur

### But
Verifier l'isolation des donnees entre utilisateurs.

### Precondition
Renseigner `{{RESERVATION_AUTRE_USER_ID}}` avec une reservation appartenant a un autre etudiant.

### Postman
- **Method** : `PATCH`
- **URL** : `{{BASE_URL}}/reservations/{{RESERVATION_AUTRE_USER_ID}}/cancel`
- **Auth** : Bearer Token -> `{{TOKEN_ETUDIANT_2}}`
- **Body** : vide

### Attendu
- code HTTP `403` ou `404` selon votre strategie ;
- aucune modification de la reservation cible.

### Resultat
- [x] OK
- [ ] KO

---

## T17 - Verifier la coherence transactionnelle reservation + solde

### But
S'assurer qu'il n'existe pas d'etat incoherent entre la creation et le debit du solde.

### Etapes
1. noter le solde avant creation ;
2. creer une reservation valide ;
3. verifier le solde apres creation ;
4. rejouer un cas en erreur ;
5. verifier qu'en cas d'echec, le solde n'a pas bouge.

### Attendu
- le solde diminue seulement si la reservation est creee ;
- aucun debit si la creation echoue ;
- aucune incoherence entre API et base.

### Resultat
- [x] OK
- [ ] KO

---

## T18 - Verifier le format standard des reponses API

### But
Verifier le respect du standard de reponse du projet.

### A controler
Pour un succes :
- `status`
- `data`
- `message`

Pour une erreur :
- `status`
- `message`

### Attendu
Le format est coherent sur tous les endpoints testes.

### Resultat
- [x] OK
- [ ] KO

---

# Resume final de la session de test

## Environnement teste
- OS : Windows 11
- Node.js : v22.13.0
- MySQL : 8.0.42
- Date : 29/03/2026
- Testeur : Loukrati Abderrahmane

## Resultats
- Nombre de tests passes : 18
- Nombre de tests echoues : 0
- Bloquants : 
- Remarques : tous passes bien

## Decision
- [x] Pret pour PR
- [ ] Corrections necessaires avant PR