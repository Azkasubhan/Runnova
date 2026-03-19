"use client";

import { Brain, AlertCircle, CheckCircle2, TrendingDown } from "lucide-react";
import type { MachineData } from "@/lib/mockData";

interface Props {
  machine: MachineData;
}

export default function InsightPanel({ machine }: Props) {
  const { anomaly, prediction } = machine;
  const modelConfidence = 94.2;

  return (
    <div className="bg-[#111827] border border-[#1e2d3d] rounded-lg p-3">
      <div className="flex items-center gap-2 mb-2">
        <Brain className="w-3.5 h-3.5 text-cyan-400" />
        <h2 className="text-[#e2e8f0] font-semibold text-xs">Model Insight</h2>
      </div>

      {anomaly.detected ? (
        <div className="flex items-start gap-2 p-2 bg-red-500/10 border border-red-500/25 rounded">
          <AlertCircle className="w-3.5 h-3.5 text-red-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-red-300 text-[10px] font-semibold">Anomaly Detected</p>
            <p className="text-[#8899a6] text-[10px] leading-snug">{anomaly.reason}</p>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-2 p-2 bg-teal-500/10 border border-teal-500/25 rounded">
          <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-teal-300 text-[10px] font-semibold">No Anomaly</p>
            <p className="text-[#8899a6] text-[10px] leading-snug">All readings within expected range.</p>
          </div>
        </div>
      )}

      <div className="mt-2 grid grid-cols-2 gap-2">
        <div className="bg-[#1a2332] rounded px-2.5 py-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <TrendingDown className="w-3 h-3 text-[#556677]" />
            <span className="text-[#556677] text-[10px]">Degradation</span>
          </div>
          <span className={`text-[10px] font-semibold ${
            prediction.status === "Critical" ? "text-red-400" : prediction.status === "Warning" ? "text-yellow-400" : "text-teal-400"
          }`}>
            {prediction.status === "Critical" ? "Accelerating" : prediction.status === "Warning" ? "Elevated" : "Stable"}
          </span>
        </div>

        <div className="bg-[#1a2332] rounded px-2.5 py-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[#556677] text-[10px]">Confidence</span>
            <span className="text-cyan-300 text-[10px] font-mono font-semibold">{modelConfidence}%</span>
          </div>
          <div className="w-full bg-[#0b1120] rounded-full h-1">
            <div className="h-1 rounded-full bg-cyan-500 transition-all" style={{ width: `${modelConfidence}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}
