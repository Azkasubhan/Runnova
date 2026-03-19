import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { MachineStatus } from "./mockData";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getStatusTextColor(status: MachineStatus): string {
  switch (status) {
    case "Healthy":
      return "text-teal-400";
    case "Warning":
      return "text-yellow-400";
    case "Critical":
      return "text-red-400";
  }
}

export function getStatusBadgeClass(status: MachineStatus): string {
  switch (status) {
    case "Healthy":
      return "bg-teal-500/15 border-teal-500/30 text-teal-300";
    case "Warning":
      return "bg-yellow-500/15 border-yellow-500/30 text-yellow-300";
    case "Critical":
      return "bg-red-500/15 border-red-500/30 text-red-300";
  }
}

export function getStatusDotClass(status: MachineStatus): string {
  switch (status) {
    case "Healthy":
      return "bg-teal-400";
    case "Warning":
      return "bg-yellow-400";
    case "Critical":
      return "bg-red-400";
  }
}

export function getHealthColor(health: number): string {
  if (health > 0.7) return "#2dd4bf";
  if (health > 0.35) return "#facc15";
  return "#ef4444";
}

export function getHealthBarClass(healthPercent: number): string {
  if (healthPercent > 70) return "bg-teal-400";
  if (healthPercent > 35) return "bg-yellow-400";
  return "bg-red-400";
}
