import type { ReactNode } from "react";
import styles from "./Badge.module.css";

type BadgeVariant = "default" | "primary" | "success" | "warning" | "danger" | "info";
type BadgeSize = "sm" | "md";

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  children: ReactNode;
}

export function Badge({ variant = "default", size = "md", dot = false, children }: BadgeProps) {
  return (
    <span className={`${styles.badge} ${styles[`badge--${variant}`]} ${styles[`badge--${size}`]}`}>
      {dot && <span className={`${styles.dot} ${styles[`dot--${variant}`]}`} aria-hidden="true" />}
      {children}
    </span>
  );
}
