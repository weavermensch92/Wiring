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
  epicId?: string;  // undefined = 상시 루틴, 값 있으면 에픽별 루틴
}

export interface RoutineExecution {
  id: string;
  routineId: string;
  executedAt: string;
  status: "success" | "failure" | "pending_review";
  duration: number;
  summary: string;
}
