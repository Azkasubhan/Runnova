"use client";

import { Wrench, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { useMachines } from "@/lib/MachineProvider";
import type { MachineData, MachineStatus } from "@/lib/mockData";

interface Task {
  machine_id: string;
  urgency: "Urgent" | "Soon" | "Routine";
  deadline: string;
  recommendations: string[];
  status: MachineStatus;
  health: number;
}

function buildTasks(machines: MachineData[]): Task[] {
  return machines
    .map((m): Task => ({
      machine_id: m.machine_id,
      urgency: m.prediction.status === "Critical" ? "Urgent" : m.prediction.status === "Warning" ? "Soon" : "Routine",
      deadline: m.prediction.status === "Critical" ? "Within 24 hours" : m.prediction.status === "Warning" ? "Within 2 weeks" : "Scheduled",
      recommendations: m.recommendation,
      status: m.prediction.status,
      health: m.prediction.health_score,
    }))
    .sort((a, b) => {
      const ord = { Urgent: 0, Soon: 1, Routine: 2 };
      return ord[a.urgency] - ord[b.urgency];
    });
}

const URGENCY_STYLE = {
  Urgent: { bg: "bg-red-500/8", border: "border-red-500/20", badge: "bg-red-500/20 text-red-300 border-red-500/30", icon: "text-red-400" },
  Soon: { bg: "bg-yellow-500/8", border: "border-yellow-500/20", badge: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30", icon: "text-yellow-400" },
  Routine: { bg: "bg-[#111827]", border: "border-[#1e2d3d]", badge: "bg-[#1a2332] text-[#8899a6] border-[#1e2d3d]", icon: "text-[#556677]" },
};

export default function MaintenancePage() {
  const { machines, isLoaded } = useMachines();
  if (!isLoaded) return null;

  const tasks = buildTasks(machines);
  const urgentCount = tasks.filter((t) => t.urgency === "Urgent").length;
  const soonCount = tasks.filter((t) => t.urgency === "Soon").length;

  return (
    <MainLayout title="Maintenance Schedule">
      <div className="p-4 space-y-4 h-full overflow-y-auto">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
            <p className="text-[#556677] text-[10px] uppercase">Urgent</p>
            <p className="text-2xl font-bold font-mono text-red-400 mt-1">{urgentCount}</p>
            <p className="text-[10px] text-red-300/70 mt-0.5">Requires immediate action</p>
          </div>
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-4 py-3">
            <p className="text-[#556677] text-[10px] uppercase">Soon</p>
            <p className="text-2xl font-bold font-mono text-yellow-400 mt-1">{soonCount}</p>
            <p className="text-[10px] text-yellow-300/70 mt-0.5">Schedule within 2 weeks</p>
          </div>
          <div className="bg-[#111827] border border-[#1e2d3d] rounded-lg px-4 py-3">
            <p className="text-[#556677] text-[10px] uppercase">Routine</p>
            <p className="text-2xl font-bold font-mono text-[#8899a6] mt-1">{tasks.length - urgentCount - soonCount}</p>
            <p className="text-[10px] text-[#556677] mt-0.5">Standard schedule</p>
          </div>
        </div>

        {/* Task list */}
        <div className="space-y-3">
          {tasks.map((task) => {
            const style = URGENCY_STYLE[task.urgency];
            return (
              <div key={task.machine_id} className={`${style.bg} border ${style.border} rounded-lg p-4`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <Wrench className={`w-4 h-4 ${style.icon}`} />
                    <span className="text-[#e2e8f0] text-sm font-bold">{task.machine_id}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${style.badge}`}>{task.urgency}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-[#556677]">
                    <Clock className="w-3 h-3" />
                    {task.deadline}
                  </div>
                </div>
                <div className="space-y-1.5">
                  {task.recommendations.map((rec, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-[#8899a6]">
                      <span className="text-[#556677] font-mono text-[10px] mt-0.5 flex-shrink-0">{String(i + 1).padStart(2, "0")}</span>
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </MainLayout>
  );
}
