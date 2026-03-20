"use client";

import Image from "next/image";
import { useMachines } from "@/lib/MachineProvider";
import MainLayout from "@/components/layout/MainLayout";
import DashboardCards from "@/components/DashboardCards";
import MachineTable from "@/components/MachineTable";
import HealthChart from "@/components/HealthChart";
import SensorPanel from "@/components/SensorPanel";
import MachineStatus from "@/components/MachineStatus";
import InsightPanel from "@/components/InsightPanel";
import RecommendationPanel from "@/components/RecommendationPanel";

export default function DashboardPage() {
  const { machines, selectedId, setSelectedId, selected, isLoaded } =
    useMachines();

  if (!isLoaded || !selected) {
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
            <p className="text-[#556677] text-xs mt-1">
              Initializing sensor pipeline…
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <MainLayout title="Predictive Maintenance Dashboard">
      {/* KPI row */}
      <div className="flex-shrink-0 px-4 py-2">
        <DashboardCards machines={machines} />
      </div>

      {/* Main 3-column grid */}
      <div
        className="flex-1 min-h-0 px-4 pb-2 grid grid-cols-12 gap-3"
        style={{ height: "calc(100% - 68px)" }}
      >
        {/* Left: Machine list */}
        <div className="col-span-3 min-h-0 overflow-hidden">
          <MachineTable
            machines={machines}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </div>

        {/* Center: Status + Chart + Sensors */}
        <div className="col-span-5 min-h-0 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
          <MachineStatus machine={selected} />
          <HealthChart machine={selected} />
          <SensorPanel machine={selected} />
        </div>

        {/* Right: Insight + Recommendations */}
        <div className="col-span-4 min-h-0 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
          <InsightPanel machine={selected} />
          <RecommendationPanel machine={selected} />
        </div>
      </div>
    </MainLayout>
  );
}
