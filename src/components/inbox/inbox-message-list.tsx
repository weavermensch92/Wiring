"use client";

import { useInboxStore, getFilteredMessages } from "@/stores/inbox-store";
import { ScrollArea } from "@/components/ui/scroll-area";
import { InboxMessageItem } from "./inbox-message-item";
import { InboxToolbar } from "./inbox-toolbar";
import { InboxEmptyState } from "./inbox-empty-state";

const FOLDER_LABELS: Record<string, string> = {
  all: "전체",
  unread: "읽지않음",
  starred: "중요",
  hitl: "HITL",
  agent: "에이전트",
  archive: "보관함",
};

export function InboxMessageList() {
  const state = useInboxStore();
  const filtered = getFilteredMessages(state);

  return (
    <div className="flex flex-col h-full border-r border-[var(--wiring-glass-border)]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--wiring-glass-border)] shrink-0">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium text-[var(--wiring-text-primary)]">
            {FOLDER_LABELS[state.activeFolder] ?? "인박스"}
          </h3>
          <span className="text-xs text-[var(--wiring-text-tertiary)]">{filtered.length}</span>
        </div>
        {state.activeFolder !== "archive" && filtered.some((m) => m.status === "unread") && (
          <button
            onClick={state.markAllAsRead}
            className="text-xs text-[var(--wiring-accent)] hover:underline"
          >
            모두 읽음
          </button>
        )}
      </div>

      {/* Toolbar (bulk actions) */}
      <InboxToolbar />

      {/* Message list */}
      {filtered.length === 0 ? (
        <InboxEmptyState folder={state.activeFolder} />
      ) : (
        <ScrollArea className="flex-1">
          {filtered.map((message) => (
            <InboxMessageItem key={message.id} message={message} />
          ))}
        </ScrollArea>
      )}
    </div>
  );
}
