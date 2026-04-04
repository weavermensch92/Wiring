"use client";

import { create } from "zustand";
import { HITLQueueItem, HITLStatus, DecisionRecord } from "@/types/hitl";
import { DUMMY_HITL_QUEUE } from "@/dummy/hitl";
import { toast } from "@/stores/toast-store";

interface HITLState {
  queueItems: HITLQueueItem[];
  activeItemId: string | null;
  setActiveItem: (id: string | null) => void;
  approveItem: (itemId: string, reason?: string) => void;
  rejectItem: (itemId: string, reason: string) => void;
  escalateItem: (itemId: string, targetUserId: string, targetUserName: string, targetUserLevel: string, reason: string) => void;
  delegateItem: (itemId: string, targetUserId: string, targetUserName: string, targetUserLevel: string, reason: string) => void;
  updateItemStatus: (itemId: string, status: HITLStatus) => void;
  addItem: (item: HITLQueueItem) => void;
}

function makeRecord(
  action: DecisionRecord["action"],
  userId: string,
  userName: string,
  userLevel: string,
  reason?: string,
  toUserId?: string,
  toUserName?: string,
  toUserLevel?: string,
): DecisionRecord {
  return {
    id: `dec-${Date.now()}`,
    action,
    userId,
    userName,
    userLevel,
    reason,
    toUserId,
    toUserName,
    toUserLevel,
    timestamp: new Date().toISOString(),
  };
}

export const useHITLStore = create<HITLState>((set) => ({
  queueItems: DUMMY_HITL_QUEUE,
  activeItemId: null,
  setActiveItem: (id) => set({ activeItemId: id }),

  approveItem: (itemId, reason) => {
    set((state) => ({
      queueItems: state.queueItems.map((item) => {
        if (item.id !== itemId) return item;
        const record = makeRecord("approve", item.assignedTo.id, item.assignedTo.name, item.assignedTo.level, reason);
        return {
          ...item,
          status: "approved" as const,
          completedAt: new Date().toISOString(),
          decisionHistory: [...(item.decisionHistory ?? []), record],
        };
      }),
    }));
    toast.success("승인 완료", "HITL 항목이 승인되었습니다.");
  },

  rejectItem: (itemId, reason) => {
    set((state) => ({
      queueItems: state.queueItems.map((item) => {
        if (item.id !== itemId) return item;
        const record = makeRecord("reject", item.assignedTo.id, item.assignedTo.name, item.assignedTo.level, reason);
        return {
          ...item,
          status: "rejected" as const,
          completedAt: new Date().toISOString(),
          decisionHistory: [...(item.decisionHistory ?? []), record],
        };
      }),
    }));
    toast.warning("반려 처리됨", "HITL 항목이 반려되었습니다.");
  },

  escalateItem: (itemId, targetUserId, targetUserName, targetUserLevel, reason) => {
    set((state) => ({
      queueItems: state.queueItems.map((item) => {
        if (item.id !== itemId) return item;
        const record = makeRecord(
          "escalate",
          item.assignedTo.id, item.assignedTo.name, item.assignedTo.level,
          reason,
          targetUserId, targetUserName, targetUserLevel
        );
        return {
          ...item,
          status: "waiting" as const,
          originalAssignee: item.originalAssignee ?? item.assignedTo,
          assignedTo: { id: targetUserId, name: targetUserName, level: targetUserLevel },
          currentLevel: targetUserLevel,
          decisionHistory: [...(item.decisionHistory ?? []), record],
        };
      }),
    }));
    toast.info("에스컬레이션 완료", `${targetUserName}(${targetUserLevel})에게 에스컬레이션 되었습니다.`);
  },

  delegateItem: (itemId, targetUserId, targetUserName, targetUserLevel, reason) => {
    set((state) => ({
      queueItems: state.queueItems.map((item) => {
        if (item.id !== itemId) return item;
        const record = makeRecord(
          "delegate",
          item.assignedTo.id, item.assignedTo.name, item.assignedTo.level,
          reason,
          targetUserId, targetUserName, targetUserLevel
        );
        return {
          ...item,
          status: "waiting" as const,
          originalAssignee: item.originalAssignee ?? item.assignedTo,
          assignedTo: { id: targetUserId, name: targetUserName, level: targetUserLevel },
          currentLevel: targetUserLevel,
          decisionHistory: [...(item.decisionHistory ?? []), record],
        };
      }),
    }));
    toast.info("위임 완료", `${targetUserName}(${targetUserLevel})에게 위임되었습니다.`);
  },

  updateItemStatus: (itemId, status) =>
    set((state) => ({
      queueItems: state.queueItems.map((item) =>
        item.id === itemId ? { ...item, status } : item
      ),
    })),

  addItem: (item) =>
    set((state) => ({ queueItems: [...state.queueItems, item] })),
}));
