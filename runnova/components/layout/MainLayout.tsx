"use client";

import { useState, type ReactNode } from "react";
import { Wifi, WifiOff, RefreshCw } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Chatbot from "@/components/Chatbot";
import { useMachines } from "@/lib/MachineProvider";

interface Props {
  title: string;
  children: ReactNode;
}

export default function MainLayout({ title, children }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const { machines, selectedId, isLive, lastUpdated, criticalCount } = useMachines();

  return (
    <div className="h-screen flex bg-[#0b1120] text-[#e2e8f0] overflow-hidden">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />

      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex-shrink-0 border-b border-[#1e2d3d] bg-[#111827] px-4 py-2 flex items-center justify-between">
          <span className="text-[#556677] text-[10px] uppercase tracking-widest font-medium">{title}</span>
          <div className="flex items-center gap-4 text-[10px]">
            {criticalCount > 0 && (
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-red-500/15 border border-red-500/30 rounded animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                <span className="text-red-300 font-semibold">{criticalCount} Critical</span>
              </div>
            )}
            {isLive ? (
              <div className="flex items-center gap-1 text-teal-400">
                <Wifi className="w-3 h-3" /><span className="font-medium">Live</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-red-400">
                <WifiOff className="w-3 h-3" /><span>Offline</span>
              </div>
            )}
            <div className="flex items-center gap-1 text-[#556677] hidden md:flex">
              <RefreshCw className="w-3 h-3" />
              <span>{lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          {children}
        </div>
      </div>

      <Chatbot machines={machines} selectedMachineId={selectedId} />
    </div>
  );
}
