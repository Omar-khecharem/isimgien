import styles from "./StatusBadge.module.css";

type StatusKind =
  | "draft"
  | "published"
  | "active"
  | "inactive"
  | "completed"
  | "cancelled"
  | "pending"
  | "approved"
  | "rejected"
  | "expired"
  | "paid"
  | "unpaid"
  | "partial";

interface StatusBadgeProps {
  status: StatusKind;
  label?: string;
  size?: "sm" | "md";
}

const STATUS_CONFIG: Record<StatusKind, { label: string; variant: "default" | "primary" | "success" | "warning" | "danger" | "info" }> = {
  draft:     { label: "Draft",     variant: "default" },
  published: { label: "Published", variant: "primary" },
  active:    { label: "Active",    variant: "success" },
  inactive:  { label: "Inactive",  variant: "default" },
  completed: { label: "Completed", variant: "success" },
  cancelled: { label: "Cancelled", variant: "danger" },
  pending:   { label: "Pending",   variant: "warning" },
  approved:  { label: "Approved",  variant: "success" },
  rejected:  { label: "Rejected",  variant: "danger" },
  expired:   { label: "Expired",   variant: "danger" },
  paid:      { label: "Paid",      variant: "success" },
  unpaid:    { label: "Unpaid",    variant: "warning" },
  partial:   { label: "Partial",   variant: "info" },
};

export function StatusBadge({ status, label, size = "md" }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.draft;

  return (
    <span
      className={`${styles.badge} ${styles[`badge--${config.variant}`]} ${styles[`badge--${size}`]}`}
    >
      {label || config.label}
    </span>
  );
}
