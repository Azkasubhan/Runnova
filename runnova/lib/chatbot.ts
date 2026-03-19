import type { MachineData } from "./mockData";

export interface ChatEntry {
  role: "user" | "bot";
  text: string;
}

/**
 * Rule-based chatbot that can reference live machine data.
 * Designed for easy replacement with an API call later:
 *   export async function getBotResponse(msg, machines, selectedId) { ... }
 */
export function getBotResponse(
  message: string,
  machines: MachineData[],
  selectedMachineId: string,
): string {
  const msg = message.toLowerCase().trim();
  const selected = machines.find((m) => m.machine_id === selectedMachineId);

  // Try to find a machine mentioned by name
  const mentioned = machines.find((m) =>
    msg.includes(m.machine_id.toLowerCase()),
  );
  const target = mentioned ?? selected;

  if (!target)
    return "No machine data available yet. Please wait for the sensor pipeline to initialize.";

  // ── Status / why critical ──
  if (
    msg.includes("why") &&
    (msg.includes("critical") ||
      msg.includes("warning") ||
      msg.includes("status"))
  ) {
    if (target.prediction.status === "Critical") {
      return `${target.machine_id} is CRITICAL — health score ${(target.prediction.health_score * 100).toFixed(0)}%, RUL only ${target.prediction.rul} cycles remaining. ${target.anomaly.reason ?? "Accelerated degradation detected."}`;
    }
    if (target.prediction.status === "Warning") {
      return `${target.machine_id} is in WARNING state — health score ${(target.prediction.health_score * 100).toFixed(0)}%, RUL ${target.prediction.rul} cycles. ${target.anomaly.reason ?? "Elevated wear detected."}`;
    }
    return `${target.machine_id} is Healthy — health score ${(target.prediction.health_score * 100).toFixed(0)}%, RUL ${target.prediction.rul} cycles. All parameters within normal range.`;
  }

  // ── RUL ──
  if (
    msg.includes("rul") ||
    msg.includes("remaining useful life") ||
    msg.includes("how long") ||
    msg.includes("berapa lama")
  ) {
    return `${target.machine_id} has an estimated RUL of ${target.prediction.rul} cycles (health: ${(target.prediction.health_score * 100).toFixed(0)}%).`;
  }

  // ── Recommendation / what to do ──
  if (
    msg.includes("recommend") ||
    msg.includes("what should") ||
    msg.includes("what to do") ||
    msg.includes("apa yang harus")
  ) {
    return target.recommendation.map((r, i) => `${i + 1}. ${r}`).join("\n");
  }

  // ── Sensor data ──
  if (
    msg.includes("sensor") ||
    msg.includes("vibration") ||
    msg.includes("temperature") ||
    msg.includes("pressure")
  ) {
    const s = target.sensor_data;
    return `${target.machine_id} sensors — Vibration: ${s.vibration.toFixed(1)} mm/s | Temperature: ${s.temperature.toFixed(1)}°C | Pressure: ${s.pressure.toFixed(1)} bar`;
  }

  // ── Anomaly ──
  if (msg.includes("anomaly") || msg.includes("anomali")) {
    if (target.anomaly.detected) {
      return `Anomaly detected on ${target.machine_id}: ${target.anomaly.reason}`;
    }
    return `No anomaly detected on ${target.machine_id}. All readings within expected range.`;
  }

  // ── Health ──
  if (msg.includes("health") || msg.includes("kesehatan")) {
    return `${target.machine_id} — Health Score: ${(target.prediction.health_score * 100).toFixed(0)}% | Status: ${target.prediction.status} | Lifecycle: ${target.current_cycle}/${target.total_cycles} cycles`;
  }

  // ── Fleet overview ──
  if (
    msg.includes("fleet") ||
    msg.includes("overview") ||
    msg.includes("semua mesin") ||
    msg.includes("all machine")
  ) {
    const critical = machines.filter(
      (m) => m.prediction.status === "Critical",
    ).length;
    const warning = machines.filter(
      (m) => m.prediction.status === "Warning",
    ).length;
    const healthy = machines.filter(
      (m) => m.prediction.status === "Healthy",
    ).length;
    return `Fleet overview — ${machines.length} machines total: ${critical} Critical, ${warning} Warning, ${healthy} Healthy.`;
  }

  // ── Help ──
  if (msg.includes("help") || msg.includes("bantuan") || msg === "?") {
    return 'You can ask me:\n• "Why is [machine] critical?"\n• "What is the RUL?"\n• "Show sensor data"\n• "What should I do?"\n• "Fleet overview"\n• "Show anomaly"';
  }

  // ── Fallback ──
  return `I can help with predictive maintenance insights for ${target.machine_id}. Try asking about RUL, sensor data, anomalies, or recommendations. Type "help" for options.`;
}
