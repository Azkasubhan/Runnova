"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { MachineData } from "@/lib/mockData";

// ─────────────────────────────────────────────────────────────────────────────
// SensorChart — Multi-sensor historical line chart
//
// Renders vibration, temperature, and pressure as overlaid line charts
// with independent Y-axes. Data auto-scrolls as new history arrives.
// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  machine: MachineData;
}

interface SensorHistoryPoint {
  time: number;
  vibration: number;
  temperature: number;
  pressure: number;
}

/** Build synthetic sensor history from health curve + current sensor readings */
function buildSensorHistory(machine: MachineData): SensorHistoryPoint[] {
  const { history, sensor_data } = machine;
  const len = history.length;
  const trail = history.slice(-80); // show last 80 points

  return trail.map((pt, i) => {
    // Derive sensor values from health with some variation
    const idx = len - trail.length + i;
    const degradation = 1 - pt.health; // 0 = healthy, 1 = failed

    const phase = idx * 0.1;
    const vib = 1.5 + degradation * (sensor_data.vibration - 1.5) + Math.sin(phase * 2.3) * 0.4;
    const temp = 50 + degradation * (sensor_data.temperature - 50) + Math.cos(phase * 1.7) * 1.5;
    const pres = 25 + degradation * (sensor_data.pressure - 25) + Math.sin(phase * 3.1) * 0.8;

    return {
      time: pt.time,
      vibration: parseFloat(Math.max(0.5, vib).toFixed(1)),
      temperature: parseFloat(Math.max(30, temp).toFixed(1)),
      pressure: parseFloat(Math.max(15, pres).toFixed(1)),
    };
  });
}

const SENSOR_CONFIGS = [
  { key: "vibration", label: "Vibration", color: "#22d3ee", unit: "mm/s", warn: 5.0, crit: 8.5 },
  { key: "temperature", label: "Temperature", color: "#f97316", unit: "°C", warn: 75, crit: 85 },
  { key: "pressure", label: "Pressure", color: "#a78bfa", unit: "bar", warn: 38, crit: 48 },
] as const;

interface CustomTooltipProps {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: number;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a2332] border border-[#1e2d3d] rounded px-3 py-2 shadow-xl text-[10px]">
      <p className="text-[#556677] mb-1">Cycle {label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-[#8899a6]">{p.name}:</span>
          <span className="text-[#e2e8f0] font-mono font-semibold">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function SensorChart({ machine }: Props) {
  const data = buildSensorHistory(machine);

  return (
    <div className="bg-[#111827] border border-[#1e2d3d] rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[#e2e8f0] font-semibold text-xs">Multi-Sensor History</h2>
        <div className="flex items-center gap-3 text-[10px]">
          {SENSOR_CONFIGS.map((s) => (
            <span key={s.key} className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
              <span className="text-[#556677]">{s.label}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Individual charts for each sensor */}
      <div className="space-y-4">
        {SENSOR_CONFIGS.map((config) => (
          <div key={config.key}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-[#8899a6] font-medium">{config.label} ({config.unit})</span>
              <div className="flex items-center gap-2 text-[9px] text-[#556677]">
                <span>Warn: {config.warn}</span>
                <span>Crit: {config.crit}</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={100}>
              <LineChart data={data} margin={{ top: 2, right: 8, left: -10, bottom: 2 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2d3d" />
                <XAxis
                  dataKey="time"
                  stroke="#1e2d3d"
                  tick={{ fill: "#556677", fontSize: 9 }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  stroke="#1e2d3d"
                  tick={{ fill: "#556677", fontSize: 9 }}
                  width={35}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey={config.key}
                  stroke={config.color}
                  strokeWidth={1.5}
                  dot={false}
                  activeDot={{ r: 3, fill: config.color, stroke: "#111827", strokeWidth: 2 }}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ))}
      </div>
    </div>
  );
}
