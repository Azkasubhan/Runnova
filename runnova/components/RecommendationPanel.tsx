"use client";

import { Wrench, Clock } from "lucide-react";
import type { MachineData, MachineStatus } from "@/lib/mockData";

interface Props {
  machine: MachineData;
}

const URGENCY: Record<MachineStatus, { badge: string; label: string; timeHint: string; timeColor: string }> = {
  Critical: { badge: "bg-red-500/20 text-red-300 border-red-500/30", label: "URGENT", timeHint: "Act within 24h", timeColor: "text-red-400" },
  Warning: { badge: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30", label: "Soon", timeHint: "Act within 2 weeks", timeColor: "text-yellow-400" },
  Healthy: { badge: "bg-[#1a2332] text-[#8899a6] border-[#1e2d3d]", label: "Routine", timeHint: "Scheduled maintenance", timeColor: "text-[#556677]" },
};

export default function RecommendationPanel({ machine }: Props) {
  const urgency = URGENCY[machine.prediction.status];

  return (
    <div className="bg-[#111827] border border-[#1e2d3d] rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Wrench className="w-3.5 h-3.5 text-cyan-400" />
          <h2 className="text-[#e2e8f0] font-semibold text-xs">Maintenance</h2>
        </div>
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${urgency.badge}`}>{urgency.label}</span>
      </div>

      <div className="space-y-1">
        {machine.recommendation.map((rec, i) => (
          <div key={i} className="flex items-start gap-2 p-2 bg-[#1a2332] border border-[#1e2d3d] rounded text-[10px]">
            <span className="text-[#556677] font-mono flex-shrink-0">{String(i + 1).padStart(2, "0")}</span>
            <p className="text-[#8899a6] leading-snug">{rec}</p>
          </div>
        ))}
      </div>

      <div className="mt-2 pt-2 border-t border-[#1e2d3d] flex items-center gap-1.5">
        <Clock className={`w-3 h-3 ${urgency.timeColor}`} />
        <span className={`text-[10px] ${urgency.timeColor}`}>{urgency.timeHint}</span>
      </div>
    </div>
  );
}
