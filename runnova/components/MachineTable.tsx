"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import type { MachineData } from "@/lib/mockData";
import { getStatusDotClass, getStatusBadgeClass } from "@/lib/utils";

interface Props {
  machines: MachineData[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export default function MachineTable({ machines, selectedId, onSelect }: Props) {
  return (
    <div className="bg-[#111827] border border-[#1e2d3d] rounded-lg overflow-hidden flex flex-col h-full">
      <div className="px-3 py-2.5 border-b border-[#1e2d3d] flex items-center justify-between">
        <span className="text-[#8899a6] text-[11px] font-medium uppercase tracking-wider">Machine Fleet</span>
        <span className="text-[#556677] text-[10px]">{machines.length} units</span>
      </div>

      <div className="flex-1 overflow-y-auto">
        {machines.map((machine) => {
          const isSelected = selectedId === machine.machine_id;
          const hp = Math.round(machine.prediction.health_score * 100);
          return (
            <button
              key={machine.machine_id}
              onClick={() => onSelect(machine.machine_id)}
              className={`w-full px-3 py-2 flex items-center gap-2.5 text-left border-b border-[#1e2d3d]/50 transition-colors ${
                isSelected ? "bg-[#1a2332] border-l-2 border-l-cyan-500" : "hover:bg-[#1a2332]/50 border-l-2 border-l-transparent"
              }`}
            >
              <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${getStatusDotClass(machine.prediction.status)} ${
                machine.prediction.status === "Critical" ? "animate-pulse" : ""
              }`} />

              <div className="flex-1 min-w-0">
                <p className="text-[#e2e8f0] text-xs font-medium truncate">{machine.machine_id}</p>
                <p className="text-[#556677] text-[10px] truncate">{machine.machine_type}</p>
              </div>

              <div className={`flex-shrink-0 px-1.5 py-0.5 rounded text-[10px] font-medium border ${getStatusBadgeClass(machine.prediction.status)}`}>
                {machine.prediction.status}
              </div>

              <div className="w-12 flex-shrink-0">
                <div className="flex items-center justify-between text-[10px] mb-0.5">
                  <span className="text-[#556677]">RUL</span>
                  <span className="text-[#8899a6] font-mono">{machine.prediction.rul}</span>
                </div>
                <div className="w-full bg-[#1a2332] rounded-full h-1">
                  <div
                    className={`h-1 rounded-full transition-all ${hp > 70 ? "bg-teal-400" : hp > 35 ? "bg-yellow-400" : "bg-red-400"}`}
                    style={{ width: `${hp}%` }}
                  />
                </div>
              </div>

              <Link
                href={`/machines/${machine.machine_id}`}
                onClick={(e) => e.stopPropagation()}
                className="flex-shrink-0 p-1 text-[#556677] hover:text-cyan-400 transition-colors"
                title="View details"
              >
                <ExternalLink className="w-3 h-3" />
              </Link>
            </button>
          );
        })}
      </div>
    </div>
  );
}
