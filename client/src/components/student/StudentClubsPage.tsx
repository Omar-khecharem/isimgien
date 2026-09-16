import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../features/auth";
import { useAllClubs, useJoinClub, useStudentClubs } from "../../features/student";
import styles from "./StudentClubsPage.module.css";

export function StudentClubsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: allClubs, isLoading } = useAllClubs();
  const { data: myClubs } = useStudentClubs();
  const joinClub = useJoinClub();

  const [search, setSearch] = useState("");
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [confirmJoin, setConfirmJoin] = useState<string | null>(null);

  const myClubIds = new Set(myClubs?.map((m) => m.club._id) ?? []);

  const filteredClubs =
    allClubs?.filter(
      (club) =>
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

  const goToDetail = (clubId: string) => {
    navigate(`/student/clubs/${clubId}`);
  };

  return (
    <div className={styles.page}>
      {/* Hero Header */}
      <header className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <h1 className={styles.title}>Clubs</h1>
            <p className={styles.subtitle}>
              Découvrez, rejoignez et gérez vos clubs universitaires.
            </p>
          </div>
          <div className={styles.heroStats}>
            <div className={styles.statCard}>
              <span className={styles.statNumber}>{allClubs?.length ?? 0}</span>
              <span className={styles.statLabel}>Clubs actifs</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statNumber}>{myClubIds.size}</span>
              <span className={styles.statLabel}>Mes clubs</span>
            </div>
          </div>
        </div>
        <div className={styles.heroPattern} />
      </header>

      {/* Search */}
      <div className={styles.searchBar}>
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

      {/* My Clubs */}
      {joinedClubs.length > 0 && (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitleWrap}>
              <div className={styles.sectionIcon}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                </svg>
              </div>
              <h2 className={styles.sectionTitle}>Mes clubs</h2>
            </div>
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
                onClick={() => goToDetail(club._id)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Available Clubs */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitleWrap}>
            <div className={styles.sectionIcon}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
              </svg>
            </div>
            <h2 className={styles.sectionTitle}>
              {search ? `Résultats pour "${search}"` : "Tous les clubs"}
            </h2>
          </div>
          <span className={styles.sectionCount}>{availableClubs.length}</span>
        </div>

        {isLoading ? (
          <div className={styles.clubsGrid}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={styles.skeletonCard}>
                <div className={styles.skeletonCover} />
                <div className={styles.skeletonBody}>
                  <div className={styles.skeletonLogo} />
                  <div className={styles.skeletonLine} style={{ width: "60%" }} />
                  <div className={styles.skeletonLine} style={{ width: "40%" }} />
                  <div className={styles.skeletonLineShort} />
                </div>
              </div>
            ))}
          </div>
        ) : availableClubs.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
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
                onClick={() => goToDetail(club._id)}
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
  onClick,
}: {
  club: {
    _id: string;
    name: string;
    description: string;
    logo?: string | null;
    coverImage?: string | null;
    leader?: { firstName: string; lastName: string } | null;
    settings: { membershipFee: number };
  };
  isJoined: boolean;
  membershipStatus: string | null;
  onJoin: () => void;
  onConfirmJoin: () => void;
  joining: boolean;
  isOwner: boolean;
  confirmOpen?: boolean;
  onConfirmCancel?: () => void;
  academicYear: string;
  onClick: () => void;
}) {
  const initials = club.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const gradientIndex =
    club.name.charCodeAt(0) % 5;
  const gradients = [
    "linear-gradient(135deg, #499A13, #8ECA3C)",
    "linear-gradient(135deg, #276F27, #499A13)",
    "linear-gradient(135deg, #0891b2, #22d3ee)",
    "linear-gradient(135deg, #7c3aed, #a78bfa)",
    "linear-gradient(135deg, #ea580c, #fb923c)",
  ];

  return (
    <div
      className={`${styles.clubCard} ${isJoined ? styles["clubCard--joined"] : ""}`}
      onClick={onClick}
    >
      {/* Cover */}
      <div className={styles.clubCover}>
        {club.coverImage ? (
          <img src={club.coverImage} alt="" className={styles.clubCoverImg} />
        ) : (
          <div className={styles.clubCoverGradient} style={{ background: gradients[gradientIndex] }}>
            <span className={styles.clubCoverInitials}>{initials}</span>
          </div>
        )}
        <div className={styles.clubCoverOverlay} />
        {isJoined && (
          <div className={styles.joinedBadge}>
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
              <path d="M3 7l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Inscrit
          </div>
        )}
        {club.settings.membershipFee > 0 ? (
          <div className={styles.feeBadge}>{club.settings.membershipFee} TND</div>
        ) : (
          <div className={`${styles.feeBadge} ${styles["feeBadge--free"]}`}>Gratuit</div>
        )}
      </div>

      {/* Body */}
      <div className={styles.clubBody}>
        <div className={styles.clubTop}>
          <div className={styles.clubLogoWrap}>
            {club.logo ? (
              <img src={club.logo} alt="" className={styles.clubLogo} />
            ) : (
              <div className={styles.clubLogoPlaceholder} style={{ background: gradients[gradientIndex] }}>
                {initials}
              </div>
            )}
          </div>
          <div className={styles.clubInfo}>
            <h3 className={styles.clubName}>{club.name}</h3>
            {club.leader && (
              <span className={styles.clubLeader}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                {club.leader.firstName} {club.leader.lastName}
              </span>
            )}
          </div>
        </div>

        <p className={styles.clubDesc}>{club.description}</p>

        {/* Actions */}
        <div className={styles.clubActions} onClick={(e) => e.stopPropagation()}>
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
                  ? "En attente"
                  : membershipStatus === "expired"
                  ? "Expiré"
                  : "Inscrit"}
              </span>
            </div>
          ) : confirmOpen ? (
            <div className={styles.confirmRow}>
              <p className={styles.confirmText}>
                Rejoindre {club.name} ?
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
            <div className={styles.cardActions}>
              <button className={styles.detailsBtn} onClick={onClick}>
                Voir détails
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
              <button
                className={styles.joinBtn}
                onClick={onJoin}
                disabled={isOwner}
                title={isOwner ? "Vous êtes le leader de ce club" : "Rejoindre ce club"}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                {isOwner ? "Votre club" : "Rejoindre"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
