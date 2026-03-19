"use client";

import { useState } from "react";
import { Save, RotateCcw } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { useMachines } from "@/lib/MachineProvider";

interface ThresholdConfig {
  vibrationWarn: number;
  vibrationCrit: number;
  temperatureWarn: number;
  temperatureCrit: number;
  pressureWarn: number;
  pressureCrit: number;
  healthWarn: number;
  healthCrit: number;
  rulUrgent: number;
  rulSoon: number;
}

const DEFAULTS: ThresholdConfig = {
  vibrationWarn: 7,
  vibrationCrit: 10,
  temperatureWarn: 80,
  temperatureCrit: 95,
  pressureWarn: 35,
  pressureCrit: 45,
  healthWarn: 50,
  healthCrit: 25,
  rulUrgent: 30,
  rulSoon: 80,
};

interface NotifConfig {
  emailAlerts: boolean;
  smsAlerts: boolean;
  pushNotifications: boolean;
  criticalOnly: boolean;
  dailyDigest: boolean;
}

const DEFAULT_NOTIF: NotifConfig = {
  emailAlerts: true,
  smsAlerts: false,
  pushNotifications: true,
  criticalOnly: false,
  dailyDigest: true,
};

function NumberInput({ label, value, onChange, unit }: { label: string; value: number; onChange: (v: number) => void; unit: string }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-[#8899a6] text-xs">{label}</span>
      <div className="flex items-center gap-1.5">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-16 bg-[#1a2332] border border-[#1e2d3d] rounded px-2 py-1 text-xs text-[#e2e8f0] text-right outline-none focus:border-cyan-500/40"
        />
        <span className="text-[10px] text-[#556677] w-5">{unit}</span>
      </div>
    </div>
  );
}

function ToggleSwitch({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-[#8899a6] text-xs">{label}</span>
      <button
        onClick={() => onChange(!checked)}
        className={`w-9 h-5 rounded-full transition-colors flex items-center px-0.5 ${checked ? "bg-cyan-600" : "bg-[#1a2332] border border-[#1e2d3d]"}`}
      >
        <div className={`w-4 h-4 rounded-full bg-white transition-transform ${checked ? "translate-x-4" : "translate-x-0"}`} />
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const { machines, isLoaded } = useMachines();
  const [thresholds, setThresholds] = useState<ThresholdConfig>(DEFAULTS);
  const [notif, setNotif] = useState<NotifConfig>(DEFAULT_NOTIF);
  const [saved, setSaved] = useState(false);

  if (!isLoaded) return null;

  function updateT<K extends keyof ThresholdConfig>(key: K, val: number) {
    setThresholds((prev) => ({ ...prev, [key]: val }));
  }

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <MainLayout title="Settings">
      <div className="overflow-y-auto h-full px-6 py-4">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Action bar */}
          <div className="flex items-center justify-between">
            <p className="text-[#556677] text-xs">Configure alert thresholds, notifications, and system preferences.</p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setThresholds(DEFAULTS); setNotif(DEFAULT_NOTIF); }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1a2332] border border-[#1e2d3d] rounded text-xs text-[#8899a6] hover:text-[#e2e8f0] transition-colors"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 rounded text-xs text-white transition-colors"
              >
                <Save className="w-3 h-3" /> {saved ? "Saved ✓" : "Save Changes"}
              </button>
            </div>
          </div>

          {/* Sensor Thresholds */}
          <section className="bg-[#111827] border border-[#1e2d3d] rounded-lg p-4">
            <h2 className="text-[#e2e8f0] text-sm font-semibold mb-1">Sensor Thresholds</h2>
            <p className="text-[#556677] text-[10px] mb-3">Define warning and critical levels for sensor readings.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 divide-y divide-[#1e2d3d] md:divide-y-0">
              <div className="space-y-0 divide-y divide-[#1a2332]">
                <NumberInput label="Vibration — Warning" value={thresholds.vibrationWarn} onChange={(v) => updateT("vibrationWarn", v)} unit="g" />
                <NumberInput label="Vibration — Critical" value={thresholds.vibrationCrit} onChange={(v) => updateT("vibrationCrit", v)} unit="g" />
                <NumberInput label="Temperature — Warning" value={thresholds.temperatureWarn} onChange={(v) => updateT("temperatureWarn", v)} unit="°C" />
                <NumberInput label="Temperature — Critical" value={thresholds.temperatureCrit} onChange={(v) => updateT("temperatureCrit", v)} unit="°C" />
              </div>
              <div className="space-y-0 divide-y divide-[#1a2332]">
                <NumberInput label="Pressure — Warning" value={thresholds.pressureWarn} onChange={(v) => updateT("pressureWarn", v)} unit="psi" />
                <NumberInput label="Pressure — Critical" value={thresholds.pressureCrit} onChange={(v) => updateT("pressureCrit", v)} unit="psi" />
              </div>
            </div>
          </section>

          {/* Health & RUL Thresholds */}
          <section className="bg-[#111827] border border-[#1e2d3d] rounded-lg p-4">
            <h2 className="text-[#e2e8f0] text-sm font-semibold mb-1">Health & RUL Thresholds</h2>
            <p className="text-[#556677] text-[10px] mb-3">When machines cross these levels they change status.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
              <div className="space-y-0 divide-y divide-[#1a2332]">
                <NumberInput label="Health — Warning below" value={thresholds.healthWarn} onChange={(v) => updateT("healthWarn", v)} unit="%" />
                <NumberInput label="Health — Critical below" value={thresholds.healthCrit} onChange={(v) => updateT("healthCrit", v)} unit="%" />
              </div>
              <div className="space-y-0 divide-y divide-[#1a2332]">
                <NumberInput label="RUL — Urgent below" value={thresholds.rulUrgent} onChange={(v) => updateT("rulUrgent", v)} unit="cyc" />
                <NumberInput label="RUL — Soon below" value={thresholds.rulSoon} onChange={(v) => updateT("rulSoon", v)} unit="cyc" />
              </div>
            </div>
          </section>

          {/* Notifications */}
          <section className="bg-[#111827] border border-[#1e2d3d] rounded-lg p-4">
            <h2 className="text-[#e2e8f0] text-sm font-semibold mb-1">Notifications</h2>
            <p className="text-[#556677] text-[10px] mb-3">Choose how you want to be alerted.</p>
            <div className="divide-y divide-[#1a2332]">
              <ToggleSwitch label="Email Alerts" checked={notif.emailAlerts} onChange={(v) => setNotif((p) => ({ ...p, emailAlerts: v }))} />
              <ToggleSwitch label="SMS Alerts" checked={notif.smsAlerts} onChange={(v) => setNotif((p) => ({ ...p, smsAlerts: v }))} />
              <ToggleSwitch label="Push Notifications" checked={notif.pushNotifications} onChange={(v) => setNotif((p) => ({ ...p, pushNotifications: v }))} />
              <ToggleSwitch label="Critical Alerts Only" checked={notif.criticalOnly} onChange={(v) => setNotif((p) => ({ ...p, criticalOnly: v }))} />
              <ToggleSwitch label="Daily Digest" checked={notif.dailyDigest} onChange={(v) => setNotif((p) => ({ ...p, dailyDigest: v }))} />
            </div>
          </section>

          {/* System Info */}
          <section className="bg-[#111827] border border-[#1e2d3d] rounded-lg p-4">
            <h2 className="text-[#e2e8f0] text-sm font-semibold mb-1">System Information</h2>
            <div className="grid grid-cols-2 gap-y-2 gap-x-6 mt-3 text-xs">
              <span className="text-[#556677]">Fleet Size</span>
              <span className="text-[#e2e8f0]">{machines.length} machines</span>
              <span className="text-[#556677]">Model</span>
              <span className="text-[#e2e8f0]">CMAPSS Exponential Degradation</span>
              <span className="text-[#556677]">Refresh Interval</span>
              <span className="text-[#e2e8f0]">4 000 ms</span>
              <span className="text-[#556677]">Version</span>
              <span className="text-[#e2e8f0]">Runnova v0.1.0</span>
            </div>
          </section>
        </div>
      </div>
    </MainLayout>
  );
}
