export type HITLDecisionAction = "approve" | "reject" | "escalate" | "delegate" | "comment";

export interface DecisionRecord {
  id: string;
  action: HITLDecisionAction;
  userId: string;
  userName: string;
  userLevel: string;
  reason?: string;
  toUserId?: string;
  toUserName?: string;
  toUserLevel?: string;
  timestamp: string;
}

export type HITLType =
  | "code_review"
  | "security_approval"
  | "spec_decision"
  | "design_review"
  | "cost_approval"
  | "assignment"
  | "model_allocation";

export type HITLStatus = "waiting" | "in_progress" | "approved" | "rejected" | "escalated";

export interface HITLQueueItem {
  id: string;
  type: HITLType;
  title: string;
  ticketId?: string;
  epicId: string;
  priority: "critical" | "high" | "medium" | "low";
  status: HITLStatus;
  createdAt: string;
  completedAt?: string;
  requestedBy: string;
  assignedTo: { id: string; name: string; level: string };
  originalAssignee?: { id: string; name: string; level: string };
  currentLevel?: string;
  decisionHistory?: DecisionRecord[];
  briefing: string;
  relatedFiles?: string[];
  agentDiscussionSummary?: string;
  dataAccessRequest?: {
    table: string;
    columns: string[];
    purpose: string;
    duration: string;
  };
  options?: {
    id: string;
    label: string;
    cost: string;
    risk: string;
    devDays: number;
    recommended?: boolean;
  }[];
  selectedOption?: string;
  candidates?: {
    type: "internal" | "external";
    id: string;
    name: string;
    level?: string;
    expertise?: string;
    matchScore: number;
    availability: string;
    costPerHour: number;
    note: string;
    reworkRisk?: string;
  }[];
  selectedCandidate?: string;
  designUrl?: string;
  allocation?: ModelAllocationData;
}

export interface ModelAllocationData {
  agents: ModelAllocationAgent[];
  totalCost: number;
  alternatives: {
    id: string;
    label: string;
    totalCost: number;
    qualityImpact: string;
    recommended?: boolean;
  }[];
  smComment: string;
}

export interface ModelAllocationAgent {
  agentId: string;
  label?: string;
  models: {
    model: string;
    ratio: number;
    estimatedInputTokens?: number;
    estimatedOutputTokens?: number;
    estimatedCost: number;
  }[];
  totalCost: number;
}
