import { Card, CardBody, Button, EmptyState } from "../../../components/ui";
import { AttendanceStatusBadge } from "./AttendanceStatusBadge";
import { AttendanceStatus } from "../attendanceService";
import type { UseMutationResult } from "@tanstack/react-query";
import styles from "../AttendanceSession.module.css";

interface Participant {
  userId: string;
  name: string;
  email: string;
  status: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  method: string;
}

interface ParticipantAttendanceTableProps {
  participants: Participant[];
  isActive: boolean;
  checkIn: UseMutationResult<any, Error, string>;
  checkOut: UseMutationResult<any, Error, string>;
}

function formatTime(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ParticipantAttendanceTable({
  participants,
  isActive,
  checkIn,
  checkOut,
}: ParticipantAttendanceTableProps) {
  if (participants.length === 0) {
    return (
      <Card>
        <CardBody>
          <EmptyState
            title="Aucun participant"
            description="Démarrez une session de présence pour voir les participants."
          />
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardBody padding="none">
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Étudiant</th>
                <th>Inscription</th>
                <th>Arrivée</th>
                <th>Départ</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {participants.map((p) => {
                const status = p.status as AttendanceStatus;
                const canCheckIn =
                  isActive && status === AttendanceStatus.NOT_ATTENDED;
                const canCheckOut =
                  isActive && status === AttendanceStatus.CHECKED_IN;

                return (
                  <tr key={p.userId}>
                    <td className={styles.tableCell}>
                      <div className={styles.studentCell}>
                        <span className={styles.studentName}>{p.name}</span>
                        <span className={styles.studentEmail}>{p.email}</span>
                      </div>
                    </td>
                    <td className={styles.tableCell}>
                      <span className={styles.registrationBadge}>Active</span>
                    </td>
                    <td className={styles.tableCell}>
                      {formatTime(p.checkInTime)}
                    </td>
                    <td className={styles.tableCell}>
                      {formatTime(p.checkOutTime)}
                    </td>
                    <td className={styles.tableCell}>
                      <AttendanceStatusBadge status={status} />
                    </td>
                    <td className={styles.tableCell}>
                      <div className={styles.actionButtons}>
                        {canCheckIn && (
                          <Button
                            variant="primary"
                            size="xs"
                            onClick={() => checkIn.mutate(p.userId)}
                            loading={checkIn.isPending}
                          >
                            Check-in
                          </Button>
                        )}
                        {canCheckOut && (
                          <Button
                            variant="secondary"
                            size="xs"
                            onClick={() => checkOut.mutate(p.userId)}
                            loading={checkOut.isPending}
                          >
                            Check-out
                          </Button>
                        )}
                        {!canCheckIn && !canCheckOut && (
                          <span className={styles.noAction}>—</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardBody>
    </Card>
  );
}
