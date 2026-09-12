import { useState, useRef } from "react";
import { useAuth } from "../../features/auth";
import { clubsService } from "../clubs/clubsService";
import { trainingsService, type Training, type TrainingStatus } from "../trainings/trainingsService";
import { clubLeaderService, type FormRecord } from "./clubLeaderService";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../services/apiClient";
import styles from "./LeaderFormationsPage.module.css";

/* ─── Icons ───────────────────────────────────────────────────────────── */

const I = {
  search: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>,
  plus: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>,
  check: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>,
  close: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
  alert: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>,
  calendar: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>,
  clock: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
  mapPin: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>,
  users: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>,
  trash: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>,
  edit: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>,
  play: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3" /></svg>,
  eye: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>,
  arrowLeft: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>,
  arrowRight: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>,
  bookmark: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" /></svg>,
  trendingUp: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>,
  checkCircle: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>,
  zap: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>,
  empty: <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" /></svg>,
};

const STATUS_LABELS: Record<string, string> = {
  draft: "Brouillon",
  published: "Publiée",
  registration_open: "Inscriptions ouvertes",
  registration_closed: "Inscriptions fermées",
  in_progress: "En cours",
  completed: "Terminée",
  cancelled: "Annulée",
};

const STATUS_FILTER_OPTIONS = [
  { value: "all", label: "Toutes" },
  { value: "upcoming", label: "À venir" },
  { value: "in_progress", label: "En cours" },
  { value: "completed", label: "Terminées" },
  { value: "draft", label: "Brouillons" },
] as const;

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

function formatTime(time: string) {
  return time;
}

function isUpcoming(dateStr: string) {
  return new Date(dateStr) >= new Date();
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */

export default function LeaderFormationsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "upcoming" | "in_progress" | "completed" | "draft">("all");
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [editingTraining, setEditingTraining] = useState<Training | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form state
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formDate, setFormDate] = useState(new Date().toISOString().split("T")[0]);
  const [formStart, setFormStart] = useState("09:00");
  const [formEnd, setFormEnd] = useState("11:00");
  const [formLocation, setFormLocation] = useState("");
  const [formCapacity, setFormCapacity] = useState("");
  const [formRequiresValidation, setFormRequiresValidation] = useState(false);
  const [formLinkedFormId, setFormLinkedFormId] = useState<string>("");
  const [formPoster, setFormPoster] = useState("");
  const posterInputRef = useRef<HTMLInputElement>(null);
  const [uploadingPoster, setUploadingPoster] = useState(false);

  const [toast, setToast] = useState<{ msg: string; error?: boolean } | null>(null);
  const showToast = (msg: string, error = false) => {
    setToast({ msg, error });
    setTimeout(() => setToast(null), 3000);
  };

  const limit = 12;

  /* ── Poster upload ─────────────────────────────────────────────────── */

  const handlePosterUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !clubId) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast("L'image ne doit pas dépasser 5 Mo", true);
      return;
    }
    setUploadingPoster(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await apiClient.upload<{ success: boolean; data: { url: string } }>(
        "/clubs/upload",
        formData
      );
      setFormPoster(res.data.url);
    } catch {
      showToast("Erreur lors de l'upload de l'image", true);
    } finally {
      setUploadingPoster(false);
      if (posterInputRef.current) posterInputRef.current.value = "";
    }
  };

  /* ── Fetch club ──────────────────────────────────────────────────────── */

  const { data: clubData } = useQuery({
    queryKey: ["leader", "my-club"],
    queryFn: async () => (await clubsService.getMyClub()).data,
    enabled: !!user,
  });

  const clubId = clubData?._id;

  /* ── Fetch available forms for linking ───────────────────────────────── */

  const { data: availableForms } = useQuery({
    queryKey: ["leader", "forms-list", clubId],
    queryFn: async () => {
      if (!clubId) return [];
      const res = await clubLeaderService.listForms(clubId, { page: 1, limit: 100, isPublished: true });
      return (res as any).data ?? [];
    },
    enabled: !!clubId,
  });

  /* ── Fetch trainings ─────────────────────────────────────────────────── */

  const { data: txData, isLoading } = useQuery({
    queryKey: ["leader", "trainings", clubId, page, statusFilter, search],
    queryFn: async () => {
      if (!clubId) return null;
      const params: Record<string, any> = { page, limit, sort: "-date" };
      if (statusFilter === "upcoming") {
        // We'll filter client-side for upcoming
      } else if (statusFilter !== "all") {
        params.status = statusFilter;
      }
      if (search.trim()) params.search = search.trim();
      return (await trainingsService.listByClub(clubId, params)) as any;
    },
    enabled: !!clubId,
  });

  /* ── Create mutation ─────────────────────────────────────────────────── */

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!clubId) throw new Error("Club non trouvé");
      if (!formTitle.trim()) throw new Error("Le titre est requis");
      if (!formLocation.trim()) throw new Error("Le lieu est requis");
      return trainingsService.create(clubId, {
        title: formTitle.trim(),
        description: formDesc.trim(),
        poster: formPoster.trim() || null,
        date: formDate,
        startTime: formStart,
        endTime: formEnd,
        location: formLocation.trim(),
        capacity: formCapacity ? Number(formCapacity) : null,
        requiresValidation: formRequiresValidation,
        linkedFormId: formLinkedFormId || null,
      } as any);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leader", "trainings"] });
      setShowCreate(false);
      resetForm();
      showToast("Formation créée avec succès");
    },
    onError: (error: any) => {
      const msg = error?.error?.message || error?.message || "Erreur lors de la création";
      showToast(msg, true);
    },
  });

  /* ── Update mutation ─────────────────────────────────────────────────── */

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!clubId || !editingTraining) throw new Error("Club non trouvé");
      if (!formTitle.trim()) throw new Error("Le titre est requis");
      if (!formLocation.trim()) throw new Error("Le lieu est requis");
      return trainingsService.update(clubId, editingTraining._id, {
        title: formTitle.trim(),
        description: formDesc.trim(),
        poster: formPoster.trim() || null,
        date: formDate,
        startTime: formStart,
        endTime: formEnd,
        location: formLocation.trim(),
        capacity: formCapacity ? Number(formCapacity) : null,
        requiresValidation: formRequiresValidation,
        linkedFormId: formLinkedFormId || null,
      } as any);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leader", "trainings"] });
      setEditingTraining(null);
      resetForm();
      showToast("Formation mise à jour");
    },
    onError: (error: any) => {
      const msg = error?.error?.message || error?.message || "Erreur lors de la mise à jour";
      showToast(msg, true);
    },
  });

  /* ── Delete mutation ─────────────────────────────────────────────────── */

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!clubId) throw new Error("Club non trouvé");
      return trainingsService.delete(clubId, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leader", "trainings"] });
      setDeletingId(null);
      showToast("Formation supprimée");
    },
    onError: (error: any) => {
      const msg = error?.error?.message || error?.message || "Erreur lors de la suppression";
      showToast(msg, true);
    },
  });

  /* ── Status transition ───────────────────────────────────────────────── */

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: TrainingStatus }) => {
      if (!clubId) throw new Error("Club non trouvé");
      return trainingsService.transitionStatus(clubId, id, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leader", "trainings"] });
      showToast("Statut mis à jour");
    },
    onError: (error: any) => {
      const msg = error?.error?.message || error?.message || "Erreur";
      showToast(msg, true);
    },
  });

  /* ── Helpers ─────────────────────────────────────────────────────────── */

  const resetForm = () => {
    setFormTitle("");
    setFormDesc("");
    setFormDate(new Date().toISOString().split("T")[0]);
    setFormStart("09:00");
    setFormEnd("11:00");
    setFormLocation("");
    setFormCapacity("");
    setFormRequiresValidation(false);
    setFormLinkedFormId("");
    setFormPoster("");
  };

  const openEdit = (t: Training) => {
    setEditingTraining(t);
    setFormTitle(t.title);
    setFormDesc(t.description || "");
    setFormDate(t.date.split("T")[0]);
    setFormStart(t.startTime);
    setFormEnd(t.endTime);
    setFormLocation(t.location);
    setFormCapacity(t.capacity?.toString() || "");
    setFormRequiresValidation(t.requiresValidation);
    setFormLinkedFormId(t.linkedForm || "");
    setFormPoster(t.poster || "");
  };

  /* ── Derived ─────────────────────────────────────────────────────────── */

  const allTrainings = txData?.data ?? [];
  const meta = txData?.meta;
  const totalPages = meta?.totalPages ?? 1;

  // Filter for "upcoming" client-side
  const trainings = statusFilter === "upcoming"
    ? allTrainings.filter((t) => isUpcoming(t.date) && t.status !== "cancelled" && t.status !== "completed")
    : allTrainings;

  // Stats (from all data, not paginated)
  const totalCount = meta?.total ?? 0;
  const inProgressCount = allTrainings.filter((t) => t.status === "in_progress").length;
  const completedCount = allTrainings.filter((t) => t.status === "completed").length;
  const upcomingCount = allTrainings.filter((t) => isUpcoming(t.date) && t.status !== "cancelled" && t.status !== "completed").length;

  if (isLoading && !txData) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingWrap}>
          <div className={styles.spinner} />
          <p className={styles.loadingText}>Chargement des formations...</p>
        </div>
      </div>
    );
  }

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
          <h1 className={styles.greeting}>Formations</h1>
          <p className={styles.subtitle}>Gérez les formations de {clubData?.name || "votre club"}</p>
        </div>
        <button className={`${styles.btn} ${styles["btn--primary"]}`} onClick={() => { resetForm(); setShowCreate(true); }}>
          {I.plus} Nouvelle formation
        </button>
      </div>

      {/* Stats */}
      <div className={styles.statsGrid}>
        <div className={`${styles.statCard} ${styles["statCard--total"]}`}>
          <div className={`${styles.statIcon} ${styles["statIcon--total"]}`}>{I.bookmark}</div>
          <div className={styles.statInfo}>
            <div className={styles.statValue}>{totalCount}</div>
            <div className={styles.statLabel}>Total</div>
          </div>
        </div>
        <div className={`${styles.statCard} ${styles["statCard--progress"]}`}>
          <div className={`${styles.statIcon} ${styles["statIcon--progress"]}`}>{I.zap}</div>
          <div className={styles.statInfo}>
            <div className={styles.statValue}>{inProgressCount}</div>
            <div className={styles.statLabel}>En cours</div>
          </div>
        </div>
        <div className={`${styles.statCard} ${styles["statCard--done"]}`}>
          <div className={`${styles.statIcon} ${styles["statIcon--done"]}`}>{I.checkCircle}</div>
          <div className={styles.statInfo}>
            <div className={styles.statValue}>{completedCount}</div>
            <div className={styles.statLabel}>Terminées</div>
          </div>
        </div>
        <div className={`${styles.statCard} ${styles["statCard--upcoming"]}`}>
          <div className={`${styles.statIcon} ${styles["statIcon--upcoming"]}`}>{I.trendingUp}</div>
          <div className={styles.statInfo}>
            <div className={styles.statValue}>{upcomingCount}</div>
            <div className={styles.statLabel}>À venir</div>
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
              placeholder="Rechercher une formation..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <div className={styles.filterTabs}>
            {STATUS_FILTER_OPTIONS.map((f) => (
              <button
                key={f.value}
                className={`${styles.filterTab} ${statusFilter === f.value ? styles["filterTab--active"] : ""}`}
                onClick={() => { setStatusFilter(f.value); setPage(1); }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Formations Grid */}
      <div className={styles.tableCard}>
        <div className={styles.tableHead}>
          <div>
            <div className={styles.tableTitle}>Liste des formations</div>
            <div className={styles.tableSubtitle}>{meta?.total ?? 0} formation{(meta?.total ?? 0) !== 1 ? "s" : ""}</div>
          </div>
        </div>

        {trainings.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>{I.empty}</div>
            <div className={styles.emptyTitle}>Aucune formation</div>
            <div className={styles.emptyDesc}>
              {search || statusFilter !== "all"
                ? "Aucune formation ne correspond à votre recherche"
                : "Créez votre première formation pour commencer"}
            </div>
            {!search && statusFilter === "all" && (
              <button className={`${styles.btn} ${styles["btn--primary"]}`} onClick={() => { resetForm(); setShowCreate(true); }}>
                {I.plus} Nouvelle formation
              </button>
            )}
          </div>
        ) : (
          <>
            <div className={styles.grid}>
              {trainings.map((t) => {
                const isPast = !isUpcoming(t.date);
                const capacityPercent = t.capacity ? Math.round((t.registeredCount / t.capacity) * 100) : null;
                return (
                  <div key={t._id} className={`${styles.formationCard} ${isPast ? styles["formationCard--past"] : ""}`}>
                    {t.poster && (
                      <div className={styles.formationCardPoster}>
                        <img src={t.poster} alt={t.title} />
                      </div>
                    )}
                    <div className={styles.formationCardHeader}>
                      <div className={styles.formationCardDate}>
                        <span className={styles.formationCardDay}>{new Date(t.date).getDate()}</span>
                        <span className={styles.formationCardMonth}>{new Date(t.date).toLocaleDateString("fr-FR", { month: "short" })}</span>
                      </div>
                      <span className={`${styles.statusBadge} ${styles[`statusBadge--${t.status}`]}`}>
                        {STATUS_LABELS[t.status] || t.status}
                      </span>
                    </div>

                    <h3 className={styles.formationCardTitle}>{t.title}</h3>

                    <div className={styles.formationCardMeta}>
                      <span className={styles.formationMetaItem}>
                        {I.calendar} {formatDate(t.date)}
                      </span>
                      <span className={styles.formationMetaItem}>
                        {I.clock} {formatTime(t.startTime)} — {formatTime(t.endTime)}
                      </span>
                      <span className={styles.formationMetaItem}>
                        {I.mapPin} {t.location}
                      </span>
                    </div>

                    {t.capacity && (
                      <div className={styles.capacityBar}>
                        <div className={styles.capacityInfo}>
                          <span>{I.users} {t.registeredCount}/{t.capacity}</span>
                          <span>{capacityPercent}%</span>
                        </div>
                        <div className={styles.capacityTrack}>
                          <div
                            className={`${styles.capacityFill} ${capacityPercent && capacityPercent >= 90 ? styles["capacityFill--full"] : ""}`}
                            style={{ width: `${Math.min(capacityPercent ?? 0, 100)}%` }}
                          />
                        </div>
                      </div>
                    )}

                    <div className={styles.formationCardActions}>
                      {t.status === "draft" && (
                        <button
                          className={`${styles.btn} ${styles["btn--sm"]} ${styles["btn--success"]}`}
                          onClick={() => statusMutation.mutate({ id: t._id, status: "registration_open" })}
                        >
                          {I.play} Publier
                        </button>
                      )}
                      {t.status === "registration_open" && (
                        <button
                          className={`${styles.btn} ${styles["btn--sm"]} ${styles["btn--warning"]}`}
                          onClick={() => statusMutation.mutate({ id: t._id, status: "registration_closed" })}
                        >
                          Fermer inscriptions
                        </button>
                      )}
                      {t.status === "registration_closed" && !isPast && (
                        <button
                          className={`${styles.btn} ${styles["btn--sm"]} ${styles["btn--primary"]}`}
                          onClick={() => statusMutation.mutate({ id: t._id, status: "in_progress" })}
                        >
                          {I.play} Lancer
                        </button>
                      )}
                      {t.status === "in_progress" && (
                        <button
                          className={`${styles.btn} ${styles["btn--sm"]} ${styles["btn--success"]}`}
                          onClick={() => statusMutation.mutate({ id: t._id, status: "completed" })}
                        >
                          {I.check} Terminer
                        </button>
                      )}
                      <div className={styles.formationCardActionsRight}>
                        <button className={`${styles.iconBtn}`} onClick={() => openEdit(t)} title="Modifier">
                          {I.edit}
                        </button>
                        <button className={`${styles.iconBtn} ${styles["iconBtn--danger"]}`} onClick={() => setDeletingId(t._id)} title="Supprimer">
                          {I.trash}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className={styles.pagination}>
                <div className={styles.paginationInfo}>Page {page} sur {totalPages}</div>
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
      </div>

      {/* ── Create / Edit Modal ──────────────────────────────────────────── */}
      {(showCreate || editingTraining) && (
        <div className={styles.modalOverlay} onClick={() => { setShowCreate(false); setEditingTraining(null); }}>
          <div className={`${styles.modal} ${styles["modal--md"]}`} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHead}>
              <div className={styles.modalTitle}>{editingTraining ? "Modifier la formation" : "Nouvelle formation"}</div>
              <button className={styles.modalClose} onClick={() => { setShowCreate(false); setEditingTraining(null); }}>{I.close}</button>
            </div>
            <div className={styles.modalBody}>
              {/* Title */}
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Titre <span className={styles.fieldRequired}>*</span></label>
                <input
                  className={styles.input}
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Ex: Atelier Python avancé"
                />
              </div>

              {/* Description */}
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Description</label>
                <textarea
                  className={styles.textarea}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Description de la formation..."
                  rows={3}
                />
              </div>

              {/* Date + Location */}
              <div className={styles.fieldRow}>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Date <span className={styles.fieldRequired}>*</span></label>
                  <input
                    className={styles.input}
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Lieu <span className={styles.fieldRequired}>*</span></label>
                  <input
                    className={styles.input}
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    placeholder="Salle A, Bâtiment B..."
                  />
                </div>
              </div>

              {/* Time */}
              <div className={styles.fieldRow}>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Heure début <span className={styles.fieldRequired}>*</span></label>
                  <input
                    className={styles.input}
                    type="time"
                    value={formStart}
                    onChange={(e) => setFormStart(e.target.value)}
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Heure fin <span className={styles.fieldRequired}>*</span></label>
                  <input
                    className={styles.input}
                    type="time"
                    value={formEnd}
                    onChange={(e) => setFormEnd(e.target.value)}
                  />
                </div>
              </div>

              {/* Capacity + Validation */}
              <div className={styles.fieldRow}>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Capacité</label>
                  <input
                    className={styles.input}
                    type="number"
                    min="1"
                    value={formCapacity}
                    onChange={(e) => setFormCapacity(e.target.value)}
                    placeholder="Illimité"
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Validation requise</label>
                  <div className={styles.toggleWrap}>
                    <button
                      type="button"
                      className={`${styles.toggle} ${formRequiresValidation ? styles["toggle--on"] : ""}`}
                      onClick={() => setFormRequiresValidation(!formRequiresValidation)}
                    >
                      <span className={styles.toggleKnob} />
                    </button>
                    <span className={styles.toggleLabel}>{formRequiresValidation ? "Oui" : "Non"}</span>
                  </div>
                </div>
              </div>

              {/* Poster */}
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Affiche de la formation</label>
                <input
                  ref={posterInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  style={{ display: "none" }}
                  onChange={handlePosterUpload}
                />
                {formPoster ? (
                  <div className={styles.posterPreview}>
                    <img src={formPoster} alt="Aperçu affiche" className={styles.posterPreviewImg} />
                    <div className={styles.posterPreviewActions}>
                      <button
                        type="button"
                        className={`${styles.btn} ${styles["btn--sm"]} ${styles["btn--secondary"]}`}
                        onClick={() => posterInputRef.current?.click()}
                        disabled={uploadingPoster}
                      >
                        Changer
                      </button>
                      <button
                        type="button"
                        className={`${styles.btn} ${styles["btn--sm"]} ${styles["btn--danger"]}`}
                        onClick={() => setFormPoster("")}
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    className={styles.posterUploadBtn}
                    onClick={() => posterInputRef.current?.click()}
                    disabled={uploadingPoster}
                  >
                    {uploadingPoster ? (
                      <>
                        <div className={styles.posterSpinner} />
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <polyline points="21 15 16 10 5 21" />
                        </svg>
                        Cliquer pour ajouter une affiche
                        <span className={styles.posterUploadHint}>JPEG, PNG ou WebP · Max 5 Mo</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Linked Form */}
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Formulaire d'inscription</label>
                <select
                  className={styles.select}
                  value={formLinkedFormId}
                  onChange={(e) => setFormLinkedFormId(e.target.value)}
                >
                  <option value="">Aucun formulaire lié</option>
                  {(availableForms ?? []).map((f: FormRecord) => (
                    <option key={f._id} value={f._id}>
                      {f.title} {f.isPublished ? "" : "(brouillon)"}
                    </option>
                  ))}
                </select>
                <span style={{ fontSize: 12, color: "#9CA3AF", marginTop: 4 }}>
                  Liez un formulaire pour collecter les inscriptions
                </span>
              </div>
            </div>
            <div className={styles.modalFoot}>
              <button className={`${styles.btn} ${styles["btn--secondary"]}`} onClick={() => { setShowCreate(false); setEditingTraining(null); }}>
                Annuler
              </button>
              <button
                className={`${styles.btn} ${styles["btn--primary"]}`}
                disabled={!formTitle.trim() || !formLocation.trim() || createMutation.isPending || updateMutation.isPending}
                onClick={() => editingTraining ? updateMutation.mutate() : createMutation.mutate()}
              >
                {editingTraining
                  ? (updateMutation.isPending ? "Enregistrement..." : "Enregistrer")
                  : (createMutation.isPending ? "Création..." : "Créer")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ────────────────────────────────────── */}
      {deletingId && (
        <div className={styles.modalOverlay} onClick={() => setDeletingId(null)}>
          <div className={`${styles.modal} ${styles["modal--sm"]}`} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHead}>
              <div className={styles.modalTitle}>Supprimer la formation</div>
              <button className={styles.modalClose} onClick={() => setDeletingId(null)}>{I.close}</button>
            </div>
            <div className={styles.modalBody}>
              <p className={styles.deleteText}>Êtes-vous sûr de vouloir supprimer cette formation ? Cette action est irréversible.</p>
            </div>
            <div className={styles.modalFoot}>
              <button className={`${styles.btn} ${styles["btn--secondary"]}`} onClick={() => setDeletingId(null)}>
                Annuler
              </button>
              <button
                className={`${styles.btn} ${styles["btn--danger"]}`}
                disabled={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate(deletingId)}
              >
                {deleteMutation.isPending ? "Suppression..." : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
