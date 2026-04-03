import { Team } from "@/types/team";

export { getProjectsForTeam } from "@/dummy/projects";

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

export function getTeamsForUser(userId: string): Team[] {
  return DUMMY_TEAMS.filter((t) => t.memberIds.includes(userId));
}
