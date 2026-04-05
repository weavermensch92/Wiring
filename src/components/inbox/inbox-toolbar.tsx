"use client";

import { useInboxStore } from "@/stores/inbox-store";
import { CheckSquare, X, Mail, Archive } from "lucide-react";

export function InboxToolbar() {
  const { selectedMessageIds, clearSelection, bulkMarkRead, bulkArchive, selectAll } = useInboxStore();
  const count = selectedMessageIds.length;

  if (count === 0) return null;

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-[var(--wiring-accent-glow)] border-b border-[var(--wiring-glass-border)]">
      <button
        onClick={clearSelection}
        className="p-1 rounded hover:bg-[var(--wiring-glass-hover)] text-[var(--wiring-text-secondary)] transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
      <span className="text-xs text-[var(--wiring-text-secondary)]">{count}개 선택됨</span>
      <div className="flex items-center gap-1 ml-auto">
        <button
          onClick={bulkMarkRead}
          className="flex items-center gap-1 px-2 py-1 rounded text-xs text-[var(--wiring-text-secondary)] hover:bg-[var(--wiring-glass-hover)] transition-colors"
        >
          <Mail className="w-3.5 h-3.5" />
          읽음 처리
        </button>
        <button
          onClick={bulkArchive}
          className="flex items-center gap-1 px-2 py-1 rounded text-xs text-[var(--wiring-text-secondary)] hover:bg-[var(--wiring-glass-hover)] transition-colors"
        >
          <Archive className="w-3.5 h-3.5" />
          보관
        </button>
      </div>
    </div>
  );
}
