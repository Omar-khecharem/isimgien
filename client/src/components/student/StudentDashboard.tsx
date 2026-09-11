import { useAuth } from "../../features/auth";
import {
  useUpcomingTrainings,
  useUpcomingEvents,
  useMyAttendance,
  useMyMemberships,
  useStudentClubs,
} from "../../features/student";
import { Avatar, Badge, Card, CardBody, EmptyState, Spinner, StatusBadge } from "../ui";
import { Stack, Grid, Separator } from "../layout";
import styles from "./StudentDashboard.module.css";

export function StudentDashboard() {
  const { user } = useAuth();
  const { data: upcomingTrainings, isLoading: trainingsLoading } = useUpcomingTrainings();
  const { data: upcomingEvents, isLoading: eventsLoading } = useUpcomingEvents();
  const { data: attendanceData, isLoading: attendanceLoading } = useMyAttendance(1, 5);
  const { data: membershipsData, isLoading: membershipsLoading } = useMyMemberships();
  const { data: clubsData, isLoading: clubsLoading } = useStudentClubs();

  const isLoading = trainingsLoading || eventsLoading || attendanceLoading || membershipsLoading || clubsLoading;

  return (
    <div className={styles.dashboard}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerText}>
          <h1 className={styles.title}>Dashboard Associatif</h1>
          <p className={styles.subtitle}>
            Gérez votre vie associative, vos formations et vos participations.
          </p>
        </div>
        <div className={styles.headerProfile}>
          <button className={styles.iconButton} aria-label="Notifications">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M15 7a5 5 0 00-10 0c0 5-2 7-2 7h14s-2-2-2-7M11.73 17a2 2 0 01-3.46 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className={styles.notificationDot} />
          </button>
          <div className={styles.profileInfo}>
            <Avatar
              src={user?.avatar}
              name={user ? `${user.firstName} ${user.lastName}` : ""}
              size="sm"
            />
            <div className={styles.profileText}>
              <span className={styles.profileName}>
                {user?.firstName} {user?.lastName}
              </span>
              <span className={styles.profileEmail}>{user?.email}</span>
            </div>
          </div>
        </div>
      </header>

      {isLoading ? (
        <div className={styles.loadingState}>
          <Spinner size="lg" />
          <p>Chargement du tableau de bord...</p>
        </div>
      ) : (
        <div className={styles.content}>
          {/* Section 1: Key Indicators */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Vue d'ensemble</h2>
            <Grid columns={4} gap="md">
              <IndicatorCard
                label="Formations à venir"
                value={upcomingTrainings?.length ?? 0}
                icon={
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <rect x="3" y="2" width="14" height="16" rx="1" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M7 6h6M7 9h6M7 12h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                }
                color="primary"
              />
              <IndicatorCard
                label="Inscriptions actives"
                value={membershipsData?.meta?.total ?? 0}
                icon={
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="7" r="3" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M4 17c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                }
                color="success"
              />
              <IndicatorCard
                label="Participations validées"
                value={attendanceData?.data?.filter(a => a.status === "checked_in" || a.status === "checked_out").length ?? 0}
                icon={
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M7 10l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                }
                color="info"
              />
              <IndicatorCard
                label="Clubs rejoints"
                value={clubsData?.length ?? 0}
                icon={
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M3 8l7-4 7 4v8a1 1 0 01-1 1H4a1 1 0 01-1-1V8z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                    <path d="M7 17v-6h6v6" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                  </svg>
                }
                color="warning"
              />
            </Grid>
          </section>

          {/* Section 2: Upcoming Events */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Prochains événements</h2>
              <Badge variant="primary" size="sm">
                {(upcomingTrainings?.length ?? 0) + (upcomingEvents?.length ?? 0)} à venir
              </Badge>
            </div>
            {(upcomingTrainings?.length ?? 0) + (upcomingEvents?.length ?? 0) === 0 ? (
              <EmptyState
                title="Aucun événement à venir"
                description="Il n'y a pas de formations ou événements prévus pour le moment."
              />
            ) : (
              <Stack gap="md">
                {upcomingTrainings?.slice(0, 3).map((training) => (
                  <EventCard
                    key={training._id}
                    type="training"
                    title={training.title}
                    date={training.date}
                    startTime={training.startTime}
                    endTime={training.endTime}
                    location={training.location}
                    status={training.status}
                    poster={training.poster}
                  />
                ))}
                {upcomingEvents?.slice(0, 3).map((event) => (
                  <EventCard
                    key={event._id}
                    type="event"
                    title={event.title}
                    date={event.date}
                    startTime={event.startTime}
                    endTime={event.endTime}
                    location={event.location}
                    status={event.status}
                    poster={event.poster}
                  />
                ))}
              </Stack>
            )}
          </section>

          <Separator spacing="lg" />

          {/* Section 3: My Registrations */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Mes inscriptions</h2>
            <Card>
              <CardBody padding="none">
                <div className={styles.tableWrapper}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Événement</th>
                        <th>Date</th>
                        <th>Statut</th>
                        <th>Présence</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td colSpan={4}>
                          <EmptyState
                            title="Aucune inscription"
                            description="Vous n'avez pas encore d'inscriptions aux événements."
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardBody>
            </Card>
          </section>

          <Separator spacing="lg" />

          {/* Section 4: My Clubs */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Mes clubs</h2>
            {(clubsData?.length ?? 0) === 0 ? (
              <EmptyState
                title="Aucun club rejoint"
                description="Rejoignez un club pour commencer à participer aux activités."
                action={
                  <Badge variant="primary" size="sm">Parcourir les clubs</Badge>
                }
              />
            ) : (
              <Grid minItemWidth="280px" gap="md">
                {clubsData?.map(({ club, membership }) => (
                  <Card key={club._id}>
                    <CardBody>
                      <div className={styles.clubItem}>
                        <div className={styles.clubAvatar}>
                          <Avatar name={club.name} size="md" />
                        </div>
                        <div className={styles.clubInfo}>
                          <h3 className={styles.clubName}>{club.name}</h3>
                          <StatusBadge
                            status={membership.status === "active" ? "active" : "pending"}
                            size="sm"
                          />
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </Grid>
            )}
          </section>

          <Separator spacing="lg" />

          {/* Section 5: Attendance History */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Historique de présence</h2>
            <Card>
              <CardBody padding="none">
                <div className={styles.tableWrapper}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Formation</th>
                        <th>Arrivée</th>
                        <th>Départ</th>
                        <th>Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendanceLoading ? (
                        <tr>
                          <td colSpan={4}>
                            <div className={styles.tableLoading}>
                              <Spinner size="sm" />
                            </div>
                          </td>
                        </tr>
                      ) : (attendanceData?.data?.length ?? 0) === 0 ? (
                        <tr>
                          <td colSpan={4}>
                            <EmptyState
                              title="Aucun historique"
                              description="Votre historique de présence apparaîtra ici."
                            />
                          </td>
                        </tr>
                      ) : (
                        attendanceData?.data?.map((record) => (
                          <tr key={record._id}>
                            <td className={styles.tableCell}>
                              <span className={styles.tableCellPrimary}>
                                {record.training.title}
                              </span>
                            </td>
                            <td className={styles.tableCell}>
                              {record.checkIn.time
                                ? new Date(record.checkIn.time).toLocaleTimeString("fr-FR", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                : "—"}
                            </td>
                            <td className={styles.tableCell}>
                              {record.checkOut.time
                                ? new Date(record.checkOut.time).toLocaleTimeString("fr-FR", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                : "—"}
                            </td>
                            <td className={styles.tableCell}>
                              <StatusBadge
                                status={
                                  record.status === "checked_out"
                                    ? "completed"
                                    : record.status === "checked_in"
                                    ? "active"
                                    : record.status === "absent"
                                    ? "cancelled"
                                    : "pending"
                                }
                                size="sm"
                              />
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardBody>
            </Card>
          </section>

          <Separator spacing="lg" />

          {/* Section 6: Membership Summary */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Cotisations & Adhésions</h2>
            {(membershipsData?.data?.length ?? 0) === 0 ? (
              <EmptyState
                title="Aucune adhésion"
                description="Vous n'avez pas encore de cotisation enregistrée."
              />
            ) : (
              <Grid minItemWidth="280px" gap="md">
                {membershipsData?.data?.map((membership) => (
                  <Card key={membership._id}>
                    <CardBody>
                      <div className={styles.membershipItem}>
                        <div className={styles.membershipHeader}>
                          <h3 className={styles.membershipClub}>
                            {typeof membership.club === "string"
                              ? membership.club
                              : membership.club.name}
                          </h3>
                          <StatusBadge
                            status={
                              membership.status === "active"
                                ? "active"
                                : membership.status === "expired"
                                ? "expired"
                                : "pending"
                            }
                            size="sm"
                          />
                        </div>
                        <div className={styles.membershipDetails}>
                          <div className={styles.membershipDetail}>
                            <span className={styles.membershipLabel}>Année académique</span>
                            <span className={styles.membershipValue}>{membership.academicYear}</span>
                          </div>
                          <div className={styles.membershipDetail}>
                            <span className={styles.membershipLabel}>Montant payé</span>
                            <span className={styles.membershipValue}>{membership.amountPaid} TND</span>
                          </div>
                          {membership.paymentDate && (
                            <div className={styles.membershipDetail}>
                              <span className={styles.membershipLabel}>Date de paiement</span>
                              <span className={styles.membershipValue}>
                                {new Date(membership.paymentDate).toLocaleDateString("fr-FR")}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </Grid>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Sub-components
   ═══════════════════════════════════════════════════════════════════════════ */

function IndicatorCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: "primary" | "success" | "info" | "warning";
}) {
  return (
    <Card>
      <CardBody>
        <div className={styles.indicator}>
          <div className={`${styles.indicatorIcon} ${styles[`indicatorIcon--${color}`]}`}>
            {icon}
          </div>
          <div className={styles.indicatorContent}>
            <span className={styles.indicatorValue}>{value}</span>
            <span className={styles.indicatorLabel}>{label}</span>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

function EventCard({
  type,
  title,
  date,
  startTime,
  endTime,
  location,
  status,
  poster,
}: {
  type: "training" | "event";
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  status: string;
  poster?: string | null;
}) {
  const formattedDate = new Date(date).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <Card>
      <CardBody>
        <div className={styles.eventCard}>
          {poster && (
            <div className={styles.eventPoster}>
              <img src={poster} alt="" />
            </div>
          )}
          <div className={styles.eventContent}>
            <div className={styles.eventHeader}>
              <Badge variant={type === "training" ? "primary" : "info"} size="sm">
                {type === "training" ? "Formation" : "Événement"}
              </Badge>
              <StatusBadge
                status={
                  status === "completed"
                    ? "completed"
                    : status === "in_progress"
                    ? "active"
                    : status === "cancelled"
                    ? "cancelled"
                    : "draft"
                }
                size="sm"
              />
            </div>
            <h3 className={styles.eventTitle}>{title}</h3>
            <div className={styles.eventMeta}>
              <span className={styles.eventMetaItem}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <rect x="2" y="2" width="10" height="10" rx="1" stroke="currentColor" strokeWidth="1.2" />
                  <path d="M2 5h10" stroke="currentColor" strokeWidth="1.2" />
                  <path d="M5 1v2M9 1v2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
                {formattedDate}
              </span>
              <span className={styles.eventMetaItem}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2" />
                  <path d="M7 4v3l2 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {startTime} — {endTime}
              </span>
              <span className={styles.eventMetaItem}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M7 1.5a4 4 0 014 4c0 3-4 6-4 6s-4-3-4-6a4 4 0 014-4z" stroke="currentColor" strokeWidth="1.2" />
                  <circle cx="7" cy="5.5" r="1.5" stroke="currentColor" strokeWidth="1.2" />
                </svg>
                {location}
              </span>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
