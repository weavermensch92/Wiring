"use client";

import { create } from "zustand";
import {
  InboxMessage,
  InboxFolder,
  InboxThreadMessage,
} from "@/types/inbox";
import { DUMMY_INBOX_MESSAGES } from "@/dummy/inbox";
import { toast } from "@/stores/toast-store";

interface InboxState {
  messages: InboxMessage[];
  activeMessageId: string | null;
  activeFolder: InboxFolder;
  activeAgentFilter: string | null;
  searchQuery: string;
  selectedMessageIds: string[];

  // Navigation
  setActiveMessage: (id: string | null) => void;
  setActiveFolder: (folder: InboxFolder) => void;
  setActiveAgentFilter: (agentId: string | null) => void;
  setSearchQuery: (query: string) => void;

  // Message actions
  markAsRead: (id: string) => void;
  markAsUnread: (id: string) => void;
  markAllAsRead: () => void;
  toggleStar: (id: string) => void;
  archiveMessage: (id: string) => void;
  unarchiveMessage: (id: string) => void;

  // Thread
  addReply: (messageId: string, reply: InboxThreadMessage) => void;

  // Bulk
  toggleSelect: (id: string) => void;
  selectAll: () => void;
  clearSelection: () => void;
  bulkMarkRead: () => void;
  bulkArchive: () => void;

  // HITL integration
  handleInboxAction: (messageId: string, actionId: string) => void;

  // Add message
  addMessage: (message: InboxMessage) => void;
}

export const useInboxStore = create<InboxState>((set, get) => ({
  messages: DUMMY_INBOX_MESSAGES,
  activeMessageId: null,
  activeFolder: "all",
  activeAgentFilter: null,
  searchQuery: "",
  selectedMessageIds: [],

  setActiveMessage: (id) => {
    set({ activeMessageId: id });
    if (id) {
      // Auto mark as read
      set((s) => ({
        messages: s.messages.map((m) =>
          m.id === id && m.status === "unread" ? { ...m, status: "read" } : m
        ),
      }));
    }
  },

  setActiveFolder: (folder) =>
    set({ activeFolder: folder, activeAgentFilter: folder === "agent" ? get().activeAgentFilter : null }),

  setActiveAgentFilter: (agentId) =>
    set({ activeAgentFilter: agentId, activeFolder: "agent" }),

  setSearchQuery: (query) => set({ searchQuery: query }),

  markAsRead: (id) =>
    set((s) => ({
      messages: s.messages.map((m) =>
        m.id === id ? { ...m, status: "read" as const } : m
      ),
    })),

  markAsUnread: (id) =>
    set((s) => ({
      messages: s.messages.map((m) =>
        m.id === id ? { ...m, status: "unread" as const } : m
      ),
    })),

  markAllAsRead: () =>
    set((s) => ({
      messages: s.messages.map((m) =>
        m.status === "unread" ? { ...m, status: "read" as const } : m
      ),
    })),

  toggleStar: (id) =>
    set((s) => ({
      messages: s.messages.map((m) =>
        m.id === id ? { ...m, starred: !m.starred } : m
      ),
    })),

  archiveMessage: (id) =>
    set((s) => ({
      messages: s.messages.map((m) =>
        m.id === id ? { ...m, status: "archived" as const } : m
      ),
      activeMessageId: s.activeMessageId === id ? null : s.activeMessageId,
    })),

  unarchiveMessage: (id) =>
    set((s) => ({
      messages: s.messages.map((m) =>
        m.id === id ? { ...m, status: "read" as const } : m
      ),
    })),

  addReply: (messageId, reply) =>
    set((s) => ({
      messages: s.messages.map((m) =>
        m.id === messageId
          ? {
              ...m,
              thread: [...m.thread, reply],
              updatedAt: new Date().toISOString(),
              hasUnreadReply: reply.role === "agent",
            }
          : m
      ),
    })),

  toggleSelect: (id) =>
    set((s) => ({
      selectedMessageIds: s.selectedMessageIds.includes(id)
        ? s.selectedMessageIds.filter((sid) => sid !== id)
        : [...s.selectedMessageIds, id],
    })),

  selectAll: () => {
    const filtered = getFilteredMessages(get());
    set({ selectedMessageIds: filtered.map((m) => m.id) });
  },

  clearSelection: () => set({ selectedMessageIds: [] }),

  bulkMarkRead: () =>
    set((s) => ({
      messages: s.messages.map((m) =>
        s.selectedMessageIds.includes(m.id)
          ? { ...m, status: "read" as const }
          : m
      ),
      selectedMessageIds: [],
    })),

  bulkArchive: () =>
    set((s) => ({
      messages: s.messages.map((m) =>
        s.selectedMessageIds.includes(m.id)
          ? { ...m, status: "archived" as const }
          : m
      ),
      selectedMessageIds: [],
      activeMessageId: s.selectedMessageIds.includes(s.activeMessageId ?? "")
        ? null
        : s.activeMessageId,
    })),

  handleInboxAction: (messageId, actionId) => {
    const state = get();
    const message = state.messages.find((m) => m.id === messageId);
    if (!message) return;

    const action = message.actions.find((a) => a.id === actionId);
    if (!action) return;

    if (action.type === "approve" && action.hitlItemId) {
      // Call HITL store
      const { useHITLStore } = require("@/stores/hitl-store");
      useHITLStore.getState().approveItem(action.hitlItemId, "인박스에서 승인");

      // Update inbox message
      set((s) => ({
        messages: s.messages.map((m) =>
          m.id === messageId
            ? {
                ...m,
                actions: [],
                thread: [
                  ...m.thread,
                  {
                    id: `sys-${Date.now()}`,
                    role: "system" as const,
                    content: "✅ 승인 완료되었습니다.",
                    timestamp: new Date().toISOString(),
                  },
                ],
                updatedAt: new Date().toISOString(),
              }
            : m
        ),
      }));
    } else if (action.type === "reject" && action.hitlItemId) {
      const { useHITLStore } = require("@/stores/hitl-store");
      useHITLStore.getState().rejectItem(action.hitlItemId, "인박스에서 반려");

      set((s) => ({
        messages: s.messages.map((m) =>
          m.id === messageId
            ? {
                ...m,
                actions: [],
                thread: [
                  ...m.thread,
                  {
                    id: `sys-${Date.now()}`,
                    role: "system" as const,
                    content: "❌ 반려되었습니다.",
                    timestamp: new Date().toISOString(),
                  },
                ],
                updatedAt: new Date().toISOString(),
              }
            : m
        ),
      }));
    } else if (action.type === "acknowledge") {
      set((s) => ({
        messages: s.messages.map((m) =>
          m.id === messageId
            ? {
                ...m,
                actions: [],
                thread: [
                  ...m.thread,
                  {
                    id: `sys-${Date.now()}`,
                    role: "system" as const,
                    content: "확인 처리되었습니다.",
                    timestamp: new Date().toISOString(),
                  },
                ],
                updatedAt: new Date().toISOString(),
              }
            : m
        ),
      }));
      toast.info("확인 완료", "알림이 확인 처리되었습니다.");
    }
  },

  addMessage: (message) =>
    set((s) => ({ messages: [message, ...s.messages] })),
}));

/** Filter messages based on current store state */
export function getFilteredMessages(state: {
  messages: InboxMessage[];
  activeFolder: InboxFolder;
  activeAgentFilter: string | null;
  searchQuery: string;
}): InboxMessage[] {
  let result = state.messages;

  // Folder filter
  switch (state.activeFolder) {
    case "unread":
      result = result.filter((m) => m.status === "unread");
      break;
    case "starred":
      result = result.filter((m) => m.starred && m.status !== "archived");
      break;
    case "hitl":
      result = result.filter((m) => m.category === "hitl_request" && m.status !== "archived");
      break;
    case "agent":
      result = result.filter((m) => m.status !== "archived");
      if (state.activeAgentFilter) {
        result = result.filter((m) => m.senderAgentId === state.activeAgentFilter);
      }
      break;
    case "archive":
      result = result.filter((m) => m.status === "archived");
      break;
    case "all":
    default:
      result = result.filter((m) => m.status !== "archived");
      break;
  }

  // Search filter
  if (state.searchQuery.trim()) {
    const q = state.searchQuery.toLowerCase();
    result = result.filter(
      (m) =>
        m.subject.toLowerCase().includes(q) ||
        m.preview.toLowerCase().includes(q)
    );
  }

  // Sort by updatedAt descending
  result.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  return result;
}
