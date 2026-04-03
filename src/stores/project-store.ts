"use client";

import { create } from "zustand";
import { Ticket, TicketStatus, Subtask, TicketComment, TicketActivity } from "@/types/project";
import { DUMMY_PROJECTS, DUMMY_EPICS, DUMMY_TICKETS, DUMMY_SUBTASKS, DUMMY_COMMENTS, DUMMY_ACTIVITIES } from "@/dummy/projects";

interface ProjectState {
  currentProjectId: string | null;
  projects: typeof DUMMY_PROJECTS;
  epics: typeof DUMMY_EPICS;
  tickets: typeof DUMMY_TICKETS;
  subtasks: Record<string, Subtask[]>;
  comments: Record<string, TicketComment[]>;
  activities: Record<string, TicketActivity[]>;
  setCurrentProject: (id: string) => void;
  moveTicket: (ticketId: string, newStatus: TicketStatus) => void;
  addTicket: (epicId: string, ticket: Ticket) => void;
  updateTicket: (ticketId: string, updates: Partial<Ticket>) => void;
  getTicketsForProject: (projectId: string) => Ticket[];
  addComment: (ticketId: string, comment: TicketComment) => void;
  toggleSubtask: (ticketId: string, subtaskId: string) => void;
  addSubtask: (ticketId: string, subtask: Subtask) => void;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  currentProjectId: null,
  projects: DUMMY_PROJECTS,
  epics: DUMMY_EPICS,
  tickets: DUMMY_TICKETS,
  subtasks: DUMMY_SUBTASKS,
  comments: DUMMY_COMMENTS,
  activities: DUMMY_ACTIVITIES,
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
  addComment: (ticketId, comment) =>
    set((state) => ({
      comments: {
        ...state.comments,
        [ticketId]: [...(state.comments[ticketId] || []), comment],
      },
    })),
  toggleSubtask: (ticketId, subtaskId) =>
    set((state) => ({
      subtasks: {
        ...state.subtasks,
        [ticketId]: (state.subtasks[ticketId] || []).map((s) =>
          s.id === subtaskId ? { ...s, completed: !s.completed } : s
        ),
      },
    })),
  addSubtask: (ticketId, subtask) =>
    set((state) => ({
      subtasks: {
        ...state.subtasks,
        [ticketId]: [...(state.subtasks[ticketId] || []), subtask],
      },
    })),
}));
