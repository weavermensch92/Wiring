export type ExternalUrgency = "low" | "medium" | "high";
export type ExternalWorkStatus = "in_progress" | "review" | "completed" | "cancelled";
export type PaymentStatus = "pending" | "requested" | "paid";

export interface ExternalWorkProposal {
  id: string;
  title: string;
  description: string;
  requiredExpertise: string[];
  hourlyRate: number;
  estimatedHours: number;
  urgency: ExternalUrgency;
  postedAt: string;
  deadline?: string;
  clientCompany: string;
  clientContact?: string;
  matchScore?: number;           // HR 에이전트 매칭 점수
  recommendedAssignee?: string;  // 내부 유저 id
  aiAssistLevel: "full" | "assisted" | "human_only"; // AI 참여 정도
}

export interface ExternalWork {
  id: string;
  proposalId?: string;
  title: string;
  description?: string;
  clientCompany: string;
  clientContact?: string;
  hourlyRate: number;
  hoursWorked: number;
  totalHours: number;
  status: ExternalWorkStatus;
  assigneeId: string;
  assigneeName: string;
  startedAt: string;
  completedAt?: string;
  paymentStatus: PaymentStatus;
  totalEarnings?: number;
  deliverables?: string[];
  notes?: string;
  aiAssistLevel: "full" | "assisted" | "human_only";
}

export interface ExternalEarningsSummary {
  totalEarnings: number;
  thisMonthEarnings: number;
  pendingPayment: number;
  completedCount: number;
  inProgressCount: number;
}
