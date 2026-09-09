import { type HTMLAttributes, type ReactNode } from "react";
import styles from "./Container.module.css";

type ContainerSize = "sm" | "md" | "lg" | "xl" | "full";

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  size?: ContainerSize;
  children: ReactNode;
}

export function Container({ size = "lg", className = "", children, ...props }: ContainerProps) {
  return (
    <div className={`${styles.container} ${styles[`container--${size}`]} ${className}`} {...props}>
      {children}
    </div>
  );
}
