// ─────────────────────────────────────────────────────────────────────────────
// mockData.ts — Realistic CMAPSS-inspired mock data for Runnova
// ─────────────────────────────────────────────────────────────────────────────

export type MachineStatus = "Healthy" | "Warning" | "Critical";

export interface SensorData {
  vibration: number;
  temperature: number;
  pressure: number;
}

export interface HistoryPoint {
  time: number;
  health: number;
  anomaly?: boolean;
}

export interface Prediction {
  rul: number;
  health_score: number;
  status: MachineStatus;
}

export interface AnomalyInfo {
  detected: boolean;
  reason: string | null;
}

export interface MachineData {
  machine_id: string;
  machine_type: string;
  location: string;
  timestamp: string;
  current_cycle: number;
  total_cycles: number;
  sensor_data: SensorData;
  prediction: Prediction;
  anomaly: AnomalyInfo;
  recommendation: string[];
  history: HistoryPoint[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Exponential degradation: health(t) = exp(-k * (t/T)^1.4) + noise
// ─────────────────────────────────────────────────────────────────────────────
function generateHistory(
  currentCycle: number,
  totalCycles: number,
  degradationRate: number,
  anomalyPoints: number[] = [],
): HistoryPoint[] {
  const history: HistoryPoint[] = [];
  for (let t = 0; t <= currentCycle; t++) {
    const norm = t / totalCycles;
    const base = Math.exp(-degradationRate * Math.pow(norm, 1.4));
    const noise = 0.018 * Math.sin(t * 0.9) + 0.009 * Math.cos(t * 2.3);
    const health = Math.max(0.02, Math.min(1.0, base + noise));
    history.push({
      time: t,
      health: parseFloat(health.toFixed(3)),
      anomaly: anomalyPoints.includes(t),
    });
  }
  return history;
}

// ─────────────────────────────────────────────────────────────────────────────
// Fleet: 6 machines at various degradation stages
// ─────────────────────────────────────────────────────────────────────────────
export const INITIAL_MACHINES: MachineData[] = [
  {
    machine_id: "Motor_1",
    machine_type: "Industrial Motor",
    location: "Zone A — Building 1",
    timestamp: new Date().toISOString(),
    current_cycle: 82,
    total_cycles: 200,
    sensor_data: { vibration: 3.2, temperature: 62.1, pressure: 28.5 },
    prediction: { rul: 118, health_score: 0.802, status: "Healthy" },
    anomaly: { detected: false, reason: null },
    recommendation: [
      "All parameters within nominal range.",
      "Schedule routine vibration inspection in 30 days.",
      "Next planned maintenance: 90 days.",
    ],
    history: generateHistory(82, 200, 0.7),
  },
  {
    machine_id: "Motor_2",
    machine_type: "Industrial Motor",
    location: "Zone A — Building 2",
    timestamp: new Date().toISOString(),
    current_cycle: 155,
    total_cycles: 200,
    sensor_data: { vibration: 6.4, temperature: 79.3, pressure: 38.2 },
    prediction: { rul: 45, health_score: 0.515, status: "Warning" },
    anomaly: {
      detected: true,
      reason:
        "Elevated vibration — bearing wear suspected. RUL declining faster than baseline.",
    },
    recommendation: [
      "Inspect bearing condition within 1 week.",
      "Check and replenish lubrication levels.",
      "Schedule bearing replacement within 2 weeks.",
      "Increase monitoring frequency to every 6 hours.",
    ],
    history: generateHistory(155, 200, 0.9, [130, 148, 152]),
  },
  {
    machine_id: "Motor_3",
    machine_type: "Processing Motor",
    location: "Zone B — Production Line",
    timestamp: new Date().toISOString(),
    current_cycle: 188,
    total_cycles: 200,
    sensor_data: { vibration: 9.1, temperature: 85.3, pressure: 30.2 },
    prediction: { rul: 8, health_score: 0.182, status: "Critical" },
    anomaly: {
      detected: true,
      reason:
        "Abnormal vibration increase detected (9.1 mm/s). Imminent functional failure predicted within 8 cycles.",
    },
    recommendation: [
      "URGENT: Schedule emergency maintenance immediately.",
      "Inspect and replace worn bearings.",
      "Verify shaft alignment and coupling integrity.",
      "Check lubrication system for contamination.",
      "Consider controlled shutdown to prevent catastrophic failure.",
    ],
    history: generateHistory(188, 200, 1.9, [165, 172, 178, 183, 186]),
  },
  {
    machine_id: "Pump_1",
    machine_type: "Hydraulic Pump",
    location: "Zone C — Water Treatment",
    timestamp: new Date().toISOString(),
    current_cycle: 55,
    total_cycles: 250,
    sensor_data: { vibration: 2.1, temperature: 58.4, pressure: 27.1 },
    prediction: { rul: 195, health_score: 0.892, status: "Healthy" },
    anomaly: { detected: false, reason: null },
    recommendation: [
      "Machine operating within optimal parameters.",
      "Continue standard monitoring protocol.",
      "Next scheduled maintenance: 60 days.",
    ],
    history: generateHistory(55, 250, 0.8),
  },
  {
    machine_id: "Compressor_1",
    machine_type: "Air Compressor",
    location: "Zone D — Assembly",
    timestamp: new Date().toISOString(),
    current_cycle: 167,
    total_cycles: 200,
    sensor_data: { vibration: 7.8, temperature: 83.6, pressure: 44.1 },
    prediction: { rul: 28, health_score: 0.38, status: "Warning" },
    anomaly: {
      detected: true,
      reason:
        "Pressure fluctuation detected (44.1 bar). Valve degradation or air leak suspected.",
    },
    recommendation: [
      "Inspect pressure relief valves for wear.",
      "Check for air leaks across the system.",
      "Replace main filter element.",
      "Reduce load by 15% until maintenance is completed.",
    ],
    history: generateHistory(167, 200, 1.2, [145, 158, 163]),
  },
  {
    machine_id: "Generator_1",
    machine_type: "Power Generator",
    location: "Zone E — Power Room",
    timestamp: new Date().toISOString(),
    current_cycle: 40,
    total_cycles: 180,
    sensor_data: { vibration: 1.8, temperature: 55.2, pressure: 26.3 },
    prediction: { rul: 140, health_score: 0.917, status: "Healthy" },
    anomaly: { detected: false, reason: null },
    recommendation: [
      "All systems nominal.",
      "Continue standard monitoring protocol.",
      "Annual maintenance checkpoint in 100 cycles.",
    ],
    history: generateHistory(40, 180, 0.6),
  },
];

export function getMachines(): MachineData[] {
  return INITIAL_MACHINES.map((m) => ({
    ...m,
    timestamp: new Date().toISOString(),
  }));
}
