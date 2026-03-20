"use client";

import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import ChatMessage from "./ChatMessage";
import type { ChatEntry } from "@/lib/chatbot";
import { getBotResponse } from "@/lib/chatbot";
import type { MachineData } from "@/lib/mockData";

interface Props {
  machines: MachineData[];
  selectedMachineId: string;
  onClose: () => void;
}

const INITIAL_MESSAGE: ChatEntry = {
  role: "bot",
  text: "Hello! I'm Nova AI Assistant. I can help explain machine health, RUL predictions, sensor readings, and maintenance recommendations. What would you like to know?",
};

export default function ChatWindow({
  machines,
  selectedMachineId,
  onClose,
}: Props) {
  const [messages, setMessages] = useState<ChatEntry[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  function handleSend() {
    const text = input.trim();
    if (!text) return;

    const userMsg: ChatEntry = { role: "user", text };
    const botText = getBotResponse(text, machines, selectedMachineId);
    const botMsg: ChatEntry = { role: "bot", text: botText };

    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInput("");
  }

  return (
    <div className="w-80 h-[420px] bg-[#111827] border border-[#1e2d3d] rounded-xl shadow-2xl shadow-black/40 flex flex-col overflow-hidden animate-slide-up">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-2.5 border-b border-[#1e2d3d] bg-[#0e1525]">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan-400 live-dot" />
          <span className="text-[#e2e8f0] text-xs font-semibold">
            Nova AI Assistant
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-[#556677] hover:text-[#e2e8f0] text-sm transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 min-h-0 overflow-y-auto px-3 py-3 space-y-2.5"
      >
        {messages.map((msg, i) => (
          <ChatMessage key={i} role={msg.role} text={msg.text} />
        ))}
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex-shrink-0 flex items-center gap-2 px-3 py-2.5 border-t border-[#1e2d3d] bg-[#0e1525]"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about machines..."
          className="flex-1 bg-[#1a2332] border border-[#1e2d3d] rounded-md px-3 py-1.5 text-xs text-[#e2e8f0] placeholder-[#556677] outline-none focus:border-cyan-500/40 transition-colors"
        />
        <button
          type="submit"
          className="p-1.5 bg-cyan-600 hover:bg-cyan-500 rounded-md transition-colors"
        >
          <Send className="w-3.5 h-3.5 text-white" />
        </button>
      </form>
    </div>
  );
}
