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
  const totalCheckIns = data.reduce((sum, d) => sum + d.checkIns, 0);
  const totalCheckOuts = data.reduce((sum, d) => sum + d.checkOuts, 0);
  const totalIncomplete = data.reduce((sum, d) => sum + d.incomplete, 0);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-bold text-gray-900 tracking-tight">
            Analyse des Présences
          </h3>
          <p className="text-[11px] text-gray-400 mt-0.5 font-medium">
            Vue hebdomadaire
          </p>
        </div>
        <div className="flex items-center gap-0.5 bg-gray-100/80 rounded-lg p-0.5">
          <button className="px-3.5 py-1.5 text-[11px] font-semibold bg-white rounded-lg text-gray-900 shadow-sm">
            Semaine
          </button>
          <button className="px-3.5 py-1.5 text-[11px] font-semibold text-gray-500 rounded-lg hover:text-gray-900 transition-colors">
            Mois
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={3}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#F2F4F7"
              vertical={false}
            />
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#98A2B3", fontWeight: 500 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#98A2B3", fontWeight: 500 }}
            />
            <Tooltip
              contentStyle={{
                borderRadius: "14px",
                border: "1px solid #F2F4F7",
                boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                fontSize: "13px",
                padding: "10px 14px",
                fontWeight: 500,
              }}
              cursor={{ fill: "rgba(10,95,58,0.03)" }}
            />
            <Bar
              dataKey="checkIns"
              name="Check-ins"
              fill="#0A5F3A"
              radius={[5, 5, 0, 0]}
              maxBarSize={22}
            />
            <Bar
              dataKey="checkOuts"
              name="Check-outs"
              fill="#10B981"
              radius={[5, 5, 0, 0]}
              maxBarSize={22}
            />
            <Bar
              dataKey="incomplete"
              name="Incomplets"
              fill="#F79009"
              radius={[5, 5, 0, 0]}
              maxBarSize={22}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 sm:gap-5 mt-4 pt-4 border-t border-gray-100">
        {[
          { color: "bg-[#0A5F3A]", label: "Check-ins", value: totalCheckIns },
          { color: "bg-emerald-500", label: "Check-outs", value: totalCheckOuts },
          { color: "bg-amber-500", label: "Incomplets", value: totalIncomplete },
        ].map((item) => (
          <span key={item.label} className="flex items-center gap-1.5 text-[11px] text-gray-500 font-medium">
            <span className={`w-2.5 h-2.5 rounded-sm ${item.color}`} />
            {item.label} ({item.value})
          </span>
        ))}
      </div>
    </div>
  );
}
