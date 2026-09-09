import type { ReactNode } from "react";
import styles from "./Card.module.css";

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
}

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

interface CardBodyProps extends CardProps {}

interface CardFooterProps {
  children: ReactNode;
  className?: string;
  align?: "left" | "center" | "right" | "between";
}

export function Card({ children, className = "", padding = "md" }: CardProps) {
  return (
    <div className={`${styles.card} ${styles[`card--${padding}`]} ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action }: CardHeaderProps) {
  return (
    <div className={styles.header}>
      <div className={styles.headerText}>
        <h3 className={styles.title}>{title}</h3>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
      {action && <div className={styles.headerAction}>{action}</div>}
    </div>
  );
}

export function CardBody({ children, className = "", padding = "md" }: CardBodyProps) {
  return <div className={`${styles.body} ${styles[`body--${padding}`]} ${className}`}>{children}</div>;
}

export function CardFooter({ children, className = "", align = "right" }: CardFooterProps) {
  return (
    <div className={`${styles.footer} ${styles[`footer--${align}`]} ${className}`}>
      {children}
    </div>
  );
}
