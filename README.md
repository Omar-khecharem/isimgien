<div align="center">

<img src="client/public/favicon.svg" alt="ISIMGIEN Logo" width="80" />

# ISIMGIEN

### Plateforme Universitaire de Gestion des Clubs

Une solution full-stack enterprise pour la gestion intégrée des clubs, événements, formations et membres au sein de l'**Institut Supérieur d'Informatique et de Management de Kairouan**.

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?style=for-the-badge&logo=typescript)](https://typescriptlang.org)
[![Node.js](https://img.shields.io/badge/Node.js-22-339933?style=for-the-badge&logo=node.js)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-8-47A248?style=for-the-badge&logo=mongodb)](https://mongodb.com)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev)

[![License](https://img.shields.io/badge/License-ISC-green?style=for-the-badge)](#license)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=for-the-badge)](#contributing)
[![Issues](https://img.shields.io/badge/Issues-open-red?style=for-the-badge)](https://github.com/Omar-khecharem/isimgien/issues)

</div>

---

## Table des matières

- [Aperçu](#aperçu)
- [Fonctionnalités](#fonctionnalités)
- [Système de Design](#système-de-design)
- [Stack Technique](#stack-technique)
- [Architecture](#architecture)
- [Structure du Projet](#structure-du-projet)
- [Modules Backend](#modules-backend)
- [Pages Frontend](#pages-frontend)
- [Rôles & Permissions](#roles--permissions)
- [Installation](#installation)
- [Variables d'Environnement](#variables-denvironnement)
- [Scripts](#scripts)
- [API Reference](#api-reference)
- [License](#license)

---

## Aperçu

ISIMGIEN est une plateforme de gestion universitaire conçue pour digitaliser et centraliser l'ensemble des activités extrascolaires. Elle s'adresse aux **Super Administrateurs**, **Responsables de club** et **Étudiants** avec des tableaux de bord adaptés à chaque rôle.

### Objectifs

- **Centralisation** — Un écosystème unique pour clubs, événements, formations, présences et finances
- **Automatisation** — QR codes, formulaires dynamiques, validations automatiques
- **Transparence** — Tableaux de bord en temps réel, rapports financiers, statistiques d'assiduité
- **Accessibilité** — Interface responsive, accessible sur tous les appareils

---

## Fonctionnalités

### Super Administrateur

| Module | Description |
|--------|-------------|
| **Dashboard** | Vue globale : stats, graphiques Recharts, actions rapides |
| **Gestion des Clubs** | CRUD complet, assignation des leaders, logos & couvertures |
| **Gestion des Utilisateurs** | Recherche, filtres par rôle, activation/désactivation |
| **Événements** | Création et suivi des événements universitaires |
| **Paramètres** | Profil, sécurité, personnalisation de la page d'accueil |
| **Page d'accueil** | Éditeur du contenu public (hero, features, stats, CTA) |

### Responsable de Club

| Module | Description |
|--------|-------------|
| **Dashboard** | KPIs du club, gauge financière, graphique de présence |
| **Profil du Club** | Édition des informations, logo, couverture, contact |
| **Formations** | CRUD avec upload de poster, statuts (brouillon → publié → terminé) |
| **Formulaires** | Éditeur drag & drop, publication, réponses avec statistiques |
| **Membres** | Liste, approbation/recherche, pagination |
| **Caisse** | Solde, transactions (revenus/dépenses), catégories |
| **Notifications** | Centre de notifications avec filtres et marquer-lu |
| **Aide** | FAQ, contact support |

### Étudiant

| Module | Description |
|--------|-------------|
| **Dashboard** | Vue personnelle avec formations à venir et calendrier |
| **Clubs** | Découverte des clubs, inscription, détail avec page dédiée |
| **Événements** | Liste avec modals d'affichage des posters |
| **Messagerie** | Contacts en temps réel, avatars, chat instantané |
| **Présences** | Check-in QR code, historique d'assiduité |
| **Notifications** | Alertes et notifications personnelles |
| **Paramètres** | Profil, préférences |

---

## Système de Design

Palette verte institutionnelle appliquée de manière cohérente sur l'ensemble de l'interface.

| Token | Couleur | Usage |
|-------|---------|-------|
| **Primary** | `#499A13` | Boutons, liens, états actifs, CTA |
| **Primary Dark** | `#276F27` | Hover states, backgrounds foncés |
| **Accent** | `#8ECA3C` | Badges, highlights, valeurs stats |
| **Light** | `#BBDC12` | Éléments décoratifs, accents lumineux |
| **Background** | `#f9fdf5` | Fond de page sections alternées |
| **Surface** | `#fff` | Cartes, surfaces |

### Principes

- **Gradient cards** — Stat cards avec dégradés verts (`#276F27 → #499A13 → #8ECA3C → #BBDC12`)
- **Glass morphism** — Icons avec `backdrop-filter: blur(8px)` et `rgba(255,255,255,0.18)`
- **Hover states** — `translateY(-3px)` avec ombre verte
- **Dark sections** — `#0d2818` pour footer et sections statistiques
- **Responsive** — Breakpoints : 1280px, 1024px, 768px, 480px

---

## Stack Technique

### Frontend

```
React 19.2        · TypeScript 6.0       · Vite 8.2
Tailwind CSS 4.3  · TanStack Query 5     · React Router 7
Recharts 3        · Framer Motion 13     · GSAP 3.15
Lucide React      · Socket.IO Client     · QRCode.react
```

### Backend

```
Node.js 22        · Express.js 4         · TypeScript 6.0
MongoDB 8 (Mongoose 8)                  · Zod (validation)
JWT (access + refresh tokens)           · bcrypt
Multer (upload fichiers)                · express-rate-limit
Socket.IO ( temps réel)
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      CLIENT (Vite)                       │
│  React 19 · TypeScript · Tailwind CSS · TanStack Query  │
├─────────────────────────────────────────────────────────┤
│                     API Gateway                          │
│              JWT Auth · RBAC · Rate Limit                │
├─────────────────────────────────────────────────────────┤
│                    SERVER (Express)                       │
│  Auth · Clubs · Trainings · Forms · Events · Finance    │
│  Attendance · Membership · Dashboard · Users · Homepage  │
├─────────────────────────────────────────────────────────┤
│                   MongoDB Atlas                          │
│              Mongoose ODM · Indexes                      │
└─────────────────────────────────────────────────────────┘
```

### Flux d'Authentification

```
Login → JWT Access (15min) + Refresh (7j)
  ↓
Request → Authorization: Bearer <access_token>
  ↓
401 Expired → POST /auth/refresh → New access token
  ↓
Refresh expired → Redirect to /login
```

---

## Structure du Projet

```
ISIMGIEN/
├── client/                              # Frontend React
│   ├── public/                          # Assets statiques
│   ├── src/
│   │   ├── app/                         # App root, providers
│   │   ├── components/
│   │   │   ├── common/                  # Favicon, composants partagés
│   │   │   ├── student/                 # Dashboard étudiant
│   │   │   │   ├── StudentDashboard.tsx
│   │   │   │   ├── StudentClubsPage.tsx
│   │   │   │   ├── StudentClubDetailPage.tsx
│   │   │   │   ├── StudentEventsPage.tsx
│   │   │   │   ├── StudentContactPage.tsx
│   │   │   │   ├── StudentNotificationsPage.tsx
│   │   │   │   └── StudentSettingsPage.tsx
│   │   │   └── ui/                      # Avatar, Button, Input
│   │   ├── features/                    # Modules métier
│   │   │   ├── auth/                    # Login, JWT, avatar
│   │   │   ├── attendance/              # QR check-in, sessions
│   │   │   ├── clubLeader/              # Toutes pages leader
│   │   │   ├── clubs/                   # Service clubs
│   │   │   ├── forms/                   # Form builder
│   │   │   ├── homepage/                # Context éditeur page d'accueil
│   │   │   ├── messaging/               # Contacts, messages temps réel
│   │   │   ├── student/                 # Hooks étudiant
│   │   │   ├── trainings/               # Service formations
│   │   │   └── users/                   # Service utilisateurs
│   │   ├── layouts/                     # DashboardLayout, RootLayout
│   │   ├── pages/
│   │   │   ├── admin/                   # AdminClubs, AdminEvents, AdminUsers...
│   │   │   ├── dashboard/               # SuperAdminDashboard
│   │   │   ├── settings/                # AdminSettings
│   │   │   └── HomePage.tsx             # Page d'accueil publique
│   │   ├── routes/                      # Route config + guards
│   │   ├── services/                    # API client (JWT interceptors)
│   │   ├── styles/                      # tokens.css, global.css
│   │   └── types/                       # Types partagés
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
│
├── server/                              # Backend Express
│   ├── src/
│   │   ├── config/                      # Env, DB, constants
│   │   ├── middleware/                   # Auth, RBAC, validation, upload
│   │   ├── models/                      # Mongoose schemas
│   │   ├── modules/
│   │   │   ├── auth/                    # Register, login, refresh, avatar
│   │   │   ├── clubs/                   # CRUD, upload, leader assignment
│   │   │   ├── trainings/               # CRUD, statuts, poster
│   │   │   ├── events/                  # Événements par club
│   │   │   ├── forms/                   # Formulaires dynamiques + versioning
│   │   │   ├── finance/                 # Transactions, balance, catégories
│   │   │   ├── attendance/              # Sessions, QR, opérations bulk
│   │   │   ├── membership/              # Cotisations, paiements
│   │   │   ├── dashboard/               # Stats globales
│   │   │   ├── users/                   # Gestion utilisateurs
│   │   │   └── homepage/                # API page d'accueil
│   │   ├── routes/                      # Registry central des routes
│   │   ├── seeds/                       # Seed super admin
│   │   ├── shared/                      # Enums, types, utils (ApiError)
│   │   ├── app.ts                       # Express app
│   │   └── server.ts                    # Entry point
│   ├── uploads/                         # Fichiers uploadés
│   ├── .env.example
│   └── package.json
│
└── README.md
```

---

## Modules Backend

| Module | Endpoints | Description |
|--------|-----------|-------------|
| **Auth** | `POST /auth/*` | Inscription, connexion, déconnexion, refresh, mot de passe, avatar |
| **Users** | `GET/PATCH/DELETE /users/*` | Liste, rôles, activation (Super Admin) |
| **Clubs** | `GET/POST/PATCH/DELETE /clubs/*` | CRUD, upload images, assignation leader |
| **Trainings** | `GET/POST/PUT/DELETE /clubs/:id/trainings/*` | CRUD, statuts, poster, formulaires liés |
| **Events** | `GET/POST/PATCH/DELETE /clubs/:id/events/*` | Événements par club |
| **Forms** | `GET/POST/PATCH /clubs/:id/forms/*` | Formulaires dynamiques avec versioning |
| **Responses** | `POST /forms/public/:token` | Soumission publique (sans auth) |
| **Attendance** | `POST/DELETE/GET /clubs/:id/trainings/:id/attendance/*` | Sessions, QR check-in, bulk |
| **Finance** | `GET/POST /clubs/:id/finance/*` | Transactions, solde, catégories |
| **Membership** | `GET/POST/PATCH /clubs/:id/memberships/*` | Cotisations, paiements, auto-activation |
| **Dashboard** | `GET /dashboard/stats` | Statistiques globales (Super Admin) |
| **Homepage** | `GET/PATCH /homepage/*` | Configuration page d'accueil publique |

---

## Pages Frontend

| Page | Route | Rôle | Description |
|------|-------|------|-------------|
| **Accueil** | `/` | Public | Page marketing avec hero, features, stats, CTA |
| **Dashboard** | `/dashboard` | Super Admin | Stats globales, Recharts, actions rapides |
| **Clubs** | `/admin/clubs` | Super Admin | Gestion des clubs |
| **Utilisateurs** | `/admin/users` | Super Admin | Gestion des utilisateurs |
| **Événements** | `/admin/events` | Super Admin | Gestion des événements |
| **Paramètres** | `/admin/settings` | Super Admin | Profil et sécurité |
| **Dashboard Leader** | `/leader` | Leader | KPIs, finance, présence |
| **Profil Club** | `/leader/profile` | Leader | Édition infos club |
| **Formations** | `/leader/clubs` | Leader | CRUD formations |
| **Formulaires** | `/leader/forms` | Leader | Éditeur + réponses |
| **Membres** | `/leader/members` | Leader | Gestion membres |
| **Caisse** | `/leader/finance` | Leader | Trésorerie |
| **Dashboard Étudiant** | `/student` | Étudiant | Vue personnelle |
| **Clubs Étudiant** | `/student/clubs` | Étudiant | Découverte & inscription |
| **Détail Club** | `/student/clubs/:id` | Étudiant | Page complète du club |
| **Événements Étudiant** | `/student/events` | Étudiant | Liste événements |
| **Messagerie** | `/student/contact` | Étudiant | Chat temps réel |
| **Notifications** | `/student/notifications` | Étudiant | Alertes personnelles |

---

## Rôles & Permissions

| Rôle | Accès |
|------|-------|
| **Super Admin** | Accès global — tous les clubs, tous les utilisateurs, dashboard, paramètres, page d'accueil |
| **Club Leader** | Club propre uniquement — dashboard, formations, formulaires, membres, caisse, notifications, paramètres |
| **Étudiant** | Profil personnel, inscriptions, check-in QR, présences, messagerie |

---

## Installation

### Prérequis

- **Node.js** 18+ (recommandé : 22)
- **MongoDB** local ou MongoDB Atlas

### 1. Cloner le dépôt

```bash
git clone https://github.com/Omar-khecharem/isimgien.git
cd isimgien
```

### 2. Backend

```bash
cd server
npm install
cp .env.example .env    # Configurer MongoDB URI et JWT secrets
npm run dev             # http://localhost:3000
```

### 3. Frontend

```bash
cd client
npm install
npm run dev             # http://localhost:5173
```

### 4. Comptes par défaut (auto-seeded)

| Email | Mot de passe | Rôle |
|-------|-------------|------|
| `admin@isimg.tn` | *défini dans le seed* | Super Admin |
| `leader@isimg.tn` | *défini dans le seed* | Club Leader |
| `student@isimg.tn` | *défini dans le seed* | Étudiant |

---

## Variables d'Environnement

| Variable | Description | Défaut |
|----------|-------------|--------|
| `NODE_ENV` | Environnement | `development` |
| `PORT` | Port du serveur | `3000` |
| `MONGODB_URI` | URI de connexion MongoDB | `mongodb://localhost:27017/isimgien` |
| `JWT_ACCESS_SECRET` | Secret token d'accès | *requis* |
| `JWT_REFRESH_SECRET` | Secret token de rafraîchissement | *requis* |
| `JWT_ACCESS_EXPIRY` | Durée de vie access token | `15m` |
| `JWT_REFRESH_EXPIRY` | Durée de vie refresh token | `7d` |
| `CORS_ORIGIN` | Origine CORS autorisée | `http://localhost:5173` |
| `UPLOAD_DIR` | Répertoire des uploads | `./uploads` |

---

## Scripts

```bash
# Backend
cd server
npm run dev          # Hot reload (ts-node-dev)
npm run build        # Compilation TypeScript
npm start            # Production
npm test             # Tests Jest
npm run lint         # ESLint

# Frontend
cd client
npm run dev          # Vite dev server
npm run build        # Production build (tsc + vite)
npm run preview      # Prévisualisation production
npm run lint         # OxLint
```

---

## API Reference

Toutes les routes sont préfixées par `/api/v1`.

### Auth

```
POST   /auth/register              Inscription
POST   /auth/login                 Connexion (access + refresh tokens)
POST   /auth/logout                Déconnexion
POST   /auth/refresh               Rafraîchir le token d'accès
GET    /auth/me                    Profil utilisateur connecté
PATCH  /auth/password              Changer le mot de passe
POST   /auth/avatar                Upload photo de profil
PATCH  /auth/profile               Mettre à jour le profil
```

### Clubs

```
GET    /clubs                      Liste des clubs actifs
POST   /clubs                      Créer un club (Super Admin)
POST   /clubs/my-club              Club du leader connecté
GET    /clubs/:clubId              Détails d'un club
PATCH  /clubs/:clubId              Modifier un club
DELETE /clubs/:clubId              Désactiver un club (Super Admin)
POST   /clubs/upload               Upload image (logo/couverture)
```

### Formations

```
GET    /clubs/:clubId/trainings                    Liste (filtrable par statut)
POST   /clubs/:clubId/trainings                    Créer (Leader)
GET    /clubs/:clubId/trainings/:trainingId        Détails
PUT    /clubs/:clubId/trainings/:trainingId        Modifier (Leader)
PATCH  /clubs/:clubId/trainings/:trainingId/status transition de statut
DELETE /clubs/:clubId/trainings/:trainingId        Supprimer (Leader)
```

### Formulaires

```
GET    /clubs/:clubId/forms                         Liste
POST   /clubs/:clubId/forms                         Créer (Leader)
GET    /clubs/:clubId/forms/:formId                 Détails
PATCH  /clubs/:clubId/forms/:formId                 Modifier le brouillon
POST   /clubs/:clubId/forms/:formId/publish         Publier (snapshot)
POST   /clubs/:clubId/forms/:formId/deactivate      Désactiver
POST   /forms/public/:formToken                     Soumettre réponse (public)
GET    /forms/:formId/responses                     Liste réponses (Leader)
GET    /forms/:formId/responses/stats               Statistiques réponses
```

### Présences

```
POST   /clubs/:id/trainings/:id/attendance/         Démarrer session
DELETE /clubs/:id/trainings/:id/attendance/         Fermer session
GET    /clubs/:id/trainings/:id/attendance/session  Statut session
GET    /clubs/:id/trainings/:id/attendance/         Liste enregistrements
POST   /clubs/:id/trainings/:id/attendance/check-in Check-in étudiant
POST   /clubs/:id/trainings/:id/attendance/check-in/bulk  Check-in bulk
POST   /clubs/:id/trainings/:id/attendance/check-out      Check-out
POST   /clubs/:id/trainings/:id/attendance/absent         Marquer absent
POST   /attendance/qr-checkin                       QR check-in (Étudiant)
```

### Finance

```
GET    /clubs/:clubId/finance/balance               Solde trésorerie
GET    /clubs/:clubId/finance/summary               Résumé + catégories
GET    /clubs/:clubId/finance/transactions          Liste transactions
POST   /clubs/:clubId/finance/transactions          Enregistrer revenu/dépense
```

### Membership

```
GET    /clubs/:clubId/memberships/stats             Statistiques
GET    /clubs/:clubId/memberships/my-membership     Année en cours (Étudiant)
GET    /clubs/:clubId/memberships/                  Liste
POST   /clubs/:clubId/memberships/                  Créer enregistrement
PATCH  /clubs/:clubId/memberships/:id/status        Modifier statut
POST   /clubs/:clubId/memberships/:id/payment       Enregistrer paiement
```

---

## License

ISC

---

<div align="center">

**Développé avec passion à l'ISIMGIEN**
Institut Supérieur d'Informatique et de Management de Kairouan

</div>
