import { Outlet } from "react-router-dom";
import styles from "./AuthLayout.module.css";

export function AuthLayout() {
  return (
    <div className={styles.layout}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <div className={styles.logoMark}>ISIMG</div>
          <div className={styles.logoText}>ClubHub</div>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
