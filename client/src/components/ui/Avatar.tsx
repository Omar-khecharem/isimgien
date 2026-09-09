import styles from "./Avatar.module.css";

type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

interface AvatarProps {
  src?: string | null;
  alt?: string;
  name?: string;
  size?: AvatarSize;
}

function getInitials(name?: string): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function Avatar({ src, alt, name, size = "md" }: AvatarProps) {
  return (
    <div
      className={`${styles.avatar} ${styles[`avatar--${size}`]}`}
      role="img"
      aria-label={alt || name || "Avatar"}
    >
      {src ? (
        <img src={src} alt={alt || name || ""} className={styles.image} />
      ) : (
        <span className={styles.initials}>{getInitials(name)}</span>
      )}
    </div>
  );
}
