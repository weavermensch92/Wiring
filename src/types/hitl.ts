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
  | "model_allocation"
  | "context_change";

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
  // Harness Engineering — Evidence Pack 필드
  confidence?: number;        // 0-100
  riskLevel?: "low" | "medium" | "high" | "critical";
  evidenceNotes?: {
    metric: string;
    current: string;
    proposed: string;
    impact: "positive" | "negative" | "neutral";
  }[];
  beforeAfterDiff?: {
    before: string;
    after: string;
    addedLines: number;
    removedLines: number;
  };
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
  costApproval?: CostApprovalData;
  contextChange?: ContextChangeData;
}

// ─── Context Change HITL ──────────────────────────────────

export interface ContextChangeProposal {
  id: string;
  agentId: string;
  agentLabel: string;
  proposalType: "routine_update" | "epic_create" | "ticket_priority" | "budget_adjust" | "model_change";
  description: string;
  impact: string;
  approved?: boolean;
}

export interface ContextChangeData {
  eventId: string;
  eventType: string;
  summary: string;
  changes: {
    metric: string;
    before: string;
    after: string;
    delta?: string;
    impact: "positive" | "negative" | "neutral";
  }[];
  proposals: ContextChangeProposal[];
}

export interface CostApprovalData {
  currentBudget: number;
  currentSpent: number;
  requestedAdditional: number;
  projectedTotal: number;
  reason: string;
  breakdown: { item: string; cost: number }[];
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
