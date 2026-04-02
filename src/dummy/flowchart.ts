import { FlowNode, FlowEdge } from "@/types/flowchart";

export const DUMMY_FLOW_NODES: Record<string, FlowNode[]> = {
  "epic-1": [
    { id: "fn-1", type: "task", position: { x: 50, y: 50 }, data: { label: "이미지 업로드 API", agent: "BE", status: "done", ticketId: "ticket-1" } },
    { id: "fn-2", type: "task", position: { x: 50, y: 200 }, data: { label: "리사이징 파이프라인", agent: "BE", status: "done", ticketId: "ticket-2" } },
    { id: "fn-3", type: "hitl", position: { x: 350, y: 50 }, data: { label: "스펙 선택", hitlId: "hitl-3", status: "approved", assignee: "김CTO" } },
    { id: "fn-4", type: "task", position: { x: 350, y: 200 }, data: { label: "ImageUploader 컴포넌트", agent: "FE", status: "review", ticketId: "ticket-3" } },
    { id: "fn-5", type: "hitl", position: { x: 650, y: 200 }, data: { label: "코드 리뷰", hitlId: "hitl-1", status: "waiting", assignee: "김주니어" } },
    { id: "fn-6", type: "task", position: { x: 350, y: 350 }, data: { label: "공유 링크 생성 API", agent: "BE", status: "in_progress", ticketId: "ticket-4" } },
    { id: "fn-7", type: "task", position: { x: 650, y: 350 }, data: { label: "이미지 뷰어 UI", agent: "FE", status: "todo", ticketId: "ticket-5" } },
    { id: "fn-8", type: "hitl", position: { x: 650, y: 50 }, data: { label: "보안 승인", hitlId: "hitl-2", status: "waiting", assignee: "김CTO" } },
    { id: "fn-9", type: "merge", position: { x: 900, y: 200 }, data: { label: "통합 테스트", status: "waiting" } },
    { id: "fn-10", type: "hitl", position: { x: 650, y: 500 }, data: { label: "디자인 검토", hitlId: "hitl-5", status: "waiting", assignee: "김CTO" } },
    { id: "fn-11", type: "hitl", position: { x: 50, y: -100 }, data: { label: "AI 모델 배분", hitlId: "hitl-6", status: "waiting", assignee: "김CTO" } },
  ],
};

export const DUMMY_FLOW_EDGES: Record<string, FlowEdge[]> = {
  "epic-1": [
    { id: "fe-0", source: "fn-11", target: "fn-3", animated: true },
    { id: "fe-1", source: "fn-3", target: "fn-1", animated: false },
    { id: "fe-2", source: "fn-1", target: "fn-2", animated: false },
    { id: "fe-3", source: "fn-3", target: "fn-4", animated: true },
    { id: "fe-4", source: "fn-4", target: "fn-5", animated: true },
    { id: "fe-5", source: "fn-1", target: "fn-6", animated: true },
    { id: "fe-6", source: "fn-5", target: "fn-7" },
    { id: "fe-7", source: "fn-6", target: "fn-9" },
    { id: "fe-8", source: "fn-7", target: "fn-9" },
    { id: "fe-9", source: "fn-8", target: "fn-9" },
    { id: "fe-10", source: "fn-4", target: "fn-10", animated: true },
  ],
};
