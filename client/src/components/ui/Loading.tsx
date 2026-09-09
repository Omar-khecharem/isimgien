import styles from "./Loading.module.css";

type SpinnerSize = "xs" | "sm" | "md" | "lg";

interface SpinnerProps {
  size?: SpinnerSize;
  className?: string;
  label?: string;
}

export function Spinner({ size = "md", className = "", label }: SpinnerProps) {
  return (
    <div
      className={`${styles.spinner} ${styles[`spinner--${size}`]} ${className}`}
      role="status"
      aria-label={label || "Loading"}
    >
      <svg viewBox="0 0 24 24" fill="none" className={styles.svg}>
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray="50"
          strokeDashoffset="15"
        />
      </svg>
    </div>
  );
}

export function PageLoader() {
  return (
    <div className={styles.pageLoader}>
      <Spinner size="lg" />
      <p className={styles.pageLoaderText}>Loading...</p>
    </div>
  );
}
