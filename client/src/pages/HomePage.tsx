import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Menu, X } from "lucide-react";
import { ROUTES } from "../routes/paths";
import { useLogo } from "../features/logo";
import { useAuth } from "../features/auth";
import { useHomepage } from "../features/homepage/HomepageContext";
import { clubsService, type Club } from "../features/clubs";
import styles from "./HomePage.module.css";

gsap.registerPlugin(ScrollTrigger);

/* ─── Data ────────────────────────────────────────────────────────────────── */

const NAV_LINKS = [
  { label: "Accueil", href: "#" },
  { label: "Fonctionnalités", href: "#features" },
  { label: "Communauté", href: "#community" },
  { label: "Contact", href: "#footer" },
];

/* ─── SVG Illustrations ───────────────────────────────────────────────────── */

function HeroIllustration() {
  return (
    <svg viewBox="0 0 440 400" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.heroIllustration}>
      <rect x="60" y="30" width="300" height="220" rx="16" fill="#e5e7eb" stroke="#d1d5db" strokeWidth="2"/>
      <rect x="72" y="42" width="276" height="188" rx="4" fill="#fff"/>
      <rect x="88" y="62" width="80" height="48" rx="8" fill="url(#hg1)"/>
      <text x="100" y="80" fontSize="10" fontWeight="700" fill="#276F27">Clubs</text>
      <text x="100" y="96" fontSize="16" fontWeight="800" fill="#276F27">25</text>
      <rect x="180" y="62" width="80" height="48" rx="8" fill="#f4fbe8"/>
      <text x="192" y="80" fontSize="10" fontWeight="700" fill="#276F27">Membres</text>
      <text x="192" y="96" fontSize="16" fontWeight="800" fill="#276F27">512</text>
      <rect x="272" y="62" width="80" height="48" rx="8" fill="#f4fbe8"/>
      <text x="284" y="80" fontSize="10" fontWeight="700" fill="#499A13">Événements</text>
      <text x="284" y="96" fontSize="16" fontWeight="800" fill="#499A13">18</text>
      <rect x="88" y="122" width="264" height="90" rx="8" fill="#f4fbe8"/>
      <path d="M100 170 Q140 140 180 155 Q220 170 260 145 Q300 120 340 160" stroke="#499A13" strokeWidth="2.5" fill="none"/>
      <circle cx="100" cy="170" r="4" fill="#499A13"/>
      <circle cx="180" cy="155" r="4" fill="#499A13"/>
      <circle cx="260" cy="145" r="4" fill="#499A13"/>
      <circle cx="340" cy="160" r="4" fill="#499A13"/>
      <rect x="88" y="122" width="130" height="30" rx="6" fill="#e8f5e0"/>
      <text x="96" y="141" fontSize="9" fontWeight="600" fill="#276F27">Activité ce mois</text>
      <rect x="230" y="122" width="122" height="30" rx="6" fill="#e8f5e0"/>
      <text x="238" y="141" fontSize="9" fontWeight="600" fill="#276F27">Formations en cours</text>
      <rect x="88" y="150" width="56" height="22" rx="4" fill="#499A13"/>
      <text x="96" y="165" fontSize="9" fontWeight="700" fill="#fff">+24%</text>
      <rect x="60" y="268" width="100" height="8" rx="4" fill="#d1d5db"/>
      <rect x="60" y="268" width="70" height="8" rx="4" fill="#499A13"/>
      <circle cx="380" cy="130" r="20" fill="#f4fbe8" opacity="0.6"/>
      <circle cx="50" cy="220" r="15" fill="#f4fbe8" opacity="0.6"/>
      <defs>
        <linearGradient id="hg1" x1="88" y1="62" x2="168" y2="110">
          <stop stopColor="#f4fbe8"/>
          <stop offset="1" stopColor="#e8f5e0"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

function FeatureIllustration() {
  return (
    <svg viewBox="0 0 400 320" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.heroIllustration}>
      <rect x="40" y="40" width="320" height="240" rx="16" fill="#f9fdf5" stroke="#e5e7eb" strokeWidth="1.5"/>
      <circle cx="200" cy="130" r="50" fill="#f4fbe8" stroke="#499A13" strokeWidth="1.5"/>
      <path d="M180 130l15 15 25-30" stroke="#499A13" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      <rect x="120" y="200" width="160" height="10" rx="5" fill="#e5e7eb"/>
      <rect x="140" y="220" width="120" height="8" rx="4" fill="#f3f4f6"/>
      <rect x="160" y="240" width="80" height="8" rx="4" fill="#f3f4f6"/>
      <circle cx="340" cy="60" r="20" fill="#f4fbe8" opacity="0.5"/>
      <circle cx="60" cy="260" r="15" fill="#f4fbe8" opacity="0.5"/>
    </svg>
  );
}

/* ─── Animation Variants ──────────────────────────────────────────────────── */

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  }),
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

/* ─── Component ───────────────────────────────────────────────────────────── */

export function HomePage() {
  const { logo } = useLogo();
  const { config } = useHomepage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { data: clubsData } = useQuery({
    queryKey: ["clubs-public"],
    queryFn: () => clubsService.list({ limit: 50 }),
  });

  const clubs: Club[] = clubsData?.data ?? [];

  const heroRef = useRef<HTMLElement>(null);
  const heroTitleRef = useRef<HTMLHeadingElement>(null);
  const heroSubRef = useRef<HTMLParagraphElement>(null);
  const heroActionsRef = useRef<HTMLDivElement>(null);
  const heroVisualRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLElement>(null);
  const communityRef = useRef<HTMLElement>(null);
  const feature1Ref = useRef<HTMLElement>(null);
  const statsRef = useRef<HTMLElement>(null);
  const feature2Ref = useRef<HTMLElement>(null);

  const introInView = useInView(introRef, { once: true, margin: "-60px" });
  const communityInView = useInView(communityRef, { once: true, margin: "-60px" });
  const feature1InView = useInView(feature1Ref, { once: true, margin: "-60px" });
  const statsInView = useInView(statsRef, { once: true, margin: "-60px" });
  const feature2InView = useInView(feature2Ref, { once: true, margin: "-60px" });

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(heroTitleRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, delay: 0.2, ease: "power3.out" });
      gsap.fromTo(heroSubRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7, delay: 0.4, ease: "power3.out" });
      gsap.fromTo(heroActionsRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, delay: 0.6, ease: "power3.out" });
      gsap.fromTo(heroVisualRef.current, { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration: 0.9, delay: 0.3, ease: "power3.out" });
    });
    return () => ctx.revert();
  }, []);

  const allLogos = clubs.filter((c) => c.logo);

  return (
    <div className={styles.page}>
      {/* ═══ HEADER ═══ */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link to={ROUTES.HOME} className={styles.brand}>
            <div className={styles.brandLogo}>
              {logo ? (
                <img src={logo} alt="ISIMGIEN" className={styles.brandLogoImg} />
              ) : (
                <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                  <rect width="36" height="36" rx="10" fill="url(#homeLogoGrad)" />
                  <path d="M10 13l8-4.5 8 4.5v10a1.5 1.5 0 01-1.5 1.5h-13A1.5 1.5 0 0110 23V13z" stroke="white" strokeWidth="1.8" strokeLinejoin="round" />
                  <path d="M14.5 27v-6h7v6" stroke="white" strokeWidth="1.8" strokeLinejoin="round" />
                  <defs>
                    <linearGradient id="homeLogoGrad" x1="0" y1="0" x2="36" y2="36">
                      <stop stopColor="#499A13" />
                      <stop offset="1" stopColor="#276F27" />
                    </linearGradient>
                  </defs>
                </svg>
              )}
            </div>
            <div className={styles.brandText}>
              <span className={styles.brandName}>ISIMGIEN</span>
              <span className={styles.brandTagline}>Plateforme universitaire</span>
            </div>
          </Link>

          <nav className={styles.navLinks}>
            {NAV_LINKS.map((link) => (
              <a key={link.label} href={link.href} className={styles.navLink}>
                {link.label}
              </a>
            ))}
          </nav>

          <div className={styles.headerActions}>
            <Link to={ROUTES.LOGIN} className={styles.registerBtn}>
              Connexion
            </Link>
            <button
              className={styles.burgerBtn}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* ═══ MOBILE MENU ═══ */}
      {mobileMenuOpen && (
        <div className={styles.mobileOverlay} onClick={() => setMobileMenuOpen(false)}>
          <div className={styles.mobileMenu} onClick={(e) => e.stopPropagation()}>
            <nav className={styles.mobileNavLinks}>
              {NAV_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className={styles.mobileNavLink}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <Link to={ROUTES.LOGIN} className={styles.mobileCta} onClick={() => setMobileMenuOpen(false)}>
                Connexion
              </Link>
            </nav>
          </div>
        </div>
      )}

      {/* ═══ HERO ═══ */}
      <section ref={heroRef} className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroLeft}>
            <h1 ref={heroTitleRef} className={styles.heroTitle}>
              {config.heroTitle.split(" ").map((word, i) => {
                const isHighlight = /intelligente|ISIMGIEN|excellence|démocrat/i.test(word);
                return isHighlight ? (
                  <span key={i} className={styles.heroGreen}>{word} </span>
                ) : (
                  <span key={i}>{word} </span>
                );
              })}
            </h1>
            <p ref={heroSubRef} className={styles.heroSubtitle}>
              {config.heroSubtitle}
            </p>
            <div ref={heroActionsRef} className={styles.heroActions}>
              <Link to={ROUTES.LOGIN} className={styles.heroCtaBtn}>
                Commencer maintenant
              </Link>
            </div>
          </div>
          <div ref={heroVisualRef} className={styles.heroRight}>
            {config.heroImage ? (
              <img src={config.heroImage} alt="Hero" className={styles.heroCustomImage} />
            ) : (
              <HeroIllustration />
            )}
          </div>
        </div>
      </section>

      {/* ═══ COLLABORATORS ═══ */}
      <section className={styles.collabSection}>
        <div className={styles.sectionContainer}>
          <h2 className={styles.collabTitle}>{config.collaboratorsTitle}</h2>
          <p className={styles.collabSubtitle}>{config.collaboratorsSubtitle}</p>
        </div>
        {(allLogos.length > 0 || config.externalCollaborators.length > 0) && (
          <div className={styles.marqueeWrap}>
            <div className={styles.marqueeTrack}>
              {[...allLogos, ...config.externalCollaborators.filter((c) => c.logo), ...allLogos, ...config.externalCollaborators.filter((c) => c.logo)].map((club, i) => (
                <div key={i} className={styles.collabLogoItem}>
                  {club.logo ? (
                    <img src={club.logo} alt={"logo"} className={styles.collabLogoImg} />
                  ) : (
                    <div className={styles.collabLogoFallback}>
                      <span>{"?"}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ═══ INTRO SECTION ═══ */}
      <section ref={introRef} className={styles.introSection}>
        <div className={styles.sectionContainer}>
          <div className={styles.introRow}>
            <motion.div
              className={styles.introText}
              initial="hidden"
              animate={introInView ? "visible" : "hidden"}
              variants={fadeUp}
              custom={0}
            >
              <span className={styles.sectionBadge}>{config.introTitle}</span>
              <h2 className={styles.introTitle}>
                {config.introDescription.split(" ").slice(0, 6).join(" ")}{" "}
                <span className={styles.heroGreen}>{config.introDescription.split(" ").slice(6, 12).join(" ")}</span>{" "}
                {config.introDescription.split(" ").slice(12).join(" ")}
              </h2>
            </motion.div>
            <motion.div
              className={styles.introVisual}
              initial="hidden"
              animate={introInView ? "visible" : "hidden"}
              variants={fadeUp}
              custom={1}
            >
              {config.introImage ? (
                <img src={config.introImage} alt="ISIMGIEN" className={styles.introImage} />
              ) : (
                <FeatureIllustration />
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ COMMUNITY ═══ */}
      <section ref={communityRef} id="community" className={styles.communitySection}>
        <div className={styles.sectionContainer}>
          <motion.div
            className={styles.sectionHeader}
            initial="hidden"
            animate={communityInView ? "visible" : "hidden"}
            variants={staggerContainer}
          >
            <motion.h2 variants={fadeUp} custom={0} className={styles.sectionTitle}>
              {config.communityTitle.split(" ").map((word, i) => {
                const isHighlight = /communauté|seul|système/i.test(word);
                return isHighlight ? (
                  <span key={i} className={styles.heroGreen}>{word} </span>
                ) : (
                  <span key={i}>{word} </span>
                );
              })}
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className={styles.sectionSubtitle}>
              {config.communitySubtitle}
            </motion.p>
          </motion.div>

          <div className={styles.communityGrid}>
            {config.communityCards.map((card, i) => (
              <motion.div
                key={card.title}
                className={styles.communityCard}
                initial="hidden"
                animate={communityInView ? "visible" : "hidden"}
                variants={fadeUp}
                custom={i + 2}
              >
                <div className={styles.communityIconWrap} style={{ background: `${card.iconColor}12`, color: card.iconColor }}>
                  {i === 0 && (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                  )}
                  {i === 1 && (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 21h18"/>
                      <path d="M5 21V7l8-4v18"/>
                      <path d="M19 21V11l-6-4"/>
                      <path d="M9 9v.01"/><path d="M9 12v.01"/><path d="M9 15v.01"/><path d="M9 18v.01"/>
                    </svg>
                  )}
                  {i === 2 && (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                      <path d="M2 17l10 5 10-5"/>
                      <path d="M2 12l10 5 10-5"/>
                    </svg>
                  )}
                </div>
                <h3 className={styles.communityCardTitle}>{card.title}</h3>
                <p className={styles.communityCardDesc}>{card.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FEATURE 1 ═══ */}
      <section ref={feature1Ref} id="features" className={styles.featureSection}>
        <div className={styles.sectionContainer}>
          <div className={styles.featureRow}>
            <motion.div
              className={styles.featureVisual}
              initial="hidden"
              animate={feature1InView ? "visible" : "hidden"}
              variants={fadeUp}
              custom={0}
            >
              <FeatureIllustration />
            </motion.div>
            <motion.div
              className={styles.featureText}
              initial="hidden"
              animate={feature1InView ? "visible" : "hidden"}
              variants={fadeUp}
              custom={1}
            >
              <span className={styles.sectionBadge}>{config.feature1.subtitle}</span>
              <h2 className={styles.featureTitle}>
                {config.feature1.title.split(" ").map((word, i) => {
                  const isHighlight = /ISIMGIEN|étudiants|leaders/i.test(word);
                  return isHighlight ? (
                    <span key={i} className={styles.heroGreen}>{word} </span>
                  ) : (
                    <span key={i}>{word} </span>
                  );
                })}
              </h2>
              <p className={styles.featureDesc}>{config.feature1.description}</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ STATS ═══ */}
      <section ref={statsRef} className={styles.statsSection}>
        <div className={styles.sectionContainer}>
          <div className={styles.statsRow}>
            <motion.div
              className={styles.statsText}
              initial="hidden"
              animate={statsInView ? "visible" : "hidden"}
              variants={fadeUp}
              custom={0}
            >
              <h2 className={styles.statsTitle}>
                Nos chiffres parlent{" "}
                <span className={styles.heroGreen}>d'eux-mêmes</span>
              </h2>
              <p className={styles.statsSubtitle}>
                L'impact d'ISIMGIEN ClubHub se mesure en communauté, en engagement et en succès.
              </p>
            </motion.div>
            <div className={styles.statsGrid}>
              {config.stats.map((stat) => (
                <motion.div
                  key={stat.label}
                  className={styles.statCard}
                  initial="hidden"
                  animate={statsInView ? "visible" : "hidden"}
                  variants={fadeUp}
                  custom={1}
                >
                  <span className={styles.statValue}>{stat.value}</span>
                  <span className={styles.statLabel}>{stat.label}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FEATURE 2 ═══ */}
      <section ref={feature2Ref} className={styles.featureSection}>
        <div className={styles.sectionContainer}>
          <div className={styles.featureRow}>
            <motion.div
              className={styles.featureText}
              initial="hidden"
              animate={feature2InView ? "visible" : "hidden"}
              variants={fadeUp}
              custom={0}
            >
              <span className={styles.sectionBadge}>{config.feature2.subtitle}</span>
              <h2 className={styles.featureTitle}>{config.feature2.title}</h2>
              <p className={styles.featureDesc}>{config.feature2.description}</p>
            </motion.div>
            <motion.div
              className={styles.featureVisual}
              initial="hidden"
              animate={feature2InView ? "visible" : "hidden"}
              variants={fadeUp}
              custom={1}
            >
              <FeatureIllustration />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ CTA BANNER ═══ */}
      <section className={styles.ctaBanner}>
        <div className={styles.sectionContainer}>
          <div className={styles.ctaBannerInner}>
            <h2 className={styles.ctaBannerTitle}>{config.ctaTitle}</h2>
            <p className={styles.ctaBannerSub}>{config.ctaSubtitle}</p>
            <Link to={ROUTES.LOGIN} className={styles.ctaBannerBtn}>
              Commencer maintenant
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ SUPER ADMIN QUOTE ═══ */}
      <section className={styles.adminQuoteSection}>
        <div className={styles.sectionContainer}>
          <div className={styles.adminQuoteCard}>
            <div className={styles.adminQuoteAvatar}>
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="24" fill="url(#adminGrad)"/>
                <circle cx="24" cy="18" r="8" fill="rgba(255,255,255,0.9)"/>
                <path d="M8 42c0-8.837 7.163-16 16-16s16 7.163 16 16" fill="rgba(255,255,255,0.9)"/>
                <defs>
                  <linearGradient id="adminGrad" x1="0" y1="0" x2="48" y2="48">
                    <stop stopColor="#499A13"/>
                    <stop offset="1" stopColor="#276F27"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div className={styles.adminQuoteContent}>
              <svg className={styles.adminQuoteIcon} width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M10 8c-1.1 0-2 .9-2 2v4h4v-4H8c0-1.1.9-2 2-2V6c-2.21 0-4 1.79-4 4v8h8v-8c0-1.1-.9-2-2-2z" fill="#499A13" opacity="0.3"/>
                <path d="M18 8c-1.1 0-2 .9-2 2v4h4v-4h-4c0-1.1.9-2 2-2V6c-2.21 0-4 1.79-4 4v8h8v-8c0-1.1-.9-2-2-2z" fill="#499A13" opacity="0.3"/>
              </svg>
              <p className={styles.adminQuoteText}>
                "ISIMGIEN ClubHub est bien plus qu'un outil de gestion — c'est un écosystème qui autonomise nos étudiants leaders. En centralisant clubs, événements et formations, nous avons transformé la gouvernance étudiante en un processus fluide, transparent et intelligent. Notre vision : faire de chaque campus un laboratoire d'innovation et de leadership."
              </p>
              <div className={styles.adminQuoteAuthor}>
                <span className={styles.adminQuoteName}>Directeur ISIMGIEN</span>
                <span className={styles.adminQuoteRole}>Super Administrateur</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer id="footer" className={styles.footer}>
        <div className={styles.sectionContainer}>
          <div className={styles.footerGrid}>
            <div className={styles.footerBrand}>
              <Link to={ROUTES.HOME} className={styles.footerLogo}>
                {logo ? (
                  <img src={logo} alt="ISIMGIEN" className={styles.footerLogoImg} />
                ) : (
                  <span className={styles.footerLogoText}>ISIMGIEN ClubHub</span>
                )}
              </Link>
              <p className={styles.footerTagline}>
                La plateforme intelligente de gestion des clubs universitaires. Développée avec excellence par l'ISIMGIEN.
              </p>
              <div className={styles.footerSocial}>
                <a href="#" className={styles.socialIcon} aria-label="Facebook">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
                <a href="#" className={styles.socialIcon} aria-label="LinkedIn">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </a>
                <a href="#" className={styles.socialIcon} aria-label="Twitter">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
              </div>
            </div>

            <div className={styles.footerCol}>
              <h4 className={styles.footerColTitle}>Plateforme</h4>
              <a href="#features" className={styles.footerLink}>Fonctionnalités</a>
              <a href="#community" className={styles.footerLink}>Communauté</a>
              <a href="#" className={styles.footerLink}>Tarification</a>
              <a href="#" className={styles.footerLink}>Documentation</a>
            </div>

            <div className={styles.footerCol}>
              <h4 className={styles.footerColTitle}>Support</h4>
              <a href="#" className={styles.footerLink}>Centre d'aide</a>
              <a href="#" className={styles.footerLink}>Contactez-nous</a>
              <a href="#" className={styles.footerLink}>Statut du système</a>
            </div>

            <div className={styles.footerCol}>
              <h4 className={styles.footerColTitle}>Légal</h4>
              <a href="#" className={styles.footerLink}>Politique de confidentialité</a>
              <a href="#" className={styles.footerLink}>Conditions d'utilisation</a>
              <a href="#" className={styles.footerLink}>Politique de cookies</a>
              <a href="#" className={styles.footerLink}>Mentions légales</a>
            </div>
          </div>

          <div className={styles.footerBottom}>
            <p>© {new Date().getFullYear()} ISIMGIEN ClubHub. Tous droits réservés.</p>
            <p className={styles.footerBottomSub}>Développé avec passion à l'Institut Supérieur d'Informatique et de Management de Kairouan.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
