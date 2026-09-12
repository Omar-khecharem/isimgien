import { useState } from "react";
import styles from "./LeaderHelpPage.module.css";

/* ─── FAQ Data ───────────────────────────────────────────────────────── */

const FAQ_ITEMS = [
  {
    q: "Comment créer une nouvelle formation ?",
    a: "Allez dans la section 'Formations' via le menu latéral, puis cliquez sur 'Nouvelle Formation'. Remplissez le titre, la date, l'emplacement et la capacité maximale. Vous pouvez ensuite la publier ou la garder en brouillon.",
  },
  {
    q: "Comment valider une inscription de membre ?",
    a: "Dans la section 'Membres', les demandes en attente apparaissent avec des boutons 'Accepter' ou 'Refuser'. Vous pouvez aussi activer l'approbation automatique dans Paramètres > Membres.",
  },
  {
    q: "Comment enregistrer un paiement ?",
    a: "Dans la section 'Caisse', cliquez sur 'Nouvelle Transaction'. Sélectionnez le type (Revenu), la catégorie (Cotisation), le montant et le membre concerné. Le solde du club sera automatiquement mis à jour.",
  },
  {
    q: "Comment lancer une session de présence ?",
    a: "Dans le tableau de bord, utilisez le chronomètre ou allez dans 'Membres > Présences'. Sélectionnez la formation, lancez la session et les membres pourront pointer leur présence via le QR code.",
  },
  {
    q: "Comment modifier les informations de mon club ?",
    a: "Allez dans 'Mon Club' (menu latéral) pour modifier le nom, la description, le logo, la photo de couverture et les liens sociaux. Pensez à sauvegarder vos modifications.",
  },
  {
    q: "Comment exporter les rapports ?",
    a: "Dans la section 'Rapports & Stats', sélectionnez la période souhaitée et le type de rapport (présences, finances, membres). Cliquez ensuite sur 'Exporter' pour télécharger en PDF ou CSV.",
  },
];

/* ═══════════════════════════════════════════════════════════════════════
   Main Page
   ═══════════════════════════════════════════════════════════════════════ */

export default function LeaderHelpPage() {
  const [search, setSearch] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const filteredFaq = FAQ_ITEMS.filter((item) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q);
  });

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.greeting}>Aide & Support</h1>
          <p className={styles.subtitle}>Trouvez des réponses et obtenez de l'aide</p>
        </div>
      </div>

      {/* Hero */}
      <div className={styles.hero}>
        <h2 className={styles.heroTitle}>Comment pouvons-nous vous aider ?</h2>
        <p className={styles.heroDesc}>
          Parcourez notre documentation, consultez la FAQ ou contactez notre équipe support.
        </p>
        <div className={styles.heroSearch}>
          <input
            className={styles.heroInput}
            placeholder="Rechercher dans l'aide..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className={styles.heroBtn}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
            Rechercher
          </button>
        </div>
      </div>

      {/* Quick Links */}
      <div className={styles.quickGrid}>
        <div className={styles.quickCard}>
          <div className={`${styles.quickIcon} ${styles["quickIcon--guide"]}`}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" /></svg>
          </div>
          <span className={styles.quickTitle}>Guide d'utilisation</span>
          <span className={styles.quickDesc}>Manuel complet pour gérer votre club</span>
        </div>
        <div className={styles.quickCard}>
          <div className={`${styles.quickIcon} ${styles["quickIcon--faq"]}`}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
          </div>
          <span className={styles.quickTitle}>Questions fréquentes</span>
          <span className={styles.quickDesc}>Réponses aux questions courantes</span>
        </div>
        <div className={styles.quickCard}>
          <div className={`${styles.quickIcon} ${styles["quickIcon--contact"]}`}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>
          </div>
          <span className={styles.quickTitle}>Contacter le support</span>
          <span className={styles.quickDesc}>Assistance personnalisée par email</span>
        </div>
        <div className={styles.quickCard}>
          <div className={`${styles.quickIcon} ${styles["quickIcon--report"]}`}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
          </div>
          <span className={styles.quickTitle}>Signaler un bug</span>
          <span className={styles.quickDesc}>Rapportez un problème technique</span>
        </div>
      </div>

      {/* FAQ */}
      <div>
        <h2 className={styles.sectionTitle}>Questions fréquentes</h2>
        <p className={styles.sectionDesc}>Trouvez rapidement les réponses à vos questions</p>
        <div className={styles.faqList}>
          {filteredFaq.map((item, i) => (
            <div key={i} className={`${styles.faqItem} ${openFaq === i ? styles["faqItem--open"] : ""}`}>
              <button className={styles.faqQuestion} onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                <span className={styles.faqQuestionText}>{item.q}</span>
                <span className={styles.faqChevron}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
                </span>
              </button>
              {openFaq === i && (
                <div className={styles.faqAnswer}>{item.a}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contact */}
      <div>
        <h2 className={styles.sectionTitle}>Contactez-nous</h2>
        <p className={styles.sectionDesc}>Notre équipe est disponible pour vous aider</p>
        <div className={styles.contactGrid}>
          <div className={styles.contactCard}>
            <div className={`${styles.contactIcon} ${styles["contactIcon--email"]}`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
            </div>
            <div className={styles.contactInfo}>
              <span className={styles.contactLabel}>Email</span>
              <span className={styles.contactValue}>support@isimGIEN.tn</span>
              <a className={styles.contactLink} href="mailto:support@isimGIEN.tn">Envoyer un email</a>
            </div>
          </div>
          <div className={styles.contactCard}>
            <div className={`${styles.contactIcon} ${styles["contactIcon--phone"]}`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" /></svg>
            </div>
            <div className={styles.contactInfo}>
              <span className={styles.contactLabel}>Téléphone</span>
              <span className={styles.contactValue}>+216 71 000 000</span>
              <a className={styles.contactLink} href="tel:+21671000000">Appeler</a>
            </div>
          </div>
          <div className={styles.contactCard}>
            <div className={`${styles.contactIcon} ${styles["contactIcon--chat"]}`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" /></svg>
            </div>
            <div className={styles.contactInfo}>
              <span className={styles.contactLabel}>Chat en direct</span>
              <span className={styles.contactValue}>Disponible 9h-17h</span>
              <span className={styles.contactLink}>Démarrer un chat</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
