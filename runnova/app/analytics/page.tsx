"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Area, Legend } from "recharts";
import MainLayout from "@/components/layout/MainLayout";
import { useMachines } from "@/lib/MachineProvider";

const STATUS_COLORS: Record<string, string> = {
  Healthy: "#2dd4bf",
  Warning: "#facc15",
  Critical: "#ef4444",
};

export default function AnalyticsPage() {
  const { machines, isLoaded } = useMachines();
  if (!isLoaded) return null;

  // Status distribution
  const statusData = ["Healthy", "Warning", "Critical"].map((s) => ({
    name: s,
    value: machines.filter((m) => m.prediction.status === s).length,
  }));

  // Per-machine comparison
  const comparisonData = machines.map((m) => ({
    name: m.machine_id.replace("_", " "),
    health: Math.round(m.prediction.health_score * 100),
    rul: m.prediction.rul,
  }));

  // Average health over fleet
  const avgHealth = machines.length
    ? Math.round(machines.reduce((a, m) => a + m.prediction.health_score, 0) / machines.length * 100)
    : 0;
  const avgRul = machines.length
    ? Math.round(machines.reduce((a, m) => a + m.prediction.rul, 0) / machines.length)
    : 0;

  // Global degradation trend (aggregate all histories at shared time points)
  const maxLen = Math.max(...machines.map((m) => m.history.length));
  const trendData: { cycle: number; avgHealth: number }[] = [];
  for (let i = 0; i < maxLen; i += 5) {
    let sum = 0, count = 0;
    for (const m of machines) {
      if (i < m.history.length) { sum += m.history[i].health; count++; }
    }
    if (count) trendData.push({ cycle: i, avgHealth: parseFloat((sum / count * 100).toFixed(1)) });
  }

  return (
    <MainLayout title="Analytics">
      <div className="p-4 space-y-4 h-full overflow-y-auto">
        {/* Summary cards */}
        <div className="grid grid-cols-4 gap-3">
          <SummaryCard label="Avg Health" value={`${avgHealth}%`} />
          <SummaryCard label="Avg RUL" value={`${avgRul} cyc`} />
          <SummaryCard label="Fleet Size" value={String(machines.length)} />
          <SummaryCard label="Anomalies" value={String(machines.filter((m) => m.anomaly.detected).length)} accent />
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-12 gap-3">
          {/* Status distribution */}
          <div className="col-span-4 bg-[#111827] border border-[#1e2d3d] rounded-lg p-4">
            <h3 className="text-[#e2e8f0] text-xs font-semibold mb-3">Status Distribution</h3>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={statusData} dataKey="value" cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} strokeWidth={0}>
                  {statusData.map((d) => (
                    <Cell key={d.name} fill={STATUS_COLORS[d.name]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "#1a2332", border: "1px solid #1e2d3d", borderRadius: 6, fontSize: 11 }}
                  itemStyle={{ color: "#e2e8f0" }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-2">
              {statusData.map((d) => (
                <div key={d.name} className="flex items-center gap-1.5 text-[10px]">
                  <span className="w-2 h-2 rounded-full" style={{ background: STATUS_COLORS[d.name] }} />
                  <span className="text-[#8899a6]">{d.name} ({d.value})</span>
                </div>
              ))}
            </div>
          </div>

          {/* Machine comparison */}
          <div className="col-span-8 bg-[#111827] border border-[#1e2d3d] rounded-lg p-4">
            <h3 className="text-[#e2e8f0] text-xs font-semibold mb-3">Machine Comparison — Health & RUL</h3>
            <ResponsiveContainer width="100%" height={200}>
              <ComposedChart data={comparisonData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2d3d" />
                <XAxis dataKey="name" tick={{ fill: "#556677", fontSize: 10 }} stroke="#1e2d3d" />
                <YAxis yAxisId="health" domain={[0, 100]} tick={{ fill: "#556677", fontSize: 10 }} stroke="#1e2d3d" tickFormatter={(v: number) => `${v}%`} />
                <YAxis yAxisId="rul" orientation="right" tick={{ fill: "#556677", fontSize: 10 }} stroke="#1e2d3d" />
                <Tooltip contentStyle={{ background: "#1a2332", border: "1px solid #1e2d3d", borderRadius: 6, fontSize: 11 }} />
                <Legend wrapperStyle={{ fontSize: 10, color: "#8899a6" }} />
                <Bar yAxisId="health" dataKey="health" name="Health %" fill="#2dd4bf" radius={[3, 3, 0, 0]} barSize={20} />
                <Bar yAxisId="rul" dataKey="rul" name="RUL (cycles)" fill="#22d3ee" radius={[3, 3, 0, 0]} barSize={20} opacity={0.6} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Global degradation trend */}
        <div className="bg-[#111827] border border-[#1e2d3d] rounded-lg p-4">
          <h3 className="text-[#e2e8f0] text-xs font-semibold mb-3">Fleet Average Health Trend</h3>
          <ResponsiveContainer width="100%" height={180}>
            <ComposedChart data={trendData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <defs>
                <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2d3d" />
              <XAxis dataKey="cycle" tick={{ fill: "#556677", fontSize: 10 }} stroke="#1e2d3d" />
              <YAxis domain={[0, 100]} tick={{ fill: "#556677", fontSize: 10 }} stroke="#1e2d3d" tickFormatter={(v: number) => `${v}%`} />
              <Tooltip contentStyle={{ background: "#1a2332", border: "1px solid #1e2d3d", borderRadius: 6, fontSize: 11 }} />
              <Area type="monotone" dataKey="avgHealth" name="Avg Health %" stroke="#2dd4bf" strokeWidth={1.5} fill="url(#trendGrad)" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </MainLayout>
  );
}

function SummaryCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="bg-[#111827] border border-[#1e2d3d] rounded-lg px-4 py-3">
      <p className="text-[#556677] text-[10px] uppercase tracking-wider">{label}</p>
      <p className={`text-xl font-bold font-mono mt-1 ${accent ? "text-red-400" : "text-[#e2e8f0]"}`}>{value}</p>
    </div>
  );
}
