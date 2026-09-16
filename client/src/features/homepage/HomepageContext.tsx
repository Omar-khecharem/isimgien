import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

const STORAGE_KEY = "clubhub_homepage_config";

export interface CommunityCard {
  title: string;
  description: string;
  iconColor: string;
}

export interface FeatureSection {
  title: string;
  subtitle: string;
  description: string;
}

export interface StatItem {
  value: string;
  label: string;
}

export interface BlogPost {
  title: string;
  subtitle: string;
}

export interface ExternalCollaborator {
  name: string;
  logo: string | null;
}

export interface HomepageConfig {
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string | null;
  introTitle: string;
  introDescription: string;
  introImage: string | null;
  collaboratorsTitle: string;
  collaboratorsSubtitle: string;
  externalCollaborators: ExternalCollaborator[];
  communityTitle: string;
  communitySubtitle: string;
  communityCards: CommunityCard[];
  feature1: FeatureSection;
  feature2: FeatureSection;
  stats: StatItem[];
  ctaTitle: string;
  ctaSubtitle: string;
}

interface HomepageContextValue {
  config: HomepageConfig;
  update: (patch: Partial<HomepageConfig>) => void;
  save: () => Promise<void>;
  saving: boolean;
  saved: boolean;
}

const DEFAULT_CONFIG: HomepageConfig = {
  heroTitle: "La plateforme intelligente de gestion des clubs universitaires",
  heroSubtitle:
    "ISIMGIEN ClubHub centralise la gestion de vos clubs, événements, formations et adhésions. Une solution pensée pour l'excellence, conçue pour les leaders de demain.",
  heroImage: null,
  introTitle: "Qu'est-ce qu'ISIMGIEN ClubHub ?",
  introDescription:
    "ISIMGIEN ClubHub est une plateforme de gestion intégrée développée pour l'Institut Supérieur d'Informatique et de Management de Kairouan. Elle offre aux responsables de clubs et aux administrateurs un écosystème complet pour organiser, piloter et analyser l'ensemble des activités extrascolaires — en un seul endroit.",
  introImage: null,
  collaboratorsTitle: "Nos Collaborateurs",
  collaboratorsSubtitle: "Partenaires et clubs qui nous font confiance",
  externalCollaborators: [],
  communityTitle: "Gérez toute votre communauté dans un seul système",
  communitySubtitle: "Pour qui est conçu ISIMGIEN ClubHub ?",
  communityCards: [
    {
      title: "Clubs universitaires",
      description: "Gestion complète des membres, événements, finances et présences pour tous les types de clubs.",
      iconColor: "#499A13",
    },
    {
      title: "Associations nationales",
      description: "Notre plateforme gère la complexité des grandes associations avec des milliers de membres.",
      iconColor: "#276F27",
    },
    {
      title: "Organisations étudiantes",
      description: "Du petit groupe d'étude à la grande organisation — gérez tout sans effort.",
      iconColor: "#8ECA3C",
    },
  ],
  feature1: {
    title: "Une solution pensée par des étudiants, pour des étudiants",
    subtitle: "Notre mission",
    description: "ISIMGIEN ClubHub est né d'un constat simple : la gestion des clubs universitaires mérite mieux que des tableurs et des listes dispersées. Nous avons construit une plateforme qui automatise les tâches administratives pour que les leaders puissent se concentrer sur l'essentiel — créer de la valeur pour leurs membres.",
  },
  feature2: {
    title: "L'intelligence artificielle au service de vos clubs",
    subtitle: "Innovation",
    description: "Grâce à l'IA intégrée, ISIMGIEN ClubHub vous offre des recommandations personnalisées, des analyses prédictives et des outils d'automatisation qui transforment la gestion club en une expérience fluide et intelligente.",
  },
  stats: [
    { value: "500+", label: "Membres actifs" },
    { value: "25+", label: "Clubs gérés" },
    { value: "120+", label: "Événements organisés" },
    { value: "98%", label: "Satisfaction" },
  ],
  ctaTitle: "Prêt à transformer la gestion de votre club ?",
  ctaSubtitle: "Rejoignez des centaines d'organisations qui utilisent ISIMGIEN ClubHub pour gérer leurs membres, événements et finances.",
};

const HomepageContext = createContext<HomepageContextValue | null>(null);

export function HomepageProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<HomepageConfig>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return { ...DEFAULT_CONFIG, ...JSON.parse(stored) };
    } catch {}
    return DEFAULT_CONFIG;
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setConfig((prev) => ({ ...prev, ...parsed }));
      }
    } catch {}
  }, []);

  const update = useCallback((patch: Partial<HomepageConfig>) => {
    setConfig((prev) => ({ ...prev, ...patch }));
  }, []);

  const save = useCallback(async () => {
    setSaving(true);
    setSaved(false);
    try {
      await new Promise((r) => setTimeout(r, 400));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  }, [config]);

  return (
    <HomepageContext.Provider value={{ config, update, save, saving, saved }}>
      {children}
    </HomepageContext.Provider>
  );
}

export function useHomepage(): HomepageContextValue {
  const ctx = useContext(HomepageContext);
  if (!ctx) throw new Error("useHomepage must be used within HomepageProvider");
  return ctx;
}
