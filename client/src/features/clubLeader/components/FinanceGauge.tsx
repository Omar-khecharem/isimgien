import type { FinanceSummary } from "../clubLeaderService";

interface FinanceGaugeProps {
  finance: FinanceSummary;
}

export function FinanceGauge({ finance }: FinanceGaugeProps) {
  const { totalIncome, totalExpenses, balance } = finance;
  const maxVal = Math.max(totalIncome, 1);
  const percentage = Math.min(Math.round((balance / maxVal) * 100), 100);

  const radius = 80;
  const strokeWidth = 12;
  const circumference = Math.PI * radius;
  const filled = (percentage / 100) * circumference;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 h-full flex flex-col items-center">
      <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-3 sm:mb-4 self-start">
        Caisse du Club
      </h3>

      <div className="relative w-[160px] sm:w-[200px] h-[90px] sm:h-[110px] mb-3">
        <svg viewBox="0 0 200 110" className="w-full h-full">
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="#F2F4F7"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="#044E35"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${circumference}`}
            strokeDashoffset={`${circumference - filled}`}
            className="transition-all duration-700"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
          <span className="text-2xl sm:text-3xl font-bold text-gray-900">{percentage}%</span>
          <span className="text-[10px] sm:text-xs text-gray-500">Solde / Revenus</span>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4 mt-2">
        <span className="flex items-center gap-1.5 text-[11px] sm:text-xs text-gray-500">
          <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-brand" />
          Revenus
        </span>
        <span className="flex items-center gap-1.5 text-[11px] sm:text-xs text-gray-500">
          <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-red-400" />
          Dépenses
        </span>
        <span className="flex items-center gap-1.5 text-[11px] sm:text-xs text-gray-500">
          <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-gray-300" />
          Solde
        </span>
      </div>

      <div className="w-full mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100 grid grid-cols-3 gap-2 sm:gap-3 text-center">
        <div>
          <div className="text-sm sm:text-lg font-bold text-emerald-600">
            {totalIncome.toLocaleString("fr-FR")}
          </div>
          <div className="text-[9px] sm:text-[10px] text-gray-400">Revenus (DA)</div>
        </div>
        <div>
          <div className="text-sm sm:text-lg font-bold text-red-500">
            {totalExpenses.toLocaleString("fr-FR")}
          </div>
          <div className="text-[9px] sm:text-[10px] text-gray-400">Dépenses (DA)</div>
        </div>
        <div>
          <div className="text-sm sm:text-lg font-bold text-brand">
            {balance.toLocaleString("fr-FR")}
          </div>
          <div className="text-[9px] sm:text-[10px] text-gray-400">Solde (DA)</div>
        </div>
      </div>
    </div>
  );
}
