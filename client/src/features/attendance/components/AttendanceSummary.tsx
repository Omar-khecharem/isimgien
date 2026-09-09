import { Card, CardBody } from "../../../components/ui";
import type { SessionData } from "../useAttendanceSession";
import styles from "../AttendanceSession.module.css";

interface AttendanceSummaryProps {
  stats: SessionData["stats"];
}

export function AttendanceSummary({ stats }: AttendanceSummaryProps) {
  const items = [
    {
      label: "Inscrits",
      value: stats.registered,
      color: "var(--color-text)",
    },
    {
      label: "Présents",
      value: stats.checkedIn,
      color: "var(--color-primary)",
    },
    {
      label: "Sortis",
      value: stats.checkedOut,
      color: "var(--color-success-600)",
    },
    {
      label: "Incomplets",
      value: stats.incomplete,
      color: "var(--color-warning-600)",
    },
    {
      label: "Absents",
      value: stats.absent,
      color: "var(--color-error-600)",
    },
  ];

  return (
    <div className={styles.summaryGrid}>
      {items.map((item) => (
        <Card key={item.label} className={styles.summaryCard}>
          <CardBody>
            <span
              className={styles.summaryValue}
              style={{ color: item.color }}
            >
              {item.value}
            </span>
            <span className={styles.summaryLabel}>{item.label}</span>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}
