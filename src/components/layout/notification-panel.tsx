"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useInboxStore } from "@/stores/inbox-store";
import { AGENT_COLORS } from "@/lib/constants";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { InboxMessage, InboxMessageCategory } from "@/types/inbox";
import {
  Bell, AlertTriangle, FileText, Bot, DollarSign, Briefcase,
  CheckCircle2, X, Check, MessageSquare, Shield, ExternalLink,
} from "lucide-react";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "방금";
  if (mins < 60) return `${mins}분 전`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}시간 전`;
  return `${Math.floor(hours / 24)}일 전`;
}

const CATEGORY_CONFIG: Record<InboxMessageCategory, { icon: React.ReactNode; color: string }> = {
  agent_report:       { icon: <FileText className="w-3.5 h-3.5" />,       color: "var(--wiring-info)" },
  hitl_request:       { icon: <Shield className="w-3.5 h-3.5" />,         color: "var(--hitl-waiting)" },
  system_alert:       { icon: <AlertTriangle className="w-3.5 h-3.5" />,  color: "var(--wiring-danger)" },
  ticket_update:      { icon: <CheckCircle2 className="w-3.5 h-3.5" />,   color: "var(--wiring-success)" },
  agent_conversation: { icon: <MessageSquare className="w-3.5 h-3.5" />,  color: "var(--wiring-accent)" },
  external_update:    { icon: <Briefcase className="w-3.5 h-3.5" />,      color: "#10B981" },
};

function NotifItem({
  message,
  onClick,
}: {
  message: InboxMessage;
  onClick: (msg: InboxMessage) => void;
}) {
  const cfg = CATEGORY_CONFIG[message.category];
  const agentLabel = message.senderAgentLabel ?? "";
  const agentColor = agentLabel ? (AGENT_COLORS[agentLabel as keyof typeof AGENT_COLORS] ?? "#888") : "#888";

  return (
    <button
      className={`w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-[var(--wiring-glass-hover)] transition-colors group ${
        message.status === "unread" ? "bg-[var(--wiring-accent-glow)]/30" : ""
      }`}
      onClick={() => onClick(message)}
    >
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
        style={{ backgroundColor: `${cfg.color}20`, color: cfg.color }}
      >
        {cfg.icon}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-xs font-medium truncate ${message.status === "unread" ? "text-[var(--wiring-text-primary)]" : "text-[var(--wiring-text-secondary)]"}`}>
            {message.subject}
          </p>
          <span className="text-[10px] text-[var(--wiring-text-tertiary)] shrink-0">{timeAgo(message.updatedAt)}</span>
        </div>
        <p className="text-xs text-[var(--wiring-text-tertiary)] mt-0.5 line-clamp-2">{message.preview}</p>
        {agentLabel && (
          <div className="flex items-center gap-1.5 mt-1.5">
            <Avatar className="w-3.5 h-3.5">
              <AvatarFallback className="text-[8px] font-bold text-white" style={{ backgroundColor: agentColor }}>
                {agentLabel[0]}
              </AvatarFallback>
            </Avatar>
            <span className="text-[10px] text-[var(--wiring-text-tertiary)]">{agentLabel} Agent</span>
          </div>
        )}
      </div>

      {message.status === "unread" && (
        <span className="w-2 h-2 rounded-full bg-[var(--wiring-accent)] shrink-0 mt-1.5" />
      )}
    </button>
  );
}

export function NotificationPanel() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const { messages, markAsRead, markAllAsRead, setActiveMessage } = useInboxStore();

  // Show only recent 5 non-archived messages
  const recentMessages = messages
    .filter((m) => m.status !== "archived")
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  const unreadCount = messages.filter((m) => m.status === "unread").length;

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleClick = (msg: InboxMessage) => {
    markAsRead(msg.id);
    setActiveMessage(msg.id);
    router.push("/inbox");
    setOpen(false);
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={`relative p-2 rounded-lg transition-all duration-150 ${
          open
            ? "bg-[var(--wiring-accent-glow)] text-[var(--wiring-accent)]"
            : "text-[var(--wiring-text-secondary)] hover:bg-[var(--wiring-glass-hover)] hover:text-[var(--wiring-text-primary)]"
        }`}
        title="알림"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[var(--wiring-danger)] text-white text-[9px] font-bold flex items-center justify-center leading-none">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-96 z-50 rounded-xl overflow-hidden border border-[var(--wiring-glass-border)]"
            style={{ backgroundColor: "var(--wiring-bg-secondary)", boxShadow: "0 16px 48px rgba(0,0,0,0.5)" }}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--wiring-glass-border)]">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-[var(--wiring-accent)]" />
                <span className="text-sm font-semibold text-[var(--wiring-text-primary)]">알림</span>
                {unreadCount > 0 && (
                  <span className="text-xs px-1.5 py-0.5 rounded-full bg-[var(--wiring-danger)]/20 text-[var(--wiring-danger)]">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-[var(--wiring-text-tertiary)] hover:bg-[var(--wiring-glass-hover)] transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" />
                    모두 읽음
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  className="p-1 rounded-lg text-[var(--wiring-text-tertiary)] hover:bg-[var(--wiring-glass-hover)] transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <ScrollArea style={{ maxHeight: "380px" }}>
              <div className="divide-y divide-[var(--wiring-glass-border)]">
                {recentMessages.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <Bell className="w-8 h-8 text-[var(--wiring-text-tertiary)] mx-auto mb-2" />
                    <p className="text-xs text-[var(--wiring-text-tertiary)]">새 알림이 없습니다</p>
                  </div>
                ) : (
                  recentMessages.map((msg) => (
                    <NotifItem key={msg.id} message={msg} onClick={handleClick} />
                  ))
                )}
              </div>
            </ScrollArea>

            <div className="px-4 py-2.5 border-t border-[var(--wiring-glass-border)] text-center">
              <button
                className="text-xs text-[var(--wiring-accent)] hover:underline"
                onClick={() => { router.push("/inbox"); setOpen(false); }}
              >
                인박스 열기
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
