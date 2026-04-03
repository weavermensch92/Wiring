"use client";

import { create } from "zustand";
import { NavSection } from "@/types/navigation";

interface NavigationState {
  activeSection: NavSection;
  subNavCollapsed: boolean;
  setActiveSection: (section: NavSection) => void;
  toggleSubNav: () => void;
  setSubNavCollapsed: (collapsed: boolean) => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  activeSection: "home",
  subNavCollapsed: false,
  setActiveSection: (section) => set({ activeSection: section }),
  toggleSubNav: () => set((s) => ({ subNavCollapsed: !s.subNavCollapsed })),
  setSubNavCollapsed: (collapsed) => set({ subNavCollapsed: collapsed }),
}));
