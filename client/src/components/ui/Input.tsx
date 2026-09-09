import { type InputHTMLAttributes, forwardRef, type ReactNode } from "react";
import styles from "./Input.module.css";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftAddon?: ReactNode;
  rightAddon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftAddon, rightAddon, required, className = "", id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className={`${styles.inputGroup} ${className}`}>
        {label && (
          <label className={styles.label} htmlFor={inputId}>
            {label}
            {required && <span className={styles.required} aria-hidden="true"> *</span>}
          </label>
        )}
        <div
          className={`${styles.wrapper} ${error ? styles["wrapper--error"] : ""} ${leftAddon ? styles["wrapper--left"] : ""} ${rightAddon ? styles["wrapper--right"] : ""}`}
        >
          {leftAddon && <span className={styles.addon}>{leftAddon}</span>}
          <input
            ref={ref}
            id={inputId}
            className={styles.input}
            required={required}
            aria-invalid={error ? "true" : undefined}
            aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            {...props}
          />
          {rightAddon && <span className={styles.addon}>{rightAddon}</span>}
        </div>
        {error && <p className={styles.error} id={`${inputId}-error`} role="alert">{error}</p>}
        {hint && !error && <p className={styles.hint} id={`${inputId}-hint`}>{hint}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
