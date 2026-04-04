"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { DUMMY_NOTIFICATIONS, WiringNotification, NotificationType } from "@/dummy/notifications";
import { AGENT_COLORS } from "@/lib/constants";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Bell, AlertTriangle, Ticket, Bot, DollarSign, Briefcase,
  CheckCircle2, X, Check,
} from "lucide-react";

// ─── 유틸 ───
function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "방금";
  if (mins < 60) return `${mins}분 전`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}시간 전`;
  return `${Math.floor(hours / 24)}일 전`;
}

const TYPE_CONFIG: Record<NotificationType, { icon: React.ReactNode; color: string; label: string }> = {
  hitl_waiting:     { icon: <AlertTriangle className="w-3.5 h-3.5" />, color: "var(--hitl-waiting)", label: "HITL" },
  ticket_assigned:  { icon: <Ticket className="w-3.5 h-3.5" />,        color: "var(--wiring-accent)", label: "배정" },
  ticket_done:      { icon: <CheckCircle2 className="w-3.5 h-3.5" />,  color: "var(--wiring-success)", label: "완료" },
  agent_message:    { icon: <Bot className="w-3.5 h-3.5" />,           color: "var(--wiring-info)", label: "메시지" },
  budget_alert:     { icon: <DollarSign className="w-3.5 h-3.5" />,    color: "var(--wiring-danger)", label: "예산" },
  external_proposal:{ icon: <Briefcase className="w-3.5 h-3.5" />,     color: "#10B981", label: "외주" },
};

const AGENT_LABELS: Record<string, string> = {
  "agent-pm": "PM", "agent-gm": "GM", "agent-sm": "SM",
  "agent-dsn": "Dsn", "agent-pln": "Pln", "agent-fe": "FE",
  "agent-be": "BE", "agent-bm": "BM", "agent-hr": "HR",
};

function NotifItem({
  notif,
  onRead,
  onClick,
}: {
  notif: WiringNotification;
  onRead: (id: string) => void;
  onClick: (notif: WiringNotification) => void;
}) {
  const cfg = TYPE_CONFIG[notif.type];
  const agentLabel = notif.agentId ? (AGENT_LABELS[notif.agentId] ?? "") : "";
  const agentColor = agentLabel ? (AGENT_COLORS[agentLabel as keyof typeof AGENT_COLORS] ?? "#888") : "#888";

  return (
    <button
      className={`w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-[var(--wiring-glass-hover)] transition-colors group ${
        !notif.read ? "bg-[var(--wiring-accent-glow)]/30" : ""
      }`}
      onClick={() => onClick(notif)}
    >
      {/* Icon */}
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
        style={{ backgroundColor: `${cfg.color}20`, color: cfg.color }}
      >
        {cfg.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-xs font-medium truncate ${notif.read ? "text-[var(--wiring-text-secondary)]" : "text-[var(--wiring-text-primary)]"}`}>
            {notif.title}
          </p>
          <span className="text-[10px] text-[var(--wiring-text-tertiary)] shrink-0">{timeAgo(notif.createdAt)}</span>
        </div>
        <p className="text-xs text-[var(--wiring-text-tertiary)] mt-0.5 line-clamp-2">{notif.body}</p>
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

      {/* Unread dot */}
      {!notif.read && (
        <span className="w-2 h-2 rounded-full bg-[var(--wiring-accent)] shrink-0 mt-1.5" />
      )}
    </button>
  );
}

export function NotificationPanel() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState(DUMMY_NOTIFICATIONS);
  const panelRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // 외부 클릭 시 닫기
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

  const markRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleClick = (notif: WiringNotification) => {
    markRead(notif.id);
    router.push(notif.href);
    setOpen(false);
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
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

      {/* Dropdown panel */}
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
            {/* Header */}
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
                    onClick={markAllRead}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-[var(--wiring-text-tertiary)] hover:bg-[var(--wiring-glass-hover)] transition-colors"
                    title="모두 읽음"
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

            {/* Notifications list */}
            <ScrollArea style={{ maxHeight: "380px" }}>
              <div className="divide-y divide-[var(--wiring-glass-border)]">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <Bell className="w-8 h-8 text-[var(--wiring-text-tertiary)] mx-auto mb-2" />
                    <p className="text-xs text-[var(--wiring-text-tertiary)]">새 알림이 없습니다</p>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <NotifItem
                      key={notif.id}
                      notif={notif}
                      onRead={markRead}
                      onClick={handleClick}
                    />
                  ))
                )}
              </div>
            </ScrollArea>

            {/* Footer */}
            <div className="px-4 py-2.5 border-t border-[var(--wiring-glass-border)] text-center">
              <button
                className="text-xs text-[var(--wiring-accent)] hover:underline"
                onClick={() => setOpen(false)}
              >
                모든 알림 보기
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
