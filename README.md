# ISIMG ClubHub

Full-stack platform for managing student clubs at ISIMG (Institut Supérieur d'Informatique et de Multimédia de Gafsa). Includes a React frontend dashboard and a Node.js backend API.

## Tech Stack

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: CSS Modules + Tailwind (no config, utility classes only)
- **State**: React hooks (useState, useEffect, useCallback)
- **Routing**: React Router v6
- **HTTP**: Axios with JWT interceptors
- **Icons**: Lucide React (22×22 SVG)

### Backend
- **Runtime**: Node.js + TypeScript
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Validation**: Zod
- **Auth**: JWT (access + refresh tokens) + bcrypt

## Project Structure

```
├── client/                        # React frontend
│   ├── src/
│   │   ├── features/              # Feature modules (business logic + UI)
│   │   │   ├── attendance/        # Attendance session management
│   │   │   ├── clubLeader/        # Club leader dashboard + components
│   │   │   ├── forms/             # Form builder + response handling
│   │   │   ├── notifications/     # Notification service
│   │   │   └── users/             # User management service
│   │   ├── layouts/               # Layout components (Dashboard, Root)
│   │   ├── pages/                 # Page components
│   │   │   ├── admin/             # Admin users page
│   │   │   ├── dashboard/         # Super admin dashboard
│   │   │   └── settings/          # Admin settings page
│   │   ├── routes/                # Route definitions + paths
│   │   ├── services/              # API client, auth service
│   │   ├── styles/                # Design tokens, global CSS
│   │   └── types/                 # TypeScript types + enums
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
│
├── server/                        # Express backend
│   ├── src/
│   │   ├── config/                # Environment, database, constants
│   │   ├── middleware/            # Auth, RBAC, validation, error handling
│   │   ├── models/                # Mongoose schemas & models
│   │   ├── modules/               # Feature modules
│   │   │   ├── auth/              # Authentication
│   │   │   ├── clubs/             # Club management
│   │   │   ├── dashboard/         # Dashboard stats API
│   │   │   ├── events/            # Event management
│   │   │   ├── finance/           # Financial transactions
│   │   │   ├── forms/             # Dynamic forms
│   │   │   ├── attendance/        # Attendance tracking
│   │   │   ├── membership/        # Membership management
│   │   │   ├── trainings/         # Training sessions
│   │   │   └── users/             # User management (Super Admin)
│   │   ├── routes/                # Central route registry
│   │   ├── seeds/                 # Super admin seed
│   │   ├── shared/                # Enums, types, utils
│   │   ├── app.ts                 # Express app setup
│   │   └── server.ts              # Entry point
│   ├── .env.example
│   ├── package.json
│   ├── tsconfig.json
│   └── jest.config.js
│
└── README.md
```

## Design System (Donezo Style)

| Token | Value |
|-------|-------|
| Primary | `emerald-800` (#0A5F3A) |
| Accent | `#C7E8D6` (mint) |
| Background | `#F7F8F9` (slate) |
| Card | `#1A1A1A` (dark) |
| Font | Inter |
| Corners | 16px (lg) / 12px (md) |

## Modules

| Module | Description |
|--------|-------------|
| **Auth** | Registration, login, logout, token refresh, password management |
| **Users** | User list, role management, activate/deactivate (Super Admin) |
| **Clubs** | CRUD, leader assignment, club settings |
| **Trainings** | Sessions, schedules, capacity management, CRUD per club |
| **Events** | CRUD per club, date/location management |
| **Forms** | Dynamic forms with versioning, snapshot-on-publish, file upload |
| **Responses** | Form submission handling, multi-file upload |
| **Attendance** | State machine (not_attended → checked_in → checked_out), QR check-in, bulk check-in |
| **Finance** | Transactions (income/expense), balance, category breakdown, per-club treasury |
| **Membership** | Fee tracking, payment records, auto-activation on full payment |
| **Dashboard** | Stats API (clubs count, members, attendance rate, events) |

## API Routes

All routes are prefixed with `/api/v1`.

### Auth
```
POST   /auth/register          # Register a new account
POST   /auth/login             # Login (returns access + refresh tokens)
POST   /auth/logout            # Logout (clears refresh token)
POST   /auth/refresh           # Refresh access token
GET    /auth/me                # Get current user profile
PATCH  /auth/password          # Change password
```

### Users (Super Admin)
```
GET    /users                  # List all users (paginated, searchable)
GET    /users/:id              # Get user details
PATCH  /users/:id/role         # Update user role
PATCH  /users/:id/toggle-active # Toggle user active status
DELETE /users/:id              # Delete user
```

### Clubs
```
GET    /clubs                  # List all active clubs
POST   /clubs                  # Create club (Super Admin)
GET    /clubs/:clubId          # Get club details
PATCH  /clubs/:clubId          # Update club (Super Admin / Club Leader)
DELETE /clubs/:clubId          # Deactivate club (Super Admin)
PATCH  /clubs/:clubId/leader   # Assign club leader (Super Admin)
```

### Dashboard
```
GET    /dashboard/stats        # Global stats (Super Admin)
```

### Trainings
```
GET    /clubs/:clubId/trainings              # List trainings
POST   /clubs/:clubId/trainings              # Create training (Club Leader)
GET    /clubs/:clubId/trainings/:trainingId  # Get training details
PATCH  /clubs/:clubId/trainings/:trainingId  # Update training (Club Leader)
DELETE /clubs/:clubId/trainings/:trainingId  # Cancel training (Club Leader)
```

### Events
```
GET    /clubs/:clubId/events              # List events
POST   /clubs/:clubId/events              # Create event (Club Leader)
GET    /clubs/:clubId/events/:eventId     # Get event details
PATCH  /clubs/:clubId/events/:eventId     # Update event (Club Leader)
DELETE /clubs/:clubId/events/:eventId     # Cancel event (Club Leader)
```

### Forms & Responses
```
GET    /clubs/:clubId/forms                    # List forms
POST   /clubs/:clubId/forms                    # Create form (Club Leader)
GET    /clubs/:clubId/forms/:formId            # Get form details
PATCH  /clubs/:clubId/forms/:formId            # Update form draft (Club Leader)
POST   /clubs/:clubId/forms/:formId/publish    # Publish form (snapshot) (Club Leader)
POST   /clubs/:clubId/forms/:formId/deactivate # Deactivate form (Club Leader)
POST   /forms/public/:formToken               # Submit response (public, no auth)
GET    /forms/:formId/responses               # List responses (Club Leader)
GET    /forms/:formId/responses/:responseId   # Get response details (Club Leader)
```

### Attendance
```
# Club-scoped (under /clubs/:clubId/trainings/:trainingId/attendance)
POST   /                                  # Start session (Club Leader)
DELETE /                                  # Close session (Club Leader)
GET    /session                           # Get session status (Club Leader)
GET    /                                  # List attendance (Club Leader)
GET    /:attendanceId                     # Get record (Club Leader)
POST   /check-in                          # Check-in student (Club Leader)
POST   /check-in/bulk                     # Bulk check-in (Club Leader)
POST   /check-out                         # Check-out student (Club Leader)
POST   /absent                            # Mark absent (Club Leader)

# Global
POST   /attendance/qr-checkin             # QR check-in (Student, no clubId)
```

### Finance
```
# Club-scoped (under /clubs/:clubId/finance)
GET    /balance                           # Club treasury balance
GET    /summary                           # Financial summary + category breakdown
GET    /transactions                      # List transactions (filterable)
POST   /transactions                      # Record income/expense
GET    /transactions/:transactionId       # Transaction details

# Global (Super Admin only)
GET    /finance/transactions              # All transactions across clubs
GET    /finance/summary                   # Global or per-club summary
```

### Membership
```
# Club-scoped (under /clubs/:clubId/memberships)
GET    /stats                             # Membership stats (count, revenue)
GET    /my-membership                     # Current year membership (Student)
GET    /                                  # List memberships
POST   /                                  # Create membership record
GET    /:membershipId                     # Membership details
PATCH  /:membershipId/status              # Update status
POST   /:membershipId/payment             # Record payment (auto-activates)

# Global (Super Admin only)
GET    /memberships/                      # All memberships across clubs
```

## Roles & Permissions

| Role | Access |
|------|--------|
| **Super Admin** | Global access — all clubs, all users, dashboard, settings |
| **Club Leader** | Own club only — members, trainings, events, finance, forms |
| **Student** | Own profile, own membership, QR check-in |

## Frontend Pages

| Page | Route | Description |
|------|-------|-------------|
| **Super Admin Dashboard** | `/admin/dashboard` | Stats cards, bar chart, donut chart, notifications, quick actions |
| **Admin Users** | `/admin/users` | User list with search, role filters, toggle active, pagination |
| **Admin Settings** | `/admin/settings` | Profile, General, Notifications, Security tabs |
| **Admin Clubs** | `/admin/clubs` | Club management (route defined) |
| **Events** | `/admin/events` | Event management (route defined) |
| **Help & Support** | `/admin/help` | Help page (route defined) |
| **Notifications** | `/admin/notifications` | Notifications (route defined) |
| **Club Leader Dashboard** | `/leader/dashboard` | KPIs, finance gauge, attendance chart, member table |
| **Student Dashboard** | `/student/dashboard` | Student view (route defined) |

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB running locally or Atlas URI

### Backend Setup
```bash
cd server
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secrets
npm run dev
```

### Frontend Setup
```bash
cd client
npm install
npm run dev
```

### Default Accounts (auto-seeded)
| Email | Password | Role |
|-------|----------|------|
| admin@isimg.tn | admin123 | super_admin |
| leader@isimg.tn | leader123 | club_leader |
| student@isimg.tn | student123 | student |

## Scripts

```bash
# Backend
cd server
npm run dev       # Start dev server (ts-node-dev)
npm run build     # Compile TypeScript
npm start         # Run production build
npm test          # Run Jest tests
npm run lint      # Run ESLint

# Frontend
cd client
npm run dev       # Start Vite dev server
npm run build     # Production build
npm run preview   # Preview production build
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `development` |
| `PORT` | Server port | `3000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/isimg-clubhub` |
| `JWT_ACCESS_SECRET` | Access token secret | - |
| `JWT_REFRESH_SECRET` | Refresh token secret | - |
| `JWT_ACCESS_EXPIRY` | Access token TTL | `15m` |
| `JWT_REFRESH_EXPIRY` | Refresh token TTL | `7d` |
| `CORS_ORIGIN` | Allowed CORS origin | `http://localhost:5173` |

## License

ISC
