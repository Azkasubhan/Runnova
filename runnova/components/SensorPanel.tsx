"use client";

import { Activity, Thermometer, Gauge } from "lucide-react";
import type { MachineData } from "@/lib/mockData";

interface SensorThresholds {
  warn: number;
  crit: number;
}

interface SensorCardProps {
  label: string;
  value: number;
  unit: string;
  icon: React.ComponentType<{ className?: string }>;
  thresholds: SensorThresholds;
}

function SensorCard({ label, value, unit, icon: Icon, thresholds }: SensorCardProps) {
  const lvl = value >= thresholds.crit ? "Critical" : value >= thresholds.warn ? "Warning" : "Normal";
  const palette = {
    Critical: { text: "text-red-400", bar: "bg-red-400", border: "border-red-500/20" },
    Warning: { text: "text-yellow-400", bar: "bg-yellow-400", border: "border-yellow-500/20" },
    Normal: { text: "text-teal-400", bar: "bg-teal-400", border: "border-[#1e2d3d]" },
  }[lvl];
  const pct = Math.min(100, Math.round((value / (thresholds.crit * 1.2)) * 100));

  return (
    <div className={`bg-[#1a2332] border ${palette.border} rounded px-3 py-2`}>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5">
          <Icon className={`w-3 h-3 ${palette.text}`} />
          <span className="text-[#8899a6] text-[10px] font-medium uppercase">{label}</span>
        </div>
        <span className={`text-[9px] font-semibold ${palette.text}`}>{lvl}</span>
      </div>
      <p className={`text-xl font-bold font-mono ${palette.text}`}>
        {value.toFixed(1)}<span className="text-[10px] text-[#556677] ml-0.5">{unit}</span>
      </p>
      <div className="mt-1 w-full bg-[#0b1120] rounded-full h-1">
        <div className={`h-1 rounded-full transition-all duration-500 ${palette.bar}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

interface Props {
  machine: MachineData;
}

export default function SensorPanel({ machine }: Props) {
  const { sensor_data } = machine;
  return (
    <div className="bg-[#111827] border border-[#1e2d3d] rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-[#e2e8f0] font-semibold text-xs">Sensor Readings</h2>
        <span className="flex items-center gap-1 text-[10px] text-teal-400">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-400 live-dot" />Live
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <SensorCard label="Vibration" value={sensor_data.vibration} unit="mm/s" icon={Activity} thresholds={{ warn: 5.0, crit: 8.5 }} />
        <SensorCard label="Temperature" value={sensor_data.temperature} unit="°C" icon={Thermometer} thresholds={{ warn: 75, crit: 85 }} />
        <SensorCard label="Pressure" value={sensor_data.pressure} unit="bar" icon={Gauge} thresholds={{ warn: 38, crit: 48 }} />
      </div>
    </div>
  );
}
