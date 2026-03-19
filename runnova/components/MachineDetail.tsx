"use client";

import { ArrowLeft, Cpu, MapPin, Brain, Wrench, AlertCircle, CheckCircle2, TrendingDown, Activity, Thermometer, Gauge, Clock } from "lucide-react";
import Link from "next/link";
import type { MachineData, MachineStatus } from "@/lib/mockData";
import { getStatusBadgeClass, getStatusDotClass, getStatusTextColor, getHealthBarClass } from "@/lib/utils";
import SensorChart from "./SensorChart";
import PredictionTimeline from "./PredictionTimeline";
import HealthChart from "./HealthChart";
import SensorPanel from "./SensorPanel";

// ─────────────────────────────────────────────────────────────────────────────
// MachineDetail — Full deep-dive view for a single machine
//
// Sections:
//   1. Machine Overview (name, status, health, RUL, lifecycle)
//   2. Multi-Sensor History Charts
//   3. Failure Prediction Timeline
//   4. AI Insight (explainable anomaly reasons)
//   5. Maintenance Recommendations
// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  machine: MachineData;
}

// ── Explainable AI Insight Generator ──
interface InsightFactor {
  sensor: string;
  icon: React.ComponentType<{ className?: string }>;
  value: number;
  unit: string;
  warnThreshold: number;
  critThreshold: number;
  explanation: string;
  severity: "normal" | "warning" | "critical";
}

function generateInsights(machine: MachineData): InsightFactor[] {
  const { vibration, temperature, pressure } = machine.sensor_data;
  const factors: InsightFactor[] = [];

  const vibSev = vibration >= 8.5 ? "critical" : vibration >= 5 ? "warning" : "normal";
  factors.push({
    sensor: "Vibration",
    icon: Activity,
    value: vibration,
    unit: "mm/s",
    warnThreshold: 5.0,
    critThreshold: 8.5,
    explanation:
      vibSev === "critical"
        ? "Extreme vibration indicates severe bearing wear, shaft misalignment, or rotor imbalance. Immediate inspection required."
        : vibSev === "warning"
          ? "Elevated vibration suggests early-stage bearing degradation or minor imbalance. Schedule bearing inspection."
          : "Vibration within normal operating parameters. No corrective action needed.",
    severity: vibSev,
  });

  const tempSev = temperature >= 85 ? "critical" : temperature >= 75 ? "warning" : "normal";
  factors.push({
    sensor: "Temperature",
    icon: Thermometer,
    value: temperature,
    unit: "°C",
    warnThreshold: 75,
    critThreshold: 85,
    explanation:
      tempSev === "critical"
        ? "Dangerously high temperature — likely caused by excessive friction, lubricant breakdown, or cooling system failure."
        : tempSev === "warning"
          ? "Temperature trending upward — possible friction increase or reduced coolant flow. Monitor closely."
          : "Temperature stable within expected range.",
    severity: tempSev,
  });

  const presSev = pressure >= 48 ? "critical" : pressure >= 38 ? "warning" : "normal";
  factors.push({
    sensor: "Pressure",
    icon: Gauge,
    value: pressure,
    unit: "bar",
    warnThreshold: 38,
    critThreshold: 48,
    explanation:
      presSev === "critical"
        ? "Pressure exceeds safe limits — valve degradation, blockage, or seal failure suspected."
        : presSev === "warning"
          ? "Pressure fluctuation detected — possible early valve wear or developing air leak."
          : "Pressure readings nominal.",
    severity: presSev,
  });

  return factors;
}

const URGENCY: Record<MachineStatus, { badge: string; label: string; timeHint: string; timeColor: string }> = {
  Critical: { badge: "bg-red-500/20 text-red-300 border-red-500/30", label: "URGENT", timeHint: "Act within 24h", timeColor: "text-red-400" },
  Warning: { badge: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30", label: "Soon", timeHint: "Act within 2 weeks", timeColor: "text-yellow-400" },
  Healthy: { badge: "bg-[#1a2332] text-[#8899a6] border-[#1e2d3d]", label: "Routine", timeHint: "Scheduled maintenance", timeColor: "text-[#556677]" },
};

const SEVERITY_PALETTE = {
  normal: { text: "text-teal-400", bg: "bg-teal-500/10", border: "border-teal-500/25" },
  warning: { text: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/25" },
  critical: { text: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/25" },
};

export default function MachineDetail({ machine }: Props) {
  const hp = Math.round(machine.prediction.health_score * 100);
  const progressPct = Math.round((machine.current_cycle / machine.total_cycles) * 100);
  const insights = generateInsights(machine);
  const urgency = URGENCY[machine.prediction.status];
  const modelConfidence = 94.2;

  return (
    <div className="p-4 space-y-4 overflow-y-auto h-full">
      {/* Back navigation */}
      <Link
        href="/machines"
        className="inline-flex items-center gap-1.5 text-[#556677] hover:text-cyan-400 text-xs transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Machines
      </Link>

      {/* ─── SECTION 1: Machine Overview ─── */}
      <div className="bg-[#111827] border border-[#1e2d3d] rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h1 className="text-[#e2e8f0] font-bold text-lg">{machine.machine_id}</h1>
            <div className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-semibold border ${getStatusBadgeClass(machine.prediction.status)}`}>
              <div className={`w-2 h-2 rounded-full ${getStatusDotClass(machine.prediction.status)} ${machine.prediction.status !== "Healthy" ? "animate-pulse" : ""}`} />
              {machine.prediction.status}
            </div>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-[#556677]">
            <span className="flex items-center gap-1"><Cpu className="w-3.5 h-3.5" />{machine.machine_type}</span>
            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{machine.location}</span>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-[#1a2332] rounded-lg px-4 py-3">
            <p className="text-[#556677] text-[10px] uppercase tracking-wider mb-1">RUL</p>
            <p className={`text-3xl font-bold font-mono ${getStatusTextColor(machine.prediction.status)}`}>
              {machine.prediction.rul}
              <span className="text-sm text-[#556677] ml-1">cycles</span>
            </p>
          </div>
          <div className="bg-[#1a2332] rounded-lg px-4 py-3">
            <p className="text-[#556677] text-[10px] uppercase tracking-wider mb-1">Health Score</p>
            <p className={`text-3xl font-bold font-mono ${getStatusTextColor(machine.prediction.status)}`}>
              {hp}<span className="text-sm text-[#556677]">%</span>
            </p>
            <div className="mt-2 w-full bg-[#0b1120] rounded-full h-1.5">
              <div className={`h-1.5 rounded-full transition-all duration-500 ${getHealthBarClass(hp)}`} style={{ width: `${hp}%` }} />
            </div>
          </div>
          <div className="bg-[#1a2332] rounded-lg px-4 py-3">
            <p className="text-[#556677] text-[10px] uppercase tracking-wider mb-1">Lifecycle Progress</p>
            <p className="text-3xl font-bold font-mono text-[#8899a6]">
              {progressPct}<span className="text-sm text-[#556677]">%</span>
            </p>
            <div className="mt-2 w-full bg-[#0b1120] rounded-full h-1.5">
              <div className="h-1.5 rounded-full bg-cyan-500/60 transition-all duration-500" style={{ width: `${progressPct}%` }} />
            </div>
            <p className="text-[#556677] text-[9px] mt-1">{machine.current_cycle}/{machine.total_cycles} cycles</p>
          </div>
          <div className="bg-[#1a2332] rounded-lg px-4 py-3">
            <p className="text-[#556677] text-[10px] uppercase tracking-wider mb-1">Model Confidence</p>
            <p className="text-3xl font-bold font-mono text-cyan-400">
              {modelConfidence}<span className="text-sm text-[#556677]">%</span>
            </p>
            <div className="mt-2 w-full bg-[#0b1120] rounded-full h-1.5">
              <div className="h-1.5 rounded-full bg-cyan-500 transition-all" style={{ width: `${modelConfidence}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* ─── 2-column layout ─── */}
      <div className="grid grid-cols-12 gap-4">
        {/* Left column: Charts */}
        <div className="col-span-8 space-y-4">
          {/* ─── SECTION 2: Multi-Sensor Chart ─── */}
          <SensorChart machine={machine} />

          {/* ─── SECTION 3: Failure Prediction Timeline ─── */}
          <PredictionTimeline machine={machine} />

          {/* ─── Health Degradation Curve (existing) ─── */}
          <HealthChart machine={machine} />
        </div>

        {/* Right column: AI Insights + Recommendations */}
        <div className="col-span-4 space-y-4">
          {/* ─── SECTION 4: AI Insight (Explainable) ─── */}
          <div className="bg-[#111827] border border-[#1e2d3d] rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Brain className="w-4 h-4 text-cyan-400" />
              <h2 className="text-[#e2e8f0] font-semibold text-xs">AI Insight — Explainable Analysis</h2>
            </div>

            {/* Anomaly status */}
            {machine.anomaly.detected ? (
              <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/25 rounded-lg mb-3">
                <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-red-300 text-[11px] font-semibold">Anomaly Detected</p>
                  <p className="text-[#8899a6] text-[10px] leading-relaxed mt-0.5">{machine.anomaly.reason}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2 p-3 bg-teal-500/10 border border-teal-500/25 rounded-lg mb-3">
                <CheckCircle2 className="w-4 h-4 text-teal-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-teal-300 text-[11px] font-semibold">No Anomaly Detected</p>
                  <p className="text-[#8899a6] text-[10px]">All sensor readings within expected range.</p>
                </div>
              </div>
            )}

            {/* Per-sensor AI Explanation */}
            <div className="space-y-2">
              <p className="text-[#556677] text-[9px] uppercase tracking-wider font-semibold">Factor Analysis</p>
              {insights.map((factor) => {
                const pal = SEVERITY_PALETTE[factor.severity];
                const Icon = factor.icon;
                return (
                  <div key={factor.sensor} className={`${pal.bg} border ${pal.border} rounded-lg p-3`}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <Icon className={`w-3.5 h-3.5 ${pal.text}`} />
                        <span className={`text-[11px] font-semibold ${pal.text}`}>{factor.sensor}</span>
                      </div>
                      <span className={`text-[11px] font-mono font-bold ${pal.text}`}>
                        {factor.value.toFixed(1)} {factor.unit}
                      </span>
                    </div>
                    <p className="text-[#8899a6] text-[10px] leading-relaxed">{factor.explanation}</p>
                    {/* Threshold indicator */}
                    <div className="flex items-center gap-2 mt-1.5 text-[9px] text-[#556677]">
                      <span>Warn: {factor.warnThreshold} {factor.unit}</span>
                      <span>|</span>
                      <span>Crit: {factor.critThreshold} {factor.unit}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Degradation summary */}
            <div className="mt-3 bg-[#1a2332] rounded-lg px-3 py-2 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <TrendingDown className="w-3.5 h-3.5 text-[#556677]" />
                <span className="text-[#556677] text-[10px]">Degradation Pattern</span>
              </div>
              <span className={`text-[10px] font-semibold ${
                machine.prediction.status === "Critical" ? "text-red-400" : machine.prediction.status === "Warning" ? "text-yellow-400" : "text-teal-400"
              }`}>
                {machine.prediction.status === "Critical"
                  ? "Exponential (accelerating)"
                  : machine.prediction.status === "Warning"
                    ? "Linear (elevated)"
                    : "Logarithmic (stable)"}
              </span>
            </div>
          </div>

          {/* ─── SECTION 5: Maintenance Recommendations ─── */}
          <div className="bg-[#111827] border border-[#1e2d3d] rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-cyan-400" />
                <h2 className="text-[#e2e8f0] font-semibold text-xs">Maintenance Recommendations</h2>
              </div>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${urgency.badge}`}>
                {urgency.label}
              </span>
            </div>

            <div className="space-y-1.5">
              {machine.recommendation.map((rec, i) => (
                <div key={i} className="flex items-start gap-2 p-2.5 bg-[#1a2332] border border-[#1e2d3d] rounded-lg text-[10px]">
                  <span className="text-[#556677] font-mono flex-shrink-0 w-5">{String(i + 1).padStart(2, "0")}</span>
                  <p className="text-[#8899a6] leading-relaxed">{rec}</p>
                </div>
              ))}
            </div>

            <div className="mt-3 pt-3 border-t border-[#1e2d3d] flex items-center gap-1.5">
              <Clock className={`w-3.5 h-3.5 ${urgency.timeColor}`} />
              <span className={`text-[10px] ${urgency.timeColor}`}>{urgency.timeHint}</span>
            </div>
          </div>

          {/* ─── Sensor Readings (realtime) ─── */}
          <SensorPanel machine={machine} />
        </div>
      </div>
    </div>
  );
}
