export type ProjectStatus = "active" | "paused" | "completed" | "archived";
export type EpicStatus = "backlog" | "in_progress" | "review" | "done";
export type TicketStatus = "backlog" | "todo" | "in_progress" | "review" | "done";
export type Priority = "critical" | "high" | "medium" | "low";

export interface Project {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  memberCount: number;
  status: ProjectStatus;
}

export interface Epic {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: EpicStatus;
  priority: Priority;
  ticketCount: number;
  completedTickets: number;
  estimatedCost: number;
  estimatedDays: number;
  dependsOn?: string[];
}

export interface Ticket {
  id: string;
  epicId: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: Priority;
  assignedAgent: string | null;
  assignedHuman?: { id: string; name: string; level: string } | null;
  estimatedHours: number;
  actualHours?: number;
  costUsd?: number;
  subtaskIds?: string[];
  hitlRequired?: boolean;
  hitlType?: string;
  dependsOn?: string[];
}

export interface Subtask {
  id: string;
  ticketId: string;
  title: string;
  completed: boolean;
}
