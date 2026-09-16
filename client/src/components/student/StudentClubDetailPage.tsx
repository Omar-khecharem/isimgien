import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../features/auth";
import { clubsService } from "../../features/clubs/clubsService";
import { useJoinClub, useStudentClubs } from "../../features/student";
import styles from "./StudentClubDetailPage.module.css";

export function StudentClubDetailPage() {
  const { clubId } = useParams<{ clubId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const joinClub = useJoinClub();
  const { data: myClubs } = useStudentClubs();

  const [confirmJoin, setConfirmJoin] = useState(false);
  const [joining, setJoining] = useState(false);

  const { data: club, isLoading, error } = useQuery({
    queryKey: ["club", clubId],
    queryFn: async () => {
      const res = await clubsService.getById(clubId!);
      return res.data;
    },
    enabled: !!clubId,
  });

  const membership = myClubs?.find((m) => m.club._id === clubId);
  const isJoined = !!membership;
  const membershipStatus = membership?.membership.status ?? null;

  const currentYear = new Date().getFullYear();
  const academicYear = `${currentYear}-${currentYear + 1}`;

  const handleJoin = async () => {
    if (!clubId) return;
    setJoining(true);
    try {
      await joinClub.mutateAsync({ clubId, academicYear });
      setConfirmJoin(false);
    } catch {
    } finally {
      setJoining(false);
    }
  };

  const initials = club
    ? club.name
        .split(" ")
        .map((w: string) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "";

  const gradientIndex = club ? club.name.charCodeAt(0) % 5 : 0;
  const gradients = [
    "linear-gradient(135deg, #499A13, #8ECA3C)",
    "linear-gradient(135deg, #276F27, #499A13)",
    "linear-gradient(135deg, #0891b2, #22d3ee)",
    "linear-gradient(135deg, #7c3aed, #a78bfa)",
    "linear-gradient(135deg, #ea580c, #fb923c)",
  ];

  if (isLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingState}>
          <div className={styles.loadingDots}>
            <span /><span /><span />
          </div>
          <p className={styles.loadingText}>Chargement du club...</p>
        </div>
      </div>
    );
  }

  if (error || !club) {
    return (
      <div className={styles.page}>
        <div className={styles.errorState}>
          <div className={styles.errorIcon}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M15 9l-6 6M9 9l6 6" />
            </svg>
          </div>
          <p className={styles.errorTitle}>Club introuvable</p>
          <p className={styles.errorDesc}>Ce club n'existe pas ou a été supprimé.</p>
          <button className={styles.backBtn} onClick={() => navigate("/student/clubs")}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Retour aux clubs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Back Navigation */}
      <button className={styles.backLink} onClick={() => navigate("/student/clubs")}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Retour aux clubs
      </button>

      {/* Hero Banner */}
      <div className={styles.hero}>
        {club.coverImage ? (
          <img src={club.coverImage} alt="" className={styles.heroImg} />
        ) : (
          <div className={styles.heroGradient} style={{ background: gradients[gradientIndex] }}>
            <span className={styles.heroInitials}>{initials}</span>
          </div>
        )}
        <div className={styles.heroOverlay} />
      </div>

      {/* Club Header */}
      <div className={styles.clubHeader}>
        <div className={styles.clubLogoWrap}>
          {club.logo ? (
            <img src={club.logo} alt="" className={styles.clubLogo} />
          ) : (
            <div className={styles.clubLogoPlaceholder} style={{ background: gradients[gradientIndex] }}>
              {initials}
            </div>
          )}
        </div>
        <div className={styles.clubHeaderInfo}>
          <h1 className={styles.clubName}>{club.name}</h1>
          {club.leader && (
            <p className={styles.clubLeader}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              Leader : {club.leader.firstName} {club.leader.lastName}
            </p>
          )}
          <div className={styles.clubMeta}>
            {club.establishedDate && (
              <span className={styles.metaItem}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <path d="M16 2v4M8 2v4M3 10h18" />
                </svg>
                Fondé en {new Date(club.establishedDate).getFullYear()}
              </span>
            )}
            <span className={styles.metaItem}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
              </svg>
              {club.settings.membershipFee > 0
                ? `${club.settings.membershipFee} TND / ${club.settings.membershipPeriodMonths} mois`
                : "Inscription gratuite"}
            </span>
          </div>
        </div>
        <div className={styles.clubHeaderActions}>
          {isJoined ? (
            <span
              className={`${styles.statusBadge} ${
                membershipStatus === "active"
                  ? styles["statusBadge--active"]
                  : membershipStatus === "pending_payment"
                  ? styles["statusBadge--pending"]
                  : styles["statusBadge--expired"]
              }`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                <path d="M22 4L12 14.01l-3-3" />
              </svg>
              {membershipStatus === "active"
                ? "Membre actif"
                : membershipStatus === "pending_payment"
                ? "En attente"
                : membershipStatus === "expired"
                ? "Expiré"
                : "Inscrit"}
            </span>
          ) : confirmJoin ? (
            <div className={styles.confirmGroup}>
              <button
                className={styles.confirmBtn}
                onClick={handleJoin}
                disabled={joining}
              >
                {joining ? "..." : "Confirmer"}
              </button>
              <button
                className={styles.cancelBtn}
                onClick={() => setConfirmJoin(false)}
                disabled={joining}
              >
                Annuler
              </button>
            </div>
          ) : (
            <button
              className={styles.joinBtn}
              onClick={() => setConfirmJoin(true)}
              disabled={club.leader?._id === user?._id}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
              {club.leader?._id === user?._id ? "Votre club" : "Rejoindre ce club"}
            </button>
          )}
        </div>
      </div>

      {/* Content Grid */}
      <div className={styles.contentGrid}>
        {/* About */}
        <div className={styles.aboutCard}>
          <div className={styles.cardHeader}>
            <div className={styles.cardIcon}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
              </svg>
            </div>
            <h2 className={styles.cardTitle}>À propos</h2>
          </div>
          <p className={styles.aboutText}>{club.description}</p>
        </div>

        {/* Sidebar */}
        <div className={styles.sidebar}>
          {/* Contact */}
          {(club.contactEmail || club.contactPhone) && (
            <div className={styles.infoCard}>
              <div className={styles.cardHeader}>
                <div className={styles.cardIcon}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                  </svg>
                </div>
                <h3 className={styles.cardTitle}>Contact</h3>
              </div>
              <div className={styles.infoList}>
                {club.contactEmail && (
                  <a href={`mailto:${club.contactEmail}`} className={styles.infoItem}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <path d="M22 6l-10 7L2 6" />
                    </svg>
                    <span>{club.contactEmail}</span>
                  </a>
                )}
                {club.contactPhone && (
                  <a href={`tel:${club.contactPhone}`} className={styles.infoItem}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                    </svg>
                    <span>{club.contactPhone}</span>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Social Links */}
          {club.socialLinks && Object.values(club.socialLinks).some(Boolean) && (
            <div className={styles.infoCard}>
              <div className={styles.cardHeader}>
                <div className={styles.cardIcon}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
                  </svg>
                </div>
                <h3 className={styles.cardTitle}>Liens</h3>
              </div>
              <div className={styles.infoList}>
                {club.socialLinks.website && (
                  <a href={club.socialLinks.website} target="_blank" rel="noopener noreferrer" className={styles.infoItem}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
                    </svg>
                    <span>Site web</span>
                  </a>
                )}
                {club.socialLinks.facebook && (
                  <a href={club.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className={styles.infoItem}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                    </svg>
                    <span>Facebook</span>
                  </a>
                )}
                {club.socialLinks.instagram && (
                  <a href={club.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className={styles.infoItem}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
                      <path d="M17.5 6.5h.01" />
                    </svg>
                    <span>Instagram</span>
                  </a>
                )}
                {club.socialLinks.linkedin && (
                  <a href={club.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className={styles.infoItem}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z" />
                      <rect x="2" y="9" width="4" height="12" />
                      <circle cx="4" cy="4" r="2" />
                    </svg>
                    <span>LinkedIn</span>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Membership Info */}
          <div className={styles.infoCard}>
            <div className={styles.cardHeader}>
              <div className={styles.cardIcon}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                  <path d="M1 10h22" />
                </svg>
              </div>
              <h3 className={styles.cardTitle}>Adhésion</h3>
            </div>
            <div className={styles.infoList}>
              <div className={styles.infoItemStatic}>
                <span className={styles.infoLabel}>Cotisation</span>
                <span className={styles.infoValue}>
                  {club.settings.membershipFee > 0
                    ? `${club.settings.membershipFee} TND`
                    : "Gratuit"}
                </span>
              </div>
              <div className={styles.infoItemStatic}>
                <span className={styles.infoLabel}>Durée</span>
                <span className={styles.infoValue}>{club.settings.membershipPeriodMonths} mois</span>
              </div>
              <div className={styles.infoItemStatic}>
                <span className={styles.infoLabel}>Validation</span>
                <span className={styles.infoValue}>
                  {club.settings.requireRegistrationValidation ? "Requise" : "Automatique"}
                </span>
              </div>
              {club.settings.defaultTrainingCapacity && (
                <div className={styles.infoItemStatic}>
                  <span className={styles.infoLabel}>Capacité</span>
                  <span className={styles.infoValue}>{club.settings.defaultTrainingCapacity} places</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
