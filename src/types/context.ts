export type ContextSourceType =
  | "git"
  | "notion"
  | "slack"
  | "db"
  | "figma"
  | "ci_cd"
  | "docs"
  | "product_url";

export type ContextSourceStatus = "connected" | "disconnected" | "syncing" | "error";
export type ContextSyncMode = "auto" | "manual";

export interface ContextSource {
  id: string;
  type: ContextSourceType;
  label: string;
  url?: string;
  status: ContextSourceStatus;
  lastSyncAt?: string;
  syncMode: ContextSyncMode;
  dataTypes: string[];
}

export type ContextEventType =
  | "budget_change"
  | "team_expansion"
  | "service_expansion"
  | "policy_change"
  | "tech_stack_change"
  | "market_signal"
  | "performance_signal"
  | "sync_completed";

export type ContextEventSeverity = "info" | "suggestion" | "warning" | "action_required";

export interface ContextEventChange {
  metric: string;
  before: string;
  after: string;
  delta?: string;
  impact: "positive" | "negative" | "neutral";
}

export type ProposalType =
  | "routine_update"
  | "epic_create"
  | "ticket_priority"
  | "budget_adjust"
  | "model_change";

export interface AgentProposal {
  agentId: string;
  agentLabel: string;
  proposal: string;
  proposalType: ProposalType;
  hitlId?: string;
}

export interface ContextEvent {
  id: string;
  type: ContextEventType;
  severity: ContextEventSeverity;
  title: string;
  summary: string;
  detectedBy: string;
  detectedAt: string;
  sourceId?: string;
  changes: ContextEventChange[];
  agentProposals: AgentProposal[];
  hitlId?: string;
  acknowledged: boolean;
}

export interface CompanyContext {
  companyName: string;
  industry: string;
  size: "startup" | "scale-up" | "enterprise";
  sources: ContextSource[];
  lastFullSyncAt?: string;
  onboardingCompleted: boolean;
  onboardingStep: number;
}
