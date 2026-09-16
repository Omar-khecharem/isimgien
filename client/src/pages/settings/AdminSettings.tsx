import { useState, useRef } from "react";
import { useAuth } from "../../features/auth";
import { authService } from "../../features/auth/authService";
import { useLogo } from "../../features/logo";
import { useHomepage } from "../../features/homepage/HomepageContext";
import { Avatar } from "../../components/ui";
import styles from "./AdminSettings.module.css";

type Tab = "profile" | "general" | "homepage" | "notifications" | "security";

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
    id: "homepage",
    label: "Page d'accueil",
    icon: (
      <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
        <path d="M3 9.5L11 3l8 6.5V19a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M8 20V12h6v8" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
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
  const { user, updateUser } = useAuth();
  const { logo, setLogo, saveLogo, saving: logoSaving, saved: logoSaved } = useLogo();
  const { config, update, save, saving: homepageSaving, saved: homepageSaved } = useHomepage();
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const heroImageInputRef = useRef<HTMLInputElement>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [profile, setProfile] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: "",
  });

  const [general, setGeneral] = useState({
    platformName: "ISIMGIEN",
    platformDesc: "Plateforme de gestion des clubs universitaires",
    maintenance: false,
    registration: true,
  });

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

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("Le fichier ne doit pas dépasser 2 Mo");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => setLogo(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleHeroImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("Le fichier ne doit pas dépasser 5 Mo");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => update({ heroImage: ev.target?.result as string });
    reader.readAsDataURL(file);
  };

  const [notifs, setNotifs] = useState({
    email: true,
    push: true,
    weekly: false,
    mentions: true,
  });

  const [security, setSecurity] = useState({
    twoFactor: false,
  });

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      if (activeTab === "general") {
        await saveLogo();
      }
      if (activeTab === "homepage") {
        await save();
      }
      await new Promise((resolve) => setTimeout(resolve, 500));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
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
              <circle cx="8" cy="8" r="7" stroke="#499A13" strokeWidth="1.5" />
              <path d="M5 8l2 2 4-4" stroke="#499A13" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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

          {/* ─── General ──────────────────────────────────────── */}
          {activeTab === "general" && (
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Général</h2>
                <p className={styles.sectionDesc}>Configuration globale de la plateforme</p>
              </div>

              {/* Logo Upload */}
              <div className={styles.logoUploadSection}>
                <label className={styles.label}>Logo de la plateforme</label>
                <p className={styles.uploadHint}>Apparaît dans la sidebar. PNG, JPG ou SVG. Max 2 Mo.</p>
                <div className={styles.logoUploadRow}>
                  <div
                    className={styles.logoPreview}
                    onClick={() => logoInputRef.current?.click()}
                  >
                    {logo ? (
                      <img src={logo} alt="Logo" className={styles.logoImg} />
                    ) : (
                      <svg width="32" height="32" viewBox="0 0 28 28" fill="none">
                        <rect width="28" height="28" rx="8" fill="#ECFDF5" />
                        <path d="M8 10l6-3.5 6 3.5v8a1 1 0 01-1 1H9a1 1 0 01-1-1v-8z" stroke="#499A13" strokeWidth="1.5" strokeLinejoin="round" />
                        <path d="M11.5 21v-5h5v5" stroke="#499A13" strokeWidth="1.5" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <div className={styles.logoUploadActions}>
                    <button
                      className={styles.uploadBtn}
                      onClick={() => logoInputRef.current?.click()}
                    >
                      {logo ? "Changer le logo" : "Uploader un logo"}
                    </button>
                    {logo && (
                      <button
                        className={styles.removeBtn}
                        onClick={() => setLogo(null)}
                      >
                        Supprimer
                      </button>
                    )}
                  </div>
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/svg+xml"
                    onChange={handleLogoUpload}
                    className={styles.hiddenInput}
                  />
                </div>
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

          {/* ─── Homepage Config ────────────────────────────────── */}
          {activeTab === "homepage" && (
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Page d'accueil</h2>
                <p className={styles.sectionDesc}>Configurez le contenu de la page d'accueil</p>
              </div>

              {/* Hero Section */}
              <div className={styles.logoUploadSection}>
                <label className={styles.label}>Section Hero</label>
                <div className={styles.formGrid} style={{ marginTop: 8 }}>
                  <div className={styles.field} style={{ gridColumn: "1 / -1" }}>
                    <label className={styles.label}>Titre principal</label>
                    <input
                      className={styles.input}
                      value={config.heroTitle}
                      onChange={(e) => update({ heroTitle: e.target.value })}
                      placeholder="Lessons and insights from 8 years"
                    />
                  </div>
                  <div className={styles.field} style={{ gridColumn: "1 / -1" }}>
                    <label className={styles.label}>Sous-titre</label>
                    <textarea
                      className={styles.textarea}
                      rows={2}
                      value={config.heroSubtitle}
                      onChange={(e) => update({ heroSubtitle: e.target.value })}
                    />
                  </div>
                </div>
                <div className={styles.logoUploadRow} style={{ marginTop: 8 }}>
                  <div
                    className={styles.logoPreview}
                    style={{ width: 160, height: 110, borderRadius: 10 }}
                    onClick={() => heroImageInputRef.current?.click()}
                  >
                    {config.heroImage ? (
                      <img src={config.heroImage} alt="Hero" className={styles.logoImg} style={{ objectFit: "cover", width: "100%", height: "100%" }} />
                    ) : (
                      <svg width="32" height="32" viewBox="0 0 28 28" fill="none">
                        <rect width="28" height="28" rx="8" fill="#ECFDF5" />
                        <path d="M8 10l6-3.5 6 3.5v8a1 1 0 01-1 1H9a1 1 0 01-1-1v-8z" stroke="#499A13" strokeWidth="1.5" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <div className={styles.logoUploadActions}>
                    <button className={styles.uploadBtn} onClick={() => heroImageInputRef.current?.click()}>
                      {config.heroImage ? "Changer l'image" : "Uploader une image"}
                    </button>
                    {config.heroImage && (
                      <button className={styles.removeBtn} onClick={() => update({ heroImage: null })}>
                        Supprimer
                      </button>
                    )}
                  </div>
                  <input ref={heroImageInputRef} type="file" accept="image/*" onChange={handleHeroImageUpload} className={styles.hiddenInput} />
                </div>
              </div>

              {/* Collaborators Section */}
              <div className={styles.logoUploadSection}>
                <label className={styles.label}>Section Collaborateurs</label>
                <div className={styles.formGrid} style={{ marginTop: 8 }}>
                  <div className={styles.field}>
                    <label className={styles.label}>Titre</label>
                    <input className={styles.input} value={config.collaboratorsTitle} onChange={(e) => update({ collaboratorsTitle: e.target.value })} />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Sous-titre</label>
                    <input className={styles.input} value={config.collaboratorsSubtitle} onChange={(e) => update({ collaboratorsSubtitle: e.target.value })} />
                  </div>
                </div>
              </div>

              {/* Community Section */}
              <div className={styles.logoUploadSection}>
                <label className={styles.label}>Section Communauté</label>
                <div className={styles.formGrid} style={{ marginTop: 8 }}>
                  <div className={styles.field} style={{ gridColumn: "1 / -1" }}>
                    <label className={styles.label}>Titre</label>
                    <input className={styles.input} value={config.communityTitle} onChange={(e) => update({ communityTitle: e.target.value })} />
                  </div>
                  <div className={styles.field} style={{ gridColumn: "1 / -1" }}>
                    <label className={styles.label}>Sous-titre</label>
                    <input className={styles.input} value={config.communitySubtitle} onChange={(e) => update({ communitySubtitle: e.target.value })} />
                  </div>
                </div>
                {config.communityCards.map((card, i) => (
                  <div key={i} className={styles.formGrid} style={{ marginTop: 8, padding: "8px 0", borderTop: "1px solid #f0f0f0" }}>
                    <div className={styles.field}>
                      <label className={styles.label}>Carte {i + 1} — Titre</label>
                      <input className={styles.input} value={card.title} onChange={(e) => {
                        const cards = [...config.communityCards];
                        cards[i] = { ...cards[i], title: e.target.value };
                        update({ communityCards: cards });
                      }} />
                    </div>
                    <div className={styles.field} style={{ gridColumn: "1 / -1" }}>
                      <label className={styles.label}>Carte {i + 1} — Description</label>
                      <textarea className={styles.textarea} rows={2} value={card.description} onChange={(e) => {
                        const cards = [...config.communityCards];
                        cards[i] = { ...cards[i], description: e.target.value };
                        update({ communityCards: cards });
                      }} />
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label}>Carte {i + 1} — Couleur</label>
                      <input type="color" className={styles.input} value={card.iconColor} onChange={(e) => {
                        const cards = [...config.communityCards];
                        cards[i] = { ...cards[i], iconColor: e.target.value };
                        update({ communityCards: cards });
                      }} style={{ height: 36, padding: 4 }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Feature 1 */}
              <div className={styles.logoUploadSection}>
                <label className={styles.label}>Feature 1</label>
                <div className={styles.formGrid} style={{ marginTop: 8 }}>
                  <div className={styles.field} style={{ gridColumn: "1 / -1" }}>
                    <label className={styles.label}>Titre</label>
                    <input className={styles.input} value={config.feature1.title} onChange={(e) => update({ feature1: { ...config.feature1, title: e.target.value } })} />
                  </div>
                  <div className={styles.field} style={{ gridColumn: "1 / -1" }}>
                    <label className={styles.label}>Description</label>
                    <textarea className={styles.textarea} rows={3} value={config.feature1.description} onChange={(e) => update({ feature1: { ...config.feature1, description: e.target.value } })} />
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className={styles.logoUploadSection}>
                <label className={styles.label}>Statistiques</label>
                {config.stats.map((stat, i) => (
                  <div key={i} className={styles.formGrid} style={{ marginTop: 8, padding: "8px 0", borderTop: i > 0 ? "1px solid #f0f0f0" : "none" }}>
                    <div className={styles.field}>
                      <label className={styles.label}>Valeur</label>
                      <input className={styles.input} value={stat.value} onChange={(e) => {
                        const stats = [...config.stats];
                        stats[i] = { ...stats[i], value: e.target.value };
                        update({ stats });
                      }} />
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label}>Label</label>
                      <input className={styles.input} value={stat.label} onChange={(e) => {
                        const stats = [...config.stats];
                        stats[i] = { ...stats[i], label: e.target.value };
                        update({ stats });
                      }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Blog Section */}
              <div className={styles.logoUploadSection}>
                <label className={styles.label}>Section Blog</label>
                <div className={styles.formGrid} style={{ marginTop: 8 }}>
                  <div className={styles.field} style={{ gridColumn: "1 / -1" }}>
                    <label className={styles.label}>Titre</label>
                    <input className={styles.input} value={config.blogTitle} onChange={(e) => update({ blogTitle: e.target.value })} />
                  </div>
                  <div className={styles.field} style={{ gridColumn: "1 / -1" }}>
                    <label className={styles.label}>Sous-titre</label>
                    <textarea className={styles.textarea} rows={2} value={config.blogSubtitle} onChange={(e) => update({ blogSubtitle: e.target.value })} />
                  </div>
                </div>
                {config.blogPosts.map((post, i) => (
                  <div key={i} className={styles.formGrid} style={{ marginTop: 8, padding: "8px 0", borderTop: "1px solid #f0f0f0" }}>
                    <div className={styles.field} style={{ gridColumn: "1 / -1" }}>
                      <label className={styles.label}>Article {i + 1}</label>
                      <input className={styles.input} value={post.title} onChange={(e) => {
                        const posts = [...config.blogPosts];
                        posts[i] = { ...posts[i], title: e.target.value };
                        update({ blogPosts: posts });
                      }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className={styles.logoUploadSection}>
                <label className={styles.label}>Bannière CTA</label>
                <div className={styles.formGrid} style={{ marginTop: 8 }}>
                  <div className={styles.field} style={{ gridColumn: "1 / -1" }}>
                    <label className={styles.label}>Titre</label>
                    <input className={styles.input} value={config.ctaTitle} onChange={(e) => update({ ctaTitle: e.target.value })} />
                  </div>
                  <div className={styles.field} style={{ gridColumn: "1 / -1" }}>
                    <label className={styles.label}>Sous-titre</label>
                    <textarea className={styles.textarea} rows={2} value={config.ctaSubtitle} onChange={(e) => update({ ctaSubtitle: e.target.value })} />
                  </div>
                </div>
              </div>

              {/* Feature 2 */}
              <div className={styles.logoUploadSection}>
                <label className={styles.label}>Feature 2</label>
                <div className={styles.formGrid} style={{ marginTop: 8 }}>
                  <div className={styles.field} style={{ gridColumn: "1 / -1" }}>
                    <label className={styles.label}>Titre</label>
                    <input className={styles.input} value={config.feature2.title} onChange={(e) => update({ feature2: { ...config.feature2, title: e.target.value } })} />
                  </div>
                  <div className={styles.field} style={{ gridColumn: "1 / -1" }}>
                    <label className={styles.label}>Description</label>
                    <textarea className={styles.textarea} rows={3} value={config.feature2.description} onChange={(e) => update({ feature2: { ...config.feature2, description: e.target.value } })} />
                  </div>
                </div>
              </div>

              <div className={styles.actions}>
                <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
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
