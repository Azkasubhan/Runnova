"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, Send, Trash2 } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { useMachines } from "@/lib/MachineProvider";
import ChatMessage from "@/components/ChatMessage";
import type { ChatEntry } from "@/lib/chatbot";
import { getBotResponse } from "@/lib/chatbot";

const INITIAL: ChatEntry = {
  role: "bot",
  text: "Hello! I'm Runnova AI Assistant. I can help explain machine health, RUL predictions, sensor readings, and maintenance recommendations.\n\nTry asking:\n• \"Why is Motor_3 critical?\"\n• \"What is the RUL of Pump_1?\"\n• \"Show sensor data\"\n• \"Fleet overview\"\n• \"What should I do?\"",
};

const QUICK_PROMPTS = [
  "Why is Motor_3 critical?",
  "Fleet overview",
  "Show sensor data",
  "What should I do?",
  "Show anomaly",
];

export default function AssistantPage() {
  const { machines, selectedId } = useMachines();
  const [messages, setMessages] = useState<ChatEntry[]>([INITIAL]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  function send(text: string) {
    if (!text.trim()) return;
    const userMsg: ChatEntry = { role: "user", text: text.trim() };
    const botText = getBotResponse(text.trim(), machines, selectedId);
    const botMsg: ChatEntry = { role: "bot", text: botText };
    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInput("");
  }

  return (
    <MainLayout title="AI Assistant">
      <div className="flex h-full">
        {/* Chat area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Messages */}
          <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto px-6 py-4 space-y-3">
            {messages.map((msg, i) => (
              <ChatMessage key={i} role={msg.role} text={msg.text} />
            ))}
          </div>

          {/* Quick prompts */}
          <div className="flex-shrink-0 px-6 pb-2 flex items-center gap-2 flex-wrap">
            {QUICK_PROMPTS.map((p) => (
              <button
                key={p}
                onClick={() => send(p)}
                className="px-2.5 py-1 bg-[#1a2332] border border-[#1e2d3d] rounded text-[10px] text-[#8899a6] hover:text-cyan-400 hover:border-cyan-500/30 transition-colors"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => { e.preventDefault(); send(input); }}
            className="flex-shrink-0 flex items-center gap-2 px-6 py-3 border-t border-[#1e2d3d] bg-[#0e1525]"
          >
            <button
              type="button"
              onClick={() => setMessages([INITIAL])}
              className="p-2 text-[#556677] hover:text-red-400 transition-colors"
              title="Clear chat"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about machines, predictions, maintenance..."
              className="flex-1 bg-[#111827] border border-[#1e2d3d] rounded-md px-4 py-2 text-xs text-[#e2e8f0] placeholder-[#556677] outline-none focus:border-cyan-500/40 transition-colors"
            />
            <button type="submit" className="p-2 bg-cyan-600 hover:bg-cyan-500 rounded-md transition-colors">
              <Send className="w-4 h-4 text-white" />
            </button>
          </form>
        </div>

        {/* Right panel — context info */}
        <div className="w-64 flex-shrink-0 border-l border-[#1e2d3d] bg-[#111827] p-4 space-y-4 overflow-y-auto hidden lg:block">
          <div>
            <h3 className="text-[#556677] text-[10px] uppercase tracking-wider mb-2">Context Machine</h3>
            <p className="text-[#e2e8f0] text-xs font-semibold">{selectedId}</p>
          </div>
          <div>
            <h3 className="text-[#556677] text-[10px] uppercase tracking-wider mb-2">Fleet Status</h3>
            <div className="space-y-1.5">
              {machines.map((m) => (
                <div key={m.machine_id} className="flex items-center justify-between text-[10px]">
                  <span className="text-[#8899a6]">{m.machine_id}</span>
                  <span className={
                    m.prediction.status === "Critical" ? "text-red-400 font-semibold" :
                    m.prediction.status === "Warning" ? "text-yellow-400 font-semibold" :
                    "text-teal-400"
                  }>{m.prediction.status}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-[#556677] text-[10px] uppercase tracking-wider mb-2">Capabilities</h3>
            <ul className="space-y-1 text-[10px] text-[#556677]">
              <li>• Machine status explanation</li>
              <li>• RUL prediction queries</li>
              <li>• Sensor data overview</li>
              <li>• Maintenance recommendations</li>
              <li>• Anomaly detection info</li>
              <li>• Fleet-wide overview</li>
            </ul>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
