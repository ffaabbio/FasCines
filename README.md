# FasCine — API REST Cinéma

API RESTful de gestion d'un cinéma, développée en Node.js + TypeScript.

## Stack

- **Express 5** — framework HTTP
- **TypeORM** + **PostgreSQL** — base de données
- **JWT** — authentification stateful (access token 5min + refresh token 7j)
- **Joi** — validation des données
- **Docker** — environnement de développement

## Lancer le projet

### Prérequis

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installé et démarré

### Installation

1. Cloner le repo
2. Copier le fichier d'environnement :
```bash
cp .env.example .env
```
3. Remplir les variables dans `.env`
4. Lancer Docker :
```bash
docker-compose up --build
```

L'API démarre sur `http://localhost:3000`

### Vérifier que ça tourne

```bash
GET http://localhost:3000/health
# → { "status": "ok" }
```

## Structure du projet

```
src/
├── database/
│   ├── database.ts          # Connexion TypeORM
│   └── entities/            # Tables de la base de données
│       ├── user.ts
│       ├── token.ts
│       ├── room.ts
│       ├── movie.ts
│       └── screening.ts
├── handlers/                # Couche HTTP (controllers)
│   ├── middlewares/         # Auth, erreurs
│   ├── validators/          # Validation Joi
│   ├── requests/            # Interfaces TypeScript (DTOs)
│   └── swagger/             # Documentation API
├── usecases/                # Logique métier
│   ├── auth-usecase.ts
│   └── error.ts             # Erreurs custom
└── index.ts                 # Point d'entrée
```

## Ce qui est fait

- [x] Configuration TypeScript + TypeORM
- [x] Docker (API + PostgreSQL)
- [x] Entités : User, Token, Room, Movie, Screening
- [x] Authentification complète : register, login, logout, logout-all, refresh token
- [x] Middleware JWT + contrôle des rôles (CLIENT, ADMIN, SUPER_ADMIN)
- [x] Gestion des utilisateurs : profil, modification, liste admin, changement de rôle, suppression
- [x] Collection Postman pour tester l'API

## Ce qui reste à faire

- [x] CRUD Rooms (feat/rooms — collègue 1)
- [x] CRUD Movies (feat/rooms — collègue 1)
- [x] CRUD Screenings avec règles métier : horaires, chevauchements (feat/rooms — collègue 1)
- [ ] Entités + CRUD Tickets Regular + Super (feat/tickets — collègue 2)
- [ ] Entités + CRUD Wallet + Transactions (feat/tickets — collègue 2)
- [ ] Statistiques admin : fréquentation, occupation, revenus
- [ ] Documentation Swagger
- [ ] Docker prod + Nginx

## Variables d'environnement

Voir `.env.example` pour la liste complète.
