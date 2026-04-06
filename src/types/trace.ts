export type SpanType =
  | "llm_call"      // LLM API 호출
  | "tool_call"     // Tool/MCP 사용 (Git, DB, Figma 등)
  | "agent_handoff" // Agent 간 인계
  | "hitl_gate"     // HITL 대기 지점
  | "code_gen"      // 코드 생성
  | "review"        // 리뷰/검토
  | "planning";     // 계획 수립

export type SpanStatus = "running" | "done" | "failed" | "interrupted";

export interface TraceSpan {
  id: string;
  parentId?: string;
  agentId: string;       // "agent-fe", "agent-be" 등
  agentLabel: string;    // "FE", "BE"
  type: SpanType;
  label: string;         // 표시명 (예: "PaymentService.ts 생성")
  startedAt: string;     // ISO
  endedAt?: string;      // 없으면 진행 중
  durationMs?: number;
  status: SpanStatus;
  inputTokens?: number;
  outputTokens?: number;
  costUsd?: number;
  model?: string;
  toolName?: string;     // tool_call 시
  hitlId?: string;       // hitl_gate 시
  error?: string;
  metadata?: Record<string, string>;
}

export interface TraceRun {
  id: string;
  ticketId: string;
  status: SpanStatus;
  startedAt: string;
  endedAt?: string;
  totalCostUsd: number;
  totalTokens: number;
  spans: TraceSpan[];
}
