import { useState, useCallback, useRef } from "react";
import { useAuth } from "../../features/auth";
import { clubsService } from "../clubs/clubsService";
import {
  clubLeaderService,
  type FormRecord,
  type FormQuestion,
  type FormQuestionType,
  type FormResponseRecord,
  type FormStats,
  type AddQuestionInput,
} from "./clubLeaderService";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import styles from "./LeaderFormsPage.module.css";

/* ─── Icons ───────────────────────────────────────────────────────────── */

const I = {
  search: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>,
  plus: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>,
  fileText: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>,
  check: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>,
  x: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
  close: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
  edit: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>,
  trash: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>,
  eye: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>,
  send: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>,
  users: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></svg>,
  clipboard: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" ry="1" /></svg>,
  clock: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
  alert: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>,
  arrowLeft: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>,
  arrowRight: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>,
  grip: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="5" r="1" /><circle cx="9" cy="12" r="1" /><circle cx="9" cy="19" r="1" /><circle cx="15" cy="5" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="15" cy="19" r="1" /></svg>,
  text: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 7 4 4 20 4 20 7" /><line x1="9" y1="20" x2="15" y2="20" /><line x1="12" y2="4" x2="12" y2="20" /></svg>,
  alignLeft: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="17" y1="10" x2="3" y2="10" /><line x1="21" y1="6" x2="3" y2="6" /><line x1="21" y1="14" x2="3" y2="14" /><line x1="17" y1="18" x2="3" y2="18" /></svg>,
  hash: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="9" x2="20" y2="9" /><line x1="4" y1="15" x2="20" y2="15" /><line x1="10" y1="3" x2="8" y2="21" /><line x1="16" y1="3" x2="14" y2="21" /></svg>,
  mail: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>,
  calendar: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>,
  list: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>,
  checkCircle: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>,
  share: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></svg>,
};

const QUESTION_TYPES: { type: FormQuestionType; label: string; icon: React.ReactNode }[] = [
  { type: "short_text", label: "Texte court", icon: I.text },
  { type: "long_text", label: "Texte long", icon: I.alignLeft },
  { type: "email", label: "Email", icon: I.mail },
  { type: "number", label: "Nombre", icon: I.hash },
  { type: "single_choice", label: "Choix unique", icon: I.checkCircle },
  { type: "multiple_choice", label: "Choix multiples", icon: I.list },
  { type: "dropdown", label: "Menu déroulant", icon: I.list },
  { type: "date", label: "Date", icon: I.calendar },
];

const AVATAR_COLORS = ["green", "blue", "purple"] as const;

function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(firstName?: string, lastName?: string) {
  return `${(firstName || "")[0] || ""}${(lastName || "")[0] || ""}`.toUpperCase() || "?";
}

function needsOptions(type: FormQuestionType) {
  return ["single_choice", "multiple_choice", "dropdown"].includes(type);
}

function getTypeLabel(type: FormQuestionType) {
  return QUESTION_TYPES.find((t) => t.type === type)?.label || type;
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */

export default function LeaderFormsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // ── List state ─────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");
  const [page, setPage] = useState(1);

  // ── Create modal ───────────────────────────────────────────────────────
  const [showCreate, setShowCreate] = useState(false);
  const [createTitle, setCreateTitle] = useState("");
  const [createDesc, setCreateDesc] = useState("");

  // ── Editor state ───────────────────────────────────────────────────────
  const [editingFormId, setEditingFormId] = useState<string | null>(null);
  const [showTypePicker, setShowTypePicker] = useState(false);

  // ── Delete confirm ─────────────────────────────────────────────────────
  const [deletingForm, setDeletingForm] = useState<FormRecord | null>(null);

  // ── Responses modal ────────────────────────────────────────────────────
  const [viewingResponses, setViewingResponses] = useState<FormRecord | null>(null);
  const [responsePage, setResponsePage] = useState(1);

  // ── Toast ──────────────────────────────────────────────────────────────
  const [toast, setToast] = useState<{ msg: string; error?: boolean } | null>(null);
  const showToast = (msg: string, error = false) => {
    setToast({ msg, error });
    setTimeout(() => setToast(null), 3000);
  };

  const limit = 12;

  /* ── Fetch club ──────────────────────────────────────────────────────── */

  const { data: clubData } = useQuery({
    queryKey: ["leader", "my-club"],
    queryFn: async () => (await clubsService.getMyClub()).data,
    enabled: !!user,
  });

  const clubId = clubData?._id;

  /* ── Fetch forms ─────────────────────────────────────────────────────── */

  const isPublishedFilter = filter === "published" ? true : filter === "draft" ? false : undefined;

  const { data: formsData, isLoading } = useQuery({
    queryKey: ["leader", "forms", clubId, page, filter, search],
    queryFn: async () => {
      if (!clubId) return null;
      const params: Record<string, any> = { page, limit };
      if (isPublishedFilter !== undefined) params.isPublished = isPublishedFilter;
      if (search.trim()) params.search = search.trim();
      return (await clubLeaderService.listForms(clubId, params)).data;
    },
    enabled: !!clubId,
  });

  /* ── Fetch editing form details ──────────────────────────────────────── */

  const { data: editingFormData } = useQuery({
    queryKey: ["leader", "form-detail", clubId, editingFormId],
    queryFn: async () => {
      if (!clubId || !editingFormId) return null;
      return (await clubLeaderService.getForm(clubId, editingFormId)).data;
    },
    enabled: !!clubId && !!editingFormId,
  });

  /* ── Fetch responses ─────────────────────────────────────────────────── */

  const { data: responsesData } = useQuery({
    queryKey: ["leader", "form-responses", clubId, viewingResponses?._id, responsePage],
    queryFn: async () => {
      if (!clubId || !viewingResponses) return null;
      return (await clubLeaderService.getFormResponses(clubId, viewingResponses._id, { page: responsePage, limit: 10 })).data;
    },
    enabled: !!clubId && !!viewingResponses,
  });

  const { data: responseStats } = useQuery({
    queryKey: ["leader", "form-response-stats", clubId, viewingResponses?._id],
    queryFn: async () => {
      if (!clubId || !viewingResponses) return null;
      return (await clubLeaderService.getFormStats(clubId, viewingResponses._id)).data;
    },
    enabled: !!clubId && !!viewingResponses,
  });

  /* ── Mutations ───────────────────────────────────────────────────────── */

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!clubId || !createTitle.trim()) throw new Error("Missing");
      return clubLeaderService.createForm(clubId, {
        title: createTitle.trim(),
        description: createDesc.trim(),
      });
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["leader", "forms"] });
      setShowCreate(false);
      setCreateTitle("");
      setCreateDesc("");
      showToast("Formulaire créé avec succès");
      if (res?.data?._id) setEditingFormId(res.data._id);
    },
    onError: () => showToast("Erreur lors de la création", true),
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!clubId || !deletingForm) throw new Error("Missing");
      return clubLeaderService.deleteForm(clubId, deletingForm._id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leader", "forms"] });
      setDeletingForm(null);
      showToast("Formulaire supprimé");
    },
    onError: () => showToast("Impossible de supprimer ce formulaire", true),
  });

  const publishMutation = useMutation({
    mutationFn: async ({ formId, publish }: { formId: string; publish: boolean }) => {
      if (!clubId) throw new Error("Missing");
      return publish
        ? clubLeaderService.publishForm(clubId, formId)
        : clubLeaderService.unpublishForm(clubId, formId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leader", "forms"] });
      queryClient.invalidateQueries({ queryKey: ["leader", "form-detail"] });
      showToast("Statut mis à jour");
    },
    onError: () => showToast("Erreur lors de la publication", true),
  });

  const addQuestionMutation = useMutation({
    mutationFn: async (data: AddQuestionInput) => {
      if (!clubId || !editingFormId) throw new Error("Missing");
      return clubLeaderService.addQuestion(clubId, editingFormId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leader", "form-detail"] });
      queryClient.invalidateQueries({ queryKey: ["leader", "forms"] });
      setShowTypePicker(false);
      showToast("Question ajoutée");
    },
    onError: () => showToast("Erreur lors de l'ajout", true),
  });

  const deleteQuestionMutation = useMutation({
    mutationFn: async (questionId: string) => {
      if (!clubId || !editingFormId) throw new Error("Missing");
      return clubLeaderService.deleteQuestion(clubId, editingFormId, questionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leader", "form-detail"] });
      queryClient.invalidateQueries({ queryKey: ["leader", "forms"] });
      showToast("Question supprimée");
    },
    onError: () => showToast("Erreur lors de la suppression", true),
  });

  const updateFormMutation = useMutation({
    mutationFn: async (data: { title?: string; description?: string }) => {
      if (!clubId || !editingFormId) throw new Error("Missing");
      return clubLeaderService.updateForm(clubId, editingFormId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leader", "form-detail"] });
      queryClient.invalidateQueries({ queryKey: ["leader", "forms"] });
    },
  });

  /* ── Derived ─────────────────────────────────────────────────────────── */

  const forms = formsData?.data ?? [];
  const meta = formsData?.meta;
  const totalPages = meta?.totalPages ?? 1;
  const editingForm = editingFormData ?? null;
  const responses = responsesData?.data ?? [];
  const respMeta = responsesData?.meta;

  const totalForms = meta?.total ?? 0;
  const publishedCount = forms.filter((f) => f.isPublished).length;
  const draftCount = totalForms - publishedCount;
  const totalQuestions = forms.reduce((sum, f) => sum + (f.questions?.length ?? 0), 0);

  /* ── Loading ─────────────────────────────────────────────────────────── */

  if (isLoading && !formsData) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingWrap}>
          <div className={styles.spinner} />
          <p className={styles.loadingText}>Chargement des formulaires...</p>
        </div>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════════════════════
     EDITOR VIEW
     ═══════════════════════════════════════════════════════════════════════ */

  if (editingFormId && editingForm) {
    return (
      <EditorView
        form={editingForm}
        clubId={clubId!}
        onBack={() => { setEditingFormId(null); queryClient.invalidateQueries({ queryKey: ["leader", "forms"] }); }}
        onPublish={(publish) => publishMutation.mutate({ formId: editingFormId, publish })}
        onAddQuestion={(data) => addQuestionMutation.mutate(data)}
        onDeleteQuestion={(qId) => deleteQuestionMutation.mutate(qId)}
        onUpdateForm={(data) => updateFormMutation.mutate(data)}
        showTypePicker={showTypePicker}
        setShowTypePicker={setShowTypePicker}
        isPending={publishMutation.isPending || addQuestionMutation.isPending || deleteQuestionMutation.isPending}
      />
    );
  }

  /* ═══════════════════════════════════════════════════════════════════════
     LIST VIEW
     ═══════════════════════════════════════════════════════════════════════ */

  return (
    <div className={styles.page}>
      {toast && (
        <div className={`${styles.toast} ${toast.error ? styles["toast--error"] : ""}`}>
          {toast.error ? I.alert : I.check} {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.greeting}>Formulaires & Inscriptions</h1>
          <p className={styles.subtitle}>Créez et gérez les formulaires d'inscription de {clubData?.name || "votre club"}</p>
        </div>
        <button className={`${styles.btn} ${styles["btn--primary"]}`} onClick={() => setShowCreate(true)}>
          {I.plus} Nouveau formulaire
        </button>
      </div>

      {/* Stats */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles["statIcon--total"]}`}>{I.clipboard}</div>
          <div className={styles.statInfo}>
            <div className={styles.statValue}>{totalForms}</div>
            <div className={styles.statLabel}>Total formulaires</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles["statIcon--published"]}`}>{I.send}</div>
          <div className={styles.statInfo}>
            <div className={styles.statValue}>{publishedCount}</div>
            <div className={styles.statLabel}>Publiés</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles["statIcon--draft"]}`}>{I.edit}</div>
          <div className={styles.statInfo}>
            <div className={styles.statValue}>{draftCount}</div>
            <div className={styles.statLabel}>Brouillons</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles["statIcon--responses"]}`}>{I.list}</div>
          <div className={styles.statInfo}>
            <div className={styles.statValue}>{totalQuestions}</div>
            <div className={styles.statLabel}>Questions au total</div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <div className={styles.searchWrap}>
            <span className={styles.searchIcon}>{I.search}</span>
            <input
              className={styles.searchInput}
              type="text"
              placeholder="Rechercher un formulaire..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <div className={styles.filterTabs}>
            {[
              { key: "all" as const, label: "Tous", count: totalForms },
              { key: "published" as const, label: "Publiés", count: publishedCount },
              { key: "draft" as const, label: "Brouillons", count: draftCount },
            ].map((f) => (
              <button
                key={f.key}
                className={`${styles.filterTab} ${filter === f.key ? styles["filterTab--active"] : ""}`}
                onClick={() => { setFilter(f.key); setPage(1); }}
              >
                {f.label}
                <span className={styles.filterBadge}>{f.count}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Forms Grid */}
      {forms.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>{I.clipboard}</div>
          <div className={styles.emptyTitle}>Aucun formulaire trouvé</div>
          <div className={styles.emptyDesc}>
            {search || filter !== "all"
              ? "Aucun formulaire ne correspond à votre recherche"
              : "Créez votre premier formulaire pour commencer à collecter des inscriptions"}
          </div>
          {!search && filter === "all" && (
            <button className={`${styles.btn} ${styles["btn--primary"]}`} onClick={() => setShowCreate(true)}>
              {I.plus} Créer un formulaire
            </button>
          )}
        </div>
      ) : (
        <>
          <div className={styles.formsGrid}>
            {forms.map((form) => {
              const logoUrl = form.club?.logo || null;
              return (
              <div key={form._id} className={styles.formCard}>
                {logoUrl ? (
                  <div className={styles.formCardBanner}>
                    <img src={logoUrl} alt={form.club?.name || ""} className={styles.formCardBannerImg} />
                  </div>
                ) : (
                  <div className={styles.formCardBannerFallback}>
                    <span style={{ fontSize: 22, fontWeight: 700, color: "#fff", opacity: 0.8 }}>
                      {(form.club?.name || "?")[0]}
                    </span>
                  </div>
                )}
                <div className={styles.formCardHead}>
                  <div className={styles.formCardTitleGroup}>
                    <div className={styles.formCardTitle}>{form.title}</div>
                    {form.description && <div className={styles.formCardDesc}>{form.description}</div>}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                    <label className={styles.publishToggle}>
                      <input
                        type="checkbox"
                        checked={form.isPublished}
                        onChange={() => {
                          if (form.questions.length === 0 && !form.isPublished) {
                            showToast("Ajoutez au moins une question avant de publier", true);
                            return;
                          }
                          publishMutation.mutate({ formId: form._id, publish: !form.isPublished });
                        }}
                      />
                      <span className={styles.toggleTrack} />
                    </label>
                  </div>
                </div>

                <div className={styles.formCardMeta}>
                  <span className={`${styles.statusBadge} ${form.isPublished ? styles["statusBadge--published"] : styles["statusBadge--draft"]}`}>
                    <span className={styles.statusDot} />
                    {form.isPublished ? "Publié" : "Brouillon"}
                  </span>
                  <span className={styles.formMetaItem}>
                    {I.list} {form.questions.length} question{form.questions.length !== 1 ? "s" : ""}
                  </span>
                  <span className={styles.formMetaItem}>
                    {I.clock} v{form.version}
                  </span>
                </div>

                <div className={styles.formCardActions}>
                  <button className={styles.actionBtn} onClick={() => setEditingFormId(form._id)}>
                    {I.edit} Éditer
                  </button>
                  <button className={styles.actionBtn} onClick={() => { setViewingResponses(form); setResponsePage(1); }}>
                    {I.eye} Réponses
                  </button>
                  <button
                    className={`${styles.actionBtn} ${styles["actionBtn--danger"]}`}
                    onClick={() => setDeletingForm(form)}
                  >
                    {I.trash}
                  </button>
                </div>
              </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className={styles.pagination}>
              <div className={styles.paginationInfo}>
                Page {page} sur {totalPages}
              </div>
              <div className={styles.paginationBtns}>
                <button className={styles.pageBtn} disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  {I.arrowLeft}
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) pageNum = i + 1;
                  else if (page <= 3) pageNum = i + 1;
                  else if (page >= totalPages - 2) pageNum = totalPages - 4 + i;
                  else pageNum = page - 2 + i;
                  return (
                    <button
                      key={pageNum}
                      className={`${styles.pageBtn} ${pageNum === page ? styles["pageBtn--active"] : ""}`}
                      onClick={() => setPage(pageNum)}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button className={styles.pageBtn} disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                  {I.arrowRight}
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Create Modal ──────────────────────────────────────────────── */}
      {showCreate && (
        <div className={styles.modalOverlay} onClick={() => setShowCreate(false)}>
          <div className={`${styles.modal} ${styles["modal--sm"]}`} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHead}>
              <div className={styles.modalTitle}>Nouveau formulaire</div>
              <button className={styles.modalClose} onClick={() => setShowCreate(false)}>{I.close}</button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Titre <span className={styles.fieldRequired}>*</span></label>
                <input
                  className={styles.input}
                  value={createTitle}
                  onChange={(e) => setCreateTitle(e.target.value)}
                  placeholder="Ex: Inscription 2026-2027"
                  autoFocus
                />
              </div>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Description</label>
                <textarea
                  className={styles.textarea}
                  value={createDesc}
                  onChange={(e) => setCreateDesc(e.target.value)}
                  placeholder="Description optionnelle du formulaire..."
                  rows={3}
                />
              </div>
            </div>
            <div className={styles.modalFoot}>
              <button className={`${styles.btn} ${styles["btn--secondary"]}`} onClick={() => setShowCreate(false)}>
                Annuler
              </button>
              <button
                className={`${styles.btn} ${styles["btn--primary"]}`}
                disabled={!createTitle.trim() || createMutation.isPending}
                onClick={() => createMutation.mutate()}
              >
                {createMutation.isPending ? "Création..." : "Créer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ──────────────────────────────────────── */}
      {deletingForm && (
        <div className={styles.modalOverlay} onClick={() => setDeletingForm(null)}>
          <div className={`${styles.modal} ${styles["modal--sm"]}`} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHead}>
              <div className={styles.modalTitle}>Supprimer le formulaire</div>
              <button className={styles.modalClose} onClick={() => setDeletingForm(null)}>{I.close}</button>
            </div>
            <div className={styles.modalBody}>
              <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.6 }}>
                Êtes-vous sûr de vouloir supprimer <strong>« {deletingForm.title} »</strong> ?
                {deletingForm.isPublished && (
                  <span style={{ display: "block", marginTop: 8, color: "#DC2626", fontSize: 13 }}>
                    Ce formulaire est publié. La suppression est irréversible.
                  </span>
                )}
              </p>
            </div>
            <div className={styles.modalFoot}>
              <button className={`${styles.btn} ${styles["btn--secondary"]}`} onClick={() => setDeletingForm(null)}>
                Annuler
              </button>
              <button
                className={`${styles.btn} ${styles["btn--danger"]}`}
                disabled={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate()}
              >
                {deleteMutation.isPending ? "Suppression..." : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Responses Modal ───────────────────────────────────────────── */}
      {viewingResponses && (
        <div className={styles.modalOverlay} onClick={() => setViewingResponses(null)}>
          <div className={`${styles.modal} ${styles["modal--lg"]}`} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHead}>
              <div>
                <div className={styles.modalTitle}>Réponses — {viewingResponses.title}</div>
                <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2 }}>Version {viewingResponses.version}</div>
              </div>
              <button className={styles.modalClose} onClick={() => setViewingResponses(null)}>{I.close}</button>
            </div>
            <div className={styles.modalBody}>
              {responseStats && (
                <div className={styles.responseStatsRow}>
                  <div className={styles.responseStat}>
                    <div className={styles.responseStatValue}>{responseStats.totalResponses}</div>
                    <div className={styles.responseStatLabel}>Total réponses</div>
                  </div>
                  <div className={styles.responseStat}>
                    <div className={styles.responseStatValue}>{responseStats.currentVersionResponses}</div>
                    <div className={styles.responseStatLabel}>Version actuelle</div>
                  </div>
                  <div className={styles.responseStat}>
                    <div className={styles.responseStatValue}>{responseStats.previousVersionResponses}</div>
                    <div className={styles.responseStatLabel}>Versions précédentes</div>
                  </div>
                </div>
              )}

              {responses.length === 0 ? (
                <div className={styles.emptyState} style={{ padding: "40px 0" }}>
                  <div className={styles.emptyIcon}>{I.users}</div>
                  <div className={styles.emptyTitle}>Aucune réponse</div>
                  <div className={styles.emptyDesc}>Partagez le formulaire pour commencer à recevoir des réponses</div>
                </div>
              ) : (
                <div className={styles.responseList}>
                  {responses.map((r) => {
                    const name = `${r.user?.firstName || ""} ${r.user?.lastName || ""}`.trim() || "—";
                    const color = getAvatarColor(name);
                    return (
                      <div key={r._id} className={styles.responseItem}>
                        <div className={styles.responseUser}>
                          <div className={`${styles.responseAvatar} ${styles[`responseAvatar--${color}`]}`}>
                            {getInitials(r.user?.firstName, r.user?.lastName)}
                          </div>
                          <div className={styles.responseUserInfo}>
                            <div className={styles.responseUserName}>{name}</div>
                            <div className={styles.responseUserEmail}>{r.user?.email}</div>
                          </div>
                        </div>
                        <div className={styles.responseDate}>
                          {new Date(r.submittedAt || r.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {respMeta && respMeta.totalPages > 1 && (
                <div className={styles.pagination}>
                  <div className={styles.paginationInfo}>Page {responsePage} sur {respMeta.totalPages}</div>
                  <div className={styles.paginationBtns}>
                    <button className={styles.pageBtn} disabled={responsePage <= 1} onClick={() => setResponsePage((p) => p - 1)}>
                      {I.arrowLeft}
                    </button>
                    <button className={styles.pageBtn} disabled={responsePage >= respMeta.totalPages} onClick={() => setResponsePage((p) => p + 1)}>
                      {I.arrowRight}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   EDITOR VIEW
   ═══════════════════════════════════════════════════════════════════════════ */

function EditorView({
  form,
  clubId,
  onBack,
  onPublish,
  onAddQuestion,
  onDeleteQuestion,
  onUpdateForm,
  showTypePicker,
  setShowTypePicker,
  isPending,
}: {
  form: FormRecord;
  clubId: string;
  onBack: () => void;
  onPublish: (publish: boolean) => void;
  onAddQuestion: (data: AddQuestionInput) => void;
  onDeleteQuestion: (questionId: string) => void;
  onUpdateForm: (data: { title?: string; description?: string }) => void;
  showTypePicker: boolean;
  setShowTypePicker: (v: boolean) => void;
  isPending: boolean;
}) {
  const [title, setTitle] = useState(form.title);
  const [description, setDescription] = useState(form.description || "");
  const [editingTitle, setEditingTitle] = useState(false);

  const handleTitleSave = () => {
    if (title.trim() && title.trim() !== form.title) {
      onUpdateForm({ title: title.trim() });
    }
    setEditingTitle(false);
  };

  const handleAddQuestion = (type: FormQuestionType) => {
    const labels: Record<FormQuestionType, string> = {
      short_text: "Question texte court",
      long_text: "Question texte long",
      email: "Adresse email",
      number: "Nombre",
      single_choice: "Choix unique",
      multiple_choice: "Choix multiples",
      dropdown: "Menu déroulant",
      date: "Date",
    };
    const q: AddQuestionInput = {
      type,
      label: labels[type],
      required: false,
    };
    if (needsOptions(type)) {
      q.options = [
        { label: "Option 1", value: "option_1" },
        { label: "Option 2", value: "option_2" },
      ];
    }
    onAddQuestion(q);
  };

  const questions = form.questions || [];

  return (
    <div className={styles.page}>
      {/* Editor Header */}
      <div className={styles.header}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            className={`${styles.btn} ${styles["btn--ghost"]}`}
            onClick={onBack}
            style={{ padding: "8px 12px" }}
          >
            {I.arrowLeft} Retour
          </button>
          <div>
            {editingTitle ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  className={styles.input}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={handleTitleSave}
                  onKeyDown={(e) => e.key === "Enter" && handleTitleSave()}
                  autoFocus
                  style={{ fontSize: 22, fontWeight: 700, height: 40, maxWidth: 400 }}
                />
              </div>
            ) : (
              <h1
                className={styles.greeting}
                style={{ cursor: "pointer" }}
                onClick={() => setEditingTitle(true)}
                title="Cliquer pour modifier"
              >
                {form.title}
              </h1>
            )}
            <p className={styles.subtitle}>
              {questions.length} question{questions.length !== 1 ? "s" : ""} • Version {form.version}
              {form.isPublished && <span style={{ color: "#059669", marginLeft: 8 }}>● Publié</span>}
            </p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {form.isPublished ? (
            <button
              className={`${styles.btn} ${styles["btn--danger"]}`}
              disabled={isPending}
              onClick={() => onPublish(false)}
            >
              Dépublier
            </button>
          ) : (
            <button
              className={`${styles.btn} ${styles["btn--primary"]}`}
              disabled={isPending || questions.length === 0}
              onClick={() => onPublish(true)}
            >
              {I.send} Publier
            </button>
          )}
        </div>
      </div>

      {/* Description */}
      <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 14, padding: 20 }}>
        <label className={styles.fieldLabel} style={{ marginBottom: 8, display: "block" }}>Description</label>
        <textarea
          className={styles.textarea}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onBlur={() => {
            if (description !== (form.description || "")) {
              onUpdateForm({ description });
            }
          }}
          placeholder="Description du formulaire..."
          rows={2}
        />
      </div>

      {/* Questions */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>Questions</h2>
          {!form.isPublished && (
            <button
              className={`${styles.btn} ${styles["btn--primary"]} ${styles["btn--sm"]}`}
              onClick={() => setShowTypePicker(true)}
            >
              {I.plus} Ajouter
            </button>
          )}
        </div>

        {showTypePicker && !form.isPublished && (
          <div className={styles.questionTypePicker} style={{ marginBottom: 14 }}>
            {QUESTION_TYPES.map((qt) => (
              <button
                key={qt.type}
                className={styles.typeOption}
                onClick={() => handleAddQuestion(qt.type)}
              >
                <div className={styles.typeOptionIcon}>{qt.icon}</div>
                {qt.label}
              </button>
            ))}
          </div>
        )}

        {questions.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>{I.clipboard}</div>
            <div className={styles.emptyTitle}>Aucune question</div>
            <div className={styles.emptyDesc}>
              {form.isPublished
                ? "Dépubliez le formulaire pour ajouter des questions"
                : "Ajoutez des questions pour créer votre formulaire"}
            </div>
          </div>
        ) : (
          <div className={styles.questionList}>
            {questions
              .slice()
              .sort((a, b) => a.order - b.order)
              .map((q, idx) => (
                <QuestionCard
                  key={q._id}
                  question={q}
                  index={idx + 1}
                  canDelete={!form.isPublished}
                  onDelete={() => onDeleteQuestion(q._id)}
                  clubId={clubId}
                  formId={form._id}
                />
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   QUESTION CARD
   ═══════════════════════════════════════════════════════════════════════════ */

function QuestionCard({
  question,
  index,
  canDelete,
  onDelete,
  clubId,
  formId,
}: {
  question: FormQuestion;
  index: number;
  canDelete: boolean;
  onDelete: () => void;
  clubId: string;
  formId: string;
}) {
  const queryClient = useQueryClient();
  const [editingLabel, setEditingLabel] = useState(false);
  const [labelValue, setLabelValue] = useState(question.label);
  const [options, setOptions] = useState(question.options || []);

  const patchQuestion = async (patch: Record<string, any>) => {
    try {
      await clubLeaderService.updateQuestion(clubId, formId, question._id, patch);
      await queryClient.invalidateQueries({ queryKey: ["leader", "form-detail"] });
    } catch {
      await queryClient.invalidateQueries({ queryKey: ["leader", "form-detail"] });
    }
  };

  const saveLabel = () => {
    setEditingLabel(false);
    if (labelValue.trim() && labelValue.trim() !== question.label) {
      patchQuestion({ label: labelValue.trim() });
    } else {
      setLabelValue(question.label);
    }
  };

  const toggleRequired = () => {
    patchQuestion({ required: !question.required });
  };

  const saveOption = async (idx: number, newLabel: string) => {
    const updated = options.map((o, i) => (i === idx ? { ...o, label: newLabel, value: newLabel.toLowerCase().replace(/\s+/g, "_") } : o));
    setOptions(updated);
    await patchQuestion({ options: updated });
  };

  const addOption = async () => {
    const updated = [...options, { label: `Option ${options.length + 1}`, value: `option_${options.length + 1}` }];
    setOptions(updated);
    await patchQuestion({ options: updated });
  };

  const removeOption = async (idx: number) => {
    if (options.length <= 2) return;
    const updated = options.filter((_, i) => i !== idx);
    setOptions(updated);
    await patchQuestion({ options: updated });
  };

  return (
    <div className={styles.questionItem}>
      <div className={styles.questionHead}>
        <div className={styles.questionDragHandle}>{I.grip}</div>
        <div className={styles.questionNumber}>{index}</div>

        {editingLabel ? (
          <input
            className={styles.input}
            value={labelValue}
            onChange={(e) => setLabelValue(e.target.value)}
            onBlur={saveLabel}
            onKeyDown={(e) => { if (e.key === "Enter") saveLabel(); if (e.key === "Escape") { setLabelValue(question.label); setEditingLabel(false); } }}
            autoFocus
            style={{ flex: 1, height: 32, fontSize: 14, fontWeight: 600, padding: "0 10px" }}
          />
        ) : (
          <div
            className={styles.questionLabel}
            style={{ cursor: "pointer" }}
            onClick={() => canDelete && setEditingLabel(true)}
            title={canDelete ? "Cliquer pour modifier" : ""}
          >
            {question.label || "Question sans titre"}
          </div>
        )}

        <span className={styles.questionType}>{getTypeLabel(question.type)}</span>

        {canDelete && (
          <label className={styles.checkboxWrap} style={{ flexShrink: 0 }} title="Requis">
            <input
              type="checkbox"
              className={styles.checkbox}
              checked={question.required}
              onChange={toggleRequired}
            />
            <span className={styles.checkboxLabel}>Requis</span>
          </label>
        )}

        {!canDelete && question.required && (
          <span className={styles.questionRequired}>Requis</span>
        )}

        {canDelete && (
          <button className={styles.questionDelete} onClick={onDelete} title="Supprimer">
            {I.trash}
          </button>
        )}
      </div>

      {question.description && (
        <div style={{ paddingLeft: 62, fontSize: 12, color: "#9CA3AF" }}>
          {question.description}
        </div>
      )}

      {needsOptions(question.type) && (
        <div className={styles.questionOptions}>
          {(canDelete ? options : question.options || []).map((opt, i) => (
            <div key={i} className={styles.optionRow}>
              <span style={{ fontSize: 13, color: "#9CA3AF", width: 20, textAlign: "center" }}>
                {question.type === "multiple_choice" ? "☐" : "○"}
              </span>
              {canDelete ? (
                <input
                  className={styles.optionInput}
                  value={opt.label}
                  onChange={(e) => {
                    const updated = options.map((o, j) => j === i ? { ...o, label: e.target.value, value: e.target.value.toLowerCase().replace(/\s+/g, "_") } : o);
                    setOptions(updated);
                  }}
                  onBlur={() => saveOption(i, opt.label)}
                  onKeyDown={(e) => { if (e.key === "Enter") saveOption(i, opt.label); }}
                />
              ) : (
                <div className={styles.optionInput} style={{ cursor: "default" }}>{opt.label}</div>
              )}
              {canDelete && options.length > 2 && (
                <button className={styles.optionRemove} onClick={() => removeOption(i)} title="Supprimer l'option">
                  {I.x}
                </button>
              )}
            </div>
          ))}
          {canDelete && (
            <button className={styles.addOptionBtn} onClick={addOption}>
              {I.plus} Ajouter une option
            </button>
          )}
        </div>
      )}

      {!needsOptions(question.type) && (
        <div style={{ paddingLeft: 62 }}>
          <div className={styles.previewQInput}>
            {question.type === "date" ? "JJ/MM/AAAA" : question.type === "number" ? "0" : "Réponse..."}
          </div>
        </div>
      )}
    </div>
  );
}
