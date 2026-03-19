"use client";

import { MapPin, Cpu } from "lucide-react";
import type { MachineData } from "@/lib/mockData";
import { getStatusBadgeClass, getStatusDotClass, getStatusTextColor, getHealthBarClass } from "@/lib/utils";

interface Props {
  machine: MachineData;
}

export default function MachineStatus({ machine }: Props) {
  const hp = Math.round(machine.prediction.health_score * 100);
  const progressPct = Math.round((machine.current_cycle / machine.total_cycles) * 100);

  return (
    <div className="bg-[#111827] border border-[#1e2d3d] rounded-lg p-3">
      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h2 className="text-[#e2e8f0] font-bold text-sm">{machine.machine_id}</h2>
          <div className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold border ${getStatusBadgeClass(machine.prediction.status)}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${getStatusDotClass(machine.prediction.status)} ${machine.prediction.status !== "Healthy" ? "animate-pulse" : ""}`} />
            {machine.prediction.status}
          </div>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-[#556677]">
          <span className="flex items-center gap-1"><Cpu className="w-3 h-3" />{machine.machine_type}</span>
          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{machine.location}</span>
        </div>
      </div>

      {/* Metrics row */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-[#1a2332] rounded px-3 py-2">
          <p className="text-[#556677] text-[10px] mb-0.5">RUL (cycles)</p>
          <p className={`text-2xl font-bold font-mono ${getStatusTextColor(machine.prediction.status)}`}>
            {machine.prediction.rul}
          </p>
        </div>
        <div className="bg-[#1a2332] rounded px-3 py-2">
          <p className="text-[#556677] text-[10px] mb-0.5">Health Score</p>
          <p className={`text-2xl font-bold font-mono ${getStatusTextColor(machine.prediction.status)}`}>
            {hp}<span className="text-sm text-[#556677]">%</span>
          </p>
          <div className="mt-1 w-full bg-[#0b1120] rounded-full h-1">
            <div className={`h-1 rounded-full transition-all duration-500 ${getHealthBarClass(hp)}`} style={{ width: `${hp}%` }} />
          </div>
        </div>
        <div className="bg-[#1a2332] rounded px-3 py-2">
          <p className="text-[#556677] text-[10px] mb-0.5">Lifecycle</p>
          <p className="text-lg font-bold font-mono text-[#8899a6]">
            {progressPct}<span className="text-sm text-[#556677]">%</span>
          </p>
          <div className="mt-1 w-full bg-[#0b1120] rounded-full h-1">
            <div className="h-1 rounded-full bg-cyan-500/60 transition-all duration-500" style={{ width: `${progressPct}%` }} />
          </div>
          <p className="text-[#556677] text-[9px] mt-0.5">{machine.current_cycle}/{machine.total_cycles} cycles</p>
        </div>
      </div>
    </div>
  );
}
