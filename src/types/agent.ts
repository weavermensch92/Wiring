export type AgentStatus = "active" | "idle" | "error";

export interface Agent {
  id: string;
  name: string;
  status: AgentStatus;
  avatar: string;
  color: string;
  currentTask: string | null;
  currentTicketId?: string | null;
  currentEpicId?: string | null;
  todayCostUsd?: number;
  todayCompletedTickets?: number;
  primaryModel?: string;
  role?: string;
}

export interface AgentWorkHistory {
  id: string;
  agentId: string;
  ticketId: string;
  ticketTitle: string;
  action: string;
  timestamp: string;
  durationMin?: number;
  costUsd?: number;
}

export interface AgentMessage {
  id: string;
  fromAgent: string;
  toAgent: string;
  content: string;
  timestamp: string;
  ticketId?: string;
}

export interface CommunicationTopology {
  epicId: string;
  connections: { from: string; to: string; active: boolean }[];
}

export interface ModelAllocation {
  epicId: string;
  agents: {
    agentId: string;
    models: { model: string; ratio: number; cost: number }[];
  }[];
  totalCost: number;
  approvedAt?: string;
}
