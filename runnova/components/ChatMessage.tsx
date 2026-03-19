"use client";

interface Props {
  role: "user" | "bot";
  text: string;
}

export default function ChatMessage({ role, text }: Props) {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`
          max-w-[80%] px-3 py-2 rounded-lg text-xs leading-relaxed
          ${
            isUser
              ? "bg-cyan-600/20 text-cyan-100 border border-cyan-500/20"
              : "bg-[#1a2332] text-[#e2e8f0] border border-[#1e2d3d]"
          }
        `}
      >
        {text}
      </div>
    </div>
  );
}
