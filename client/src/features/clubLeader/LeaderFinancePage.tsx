import { useState } from "react";
import { useAuth } from "../../features/auth";
import { clubsService } from "../clubs/clubsService";
import { financeService, type Transaction } from "../../features/finance/financeService";
import { clubLeaderService, type MembershipStats } from "./clubLeaderService";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import styles from "./LeaderFinancePage.module.css";

/* ─── Icons ───────────────────────────────────────────────────────────── */

const I = {
  search: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>,
  plus: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>,
  check: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>,
  x: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
  close: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
  dollar: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>,
  trendingUp: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>,
  trendingDown: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6" /><polyline points="17 18 23 18 23 12" /></svg>,
  users: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></svg>,
  arrowLeft: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>,
  arrowRight: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>,
  receipt: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" /><path d="M14 8h-4" /><path d="M16 12h-6" /></svg>,
  alert: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>,
};

const CATEGORIES: Record<string, { label: string; color: string; bg: string }> = {
  membership_fee: { label: "Cotisation", color: "#059669", bg: "#ECFDF5" },
  event_revenue: { label: "Événement", color: "#2563EB", bg: "#EFF6FF" },
  training_fee: { label: "Formation", color: "#7C3AED", bg: "#F5F3FF" },
  equipment: { label: "Équipement", color: "#EA580C", bg: "#FFF7ED" },
  supplies: { label: "Fournitures", color: "#0891B2", bg: "#ECFEFF" },
  transport: { label: "Transport", color: "#D97706", bg: "#FFFBEB" },
  other_income: { label: "Autre revenu", color: "#059669", bg: "#ECFDF5" },
  other_expense: { label: "Autre dépense", color: "#6B7280", bg: "#F3F4F6" },
};

function getCategoryInfo(cat: string) {
  return CATEGORIES[cat] || { label: cat, color: "#6B7280", bg: "#F3F4F6" };
}

function formatAmount(n: number) {
  return new Intl.NumberFormat("fr-TN", { style: "decimal", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n) + " TND";
}

/* ═══════════════════════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */

export default function LeaderFinancePage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "income" | "expense">("all");
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [toast, setToast] = useState<{ msg: string; error?: boolean } | null>(null);
  const showToast = (msg: string, error = false) => {
    setToast({ msg, error });
    setTimeout(() => setToast(null), 3000);
  };

  const limit = 12;

  /* ── Create form state ─────────────────────────────────────────────── */
  const [txType, setTxType] = useState<"income" | "expense">("income");
  const [txCategory, setTxCategory] = useState("membership_fee");
  const [txAmount, setTxAmount] = useState("");
  const [txDesc, setTxDesc] = useState("");
  const [txDate, setTxDate] = useState(new Date().toISOString().slice(0, 10));
  const [txNotes, setTxNotes] = useState("");

  /* ── Fetch club ────────────────────────────────────────────────────── */
  const { data: clubData } = useQuery({
    queryKey: ["leader", "my-club"],
    queryFn: async () => (await clubsService.getMyClub()).data,
    enabled: !!user,
  });
  const clubId = clubData?._id;

  /* ── Fetch balance ─────────────────────────────────────────────────── */
  const { data: balanceData } = useQuery({
    queryKey: ["leader", "balance", clubId],
    queryFn: async () => {
      if (!clubId) return null;
      return (await financeService.getBalance(clubId)).data;
    },
    enabled: !!clubId,
  });

  /* ── Fetch summary ─────────────────────────────────────────────────── */
  const { data: summaryData } = useQuery({
    queryKey: ["leader", "summary", clubId],
    queryFn: async () => {
      if (!clubId) return null;
      return (await financeService.getSummary(clubId)).data;
    },
    enabled: !!clubId,
  });

  /* ── Fetch membership stats ────────────────────────────────────────── */
  const { data: memberStats } = useQuery({
    queryKey: ["leader", "member-stats", clubId],
    queryFn: async () => {
      if (!clubId) return null;
      return (await clubLeaderService.getMembershipStats(clubId)).data;
    },
    enabled: !!clubId,
  });

  /* ── Fetch transactions ────────────────────────────────────────────── */
  const { data: txData, isLoading: txLoading } = useQuery({
    queryKey: ["leader", "transactions", clubId, page, typeFilter, search],
    queryFn: async () => {
      if (!clubId) return null;
      const params: Record<string, any> = { page, limit, sort: "-date" };
      if (typeFilter !== "all") params.type = typeFilter;
      if (search.trim()) params.search = search.trim();
      return (await financeService.listTransactions(clubId, params)).data;
    },
    enabled: !!clubId,
  });

  /* ── Create mutation ───────────────────────────────────────────────── */
  const createMutation = useMutation({
    mutationFn: async () => {
      if (!clubId) throw new Error("Missing");
      return financeService.createTransaction(clubId, {
        type: txType,
        category: txCategory as any,
        amount: parseFloat(txAmount),
        description: txDesc.trim(),
        date: new Date(txDate).toISOString(),
        notes: txNotes.trim() || null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leader", "transactions"] });
      queryClient.invalidateQueries({ queryKey: ["leader", "balance"] });
      queryClient.invalidateQueries({ queryKey: ["leader", "summary"] });
      setShowCreate(false);
      resetForm();
      showToast("Transaction enregistrée");
    },
    onError: () => showToast("Erreur lors de l'enregistrement", true),
  });

  const resetForm = () => {
    setTxType("income");
    setTxCategory("membership_fee");
    setTxAmount("");
    setTxDesc("");
    setTxDate(new Date().toISOString().slice(0, 10));
    setTxNotes("");
  };

  /* ── Derived ───────────────────────────────────────────────────────── */
  const balance = balanceData ?? null;
  const summary = summaryData ?? null;
  const transactions = txData?.data ?? [];
  const meta = txData?.meta;
  const totalPages = meta?.totalPages ?? 1;

  const incomeCategories = summary?.categoryBreakdown
    ? Object.entries(summary.categoryBreakdown).filter(([, v]) => v.income > 0)
    : [];
  const expenseCategories = summary?.categoryBreakdown
    ? Object.entries(summary.categoryBreakdown).filter(([, v]) => v.expense > 0)
    : [];
  const maxCatAmount = Math.max(
    ...incomeCategories.map(([, v]) => v.income),
    ...expenseCategories.map(([, v]) => v.expense),
    1
  );

  const currentCategories = txType === "income"
    ? [
        { value: "membership_fee", label: "Cotisation" },
        { value: "event_revenue", label: "Événement" },
        { value: "training_fee", label: "Formation" },
        { value: "other_income", label: "Autre revenu" },
      ]
    : [
        { value: "equipment", label: "Équipement" },
        { value: "supplies", label: "Fournitures" },
        { value: "transport", label: "Transport" },
        { value: "other_expense", label: "Autre dépense" },
      ];

  if (txLoading && !txData) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingWrap}>
          <div className={styles.spinner} />
          <p className={styles.loadingText}>Chargement des finances...</p>
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

      {/* Stats */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles["statIcon--balance"]}`}>{I.dollar}</div>
          <div className={styles.statInfo}>
            <div className={styles.statValue}>{formatAmount(balance?.balance ?? 0)}</div>
            <div className={styles.statLabel}>Solde actuel</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles["statIcon--income"]}`}>{I.trendingUp}</div>
          <div className={styles.statInfo}>
            <div className={`${styles.statValue} ${styles.amount} ${styles["amount--income"]}`}>{formatAmount(balance?.totalIncome ?? 0)}</div>
            <div className={styles.statLabel}>Revenus</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles["statIcon--expense"]}`}>{I.trendingDown}</div>
          <div className={styles.statInfo}>
            <div className={`${styles.statValue} ${styles.amount} ${styles["amount--expense"]}`}>{formatAmount(balance?.totalExpenses ?? 0)}</div>
            <div className={styles.statLabel}>Dépenses</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles["statIcon--count"]}`}>{I.receipt}</div>
          <div className={styles.statInfo}>
            <div className={styles.statValue}>{meta?.total ?? 0}</div>
            <div className={styles.statLabel}>Transactions</div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className={styles.contentGrid}>
        {/* Left: Transactions */}
        <div>
          {/* Toolbar */}
          <div className={styles.toolbar}>
            <div className={styles.toolbarLeft}>
              <div className={styles.searchWrap}>
                <span className={styles.searchIcon}>{I.search}</span>
                <input
                  className={styles.searchInput}
                  type="text"
                  placeholder="Rechercher..."
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
                    {f === "all" ? "Tous" : f === "income" ? "Revenus" : "Dépenses"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className={styles.sectionCard} style={{ marginTop: 12 }}>
            {transactions.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>{I.receipt}</div>
                <div className={styles.emptyTitle}>Aucune transaction</div>
                <div className={styles.emptyDesc}>
                  {search || typeFilter !== "all"
                    ? "Aucune transaction ne correspond à votre recherche"
                    : "Enregistrez votre première transaction pour commencer"}
                </div>
              </div>
            ) : (
              <>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Catégorie</th>
                      <th>Description</th>
                      <th>Montant</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => {
                      const cat = getCategoryInfo(tx.category);
                      return (
                        <tr key={tx._id}>
                          <td>
                            <span className={`${styles.typeBadge} ${tx.type === "income" ? styles["typeBadge--income"] : styles["typeBadge--expense"]}`}>
                              <span className={styles.typeDot} />
                              {tx.type === "income" ? "Revenu" : "Dépense"}
                            </span>
                          </td>
                          <td>
                            <span className={styles.catBadge} style={{ background: cat.bg, color: cat.color }}>
                              {cat.label}
                            </span>
                          </td>
                          <td style={{ maxWidth: 250, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {tx.description}
                          </td>
                          <td>
                            <span className={`${styles.amount} ${tx.type === "income" ? styles["amount--income"] : styles["amount--expense"]}`}>
                              {tx.type === "income" ? "+" : "−"}{formatAmount(tx.amount)}
                            </span>
                          </td>
                          <td style={{ color: "#6B7280", fontSize: 13 }}>
                            {new Date(tx.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {totalPages > 1 && (
                  <div className={styles.pagination}>
                    <div className={styles.paginationInfo}>Page {page} sur {totalPages}</div>
                    <div className={styles.paginationBtns}>
                      <button className={styles.pageBtn} disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                        {I.arrowLeft}
                      </button>
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                        let n: number;
                        if (totalPages <= 5) n = i + 1;
                        else if (page <= 3) n = i + 1;
                        else if (page >= totalPages - 2) n = totalPages - 4 + i;
                        else n = page - 2 + i;
                        return (
                          <button
                            key={n}
                            className={`${styles.pageBtn} ${n === page ? styles["pageBtn--active"] : ""}`}
                            onClick={() => setPage(n)}
                          >
                            {n}
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
        </div>

        {/* Right: Sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Balance Hero */}
          <div className={styles.sectionCard}>
            <div className={styles.balanceHero}>
              <div className={styles.balanceLabel}>Solde du club</div>
              <div className={`${styles.balanceValue} ${(balance?.balance ?? 0) >= 0 ? styles["balanceValue--positive"] : styles["balanceValue--negative"]}`}>
                {formatAmount(balance?.balance ?? 0)}
              </div>
              <div className={styles.balanceRow}>
                <div className={styles.balanceItem}>
                  <div className={styles.balanceItemLabel}>Revenus</div>
                  <div className={`${styles.balanceItemValue} ${styles["balanceItemValue--income"]}`}>{formatAmount(balance?.totalIncome ?? 0)}</div>
                </div>
                <div className={styles.balanceItem}>
                  <div className={styles.balanceItemLabel}>Dépenses</div>
                  <div className={`${styles.balanceItemValue} ${styles["balanceItemValue--expense"]}`}>{formatAmount(balance?.totalExpenses ?? 0)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className={styles.sectionCard}>
            <div className={styles.sectionHead}>
              <div>
                <div className={styles.sectionTitle}>Répartition par catégorie</div>
                <div className={styles.sectionSubtitle}>Revenus et dépenses</div>
              </div>
            </div>
            <div className={styles.breakdownList}>
              {incomeCategories.length === 0 && expenseCategories.length === 0 && (
                <div style={{ textAlign: "center", padding: "20px 0", color: "#9CA3AF", fontSize: 13 }}>
                  Aucune donnée disponible
                </div>
              )}
              {incomeCategories.map(([cat, data]) => {
                const info = getCategoryInfo(cat);
                return (
                  <div key={`income-${cat}`} className={styles.breakdownItem}>
                    <div className={styles.breakdownIcon} style={{ background: info.bg, color: info.color }}>↑</div>
                    <div className={styles.breakdownInfo}>
                      <div className={styles.breakdownLabel}>{info.label}</div>
                      <div className={styles.breakdownBar}>
                        <div
                          className={`${styles.breakdownBarFill} ${styles["breakdownBarFill--income"]}`}
                          style={{ width: `${(data.income / maxCatAmount) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className={`${styles.breakdownAmount} ${styles["amount--income"]}`}>{formatAmount(data.income)}</div>
                  </div>
                );
              })}
              {expenseCategories.map(([cat, data]) => {
                const info = getCategoryInfo(cat);
                return (
                  <div key={`expense-${cat}`} className={styles.breakdownItem}>
                    <div className={styles.breakdownIcon} style={{ background: info.bg, color: info.color }}>↓</div>
                    <div className={styles.breakdownInfo}>
                      <div className={styles.breakdownLabel}>{info.label}</div>
                      <div className={styles.breakdownBar}>
                        <div
                          className={`${styles.breakdownBarFill} ${styles["breakdownBarFill--expense"]}`}
                          style={{ width: `${(data.expense / maxCatAmount) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className={`${styles.breakdownAmount} ${styles["amount--expense"]}`}>{formatAmount(data.expense)}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Membership Fees */}
          {memberStats && (
            <div className={styles.sectionCard}>
              <div className={styles.sectionHead}>
                <div>
                  <div className={styles.sectionTitle}>Cotisations</div>
                  <div className={styles.sectionSubtitle}>Cotisation: {formatAmount(memberStats.membershipFee)}</div>
                </div>
              </div>
              <div className={styles.feesGrid}>
                <div className={styles.feeCard}>
                  <div className={`${styles.feeCardValue} ${styles["amount--income"]}`}>{formatAmount(memberStats.totalRevenue)}</div>
                  <div className={styles.feeCardLabel}>Total perçu</div>
                </div>
                <div className={styles.feeCard}>
                  <div className={styles.feeCardValue}>{memberStats.active.count}</div>
                  <div className={styles.feeCardLabel}>Membres actifs</div>
                </div>
                <div className={styles.feeCard}>
                  <div className={`${styles.feeCardValue} ${styles["amount--expense"]}`}>{memberStats.pendingPayment.count}</div>
                  <div className={styles.feeCardLabel}>En attente</div>
                </div>
              </div>
            </div>
          )}
        </div>
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
                <div className={styles.typeToggle}>
                  <button
                    className={`${styles.typeOption} ${styles["typeOption--income"]} ${txType === "income" ? styles["typeOption--active"] : ""}`}
                    onClick={() => { setTxType("income"); setTxCategory("membership_fee"); }}
                  >
                    ↑ Revenu
                  </button>
                  <button
                    className={`${styles.typeOption} ${styles["typeOption--expense"]} ${txType === "expense" ? styles["typeOption--active"] : ""}`}
                    onClick={() => { setTxType("expense"); setTxCategory("equipment"); }}
                  >
                    ↓ Dépense
                  </button>
                </div>
              </div>

              {/* Category */}
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Catégorie <span className={styles.fieldRequired}>*</span></label>
                <select className={styles.select} value={txCategory} onChange={(e) => setTxCategory(e.target.value)}>
                  {currentCategories.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
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
                  value={txDesc}
                  onChange={(e) => setTxDesc(e.target.value)}
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
                disabled={!txAmount || parseFloat(txAmount) <= 0 || !txDesc.trim() || createMutation.isPending}
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
