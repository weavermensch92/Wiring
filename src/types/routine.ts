export type AutomationLevel = "notify_only" | "result_check" | "approval_required";
export type TriggerType = "schedule" | "event";

export interface Routine {
  id: string;
  title: string;
  trigger: string;
  triggerType: TriggerType;
  agents: string[];
  automationLevel: AutomationLevel;
  lastExecution: string;
  nextExecution?: string;
  executionCount: number;
  successRate: number;
  status: "active" | "paused";
}

export interface RoutineExecution {
  id: string;
  routineId: string;
  executedAt: string;
  status: "success" | "failure" | "pending_review";
  duration: number;
  summary: string;
}
