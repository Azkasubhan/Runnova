"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";

interface Props {
  icon: LucideIcon;
  label: string;
  href: string;
  active?: boolean;
  collapsed?: boolean;
}

export default function SidebarItem({ icon: Icon, label, href, active, collapsed }: Props) {
  return (
    <Link
      href={href}
      title={label}
      className={`
        w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition-colors
        ${active
          ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/25"
          : "text-[#8899a6] hover:text-[#e2e8f0] hover:bg-[#1a2332] border border-transparent"
        }
      `}
    >
      <Icon className="w-4 h-4 flex-shrink-0" />
      {!collapsed && <span className="truncate">{label}</span>}
    </Link>
  );
}
