"use client";

import { use, useEffect } from "react";
import Image from "next/image";
import MainLayout from "@/components/layout/MainLayout";
import MachineDetail from "@/components/MachineDetail";
import { useMachines } from "@/lib/MachineProvider";
import { useRealtimeMachine } from "@/hooks/useRealtimeData";

interface Props {
  params: Promise<{ id: string }>;
}

export default function MachineDetailPage({ params }: Props) {
  const { id } = use(params);
  const { machines, isLoaded, setSelectedId } = useMachines();

  // Find machine from context
  const baseMachine = machines.find((m) => m.machine_id === id) ?? null;

  // Apply real-time simulation on top
  const machine = useRealtimeMachine(baseMachine);

  // Set as selected for chatbot context (must be in useEffect, not during render)
  useEffect(() => {
    if (baseMachine) {
      setSelectedId(baseMachine.machine_id);
    }
  }, [baseMachine, setSelectedId]);

  if (!isLoaded) {
    return (
      <div className="h-screen bg-[#0b1120] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="bg-cyan-900/30 p-3 rounded-lg inline-block">
            <Image
              src="/logo.png"
              alt="Runnova"
              width={32}
              height={32}
              className="animate-pulse"
            />
          </div>
          <div>
            <p className="text-[#e2e8f0] font-bold text-sm">Runnova</p>
            <p className="text-[#556677] text-xs mt-1">Loading machine data…</p>
          </div>
        </div>
      </div>
    );
  }

  if (!machine) {
    return (
      <MainLayout title="Machine Not Found">
        <div className="flex items-center justify-center h-full">
          <div className="text-center space-y-2">
            <p className="text-[#e2e8f0] font-bold text-sm">
              Machine &quot;{id}&quot; not found
            </p>
            <p className="text-[#556677] text-xs">
              The machine ID does not exist in the fleet.
            </p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title={`Machine Detail — ${machine.machine_id}`}>
      <MachineDetail machine={machine} />
    </MainLayout>
  );
}
