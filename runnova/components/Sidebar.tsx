"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Cpu,
  BarChart3,
  Bell,
  Wrench,
  Bot,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import SidebarItem from "./SidebarItem";

interface NavItem {
  icon: typeof LayoutDashboard;
  label: string;
  href: string;
}

const TOP_ITEMS: NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: Cpu, label: "Machines", href: "/machines" },
  { icon: BarChart3, label: "Analytics", href: "/analytics" },
  { icon: Bell, label: "Alerts", href: "/alerts" },
  { icon: Wrench, label: "Maintenance", href: "/maintenance" },
];

const BOTTOM_ITEMS: NavItem[] = [
  { icon: Bot, label: "Nova AI", href: "/assistant" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

interface Props {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: Props) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <aside
      className={`
        flex-shrink-0 h-full flex flex-col bg-[#111827] border-r border-[#1e2d3d] transition-all duration-200
        ${collapsed ? "w-14" : "w-48"}
      `}
    >
      {/* Brand */}
      <Link href="/" className="flex items-center justify-center px-3 py-3 border-b border-[#1e2d3d]">
        <Image src="/logo.png" alt="Runnova" width={collapsed ? 32 : 120} height={collapsed ? 32 : 40} className="flex-shrink-0" />
      </Link>

      {/* Top nav */}
      <nav className="flex-1 px-2 py-3 space-y-1 overflow-y-auto">
        {TOP_ITEMS.map((item) => (
          <SidebarItem key={item.href} icon={item.icon} label={item.label} href={item.href} active={isActive(item.href)} collapsed={collapsed} />
        ))}

        <div className="my-2 border-t border-[#1e2d3d]" />

        {BOTTOM_ITEMS.map((item) => (
          <SidebarItem key={item.href} icon={item.icon} label={item.label} href={item.href} active={isActive(item.href)} collapsed={collapsed} />
        ))}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        className="flex items-center justify-center py-2.5 border-t border-[#1e2d3d] text-[#556677] hover:text-[#e2e8f0] transition-colors"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </aside>
  );
}
