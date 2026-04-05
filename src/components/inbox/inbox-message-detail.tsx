"use client";

import { useInboxStore } from "@/stores/inbox-store";
import { AGENT_COLORS } from "@/lib/constants";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { InboxActionButtons } from "./inbox-action-buttons";
import { InboxReplyBox } from "./inbox-reply-box";
import { InboxDetailEmpty } from "./inbox-empty-state";
import { useRouter } from "next/navigation";
import {
  Star, Archive, MailOpen, Mail, ExternalLink,
  FileText, Shield, AlertTriangle, CheckSquare, MessageSquare,
} from "lucide-react";

const CATEGORY_LABEL: Record<string, string> = {
  agent_report: "리포트",
  hitl_request: "HITL 요청",
  system_alert: "시스템 알림",
  ticket_update: "티켓 업데이트",
  agent_conversation: "대화",
  external_update: "외부 업데이트",
};

const CATEGORY_COLOR: Record<string, string> = {
  agent_report: "var(--wiring-info)",
  hitl_request: "var(--hitl-waiting)",
  system_alert: "var(--wiring-danger)",
  ticket_update: "var(--wiring-success)",
  agent_conversation: "var(--wiring-accent)",
  external_update: "var(--wiring-warning)",
};

const PRIORITY_LABEL: Record<string, string> = {
  critical: "Critical",
  high: "High",
  normal: "Normal",
  low: "Low",
};

function timeFormat(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diffH = (now.getTime() - d.getTime()) / (1000 * 60 * 60);

  if (diffH < 24) {
    return d.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
  }
  return d.toLocaleDateString("ko-KR", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function getAgentColor(label?: string): string {
  if (!label) return "#6B7280";
  return AGENT_COLORS[label] ?? "#6B7280";
}

/** Simple markdown-like renderer for bold, lists, tables, headers, code */
function renderBody(body: string) {
  return body.split("\n").map((line, i) => {
    // Headers
    if (line.startsWith("### ")) return <h4 key={i} className="text-sm font-semibold text-[var(--wiring-text-primary)] mt-3 mb-1">{line.slice(4)}</h4>;
    if (line.startsWith("## ")) return <h3 key={i} className="text-base font-semibold text-[var(--wiring-text-primary)] mt-4 mb-1">{line.slice(3)}</h3>;

    // Table separator
    if (/^\|[-|]+\|$/.test(line.trim())) return null;

    // Table rows
    if (line.startsWith("|")) {
      const cells = line.split("|").filter(Boolean).map((c) => c.trim());
      const isHeader = body.split("\n")[i + 1]?.trim().startsWith("|---");
      return (
        <div key={i} className={`flex gap-4 text-xs py-1 ${isHeader ? "font-semibold text-[var(--wiring-text-primary)]" : "text-[var(--wiring-text-secondary)]"}`}>
          {cells.map((cell, j) => (
            <span key={j} className="flex-1">{cell}</span>
          ))}
        </div>
      );
    }

    // Numbered list
    if (/^\d+\.\s/.test(line)) return <p key={i} className="text-sm text-[var(--wiring-text-secondary)] pl-4 py-0.5">{line}</p>;

    // Bullet list
    if (line.startsWith("- ")) return <p key={i} className="text-sm text-[var(--wiring-text-secondary)] pl-4 py-0.5">{line}</p>;

    // Blockquote
    if (line.startsWith("> ")) return <blockquote key={i} className="text-sm text-[var(--wiring-text-tertiary)] border-l-2 border-[var(--wiring-glass-border)] pl-3 py-0.5 italic">{line.slice(2)}</blockquote>;

    // Bold
    if (line.includes("**")) {
      const parts = line.split(/\*\*(.*?)\*\*/g);
      return (
        <p key={i} className="text-sm text-[var(--wiring-text-secondary)] py-0.5">
          {parts.map((part, j) => j % 2 === 1 ? <strong key={j} className="text-[var(--wiring-text-primary)]">{part}</strong> : part)}
        </p>
      );
    }

    // Code inline
    if (line.includes("`")) {
      const parts = line.split(/`(.*?)`/g);
      return (
        <p key={i} className="text-sm text-[var(--wiring-text-secondary)] py-0.5">
          {parts.map((part, j) => j % 2 === 1 ? <code key={j} className="px-1 py-0.5 rounded bg-[var(--wiring-bg-tertiary)] text-[var(--wiring-accent)] text-xs">{part}</code> : part)}
        </p>
      );
    }

    // Empty line
    if (!line.trim()) return <div key={i} className="h-2" />;

    // Regular text
    return <p key={i} className="text-sm text-[var(--wiring-text-secondary)] py-0.5">{line}</p>;
  });
}

export function InboxMessageDetail() {
  const router = useRouter();
  const { activeMessageId, messages, toggleStar, markAsUnread, archiveMessage, unarchiveMessage } = useInboxStore();
  const message = messages.find((m) => m.id === activeMessageId);

  if (!message) return <InboxDetailEmpty />;

  const color = getAgentColor(message.senderAgentLabel);
  const isArchived = message.status === "archived";

  return (
    <div className="flex flex-col h-full">
      {/* Header toolbar */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--wiring-glass-border)] shrink-0">
        <button
          onClick={() => toggleStar(message.id)}
          className={`p-1.5 rounded-lg transition-colors ${message.starred ? "text-[var(--wiring-warning)]" : "text-[var(--wiring-text-tertiary)] hover:text-[var(--wiring-warning)]"}`}
        >
          <Star className={`w-4 h-4 ${message.starred ? "fill-current" : ""}`} />
        </button>
        <button
          onClick={() => markAsUnread(message.id)}
          className="p-1.5 rounded-lg text-[var(--wiring-text-tertiary)] hover:text-[var(--wiring-text-secondary)] hover:bg-[var(--wiring-glass-hover)] transition-colors"
          title="읽지않음으로 표시"
        >
          <Mail className="w-4 h-4" />
        </button>
        <button
          onClick={() => isArchived ? unarchiveMessage(message.id) : archiveMessage(message.id)}
          className="p-1.5 rounded-lg text-[var(--wiring-text-tertiary)] hover:text-[var(--wiring-text-secondary)] hover:bg-[var(--wiring-glass-hover)] transition-colors"
          title={isArchived ? "보관 취소" : "보관"}
        >
          <Archive className="w-4 h-4" />
        </button>
        <div className="flex-1" />
        <span className="text-xs text-[var(--wiring-text-tertiary)]">{timeFormat(message.createdAt)}</span>
      </div>

      {/* Message body */}
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-4">
          {/* Subject + badges */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge
                variant="secondary"
                className="text-[10px] px-1.5"
                style={{ backgroundColor: CATEGORY_COLOR[message.category] + "20", color: CATEGORY_COLOR[message.category] }}
              >
                {CATEGORY_LABEL[message.category]}
              </Badge>
              {message.priority !== "normal" && message.priority !== "low" && (
                <Badge variant="secondary" className="text-[10px] px-1.5 bg-[var(--wiring-danger)]/20 text-[var(--wiring-danger)]">
                  {PRIORITY_LABEL[message.priority]}
                </Badge>
              )}
            </div>
            <h2 className="text-lg font-semibold text-[var(--wiring-text-primary)]">
              {message.subject}
            </h2>
          </div>

          {/* Sender */}
          <div className="flex items-center gap-3">
            <Avatar className="w-9 h-9">
              <AvatarFallback
                className="text-xs font-bold"
                style={{ backgroundColor: color + "20", color }}
              >
                {message.senderAgentLabel ?? "SYS"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium text-[var(--wiring-text-primary)]">
                {message.senderAgentLabel ? `${message.senderAgentLabel} Agent` : message.senderSystem ?? "System"}
              </p>
              <p className="text-xs text-[var(--wiring-text-tertiary)]">{timeFormat(message.createdAt)}</p>
            </div>
          </div>

          {/* Body */}
          <div className="glass-panel p-4 rounded-lg">
            {renderBody(message.body)}
          </div>

          {/* Attachments */}
          {message.attachments.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {message.attachments.map((att) => (
                <button
                  key={att.id}
                  onClick={() => router.push(att.href)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-[var(--wiring-accent)] bg-[var(--wiring-accent-glow)] hover:bg-[var(--wiring-accent)]/20 transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  {att.label}
                </button>
              ))}
            </div>
          )}

          {/* Action buttons */}
          <InboxActionButtons messageId={message.id} actions={message.actions} />

          {/* Thread */}
          {message.thread.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-[var(--wiring-glass-border)]">
              <p className="text-xs font-medium text-[var(--wiring-text-tertiary)] uppercase">스레드</p>
              {message.thread.map((msg) => {
                const msgColor = msg.role === "agent" ? getAgentColor(msg.agentLabel) : msg.role === "system" ? "#6B7280" : "var(--wiring-accent)";
                return (
                  <div key={msg.id} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                    {msg.role !== "system" && (
                      <Avatar className="w-7 h-7 shrink-0">
                        <AvatarFallback
                          className="text-[9px] font-bold"
                          style={{ backgroundColor: typeof msgColor === "string" && msgColor.startsWith("#") ? msgColor + "20" : undefined, color: msgColor }}
                        >
                          {msg.role === "user" ? "나" : msg.agentLabel ?? "?"}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div className={`max-w-[80%] ${msg.role === "system" ? "w-full text-center" : ""}`}>
                      {msg.role === "system" ? (
                        <p className="text-xs text-[var(--wiring-text-tertiary)] py-2">{msg.content}</p>
                      ) : (
                        <div className={`rounded-lg px-3 py-2 text-sm ${
                          msg.role === "user"
                            ? "bg-[var(--wiring-accent)]/20 text-[var(--wiring-text-primary)]"
                            : "bg-[var(--wiring-glass-bg)] text-[var(--wiring-text-secondary)]"
                        }`}>
                          {msg.content.split("\n").map((line, i) => (
                            <p key={i} className="py-0.5">{line || "\u00A0"}</p>
                          ))}
                        </div>
                      )}
                      <p className="text-[10px] text-[var(--wiring-text-tertiary)] mt-1 px-1">
                        {timeFormat(msg.timestamp)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Reply box */}
      {message.senderAgentId && (
        <InboxReplyBox
          messageId={message.id}
          agentId={message.senderAgentId}
          agentLabel={message.senderAgentLabel}
        />
      )}
    </div>
  );
}
