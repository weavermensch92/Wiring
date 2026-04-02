"use client";

import { create } from "zustand";
import { ChatContext, ChatMessage } from "@/types/chat";
import { DUMMY_CHAT_HISTORIES } from "@/dummy/chat";

interface ChatState {
  currentContext: ChatContext | null;
  histories: Record<string, ChatMessage[]>;
  isOpen: boolean;
  addMessage: (contextId: string, message: ChatMessage) => void;
  setContext: (context: ChatContext | null) => void;
  togglePanel: () => void;
  setOpen: (open: boolean) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  currentContext: null,
  histories: DUMMY_CHAT_HISTORIES,
  isOpen: false,
  addMessage: (contextId, message) =>
    set((state) => ({
      histories: {
        ...state.histories,
        [contextId]: [...(state.histories[contextId] || []), message],
      },
    })),
  setContext: (context) => set({ currentContext: context }),
  togglePanel: () => set((s) => ({ isOpen: !s.isOpen })),
  setOpen: (open) => set({ isOpen: open }),
}));
