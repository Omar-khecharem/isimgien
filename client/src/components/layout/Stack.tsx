import { type HTMLAttributes, type ReactNode } from "react";
import styles from "./Stack.module.css";

type StackDirection = "horizontal" | "vertical";
type StackAlign = "start" | "center" | "end" | "stretch";
type StackJustify = "start" | "center" | "end" | "between" | "around";

interface StackProps extends HTMLAttributes<HTMLDivElement> {
  direction?: StackDirection;
  align?: StackAlign;
  justify?: StackJustify;
  gap?: "none" | "xs" | "sm" | "md" | "lg" | "xl";
  wrap?: boolean;
  children: ReactNode;
}

export function Stack({
  direction = "vertical",
  align = "stretch",
  justify = "start",
  gap = "md",
  wrap = false,
  className = "",
  children,
  ...props
}: StackProps) {
  const classes = [
    styles.stack,
    styles[`stack--${direction}`],
    styles[`align--${align}`],
    styles[`justify--${justify}`],
    styles[`gap--${gap}`],
    wrap && styles["stack--wrap"],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}

interface StackItemProps {
  grow?: boolean;
  shrink?: boolean;
  basis?: string;
  children: ReactNode;
  className?: string;
}

export function StackItem({ grow, shrink, basis, children, className = "" }: StackItemProps) {
  return (
    <div
      className={className}
      style={{
        flexGrow: grow ? 1 : undefined,
        flexShrink: shrink ? 1 : undefined,
        flexBasis: basis,
      }}
    >
      {children}
    </div>
  );
}
