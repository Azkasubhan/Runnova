// ─────────────────────────────────────────────────────────────────────────────
// api.ts — API abstraction layer for Runnova
//
// All components fetch data exclusively through this module.
// To connect a real FastAPI/WebSocket backend, only this file needs changes.
// ─────────────────────────────────────────────────────────────────────────────

import { getMachines, type MachineData } from "./mockData";

let _tick = 0;

function perturbSensors(machine: MachineData, tick: number): MachineData {
  const phase = machine.machine_id
    .split("")
    .reduce((acc, c) => acc + c.charCodeAt(0), 0);

  const vibDelta = Math.sin(tick * 0.31 + phase * 0.07) * 0.25;
  const tempDelta = Math.cos(tick * 0.19 + phase * 0.11) * 0.7;
  const presDelta = Math.sin(tick * 0.23 + phase * 0.09) * 0.35;

  return {
    ...machine,
    timestamp: new Date().toISOString(),
    sensor_data: {
      vibration: parseFloat(
        Math.max(0, machine.sensor_data.vibration + vibDelta).toFixed(1),
      ),
      temperature: parseFloat(
        Math.max(0, machine.sensor_data.temperature + tempDelta).toFixed(1),
      ),
      pressure: parseFloat(
        Math.max(0, machine.sensor_data.pressure + presDelta).toFixed(1),
      ),
    },
  };
}

/**
 * Fetch all machine data.
 * Replace body with fetch('/api/machines') for real backend.
 */
export async function fetchAllMachines(): Promise<MachineData[]> {
  await new Promise((resolve) => setTimeout(resolve, 70));
  _tick++;
  return getMachines().map((m) => perturbSensors(m, _tick));
}

/**
 * Fetch single machine by ID.
 * Replace with fetch(`/api/machines/${machineId}`) for real backend.
 */
export async function fetchMachineById(
  machineId: string,
): Promise<MachineData | null> {
  const machines = await fetchAllMachines();
  return machines.find((m) => m.machine_id === machineId) ?? null;
}
