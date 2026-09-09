import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

const LOGO_STORAGE_KEY = "clubhub_platform_logo";

interface LogoContextValue {
  logo: string | null;
  setLogo: (logo: string | null) => void;
  saveLogo: () => Promise<void>;
  saving: boolean;
  saved: boolean;
}

const LogoContext = createContext<LogoContextValue | null>(null);

export function LogoProvider({ children }: { children: ReactNode }) {
  const [logo, setLogoState] = useState<string | null>(() => {
    try {
      return localStorage.getItem(LOGO_STORAGE_KEY);
    } catch {
      return null;
    }
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOGO_STORAGE_KEY);
      if (stored) setLogoState(stored);
    } catch {}
  }, []);

  const setLogo = useCallback((value: string | null) => {
    setLogoState(value);
  }, []);

  const saveLogo = useCallback(async () => {
    setSaving(true);
    setSaved(false);
    try {
      await new Promise((r) => setTimeout(r, 500));
      if (logo) {
        localStorage.setItem(LOGO_STORAGE_KEY, logo);
      } else {
        localStorage.removeItem(LOGO_STORAGE_KEY);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  }, [logo]);

  return (
    <LogoContext.Provider value={{ logo, setLogo, saveLogo, saving, saved }}>
      {children}
    </LogoContext.Provider>
  );
}

export function useLogo() {
  const ctx = useContext(LogoContext);
  if (!ctx) throw new Error("useLogo must be used within LogoProvider");
  return ctx;
}
