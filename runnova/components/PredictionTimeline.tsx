"use client";

import { AlertTriangle, Clock, Zap, CheckCircle2 } from "lucide-react";
import type { MachineData } from "@/lib/mockData";

// ─────────────────────────────────────────────────────────────────────────────
// PredictionTimeline — Visual RUL / Failure-countdown component
//
// Shows a progress bar: NOW ──────────────── FAILURE
// Color grades from green → yellow → red as failure approaches.
// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  machine: MachineData;
}

function timelineColor(pct: number): string {
  if (pct > 60) return "#2dd4bf"; // teal
  if (pct > 30) return "#facc15"; // yellow
  return "#ef4444";               // red
}

function timelineBg(pct: number): string {
  if (pct > 60) return "bg-teal-400";
  if (pct > 30) return "bg-yellow-400";
  return "bg-red-400";
}

function urgencyLabel(pct: number): { label: string; color: string } {
  if (pct > 60) return { label: "Safe Operating Range", color: "text-teal-400" };
  if (pct > 30) return { label: "Approaching Maintenance Window", color: "text-yellow-400" };
  if (pct > 10) return { label: "Maintenance Required Soon", color: "text-red-400" };
  return { label: "Imminent Failure Risk", color: "text-red-400 animate-pulse" };
}

export default function PredictionTimeline({ machine }: Props) {
  const { rul } = machine.prediction;
  const { current_cycle, total_cycles } = machine;

  // % of lifecycle remaining
  const remaining = total_cycles - current_cycle;
  const pctRemaining = Math.max(0, Math.min(100, (remaining / total_cycles) * 100));
  // % of lifecycle consumed → how far the progress bar goes
  const pctConsumed = 100 - pctRemaining;

  const color = timelineColor(pctRemaining);
  const barClass = timelineBg(pctRemaining);
  const urgency = urgencyLabel(pctRemaining);

  // Milestones on timeline
  const milestones = [
    { pos: 0, label: "Start" },
    { pos: 50, label: "50%" },
    { pos: 75, label: "Warning" },
    { pos: 90, label: "Critical" },
    { pos: 100, label: "Failure" },
  ];

  return (
    <div className="bg-[#111827] border border-[#1e2d3d] rounded-lg p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan-400" />
          <h2 className="text-[#e2e8f0] font-semibold text-xs">Failure Prediction Timeline</h2>
        </div>
        <span className={`text-[10px] font-semibold ${urgency.color}`}>{urgency.label}</span>
      </div>

      {/* Big RUL countdown */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <div className="bg-[#1a2332] border border-[#1e2d3d] rounded-lg px-4 py-3 text-center">
            <p className="text-[#556677] text-[9px] uppercase tracking-wider mb-1">Remaining Useful Life</p>
            <p className="text-3xl font-bold font-mono" style={{ color }}>
              {rul}
              <span className="text-sm text-[#556677] ml-1">cycles</span>
            </p>
          </div>
        </div>
        <div className="flex-1 space-y-1.5">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-[#8899a6]">Lifecycle Progress</span>
            <span className="text-[#e2e8f0] font-mono">{current_cycle} / {total_cycles} cycles</span>
          </div>
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-[#8899a6]">Failure Expected In</span>
            <span className="font-semibold" style={{ color }}>
              {rul > 0 ? `~${rul} cycles` : "IMMINENT"}
            </span>
          </div>
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-[#8899a6]">Degradation Rate</span>
            <span className={machine.prediction.status === "Critical" ? "text-red-400 font-semibold" : machine.prediction.status === "Warning" ? "text-yellow-400" : "text-teal-400"}>
              {machine.prediction.status === "Critical" ? "Accelerating" : machine.prediction.status === "Warning" ? "Elevated" : "Stable"}
            </span>
          </div>
        </div>
      </div>

      {/* Timeline visual */}
      <div className="relative">
        {/* Track */}
        <div className="w-full bg-[#1a2332] rounded-full h-3 relative overflow-hidden">
          <div
            className={`h-3 rounded-full transition-all duration-1000 ease-linear ${barClass}`}
            style={{ width: `${pctConsumed}%` }}
          />
        </div>

        {/* Current position marker */}
        <div
          className="absolute top-0 -translate-x-1/2 flex flex-col items-center"
          style={{ left: `${pctConsumed}%` }}
        >
          <div
            className="w-4 h-4 rounded-full border-2 border-[#111827] -mt-0.5"
            style={{ backgroundColor: color }}
          />
        </div>

        {/* NOW / FAILURE labels */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-teal-400" />
            <span className="text-[10px] text-teal-400 font-semibold">START</span>
          </div>
          <div className="flex items-center gap-1">
            <Zap className="w-3 h-3 text-cyan-400" />
            <span className="text-[10px] text-cyan-400 font-mono">NOW ({current_cycle})</span>
          </div>
          <div className="flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-red-400" />
            <span className="text-[10px] text-red-400 font-semibold">FAILURE ({total_cycles})</span>
          </div>
        </div>

        {/* Milestone ticks */}
        <div className="relative h-3 mt-1">
          {milestones.map((ms) => (
            <div
              key={ms.label}
              className="absolute top-0 -translate-x-1/2 flex flex-col items-center"
              style={{ left: `${ms.pos}%` }}
            >
              <div className="w-px h-2 bg-[#1e2d3d]" />
              <span className="text-[8px] text-[#556677] mt-0.5">{ms.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Status summary pills */}
      <div className="flex items-center gap-2 mt-4 flex-wrap">
        {pctRemaining <= 10 && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-500/15 border border-red-500/30 rounded text-[10px] text-red-300 animate-pulse">
            <AlertTriangle className="w-3 h-3" />
            Failure expected in {rul} cycles — schedule emergency maintenance
          </div>
        )}
        {pctRemaining > 10 && pctRemaining <= 30 && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-yellow-500/15 border border-yellow-500/30 rounded text-[10px] text-yellow-300">
            <Clock className="w-3 h-3" />
            Plan maintenance within next {rul} cycles
          </div>
        )}
        {pctRemaining > 30 && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-teal-500/10 border border-teal-500/25 rounded text-[10px] text-teal-300">
            <CheckCircle2 className="w-3 h-3" />
            Machine within safe operating range
          </div>
        )}
      </div>
    </div>
  );
}
