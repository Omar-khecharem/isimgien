import { useParams } from "react-router-dom";
import { Spinner, Badge } from "../../../components/ui";
import { useAttendanceSession } from "../useAttendanceSession";
import { SessionTimer } from "./SessionTimer";
import { AttendanceSummary } from "./AttendanceSummary";
import { AttendanceActions } from "./AttendanceActions";
import { ParticipantAttendanceTable } from "./ParticipantAttendanceTable";
import styles from "../AttendanceSession.module.css";

export function AttendanceSessionPage() {
  const { clubId, trainingId } = useParams<{
    clubId: string;
    trainingId: string;
  }>();

  if (!clubId || !trainingId) {
    return (
      <div className={styles.page}>
        <p>Paramètres manquants.</p>
      </div>
    );
  }

  return (
    <AttendanceSessionContent clubId={clubId} trainingId={trainingId} />
  );
}

function AttendanceSessionContent({
  clubId,
  trainingId,
}: {
  clubId: string;
  trainingId: string;
}) {
  const {
    session,
    training,
    stats,
    isActive,
    hasSession,
    isLoading,
    startSession,
    closeSession,
    checkIn,
    checkOut,
  } = useAttendanceSession(clubId, trainingId);

  if (isLoading) {
    return (
      <div className={styles.loadingState}>
        <Spinner size="lg" />
        <p>Chargement de la session...</p>
      </div>
    );
  }

  const trainingData = session?.training || training;
  const title = trainingData?.title || "Formation";
  const date = trainingData?.date || "";
  const startTime = trainingData?.startTime || "";
  const endTime = trainingData?.endTime || "";
  const location = trainingData?.location || "";

  const formattedDate = date
    ? new Date(date).toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  const participants = session?.participants ?? [];
  const hasNotAttended = participants.some(
    (p) => p.status === "not_attended"
  );
  const hasCheckedIn = participants.some(
    (p) => p.status === "checked_in"
  );

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>{title}</h1>
          <div className={styles.meta}>
            {location && (
              <span className={styles.metaItem}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M7 1.5a4 4 0 014 4c0 3-4 6-4 6s-4-3-4-6a4 4 0 014-4z"
                    stroke="currentColor"
                    strokeWidth="1.2"
                  />
                  <circle
                    cx="7"
                    cy="5.5"
                    r="1.5"
                    stroke="currentColor"
                    strokeWidth="1.2"
                  />
                </svg>
                {location}
              </span>
            )}
            {formattedDate && (
              <span className={styles.metaItem}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <rect
                    x="2"
                    y="2"
                    width="10"
                    height="10"
                    rx="1"
                    stroke="currentColor"
                    strokeWidth="1.2"
                  />
                  <path
                    d="M2 5h10"
                    stroke="currentColor"
                    strokeWidth="1.2"
                  />
                </svg>
                {formattedDate}
              </span>
            )}
            {startTime && (
              <span className={styles.metaItem}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <circle
                    cx="7"
                    cy="7"
                    r="5.5"
                    stroke="currentColor"
                    strokeWidth="1.2"
                  />
                  <path
                    d="M7 4v3l2 1.5"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {startTime} — {endTime}
              </span>
            )}
          </div>
        </div>
        <div className={styles.headerRight}>
          {hasSession && (
            <Badge variant={isActive ? "success" : "default"} size="md">
              {isActive ? "Session active" : "Session terminée"}
            </Badge>
          )}
          {hasSession && (
            <div className={styles.timer}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle
                  cx="7"
                  cy="7"
                  r="5.5"
                  stroke="currentColor"
                  strokeWidth="1.2"
                />
                <path
                  d="M7 4v3l2 1.5"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <SessionTimer
                startTime={participants[0]?.checkInTime || new Date().toISOString()}
                isActive={isActive}
              />
            </div>
          )}
        </div>
      </header>

      {hasSession && <AttendanceSummary stats={stats} />}

      <AttendanceActions
        hasSession={hasSession}
        isActive={isActive}
        hasNotAttended={hasNotAttended}
        hasCheckedIn={hasCheckedIn}
        startSession={startSession}
        closeSession={closeSession}
      />

      <ParticipantAttendanceTable
        participants={participants}
        isActive={isActive}
        checkIn={checkIn}
        checkOut={checkOut}
      />
    </div>
  );
}
