"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import ChatWindow from "./ChatWindow";
import type { MachineData } from "@/lib/mockData";

interface Props {
  machines: MachineData[];
  selectedMachineId: string;
}

export default function Chatbot({ machines, selectedMachineId }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3">
      {/* Chat panel */}
      {open && (
        <ChatWindow
          machines={machines}
          selectedMachineId={selectedMachineId}
          onClose={() => setOpen(false)}
        />
      )}

      {/* Floating button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`
          w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-200
          ${
            open
              ? "bg-[#1a2332] border border-[#1e2d3d] text-[#556677] hover:text-[#e2e8f0]"
              : "bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-900/40"
          }
        `}
      >
        <MessageCircle className="w-5 h-5" />
      </button>
    </div>
  );
}
