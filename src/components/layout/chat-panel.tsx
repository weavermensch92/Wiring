"use client";

import { useState } from "react";
import { useLayoutStore } from "@/stores/layout-store";
import { useChatStore } from "@/stores/chat-store";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { X, Send } from "lucide-react";
import { motion } from "framer-motion";
import { AGENT_COLORS } from "@/lib/constants";

export function ChatPanel() {
  const { chatPanelOpen, setChatPanelOpen, chatPanelWidth } = useLayoutStore();
  const { currentContext, histories, addMessage } = useChatStore();
  const [input, setInput] = useState("");

  if (!chatPanelOpen) return null;

  const contextId = currentContext?.id || "general";
  const messages = histories[contextId] || [];

  const handleSend = () => {
    if (!input.trim()) return;
    addMessage(contextId, {
      id: `msg-${Date.now()}`,
      role: "user",
      content: input.trim(),
      timestamp: new Date().toISOString(),
    });
    setInput("");
    // Simulate agent response
    setTimeout(() => {
      addMessage(contextId, {
        id: `msg-${Date.now() + 1}`,
        role: "agent",
        agent: "PM",
        content: "네, 확인했습니다. 해당 내용을 반영하겠습니다.",
        timestamp: new Date().toISOString(),
      });
    }, 800);
  };

  return (
    <motion.div
      initial={{ x: chatPanelWidth }}
      animate={{ x: 0 }}
      exit={{ x: chatPanelWidth }}
      transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
      className="flex flex-col h-full border-l border-[var(--wiring-glass-border)] bg-[var(--wiring-bg-secondary)] shrink-0"
      style={{ width: chatPanelWidth }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-14 border-b border-[var(--wiring-glass-border)] shrink-0">
        <div>
          <h3 className="text-sm font-semibold text-[var(--wiring-text-primary)]">Wiring AI</h3>
          {currentContext && (
            <p className="text-[10px] text-[var(--wiring-text-tertiary)] truncate max-w-[200px]">
              {currentContext.title}
            </p>
          )}
        </div>
        <button
          onClick={() => setChatPanelOpen(false)}
          className="p-1.5 rounded-lg text-[var(--wiring-text-tertiary)] hover:bg-[var(--wiring-glass-hover)] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-4 py-3">
        <div className="space-y-3">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <p className="text-sm text-[var(--wiring-text-tertiary)]">
                대화를 시작하세요
              </p>
              <p className="text-xs text-[var(--wiring-text-tertiary)] mt-1">
                AI에게 질문하거나 작업을 요청할 수 있습니다
              </p>
            </div>
          )}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
            >
              {msg.role !== "user" && (
                <Avatar className="w-6 h-6 shrink-0">
                  <AvatarFallback
                    className="text-[9px] font-bold text-white"
                    style={{
                      backgroundColor: msg.agent
                        ? AGENT_COLORS[msg.agent] || "#5C5C6F"
                        : "#5C5C6F",
                    }}
                  >
                    {msg.agent || "SYS"}
                  </AvatarFallback>
                </Avatar>
              )}
              <div
                className={`rounded-xl px-3 py-2 text-xs leading-relaxed max-w-[85%] ${
                  msg.role === "user"
                    ? "bg-[var(--wiring-accent)] text-white"
                    : msg.role === "system"
                    ? "bg-[var(--wiring-glass-bg)] text-[var(--wiring-text-tertiary)] border border-[var(--wiring-glass-border)]"
                    : "bg-[var(--wiring-bg-tertiary)] text-[var(--wiring-text-primary)]"
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="px-4 pb-4 pt-2 border-t border-[var(--wiring-glass-border)]">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="메시지를 입력하세요..."
            rows={1}
            className="flex-1 resize-none bg-[var(--wiring-glass-bg)] border border-[var(--wiring-glass-border)] rounded-xl px-3 py-2 text-xs text-[var(--wiring-text-primary)] placeholder:text-[var(--wiring-text-tertiary)] focus:outline-none focus:border-[var(--wiring-accent)] transition-colors"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="p-2 rounded-xl bg-[var(--wiring-accent)] text-white disabled:opacity-30 hover:opacity-90 transition-opacity"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
