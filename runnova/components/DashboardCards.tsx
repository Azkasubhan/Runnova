"use client";

import { Activity, AlertTriangle, Clock, DollarSign, TrendingDown, TrendingUp } from "lucide-react";
import type { MachineData } from "@/lib/mockData";

interface Props {
  machines: MachineData[];
}

export default function DashboardCards({ machines }: Props) {
  const total = machines.length;
  const healthyCount = machines.filter((m) => m.prediction.status === "Healthy").length;
  const alertCount = machines.filter((m) => m.prediction.status !== "Healthy").length;
  const criticalCount = machines.filter((m) => m.prediction.status === "Critical").length;
  const downtimeAvoided = machines
    .filter((m) => m.prediction.status !== "Healthy")
    .reduce((acc, m) => acc + Math.round(m.prediction.rul * 0.4), 0);
  const costSaved = downtimeAvoided * 1800;

  const cards = [
    {
      label: "Machines Monitored",
      value: String(total),
      change: `${healthyCount} operational`,
      trend: "up" as const,
      icon: Activity,
      accentColor: "text-cyan-400",
      accentBg: "bg-cyan-500/10",
    },
    {
      label: "Active Alerts",
      value: String(alertCount),
      change: `${criticalCount} critical`,
      trend: alertCount > 0 ? ("down" as const) : ("up" as const),
      icon: AlertTriangle,
      accentColor: alertCount > 0 ? "text-red-400" : "text-teal-400",
      accentBg: alertCount > 0 ? "bg-red-500/10" : "bg-teal-500/10",
    },
    {
      label: "Downtime Avoided",
      value: `${downtimeAvoided}h`,
      change: "this period",
      trend: "up" as const,
      icon: Clock,
      accentColor: "text-teal-400",
      accentBg: "bg-teal-500/10",
    },
    {
      label: "Cost Savings",
      value: `$${costSaved.toLocaleString()}`,
      change: "vs. reactive maint.",
      trend: "up" as const,
      icon: DollarSign,
      accentColor: "text-teal-400",
      accentBg: "bg-teal-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-3">
      {cards.map((card) => (
        <div key={card.label} className="bg-[#111827] border border-[#1e2d3d] rounded-lg px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[#8899a6] text-[11px] font-medium uppercase tracking-wider">{card.label}</span>
            <card.icon className={`w-3.5 h-3.5 ${card.accentColor} opacity-60`} />
          </div>
          <p className={`text-xl font-bold font-mono tracking-tight ${card.accentColor}`}>{card.value}</p>
          <div className="flex items-center gap-1 mt-1">
            {card.trend === "up" ? (
              <TrendingUp className="w-3 h-3 text-teal-500" />
            ) : (
              <TrendingDown className="w-3 h-3 text-red-500" />
            )}
            <span className="text-[#556677] text-[10px]">{card.change}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
