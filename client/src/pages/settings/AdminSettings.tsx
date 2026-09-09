import { useState } from "react";
import { useAuth } from "../../features/auth";
import { Avatar } from "../../components/ui";
import styles from "./AdminSettings.module.css";

type Tab = "profile" | "general" | "notifications" | "security";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  {
    id: "profile",
    label: "Profil",
    icon: (
      <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M4 20c0-3.5 3-6.5 7-6.5s7 3 7 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "general",
    label: "Général",
    icon: (
      <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="11" r="3" stroke="currentColor" strokeWidth="1.5" />
        <path d="M11 2v3M11 17v3M2 11h3M17 11h3M4.9 4.9l2.1 2.1M14.9 14.9l2.1 2.1M4.9 17.1l2.1-2.1M14.9 7.1l2.1-2.1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: (
      <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
        <path d="M16 8a5 5 0 10-10 0c0 5.5-2.5 7-2.5 7h15S16 13.5 16 8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12.8 18.5a2 2 0 01-3.6 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "security",
    label: "Sécurité",
    icon: (
      <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
        <path d="M11 2L4 5v5c0 5 3 8 7 9.5 4-1.5 7-4.5 7-9.5V5L11 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M8 11l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      className={`${styles.toggle} ${checked ? styles["toggle--on"] : ""}`}
      onClick={() => onChange(!checked)}
      role="switch"
      aria-checked={checked}
    >
      <span className={styles.toggleThumb} />
    </button>
  );
}

export function AdminSettings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [saved, setSaved] = useState(false);

  const [profile, setProfile] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: "",
  });

  const [general, setGeneral] = useState({
    platformName: "ISIMGIEN ClubHub",
    platformDesc: "Plateforme de gestion des clubs universitaires",
    maintenance: false,
    registration: true,
  });

  const [notifs, setNotifs] = useState({
    email: true,
    push: true,
    weekly: false,
    mentions: true,
  });

  const [security, setSecurity] = useState({
    twoFactor: false,
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Paramètres</h1>
          <p className={styles.subtitle}>Gérez votre profil et la configuration de la plateforme</p>
        </div>
        {saved && (
          <div className={styles.savedBadge}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="7" stroke="#0A5F3A" strokeWidth="1.5" />
              <path d="M5 8l2 2 4-4" stroke="#0A5F3A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Enregistré
          </div>
        )}
      </div>

      <div className={styles.layout}>
        {/* Sidebar Tabs */}
        <nav className={styles.tabSidebar}>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`${styles.tabBtn} ${activeTab === tab.id ? styles["tabBtn--active"] : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className={styles.tabIcon}>{tab.icon}</span>
              <span className={styles.tabLabel}>{tab.label}</span>
            </button>
          ))}
        </nav>

        {/* Content */}
        <div className={styles.tabContent}>
          {/* ─── Profile ──────────────────────────────────────── */}
          {activeTab === "profile" && (
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Profil</h2>
                <p className={styles.sectionDesc}>Informations personnelles et coordonnées</p>
              </div>

              <div className={styles.avatarRow}>
                <Avatar name={user ? `${user.firstName} ${user.lastName}` : ""} size="lg" />
                <div className={styles.avatarInfo}>
                  <button className={styles.uploadBtn}>Changer la photo</button>
                  <p className={styles.uploadHint}>JPG, PNG ou GIF. Max 2 Mo.</p>
                </div>
              </div>

              <div className={styles.formGrid}>
                <div className={styles.field}>
                  <label className={styles.label}>Prénom</label>
                  <input
                    className={styles.input}
                    value={profile.firstName}
                    onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Nom</label>
                  <input
                    className={styles.input}
                    value={profile.lastName}
                    onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Email</label>
                  <input
                    className={styles.input}
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Téléphone</label>
                  <input
                    className={styles.input}
                    type="tel"
                    placeholder="+216 XX XXX XXX"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className={styles.actions}>
                <button className={styles.saveBtn} onClick={handleSave}>Enregistrer</button>
              </div>
            </div>
          )}

          {/* ─── General ──────────────────────────────────────── */}
          {activeTab === "general" && (
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Général</h2>
                <p className={styles.sectionDesc}>Configuration globale de la plateforme</p>
              </div>

              <div className={styles.formGrid}>
                <div className={styles.field} style={{ gridColumn: "1 / -1" }}>
                  <label className={styles.label}>Nom de la plateforme</label>
                  <input
                    className={styles.input}
                    value={general.platformName}
                    onChange={(e) => setGeneral({ ...general, platformName: e.target.value })}
                  />
                </div>
                <div className={styles.field} style={{ gridColumn: "1 / -1" }}>
                  <label className={styles.label}>Description</label>
                  <textarea
                    className={styles.textarea}
                    rows={2}
                    value={general.platformDesc}
                    onChange={(e) => setGeneral({ ...general, platformDesc: e.target.value })}
                  />
                </div>
              </div>

              <div className={styles.toggleList}>
                <div className={styles.toggleRow}>
                  <div className={styles.toggleInfo}>
                    <div className={styles.toggleTitle}>Mode maintenance</div>
                    <div className={styles.toggleDesc}>Désactive l'accès aux utilisateurs non admin</div>
                  </div>
                  <Toggle checked={general.maintenance} onChange={(v) => setGeneral({ ...general, maintenance: v })} />
                </div>
                <div className={styles.toggleRow}>
                  <div className={styles.toggleInfo}>
                    <div className={styles.toggleTitle}>Inscriptions ouvertes</div>
                    <div className={styles.toggleDesc}>Permet aux nouveaux utilisateurs de s'inscrire</div>
                  </div>
                  <Toggle checked={general.registration} onChange={(v) => setGeneral({ ...general, registration: v })} />
                </div>
              </div>

              <div className={styles.actions}>
                <button className={styles.saveBtn} onClick={handleSave}>Enregistrer</button>
              </div>
            </div>
          )}

          {/* ─── Notifications ────────────────────────────────── */}
          {activeTab === "notifications" && (
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Notifications</h2>
                <p className={styles.sectionDesc}>Choisissez comment vous souhaitez être notifié</p>
              </div>

              <div className={styles.toggleList}>
                <div className={styles.toggleRow}>
                  <div className={styles.toggleInfo}>
                    <div className={styles.toggleTitle}>Notifications par email</div>
                    <div className={styles.toggleDesc}>Recevez un résumé quotidien des activités</div>
                  </div>
                  <Toggle checked={notifs.email} onChange={(v) => setNotifs({ ...notifs, email: v })} />
                </div>
                <div className={styles.toggleRow}>
                  <div className={styles.toggleInfo}>
                    <div className={styles.toggleTitle}>Notifications push</div>
                    <div className={styles.toggleDesc}>Alertes en temps réel sur votre navigateur</div>
                  </div>
                  <Toggle checked={notifs.push} onChange={(v) => setNotifs({ ...notifs, push: v })} />
                </div>
                <div className={styles.toggleRow}>
                  <div className={styles.toggleInfo}>
                    <div className={styles.toggleTitle}>Rapport hebdomadaire</div>
                    <div className={styles.toggleDesc}>Synthèse envoyée chaque lundi matin</div>
                  </div>
                  <Toggle checked={notifs.weekly} onChange={(v) => setNotifs({ ...notifs, weekly: v })} />
                </div>
                <div className={styles.toggleRow}>
                  <div className={styles.toggleInfo}>
                    <div className={styles.toggleTitle}>Mentions</div>
                    <div className={styles.toggleDesc}>Notification quand quelqu'un vous mentionne</div>
                  </div>
                  <Toggle checked={notifs.mentions} onChange={(v) => setNotifs({ ...notifs, mentions: v })} />
                </div>
              </div>

              <div className={styles.actions}>
                <button className={styles.saveBtn} onClick={handleSave}>Enregistrer</button>
              </div>
            </div>
          )}

          {/* ─── Security ─────────────────────────────────────── */}
          {activeTab === "security" && (
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Sécurité</h2>
                <p className={styles.sectionDesc}>Protégez votre compte</p>
              </div>

              <div className={styles.card}>
                <div className={styles.cardRow}>
                  <div className={styles.cardInfo}>
                    <div className={styles.cardTitle}>Changer le mot de passe</div>
                    <div className={styles.cardDesc}>Dernière modification il y a 3 mois</div>
                  </div>
                  <button className={styles.outlineBtn}>Modifier</button>
                </div>
              </div>

              <div className={styles.card}>
                <div className={styles.cardRow}>
                  <div className={styles.cardInfo}>
                    <div className={styles.cardTitle}>Authentification à deux facteurs</div>
                    <div className={styles.cardDesc}>Sécurisez l'accès à votre compte</div>
                  </div>
                  <Toggle checked={security.twoFactor} onChange={(v) => setSecurity({ ...security, twoFactor: v })} />
                </div>
              </div>

              <div className={styles.card}>
                <div className={styles.cardRow}>
                  <div className={styles.cardInfo}>
                    <div className={styles.cardTitle}>Sessions actives</div>
                    <div className={styles.cardDesc}>2 appareils connectés</div>
                  </div>
                  <button className={styles.outlineBtn}>Gérer</button>
                </div>
              </div>

              <div className={styles.dangerZone}>
                <h3 className={styles.dangerTitle}>Zone de danger</h3>
                <div className={`${styles.card} ${styles["card--danger"]}`}>
                  <div className={styles.cardRow}>
                    <div className={styles.cardInfo}>
                      <div className={`${styles.cardTitle} ${styles["cardTitle--danger"]}`}>Supprimer le compte</div>
                      <div className={styles.cardDesc}>Cette action est irréversible</div>
                    </div>
                    <button className={styles.dangerBtn}>Supprimer</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
