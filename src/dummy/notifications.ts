export type NotificationType =
  | "hitl_waiting"
  | "ticket_assigned"
  | "ticket_done"
  | "agent_message"
  | "budget_alert"
  | "external_proposal";

export interface WiringNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  href: string;
  read: boolean;
  createdAt: string;
  agentId?: string; // 발신 Agent ID
}

export const DUMMY_NOTIFICATIONS: WiringNotification[] = [
  {
    id: "notif-1",
    type: "hitl_waiting",
    title: "HITL 승인 요청",
    body: "커머스 플랫폼 v2 — 결제 모듈 코드 리뷰 승인이 필요합니다.",
    href: "/hitl/hitl-1",
    read: false,
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    agentId: "agent-gm",
  },
  {
    id: "notif-2",
    type: "hitl_waiting",
    title: "보안 승인 요청",
    body: "결제 서비스 외부 API 키 연동 — GM Agent가 보안 검토를 요청했습니다.",
    href: "/hitl/hitl-2",
    read: false,
    createdAt: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
    agentId: "agent-gm",
  },
  {
    id: "notif-3",
    type: "ticket_assigned",
    title: "티켓 배정",
    body: "PM Agent가 '결제 SDK 모듈 교체' 티켓을 귀하에게 배정했습니다.",
    href: "/team/team-payment/project/proj-py-2",
    read: false,
    createdAt: new Date(Date.now() - 42 * 60 * 1000).toISOString(),
    agentId: "agent-pm",
  },
  {
    id: "notif-4",
    type: "ticket_done",
    title: "티켓 완료",
    body: "FE Agent가 '홈 화면 성능 최적화' 티켓을 완료했습니다.",
    href: "/team/team-commerce/project/proj-cm-1",
    read: true,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    agentId: "agent-fe",
  },
  {
    id: "notif-5",
    type: "agent_message",
    title: "SM Agent 메시지",
    body: "추천 알고리즘 기획서 초안을 완성했습니다. 검토 부탁드립니다.",
    href: "/agents",
    read: true,
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    agentId: "agent-sm",
  },
  {
    id: "notif-6",
    type: "budget_alert",
    title: "예산 경고",
    body: "커머스팀 4월 AI 비용이 예산의 80%에 도달했습니다. ($320/$400)",
    href: "/team/team-commerce/budget",
    read: true,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    agentId: "agent-bm",
  },
  {
    id: "notif-7",
    type: "external_proposal",
    title: "새 외주 제안",
    body: "Kakao Pay에서 '정기결제 SDK 고도화' 외주 제안이 도착했습니다.",
    href: "/external",
    read: true,
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "notif-8",
    type: "hitl_waiting",
    title: "모델 배분 승인 요청",
    body: "플랫폼팀 API v3 — BM Agent가 모델 배분 조정을 요청했습니다.",
    href: "/hitl/hitl-6",
    read: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    agentId: "agent-bm",
  },
];
