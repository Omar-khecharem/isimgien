import { Outlet } from "react-router-dom";
import { StudentSidebar } from "./StudentSidebar";
import styles from "./StudentLayout.module.css";

export function StudentLayout() {
  return (
    <div className={styles.layout}>
      <StudentSidebar />
      <div className={styles.content}>
        <Outlet />
      </div>
    </div>
  );
}
