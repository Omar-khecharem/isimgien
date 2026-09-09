import { useState, type ReactNode } from "react";
import styles from "./Tabs.module.css";

interface Tab {
  key: string;
  label: string;
  icon?: ReactNode;
  count?: number;
}

interface TabsProps {
  tabs: Tab[];
  activeKey?: string;
  onChange?: (key: string) => void;
  children: ReactNode;
  size?: "sm" | "md";
}

export function Tabs({ tabs, activeKey, onChange, children, size = "md" }: TabsProps) {
  const [internalActive, setInternalActive] = useState(tabs[0]?.key ?? "");
  const current = activeKey ?? internalActive;

  const handleChange = (key: string) => {
    if (activeKey === undefined) setInternalActive(key);
    onChange?.(key);
  };

  return (
    <div>
      <div className={`${styles.tabs} ${styles[`tabs--${size}`]}`} role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            role="tab"
            aria-selected={current === tab.key}
            className={`${styles.tab} ${current === tab.key ? styles["tab--active"] : ""}`}
            onClick={() => handleChange(tab.key)}
          >
            {tab.icon && <span className={styles.tabIcon} aria-hidden="true">{tab.icon}</span>}
            {tab.label}
            {tab.count !== undefined && (
              <span className={styles.tabCount}>{tab.count}</span>
            )}
          </button>
        ))}
      </div>
      <div role="tabpanel">{children}</div>
    </div>
  );
}
