"use client";

import { create } from "zustand";
import { Ticket, TicketStatus } from "@/types/project";
import { DUMMY_PROJECTS, DUMMY_EPICS, DUMMY_TICKETS } from "@/dummy/projects";

interface ProjectState {
  currentProjectId: string | null;
  projects: typeof DUMMY_PROJECTS;
  epics: typeof DUMMY_EPICS;
  tickets: typeof DUMMY_TICKETS;
  setCurrentProject: (id: string) => void;
  moveTicket: (ticketId: string, newStatus: TicketStatus) => void;
  addTicket: (epicId: string, ticket: Ticket) => void;
  updateTicket: (ticketId: string, updates: Partial<Ticket>) => void;
  getTicketsForProject: (projectId: string) => Ticket[];
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  currentProjectId: null,
  projects: DUMMY_PROJECTS,
  epics: DUMMY_EPICS,
  tickets: DUMMY_TICKETS,
  setCurrentProject: (id) => set({ currentProjectId: id }),
  moveTicket: (ticketId, newStatus) =>
    set((state) => {
      const newTickets = { ...state.tickets };
      for (const epicId of Object.keys(newTickets)) {
        newTickets[epicId] = newTickets[epicId].map((t) =>
          t.id === ticketId ? { ...t, status: newStatus } : t
        );
      }
      return { tickets: newTickets };
    }),
  addTicket: (epicId, ticket) =>
    set((state) => ({
      tickets: {
        ...state.tickets,
        [epicId]: [...(state.tickets[epicId] || []), ticket],
      },
    })),
  updateTicket: (ticketId, updates) =>
    set((state) => {
      const newTickets = { ...state.tickets };
      for (const epicId of Object.keys(newTickets)) {
        newTickets[epicId] = newTickets[epicId].map((t) =>
          t.id === ticketId ? { ...t, ...updates } : t
        );
      }
      return { tickets: newTickets };
    }),
  getTicketsForProject: (projectId) => {
    const state = get();
    const projectEpics = state.epics[projectId] || [];
    return projectEpics.flatMap((epic) => state.tickets[epic.id] || []);
  },
}));
