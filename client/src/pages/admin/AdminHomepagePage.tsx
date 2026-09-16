import { useState, useRef } from "react";
import { useLogo } from "../../features/logo";
import { useHomepage, type ExternalCollaborator } from "../../features/homepage/HomepageContext";
import styles from "../settings/AdminSettings.module.css";

export function AdminHomepagePage() {
  const { logo, setLogo, saveLogo, saving: logoSaving } = useLogo();
  const { config, update, save, saving, saved } = useHomepage();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const heroImageInputRef = useRef<HTMLInputElement>(null);
  const introImageInputRef = useRef<HTMLInputElement>(null);
  const collabLogoInputRef = useRef<HTMLInputElement>(null);
  const [savingState, setSavingState] = useState(false);
  const [savedState, setSavedState] = useState(false);

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

  const handleIntroImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("Le fichier ne doit pas dépasser 5 Mo");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => update({ introImage: ev.target?.result as string });
    reader.readAsDataURL(file);
  };

  const handleCollabLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("Le fichier ne doit pas dépasser 2 Mo");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const newCollab: ExternalCollaborator = {
        name: file.name.replace(/\.[^.]+$/, ""),
        logo: ev.target?.result as string,
      };
      update({ externalCollaborators: [...config.externalCollaborators, newCollab] });
    };
    reader.readAsDataURL(file);
  };

  const removeExternalCollab = (index: number) => {
    const updated = config.externalCollaborators.filter((_, i) => i !== index);
    update({ externalCollaborators: updated });
  };

  const handleSave = async () => {
    setSavingState(true);
    setSavedState(false);
    try {
      await Promise.all([saveLogo(), save()]);
      setSavedState(true);
      setTimeout(() => setSavedState(false), 3000);
    } finally {
      setSavingState(false);
    }
  };

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Page d'accueil</h2>
        <p className={styles.sectionDesc}>Configurez le contenu de la page d'accueil publique</p>
      </div>

      {/* Logo */}
      <div className={styles.logoUploadSection}>
        <label className={styles.label}>Logo de la plateforme</label>
        <p className={styles.uploadHint}>Apparaît dans la navbar et le footer. PNG, JPG ou SVG. Max 2 Mo.</p>
        <div className={styles.logoUploadRow}>
          <div className={styles.logoPreview} onClick={() => logoInputRef.current?.click()}>
            {logo ? (
              <img src={logo} alt="Logo" className={styles.logoImg} />
            ) : (
              <svg width="32" height="32" viewBox="0 0 28 28" fill="none">
                <rect width="28" height="28" rx="8" fill="#ECFDF5" />
                <path d="M8 10l6-3.5 6 3.5v8a1 1 0 01-1 1H9a1 1 0 01-1-1v-8z" stroke="#0A5F3A" strokeWidth="1.5" strokeLinejoin="round" />
                <path d="M11.5 21v-5h5v5" stroke="#0A5F3A" strokeWidth="1.5" strokeLinejoin="round" />
              </svg>
            )}
          </div>
          <div className={styles.logoUploadActions}>
            <button className={styles.uploadBtn} onClick={() => logoInputRef.current?.click()}>
              {logo ? "Changer le logo" : "Uploader un logo"}
            </button>
            {logo && (
              <button className={styles.removeBtn} onClick={() => setLogo(null)}>
                Supprimer
              </button>
            )}
            <input ref={logoInputRef} type="file" accept="image/png,image/jpeg,image/svg+xml" onChange={handleLogoUpload} className={styles.hiddenInput} />
          </div>
        </div>
      </div>

      {/* Hero */}
      <div className={styles.logoUploadSection}>
        <label className={styles.label}>Section Hero</label>
        <div className={styles.formGrid} style={{ marginTop: 8 }}>
          <div className={styles.field} style={{ gridColumn: "1 / -1" }}>
            <label className={styles.label}>Titre principal</label>
            <input className={styles.input} value={config.heroTitle} onChange={(e) => update({ heroTitle: e.target.value })} />
          </div>
          <div className={styles.field} style={{ gridColumn: "1 / -1" }}>
            <label className={styles.label}>Sous-titre</label>
            <textarea className={styles.textarea} rows={2} value={config.heroSubtitle} onChange={(e) => update({ heroSubtitle: e.target.value })} />
          </div>
        </div>
        <div className={styles.logoUploadRow} style={{ marginTop: 8 }}>
          <div className={styles.logoPreview} style={{ width: 160, height: 110, borderRadius: 10 }} onClick={() => heroImageInputRef.current?.click()}>
            {config.heroImage ? (
              <img src={config.heroImage} alt="Hero" className={styles.logoImg} style={{ objectFit: "cover", width: "100%", height: "100%" }} />
            ) : (
              <svg width="32" height="32" viewBox="0 0 28 28" fill="none">
                <rect width="28" height="28" rx="8" fill="#ECFDF5" />
                <path d="M8 10l6-3.5 6 3.5v8a1 1 0 01-1 1H9a1 1 0 01-1-1v-8z" stroke="#0A5F3A" strokeWidth="1.5" strokeLinejoin="round" />
              </svg>
            )}
          </div>
          <div className={styles.logoUploadActions}>
            <button className={styles.uploadBtn} onClick={() => heroImageInputRef.current?.click()}>
              {config.heroImage ? "Changer l'image" : "Uploader une image"}
            </button>
            {config.heroImage && (
              <button className={styles.removeBtn} onClick={() => update({ heroImage: null })}>Supprimer</button>
            )}
          </div>
          <input ref={heroImageInputRef} type="file" accept="image/*" onChange={handleHeroImageUpload} className={styles.hiddenInput} />
        </div>
      </div>

      {/* Intro */}
      <div className={styles.logoUploadSection}>
        <label className={styles.label}>Section Introduction</label>
        <div className={styles.formGrid} style={{ marginTop: 8 }}>
          <div className={styles.field} style={{ gridColumn: "1 / -1" }}>
            <label className={styles.label}>Titre</label>
            <input className={styles.input} value={config.introTitle} onChange={(e) => update({ introTitle: e.target.value })} />
          </div>
          <div className={styles.field} style={{ gridColumn: "1 / -1" }}>
            <label className={styles.label}>Description</label>
            <textarea className={styles.textarea} rows={4} value={config.introDescription} onChange={(e) => update({ introDescription: e.target.value })} />
          </div>
        </div>
        <div className={styles.logoUploadRow} style={{ marginTop: 8 }}>
          <div className={styles.logoPreview} style={{ width: 160, height: 110, borderRadius: 10 }} onClick={() => introImageInputRef.current?.click()}>
            {config.introImage ? (
              <img src={config.introImage} alt="Intro" className={styles.logoImg} style={{ objectFit: "cover", width: "100%", height: "100%" }} />
            ) : (
              <svg width="32" height="32" viewBox="0 0 28 28" fill="none">
                <rect width="28" height="28" rx="8" fill="#ECFDF5" />
                <path d="M8 10l6-3.5 6 3.5v8a1 1 0 01-1 1H9a1 1 0 01-1-1v-8z" stroke="#0A5F3A" strokeWidth="1.5" strokeLinejoin="round" />
              </svg>
            )}
          </div>
          <div className={styles.logoUploadActions}>
            <button className={styles.uploadBtn} onClick={() => introImageInputRef.current?.click()}>
              {config.introImage ? "Changer l'image" : "Uploader une image"}
            </button>
            {config.introImage && (
              <button className={styles.removeBtn} onClick={() => update({ introImage: null })}>Supprimer</button>
            )}
          </div>
          <input ref={introImageInputRef} type="file" accept="image/*" onChange={handleIntroImageUpload} className={styles.hiddenInput} />
        </div>
      </div>

      {/* Collaborators */}
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
        <div style={{ marginTop: 12 }}>
          <label className={styles.label}>Logos externes (ajoutés par l'admin)</label>
          <p className={styles.uploadHint}>Ajoutez des logos de partenaires, sponsors ou institutions. Ils s'affichent dans le carrousel avec les logos des clubs.</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 8 }}>
            {config.externalCollaborators.map((collab, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "#f9fafb", borderRadius: 10, border: "1px solid #e5e7eb" }}>
                {collab.logo && <img src={collab.logo} alt={collab.name} style={{ width: 40, height: 28, objectFit: "contain" }} />}
                <span style={{ fontSize: 13, fontWeight: 500 }}>{collab.name}</span>
                <button onClick={() => removeExternalCollab(i)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 16, lineHeight: 1 }}>×</button>
              </div>
            ))}
          </div>
          <button className={styles.uploadBtn} style={{ marginTop: 8 }} onClick={() => collabLogoInputRef.current?.click()}>
            + Ajouter un logo
          </button>
          <input ref={collabLogoInputRef} type="file" accept="image/*" onChange={handleCollabLogoUpload} className={styles.hiddenInput} />
        </div>
      </div>

      {/* Community */}
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
          <div key={i} style={{ marginTop: 8, padding: "8px 0", borderTop: "1px solid #f0f0f0" }}>
            <div className={styles.formGrid}>
              <div className={styles.field}>
                <label className={styles.label}>Carte {i + 1} — Titre</label>
                <input className={styles.input} value={card.title} onChange={(e) => {
                  const cards = [...config.communityCards];
                  cards[i] = { ...cards[i], title: e.target.value };
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
              <div className={styles.field} style={{ gridColumn: "1 / -1" }}>
                <label className={styles.label}>Carte {i + 1} — Description</label>
                <textarea className={styles.textarea} rows={2} value={card.description} onChange={(e) => {
                  const cards = [...config.communityCards];
                  cards[i] = { ...cards[i], description: e.target.value };
                  update({ communityCards: cards });
                }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Features */}
      {(["feature1", "feature2"] as const).map((key) => (
        <div key={key} className={styles.logoUploadSection}>
          <label className={styles.label}>{key === "feature1" ? "Feature 1" : "Feature 2"}</label>
          <div className={styles.formGrid} style={{ marginTop: 8 }}>
            <div className={styles.field} style={{ gridColumn: "1 / -1" }}>
              <label className={styles.label}>Titre</label>
              <input className={styles.input} value={config[key].title} onChange={(e) => update({ [key]: { ...config[key], title: e.target.value } })} />
            </div>
            <div className={styles.field} style={{ gridColumn: "1 / -1" }}>
              <label className={styles.label}>Description</label>
              <textarea className={styles.textarea} rows={3} value={config[key].description} onChange={(e) => update({ [key]: { ...config[key], description: e.target.value } })} />
            </div>
          </div>
        </div>
      ))}

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

      <div className={styles.actions}>
        <button className={styles.saveBtn} onClick={handleSave} disabled={savingState}>
          {savingState ? (
            <span className={styles.saveBtnInner}>
              <span className={styles.spinner} />
              Enregistrement...
            </span>
          ) : savedState ? (
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
  );
}
