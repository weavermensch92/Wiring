"use client";

import { create } from "zustand";
import { NavSection } from "@/types/navigation";

interface NavigationState {
  activeSection: NavSection;
  activeProjectId: string | null;
  subNavCollapsed: boolean;
  setActiveSection: (section: NavSection) => void;
  setActiveProjectId: (projectId: string | null) => void;
  toggleSubNav: () => void;
  setSubNavCollapsed: (collapsed: boolean) => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  activeSection: "home",
  activeProjectId: null,
  subNavCollapsed: false,
  setActiveSection: (section) => set({ activeSection: section }),
  setActiveProjectId: (projectId) => set({ activeProjectId: projectId }),
  toggleSubNav: () => set((s) => ({ subNavCollapsed: !s.subNavCollapsed })),
  setSubNavCollapsed: (collapsed) => set({ subNavCollapsed: collapsed }),
}));
