# FasCine — API REST Cinéma

API RESTful de gestion d'un cinéma : authentification, utilisateurs, salles, films, séances, tickets et portefeuille.

---

## Application publique

> **URL de base :** `https://fascines.ohmushi.cat`

| Ressource | URL |
|---|---|
| Health check | `https://fascines.ohmushi.cat/health` |
| Documentation Swagger | `https://fascines.ohmushi.cat/docs` |

### Accéder au Swagger

1. Ouvrir `https://fascines.ohmushi.cat/docs` dans un navigateur.
2. Créer un compte via **`POST /api/auth/register`**.
3. Se connecter via **`POST /api/auth/login`** — récupérer le champ `accessToken` dans la réponse.
4. Cliquer sur le bouton **Authorize** (cadenas en haut à droite du Swagger).
5. Coller le token dans le champ `bearerAuth` et valider.
6. Toutes les routes protégées sont maintenant accessibles depuis l'interface.

> Pour accéder aux routes ADMIN ou SUPER_ADMIN, un SUPER_ADMIN doit d'abord changer votre rôle via `PATCH /api/users/:id/role`.

---

## Stack technique

| Outil | Rôle |
|---|---|
| **Node.js 20 + TypeScript** | Runtime et typage |
| **Express 5** | Framework HTTP |
| **TypeORM** | ORM |
| **PostgreSQL 16** | Base de données |
| **JWT** | Auth stateful (access token 5min + refresh token 7j) |
| **Joi** | Validation des données entrantes |
| **Swagger / OpenAPI 3** | Documentation interactive |
| **Docker** | Conteneurisation (dev + prod) |

---

## Lancer le projet en local

### Prérequis

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installé et démarré

### Installation

**1. Cloner le dépôt**

```bash
git clone <url-du-repo>
cd FasCines
```

**2. Créer le fichier d'environnement**

```bash
cp .env.example .env
```

**3. Remplir le `.env`**

```env
NODE_ENV=development

DB_HOST=db
DB_PORT=5432
DB_USER=fascine
DB_PASSWORD=fascine
DB_NAME=fascine_db

JWT_SECRET=une_chaine_secrete_longue
JWT_REFRESH_SECRET=une_autre_chaine_secrete_longue
JWT_ACCESS_EXPIRES_IN=5m
JWT_REFRESH_EXPIRES_IN=7d

PORT=3000
```

**4. Démarrer les conteneurs**

```bash
docker-compose up --build
```

L'API est disponible sur `http://localhost:3000`.  
La documentation Swagger est disponible sur `http://localhost:3000/docs`.

**5. Vérifier que ça tourne**

```bash
curl http://localhost:3000/health
# → { "status": "ok" }
```

---

## Export des données (SQL)

Exporter la base depuis le conteneur Docker en local :

```bash
docker-compose exec db pg_dump -U fascine fascine_db > export.sql
```

Restaurer un export dans un conteneur existant :

```bash
cat export.sql | docker-compose exec -T db psql -U fascine -d fascine_db
```

---

## Ce qui est fait / pas fait

### Authentification
- [x] Inscription (`POST /api/auth/register`)
- [x] Connexion (`POST /api/auth/login`)
- [x] Déconnexion session courante (`POST /api/auth/logout`)
- [x] Déconnexion toutes les sessions (`POST /api/auth/logout-all`)
- [x] Rafraîchissement du token (`POST /api/auth/refresh`)
- [x] Access token stateful — durée de vie 5 minutes
- [x] Refresh token — durée de vie 7 jours
- [x] Toutes les routes API sont protégées (hors routes auth)

### Utilisateurs
- [x] Voir son profil (`GET /api/users/me`)
- [x] Modifier son profil (`PATCH /api/users/me`)
- [x] Admin : lister les utilisateurs (`GET /api/users`)
- [x] Admin : voir un utilisateur (`GET /api/users/:id`)
- [x] Admin : supprimer un utilisateur (`DELETE /api/users/:id`)
- [x] Super Admin : changer le rôle d'un utilisateur (`PATCH /api/users/:id/role`)
- [ ] Admin : voir l'activité d'un utilisateur (films vus, séances assistées)

### Salles
- [x] CRUD complet (admin pour les mutations)
- [x] Champs : nom, description, capacité, accès handicapé, maintenance
- [x] Contrainte capacité : entre 15 et 30 places (validée côté API)
- [x] Mode maintenance : une salle en maintenance ne peut pas accueillir de séance
- [ ] Champ images (non implémenté)
- [ ] Champ type de salle (non implémenté)
- [ ] Planning d'une salle sur une période choisie (filtre de dates absent)
- [ ] Minimum 10 salles en base (aucune donnée de seed)

### Films
- [x] CRUD complet (admin pour les mutations)
- [x] Champs : titre, description, durée, réalisateur, genre, année de sortie
- [ ] Planning des séances d'un film sur une période choisie (filtre de dates absent)

### Séances
- [x] CRUD complet (admin pour les mutations)
- [x] Contrainte : pas de chevauchement pour un même film
- [x] Contrainte : durée minimale = durée du film + 30 minutes
- [x] Contrainte : impossible de créer une séance dans une salle en maintenance
- [ ] Contrainte : horaires du cinéma (9h–20h) non vérifiés
- [ ] Planning des séances sur une période choisie (filtre de dates absent)
- [ ] Admin : nombre de billets vendus / spectateurs par séance
- [ ] Minimum 1 mois de séances planifiées en base (aucune donnée de seed)

### Billets
- [x] Achat d'un billet regular — 1 utilisation, 10 € (`POST /api/tickets/buy`)
- [x] Achat d'un Super Billet — 10 utilisations, 50 € (`POST /api/tickets/buy`)
- [x] Utilisation d'un ticket pour une séance (`POST /api/tickets/:id/use`)
- [x] Vérification : ticket épuisé non réutilisable
- [x] Vérification : seul le propriétaire peut utiliser son ticket
- [x] Lister ses tickets (`GET /api/tickets`)
- [ ] Vérification : la séance utilisée existe et n'est pas passée

### Portefeuille & Transactions
- [x] Recharger son solde (`POST /api/balance`)
- [x] Historique de ses transactions (`GET /api/transactions`)
- [x] Transactions créditées / débitées à chaque achat ou recharge
- [ ] Retrait d'argent (non implémenté)
- [ ] Admin : voir les transactions de tous les clients

### Statistiques
- [ ] Fréquentation quotidienne / hebdomadaire
- [ ] Taux d'occupation en temps réel
- [ ] Statistiques sur une période donnée

### Bonus
- [ ] Planning des employés (super admin)
- [ ] Tests (unitaires / intégration / e2e)
- [ ] Sauvegarde automatique des données
- [ ] Observabilité (Prometheus, Grafana)
- [ ] Logs structurés
- [ ] Intégration continue (CI)

---

## Routes de l'API

### Authentification

| Méthode | Route | Accès |
|---|---|---|
| `POST` | `/api/auth/register` | Public |
| `POST` | `/api/auth/login` | Public |
| `POST` | `/api/auth/refresh` | Public |
| `POST` | `/api/auth/logout` | Authentifié |
| `POST` | `/api/auth/logout-all` | Authentifié |

### Utilisateurs

| Méthode | Route | Accès |
|---|---|---|
| `GET` | `/api/users/me` | Authentifié |
| `PATCH` | `/api/users/me` | Authentifié |
| `GET` | `/api/users` | Admin |
| `GET` | `/api/users/:id` | Admin |
| `PATCH` | `/api/users/:id/role` | Super Admin |
| `DELETE` | `/api/users/:id` | Admin |

### Salles

| Méthode | Route | Accès |
|---|---|---|
| `GET` | `/api/rooms` | Authentifié |
| `GET` | `/api/rooms/:id` | Authentifié |
| `POST` | `/api/rooms` | Admin |
| `PATCH` | `/api/rooms/:id` | Admin |
| `DELETE` | `/api/rooms/:id` | Admin |

### Films

| Méthode | Route | Accès |
|---|---|---|
| `GET` | `/api/movies` | Authentifié |
| `GET` | `/api/movies/:id` | Authentifié |
| `POST` | `/api/movies` | Admin |
| `PATCH` | `/api/movies/:id` | Admin |
| `DELETE` | `/api/movies/:id` | Admin |

### Séances

| Méthode | Route | Accès |
|---|---|---|
| `GET` | `/api/screenings` | Authentifié |
| `GET` | `/api/screenings/:id` | Authentifié |
| `POST` | `/api/screenings` | Admin |
| `PATCH` | `/api/screenings/:id` | Admin |
| `DELETE` | `/api/screenings/:id` | Admin |

### Tickets & Portefeuille

| Méthode | Route | Accès |
|---|---|---|
| `POST` | `/api/tickets/buy` | Authentifié |
| `POST` | `/api/tickets/:id/use` | Authentifié |
| `GET` | `/api/tickets` | Authentifié |
| `POST` | `/api/balance` | Authentifié |
| `GET` | `/api/transactions` | Authentifié |

---

## Rôles utilisateur

| Rôle | Périmètre |
|---|---|
| `client` | Profil, tickets, transactions, consultation des salles / films / séances |
| `admin` | + Gestion des utilisateurs, salles, films, séances |
| `super_admin` | + Changement de rôle des utilisateurs |

---

## Collection Postman

Une collection Postman est disponible à la racine du projet : `FasCine.postman_collection.json`.

À importer dans Postman via **File → Import**.

---

## Structure du projet

```
src/
├── database/
│   ├── database.ts              # Connexion TypeORM
│   └── entities/                # Entités (tables)
│       ├── user.ts
│       ├── token.ts
│       ├── room.ts
│       ├── movie.ts
│       ├── screening.ts
│       ├── ticket.ts
│       └── transaction.ts
├── handlers/                    # Couche HTTP (controllers)
│   ├── middlewares/             # Auth JWT, contrôle des rôles
│   ├── validators/              # Schémas de validation Joi
│   ├── requests/                # Interfaces TypeScript (DTOs)
│   └── routes.ts                # Déclaration de toutes les routes
├── usecases/                    # Logique métier
└── index.ts                     # Point d'entrée, Swagger, DB
```

---

## Variables d'environnement

| Variable | Description | Exemple |
|---|---|---|
| `NODE_ENV` | Environnement | `development` |
| `DB_HOST` | Hôte PostgreSQL | `db` (Docker) |
| `DB_PORT` | Port PostgreSQL | `5432` |
| `DB_USER` | Utilisateur PostgreSQL | `fascine` |
| `DB_PASSWORD` | Mot de passe PostgreSQL | `fascine` |
| `DB_NAME` | Nom de la base | `fascine_db` |
| `JWT_SECRET` | Secret pour les access tokens | chaîne aléatoire longue |
| `JWT_REFRESH_SECRET` | Secret pour les refresh tokens | chaîne aléatoire longue |
| `JWT_ACCESS_EXPIRES_IN` | Durée de vie access token | `5m` |
| `JWT_REFRESH_EXPIRES_IN` | Durée de vie refresh token | `7d` |
| `PORT` | Port d'écoute du serveur | `3000` |
