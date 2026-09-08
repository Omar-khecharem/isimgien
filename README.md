# ISIMG ClubHub

Backend API for managing student clubs at ISIMG (Institut Supérieur d'Informatique et de Multimédia de Gafsa).

## Tech Stack

- **Runtime**: Node.js + TypeScript
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Validation**: Zod
- **Auth**: JWT (access + refresh tokens) + bcrypt

## Project Structure

```
server/
├── src/
│   ├── config/          # Environment, database, constants
│   ├── middleware/       # Auth, RBAC, validation, error handling
│   ├── models/          # Mongoose schemas & models
│   ├── modules/         # Feature modules (controller/service/repo/validation)
│   ├── routes/          # Central route registry
│   ├── seeds/           # Super admin seed
│   ├── shared/          # Enums, types, utils (ApiError, ApiResponse, asyncHandler)
│   ├── app.ts           # Express app setup
│   └── server.ts        # Entry point
├── .env.example
├── package.json
├── tsconfig.json
└── jest.config.js
```

## Modules

| Module | Description |
|--------|-------------|
| **Auth** | Registration, login, logout, token refresh, password management |
| **Clubs** | CRUD, leader assignment, club settings (membership fee, training capacity) |
| **Trainings** | Sessions, schedules, capacity management, CRUD per club |
| **Events** | CRUD per club, date/location management |
| **Forms** | Dynamic forms with versioning, snapshot-on-publish, file upload |
| **Responses** | Form submission handling, multi-file upload |
| **Attendance** | State machine (not_attended → checked_in → checked_out), QR check-in, bulk check-in |
| **Finance** | Transactions (income/expense), balance, category breakdown, per-club treasury |
| **Membership** | Fee tracking, payment records, auto-activation on full payment, per-academic-year |

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

### Clubs
```
GET    /clubs                  # List all active clubs
POST   /clubs                  # Create club (Super Admin)
GET    /clubs/:clubId          # Get club details
PATCH  /clubs/:clubId          # Update club (Super Admin / Club Leader)
DELETE /clubs/:clubId          # Deactivate club (Super Admin)
PATCH  /clubs/:clubId/leader   # Assign club leader (Super Admin)
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
| **Super Admin** | Global access to everything |
| **Club Leader** | Own club only (assigned via `clubs/:clubId/leader`) |
| **Student** | Own profile + own membership status + QR check-in |

## Getting Started

```bash
# 1. Install dependencies
cd server
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secrets

# 3. Seed super admin (runs automatically on first start)

# 4. Start dev server
npm run dev

# 5. Run tests
npm test
```

## Scripts

```bash
npm run dev       # Start dev server (ts-node-dev)
npm run build     # Compile TypeScript
npm start         # Run production build
npm test          # Run Jest tests
npm run lint      # Run ESLint
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

## Testing

```bash
npm test                          # Run all tests
npm test -- --testPathPatterns=attendance  # Run specific module tests
npm test -- --verbose             # Verbose output
```

## License

ISC
