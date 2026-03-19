"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Plus, Cpu, MapPin, ArrowRight } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { useMachines } from "@/lib/MachineProvider";
import { getStatusBadgeClass, getStatusDotClass, getHealthBarClass } from "@/lib/utils";
import type { MachineStatus as MStatus } from "@/lib/mockData";

export default function MachinesPage() {
  const { machines, isLoaded } = useMachines();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<MStatus | "All">("All");

  if (!isLoaded) return null;

  const filtered = machines.filter((m) => {
    const matchSearch = m.machine_id.toLowerCase().includes(search.toLowerCase()) ||
      m.machine_type.toLowerCase().includes(search.toLowerCase()) ||
      m.location.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "All" || m.prediction.status === filter;
    return matchSearch && matchFilter;
  });

  const statuses: ("All" | MStatus)[] = ["All", "Healthy", "Warning", "Critical"];

  return (
    <MainLayout title="Machine Management">
      <div className="p-4 space-y-4 h-full">
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#556677]" />
              <input
                type="text"
                placeholder="Search machines..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#111827] border border-[#1e2d3d] rounded-md pl-8 pr-3 py-1.5 text-xs text-[#e2e8f0] placeholder-[#556677] outline-none focus:border-cyan-500/40"
              />
            </div>
            {/* Filter */}
            <div className="flex items-center gap-1">
              {statuses.map((s) => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={`px-2.5 py-1 rounded text-[10px] font-semibold border transition-colors ${
                    filter === s
                      ? "bg-cyan-500/15 border-cyan-500/30 text-cyan-400"
                      : "bg-[#111827] border-[#1e2d3d] text-[#556677] hover:text-[#8899a6]"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium rounded-md transition-colors">
            <Plus className="w-3.5 h-3.5" /> Add Machine
          </button>
        </div>

        {/* Machine grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {filtered.map((m) => {
            const hp = Math.round(m.prediction.health_score * 100);
            return (
              <Link href={`/machines/${m.machine_id}`} key={m.machine_id} className="bg-[#111827] border border-[#1e2d3d] rounded-lg p-4 hover:border-cyan-500/30 transition-colors block group">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-[#e2e8f0] font-bold text-sm">{m.machine_id}</h3>
                    <div className="flex items-center gap-1.5 mt-1 text-[10px] text-[#556677]">
                      <Cpu className="w-3 h-3" />{m.machine_type}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-[#556677]">
                      <MapPin className="w-3 h-3" />{m.location}
                    </div>
                  </div>
                  <div className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold border ${getStatusBadgeClass(m.prediction.status)}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${getStatusDotClass(m.prediction.status)}`} />
                    {m.prediction.status}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-3">
                  <div className="bg-[#1a2332] rounded px-2 py-1.5">
                    <p className="text-[#556677] text-[9px] uppercase">Health</p>
                    <p className="text-sm font-bold font-mono text-[#e2e8f0]">{hp}%</p>
                    <div className="mt-1 w-full bg-[#0b1120] rounded-full h-1">
                      <div className={`h-1 rounded-full ${getHealthBarClass(hp)}`} style={{ width: `${hp}%` }} />
                    </div>
                  </div>
                  <div className="bg-[#1a2332] rounded px-2 py-1.5">
                    <p className="text-[#556677] text-[9px] uppercase">RUL</p>
                    <p className="text-sm font-bold font-mono text-[#e2e8f0]">{m.prediction.rul}<span className="text-[9px] text-[#556677] ml-0.5">cyc</span></p>
                  </div>
                  <div className="bg-[#1a2332] rounded px-2 py-1.5">
                    <p className="text-[#556677] text-[9px] uppercase">Cycle</p>
                    <p className="text-sm font-bold font-mono text-[#e2e8f0]">{m.current_cycle}<span className="text-[9px] text-[#556677]">/{m.total_cycles}</span></p>
                  </div>
                </div>

                {m.anomaly.detected && (
                  <div className="mt-2 px-2 py-1.5 bg-red-500/10 border border-red-500/20 rounded text-[10px] text-red-300">
                    ⚠ {m.anomaly.reason}
                  </div>
                )}

                <div className="mt-3 pt-2 border-t border-[#1e2d3d] flex items-center justify-between">
                  <span className="text-[10px] text-[#556677]">View details</span>
                  <ArrowRight className="w-3 h-3 text-[#556677] group-hover:text-cyan-400 transition-colors" />
                </div>
              </Link>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-[#556677] text-xs">No machines match your filters.</div>
        )}
      </div>
    </MainLayout>
  );
}
