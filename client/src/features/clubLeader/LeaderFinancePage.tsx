import { useState } from "react";
import { useAuth } from "../../features/auth";
import { clubsService } from "../clubs/clubsService";
import { financeService, type Transaction, type FinanceSummary } from "../finance/financeService";
import { clubLeaderService } from "./clubLeaderService";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import styles from "./LeaderFinancePage.module.css";

/* ─── Icons ───────────────────────────────────────────────────────────── */

const I = {
  search: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>,
  plus: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>,
  check: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>,
  x: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
  close: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
  arrowUp: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" /></svg>,
  arrowDown: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><polyline points="19 12 12 19 5 12" /></svg>,
  wallet: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 010-4h14v4" /><path d="M3 5v14a2 2 0 002 2h16v-5" /><path d="M18 12a2 2 0 100 4 2 2 0 000-4z" /></svg>,
  trendingUp: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>,
  trendingDown: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6" /><polyline points="17 18 23 18 23 12" /></svg>,
  alert: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>,
  arrowLeft: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>,
  arrowRight: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>,
  receipt: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1z" /><path d="M14 8H8" /><path d="M16 12H8" /></svg>,
  calendar: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>,
  user: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
};

const CATEGORIES: Record<string, { label: string; type: "income" | "expense" }> = {
  membership_fee: { label: "Cotisation", type: "income" },
  event_revenue: { label: "Événement", type: "income" },
  training_fee: { label: "Formation", type: "income" },
  other_income: { label: "Autre revenu", type: "income" },
  equipment: { label: "Équipement", type: "expense" },
  supplies: { label: "Fournitures", type: "expense" },
  transport: { label: "Transport", type: "expense" },
  other_expense: { label: "Autre dépense", type: "expense" },
};

const CATEGORY_LABELS: Record<string, string> = {
  membership_fee: "Cotisation",
  event_revenue: "Événement",
  training_fee: "Formation",
  other_income: "Autre revenu",
  equipment: "Équipement",
  supplies: "Fournitures",
  transport: "Transport",
  other_expense: "Autre dépense",
};

const BREAKDOWN_COLORS: Record<string, string> = {
  membership_fee: "#059669",
  event_revenue: "#10B981",
  training_fee: "#34D399",
  other_income: "#6EE7B7",
  equipment: "#DC2626",
  supplies: "#F87171",
  transport: "#FCA5A5",
  other_expense: "#FECACA",
};

function formatTND(amount: number | undefined | null) {
  return (amount ?? 0).toLocaleString("fr-TN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */

export default function LeaderFinancePage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "income" | "expense">("all");
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);

  // Create form state
  const [txType, setTxType] = useState<"income" | "expense">("income");
  const [txCategory, setTxCategory] = useState("membership_fee");
  const [txAmount, setTxAmount] = useState("");
  const [txDescription, setTxDescription] = useState("");
  const [txDate, setTxDate] = useState(new Date().toISOString().split("T")[0]);
  const [txNotes, setTxNotes] = useState("");

  const [toast, setToast] = useState<{ msg: string; error?: boolean } | null>(null);
  const showToast = (msg: string, error = false) => {
    setToast({ msg, error });
    setTimeout(() => setToast(null), 3000);
  };

  const limit = 15;

  /* ── Fetch club ──────────────────────────────────────────────────────── */

  const { data: clubData } = useQuery({
    queryKey: ["leader", "my-club"],
    queryFn: async () => (await clubsService.getMyClub()).data,
    enabled: !!user,
  });

  const clubId = clubData?._id;

  /* ── Fetch balance ───────────────────────────────────────────────────── */

  const { data: balanceData } = useQuery({
    queryKey: ["leader", "finance-balance", clubId],
    queryFn: async () => {
      if (!clubId) return null;
      return (await financeService.getBalance(clubId)).data;
    },
    enabled: !!clubId,
  });

  /* ── Fetch summary ───────────────────────────────────────────────────── */

  const { data: summaryData } = useQuery({
    queryKey: ["leader", "finance-summary", clubId],
    queryFn: async () => {
      if (!clubId) return null;
      return (await financeService.getSummary(clubId)).data;
    },
    enabled: !!clubId,
  });

  /* ── Fetch membership stats for cotisations ──────────────────────────── */

  const { data: memberStats } = useQuery({
    queryKey: ["leader", "member-stats", clubId],
    queryFn: async () => {
      if (!clubId) return null;
      return (await clubLeaderService.getMembershipStats(clubId)).data;
    },
    enabled: !!clubId,
  });

  /* ── Fetch transactions ──────────────────────────────────────────────── */

  const { data: txData, isLoading: txLoading } = useQuery({
    queryKey: ["leader", "finance-tx", clubId, page, typeFilter, search],
    queryFn: async () => {
      if (!clubId) return null;
      const params: Record<string, any> = { page, limit, sort: "-date" };
      if (typeFilter !== "all") params.type = typeFilter;
      if (search.trim()) params.search = search.trim();
      return (await financeService.listTransactions(clubId, params)).data;
    },
    enabled: !!clubId,
  });

  /* ── Create mutation ─────────────────────────────────────────────────── */

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!clubId) throw new Error("Club non trouvé");
      if (!txDescription.trim()) throw new Error("La description est requise");
      if (!txAmount || Number(txAmount) <= 0) throw new Error("Le montant doit être supérieur à 0");
      return financeService.createTransaction(clubId, {
        type: txType,
        category: txCategory,
        amount: Number(txAmount),
        description: txDescription.trim(),
        date: txDate,
        notes: txNotes.trim() || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leader", "finance-balance"] });
      queryClient.invalidateQueries({ queryKey: ["leader", "finance-summary"] });
      queryClient.invalidateQueries({ queryKey: ["leader", "finance-tx"] });
      queryClient.invalidateQueries({ queryKey: ["leader", "member-stats"] });
      setShowCreate(false);
      resetForm();
      showToast("Transaction enregistrée");
    },
    onError: (error: any) => {
      let msg = "Erreur lors de l'enregistrement";
      if (error?.error?.details) {
        const details = error.error.details;
        const firstKey = Object.keys(details)[0];
        if (firstKey) msg = details[firstKey];
      } else if (error?.error?.message) {
        msg = error.error.message;
      } else if (error?.message) {
        msg = error.message;
      }
      showToast(msg, true);
    },
  });

  const resetForm = () => {
    setTxType("income");
    setTxCategory("membership_fee");
    setTxAmount("");
    setTxDescription("");
    setTxDate(new Date().toISOString().split("T")[0]);
    setTxNotes("");
  };

  /* ── Derived ─────────────────────────────────────────────────────────── */

  const balance = balanceData;
  const summary = summaryData as FinanceSummary | null;
  const transactions = txData?.data ?? [];
  const meta = txData?.meta;
  const totalPages = meta?.totalPages ?? 1;

  const incomeCategories = Object.entries(CATEGORIES).filter(([, c]) => c.type === "income");
  const expenseCategories = Object.entries(CATEGORIES).filter(([, c]) => c.type === "expense");
  const availableCategories = txType === "income" ? incomeCategories : expenseCategories;

  if (txLoading && !txData) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingWrap}>
          <div className={styles.spinner} />
          <p className={styles.loadingText}>Chargement de la caisse...</p>
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
          <h1 className={styles.greeting}>Caisse & Cotisations</h1>
          <p className={styles.subtitle}>Gérez les finances de {clubData?.name || "votre club"}</p>
        </div>
        <button className={`${styles.btn} ${styles["btn--primary"]}`} onClick={() => setShowCreate(true)}>
          {I.plus} Nouvelle transaction
        </button>
      </div>

      {/* Balance Cards */}
      <div className={styles.balanceGrid}>
        <div className={`${styles.balanceCard} ${styles["balanceCard--income"]}`}>
          <div className={`${styles.balanceIcon} ${styles["balanceIcon--income"]}`}>{I.arrowUp}</div>
          <div className={styles.balanceInfo}>
            <div className={styles.balanceLabel}>Revenus totaux</div>
            <div className={`${styles.balanceValue} ${styles["balanceValue--income"]}`}>
              {formatTND(balance?.totalIncome ?? 0)}<span className={styles.balanceCurrency}>TND</span>
            </div>
          </div>
        </div>
        <div className={`${styles.balanceCard} ${styles["balanceCard--expense"]}`}>
          <div className={`${styles.balanceIcon} ${styles["balanceIcon--expense"]}`}>{I.arrowDown}</div>
          <div className={styles.balanceInfo}>
            <div className={styles.balanceLabel}>Dépenses totales</div>
            <div className={`${styles.balanceValue} ${styles["balanceValue--expense"]}`}>
              {formatTND(balance?.totalExpenses ?? 0)}<span className={styles.balanceCurrency}>TND</span>
            </div>
          </div>
        </div>
        <div className={`${styles.balanceCard} ${styles["balanceCard--net"]} ${(balance?.balance ?? 0) < 0 ? styles.negative : ""}`}>
          <div className={`${styles.balanceIcon} ${styles["balanceIcon--net"]}`}>{I.wallet}</div>
          <div className={styles.balanceInfo}>
            <div className={styles.balanceLabel}>Solde net</div>
            <div className={`${styles.balanceValue} ${styles["balanceValue--net"]} ${(balance?.balance ?? 0) < 0 ? styles.negative : ""}`}>
              {formatTND(balance?.balance ?? 0)}<span className={styles.balanceCurrency}>TND</span>
            </div>
          </div>
        </div>
      </div>

      {/* Category Breakdown + Cotisations */}
      <div className={styles.twoCol}>
        {/* Category Breakdown */}
        <div className={styles.breakdownCard}>
          <div className={styles.breakdownTitle}>Répartition par catégorie</div>
          {summary?.categoryBreakdown && Object.keys(summary.categoryBreakdown).length > 0 ? (
            <div className={styles.breakdownGrid}>
              {Object.entries(summary.categoryBreakdown).map(([cat, data]) => {
                const total = (data as any).income + (data as any).expense;
                if (total === 0) return null;
                const isIncome = (data as any).income > 0;
                return (
                  <div key={cat} className={styles.breakdownItem}>
                    <div className={styles.breakdownItemLabel}>
                      <span className={styles.breakdownDot} style={{ background: BREAKDOWN_COLORS[cat] || "#9CA3AF" }} />
                      {CATEGORY_LABELS[cat] || cat}
                    </div>
                    <div className={`${styles.breakdownItemValue} ${isIncome ? styles["breakdownItemValue--income"] : styles["breakdownItemValue--expense"]}`}>
                      {isIncome ? "+" : "-"}{formatTND(isIncome ? (data as any).income : (data as any).expense)} TND
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className={styles.breakdownEmpty}>Aucune transaction enregistrée</div>
          )}
        </div>

        {/* Cotisations Overview */}
        <div className={styles.breakdownCard}>
          <div className={styles.breakdownTitle}>État des cotisations</div>
          {memberStats ? (
            <div className={styles.breakdownGrid}>
              <div className={styles.breakdownItem}>
                <div className={styles.breakdownItemLabel}>
                  <span className={styles.breakdownDot} style={{ background: "#059669" }} />
                  Actifs — à jour
                </div>
                <div className={`${styles.breakdownItemValue} ${styles["breakdownItemValue--income"]}`}>
                  {memberStats.active.count} <span className={styles.breakdownItemSub}>({formatTND(memberStats.active.totalPaid)} TND)</span>
                </div>
              </div>
              <div className={styles.breakdownItem}>
                <div className={styles.breakdownItemLabel}>
                  <span className={styles.breakdownDot} style={{ background: "#EA580C" }} />
                  En attente de paiement
                </div>
                <div className={`${styles.breakdownItemValue} ${styles["breakdownItemValue--expense"]}`}>
                  {memberStats.pendingPayment.count} <span className={styles.breakdownItemSub}>({formatTND(memberStats.pendingPayment.totalPaid)} TND)</span>
                </div>
              </div>
              <div className={styles.breakdownItem}>
                <div className={styles.breakdownItemLabel}>
                  <span className={styles.breakdownDot} style={{ background: "#DC2626" }} />
                  Expirés
                </div>
                <div className={`${styles.breakdownItemValue} ${styles["breakdownItemValue--expense"]}`}>
                  {memberStats.expired.count} <span className={styles.breakdownItemSub}>({formatTND(memberStats.expired.totalPaid)} TND)</span>
                </div>
              </div>
              <div className={styles.breakdownSummary}>
                <span className={styles.breakdownSummaryLabel}>Total collecté</span>
                <span className={styles.breakdownSummaryValue}>{formatTND(memberStats.totalRevenue)} TND</span>
              </div>
              <div className={styles.breakdownSummaryRow}>
                <span className={styles.breakdownSummaryLabelMuted}>Cotisation / membre</span>
                <span className={styles.breakdownSummaryValueDark}>{formatTND(memberStats.membershipFee)} TND</span>
              </div>
            </div>
          ) : (
            <div className={styles.breakdownEmpty}>Chargement...</div>
          )}
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
              placeholder="Rechercher une transaction..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <div className={styles.filterTabs}>
            {(["all", "income", "expense"] as const).map((f) => (
              <button
                key={f}
                className={`${styles.filterTab} ${typeFilter === f ? styles["filterTab--active"] : ""}`}
                onClick={() => { setTypeFilter(f); setPage(1); }}
              >
                {f === "all" ? "Toutes" : f === "income" ? "Revenus" : "Dépenses"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className={styles.tableCard}>
        <div className={styles.tableHead}>
          <div>
            <div className={styles.tableTitle}>Transactions</div>
            <div className={styles.tableSubtitle}>{meta?.total ?? 0} transaction{(meta?.total ?? 0) !== 1 ? "s" : ""}</div>
          </div>
        </div>

        {transactions.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>{I.receipt}</div>
            <div className={styles.emptyTitle}>Aucune transaction</div>
            <div className={styles.emptyDesc}>
              {search || typeFilter !== "all"
                ? "Aucune transaction ne correspond à votre recherche"
                : "Enregistrez votre première transaction pour commencer"}
            </div>
            {!search && typeFilter === "all" && (
              <button className={`${styles.btn} ${styles["btn--primary"]}`} onClick={() => setShowCreate(true)}>
                {I.plus} Nouvelle transaction
              </button>
            )}
          </div>
        ) : (
          <>
            <div className={styles.tableCardInner}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Catégorie</th>
                  <th>Type</th>
                  <th>Montant</th>
                  <th>Enregistré par</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx._id}>
                    <td className={styles.tdDate}>
                      <span className={styles.tdDateInner}>
                        {I.calendar}
                        {new Date(tx.date).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}
                      </span>
                    </td>
                    <td className={styles.tdDesc}>
                      {tx.description}
                      {tx.notes && <span className={styles.tdNotes}>({tx.notes})</span>}
                    </td>
                    <td>
                      <span className={styles.categoryBadge}>{CATEGORY_LABELS[tx.category] || tx.category}</span>
                    </td>
                    <td>
                      <span className={`${styles.typeBadge} ${tx.type === "income" ? styles["typeBadge--income"] : styles["typeBadge--expense"]}`}>
                        <span className={styles.typeDot} />
                        {tx.type === "income" ? "Revenu" : "Dépense"}
                      </span>
                    </td>
                    <td>
                      <span className={`${styles.amountCell} ${tx.type === "income" ? styles["amountCell--income"] : styles["amountCell--expense"]}`}>
                        {tx.type === "income" ? "+" : "-"}{formatTND(tx.amount)} TND
                      </span>
                    </td>
                    <td className={styles.tdUser}>
                      <span className={styles.tdUserInner}>
                        {I.user}
                        {tx.recordedBy?.firstName} {tx.recordedBy?.lastName}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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

      {/* ── Create Modal ──────────────────────────────────────────────── */}
      {showCreate && (
        <div className={styles.modalOverlay} onClick={() => setShowCreate(false)}>
          <div className={`${styles.modal} ${styles["modal--md"]}`} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHead}>
              <div className={styles.modalTitle}>Nouvelle transaction</div>
              <button className={styles.modalClose} onClick={() => setShowCreate(false)}>{I.close}</button>
            </div>
            <div className={styles.modalBody}>
              {/* Type Toggle */}
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Type <span className={styles.fieldRequired}>*</span></label>
                <div className={styles.filterTabs} style={{ width: "fit-content" }}>
                  <button
                    className={`${styles.filterTab} ${txType === "income" ? styles["filterTab--active"] : ""}`}
                    onClick={() => { setTxType("income"); setTxCategory("membership_fee"); }}
                  >
                    {I.arrowUp} Revenu
                  </button>
                  <button
                    className={`${styles.filterTab} ${txType === "expense" ? styles["filterTab--active"] : ""}`}
                    onClick={() => { setTxType("expense"); setTxCategory("equipment"); }}
                  >
                    {I.arrowDown} Dépense
                  </button>
                </div>
              </div>

              {/* Category */}
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Catégorie <span className={styles.fieldRequired}>*</span></label>
                <select
                  className={styles.select}
                  value={txCategory}
                  onChange={(e) => setTxCategory(e.target.value)}
                >
                  {availableCategories.map(([key, cat]) => (
                    <option key={key} value={key}>{cat.label}</option>
                  ))}
                </select>
              </div>

              {/* Amount + Date */}
              <div className={styles.fieldRow}>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Montant (TND) <span className={styles.fieldRequired}>*</span></label>
                  <input
                    className={styles.input}
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={txAmount}
                    onChange={(e) => setTxAmount(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Date <span className={styles.fieldRequired}>*</span></label>
                  <input
                    className={styles.input}
                    type="date"
                    value={txDate}
                    onChange={(e) => setTxDate(e.target.value)}
                  />
                </div>
              </div>

              {/* Description */}
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Description <span className={styles.fieldRequired}>*</span></label>
                <input
                  className={styles.input}
                  value={txDescription}
                  onChange={(e) => setTxDescription(e.target.value)}
                  placeholder="Description de la transaction..."
                />
              </div>

              {/* Notes */}
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Notes</label>
                <textarea
                  className={styles.textarea}
                  value={txNotes}
                  onChange={(e) => setTxNotes(e.target.value)}
                  placeholder="Notes optionnelles..."
                  rows={2}
                />
              </div>
            </div>
            <div className={styles.modalFoot}>
              <button className={`${styles.btn} ${styles["btn--secondary"]}`} onClick={() => setShowCreate(false)}>
                Annuler
              </button>
              <button
                className={`${styles.btn} ${styles["btn--primary"]}`}
                disabled={!txDescription.trim() || !txAmount || Number(txAmount) <= 0 || createMutation.isPending}
                onClick={() => createMutation.mutate()}
              >
                {createMutation.isPending ? "Enregistrement..." : "Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
