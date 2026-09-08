export enum TrainingStatus {
  DRAFT = "draft",
  PUBLISHED = "published",
  REGISTRATION_OPEN = "registration_open",
  REGISTRATION_CLOSED = "registration_closed",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

export enum EventStatus {
  DRAFT = "draft",
  PUBLISHED = "published",
  REGISTRATION_OPEN = "registration_open",
  REGISTRATION_CLOSED = "registration_closed",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

export enum AttendanceStatus {
  NOT_ATTENDED = "not_attended",
  CHECKED_IN = "checked_in",
  CHECKED_OUT = "checked_out",
  ABSENT = "absent",
  INCOMPLETE = "incomplete",
}

export enum RegistrationStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
  CANCELLED = "cancelled",
}

export enum TransactionType {
  INCOME = "income",
  EXPENSE = "expense",
}

export enum TransactionCategory {
  MEMBERSHIP_FEE = "membership_fee",
  EVENT_REVENUE = "event_revenue",
  TRAINING_FEE = "training_fee",
  EQUIPMENT = "equipment",
  SUPPLIES = "supplies",
  TRANSPORT = "transport",
  OTHER_INCOME = "other_income",
  OTHER_EXPENSE = "other_expense",
}

export enum MembershipStatus {
  ACTIVE = "active",
  EXPIRED = "expired",
  PENDING_PAYMENT = "pending_payment",
}

export enum FormQuestionType {
  SHORT_TEXT = "short_text",
  LONG_TEXT = "long_text",
  EMAIL = "email",
  NUMBER = "number",
  SINGLE_CHOICE = "single_choice",
  MULTIPLE_CHOICE = "multiple_choice",
  DROPDOWN = "dropdown",
  DATE = "date",
}

export enum RegistrationTargetType {
  TRAINING = "training",
  EVENT = "event",
}

export enum NotificationType {
  REGISTRATION_RECEIVED = "registration_received",
  REGISTRATION_APPROVED = "registration_approved",
  REGISTRATION_REJECTED = "registration_rejected",
  TRAINING_PUBLISHED = "training_published",
  EVENT_PUBLISHED = "event_published",
  ATTENDANCE_CONFIRMED = "attendance_confirmed",
  GENERAL = "general",
}
