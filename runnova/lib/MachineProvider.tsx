"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { fetchAllMachines } from "@/lib/api";
import type { MachineData } from "@/lib/mockData";

interface MachineContextValue {
  machines: MachineData[];
  selectedId: string;
  setSelectedId: (id: string) => void;
  selected: MachineData | null;
  isLoaded: boolean;
  isLive: boolean;
  lastUpdated: Date;
  criticalCount: number;
}

const MachineContext = createContext<MachineContextValue | null>(null);

export function useMachines() {
  const ctx = useContext(MachineContext);
  if (!ctx) throw new Error("useMachines must be used within MachineProvider");
  return ctx;
}

const REFRESH_MS = 4000;

export function MachineProvider({ children }: { children: ReactNode }) {
  const [machines, setMachines] = useState<MachineData[]>([]);
  const [selectedId, setSelectedId] = useState("Motor_3");
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLive, setIsLive] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await fetchAllMachines();
      setMachines(data);
      setLastUpdated(new Date());
      setIsLoaded(true);
      setIsLive(true);
    } catch {
      setIsLive(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, REFRESH_MS);
    return () => clearInterval(interval);
  }, [refresh]);

  const selected = machines.find((m) => m.machine_id === selectedId) ?? machines[0] ?? null;
  const criticalCount = machines.filter((m) => m.prediction.status === "Critical").length;

  return (
    <MachineContext.Provider value={{ machines, selectedId, setSelectedId, selected, isLoaded, isLive, lastUpdated, criticalCount }}>
      {children}
    </MachineContext.Provider>
  );
}
