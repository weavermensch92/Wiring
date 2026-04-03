"use client";

import { create } from "zustand";
import { NavSection } from "@/types/navigation";
import { Ticket } from "@/types/project";

interface NavigationState {
  activeSection: NavSection;
  activeProjectId: string | null;
  subNavCollapsed: boolean;
  // Drill-down expand state
  expandedProjects: Record<string, boolean>;
  expandedEpics: Record<string, boolean>;
  expandedTickets: Record<string, boolean>;
  // Ticket dialog from SubNav
  selectedTicketForDialog: Ticket | null;
  ticketDialogOpen: boolean;
  // Actions
  setActiveSection: (section: NavSection) => void;
  setActiveProjectId: (projectId: string | null) => void;
  toggleSubNav: () => void;
  setSubNavCollapsed: (collapsed: boolean) => void;
  toggleProjectExpand: (projectId: string) => void;
  toggleEpicExpand: (epicId: string) => void;
  toggleTicketExpand: (ticketId: string) => void;
  openTicketDialog: (ticket: Ticket) => void;
  closeTicketDialog: () => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  activeSection: "home",
  activeProjectId: null,
  subNavCollapsed: false,
  expandedProjects: {},
  expandedEpics: {},
  expandedTickets: {},
  selectedTicketForDialog: null,
  ticketDialogOpen: false,
  setActiveSection: (section) => set({ activeSection: section }),
  setActiveProjectId: (projectId) => set({ activeProjectId: projectId }),
  toggleSubNav: () => set((s) => ({ subNavCollapsed: !s.subNavCollapsed })),
  setSubNavCollapsed: (collapsed) => set({ subNavCollapsed: collapsed }),
  toggleProjectExpand: (id) =>
    set((s) => ({ expandedProjects: { ...s.expandedProjects, [id]: !s.expandedProjects[id] } })),
  toggleEpicExpand: (id) =>
    set((s) => ({ expandedEpics: { ...s.expandedEpics, [id]: !s.expandedEpics[id] } })),
  toggleTicketExpand: (id) =>
    set((s) => ({ expandedTickets: { ...s.expandedTickets, [id]: !s.expandedTickets[id] } })),
  openTicketDialog: (ticket) => set({ selectedTicketForDialog: ticket, ticketDialogOpen: true }),
  closeTicketDialog: () => set({ selectedTicketForDialog: null, ticketDialogOpen: false }),
}));
