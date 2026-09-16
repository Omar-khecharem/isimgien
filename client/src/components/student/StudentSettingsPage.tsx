import { useState, useRef } from "react";
import { useAuth } from "../../features/auth";
import { authService } from "../../features/auth/authService";
import { Avatar } from "../ui";
import styles from "./StudentSettingsPage.module.css";

type Tab = "profile" | "notifications" | "security";

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

export function StudentSettingsPage() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [profile, setProfile] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    studentId: user?.studentId || "",
  });

  const [notifs, setNotifs] = useState({
    email: true,
    push: true,
    events: true,
    attendance: false,
  });

  const [security, setSecurity] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("Le fichier ne doit pas dépasser 2 Mo");
      return;
    }
    setUploadingPhoto(true);
    try {
      const avatarUrl = await authService.uploadAvatar(file);
      updateUser({ avatar: avatarUrl });
    } catch {
      alert("Erreur lors de l'upload de la photo");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const updated = await authService.updateProfile({
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone,
      });
      updateUser({
        firstName: updated.firstName,
        lastName: updated.lastName,
        phone: updated.phone,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      alert("Erreur lors de la mise à jour du profil");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Paramètres</h1>
          <p className={styles.subtitle}>Gérez votre profil et vos préférences</p>
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

        <div className={styles.tabContent}>
          {/* ─── Profile ──────────────────────────────────────── */}
          {activeTab === "profile" && (
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Profil</h2>
                <p className={styles.sectionDesc}>Informations personnelles et coordonnées</p>
              </div>

              <div className={styles.avatarRow}>
                <div className={styles.avatarWrap}>
                  <Avatar
                    src={user?.avatar}
                    name={user ? `${user.firstName} ${user.lastName}` : ""}
                    size="lg"
                  />
                  <button
                    className={styles.avatarOverlay}
                    onClick={() => photoInputRef.current?.click()}
                    aria-label="Changer la photo"
                  >
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                      <path d="M13.5 3.5l3 3M2.5 17.5l1-4L14.4 4.1a2.1 2.1 0 013 3L6.5 18.5l-4 1z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
                <div className={styles.avatarInfo}>
                  <button
                    className={styles.uploadBtn}
                    onClick={() => photoInputRef.current?.click()}
                    disabled={uploadingPhoto}
                  >
                    {uploadingPhoto ? "Upload en cours..." : "Changer la photo"}
                  </button>
                  <p className={styles.uploadHint}>JPG, PNG ou GIF. Max 2 Mo.</p>
                </div>
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/gif"
                  onChange={handlePhotoUpload}
                  className={styles.hiddenInput}
                />
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
                <div className={styles.field} style={{ gridColumn: "1 / -1" }}>
                  <label className={styles.label}>Matricule étudiant</label>
                  <input
                    className={styles.input}
                    value={profile.studentId}
                    disabled
                  />
                  <p className={styles.fieldHint}>Le matricule est défini par l'administration</p>
                </div>
              </div>

              <div className={styles.actions}>
                <button
                  className={styles.saveBtn}
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? (
                    <span className={styles.saveBtnInner}>
                      <span className={styles.spinner} />
                      Enregistrement...
                    </span>
                  ) : saved ? (
                    <span className={styles.saveBtnInner}>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M3 8l3.5 3.5L13 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Enregistré
                    </span>
                  ) : (
                    "Enregistrer"
                  )}
                </button>
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
                    <div className={styles.toggleDesc}>Recevez les importantes mises à jour par email</div>
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
                    <div className={styles.toggleTitle}>Nouveaux événements</div>
                    <div className={styles.toggleDesc}>Soyez averti quand un nouvel événement est publié</div>
                  </div>
                  <Toggle checked={notifs.events} onChange={(v) => setNotifs({ ...notifs, events: v })} />
                </div>
                <div className={styles.toggleRow}>
                  <div className={styles.toggleInfo}>
                    <div className={styles.toggleTitle}>Rappels de présence</div>
                    <div className={styles.toggleDesc}>Rappel avant les sessions de formation auxquelles vous êtes inscrit</div>
                  </div>
                  <Toggle checked={notifs.attendance} onChange={(v) => setNotifs({ ...notifs, attendance: v })} />
                </div>
              </div>

              <div className={styles.actions}>
                <button
                  className={styles.saveBtn}
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? (
                    <span className={styles.saveBtnInner}>
                      <span className={styles.spinner} />
                      Enregistrement...
                    </span>
                  ) : saved ? (
                    <span className={styles.saveBtnInner}>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M3 8l3.5 3.5L13 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Enregistré
                    </span>
                  ) : (
                    "Enregistrer"
                  )}
                </button>
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
                    <div className={styles.cardDesc}>Utilisez un mot de passe fort d'au moins 8 caractères</div>
                  </div>
                  <button
                    className={styles.outlineBtn}
                    onClick={() => setShowPasswordForm(!showPasswordForm)}
                  >
                    {showPasswordForm ? "Annuler" : "Modifier"}
                  </button>
                </div>
                {showPasswordForm && (
                  <div className={styles.passwordForm}>
                    <div className={styles.field}>
                      <label className={styles.label}>Mot de passe actuel</label>
                      <input
                        className={styles.input}
                        type="password"
                        placeholder="••••••••"
                        value={security.currentPassword}
                        onChange={(e) => setSecurity({ ...security, currentPassword: e.target.value })}
                      />
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label}>Nouveau mot de passe</label>
                      <input
                        className={styles.input}
                        type="password"
                        placeholder="••••••••"
                        value={security.newPassword}
                        onChange={(e) => setSecurity({ ...security, newPassword: e.target.value })}
                      />
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label}>Confirmer le mot de passe</label>
                      <input
                        className={styles.input}
                        type="password"
                        placeholder="••••••••"
                        value={security.confirmPassword}
                        onChange={(e) => setSecurity({ ...security, confirmPassword: e.target.value })}
                      />
                    </div>
                    <div className={styles.passwordActions}>
                      <button className={styles.saveBtn} disabled={saving}>
                        {saving ? "Enregistrement..." : "Mettre à jour"}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.card}>
                <div className={styles.cardRow}>
                  <div className={styles.cardInfo}>
                    <div className={styles.cardTitle}>Sessions actives</div>
                    <div className={styles.cardDesc}>Gérez les appareils connectés à votre compte</div>
                  </div>
                  <button className={styles.outlineBtn}>Gérer</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
