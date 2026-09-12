import { useState, useRef, useCallback, useEffect, Component, type ReactNode, type ErrorInfo } from "react";
import { useAuth } from "../../features/auth";
import { clubsService, type UpdateClubByLeaderInput } from "../clubs/clubsService";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../services/apiClient";
import styles from "./ClubProfile.module.css";

/* ─── Error Boundary ─────────────────────────────────────────────────── */

interface EBState { hasError: boolean; error: Error | null }

class ProfileErrorBoundary extends Component<{ children: ReactNode }, EBState> {
  state: EBState = { hasError: false, error: null };
  static getDerivedStateFromError(error: Error) { return { hasError: true, error }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error("[ClubProfile]", error, info); }
  render() {
    if (this.state.hasError) {
      return (
        <div className={styles.page}>
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="1.5"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
            </div>
            <h3 className={styles.emptyTitle}>Erreur de chargement</h3>
            <p className={styles.emptyDesc}>{this.state.error?.message || "Une erreur est survenue"}</p>
            <button className={`${styles.btn} ${styles["btn--primary"]}`} style={{ marginTop: 12 }} onClick={() => this.setState({ hasError: false, error: null })}>
              Réessayer
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

/* ─── SVG Icons ───────────────────────────────────────────────────────── */

const I = {
  camera: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" /><circle cx="12" cy="13" r="4" /></svg>,
  upload: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>,
  save: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>,
  check: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>,
  mail: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M22 7l-10 6L2 7" /></svg>,
  phone: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" /></svg>,
  calendar: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>,
  globe: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" /></svg>,
  settings: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" /></svg>,
  facebook: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>,
  instagram: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>,
  linkedin: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>,
  download: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>,
  copy: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>,
  share: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></svg>,
  qr: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="3" height="3" /><path d="M21 14h-3v3M14 21h3v-3M21 21h-3" /></svg>,
};

/* ─── Helpers ──────────────────────────────────────────────────────────── */

function getLeaderName(c: any): string {
  if (!c.leader) return "—";
  if (typeof c.leader === "string") return "—";
  return `${c.leader.firstName || ""} ${c.leader.lastName || ""}`.trim() || "—";
}

/* ─── QR Code (lazy) ────────────────────────────────────────────────── */

function QRCodeLazy(props: { value: string; size: number; bgColor: string; fgColor: string; level: string; includeMargin: boolean }) {
  const [Comp, setComp] = useState<any>(null);
  useEffect(() => {
    import("qrcode.react").then((m) => setComp(() => m.QRCodeSVG)).catch(() => {});
  }, []);
  if (!Comp) return <div style={{ width: props.size, height: props.size, display: "flex", alignItems: "center", justifyContent: "center", color: "#9CA3AF", fontSize: 13 }}>Chargement...</div>;
  return <Comp {...props} />;
}

/* ─── Inner Component ──────────────────────────────────────────────── */

function ClubProfileInner() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const coverInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const qrRef = useRef<HTMLDivElement>(null);

  const [edits, setEdits] = useState<Record<string, any>>({});
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "qr">("profile");

  const [qrFields, setQrFields] = useState([
    { key: "name", label: "Nom du club", checked: true },
    { key: "contactEmail", label: "Email de contact", checked: true },
    { key: "contactPhone", label: "Téléphone", checked: true },
    { key: "leader", label: "Leader du club", checked: true },
    { key: "socialLinks", label: "Réseaux sociaux", checked: false },
    { key: "establishedDate", label: "Date de création", checked: false },
    { key: "settings", label: "Paramètres", checked: false },
  ]);

  const [qrColor, setQrColor] = useState("#059669");

  /* ── Fetch club data ──────────────────────────────────────────────── */

  const { data: clubData, isLoading: clubLoading, error: clubError } = useQuery({
    queryKey: ["leader", "my-club"],
    queryFn: async () => {
      const res = await clubsService.getMyClub();
      return res.data;
    },
    enabled: !!user,
  });

  const clubId = clubData?._id;

  /* ── Form state ───────────────────────────────────────────────────── */

  const form = {
    name: edits.name ?? clubData?.name ?? "",
    description: edits.description ?? clubData?.description ?? "",
    contactEmail: edits.contactEmail ?? clubData?.contactEmail ?? "",
    contactPhone: edits.contactPhone ?? clubData?.contactPhone ?? "",
    establishedDate: edits.establishedDate ?? clubData?.establishedDate ?? null,
    logo: edits.logo ?? clubData?.logo ?? null,
    coverImage: edits.coverImage ?? clubData?.coverImage ?? null,
    socialLinks: {
      website: edits["socialLinks.website"] ?? clubData?.socialLinks?.website ?? "",
      facebook: edits["socialLinks.facebook"] ?? clubData?.socialLinks?.facebook ?? "",
      instagram: edits["socialLinks.instagram"] ?? clubData?.socialLinks?.instagram ?? "",
      linkedin: edits["socialLinks.linkedin"] ?? clubData?.socialLinks?.linkedin ?? "",
    },
    settings: {
      requireRegistrationValidation: edits["settings.requireRegistrationValidation"] ?? clubData?.settings?.requireRegistrationValidation ?? false,
      defaultTrainingCapacity: edits["settings.defaultTrainingCapacity"] ?? clubData?.settings?.defaultTrainingCapacity ?? null,
      membershipFee: edits["settings.membershipFee"] ?? clubData?.settings?.membershipFee ?? 0,
      membershipPeriodMonths: edits["settings.membershipPeriodMonths"] ?? clubData?.settings?.membershipPeriodMonths ?? 1,
    },
  };

  const hasChanges = Object.keys(edits).length > 0;

  /* ── QR Content ──────────────────────────────────────────────────── */

  const buildQRContent = useCallback(() => {
    if (!clubData) return "";
    const parts: string[] = [];
    const enabled = qrFields.filter((f) => f.checked).map((f) => f.key);

    if (enabled.includes("name")) parts.push(`Club: ${form.name}`);
    if (enabled.includes("contactEmail") && clubData.contactEmail) parts.push(`Email: ${clubData.contactEmail}`);
    if (enabled.includes("contactPhone") && clubData.contactPhone) parts.push(`Téléphone: ${clubData.contactPhone}`);
    if (enabled.includes("leader")) parts.push(`Leader: ${getLeaderName(clubData)}`);
    if (enabled.includes("socialLinks")) {
      const links: string[] = [];
      if (clubData.socialLinks?.website) links.push(`Site: ${clubData.socialLinks.website}`);
      if (clubData.socialLinks?.facebook) links.push(`FB: ${clubData.socialLinks.facebook}`);
      if (clubData.socialLinks?.instagram) links.push(`IG: ${clubData.socialLinks.instagram}`);
      if (clubData.socialLinks?.linkedin) links.push(`LI: ${clubData.socialLinks.linkedin}`);
      if (links.length) parts.push(links.join(" | "));
    }
    if (enabled.includes("establishedDate") && clubData.establishedDate) parts.push(`Créé: ${new Date(clubData.establishedDate).toLocaleDateString("fr-FR")}`);
    if (enabled.includes("settings")) {
      if (clubData.settings?.membershipFee) parts.push(`Cotisation: ${clubData.settings.membershipFee.toLocaleString("fr-FR")} TND`);
    }
    return parts.join("\n");
  }, [clubData, qrFields]);

  const qrContent = buildQRContent();

  /* ── Mutations ────────────────────────────────────────────────────── */

  const updateMutation = useMutation({
    mutationFn: async (data: UpdateClubByLeaderInput) => {
      if (!clubId) throw new Error("No club");
      return clubsService.updateByLeader(clubId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leader", "my-club"] });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async ({ file }: { file: File }) => {
      const formData = new FormData();
      formData.append("file", file);
      const res = await apiClient.upload<{ success: boolean; data: { url: string } }>("/clubs/upload", formData);
      return res.data.url;
    },
  });

  /* ── Handlers ─────────────────────────────────────────────────────── */

  const update = (field: string, value: any) => setEdits((p) => ({ ...p, [field]: value }));
  const updateSocial = (field: string, value: string) => setEdits((p) => ({ ...p, [`socialLinks.${field}`]: value }));
  const updateSetting = (field: string, value: any) => setEdits((p) => ({ ...p, [`settings.${field}`]: value }));

  const handleImageUpload = async (file: File, type: "logo" | "cover") => {
    const url = await uploadMutation.mutateAsync({ file });
    update(type === "logo" ? "logo" : "coverImage", url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "logo" | "cover") => {
    const file = e.target.files?.[0];
    if (file) handleImageUpload(file, type);
  };

  const handleSave = () => {
    if (!clubId) return;
    // Build clean payload — only send editable fields, convert empty strings to null
    const payload: UpdateClubByLeaderInput = {
      name: form.name || undefined,
      description: form.description || undefined,
      logo: form.logo || null,
      coverImage: form.coverImage || null,
      establishedDate: form.establishedDate || null,
      contactEmail: form.contactEmail || null,
      contactPhone: form.contactPhone || null,
      socialLinks: {
        website: form.socialLinks.website || undefined,
        facebook: form.socialLinks.facebook || undefined,
        instagram: form.socialLinks.instagram || undefined,
        linkedin: form.socialLinks.linkedin || undefined,
      },
    };
    updateMutation.mutate(payload);
  };
  const handleReset = () => setEdits({});
  const toggleQRField = (key: string) => setQrFields((prev) => prev.map((f) => (f.key === key ? { ...f, checked: !f.checked } : f)));

  const handleDownloadQR = () => {
    const svg = qrRef.current?.querySelector("svg");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = 512; canvas.height = 512;
      ctx?.drawImage(img, 0, 0, 512, 512);
      const link = document.createElement("a");
      link.download = `${clubData?.name || "club"}-qr.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  const handleCopyQR = async () => {
    try { await navigator.clipboard.writeText(qrContent); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* empty */ }
  };

  /* ── Loading ──────────────────────────────────────────────────────── */

  if (clubLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingWrap}>
          <div className={styles.spinner} />
          <p className={styles.loadingText}>Chargement du profil...</p>
        </div>
      </div>
    );
  }

  /* ── Errors ──────────────────────────────────────────────────────── */

  if (clubError) {
    const errMsg = (clubError as any)?.error?.message || (clubError as any)?.message || "Impossible de charger les données";
    return (
      <div className={styles.page}>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
          </div>
          <h3 className={styles.emptyTitle}>Erreur de chargement</h3>
          <p className={styles.emptyDesc}>{errMsg}</p>
          <button className={`${styles.btn} ${styles["btn--primary"]}`} style={{ marginTop: 12 }} onClick={() => window.location.reload()}>
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  /* ── No club ──────────────────────────────────────────────────────── */

  if (!clubData) {
    return (
      <div className={styles.page}>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="1.5"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
          </div>
          <h3 className={styles.emptyTitle}>Aucun club trouvé</h3>
          <p className={styles.emptyDesc}>Vous n'avez pas de club assigné.</p>
        </div>
      </div>
    );
  }

  /* ── Helpers local ──────────────────────────────────────────────── */

  const leaderName = getLeaderName(clubData);
  const clubName = form.name || "Club";

  /* ── Render ──────────────────────────────────────────────────────── */

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.greeting}>Profil du Club</h1>
          <p className={styles.subtitle}>Configurez les informations de {clubName}</p>
        </div>
      </div>

      {saved && (
        <div className={styles.toast}>
          {I.check} Profil mis à jour avec succès
        </div>
      )}

      {/* Cover + Logo */}
      <div className={styles.coverCard}>
        <div className={styles.coverWrap}>
          {form.coverImage && <img src={form.coverImage} alt="Cover" className={styles.coverImg} />}
          <div className={styles.coverOverlay} />
          <input ref={coverInputRef} type="file" accept="image/*" hidden onChange={(e) => handleFileChange(e, "cover")} />
          <button className={styles.coverBtn} onClick={() => coverInputRef.current?.click()}>
            <span className={styles.coverBtnIcon}>{I.camera}</span> Photo de couverture
          </button>
        </div>

        <div className={styles.profileRow}>
          <div className={styles.logoWrap}>
            <div className={styles.logo}>
              {form.logo ? <img src={form.logo} alt="Logo" className={styles.logoImg} /> : <div className={styles.logoPlaceholder}>{clubName[0]}</div>}
            </div>
            <input ref={logoInputRef} type="file" accept="image/*" hidden onChange={(e) => handleFileChange(e, "logo")} />
            <button className={styles.logoUpload} onClick={() => logoInputRef.current?.click()}>{I.upload}</button>
          </div>
          <div className={styles.profileInfo}>
            <h2 className={styles.profileName}>{clubName}</h2>
            <p className={styles.profileLeader}>Leader : {leaderName}</p>
            <span className={`${styles.profileStatus} ${clubData.isActive ? styles["profileStatus--active"] : styles["profileStatus--inactive"]}`}>
              <span className={styles.statusDot} /> {clubData.isActive ? "Actif" : "Inactif"}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button className={`${styles.tab} ${activeTab === "profile" ? styles["tab--active"] : ""}`} onClick={() => setActiveTab("profile")}>
          {I.settings} Profil & Paramètres
        </button>
        <button className={`${styles.tab} ${activeTab === "qr" ? styles["tab--active"] : ""}`} onClick={() => setActiveTab("qr")}>
          {I.qr} QR Code
        </button>
      </div>

      {/* ═══════════════ PROFILE TAB ═══════════════ */}
      {activeTab === "profile" && (
        <>
          <div className={styles.saveBar}>
            <span className={styles.saveBarText}>{hasChanges ? "Modifications non enregistrées" : "Aucune modification"}</span>
            <div className={styles.saveBarActions}>
              {hasChanges && <button className={`${styles.btn} ${styles["btn--secondary"]}`} onClick={handleReset}>Annuler</button>}
              <button className={`${styles.btn} ${styles["btn--primary"]}`} onClick={handleSave} disabled={!hasChanges || updateMutation.isPending}>
                {updateMutation.isPending ? <div className={styles.btnSpinner} /> : I.save}
                {updateMutation.isPending ? "Enregistrement..." : "Enregistrer"}
              </button>
            </div>
          </div>

          <div className={styles.mainGrid}>
            <div className={styles.leftCol}>
              {/* Club Name */}
              <div className={styles.card}>
                <div className={styles.cardHead}><div><h3 className={styles.cardTitle}>Informations générales</h3><p className={styles.cardSubtitle}>Nom et description de votre club</p></div></div>
                <div className={styles.cardBody}>
                  <div className={styles.field}>
                    <label className={styles.fieldLabel}>Nom du club</label>
                    <input className={styles.input} type="text" value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Nom de votre club" maxLength={200} />
                  </div>
                  <div className={styles.field} style={{ marginTop: 16 }}>
                    <label className={styles.fieldLabel}>Description</label>
                    <textarea className={styles.textarea} value={form.description} onChange={(e) => update("description", e.target.value)} rows={5} placeholder="Décrivez votre club, ses activités et sa mission..." />
                    <div className={styles.charCount}>{form.description.length} / 5000</div>
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div className={styles.card}>
                <div className={styles.cardHead}><div><h3 className={styles.cardTitle}>Informations de contact</h3><p className={styles.cardSubtitle}>Coordonnées du club</p></div></div>
                <div className={styles.cardBody}>
                  <div className={styles.formGrid}>
                    <div className={styles.field}>
                      <label className={styles.fieldLabel}>Email de contact</label>
                      <div className={styles.inputWrap}>
                        <span className={styles.inputIcon}>{I.mail}</span>
                        <input className={`${styles.input} ${styles["input--icon"]}`} type="email" value={form.contactEmail || ""} onChange={(e) => update("contactEmail", e.target.value)} placeholder="club@isimg.tn" />
                      </div>
                    </div>
                    <div className={styles.field}>
                      <label className={styles.fieldLabel}>Téléphone</label>
                      <div className={styles.inputWrap}>
                        <span className={styles.inputIcon}>{I.phone}</span>
                        <input className={`${styles.input} ${styles["input--icon"]}`} type="tel" value={form.contactPhone || ""} onChange={(e) => update("contactPhone", e.target.value)} placeholder="+216 XX XXX XXX" />
                      </div>
                    </div>
                    <div className={styles.field} style={{ gridColumn: "1 / -1" }}>
                      <label className={styles.fieldLabel}>Date de création</label>
                      <div className={styles.inputWrap}>
                        <span className={styles.inputIcon}>{I.calendar}</span>
                        <input className={`${styles.input} ${styles["input--icon"]}`} type="date" value={form.establishedDate ? new Date(form.establishedDate).toISOString().split("T")[0] : ""} onChange={(e) => update("establishedDate", e.target.value || null)} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social */}
              <div className={styles.card}>
                <div className={styles.cardHead}><div><h3 className={styles.cardTitle}>Réseaux sociaux</h3><p className={styles.cardSubtitle}>Liens vers vos plateformes</p></div></div>
                <div className={styles.cardBody}>
                  {([
                    { key: "website", label: "Site web", icon: I.globe, iconClass: "web", placeholder: "https://..." },
                    { key: "facebook", label: "Facebook", icon: I.facebook, iconClass: "fb", placeholder: "https://facebook.com/..." },
                    { key: "instagram", label: "Instagram", icon: I.instagram, iconClass: "ig", placeholder: "https://instagram.com/..." },
                    { key: "linkedin", label: "LinkedIn", icon: I.linkedin, iconClass: "li", placeholder: "https://linkedin.com/..." },
                  ] as const).map((s) => (
                    <div key={s.key} className={styles.socialRow}>
                      <div className={`${styles.socialIcon} ${styles[`socialIcon--${s.iconClass}`]}`}>{s.icon}</div>
                      <input className={styles.socialInput} type="url" value={(form.socialLinks as any)[s.key] || ""} onChange={(e) => updateSocial(s.key, e.target.value)} placeholder={s.placeholder} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Settings */}
              <div className={styles.card}>
                <div className={styles.cardHead}><div><h3 className={styles.cardTitle}>Paramètres du club</h3><p className={styles.cardSubtitle}>Configuration des inscriptions et cotisations</p></div></div>
                <div className={styles.cardBody}>
                  <div className={styles.settingRow}>
                    <div className={styles.settingInfo}>
                      <span className={styles.settingLabel}>Validation des inscriptions</span>
                      <span className={styles.settingDesc}>Approuver manuellement les nouvelles inscriptions</span>
                    </div>
                    <label className={styles.toggle}>
                      <input type="checkbox" checked={form.settings.requireRegistrationValidation} onChange={(e) => updateSetting("requireRegistrationValidation", e.target.checked)} />
                      <span className={styles.toggleTrack} /><span className={styles.toggleThumb} />
                    </label>
                  </div>
                  <div className={styles.formGrid}>
                    <div className={styles.field}>
                      <label className={styles.fieldLabel}>Capacité par formation</label>
                      <input className={styles.input} type="number" min={0} value={form.settings.defaultTrainingCapacity || ""} onChange={(e) => updateSetting("defaultTrainingCapacity", e.target.value ? Number(e.target.value) : null)} placeholder="Illimité" />
                    </div>
                    <div className={styles.field}>
                      <label className={styles.fieldLabel}>Cotisation (TND)</label>
                      <input className={styles.input} type="number" min={0} value={form.settings.membershipFee || ""} onChange={(e) => updateSetting("membershipFee", Number(e.target.value))} placeholder="0" />
                    </div>
                    <div className={styles.field}>
                      <label className={styles.fieldLabel}>Durée cotisation (mois)</label>
                      <input className={styles.input} type="number" min={1} value={form.settings.membershipPeriodMonths || ""} onChange={(e) => updateSetting("membershipPeriodMonths", Number(e.target.value))} placeholder="12" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className={styles.rightCol}>
              <div className={styles.card}>
                <div className={styles.cardHead}><h3 className={styles.cardTitle}>Statistiques</h3></div>
                <div className={styles.cardBody}>
                  <div className={styles.statsList}>
                    <div className={styles.statsItem}>
                      <span className={styles.statsLabel}>Statut</span>
                      <span className={`${styles.profileStatus} ${clubData.isActive ? styles["profileStatus--active"] : styles["profileStatus--inactive"]}`} style={{ margin: 0 }}>
                        <span className={styles.statusDot} /> {clubData.isActive ? "Actif" : "Inactif"}
                      </span>
                    </div>
                    <div className={styles.statsItem}><span className={styles.statsLabel}>Membres</span><span className={styles.statsValue}>—</span></div>
                    <div className={styles.statsItem}><span className={styles.statsLabel}>Formations</span><span className={styles.statsValue}>—</span></div>
                    <div className={styles.statsItem}><span className={styles.statsLabel}>Cotisation</span><span className={styles.statsValue}>{form.settings.membershipFee.toLocaleString("fr-FR")} TND</span></div>
                    <div className={styles.statsItem}><span className={styles.statsLabel}>Créé le</span><span className={styles.statsValue}>{new Date(clubData.createdAt).toLocaleDateString("fr-FR")}</span></div>
                  </div>
                </div>
              </div>

              <div className={styles.card}>
                <div className={styles.cardHead}><div><h3 className={styles.cardTitle}>Aperçu public</h3><p className={styles.cardSubtitle}>Comment votre club apparaît</p></div></div>
                <div className={styles.cardBody}>
                  <div className={styles.previewWrap}>
                    <div className={styles.previewCover}>{form.coverImage && <img src={form.coverImage} alt="" className={styles.previewCoverImg} />}</div>
                    <div className={styles.previewBody}>
                      <div className={styles.previewLogo}>
                        {form.logo ? <img src={form.logo} alt="" className={styles.previewLogoImg} /> : <span className={styles.previewLogoPlaceholder}>{clubName[0]}</span>}
                      </div>
                      <div className={styles.previewName}>{clubName}</div>
                      <p className={styles.previewDesc}>{form.description || "Aucune description pour le moment"}</p>
                      <div className={styles.previewMeta}>
                        {form.contactEmail && <span className={styles.previewMetaItem}>{I.mail} Email</span>}
                        {form.contactPhone && <span className={styles.previewMetaItem}>{I.phone} Tél</span>}
                        {form.socialLinks.website && <span className={styles.previewMetaItem}>{I.globe} Web</span>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ═══════════════ QR CODE TAB ═══════════════ */}
      {activeTab === "qr" && (
        <div className={styles.qrGrid}>
          <div className={styles.card}>
            <div className={styles.cardHead}><h3 className={styles.cardTitle}>Aperçu du QR Code</h3></div>
            <div className={styles.cardBody}>
              <div className={styles.qrPreviewWrap}>
                <div className={styles.qrPreviewBg} ref={qrRef}>
                  <QRCodeLazy value={qrContent || clubName} size={180} bgColor="#ffffff" fgColor={qrColor} level="H" includeMargin={true} />
                </div>
                <div className={styles.qrActions}>
                  <button className={`${styles.btn} ${styles["btn--primary"]}`} onClick={handleDownloadQR}>{I.download} Télécharger PNG</button>
                  <button className={`${styles.btn} ${styles["btn--secondary"]}`} onClick={handleCopyQR}>{copied ? I.check : I.copy} {copied ? "Copié !" : "Copier le texte"}</button>
                </div>
              </div>
              <div className={styles.qrContentPreview}>
                <h4 className={styles.qrContentTitle}>Contenu encodé</h4>
                <pre className={styles.qrContentText}>{qrContent || "Sélectionnez des champs ci-contre"}</pre>
              </div>
            </div>
          </div>

          <div className={styles.qrConfigCol}>
            <div className={styles.card}>
              <div className={styles.cardHead}><div><h3 className={styles.cardTitle}>Champs inclus</h3><p className={styles.cardSubtitle}>Sélectionnez les informations à encoder</p></div></div>
              <div className={styles.cardBody}>
                {qrFields.map((field) => (
                  <label key={field.key} className={styles.qrFieldRow}>
                    <div className={styles.qrFieldInfo}><span className={styles.qrFieldLabel}>{field.label}</span></div>
                    <label className={styles.toggle}>
                      <input type="checkbox" checked={field.checked} onChange={() => toggleQRField(field.key)} />
                      <span className={styles.toggleTrack} /><span className={styles.toggleThumb} />
                    </label>
                  </label>
                ))}
              </div>
            </div>

            <div className={styles.card}>
              <div className={styles.cardHead}><div><h3 className={styles.cardTitle}>Couleur du QR Code</h3></div></div>
              <div className={styles.cardBody}>
                <div className={styles.qrColorOptions}>
                  {[
                    { value: "#059669", label: "Vert" },
                    { value: "#111827", label: "Noir" },
                    { value: "#2563EB", label: "Bleu" },
                    { value: "#7C3AED", label: "Violet" },
                    { value: "#DC2626", label: "Rouge" },
                    { value: "#EA580C", label: "Orange" },
                  ].map((c) => (
                    <button key={c.value} className={`${styles.qrColorBtn} ${qrColor === c.value ? styles["qrColorBtn--active"] : ""}`} style={{ background: c.value }} onClick={() => setQrColor(c.value)} title={c.label} />
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.card}>
              <div className={styles.cardHead}><h3 className={styles.cardTitle}>Lien de partage</h3></div>
              <div className={styles.cardBody}>
                <div className={styles.shareLinkWrap}>
                  <input className={styles.shareLinkInput} type="text" value={`${window.location.origin}/club/${clubData.slug}`} readOnly />
                  <button className={styles.shareLinkBtn} onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/club/${clubData.slug}`); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>
                    {copied ? I.check : I.share}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Export with Error Boundary ────────────────────────────────────── */

export function ClubProfile() {
  return (
    <ProfileErrorBoundary>
      <ClubProfileInner />
    </ProfileErrorBoundary>
  );
}
