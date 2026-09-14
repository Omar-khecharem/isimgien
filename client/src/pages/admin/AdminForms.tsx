import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { clubsService, type Club } from "../../features/clubs/clubsService";
import { clubLeaderService, type FormRecord, type FormStats } from "../../features/clubLeader/clubLeaderService";
import styles from "./AdminForms.module.css";

const AVATAR_COLORS = ["#059669", "#3B82F6", "#7C3AED", "#D97706", "#DC2626", "#0891B2"];

function getClubColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "à l'instant";
  if (mins < 60) return `il y a ${mins}min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `il y a ${days}j`;
  return formatDate(dateStr);
}

const QUESTION_TYPE_ICONS: Record<string, string> = {
  short_text: "T",
  long_text: "¶",
  email: "@",
  number: "#",
  single_choice: "◉",
  multiple_choice: "☑",
  dropdown: "▾",
  date: "📅",
};

const QUESTION_TYPE_LABELS: Record<string, string> = {
  short_text: "Texte court",
  long_text: "Texte long",
  email: "Email",
  number: "Nombre",
  single_choice: "Choix unique",
  multiple_choice: "Choix multiples",
  dropdown: "Menu déroulant",
  date: "Date",
};

export function AdminForms() {
  const queryClient = useQueryClient();
  const [selectedClubId, setSelectedClubId] = useState<string>("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");
  const [page, setPage] = useState(1);

  // Create modal
  const [showCreate, setShowCreate] = useState(false);
  const [createTitle, setCreateTitle] = useState("");
  const [createDesc, setCreateDesc] = useState("");

  // Delete confirm
  const [deletingForm, setDeletingForm] = useState<FormRecord | null>(null);

  // Responses modal
  const [viewingResponses, setViewingResponses] = useState<FormRecord | null>(null);
  const [responsePage, setResponsePage] = useState(1);

  const limit = 12;

  // ── Fetch all clubs for selector ──────────────────────────────────────
  const { data: clubsData } = useQuery({
    queryKey: ["admin", "all-clubs"],
    queryFn: async () => clubsService.list({ limit: 100 }),
  });

  const allClubs: Club[] = clubsData?.data || [];
  const selectedClub = allClubs.find((c) => c._id === selectedClubId);

  // ── Fetch forms for selected club ─────────────────────────────────────
  const isPublishedFilter = statusFilter === "published" ? true : statusFilter === "draft" ? false : undefined;

  const { data: formsData, isLoading: formsLoading } = useQuery({
    queryKey: ["admin", "forms", selectedClubId, page, statusFilter, search],
    queryFn: async () => {
      const params: Record<string, any> = { page, limit };
      if (isPublishedFilter !== undefined) params.isPublished = isPublishedFilter;
      if (search.trim()) params.search = search.trim();
      return clubLeaderService.listForms(selectedClubId, params) as any;
    },
    enabled: !!selectedClubId,
  });

  const allForms: FormRecord[] = formsData?.data || [];
  const meta = formsData?.meta;

  // ── Fetch stats for each form ─────────────────────────────────────────
  const { data: statsData } = useQuery({
    queryKey: ["admin", "form-stats", selectedClubId],
    queryFn: async () => {
      if (!selectedClubId || allForms.length === 0) return [];
      const statsPromises = allForms.map(async (form) => {
        try {
          const res = await clubLeaderService.getFormStats(selectedClubId, form._id);
          return res.data;
        } catch {
          return null;
        }
      });
      return Promise.all(statsPromises);
    },
    enabled: !!selectedClubId && allForms.length > 0,
  });

  // ── Fetch responses for viewing modal ─────────────────────────────────
  const { data: responsesData, isLoading: responsesLoading } = useQuery({
    queryKey: ["admin", "form-responses", selectedClubId, viewingResponses?._id, responsePage],
    queryFn: async () => {
      if (!selectedClubId || !viewingResponses) return null;
      return clubLeaderService.getFormResponses(selectedClubId, viewingResponses._id, { page: responsePage, limit: 10 });
    },
    enabled: !!selectedClubId && !!viewingResponses,
  });

  // ── Mutations ─────────────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: (data: { title: string; description?: string }) =>
      clubLeaderService.createForm(selectedClubId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "forms", selectedClubId] });
      setShowCreate(false);
      setCreateTitle("");
      setCreateDesc("");
    },
  });

  const publishMutation = useMutation({
    mutationFn: (formId: string) => clubLeaderService.publishForm(selectedClubId, formId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "forms", selectedClubId] });
    },
  });

  const unpublishMutation = useMutation({
    mutationFn: (formId: string) => clubLeaderService.unpublishForm(selectedClubId, formId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "forms", selectedClubId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (formId: string) => clubLeaderService.deleteForm(selectedClubId, formId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "forms", selectedClubId] });
      setDeletingForm(null);
    },
  });

  // ── Stats ─────────────────────────────────────────────────────────────
  const publishedCount = allForms.filter((f) => f.isPublished).length;
  const draftCount = allForms.filter((f) => !f.isPublished).length;
  const totalQuestions = allForms.reduce((sum, f) => sum + f.questions.length, 0);
  const totalResponses = (statsData || []).reduce((sum, s) => sum + (s?.totalResponses || 0), 0);

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Formulaires & Inscriptions</h1>
          <p className={styles.subtitle}>Gérez les formulaires de tous les clubs</p>
        </div>
      </div>

      {/* Club Selector */}
      <div className={styles.clubSelector}>
        <div className={styles.clubSelectorLabel}>
          <svg width="18" height="18" viewBox="0 0 22 22" fill="none">
            <path d="M3 10.5C3 6.5 6 3.5 11 3.5s8 3 8 7c0 2-1 4-3 5l-1 2H5l-1-2c-1.5-1.2-2.5-3-1-4.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            <circle cx="7.5" cy="12" r="1" fill="currentColor" />
            <circle cx="11" cy="12" r="1" fill="currentColor" />
            <circle cx="14.5" cy="12" r="1" fill="currentColor" />
          </svg>
          <span>Sélectionner un club</span>
        </div>
        <select
          className={styles.clubSelect}
          value={selectedClubId}
          onChange={(e) => {
            setSelectedClubId(e.target.value);
            setPage(1);
            setSearch("");
            setStatusFilter("all");
          }}
        >
          <option value="">Choisir un club...</option>
          {allClubs.map((club) => (
            <option key={club._id} value={club._id}>
              {club.name}
            </option>
          ))}
        </select>
      </div>

      {/* Content (only when club selected) */}
      {selectedClubId ? (
        <>
          {/* Stat Cards */}
          <div className={styles.statCards}>
            <div className={`${styles.statCard} ${styles["statCard--total"]}`}>
              <div className={styles.statCardBg} />
              <div className={styles.statCardInner}>
                <div className={styles.statCardIcon}>
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                    <path d="M14 2H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                    <path d="M14 2v6h6M8 13h6M8 17h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className={styles.statCardContent}>
                  <span className={styles.statCardValue}>{meta?.total || 0}</span>
                  <span className={styles.statCardLabel}>Total formulaires</span>
                </div>
              </div>
            </div>

            <div className={`${styles.statCard} ${styles["statCard--active"]}`}>
              <div className={styles.statCardBg} />
              <div className={styles.statCardInner}>
                <div className={styles.statCardIcon}>
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                    <circle cx="11" cy="11" r="8.5" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M8 11l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className={styles.statCardContent}>
                  <span className={styles.statCardValue}>{publishedCount}</span>
                  <span className={styles.statCardLabel}>Publiés</span>
                </div>
              </div>
            </div>

            <div className={`${styles.statCard} ${styles["statCard--draft"]}`}>
              <div className={styles.statCardBg} />
              <div className={styles.statCardInner}>
                <div className={styles.statCardIcon}>
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                    <path d="M14 3H5a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V8l-5-5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                    <path d="M14 3v5h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className={styles.statCardContent}>
                  <span className={styles.statCardValue}>{draftCount}</span>
                  <span className={styles.statCardLabel}>Brouillons</span>
                </div>
              </div>
            </div>

            <div className={`${styles.statCard} ${styles["statCard--responses"]}`}>
              <div className={styles.statCardBg} />
              <div className={styles.statCardInner}>
                <div className={styles.statCardIcon}>
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M23 21v-2a4 4 0 00-3-3.87" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
                <div className={styles.statCardContent}>
                  <span className={styles.statCardValue}>{totalResponses}</span>
                  <span className={styles.statCardLabel}>Réponses</span>
                </div>
              </div>
            </div>
          </div>

          {/* Toolbar */}
          <div className={styles.toolbar}>
            <div className={styles.searchWrap}>
              <svg className={styles.searchIcon} width="18" height="18" viewBox="0 0 20 20" fill="none">
                <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.5" />
                <path d="M13.5 13.5L17 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <input
                className={styles.searchInput}
                placeholder="Rechercher un formulaire..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
              {search && (
                <button className={styles.searchClear} onClick={() => setSearch("")}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              )}
            </div>
            <div className={styles.filterTabs}>
              <button
                className={`${styles.filterTab} ${statusFilter === "all" ? styles["filterTab--active"] : ""}`}
                onClick={() => { setStatusFilter("all"); setPage(1); }}
              >
                Tous
              </button>
              <button
                className={`${styles.filterTab} ${statusFilter === "published" ? styles["filterTab--active"] : ""}`}
                onClick={() => { setStatusFilter("published"); setPage(1); }}
              >
                Publiés
              </button>
              <button
                className={`${styles.filterTab} ${statusFilter === "draft" ? styles["filterTab--active"] : ""}`}
                onClick={() => { setStatusFilter("draft"); setPage(1); }}
              >
                Brouillons
              </button>
            </div>
            <button className={styles.createBtn} onClick={() => setShowCreate(true)}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              Nouveau formulaire
            </button>
          </div>

          {/* Forms Section */}
          <div className={styles.formsSection}>
            {formsLoading ? (
              <div className={styles.loading}>
                <div className={styles.spinner} />
                <span>Chargement des formulaires...</span>
              </div>
            ) : allForms.length === 0 ? (
              <div className={styles.empty}>
                <div className={styles.emptyIcon}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                    <path d="M14 2v6h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
                <p className={styles.emptyTitle}>Aucun formulaire trouvé</p>
                <p className={styles.emptyDesc}>
                  {search ? "Essayez avec d'autres termes de recherche" : "Créez votre premier formulaire pour ce club"}
                </p>
              </div>
            ) : (
              <>
                <div className={styles.formsGrid}>
                  {allForms.map((form) => {
                    const stats = (statsData || []).find((s) => s?.formId === form._id);
                    return (
                      <div key={form._id} className={styles.formCard}>
                        {/* Status indicator */}
                        <div className={styles.formCardTop}>
                          <span className={`${styles.statusBadge} ${form.isPublished ? styles["statusBadge--published"] : styles["statusBadge--draft"]}`}>
                            <span className={styles.statusDot} />
                            {form.isPublished ? "Publié" : "Brouillon"}
                          </span>
                          {form.version > 0 && (
                            <span className={styles.versionBadge}>v{form.version}</span>
                          )}
                        </div>

                        <h3 className={styles.formTitle}>{form.title}</h3>
                        {form.description && (
                          <p className={styles.formDesc}>{form.description}</p>
                        )}

                        {/* Questions preview */}
                        <div className={styles.questionsPreview}>
                          {form.questions.slice(0, 3).map((q) => (
                            <div key={q._id} className={styles.questionChip}>
                              <span className={styles.questionIcon}>{QUESTION_TYPE_ICONS[q.type] || "?"}</span>
                              <span className={styles.questionLabel}>{q.label || "Sans titre"}</span>
                            </div>
                          ))}
                          {form.questions.length > 3 && (
                            <span className={styles.moreQuestions}>+{form.questions.length - 3} autres</span>
                          )}
                        </div>

                        {/* Meta */}
                        <div className={styles.formMeta}>
                          <div className={styles.metaItem}>
                            <svg width="13" height="13" viewBox="0 0 22 22" fill="none">
                              <circle cx="11" cy="11" r="8.5" stroke="currentColor" strokeWidth="1.5" />
                              <path d="M11 6v5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <span>{timeAgo(form.createdAt)}</span>
                          </div>
                          <div className={styles.metaItem}>
                            <svg width="13" height="13" viewBox="0 0 22 22" fill="none">
                              <path d="M4 7h14M4 12h10M4 17h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                            <span>{form.questions.length} question{form.questions.length !== 1 ? "s" : ""}</span>
                          </div>
                          {stats && (
                            <div className={styles.metaItem}>
                              <svg width="13" height="13" viewBox="0 0 22 22" fill="none">
                                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.5" />
                              </svg>
                              <span>{stats.totalResponses} réponse{stats.totalResponses !== 1 ? "s" : ""}</span>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className={styles.formActions}>
                          {form.isPublished ? (
                            <button
                              className={`${styles.actionBtn} ${styles["actionBtn--unpublish"]}`}
                              onClick={() => unpublishMutation.mutate(form._id)}
                              disabled={unpublishMutation.isPending}
                              title="Dépublier"
                            >
                              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.3" />
                                <path d="M4 7h6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                              </svg>
                              Dépublier
                            </button>
                          ) : (
                            <button
                              className={`${styles.actionBtn} ${styles["actionBtn--publish"]}`}
                              onClick={() => publishMutation.mutate(form._id)}
                              disabled={publishMutation.isPending || form.questions.length === 0}
                              title="Publier"
                            >
                              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.3" />
                                <path d="M5 7l1.5 1.5L9 5.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                              Publier
                            </button>
                          )}
                          <button
                            className={`${styles.actionBtn} ${styles["actionBtn--responses"]}`}
                            onClick={() => { setViewingResponses(form); setResponsePage(1); }}
                            title="Voir les réponses"
                          >
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                              <path d="M1 7s2.5-4 6-4 6 4 6 4-2.5 4-6 4-6-4-6-4z" stroke="currentColor" strokeWidth="1.3" />
                              <circle cx="7" cy="7" r="2" stroke="currentColor" strokeWidth="1.3" />
                            </svg>
                          </button>
                          <button
                            className={`${styles.actionBtn} ${styles["actionBtn--delete"]}`}
                            onClick={() => setDeletingForm(form)}
                            title="Supprimer"
                          >
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                              <path d="M2 4h10M5 4V3a1 1 0 011-1h2a1 1 0 011 1v1M6 6.5v3M8 6.5v3M3 4l.7 8a1 1 0 001 .9h4.6a1 1 0 001-.9L11 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination */}
                {meta && meta.totalPages > 1 && (
                  <div className={styles.pagination}>
                    <span className={styles.paginationInfo}>
                      Page {page} sur {meta.totalPages} · {meta.total} formulaires
                    </span>
                    <div className={styles.paginationBtns}>
                      <button
                        className={styles.pageBtn}
                        disabled={page <= 1}
                        onClick={() => setPage((p) => p - 1)}
                      >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <path d="M9 3L5 7l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                      {Array.from({ length: Math.min(meta.totalPages, 5) }, (_, i) => {
                        const pageNum = i + 1;
                        return (
                          <button
                            key={pageNum}
                            className={`${styles.pageNum} ${page === pageNum ? styles["pageNum--active"] : ""}`}
                            onClick={() => setPage(pageNum)}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      <button
                        className={styles.pageBtn}
                        disabled={page >= meta.totalPages}
                        onClick={() => setPage((p) => p + 1)}
                      >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      ) : (
        /* Empty state when no club selected */
        <div className={styles.noClub}>
          <div className={styles.noClubIcon}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <path d="M3 10.5C3 6.5 6 3.5 11 3.5s8 3 8 7c0 2-1 4-3 5l-1 2H5l-1-2c-1.5-1.2-2.5-3-1-4.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
              <circle cx="7.5" cy="12" r="1" fill="currentColor" />
              <circle cx="11" cy="12" r="1" fill="currentColor" />
              <circle cx="14.5" cy="12" r="1" fill="currentColor" />
            </svg>
          </div>
          <p className={styles.noClubTitle}>Sélectionnez un club</p>
          <p className={styles.noClubDesc}>
            Choisissez un club pour gérer ses formulaires et inscriptions
          </p>
        </div>
      )}

      {/* ─── Create Modal ─── */}
      {showCreate && (
        <div className={styles.modalOverlay} onClick={() => setShowCreate(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Nouveau formulaire</h2>
              <button className={styles.modalClose} onClick={() => setShowCreate(false)}>
                <svg width="18" height="18" viewBox="0 0 14 14" fill="none">
                  <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Titre</label>
                <input
                  className={styles.formInput}
                  placeholder="Ex: Inscription 2026"
                  value={createTitle}
                  onChange={(e) => setCreateTitle(e.target.value)}
                  autoFocus
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Description (optionnel)</label>
                <textarea
                  className={styles.formTextarea}
                  placeholder="Décrivez le but de ce formulaire..."
                  value={createDesc}
                  onChange={(e) => setCreateDesc(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.modalCancel} onClick={() => setShowCreate(false)}>
                Annuler
              </button>
              <button
                className={styles.modalConfirm}
                disabled={!createTitle.trim() || createMutation.isPending}
                onClick={() => createMutation.mutate({ title: createTitle.trim(), description: createDesc.trim() })}
              >
                {createMutation.isPending ? "Création..." : "Créer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Delete Confirm Modal ─── */}
      {deletingForm && (
        <div className={styles.modalOverlay} onClick={() => setDeletingForm(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Supprimer le formulaire</h2>
              <button className={styles.modalClose} onClick={() => setDeletingForm(null)}>
                <svg width="18" height="18" viewBox="0 0 14 14" fill="none">
                  <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <div className={styles.modalBody}>
              <p className={styles.deleteWarning}>
                Êtes-vous sûr de vouloir supprimer le formulaire <strong>« {deletingForm.title} »</strong> ?
                Cette action est irréversible.
              </p>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.modalCancel} onClick={() => setDeletingForm(null)}>
                Annuler
              </button>
              <button
                className={styles.modalDanger}
                disabled={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate(deletingForm._id)}
              >
                {deleteMutation.isPending ? "Suppression..." : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Responses Modal ─── */}
      {viewingResponses && (
        <div className={styles.modalOverlay} onClick={() => setViewingResponses(null)}>
          <div className={`${styles.modal} ${styles.modalWide}`} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <h2 className={styles.modalTitle}>Réponses — {viewingResponses.title}</h2>
                <p className={styles.modalSubtitle}>Version {viewingResponses.version || 1}</p>
              </div>
              <button className={styles.modalClose} onClick={() => setViewingResponses(null)}>
                <svg width="18" height="18" viewBox="0 0 14 14" fill="none">
                  <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <div className={styles.modalBody}>
              {responsesLoading ? (
                <div className={styles.loading}>
                  <div className={styles.spinner} />
                  <span>Chargement des réponses...</span>
                </div>
              ) : !responsesData?.data?.length ? (
                <div className={styles.empty}>
                  <div className={styles.emptyIcon}>
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  </div>
                  <p className={styles.emptyTitle}>Aucune réponse</p>
                  <p className={styles.emptyDesc}>Personne n'a encore rempli ce formulaire</p>
                </div>
              ) : (
                <div className={styles.responseList}>
                  {responsesData.data.map((resp) => {
                    const userName = resp.user ? `${resp.user.firstName} ${resp.user.lastName}` : "Inconnu";
                    const userColor = getClubColor(userName);
                    return (
                      <div key={resp._id} className={styles.responseItem}>
                        <div className={styles.responseAvatar} style={{ background: `${userColor}12`, color: userColor }}>
                          {resp.user?.firstName?.charAt(0) || "?"}
                        </div>
                        <div className={styles.responseInfo}>
                          <span className={styles.responseName}>{userName}</span>
                          <span className={styles.responseEmail}>{resp.user?.email}</span>
                        </div>
                        <span className={styles.responseDate}>{timeAgo(resp.submittedAt)}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            {responsesData && responsesData.meta && responsesData.meta.totalPages > 1 && (
              <div className={styles.pagination}>
                <span className={styles.paginationInfo}>
                  Page {responsePage} sur {responsesData.meta.totalPages}
                </span>
                <div className={styles.paginationBtns}>
                  <button
                    className={styles.pageBtn}
                    disabled={responsePage <= 1}
                    onClick={() => setResponsePage((p) => p - 1)}
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M9 3L5 7l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <button
                    className={styles.pageBtn}
                    disabled={responsePage >= responsesData.meta.totalPages}
                    onClick={() => setResponsePage((p) => p + 1)}
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
