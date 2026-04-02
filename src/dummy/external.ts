import { ExternalWorkProposal, ExternalWork } from "@/types/external";

export const DUMMY_EXTERNAL_PROPOSALS: ExternalWorkProposal[] = [
  {
    id: "ext-prop-1",
    title: "React Native 컴포넌트 코드 리뷰",
    requiredExpertise: ["React Native", "TypeScript"],
    hourlyRate: 50,
    estimatedHours: 3,
    urgency: "medium",
    postedAt: "2026-04-03T08:00:00Z",
    clientCompany: "스타트업 A",
  },
  {
    id: "ext-prop-2",
    title: "API 설계 검토",
    requiredExpertise: ["REST API", "Node.js"],
    hourlyRate: 60,
    estimatedHours: 2,
    urgency: "high",
    postedAt: "2026-04-03T07:30:00Z",
    clientCompany: "스타트업 B",
  },
];

export const DUMMY_EXTERNAL_ACTIVE: ExternalWork[] = [
  {
    id: "ext-work-1",
    title: "Vue.js 컴포넌트 마이그레이션",
    clientCompany: "미디어 C",
    hourlyRate: 55,
    hoursWorked: 4,
    totalHours: 8,
    status: "in_progress",
    startedAt: "2026-04-01T14:00:00Z",
  },
];
