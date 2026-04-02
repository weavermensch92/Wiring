export type AgentStatus = "active" | "idle" | "error";

export interface Agent {
  id: string;
  name: string;
  status: AgentStatus;
  avatar: string;
  color: string;
  currentTask: string | null;
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
