"use client";

import { create } from "zustand";

interface LayoutState {
  chatPanelOpen: boolean;
  subNavWidth: number;
  chatPanelWidth: number;
  toggleChatPanel: () => void;
  setChatPanelOpen: (open: boolean) => void;
  setSubNavWidth: (w: number) => void;
  setChatPanelWidth: (w: number) => void;
}

export const useLayoutStore = create<LayoutState>((set) => ({
  chatPanelOpen: false,
  subNavWidth: 280,
  chatPanelWidth: 360,
  toggleChatPanel: () => set((s) => ({ chatPanelOpen: !s.chatPanelOpen })),
  setChatPanelOpen: (open) => set({ chatPanelOpen: open }),
  setSubNavWidth: (w) => set({ subNavWidth: Math.max(200, Math.min(400, w)) }),
  setChatPanelWidth: (w) => set({ chatPanelWidth: Math.max(300, Math.min(500, w)) }),
}));
