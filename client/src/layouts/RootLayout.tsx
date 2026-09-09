import { Outlet } from "react-router-dom";
import styles from "./RootLayout.module.css";

export function RootLayout() {
  return (
    <div className={styles.layout}>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
