export const ROUTES = {
  // Public
  HOME: "/",
  LOGIN: "/login",

  // Dashboard (authenticated)
  DASHBOARD: "/dashboard",

  // Club Leader / Super Admin
  CLUBS: "/clubs",
  CLUB_DETAIL: "/clubs/:clubId",
  TRAININGS: "/clubs/:clubId/trainings",
  EVENTS: "/clubs/:clubId/events",
  FORMS: "/clubs/:clubId/forms",
  ATTENDANCE: "/clubs/:clubId/trainings/:trainingId/attendance",
  FINANCE: "/clubs/:clubId/finance",
  MEMBERSHIPS: "/clubs/:clubId/memberships",

  // Super Admin
  ADMIN_CLUBS: "/admin/clubs",
  ADMIN_USERS: "/admin/users",
  ADMIN_GLOBAL_ATTENDANCE: "/admin/attendance",
  ADMIN_GLOBAL_FINANCE: "/admin/finance",
  ADMIN_GLOBAL_MEMBERSHIPS: "/admin/memberships",

  // Student
  MY_REGISTRATIONS: "/my/registrations",
  MY_ATTENDANCE: "/my/attendance",
  MY_MEMBERSHIPS: "/my/memberships",
} as const;
