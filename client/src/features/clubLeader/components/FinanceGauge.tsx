import { ArrowRight } from "lucide-react";
import type { FinanceSummary } from "../clubLeaderService";

interface FinanceGaugeProps {
  finance: FinanceSummary;
}

export function FinanceGauge({ finance }: FinanceGaugeProps) {
  const { totalIncome, totalExpenses, balance, recentTransactions } = finance;
  const maxVal = Math.max(totalIncome, 1);
  const percentage = Math.min(Math.round((balance / maxVal) * 100), 100);

  const circumference = Math.PI * 80;
  const filled = (percentage / 100) * circumference;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-bold text-gray-900 tracking-tight">
          Caisse du Club
        </h3>
        <button className="flex items-center gap-1.5 text-xs font-semibold text-brand hover:text-brand/80 transition-colors group">
          Détails
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Gauge */}
      <div className="flex justify-center mb-5">
        <div className="relative w-[170px] h-[95px]">
          <svg viewBox="0 0 200 110" className="w-full h-full">
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke="#F2F4F7"
              strokeWidth={14}
              strokeLinecap="round"
            />
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke={balance >= 0 ? "#0A5F3A" : "#EF4444"}
              strokeWidth={14}
              strokeLinecap="round"
              strokeDasharray={`${circumference}`}
              strokeDashoffset={`${circumference - filled}`}
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
            <span className="text-[26px] font-bold text-gray-900 tracking-tight leading-none">{percentage}%</span>
            <span className="text-[10px] text-gray-400 mt-1 font-medium">Solde / Revenus</span>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3 mb-5 pb-5 border-b border-gray-100">
        <div className="text-center">
          <div className="text-sm font-bold text-emerald-600 tracking-tight">
            {totalIncome.toLocaleString("fr-FR")}
          </div>
          <div className="text-[10px] text-gray-400 mt-1 font-medium">Revenus (TND)</div>
        </div>
        <div className="text-center">
          <div className="text-sm font-bold text-red-500 tracking-tight">
            {totalExpenses.toLocaleString("fr-FR")}
          </div>
          <div className="text-[10px] text-gray-400 mt-1 font-medium">Dépenses (TND)</div>
        </div>
        <div className="text-center">
          <div className={`text-sm font-bold tracking-tight ${balance >= 0 ? "text-brand" : "text-red-600"}`}>
            {balance.toLocaleString("fr-FR")}
          </div>
          <div className="text-[10px] text-gray-400 mt-1 font-medium">Solde (TND)</div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="flex flex-col gap-1">
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-1 mb-1">
          Dernières transactions
        </div>
        {recentTransactions.slice(0, 3).map((tx) => (
          <div
            key={tx._id}
            className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50/80 transition-all duration-200 group cursor-default"
          >
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                tx.type === "income"
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-red-50 text-red-500"
              }`}
            >
              {tx.type === "income" ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                  <polyline points="17 6 23 6 23 12" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
                  <polyline points="17 18 23 18 23 12" />
                </svg>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold text-gray-900 truncate leading-tight">
                {tx.description}
              </div>
              <div className="text-[11px] text-gray-400 truncate mt-0.5">
                {tx.category}
              </div>
            </div>
            <span
              className={`text-[12px] font-bold tracking-tight ${
                tx.type === "income" ? "text-emerald-600" : "text-red-500"
              }`}
            >
              {tx.type === "income" ? "+" : "-"}{tx.amount.toLocaleString("fr-FR")} TND
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
