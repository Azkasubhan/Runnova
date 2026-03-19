"use client";

import { useState } from "react";
import { AlertCircle, AlertTriangle, Clock } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { useMachines } from "@/lib/MachineProvider";
import type { MachineData, MachineStatus } from "@/lib/mockData";

interface Alert {
  id: string;
  machine_id: string;
  severity: "Critical" | "Warning";
  message: string;
  timestamp: string;
  machine_type: string;
}

function generateAlerts(machines: MachineData[]): Alert[] {
  const alerts: Alert[] = [];
  const now = Date.now();

  for (const m of machines) {
    if (m.prediction.status === "Critical") {
      alerts.push({
        id: `${m.machine_id}-crit`,
        machine_id: m.machine_id,
        severity: "Critical",
        message: m.anomaly.reason ?? `${m.machine_id} has critically low health (${Math.round(m.prediction.health_score * 100)}%). Immediate action required.`,
        timestamp: new Date(now - Math.random() * 3600000).toISOString(),
        machine_type: m.machine_type,
      });
    }
    if (m.prediction.status === "Warning") {
      alerts.push({
        id: `${m.machine_id}-warn`,
        machine_id: m.machine_id,
        severity: "Warning",
        message: m.anomaly.reason ?? `${m.machine_id} showing early degradation signs. RUL: ${m.prediction.rul} cycles.`,
        timestamp: new Date(now - Math.random() * 7200000).toISOString(),
        machine_type: m.machine_type,
      });
    }
    // sensor-based alerts
    if (m.sensor_data.vibration > 7) {
      alerts.push({
        id: `${m.machine_id}-vib`,
        machine_id: m.machine_id,
        severity: m.sensor_data.vibration > 8.5 ? "Critical" : "Warning",
        message: `High vibration detected: ${m.sensor_data.vibration.toFixed(1)} mm/s (threshold: 5.0 mm/s)`,
        timestamp: new Date(now - Math.random() * 1800000).toISOString(),
        machine_type: m.machine_type,
      });
    }
    if (m.sensor_data.temperature > 80) {
      alerts.push({
        id: `${m.machine_id}-temp`,
        machine_id: m.machine_id,
        severity: m.sensor_data.temperature > 85 ? "Critical" : "Warning",
        message: `High temperature: ${m.sensor_data.temperature.toFixed(1)}°C (threshold: 75°C)`,
        timestamp: new Date(now - Math.random() * 2400000).toISOString(),
        machine_type: m.machine_type,
      });
    }
  }

  return alerts.sort((a, b) => {
    if (a.severity === "Critical" && b.severity !== "Critical") return -1;
    if (b.severity === "Critical" && a.severity !== "Critical") return 1;
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });
}

export default function AlertsPage() {
  const { machines, isLoaded } = useMachines();
  const [filter, setFilter] = useState<"All" | "Critical" | "Warning">("All");

  if (!isLoaded) return null;

  const allAlerts = generateAlerts(machines);
  const filtered = filter === "All" ? allAlerts : allAlerts.filter((a) => a.severity === filter);

  return (
    <MainLayout title="Alerts & Anomalies">
      <div className="p-4 space-y-4 h-full overflow-y-auto">
        {/* Summary */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-xs">
              <AlertCircle className="w-3.5 h-3.5 text-red-400" />
              <span className="text-red-400 font-semibold">{allAlerts.filter((a) => a.severity === "Critical").length} Critical</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <AlertTriangle className="w-3.5 h-3.5 text-yellow-400" />
              <span className="text-yellow-400 font-semibold">{allAlerts.filter((a) => a.severity === "Warning").length} Warning</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {(["All", "Critical", "Warning"] as const).map((s) => (
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

        {/* Alert timeline */}
        <div className="space-y-2">
          {filtered.map((alert) => (
            <div
              key={alert.id}
              className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                alert.severity === "Critical"
                  ? "bg-red-500/5 border-red-500/20"
                  : "bg-yellow-500/5 border-yellow-500/20"
              }`}
            >
              {alert.severity === "Critical" ? (
                <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-bold ${alert.severity === "Critical" ? "text-red-400" : "text-yellow-400"}`}>
                    {alert.severity}
                  </span>
                  <span className="text-[#e2e8f0] text-xs font-semibold">{alert.machine_id}</span>
                  <span className="text-[#556677] text-[10px]">{alert.machine_type}</span>
                </div>
                <p className="text-[#8899a6] text-xs leading-relaxed">{alert.message}</p>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-[#556677] flex-shrink-0">
                <Clock className="w-3 h-3" />
                {new Date(alert.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-[#556677] text-xs">No alerts match your filter.</div>
        )}
      </div>
    </MainLayout>
  );
}
