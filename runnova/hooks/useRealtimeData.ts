"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { MachineData, SensorData, HistoryPoint } from "@/lib/mockData";

// ─────────────────────────────────────────────────────────────────────────────
// Real-time simulation hook
//
// Applies small random fluctuations to sensors, degrades health/RUL,
// and appends new history points. Designed to be replaceable with a
// WebSocket or SSE connection to a real backend.
// ─────────────────────────────────────────────────────────────────────────────

const TICK_MS = 2500; // simulation interval

/** Small bounded random in [-range, +range] */
function jitter(range: number): number {
  return (Math.random() - 0.5) * 2 * range;
}

/** Clamp value between min and max */
function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

/** Degrade rate varies by status */
function degradeMultiplier(status: string): number {
  if (status === "Critical") return 2.5;
  if (status === "Warning") return 1.4;
  return 0.6;
}

function tickMachine(m: MachineData): MachineData {
  const mult = degradeMultiplier(m.prediction.status);

  // ── Sensor perturbation ──
  const newSensors: SensorData = {
    vibration: parseFloat(clamp(m.sensor_data.vibration + jitter(0.3) * mult, 0.5, 15).toFixed(1)),
    temperature: parseFloat(clamp(m.sensor_data.temperature + jitter(0.6) * mult, 30, 110).toFixed(1)),
    pressure: parseFloat(clamp(m.sensor_data.pressure + jitter(0.4) * mult, 15, 55).toFixed(1)),
  };

  // ── Health degradation (tiny per tick, faster when critical) ──
  const healthDrop = (0.001 + Math.random() * 0.002) * mult;
  const newHealth = parseFloat(clamp(m.prediction.health_score - healthDrop, 0.02, 1).toFixed(3));

  // ── RUL countdown (occasionally decrement) ──
  const rulDrop = Math.random() < 0.3 * mult ? 1 : 0;
  const newRul = Math.max(0, m.prediction.rul - rulDrop);

  // ── Cycle progress ──
  const newCycle = Math.min(m.total_cycles, m.current_cycle + (Math.random() < 0.25 ? 1 : 0));

  // ── Status recalculation ──
  let newStatus = m.prediction.status;
  if (newHealth < 0.25) newStatus = "Critical";
  else if (newHealth < 0.5) newStatus = "Warning";
  else newStatus = "Healthy";

  // ── Anomaly detection (sensor threshold-based) ──
  const anomalyReasons: string[] = [];
  if (newSensors.vibration > 8.5) anomalyReasons.push(`High vibration (${newSensors.vibration} mm/s) — bearing wear suspected`);
  if (newSensors.temperature > 85) anomalyReasons.push(`Elevated temperature (${newSensors.temperature}°C) — friction or cooling issue`);
  if (newSensors.pressure > 45) anomalyReasons.push(`Pressure spike (${newSensors.pressure} bar) — valve degradation possible`);
  if (newHealth < 0.25) anomalyReasons.push(`Critical health level (${(newHealth * 100).toFixed(0)}%) — imminent failure risk`);

  const anomalyDetected = anomalyReasons.length > 0;

  // ── New history point ──
  const lastTime = m.history.length > 0 ? m.history[m.history.length - 1].time : 0;
  const newPoint: HistoryPoint = {
    time: lastTime + 1,
    health: newHealth,
    anomaly: anomalyDetected && Math.random() < 0.3,
  };

  return {
    ...m,
    timestamp: new Date().toISOString(),
    current_cycle: newCycle,
    sensor_data: newSensors,
    prediction: {
      rul: newRul,
      health_score: newHealth,
      status: newStatus,
    },
    anomaly: {
      detected: anomalyDetected,
      reason: anomalyDetected ? anomalyReasons.join(". ") : null,
    },
    history: [...m.history, newPoint],
  };
}

/**
 * useRealtimeData — takes an initial array of machines and returns
 * a continuously-updating copy with simulated real-time data.
 */
export function useRealtimeData(initial: MachineData[]) {
  const [machines, setMachines] = useState<MachineData[]>(initial);
  const latestRef = useRef(machines);
  latestRef.current = machines;

  // Reset when initial data changes (e.g., from provider)
  useEffect(() => {
    if (initial.length > 0 && latestRef.current.length === 0) {
      setMachines(initial);
    }
  }, [initial]);

  const tick = useCallback(() => {
    setMachines((prev) => prev.map(tickMachine));
  }, []);

  useEffect(() => {
    const id = setInterval(tick, TICK_MS);
    return () => clearInterval(id);
  }, [tick]);

  return machines;
}

/**
 * useRealtimeMachine — convenience wrapper for single machine
 */
export function useRealtimeMachine(initial: MachineData | null) {
  const [machine, setMachine] = useState<MachineData | null>(initial);

  useEffect(() => {
    if (initial) setMachine(initial);
  }, [initial]);

  useEffect(() => {
    if (!machine) return;
    const id = setInterval(() => {
      setMachine((prev) => (prev ? tickMachine(prev) : null));
    }, TICK_MS);
    return () => clearInterval(id);
  }, [machine?.machine_id]); // eslint-disable-line react-hooks/exhaustive-deps

  return machine;
}
