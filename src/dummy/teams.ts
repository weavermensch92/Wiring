import { Team, TeamProject } from "@/types/team";

export const DUMMY_TEAMS: Team[] = [
  {
    id: "team-commerce",
    name: "커머스팀",
    abbreviation: "CM",
    color: "#8B5CF6",
    description: "커머스 플랫폼 개발/운영",
    memberIds: ["user-1", "user-2", "user-3"],
    projectIds: ["proj-cm-1", "proj-cm-2"],
  },
  {
    id: "team-payment",
    name: "결제팀",
    abbreviation: "PY",
    color: "#F97316",
    description: "결제 시스템 개발",
    memberIds: ["user-1", "user-2"],
    projectIds: ["proj-py-1", "proj-py-2"],
  },
  {
    id: "team-content",
    name: "콘텐츠팀",
    abbreviation: "CT",
    color: "#06B6D4",
    description: "콘텐츠 서비스 개발",
    memberIds: ["user-1", "user-3", "user-4"],
    projectIds: ["proj-ct-1"],
  },
  {
    id: "team-platform",
    name: "플랫폼팀",
    abbreviation: "PF",
    color: "#10B981",
    description: "공통 인프라/플랫폼",
    memberIds: ["user-1", "user-2"],
    projectIds: ["proj-pf-1", "proj-pf-2", "proj-pf-3"],
  },
  {
    id: "team-growth",
    name: "그로스팀",
    abbreviation: "GR",
    color: "#EC4899",
    description: "유저 획득/성장",
    memberIds: ["user-1", "user-5"],
    projectIds: ["proj-gr-1"],
  },
];

export const DUMMY_TEAM_PROJECTS: TeamProject[] = [
  { id: "proj-cm-1", teamId: "team-commerce", name: "상품 상세 리뉴얼", ticketCount: 12, status: "active" },
  { id: "proj-cm-2", teamId: "team-commerce", name: "장바구니 최적화", ticketCount: 5, status: "active" },
  { id: "proj-py-1", teamId: "team-payment", name: "PG 연동 v2", ticketCount: 8, status: "active" },
  { id: "proj-py-2", teamId: "team-payment", name: "정산 자동화", ticketCount: 3, status: "paused" },
  { id: "proj-ct-1", teamId: "team-content", name: "에디터 고도화", ticketCount: 7, status: "active" },
  { id: "proj-pf-1", teamId: "team-platform", name: "CI/CD 파이프라인 개선", ticketCount: 4, status: "active" },
  { id: "proj-pf-2", teamId: "team-platform", name: "모니터링 대시보드", ticketCount: 6, status: "active" },
  { id: "proj-pf-3", teamId: "team-platform", name: "API Gateway 마이그레이션", ticketCount: 15, status: "paused" },
  { id: "proj-gr-1", teamId: "team-growth", name: "온보딩 퍼널 개선", ticketCount: 9, status: "active" },
];

export function getTeamsForUser(userId: string): Team[] {
  return DUMMY_TEAMS.filter((t) => t.memberIds.includes(userId));
}

export function getProjectsForTeam(teamId: string): TeamProject[] {
  return DUMMY_TEAM_PROJECTS.filter((p) => p.teamId === teamId);
}
