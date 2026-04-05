"use client";

import { InboxMessage } from "@/types/inbox";
import { useInboxStore } from "@/stores/inbox-store";
import { AGENT_COLORS } from "@/lib/constants";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star, AlertTriangle, Shield, FileText, Bot, MessageSquare, ExternalLink, CheckSquare, Square } from "lucide-react";

const CATEGORY_ICON: Record<string, React.ReactNode> = {
  agent_report: <FileText className="w-3 h-3" />,
  hitl_request: <Shield className="w-3 h-3" />,
  system_alert: <AlertTriangle className="w-3 h-3" />,
  ticket_update: <CheckSquare className="w-3 h-3" />,
  agent_conversation: <MessageSquare className="w-3 h-3" />,
  external_update: <ExternalLink className="w-3 h-3" />,
};

const PRIORITY_DOT: Record<string, string> = {
  critical: "bg-[var(--wiring-danger)]",
  high: "bg-[var(--wiring-warning)]",
  normal: "",
  low: "",
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "방금";
  if (min < 60) return `${min}분 전`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}시간 전`;
  const d = Math.floor(hr / 24);
  return `${d}일 전`;
}

function getAgentColor(label?: string): string {
  if (!label) return "#6B7280";
  return AGENT_COLORS[label] ?? "#6B7280";
}

export function InboxMessageItem({ message }: { message: InboxMessage }) {
  const { activeMessageId, setActiveMessage, toggleStar, selectedMessageIds, toggleSelect } = useInboxStore();
  const isActive = activeMessageId === message.id;
  const isSelected = selectedMessageIds.includes(message.id);
  const isUnread = message.status === "unread";
  const color = getAgentColor(message.senderAgentLabel);

  return (
    <div
      onClick={() => setActiveMessage(message.id)}
      className={`group flex items-start gap-3 px-4 py-3 cursor-pointer border-b border-[var(--wiring-glass-border)] transition-colors ${
        isActive
          ? "bg-[var(--wiring-accent-glow)]"
          : isUnread
          ? "bg-[var(--wiring-glass-bg)]"
          : "hover:bg-[var(--wiring-glass-hover)]"
      }`}
    >
      {/* Select checkbox (visible on hover or when selected) */}
      <button
        onClick={(e) => { e.stopPropagation(); toggleSelect(message.id); }}
        className={`mt-0.5 shrink-0 transition-opacity ${isSelected || "opacity-0 group-hover:opacity-100"}`}
      >
        {isSelected
          ? <CheckSquare className="w-4 h-4 text-[var(--wiring-accent)]" />
          : <Square className="w-4 h-4 text-[var(--wiring-text-tertiary)]" />}
      </button>

      {/* Avatar */}
      <Avatar className="w-8 h-8 shrink-0 mt-0.5">
        <AvatarFallback
          className="text-[10px] font-bold"
          style={{ backgroundColor: color + "20", color }}
        >
          {message.senderAgentLabel ?? (message.senderSystem ? "SYS" : "?")}
        </AvatarFallback>
      </Avatar>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          {/* Unread dot */}
          {isUnread && (
            <span className="w-2 h-2 rounded-full bg-[var(--wiring-accent)] shrink-0" />
          )}
          {/* Priority dot */}
          {PRIORITY_DOT[message.priority] && (
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${PRIORITY_DOT[message.priority]}`} />
          )}
          {/* Sender name */}
          <span className={`text-xs truncate ${isUnread ? "font-semibold text-[var(--wiring-text-primary)]" : "text-[var(--wiring-text-secondary)]"}`}>
            {message.senderAgentLabel ? `${message.senderAgentLabel} Agent` : message.senderSystem ?? "System"}
          </span>
          {/* Category icon */}
          <span className="text-[var(--wiring-text-tertiary)] shrink-0">
            {CATEGORY_ICON[message.category]}
          </span>
          {/* Timestamp */}
          <span className="ml-auto text-[10px] text-[var(--wiring-text-tertiary)] shrink-0">
            {timeAgo(message.updatedAt)}
          </span>
        </div>

        {/* Subject */}
        <p className={`text-sm truncate ${isUnread ? "font-medium text-[var(--wiring-text-primary)]" : "text-[var(--wiring-text-secondary)]"}`}>
          {message.subject}
        </p>

        {/* Preview */}
        <p className="text-xs text-[var(--wiring-text-tertiary)] truncate mt-0.5">
          {message.preview}
        </p>

        {/* Thread count */}
        {message.thread.length > 0 && (
          <span className="inline-flex items-center gap-1 mt-1 text-[10px] text-[var(--wiring-text-tertiary)]">
            <MessageSquare className="w-3 h-3" />
            {message.thread.length}
          </span>
        )}
      </div>

      {/* Star */}
      <button
        onClick={(e) => { e.stopPropagation(); toggleStar(message.id); }}
        className={`mt-0.5 shrink-0 transition-colors ${
          message.starred
            ? "text-[var(--wiring-warning)]"
            : "text-[var(--wiring-text-tertiary)] opacity-0 group-hover:opacity-100"
        }`}
      >
        <Star className={`w-3.5 h-3.5 ${message.starred ? "fill-current" : ""}`} />
      </button>
    </div>
  );
}
