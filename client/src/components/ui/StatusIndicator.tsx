import styles from "./StatusIndicator.module.css";

type StatusType = "active" | "pending" | "inactive" | "success" | "warning" | "danger" | "default" | "info";

interface StatusIndicatorProps {
  status: StatusType;
  label: string;
  pulse?: boolean;
}

export function StatusIndicator({ status, label, pulse = false }: StatusIndicatorProps) {
  const dotClasses = [
    styles.dot,
    styles[`dot--${status}`],
    pulse ? styles["dot--pulse"] : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={styles.status}>
      <span className={dotClasses} aria-hidden="true" />
      <span className={styles.label}>{label}</span>
    </span>
  );
}
