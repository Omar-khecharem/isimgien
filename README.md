<div align="center">

# ISIMGIEN

**Full-stack platform for managing student clubs at ISIMGIEN**
(Institut Supérieur d'Informatique et de Multimédia de Gabès)

![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?style=flat&logo=typescript)
![Node.js](https://img.shields.io/badge/Node.js-20-339933?style=flat&logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-8-47A248?style=flat&logo=mongodb)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat&logo=vite)

</div>

---

## Overview

ISIMGIEN is a comprehensive club management platform designed for ISIMGIEN. It provides role-based dashboards for Super Admins, Club Leaders, and Students with real-time data, file uploads, dynamic forms, attendance tracking, and financial management.

## Tech Stack

### Frontend

| Category | Technology |
|----------|-----------|
| **Framework** | React 19 + TypeScript 6 |
| **Build Tool** | Vite 8 |
| **Styling** | Tailwind CSS v4 + CSS Modules |
| **State** | @tanstack/react-query v5 |
| **Routing** | react-router-dom v7 |
| **Charts** | Recharts 3 |
| **Icons** | Lucide React |
| **QR Codes** | qrcode.react |

### Backend

| Category | Technology |
|----------|-----------|
| **Runtime** | Node.js + TypeScript |
| **Framework** | Express.js 4 |
| **Database** | MongoDB (Mongoose 8) |
| **Validation** | Zod |
| **Auth** | JWT (access + refresh tokens) + bcrypt |
| **File Upload** | Multer (disk storage) |
| **Rate Limiting** | express-rate-limit |

---

## Project Structure

```
ISIMGIEN/
├── client/                              # React frontend
│   ├── src/
│   │   ├── components/                  # Shared UI components
│   │   │   ├── ui/                      # Avatar, Button, Input primitives
│   │   │   └── student/                 # Student layout & dashboard
│   │   ├── features/                    # Feature modules
│   │   │   ├── auth/                    # Login, register, JWT, avatar upload
│   │   │   ├── attendance/              # QR check-in, session management
│   │   │   ├── clubLeader/              # Club leader dashboard + all pages
│   │   │   │   ├── ClubLeaderDashboard  # Main dashboard (KPIs, charts)
│   │   │   │   ├── ClubProfile          # Club info editor (logo, cover, contact)
│   │   │   │   ├── LeaderFormationsPage # Training CRUD + poster upload
│   │   │   │   ├── LeaderFormsPage      # Form builder + responses
│   │   │   │   ├── LeaderMembersPage    # Member management
│   │   │   │   ├── LeaderFinancePage    # Treasury & transactions
│   │   │   │   ├── LeaderNotificationsPage # Notification center
│   │   │   │   ├── LeaderSettingsPage   # Settings (profile photo, prefs)
│   │   │   │   └── LeaderHelpPage       # FAQ + support
│   │   │   ├── clubs/                   # Club service
│   │   │   ├── forms/                   # Form builder + response handling
│   │   │   ├── trainings/               # Training service
│   │   │   └── users/                   # User management service
│   │   ├── layouts/                     # DashboardLayout, RootLayout, AuthLayout
│   │   ├── pages/                       # Admin pages (Dashboard, Users, Settings, Events)
│   │   ├── routes/                      # Route config + guards
│   │   ├── services/                    # API client (JWT interceptors, file upload)
│   │   ├── styles/                      # Design tokens (tokens.css)
│   │   └── types/                       # Shared TypeScript types
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
│
├── server/                              # Express backend
│   ├── src/
│   │   ├── config/                      # Environment, database, constants
│   │   ├── middleware/                   # Auth, RBAC, validation, upload, error handler
│   │   ├── models/                      # Mongoose schemas (User, Club, Training, Form, ...)
│   │   ├── modules/
│   │   │   ├── auth/                    # Register, login, refresh, avatar upload
│   │   │   ├── clubs/                   # Club CRUD, image upload, leader assignment
│   │   │   ├── trainings/               # Training CRUD, status transitions, linked forms
│   │   │   ├── events/                  # Event management
│   │   │   ├── forms/                   # Dynamic forms with versioning
│   │   │   ├── finance/                 # Transactions, balance, categories
│   │   │   ├── attendance/              # Session, QR check-in, bulk operations
│   │   │   ├── membership/              # Fee tracking, payment records
│   │   │   ├── dashboard/               # Global stats API
│   │   │   └── users/                   # User management (Super Admin)
│   │   ├── routes/                      # Central route registry
│   │   ├── seeds/                       # Super admin seed
│   │   ├── shared/                      # Enums, types, utils (ApiError, apiResponse)
│   │   ├── app.ts                       # Express app setup
│   │   └── server.ts                    # Entry point
│   ├── uploads/                         # File storage (avatars, clubs, posters)
│   ├── .env.example
│   └── package.json
│
└── README.md
```

---

## Design System

Built with a **Donezo-style** design language using CSS custom properties.

| Token | Value | Usage |
|-------|-------|-------|
| Primary | `#0A5F3A` (emerald-800) | Buttons, links, active states |
| Accent | `#C7E8D6` (mint) | Highlights, badges |
| Background | `#F7F8F9` (slate) | Page background |
| Card | `#FFFFFF` | Card surfaces |
| Font | Inter | All text |
| Corners | 16px / 12px | Cards / Buttons |

---

## Modules

### Backend

| Module | Endpoints | Description |
|--------|-----------|-------------|
| **Auth** | `POST /auth/*` | Registration, login, logout, token refresh, password, avatar upload |
| **Users** | `GET/PATCH/DELETE /users/*` | User list, role management, toggle active (Super Admin) |
| **Clubs** | `GET/POST/PATCH/DELETE /clubs/*` | CRUD, image upload, leader assignment, settings |
| **Trainings** | `GET/POST/PUT/DELETE /clubs/:id/trainings/*` | CRUD, status transitions, poster upload, linked forms |
| **Events** | `GET/POST/PATCH/DELETE /clubs/:id/events/*` | CRUD per club |
| **Forms** | `GET/POST/PATCH /clubs/:id/forms/*` | Dynamic forms with versioning, snapshot-on-publish |
| **Responses** | `POST /forms/public/:token` | Public form submission, file upload |
| **Attendance** | `POST/DELETE/GET /clubs/:id/trainings/:id/attendance/*` | Session management, QR check-in, bulk operations |
| **Finance** | `GET/POST /clubs/:id/finance/*` | Transactions, balance, category breakdown |
| **Membership** | `GET/POST/PATCH /clubs/:id/memberships/*` | Fee tracking, payment records, auto-activation |
| **Dashboard** | `GET /dashboard/stats` | Global stats (Super Admin) |

### Frontend Pages

| Page | Route | Role | Description |
|------|-------|------|-------------|
| **Dashboard** | `/leader` | Club Leader | KPIs, finance gauge, attendance chart, upcoming formations |
| **Club Profile** | `/leader/profile` | Club Leader | Edit club info, logo, cover, contact, social links |
| **Formations** | `/leader/clubs` | Club Leader | Training CRUD, poster upload, linked forms, status transitions |
| **Formulaires** | `/leader/forms` | Club Leader | Form builder, publish, view responses with stats |
| **Membres** | `/leader/members` | Club Leader | Member list, approve/reject, search, pagination |
| **Caisse** | `/leader/finance` | Club Leader | Balance, transactions, income/expense recording |
| **Notifications** | `/leader/notifications` | Club Leader | Notification center with filters, mark-as-read |
| **Paramètres** | `/leader/settings` | Club Leader | Profile photo, club settings, notification prefs |
| **Aide** | `/leader/help` | Club Leader | FAQ, contact support, quick links |
| **Admin Dashboard** | `/dashboard` | Super Admin | Global stats, charts, quick actions |
| **Admin Users** | `/admin/users` | Super Admin | User management with search, role filters |
| **Admin Events** | `/admin/events` | Super Admin | Event management |
| **Admin Settings** | `/admin/settings` | Super Admin | Profile, security settings |
| **Student Dashboard** | `/student` | Student | Personal overview |

---

## Roles & Permissions

| Role | Access |
|------|--------|
| **Super Admin** | Global access — all clubs, all users, dashboard, settings, events |
| **Club Leader** | Own club only — dashboard, formations, forms, members, finance, notifications, settings |
| **Student** | Own profile, registrations, QR check-in, attendance |

---

## Getting Started

### Prerequisites

- **Node.js** 18+
- **MongoDB** running locally or MongoDB Atlas URI

### Backend

```bash
cd server
npm install
cp .env.example .env    # Edit with your MongoDB URI and JWT secrets
npm run dev             # Starts on http://localhost:3000
```

### Frontend

```bash
cd client
npm install
npm run dev             # Starts on http://localhost:5173
```

### Default Accounts (auto-seeded)

| Email | Password | Role |
|-------|----------|------|
| `admin@isimg.tn` | `admin123` | Super Admin |
| `leader@isimg.tn` | `leader123` | Club Leader |
| `student@isimg.tn` | `student123` | Student |

---

## Scripts

```bash
# Backend
cd server
npm run dev         # ts-node-dev (hot reload)
npm run build       # Compile TypeScript
npm start           # Run production build
npm test            # Jest tests
npm run lint        # ESLint

# Frontend
cd client
npm run dev         # Vite dev server
npm run build       # Production build (tsc + vite)
npm run preview     # Preview production build
npm run lint        # OxLint
```

---

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `development` |
| `PORT` | Server port | `3000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/isimgien` |
| `JWT_ACCESS_SECRET` | Access token secret | — |
| `JWT_REFRESH_SECRET` | Refresh token secret | — |
| `JWT_ACCESS_EXPIRY` | Access token TTL | `15m` |
| `JWT_REFRESH_EXPIRY` | Refresh token TTL | `7d` |
| `CORS_ORIGIN` | Allowed CORS origin | `http://localhost:5173` |
| `UPLOAD_DIR` | File upload directory | `./uploads` |

---

## API Routes

All routes are prefixed with `/api/v1`.

### Auth
```
POST   /auth/register           Register a new account
POST   /auth/login              Login (returns access + refresh tokens)
POST   /auth/logout             Logout (clears refresh token)
POST   /auth/refresh            Refresh access token
GET    /auth/me                 Get current user profile
PATCH  /auth/password           Change password
POST   /auth/avatar             Upload profile photo
```

### Clubs
```
GET    /clubs                   List all active clubs
POST   /clubs                   Create club (Super Admin)
POST   /clubs/my-club           Get current leader's club
GET    /clubs/:clubId           Get club details
PATCH  /clubs/:clubId           Update club (Super Admin / Club Leader)
DELETE /clubs/:clubId           Deactivate club (Super Admin)
POST   /clubs/upload            Upload club image (logo/cover)
```

### Trainings
```
GET    /clubs/:clubId/trainings                List trainings (filterable by status)
POST   /clubs/:clubId/trainings                Create training (Club Leader)
GET    /clubs/:clubId/trainings/:trainingId    Get training details
PUT    /clubs/:clubId/trainings/:trainingId    Update training (Club Leader)
PATCH  /clubs/:clubId/trainings/:trainingId/status  Transition status
DELETE /clubs/:clubId/trainings/:trainingId    Delete training (Club Leader)
```

### Forms & Responses
```
GET    /clubs/:clubId/forms                    List forms
POST   /clubs/:clubId/forms                    Create form (Club Leader)
GET    /clubs/:clubId/forms/:formId            Get form details
PATCH  /clubs/:clubId/forms/:formId            Update form draft
POST   /clubs/:clubId/forms/:formId/publish    Publish form (snapshot)
POST   /clubs/:clubId/forms/:formId/deactivate Deactivate form
POST   /forms/public/:formToken               Submit response (public, no auth)
GET    /forms/:formId/responses               List responses (Club Leader)
GET    /forms/:formId/responses/stats          Response statistics
```

### Attendance
```
# Club-scoped (under /clubs/:clubId/trainings/:trainingId/attendance)
POST   /                    Start session
DELETE /                    Close session
GET    /session             Get session status
GET    /                    List attendance records
POST   /check-in            Check-in student
POST   /check-in/bulk       Bulk check-in
POST   /check-out           Check-out student
POST   /absent              Mark absent

# Global
POST   /attendance/qr-checkin   QR check-in (Student)
```

### Finance
```
# Club-scoped (under /clubs/:clubId/finance)
GET    /balance                     Club treasury balance
GET    /summary                     Financial summary + category breakdown
GET    /transactions                List transactions (filterable)
POST   /transactions                Record income/expense
```

### Membership
```
# Club-scoped (under /clubs/:clubId/memberships)
GET    /stats                       Membership stats
GET    /my-membership               Current year membership (Student)
GET    /                            List memberships
POST   /                            Create membership record
PATCH  /:membershipId/status        Update status
POST   /:membershipId/payment       Record payment (auto-activates)
```

---

## License

ISC
