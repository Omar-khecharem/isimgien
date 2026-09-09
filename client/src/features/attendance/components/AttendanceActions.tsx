import { Button } from "../../../components/ui";
import type { UseMutationResult } from "@tanstack/react-query";
import styles from "../AttendanceSession.module.css";

interface AttendanceActionsProps {
  hasSession: boolean;
  isActive: boolean;
  hasNotAttended: boolean;
  hasCheckedIn: boolean;
  startSession: UseMutationResult<any, Error, void>;
  closeSession: UseMutationResult<any, Error, void>;
}

export function AttendanceActions({
  hasSession,
  isActive,
  hasNotAttended,
  hasCheckedIn,
  startSession,
  closeSession,
}: AttendanceActionsProps) {
  if (!hasSession) {
    return (
      <div className={styles.actionsBar}>
        <Button
          variant="primary"
          size="md"
          onClick={() => startSession.mutate()}
          loading={startSession.isPending}
          icon={
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 3v10l9-5L4 3z" fill="currentColor" />
            </svg>
          }
        >
          Démarrer le Check-in
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.actionsBar}>
      <Button
        variant="primary"
        size="md"
        onClick={() => closeSession.mutate()}
        loading={closeSession.isPending}
        disabled={!isActive}
        icon={
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="4" y="4" width="8" height="8" rx="1" fill="currentColor" />
          </svg>
        }
      >
        {hasCheckedIn ? "Terminer la session / Ouvrir le Check-out" : "Terminer la session"}
      </Button>
      {isActive && hasNotAttended && (
        <span className={styles.actionsHint}>
          {hasNotAttended} participant{hasNotAttended !== 1 ? "s" : ""} en attente de check-in
        </span>
      )}
    </div>
  );
}
