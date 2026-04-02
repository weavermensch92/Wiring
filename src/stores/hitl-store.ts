"use client";

import { create } from "zustand";
import { HITLQueueItem, HITLStatus } from "@/types/hitl";
import { DUMMY_HITL_QUEUE } from "@/dummy/hitl";

interface HITLState {
  queueItems: HITLQueueItem[];
  activeItemId: string | null;
  setActiveItem: (id: string | null) => void;
  approveItem: (itemId: string) => void;
  rejectItem: (itemId: string, reason: string) => void;
  escalateItem: (itemId: string) => void;
  updateItemStatus: (itemId: string, status: HITLStatus) => void;
  addItem: (item: HITLQueueItem) => void;
}

export const useHITLStore = create<HITLState>((set) => ({
  queueItems: DUMMY_HITL_QUEUE,
  activeItemId: null,
  setActiveItem: (id) => set({ activeItemId: id }),
  approveItem: (itemId) =>
    set((state) => ({
      queueItems: state.queueItems.map((item) =>
        item.id === itemId
          ? { ...item, status: "approved" as const, completedAt: new Date().toISOString() }
          : item
      ),
    })),
  rejectItem: (itemId, _reason) =>
    set((state) => ({
      queueItems: state.queueItems.map((item) =>
        item.id === itemId
          ? { ...item, status: "rejected" as const, completedAt: new Date().toISOString() }
          : item
      ),
    })),
  escalateItem: (itemId) =>
    set((state) => ({
      queueItems: state.queueItems.map((item) =>
        item.id === itemId ? { ...item, status: "escalated" as const } : item
      ),
    })),
  updateItemStatus: (itemId, status) =>
    set((state) => ({
      queueItems: state.queueItems.map((item) =>
        item.id === itemId ? { ...item, status } : item
      ),
    })),
  addItem: (item) =>
    set((state) => ({ queueItems: [...state.queueItems, item] })),
}));
