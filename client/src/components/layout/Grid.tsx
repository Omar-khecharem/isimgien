import { type HTMLAttributes, type ReactNode } from "react";
import styles from "./Grid.module.css";

type GridColumns = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
type GridGap = "none" | "xs" | "sm" | "md" | "lg" | "xl";

interface GridProps extends HTMLAttributes<HTMLDivElement> {
  columns?: GridColumns;
  gap?: GridGap;
  minItemWidth?: string;
  children: ReactNode;
}

export function Grid({
  columns,
  gap = "md",
  minItemWidth,
  className = "",
  children,
  ...props
}: GridProps) {
  const classes = [styles.grid, styles[`gap--${gap}`], className].filter(Boolean).join(" ");

  const style: React.CSSProperties = {};
  if (columns) {
    style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
  } else if (minItemWidth) {
    style.gridTemplateColumns = `repeat(auto-fill, minmax(${minItemWidth}, 1fr))`;
  }

  return (
    <div className={classes} style={style} {...props}>
      {children}
    </div>
  );
}

interface GridItemProps {
  colSpan?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  rowSpan?: 1 | 2 | 3 | 4 | 5 | 6;
  children: ReactNode;
  className?: string;
}

export function GridItem({ colSpan, rowSpan, children, className = "" }: GridItemProps) {
  const classes = [
    className,
    colSpan ? styles[`col-span-${colSpan}`] : "",
    rowSpan ? styles[`row-span-${rowSpan}`] : "",
  ]
    .filter(Boolean)
    .join(" ");

  return <div className={classes}>{children}</div>;
}
