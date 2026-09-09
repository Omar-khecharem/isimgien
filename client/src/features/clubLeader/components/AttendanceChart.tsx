import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { AnalyticsDay } from "../clubLeaderService";

interface AttendanceChartProps {
  data: AnalyticsDay[];
}

export function AttendanceChart({ data }: AttendanceChartProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 h-full">
      <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-4">
        Analyse des Présences (Hebdomadaire)
      </h3>
      <div className="h-[200px] sm:h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={2}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#F2F4F7"
              vertical={false}
            />
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#98A2B3" }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#98A2B3" }}
            />
            <Tooltip
              contentStyle={{
                borderRadius: "12px",
                border: "1px solid #F2F4F7",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                fontSize: "13px",
              }}
            />
            <Bar
              dataKey="checkIns"
              name="Check-ins"
              fill="#044E35"
              radius={[4, 4, 0, 0]}
              maxBarSize={24}
            />
            <Bar
              dataKey="checkOuts"
              name="Check-outs"
              fill="#10B981"
              radius={[4, 4, 0, 0]}
              maxBarSize={24}
            />
            <Bar
              dataKey="incomplete"
              name="Incomplets"
              fill="#F79009"
              radius={[4, 4, 0, 0]}
              maxBarSize={24}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-3 pt-3 border-t border-gray-100">
        <span className="flex items-center gap-1.5 text-[11px] sm:text-xs text-gray-500">
          <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-sm bg-brand" />
          Check-ins
        </span>
        <span className="flex items-center gap-1.5 text-[11px] sm:text-xs text-gray-500">
          <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-sm bg-emerald-500" />
          Check-outs
        </span>
        <span className="flex items-center gap-1.5 text-[11px] sm:text-xs text-gray-500">
          <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-sm bg-amber-500" />
          Incomplets
        </span>
      </div>
    </div>
  );
}
