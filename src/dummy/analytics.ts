// ─── 전사 분석 더미 데이터 ───

export interface DailyTicketStats {
  date: string; // "04/01" 형식
  done: number;
  inProgress: number;
  newTickets: number;
}

export interface AgentDailyCost {
  date: string;
  PM: number;
  GM: number;
  SM: number;
  Dsn: number;
  Pln: number;
  FE: number;
  BE: number;
  BM: number;
  HR: number;
}

export interface HITLWaitStats {
  date: string;
  avgWaitHours: number;
  totalRequests: number;
  approved: number;
  rejected: number;
}

export interface TeamVelocityStats {
  sprint: string;
  "커머스팀": number;
  "결제팀": number;
  "콘텐츠팀": number;
  "플랫폼팀": number;
  "그로스팀": number;
}

export interface ModelUsageData {
  name: string;
  value: number;
  color: string;
}

export interface ProjectBurndownData {
  date: string;
  ideal: number;
  actual: number;
}

// 최근 14일 티켓 통계
export const DUMMY_DAILY_TICKET_STATS: DailyTicketStats[] = [
  { date: "03/22", done: 3, inProgress: 8, newTickets: 5 },
  { date: "03/23", done: 0, inProgress: 8, newTickets: 0 },
  { date: "03/24", done: 2, inProgress: 9, newTickets: 3 },
  { date: "03/25", done: 4, inProgress: 10, newTickets: 5 },
  { date: "03/26", done: 5, inProgress: 11, newTickets: 6 },
  { date: "03/27", done: 3, inProgress: 12, newTickets: 4 },
  { date: "03/28", done: 6, inProgress: 11, newTickets: 5 },
  { date: "03/29", done: 1, inProgress: 10, newTickets: 0 },
  { date: "03/30", done: 0, inProgress: 10, newTickets: 0 },
  { date: "03/31", done: 4, inProgress: 13, newTickets: 7 },
  { date: "04/01", done: 7, inProgress: 14, newTickets: 8 },
  { date: "04/02", done: 5, inProgress: 13, newTickets: 4 },
  { date: "04/03", done: 6, inProgress: 12, newTickets: 5 },
  { date: "04/04", done: 3, inProgress: 14, newTickets: 5 },
];

// 최근 14일 Agent 비용
export const DUMMY_AGENT_DAILY_COST: AgentDailyCost[] = [
  { date: "03/22", PM: 2.1, GM: 1.8, SM: 3.2, Dsn: 8.4, Pln: 0.6, FE: 15.2, BE: 22.4, BM: 1.2, HR: 0.4 },
  { date: "03/23", PM: 0, GM: 0, SM: 0, Dsn: 0, Pln: 0, FE: 0, BE: 0, BM: 0, HR: 0 },
  { date: "03/24", PM: 1.8, GM: 2.1, SM: 4.0, Dsn: 9.8, Pln: 0.5, FE: 18.4, BE: 26.3, BM: 0.8, HR: 0.3 },
  { date: "03/25", PM: 2.5, GM: 2.3, SM: 5.1, Dsn: 11.2, Pln: 0.7, FE: 20.1, BE: 29.4, BM: 1.4, HR: 0.5 },
  { date: "03/26", PM: 3.0, GM: 2.8, SM: 4.8, Dsn: 12.4, Pln: 0.9, FE: 22.3, BE: 31.2, BM: 1.6, HR: 0.6 },
  { date: "03/27", PM: 2.2, GM: 2.1, SM: 3.9, Dsn: 10.1, Pln: 0.6, FE: 19.8, BE: 28.7, BM: 1.1, HR: 0.4 },
  { date: "03/28", PM: 2.8, GM: 3.2, SM: 5.4, Dsn: 13.5, Pln: 1.0, FE: 23.6, BE: 33.8, BM: 1.8, HR: 0.7 },
  { date: "03/29", PM: 0, GM: 0.5, SM: 0, Dsn: 2.1, Pln: 0, FE: 4.2, BE: 5.8, BM: 0, HR: 0 },
  { date: "03/30", PM: 0, GM: 0.3, SM: 0, Dsn: 1.8, Pln: 0, FE: 3.9, BE: 4.2, BM: 0, HR: 0 },
  { date: "03/31", PM: 3.2, GM: 2.9, SM: 5.8, Dsn: 14.2, Pln: 1.1, FE: 25.4, BE: 36.1, BM: 2.0, HR: 0.8 },
  { date: "04/01", PM: 3.8, GM: 3.4, SM: 6.2, Dsn: 15.8, Pln: 1.3, FE: 28.7, BE: 40.2, BM: 2.4, HR: 1.0 },
  { date: "04/02", PM: 3.1, GM: 2.7, SM: 5.2, Dsn: 12.9, Pln: 0.8, FE: 24.1, BE: 34.6, BM: 1.9, HR: 0.7 },
  { date: "04/03", PM: 3.4, GM: 3.1, SM: 5.6, Dsn: 13.8, Pln: 1.0, FE: 26.3, BE: 37.4, BM: 2.1, HR: 0.9 },
  { date: "04/04", PM: 3.2, GM: 2.8, SM: 5.1, Dsn: 12.4, Pln: 0.9, FE: 24.8, BE: 35.2, BM: 1.8, HR: 0.8 },
];

// HITL 대기 통계
export const DUMMY_HITL_WAIT_STATS: HITLWaitStats[] = [
  { date: "03/22", avgWaitHours: 5.2, totalRequests: 4, approved: 3, rejected: 1 },
  { date: "03/24", avgWaitHours: 3.8, totalRequests: 3, approved: 3, rejected: 0 },
  { date: "03/25", avgWaitHours: 6.1, totalRequests: 5, approved: 4, rejected: 1 },
  { date: "03/26", avgWaitHours: 4.4, totalRequests: 6, approved: 5, rejected: 1 },
  { date: "03/27", avgWaitHours: 3.2, totalRequests: 4, approved: 4, rejected: 0 },
  { date: "03/28", avgWaitHours: 7.8, totalRequests: 7, approved: 5, rejected: 2 },
  { date: "03/31", avgWaitHours: 4.9, totalRequests: 5, approved: 4, rejected: 1 },
  { date: "04/01", avgWaitHours: 3.6, totalRequests: 8, approved: 7, rejected: 1 },
  { date: "04/02", avgWaitHours: 2.8, totalRequests: 6, approved: 6, rejected: 0 },
  { date: "04/03", avgWaitHours: 4.2, totalRequests: 7, approved: 5, rejected: 2 },
  { date: "04/04", avgWaitHours: 3.9, totalRequests: 5, approved: 4, rejected: 1 },
];

// 팀별 주간 속도 (완료 티켓 수)
export const DUMMY_TEAM_VELOCITY: TeamVelocityStats[] = [
  { sprint: "S1 (3/1)", "커머스팀": 12, "결제팀": 9, "콘텐츠팀": 6, "플랫폼팀": 15, "그로스팀": 8 },
  { sprint: "S2 (3/8)", "커머스팀": 14, "결제팀": 11, "콘텐츠팀": 7, "플랫폼팀": 16, "그로스팀": 9 },
  { sprint: "S3 (3/15)", "커머스팀": 11, "결제팀": 10, "콘텐츠팀": 8, "플랫폼팀": 14, "그로스팀": 11 },
  { sprint: "S4 (3/22)", "커머스팀": 16, "결제팀": 13, "콘텐츠팀": 9, "플랫폼팀": 18, "그로스팀": 10 },
  { sprint: "S5 (3/29)", "커머스팀": 15, "결제팀": 12, "콘텐츠팀": 10, "플랫폼팀": 20, "그로스팀": 12 },
  { sprint: "S6 (4/4)", "커머스팀": 18, "결제팀": 14, "콘텐츠팀": 11, "플랫폼팀": 22, "그로스팀": 13 },
];

// 모델 사용 분포
export const DUMMY_MODEL_USAGE: ModelUsageData[] = [
  { name: "claude-sonnet-4", value: 34, color: "#8B5CF6" },
  { name: "claude-haiku", value: 28, color: "#A78BFA" },
  { name: "gpt-4o", value: 22, color: "#10B981" },
  { name: "gemini-2.0-flash", value: 16, color: "#3B82F6" },
];

// 프로젝트별 번다운 (커머스 플랫폼 v2 기준, 30일 스프린트)
export const DUMMY_PROJECT_BURNDOWN: ProjectBurndownData[] = [
  { date: "03/05", ideal: 50, actual: 50 },
  { date: "03/08", ideal: 45, actual: 47 },
  { date: "03/12", ideal: 38, actual: 41 },
  { date: "03/15", ideal: 31, actual: 36 },
  { date: "03/19", ideal: 24, actual: 28 },
  { date: "03/22", ideal: 17, actual: 22 },
  { date: "03/26", ideal: 10, actual: 17 },
  { date: "03/29", ideal: 3, actual: 12 },
  { date: "04/04", ideal: 0, actual: 7 },
];

// 에이전트별 효율 (완료 티켓 / 비용)
export const DUMMY_AGENT_EFFICIENCY = [
  { agent: "PM",  completedTickets: 0,  totalCost: 32.2, efficiency: 0 },
  { agent: "GM",  completedTickets: 8,  totalCost: 28.5, efficiency: 0.28 },
  { agent: "SM",  completedTickets: 15, totalCost: 58.4, efficiency: 0.26 },
  { agent: "Dsn", completedTickets: 12, totalCost: 142.3, efficiency: 0.084 },
  { agent: "Pln", completedTickets: 22, totalCost: 11.8, efficiency: 1.86 },
  { agent: "FE",  completedTickets: 31, totalCost: 298.7, efficiency: 0.10 },
  { agent: "BE",  completedTickets: 28, totalCost: 389.4, efficiency: 0.072 },
  { agent: "BM",  completedTickets: 5,  totalCost: 18.2, efficiency: 0.27 },
  { agent: "HR",  completedTickets: 3,  totalCost: 7.1, efficiency: 0.42 },
];
