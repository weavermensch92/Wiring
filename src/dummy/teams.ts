import { Team, TeamProject } from "@/types/team";

export const DUMMY_TEAMS: Team[] = [
  {
    id: "team-eng",
    name: "Engineering",
    abbreviation: "EN",
    color: "#8B5CF6",
    description: "전사 엔지니어링 총괄",
    memberIds: ["user-1", "user-2", "user-3"],
    projectIds: ["proj-eng-1", "proj-eng-2"],
  },
  {
    id: "team-be",
    name: "Backend",
    abbreviation: "BE",
    color: "#6366F1",
    description: "백엔드 개발팀",
    memberIds: ["user-1", "user-2"],
    projectIds: ["proj-be-1", "proj-be-2", "proj-be-3"],
  },
  {
    id: "team-fe",
    name: "Frontend",
    abbreviation: "FE",
    color: "#06B6D4",
    description: "프론트엔드 개발팀",
    memberIds: ["user-1", "user-3"],
    projectIds: ["proj-fe-1"],
  },
  {
    id: "team-design",
    name: "Design",
    abbreviation: "DS",
    color: "#EC4899",
    description: "디자인팀",
    memberIds: ["user-4"],
    projectIds: ["proj-ds-1"],
  },
  {
    id: "team-product",
    name: "Product",
    abbreviation: "PM",
    color: "#F97316",
    description: "프로덕트팀",
    memberIds: ["user-1", "user-5"],
    projectIds: ["proj-pm-1"],
  },
];

export const DUMMY_TEAM_PROJECTS: TeamProject[] = [
  { id: "proj-eng-1", teamId: "team-eng", name: "인프라 자동화", ticketCount: 12, status: "active" },
  { id: "proj-eng-2", teamId: "team-eng", name: "CI/CD 파이프라인 개선", ticketCount: 5, status: "active" },
  { id: "proj-be-1", teamId: "team-be", name: "SNS 이미지 공유 기능", ticketCount: 8, status: "active" },
  { id: "proj-be-2", teamId: "team-be", name: "결제 시스템 리팩토링", ticketCount: 3, status: "active" },
  { id: "proj-be-3", teamId: "team-be", name: "API v3 마이그레이션", ticketCount: 15, status: "paused" },
  { id: "proj-fe-1", teamId: "team-fe", name: "디자인 시스템 v2", ticketCount: 7, status: "active" },
  { id: "proj-ds-1", teamId: "team-design", name: "브랜드 리뉴얼", ticketCount: 4, status: "active" },
  { id: "proj-pm-1", teamId: "team-product", name: "Q2 로드맵 기획", ticketCount: 6, status: "active" },
];

// Helper: get teams for a user
export function getTeamsForUser(userId: string): Team[] {
  return DUMMY_TEAMS.filter((t) => t.memberIds.includes(userId));
}

// Helper: get projects for a team
export function getProjectsForTeam(teamId: string): TeamProject[] {
  return DUMMY_TEAM_PROJECTS.filter((p) => p.teamId === teamId);
}
