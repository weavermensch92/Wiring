export interface ExternalWorkProposal {
  id: string;
  title: string;
  requiredExpertise: string[];
  hourlyRate: number;
  estimatedHours: number;
  urgency: "low" | "medium" | "high";
  postedAt: string;
  clientCompany: string;
}

export interface ExternalWork {
  id: string;
  title: string;
  clientCompany: string;
  hourlyRate: number;
  hoursWorked: number;
  totalHours: number;
  status: "in_progress" | "completed" | "cancelled";
  startedAt: string;
  completedAt?: string;
}

export interface EarningsInfo {
  totalEarnings: number;
  thisMonth: number;
  pendingPayment: number;
}
