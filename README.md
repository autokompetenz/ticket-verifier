# TicketCheck

Site de vérification de coupons prépayés (Transcash, PCS, Neosurf) avec stockage PostgreSQL sur **Neon** et espace **admin** pour consulter les tickets enregistrés.

## Stack

- **Front** : React 19 + TypeScript + Vite (SPA, mobile-first)
- **Back** : Node.js + Express 5 + `pg`
- **Base de données** : PostgreSQL (Neon, serverless)

## Prérequis

- Node.js 18+
- Un projet **Neon** avec une base PostgreSQL (console.neon.tech)

## Installation

```bash
npm install
```

## Configuration Neon

1. Copie `.env.example` vers `.env` :
   ```bash
   copy .env.example .env
   ```
2. Renseigne ta string de connexion (`DATABASE_URL`) fournie par Neon (section **Connect → Connection string** de ta base).
3. Définis un mot de passe fort pour `ADMIN_PASSWORD` (il protège l'espace admin `/admin`).

## Initialisation de la base de données

Crée la table `tickets` sur Neon (à faire une seule fois) :

```bash
npm run db:init
```

## Lancer en développement

Démarre le front (Vite sur `http://localhost:5173`) **et** l'API (Express sur `http://localhost:4000`) :

```bash
npm run dev
```

Le front utilise un proxy Vite : les appels `/api/*` sont automatiquement redirigés vers l'API.

## Fonctionnement

### Vérification d'un ticket
- Saisis le code sur la page d'accueil → le serveur détermine le statut (valide / utilisé / expiré), **enregistre le ticket en base**, puis retourne le résultat.

### Espace admin
- Rends-toi sur `/admin` et connecte-toi avec `ADMIN_PASSWORD` (défini dans `.env`).
- Tu y verras : statistiques (total, valides, utilisés, expirés, valeur) et la liste des tickets enregistrés (code, type, montant, statut, date de vérification).

## Scripts

| Commande           | Description                            |
| ------------------ | -------------------------------------- |
| `npm run dev`      | Front (Vite) + API (nodemon)           |
| `npm run server`   | API seule (recharge auto)              |
| `npm run db:init`  | Crée la table `tickets`                |
| `npm run build`    | Build TypeScript + Vite                |
| `npm run lint`     | OXLint                                 |
| `npm run preview`  | Prévue le build front                  |

## Déploiement (Vercel)

Le projet est prêt pour Vercel : le front (Vite) et l'API (Express, dégui en fonction serverless) se déploient ensemble.

### 1. Prérequis

- Un compte [Vercel](https://vercel.com)
- La base Neon créée (console.neon.tech) avec sa string de connexion `DATABASE_URL`
- Installer le CLI Vercel (optionnel pour le déploiement depuis le terminal) :
  ```bash
  npm i -g vercel
  ```

### 2. Variables d'environnement

Définis ces variables dans le dashboard Vercel (Project → Settings → Environment Variables) **ou** via le CLI :

| Variable         | Valeur                                            |
| ---------------- | ------------------------------------------------- |
| `DATABASE_URL`   | String PostgreSQL Neon (`postgresql://...?sslmode=require`) |
| `ADMIN_PASSWORD` | Mot de passe de l'espace admin `/admin`           |
| `CLIENT_ORIGIN`  | URL du site (ex : `https://mon-site.vercel.app`)  |

### 3. Initialiser la base

Crée la table `tickets` sur Neon (une fois, depuis le terminal) :

```bash
npm run db:init
```

(`DATABASE_URL` doit être renseignée dans `.env` localement, ou passée en variable d'environnement.)

### 4. Déployer

```bash
vercel
```

Ou connecte le dépôt GitHub à Vercel (framework détecté automatiquement : Vite + fonction serverless `api/index.js`). Une fois déployé :

- Page d'accueil : vérification + enregistrement des tickets en base
- `/admin` : espace protégé listant tous les tickets (stats + tableau)
- Le fichier `vercel.json` gère les rewrites : `/api/*` → fonction Express, tout le reste → `index.html` (routing SPA)

### Variables environnements disponibles

| Variable           | Description                                        |
| ------------------ | -------------------------------------------------- |
| `DATABASE_URL`     | Connexion Neon PostgreSQL (requis)                 |
| `ADMIN_PASSWORD`   | Mot de passe admin `/admin` (requis)               |
| `CLIENT_ORIGIN`    | CORS : origine autorisée (prod)                    |
| `PORT`             | Port local par défaut (4000)                       |

> Note : la logique de vérification actuelle est **simulée** (démo). Pour une vérification réelle, branche-toi sur l'API officielle de votre partenaire émetteur.