import { Agent } from "@/types/agent";

export const DUMMY_AGENTS: Agent[] = [
  { id: "PM", name: "Project Manager", status: "active", avatar: "PM", color: "#8B5CF6", currentTask: "epic-1 진행 현황 모니터링" },
  { id: "GM", name: "Governance Manager", status: "active", avatar: "GM", color: "#F97316", currentTask: "users 테이블 접근 정책 검토" },
  { id: "SM", name: "Spec Manager", status: "idle", avatar: "SM", color: "#3B82F6", currentTask: null },
  { id: "Dsn", name: "Designer", status: "active", avatar: "Ds", color: "#EC4899", currentTask: "이미지 뷰어 UI 시안 작업" },
  { id: "Pln", name: "Planner", status: "idle", avatar: "Pl", color: "#10B981", currentTask: null },
  { id: "FE", name: "Front-end Developer", status: "active", avatar: "FE", color: "#06B6D4", currentTask: "ImageUploader 컴포넌트 리팩토링" },
  { id: "BE", name: "Back-end Developer", status: "active", avatar: "BE", color: "#6366F1", currentTask: "공유 링크 생성 API 개발" },
  { id: "BM", name: "Budget Manager", status: "idle", avatar: "BM", color: "#EAB308", currentTask: null },
  { id: "HR", name: "HR Manager", status: "idle", avatar: "HR", color: "#14B8A6", currentTask: null },
];
