import { useState } from "react";
import { useAuth } from "../../features/auth";
import { useAllClubs, useJoinClub, useStudentClubs } from "../../features/student";
import styles from "./StudentClubsPage.module.css";

export function StudentClubsPage() {
  const { user } = useAuth();
  const { data: allClubs } = useAllClubs();
  const { data: myClubs } = useStudentClubs();
  const joinClub = useJoinClub();

  const [search, setSearch] = useState("");
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [confirmJoin, setConfirmJoin] = useState<string | null>(null);

  const myClubIds = new Set(
    myClubs?.map((m) => m.club._id) ?? []
  );

  const filteredClubs =
    allClubs?.filter((club) =>
      club.name.toLowerCase().includes(search.toLowerCase()) ||
      club.description.toLowerCase().includes(search.toLowerCase())
    ) ?? [];

  const joinedClubs = filteredClubs.filter((c) => myClubIds.has(c._id));
  const availableClubs = filteredClubs.filter((c) => !myClubIds.has(c._id));

  const currentYear = new Date().getFullYear();
  const academicYear = `${currentYear}-${currentYear + 1}`;

  const handleJoin = async (clubId: string) => {
    setJoiningId(clubId);
    try {
      await joinClub.mutateAsync({ clubId, academicYear });
      setConfirmJoin(null);
    } catch {
    } finally {
      setJoiningId(null);
    }
  };

  const getMembershipStatus = (clubId: string) => {
    const membership = myClubs?.find((m) => m.club._id === clubId);
    if (!membership) return null;
    return membership.membership.status;
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Clubs</h1>
          <p className={styles.subtitle}>
            Découvrez et rejoignez les clubs de l'ISIMGIEN.
          </p>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.searchBox}>
            <svg className={styles.searchIcon} width="18" height="18" viewBox="0 0 18 18" fill="none">
              <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M12.5 12.5l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input
              className={styles.searchInput}
              type="text"
              placeholder="Rechercher un club..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className={styles.searchClear} onClick={() => setSearch("")} aria-label="Effacer">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M3.5 3.5l7 7M10.5 3.5l-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* My Clubs */}
      {joinedClubs.length > 0 && (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Mes clubs</h2>
            <span className={styles.sectionCount}>{joinedClubs.length}</span>
          </div>
          <div className={styles.clubsGrid}>
            {joinedClubs.map((club) => (
              <ClubCard
                key={club._id}
                club={club}
                isJoined={true}
                membershipStatus={getMembershipStatus(club._id)}
                onJoin={() => {}}
                onConfirmJoin={() => {}}
                joining={false}
                isOwner={false}
                academicYear={academicYear}
              />
            ))}
          </div>
        </section>
      )}

      {/* Available Clubs */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            {search ? `Résultats pour "${search}"` : "Tous les clubs"}
          </h2>
          <span className={styles.sectionCount}>{availableClubs.length}</span>
        </div>

        {availableClubs.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L4 6v5c0 5 3.5 9.5 8 11 4.5-1.5 8-6 8-11V6l-8-4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className={styles.emptyTitle}>
              {search ? "Aucun club trouvé" : "Aucun club disponible"}
            </p>
            <p className={styles.emptyDesc}>
              {search
                ? "Essayez avec un autre terme de recherche."
                : "Aucun club n'est actuellement ouvert aux inscriptions."}
            </p>
          </div>
        ) : (
          <div className={styles.clubsGrid}>
            {availableClubs.map((club) => (
              <ClubCard
                key={club._id}
                club={club}
                isJoined={false}
                membershipStatus={null}
                onJoin={() => setConfirmJoin(club._id)}
                onConfirmJoin={() => handleJoin(club._id)}
                joining={joiningId === club._id}
                isOwner={club.leader?._id === user?._id}
                confirmOpen={confirmJoin === club._id}
                onConfirmCancel={() => setConfirmJoin(null)}
                academicYear={academicYear}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   ClubCard
   ═══════════════════════════════════════════════════════════════════════════ */

function ClubCard({
  club,
  isJoined,
  membershipStatus,
  onJoin,
  onConfirmJoin,
  joining,
  isOwner,
  confirmOpen,
  onConfirmCancel,
  academicYear,
}: {
  club: { _id: string; name: string; description: string; logo?: string | null; coverImage?: string | null; leader?: { firstName: string; lastName: string } | null; settings: { membershipFee: number } };
  isJoined: boolean;
  membershipStatus: string | null;
  onJoin: () => void;
  onConfirmJoin: () => void;
  joining: boolean;
  isOwner: boolean;
  confirmOpen?: boolean;
  onConfirmCancel?: () => void;
  academicYear: string;
}) {
  const initials = club.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className={`${styles.clubCard} ${isJoined ? styles["clubCard--joined"] : ""}`}>
      {/* Cover */}
      <div className={styles.clubCover}>
        {club.coverImage ? (
          <img src={club.coverImage} alt="" className={styles.clubCoverImg} />
        ) : (
          <div className={styles.clubCoverGradient}>
            <span className={styles.clubCoverInitials}>{initials}</span>
          </div>
        )}
        {isJoined && (
          <div className={styles.joinedBadge}>
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
              <path d="M3 7l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Inscrit
          </div>
        )}
      </div>

      {/* Body */}
      <div className={styles.clubBody}>
        <div className={styles.clubTop}>
          <div className={styles.clubLogoWrap}>
            {club.logo ? (
              <img src={club.logo} alt="" className={styles.clubLogo} />
            ) : (
              <div className={styles.clubLogoPlaceholder}>{initials}</div>
            )}
          </div>
          <div className={styles.clubInfo}>
            <h3 className={styles.clubName}>{club.name}</h3>
            {club.leader && (
              <span className={styles.clubLeader}>
                {club.leader.firstName} {club.leader.lastName}
              </span>
            )}
          </div>
        </div>

        <p className={styles.clubDesc}>{club.description}</p>

        <div className={styles.clubMeta}>
          {club.settings.membershipFee > 0 && (
            <span className={styles.clubFee}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2" />
                <path d="M7 4v6M5 5.5h3.5a1 1 0 010 2H5.5a1 1 0 010 2H8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
              {club.settings.membershipFee} TND / an
            </span>
          )}
        </div>

        {/* Actions */}
        <div className={styles.clubActions}>
          {isJoined ? (
            <div className={styles.statusRow}>
              <span
                className={`${styles.statusBadge} ${
                  membershipStatus === "active"
                    ? styles["statusBadge--active"]
                    : membershipStatus === "pending_payment"
                    ? styles["statusBadge--pending"]
                    : styles["statusBadge--expired"]
                }`}
              >
                {membershipStatus === "active"
                  ? "Membre actif"
                  : membershipStatus === "pending_payment"
                  ? "En attente de paiement"
                  : membershipStatus === "expired"
                  ? "Expiré"
                  : "Inscrit"}
              </span>
            </div>
          ) : confirmOpen ? (
            <div className={styles.confirmRow}>
              <p className={styles.confirmText}>
                Rejoindre {club.name} pour {academicYear} ?
              </p>
              <div className={styles.confirmBtns}>
                <button
                  className={styles.confirmBtn}
                  onClick={onConfirmJoin}
                  disabled={joining}
                >
                  {joining ? "..." : "Confirmer"}
                </button>
                <button
                  className={styles.cancelBtn}
                  onClick={onConfirmCancel}
                  disabled={joining}
                >
                  Annuler
                </button>
              </div>
            </div>
          ) : (
            <button
              className={styles.joinBtn}
              onClick={onJoin}
              disabled={isOwner}
              title={isOwner ? "Vous êtes le leader de ce club" : "Rejoindre ce club"}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              {isOwner ? "Votre club" : "Rejoindre"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
