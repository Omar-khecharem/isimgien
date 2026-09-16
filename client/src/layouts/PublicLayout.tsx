import { Outlet } from "react-router-dom";
import styles from "./PublicLayout.module.css";

export function PublicLayout() {
  return (
    <div className={styles.layout}>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
