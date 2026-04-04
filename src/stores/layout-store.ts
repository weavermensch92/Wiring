"use client";

import { create } from "zustand";

interface LayoutState {
  chatPanelOpen: boolean;
  searchOpen: boolean;
  subNavWidth: number;
  chatPanelWidth: number;
  toggleChatPanel: () => void;
  setChatPanelOpen: (open: boolean) => void;
  openSearch: () => void;
  closeSearch: () => void;
  setSubNavWidth: (w: number) => void;
  setChatPanelWidth: (w: number) => void;
}

export const useLayoutStore = create<LayoutState>((set) => ({
  chatPanelOpen: false,
  searchOpen: false,
  subNavWidth: 280,
  chatPanelWidth: 360,
  toggleChatPanel: () => set((s) => ({ chatPanelOpen: !s.chatPanelOpen })),
  setChatPanelOpen: (open) => set({ chatPanelOpen: open }),
  openSearch: () => set({ searchOpen: true }),
  closeSearch: () => set({ searchOpen: false }),
  setSubNavWidth: (w) => set({ subNavWidth: Math.max(200, Math.min(400, w)) }),
  setChatPanelWidth: (w) => set({ chatPanelWidth: Math.max(300, Math.min(500, w)) }),
}));
