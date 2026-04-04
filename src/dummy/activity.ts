export type ActivityType =
  | "ticket_created"
  | "ticket_moved"
  | "ticket_done"
  | "hitl_requested"
  | "hitl_approved"
  | "hitl_rejected"
  | "agent_action"
  | "deploy"
  | "comment"
  | "member_join";

export interface ActivityEntry {
  id: string;
  type: ActivityType;
  title: string;
  body: string;
  actorType: "human" | "agent";
  actorId: string;
  actorName: string;
  teamId?: string;
  projectId?: string;
  ticketId?: string;
  timestamp: string;
  meta?: Record<string, string>;
}

const now = Date.now();
const min = (m: number) => new Date(now - m * 60 * 1000).toISOString();

export const DUMMY_ACTIVITIES: ActivityEntry[] = [
  {
    id: "act-1",
    type: "hitl_requested",
    title: "HITL 승인 요청",
    body: "커머스 플랫폼 v2 — 결제 모듈 코드 리뷰 승인을 요청했습니다.",
    actorType: "agent", actorId: "GM", actorName: "GM Agent",
    teamId: "team-commerce", projectId: "proj-cm-1",
    timestamp: min(8),
    meta: { type: "code_review", priority: "high" },
  },
  {
    id: "act-2",
    type: "ticket_moved",
    title: "티켓 상태 변경",
    body: "'결제 SDK 모듈 교체' 티켓을 진행 중으로 변경했습니다.",
    actorType: "agent", actorId: "FE", actorName: "FE Agent",
    teamId: "team-payment", projectId: "proj-py-2", ticketId: "ticket-py-3",
    timestamp: min(22),
    meta: { from: "todo", to: "in_progress" },
  },
  {
    id: "act-3",
    type: "ticket_done",
    title: "티켓 완료",
    body: "'홈 화면 성능 최적화' 티켓이 완료되었습니다. 소요 시간: 3.2h",
    actorType: "agent", actorId: "FE", actorName: "FE Agent",
    teamId: "team-commerce", projectId: "proj-cm-1",
    timestamp: min(45),
    meta: { cost: "$14.2", duration: "3.2h" },
  },
  {
    id: "act-4",
    type: "comment",
    title: "댓글 작성",
    body: "SM Agent: '추천 알고리즘 선택에 대한 기술적 검토 결과 Hybrid 방식이 최적입니다.'",
    actorType: "agent", actorId: "SM", actorName: "SM Agent",
    teamId: "team-content", projectId: "proj-ct-1",
    timestamp: min(67),
  },
  {
    id: "act-5",
    type: "agent_action",
    title: "에이전트 작업 시작",
    body: "BE Agent가 '공유 링크 생성 API' 작업을 시작했습니다.",
    actorType: "agent", actorId: "BE", actorName: "BE Agent",
    teamId: "team-commerce", projectId: "proj-cm-1",
    timestamp: min(90),
    meta: { model: "claude-sonnet-4", estimatedCost: "$32" },
  },
  {
    id: "act-6",
    type: "hitl_approved",
    title: "HITL 승인 완료",
    body: "보안 정책 변경 HITL 항목이 승인되었습니다.",
    actorType: "human", actorId: "user-1", actorName: "김CTO",
    teamId: "team-payment",
    timestamp: min(120),
    meta: { hitlType: "security_approval" },
  },
  {
    id: "act-7",
    type: "deploy",
    title: "배포 완료",
    body: "플랫폼 API v3.1.2 production 배포가 완료되었습니다.",
    actorType: "agent", actorId: "BE", actorName: "BE Agent",
    teamId: "team-platform", projectId: "proj-pf-1",
    timestamp: min(180),
    meta: { env: "production", version: "v3.1.2" },
  },
  {
    id: "act-8",
    type: "ticket_created",
    title: "티켓 생성",
    body: "PM Agent가 '온보딩 A/B 테스트 설계' 티켓을 생성했습니다.",
    actorType: "agent", actorId: "PM", actorName: "PM Agent",
    teamId: "team-growth", projectId: "proj-gr-1",
    timestamp: min(240),
    meta: { priority: "medium" },
  },
  {
    id: "act-9",
    type: "hitl_rejected",
    title: "HITL 반려",
    body: "모델 배분 조정 요청이 반려되었습니다. 사유: 예산 초과 우려",
    actorType: "human", actorId: "user-1", actorName: "김CTO",
    teamId: "team-platform",
    timestamp: min(320),
    meta: { hitlType: "model_allocation" },
  },
  {
    id: "act-10",
    type: "agent_action",
    title: "스펙 문서 생성",
    body: "SM Agent가 '결제 SDK 연동 기술 스펙' 문서 초안을 생성했습니다.",
    actorType: "agent", actorId: "SM", actorName: "SM Agent",
    teamId: "team-payment",
    timestamp: min(400),
    meta: { docId: "doc-9", cost: "$5.1" },
  },
  {
    id: "act-11",
    type: "ticket_moved",
    title: "티켓 상태 변경",
    body: "'이미지 공유 UI 시안' 티켓이 검토 단계로 이동했습니다.",
    actorType: "agent", actorId: "Dsn", actorName: "Dsn Agent",
    teamId: "team-commerce", projectId: "proj-cm-1",
    timestamp: min(480),
    meta: { from: "in_progress", to: "review" },
  },
  {
    id: "act-12",
    type: "comment",
    title: "댓글 작성",
    body: "김CTO: '이번 스프린트 목표를 재조정할 필요가 있을 것 같습니다. PM Agent와 논의해주세요.'",
    actorType: "human", actorId: "user-1", actorName: "김CTO",
    timestamp: min(560),
  },
  {
    id: "act-13",
    type: "hitl_requested",
    title: "HITL 승인 요청",
    body: "스펙 결정 HITL — 프론트엔드 프레임워크 선택 승인 요청",
    actorType: "agent", actorId: "SM", actorName: "SM Agent",
    teamId: "team-platform",
    timestamp: min(720),
    meta: { type: "spec_decision", priority: "critical" },
  },
  {
    id: "act-14",
    type: "deploy",
    title: "배포 시작",
    body: "커머스팀 상품 상세 v2.3.0 staging 배포가 시작되었습니다.",
    actorType: "agent", actorId: "BE", actorName: "BE Agent",
    teamId: "team-commerce",
    timestamp: min(900),
    meta: { env: "staging", version: "v2.3.0" },
  },
  {
    id: "act-15",
    type: "member_join",
    title: "팀원 합류",
    body: "신규 멤버 '이준혁'이 결제팀에 합류했습니다.",
    actorType: "human", actorId: "user-2", actorName: "이준혁",
    teamId: "team-payment",
    timestamp: min(1440),
  },
  {
    id: "act-16",
    type: "ticket_done",
    title: "티켓 완료",
    body: "'결제 웹훅 핸들러 구현' 완료. 소요: 5.1h, 비용: $35.0",
    actorType: "agent", actorId: "BE", actorName: "BE Agent",
    teamId: "team-payment", projectId: "proj-py-1",
    timestamp: min(1800),
    meta: { cost: "$35.0", duration: "5.1h" },
  },
  {
    id: "act-17",
    type: "agent_action",
    title: "예산 분석 완료",
    body: "BM Agent가 4월 AI 비용 예측 분석을 완료했습니다. 예상 총액: $1,420",
    actorType: "agent", actorId: "BM", actorName: "BM Agent",
    timestamp: min(2160),
    meta: { forecast: "$1,420", trend: "+12%" },
  },
  {
    id: "act-18",
    type: "ticket_created",
    title: "티켓 생성",
    body: "PM Agent가 'Elasticsearch 인덱싱 최적화' 티켓 3개를 일괄 생성했습니다.",
    actorType: "agent", actorId: "PM", actorName: "PM Agent",
    teamId: "team-platform", projectId: "proj-pf-2",
    timestamp: min(2880),
    meta: { count: "3", priority: "high" },
  },
  {
    id: "act-19",
    type: "comment",
    title: "HITL 의견 추가",
    body: "김CTO: '보안 감사 결과를 먼저 확인한 후 승인하겠습니다.'",
    actorType: "human", actorId: "user-1", actorName: "김CTO",
    timestamp: min(3200),
  },
  {
    id: "act-20",
    type: "hitl_approved",
    title: "HITL 승인 완료",
    body: "담당자 배정 HITL — HR Agent의 추천 수락. BE Agent → 결제팀 proj-py-2 배정",
    actorType: "human", actorId: "user-1", actorName: "김CTO",
    teamId: "team-payment",
    timestamp: min(4320),
    meta: { hitlType: "assignment" },
  },
];
