"use client";

import {
  ComposedChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import type { MachineData, HistoryPoint } from "@/lib/mockData";
import { getHealthColor } from "@/lib/utils";

interface Props {
  machine: MachineData;
}

interface TooltipProps {
  active?: boolean;
  payload?: { payload: HistoryPoint }[];
}

function CustomTooltip({ active, payload }: TooltipProps) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-[#1a2332] border border-[#1e2d3d] rounded px-2 py-1.5 text-[10px] shadow-xl">
      <p className="text-[#556677]">Cycle {d.time}</p>
      <p className="text-[#e2e8f0] font-semibold">
        Health: {(d.health * 100).toFixed(1)}%
      </p>
      {d.anomaly && (
        <p className="text-red-400 mt-0.5 font-medium">⚠ Anomaly</p>
      )}
    </div>
  );
}

interface DotProps {
  cx: number;
  cy: number;
  payload: HistoryPoint;
  index: number;
}

function AnomalyDot(props: DotProps) {
  if (!props.payload.anomaly) return <g key={`dot-${props.index}`} />;
  return (
    <g key={`anomaly-${props.index}`}>
      <circle cx={props.cx} cy={props.cy} r={3} fill="#ef4444" stroke="#fca5a5" strokeWidth={1} />
    </g>
  );
}

export default function HealthChart({ machine }: Props) {
  const healthColor = getHealthColor(machine.prediction.health_score);
  const displayData = machine.history.slice(-100);

  return (
    <div className="bg-[#111827] border border-[#1e2d3d] rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-[#e2e8f0] font-semibold text-xs">Health Degradation Curve</h2>
        <div className="flex items-center gap-2 text-[10px]">
          <span className="flex items-center gap-1 text-[#556677]">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 inline-block" /> OK
          </span>
          <span className="flex items-center gap-1 text-[#556677]">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 inline-block" /> Warn
          </span>
          <span className="flex items-center gap-1 text-[#556677]">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" /> Crit
          </span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={160}>
        <ComposedChart data={displayData} margin={{ top: 2, right: 4, left: -15, bottom: 2 }}>
          <defs>
            <linearGradient id={`grad-${machine.machine_id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={healthColor} stopOpacity={0.3} />
              <stop offset="95%" stopColor={healthColor} stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e2d3d" />
          <XAxis dataKey="time" stroke="#1e2d3d" tick={{ fill: "#556677", fontSize: 9 }} />
          <YAxis domain={[0, 1]} stroke="#1e2d3d" tick={{ fill: "#556677", fontSize: 9 }} tickFormatter={(v: number) => `${Math.round(v * 100)}%`} />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={0.7} stroke="#2dd4bf" strokeDasharray="4 3" strokeOpacity={0.35} />
          <ReferenceLine y={0.35} stroke="#facc15" strokeDasharray="4 3" strokeOpacity={0.35} />
          <Area
            type="monotone"
            dataKey="health"
            stroke={healthColor}
            strokeWidth={1.5}
            fill={`url(#grad-${machine.machine_id})`}
            dot={AnomalyDot as unknown as boolean}
            activeDot={{ r: 3, fill: healthColor, stroke: "#111827", strokeWidth: 2 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
