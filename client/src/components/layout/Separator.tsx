import styles from "./Separator.module.css";

type SeparatorOrientation = "horizontal" | "vertical";
type SeparatorSpacing = "none" | "sm" | "md" | "lg";

interface SeparatorProps {
  orientation?: SeparatorOrientation;
  spacing?: SeparatorSpacing;
  className?: string;
}

export function Separator({ orientation = "horizontal", spacing = "none", className = "" }: SeparatorProps) {
  return (
    <div
      className={`${styles.separator} ${styles[`separator--${orientation}`]} ${styles[`spacing--${spacing}`]} ${className}`}
      role="separator"
      aria-orientation={orientation}
    />
  );
}
