import { useState, useRef } from "react";
import { useAuth } from "../../features/auth";
import { authService } from "../../features/auth/authService";
import { clubsService } from "../clubs/clubsService";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import styles from "./LeaderSettingsPage.module.css";

/* ─── Types ──────────────────────────────────────────────────────────── */

type SettingsTab = "general" | "notifications" | "security" | "members" | "advanced";

/* ═══════════════════════════════════════════════════════════════════════
   Main Page
   ═══════════════════════════════════════════════════════════════════════ */

export default function LeaderSettingsPage() {
  const { user, updateUser } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");
  const [toast, setToast] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // General settings
  const [clubName, setClubName] = useState("Club Photographie ISIMM");
  const [clubDesc, setClubDesc] = useState("Club dédié à la photographie et au visuel créatif.");
  const [contactEmail, setContactEmail] = useState("photo@isimm.rnu.tn");
  const [contactPhone, setContactPhone] = useState("+216 71 000 000");

  // Notification toggles
  const [notifNewMember, setNotifNewMember] = useState(true);
  const [notifTraining, setNotifTraining] = useState(true);
  const [notifPayment, setNotifPayment] = useState(true);
  const [notifForm, setNotifForm] = useState(false);

  // Member settings
  const [autoApprove, setAutoApprove] = useState(false);
  const [requirePayment, setRequirePayment] = useState(true);
  const [defaultCapacity, setDefaultCapacity] = useState("20");

  // Advanced
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  /* ── Fetch club data ─────────────────────────────────────────────────── */

  const { data: clubData } = useQuery({
    queryKey: ["leader", "my-club"],
    queryFn: async () => (await clubsService.getMyClub()).data,
    enabled: !!user,
  });

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  /* ── Photo upload ────────────────────────────────────────────────────── */

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      showToast("Le fichier ne doit pas dépasser 2 Mo");
      return;
    }
    setUploadingPhoto(true);
    try {
      const avatarUrl = await authService.uploadAvatar(file);
      updateUser({ avatar: avatarUrl });
      showToast("Photo de profil mise à jour");
    } catch {
      showToast("Erreur lors de l'upload de la photo");
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSave = () => {
    showToast("Paramètres sauvegardés avec succès");
  };

  const NAV_ITEMS: { key: SettingsTab; label: string; icon: React.ReactNode }[] = [
    {
      key: "general",
      label: "Général",
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" /></svg>,
    },
    {
      key: "notifications",
      label: "Notifications",
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" /></svg>,
    },
    {
      key: "security",
      label: "Sécurité",
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>,
    },
    {
      key: "members",
      label: "Membres",
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></svg>,
    },
    {
      key: "advanced",
      label: "Avancé",
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></svg>,
    },
  ];

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.greeting}>Paramètres</h1>
          <p className={styles.subtitle}>Configurez votre club et vos préférences</p>
        </div>
        <div className={styles.headerActions}>
          <button className={`${styles.btn} ${styles["btn--primary"]}`} onClick={handleSave}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            Sauvegarder
          </button>
        </div>
      </div>

      {/* Settings Layout */}
      <div className={styles.settingsGrid}>
        {/* Sidebar Nav */}
        <nav className={styles.settingsNav}>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              className={`${styles.navItem} ${activeTab === item.key ? styles["navItem--active"] : ""}`}
              onClick={() => setActiveTab(item.key)}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Content */}
        <div className={styles.settingsContent}>
          {/* ── General ── */}
          {activeTab === "general" && (
            <>
              {/* Profile Photo Card */}
              <div className={styles.card}>
                <div className={styles.cardHead}>
                  <div>
                    <h3 className={styles.cardTitle}>Photo de profil</h3>
                    <p className={styles.cardDesc}>Votre photo de profil visible par les membres</p>
                  </div>
                </div>
                <div className={styles.cardBody}>
                  <div className={styles.photoSection}>
                    <div className={styles.photoPreview}>
                      {user?.avatar ? (
                        <img src={user.avatar} alt="Photo de profil" className={styles.photoImg} />
                      ) : (
                        <div className={styles.photoPlaceholder}>
                          {user?.firstName?.[0]}{user?.lastName?.[0]}
                        </div>
                      )}
                      {uploadingPhoto && (
                        <div className={styles.photoOverlay}>
                          <div className={styles.photoSpinner} />
                        </div>
                      )}
                    </div>
                    <div className={styles.photoInfo}>
                      <button
                        className={`${styles.btn} ${styles["btn--primary"]}`}
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingPhoto}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                          <circle cx="12" cy="13" r="4" />
                        </svg>
                        {uploadingPhoto ? "Envoi en cours..." : "Choisir une photo"}
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        style={{ display: "none" }}
                        onChange={handlePhotoUpload}
                      />
                      <p className={styles.photoHint}>JPEG, PNG ou WebP. Max 2 Mo.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.card}>
                <div className={styles.cardHead}>
                  <div>
                    <h3 className={styles.cardTitle}>Informations du Club</h3>
                    <p className={styles.cardDesc}>Générez les informations publiques de votre club</p>
                  </div>
                </div>
                <div className={styles.cardBody}>
                  <div className={styles.formGrid}>
                    <div className={styles.field}>
                      <label className={styles.fieldLabel}>Nom du club</label>
                      <input className={styles.input} value={clubName} onChange={(e) => setClubName(e.target.value)} />
                    </div>
                    <div className={styles.field}>
                      <label className={styles.fieldLabel}>Email de contact</label>
                      <input className={styles.input} type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
                    </div>
                    <div className={`${styles.field} ${styles["field--full"]}`}>
                      <label className={styles.fieldLabel}>Description</label>
                      <textarea className={`${styles.input} ${styles.textarea}`} value={clubDesc} onChange={(e) => setClubDesc(e.target.value)} />
                    </div>
                    <div className={styles.field}>
                      <label className={styles.fieldLabel}>Téléphone</label>
                      <input className={styles.input} value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ── Notifications ── */}
          {activeTab === "notifications" && (
            <div className={styles.card}>
              <div className={styles.cardHead}>
                <div>
                  <h3 className={styles.cardTitle}>Préférences de notification</h3>
                  <p className={styles.cardDesc}>Choisissez quelles notifications souhaitez recevoir</p>
                </div>
              </div>
              <div className={styles.cardBody}>
                <div className={styles.settingRow}>
                  <div className={styles.settingInfo}>
                    <div className={styles.settingLabel}>Nouvelles inscriptions</div>
                    <div className={styles.settingDesc}>Notification quand un nouveau membre rejoint le club</div>
                  </div>
                  <label className={styles.toggle}>
                    <input type="checkbox" className={styles.toggleInput} checked={notifNewMember} onChange={() => setNotifNewMember(!notifNewMember)} />
                    <span className={styles.toggleTrack} />
                    <span className={styles.toggleThumb} />
                  </label>
                </div>
                <div className={styles.settingRow}>
                  <div className={styles.settingInfo}>
                    <div className={styles.settingLabel}>Formations</div>
                    <div className={styles.settingDesc}>Rappels et mises à jour sur les formations</div>
                  </div>
                  <label className={styles.toggle}>
                    <input type="checkbox" className={styles.toggleInput} checked={notifTraining} onChange={() => setNotifTraining(!notifTraining)} />
                    <span className={styles.toggleTrack} />
                    <span className={styles.toggleThumb} />
                  </label>
                </div>
                <div className={styles.settingRow}>
                  <div className={styles.settingInfo}>
                    <div className={styles.settingLabel}>Paiements</div>
                    <div className={styles.settingDesc}>Notifications de cotisations reçues</div>
                  </div>
                  <label className={styles.toggle}>
                    <input type="checkbox" className={styles.toggleInput} checked={notifPayment} onChange={() => setNotifPayment(!notifPayment)} />
                    <span className={styles.toggleTrack} />
                    <span className={styles.toggleThumb} />
                  </label>
                </div>
                <div className={styles.settingRow}>
                  <div className={styles.settingInfo}>
                    <div className={styles.settingLabel}>Formulaires</div>
                    <div className={styles.settingDesc}>Nouvelles réponses aux formulaires</div>
                  </div>
                  <label className={styles.toggle}>
                    <input type="checkbox" className={styles.toggleInput} checked={notifForm} onChange={() => setNotifForm(!notifForm)} />
                    <span className={styles.toggleTrack} />
                    <span className={styles.toggleThumb} />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* ── Security ── */}
          {activeTab === "security" && (
            <div className={styles.card}>
              <div className={styles.cardHead}>
                <div>
                  <h3 className={styles.cardTitle}>Sécurité du compte</h3>
                  <p className={styles.cardDesc}>Gérez votre mot de passe et la sécurité</p>
                </div>
              </div>
              <div className={styles.cardBody}>
                <div className={styles.formGrid}>
                  <div className={styles.field}>
                    <label className={styles.fieldLabel}>Mot de passe actuel</label>
                    <input className={styles.input} type="password" placeholder="••••••••" />
                  </div>
                  <div className={styles.field} />
                  <div className={styles.field}>
                    <label className={styles.fieldLabel}>Nouveau mot de passe</label>
                    <input className={styles.input} type="password" placeholder="••••••••" />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.fieldLabel}>Confirmer</label>
                    <input className={styles.input} type="password" placeholder="••••••••" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Members ── */}
          {activeTab === "members" && (
            <div className={styles.card}>
              <div className={styles.cardHead}>
                <div>
                  <h3 className={styles.cardTitle}>Paramètres des membres</h3>
                  <p className={styles.cardDesc}>Configurez les règles d'adhésion et d'inscription</p>
                </div>
              </div>
              <div className={styles.cardBody}>
                <div className={styles.settingRow}>
                  <div className={styles.settingInfo}>
                    <div className={styles.settingLabel}>Approbation automatique</div>
                    <div className={styles.settingDesc}>Valider automatiquement les nouvelles inscriptions</div>
                  </div>
                  <label className={styles.toggle}>
                    <input type="checkbox" className={styles.toggleInput} checked={autoApprove} onChange={() => setAutoApprove(!autoApprove)} />
                    <span className={styles.toggleTrack} />
                    <span className={styles.toggleThumb} />
                  </label>
                </div>
                <div className={styles.settingRow}>
                  <div className={styles.settingInfo}>
                    <div className={styles.settingLabel}>Paiement obligatoire</div>
                    <div className={styles.settingDesc}>Exiger le paiement de la cotisation avant validation</div>
                  </div>
                  <label className={styles.toggle}>
                    <input type="checkbox" className={styles.toggleInput} checked={requirePayment} onChange={() => setRequirePayment(!requirePayment)} />
                    <span className={styles.toggleTrack} />
                    <span className={styles.toggleThumb} />
                  </label>
                </div>
                <div className={styles.field} style={{ marginTop: 16 }}>
                  <label className={styles.fieldLabel}>Capacité par défaut</label>
                  <p className={styles.fieldDesc}>Nombre max de participants par formation</p>
                  <input className={styles.input} type="number" value={defaultCapacity} onChange={(e) => setDefaultCapacity(e.target.value)} style={{ width: 120, marginTop: 6 }} />
                </div>
              </div>
            </div>
          )}

          {/* ── Advanced ── */}
          {activeTab === "advanced" && (
            <>
              <div className={styles.card}>
                <div className={styles.cardHead}>
                  <div>
                    <h3 className={styles.cardTitle}>Paramètres avancés</h3>
                    <p className={styles.cardDesc}>Options réservées aux administrateurs</p>
                  </div>
                </div>
                <div className={styles.cardBody}>
                  <div className={styles.settingRow}>
                    <div className={styles.settingInfo}>
                      <div className={styles.settingLabel}>Mode maintenance</div>
                      <div className={styles.settingDesc}>Désactiver temporairement l'accès au club</div>
                    </div>
                    <label className={styles.toggle}>
                      <input type="checkbox" className={styles.toggleInput} checked={maintenanceMode} onChange={() => setMaintenanceMode(!maintenanceMode)} />
                      <span className={styles.toggleTrack} />
                      <span className={styles.toggleThumb} />
                    </label>
                  </div>
                </div>
              </div>

              <div className={`${styles.card} ${styles.dangerZone}`}>
                <div className={styles.cardHead}>
                  <div>
                    <h3 className={styles.cardTitle}>Zone dangereuse</h3>
                    <p className={styles.cardDesc}>Actions irréversibles</p>
                  </div>
                </div>
                <div className={styles.cardBody}>
                  <div className={styles.settingRow}>
                    <div className={styles.settingInfo}>
                      <div className={styles.settingLabel}>Supprimer le club</div>
                      <div className={styles.settingDesc}>Cette action est irréversible. Toutes les données seront perdues.</div>
                    </div>
                    <button className={`${styles.btn} ${styles["btn--danger"]}`}>
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {toast && <div className={styles.toast}>{toast}</div>}
    </div>
  );
}
