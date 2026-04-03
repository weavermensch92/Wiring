export type SkillCategory =
  | "code_review"
  | "spec_writing"
  | "test_generation"
  | "documentation"
  | "refactoring"
  | "security"
  | "data_analysis"
  | "planning";

export type SkillScope = "global" | "team";

export interface Skill {
  id: string;
  title: string;
  description: string;
  category: SkillCategory;
  scope: SkillScope;
  teamId?: string;
  agentIds: string[];          // 이 스킬을 사용하는 에이전트
  usageCount: number;
  avgCostUsd: number;
  avgDurationMin: number;
  successRate: number;
  createdAt: string;
  tags: string[];
  promptPreview?: string;       // 프롬프트 일부 미리보기
}

export type DocBundleStatus = "generating" | "ready" | "outdated";

export interface SkillDocument {
  id: string;
  title: string;
  type: "api_docs" | "migration_guide" | "architecture" | "runbook" | "onboarding";
  generatedBy: string[];        // 에이전트 id 목록
  ticketId?: string;
  projectId?: string;
  status: DocBundleStatus;
  createdAt: string;
  updatedAt: string;
  sizeKb: number;
  pageCount: number;
  tags: string[];
}

export interface AgentSkillUsage {
  agentId: string;
  skillId: string;
  usageCount: number;
  totalCostUsd: number;
  avgSuccessRate: number;
}

export interface SkillUsageSummary {
  totalUsage: number;
  totalCostUsd: number;
  thisMonthUsage: number;
  thisMonthCostUsd: number;
  topSkills: { skillId: string; title: string; usageCount: number; costUsd: number }[];
  agentBreakdown: { agentId: string; usageCount: number; costUsd: number }[];
}
