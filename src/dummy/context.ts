import { CompanyContext, ContextEvent } from "@/types/context";

const h = (hoursAgo: number) =>
  new Date(Date.now() - hoursAgo * 3600 * 1000).toISOString();

export const DUMMY_COMPANY_CONTEXT: CompanyContext = {
  companyName: "소프트스퀘어드",
  industry: "HR Tech / AI SaaS",
  size: "scale-up",
  onboardingCompleted: true,
  onboardingStep: 3,
  lastFullSyncAt: h(0.5),
  sources: [
    {
      id: "src-git",
      type: "git",
      label: "GitHub — softsquared/platform",
      url: "https://github.com/softsquared/platform",
      status: "connected",
      lastSyncAt: h(0.08),
      syncMode: "auto",
      dataTypes: ["코드 구조", "PR 히스토리", "브랜치 전략", "커밋 컨벤션", "의존성"],
    },
    {
      id: "src-notion",
      type: "notion",
      label: "Notion — 소프트스퀘어드 워크스페이스",
      url: "https://notion.so/softsquared",
      status: "connected",
      lastSyncAt: h(1),
      syncMode: "auto",
      dataTypes: ["기획서", "PRD", "디자인 시스템", "온보딩 문서", "ADR"],
    },
    {
      id: "src-slack",
      type: "slack",
      label: "Slack — #engineering, #product",
      url: "https://softsquared.slack.com",
      status: "connected",
      lastSyncAt: h(0.05),
      syncMode: "auto",
      dataTypes: ["기술 의사결정 발언", "채널 활동"],
    },
    {
      id: "src-db",
      type: "db",
      label: "PostgreSQL — production (읽기 전용 레플리카)",
      status: "connected",
      lastSyncAt: h(0.5),
      syncMode: "manual",
      dataTypes: ["스키마", "테이블 구조", "데이터 분류"],
    },
    {
      id: "src-figma",
      type: "figma",
      label: "Figma — Design System",
      url: "https://figma.com/softsquared",
      status: "disconnected",
      syncMode: "auto",
      dataTypes: ["디자인 시스템 컴포넌트", "스타일 가이드"],
    },
  ],
};

export const DUMMY_CONTEXT_EVENTS: ContextEvent[] = [
  // 1. 마케팅 예산 증가 — action_required
  {
    id: "ctx-evt-1",
    type: "budget_change",
    severity: "action_required",
    title: "마케팅 예산 35% 증가 감지",
    summary: "4분기 마케팅 예산이 전분기 대비 35% 상향 조정됨. BM Agent가 루틴 조정 및 티켓 우선순위 변경을 제안.",
    detectedBy: "BM",
    detectedAt: h(2),
    sourceId: "src-notion",
    changes: [
      { metric: "마케팅 예산", before: "$12,000/월", after: "$16,200/월", delta: "+35%", impact: "positive" },
      { metric: "콘텐츠 팀 배정 에이전트 시간", before: "주 40h", after: "주 54h 권장", delta: "+35%", impact: "neutral" },
      { metric: "예상 AI 비용 증가", before: "$280/월", after: "$380/월", delta: "+$100", impact: "negative" },
    ],
    agentProposals: [
      {
        agentId: "agent-bm",
        agentLabel: "BM",
        proposal: "마케팅 성과 분석 루틴을 주 2회 → 매일로 조정",
        proposalType: "routine_update",
        hitlId: "hitl-ctx-1",
      },
      {
        agentId: "agent-pm",
        agentLabel: "PM",
        proposal: "콘텐츠팀 그로스 에픽 우선순위 High → Critical로 상향",
        proposalType: "ticket_priority",
        hitlId: "hitl-ctx-1",
      },
    ],
    hitlId: "hitl-ctx-1",
    acknowledged: false,
  },

  // 2. 신규 B2B 서비스 확장 — action_required
  {
    id: "ctx-evt-2",
    type: "service_expansion",
    severity: "action_required",
    title: "신규 B2B API 서비스 출시 결정",
    summary: "경영진 회의록에서 B2B API 서비스 2분기 출시 결정이 감지됨. PM Agent가 신규 에픽 생성 및 스펙 검토를 제안.",
    detectedBy: "PM",
    detectedAt: h(5),
    sourceId: "src-notion",
    changes: [
      { metric: "서비스 범위", before: "B2C 전용", after: "B2C + B2B API", impact: "positive" },
      { metric: "신규 에픽 예상 수", before: "0", after: "3개 (인증/문서/과금)", impact: "neutral" },
      { metric: "출시 목표", before: "—", after: "2026년 2분기", impact: "neutral" },
    ],
    agentProposals: [
      {
        agentId: "agent-pm",
        agentLabel: "PM",
        proposal: "B2B API 인증·문서화·과금 에픽 3개 신규 생성",
        proposalType: "epic_create",
        hitlId: "hitl-ctx-2",
      },
      {
        agentId: "agent-sm",
        agentLabel: "SM",
        proposal: "API 게이트웨이 기술 스펙 검토 및 선정",
        proposalType: "epic_create",
        hitlId: "hitl-ctx-2",
      },
    ],
    hitlId: "hitl-ctx-2",
    acknowledged: false,
  },

  // 3. 결제 전환율 하락 — warning
  {
    id: "ctx-evt-3",
    type: "performance_signal",
    severity: "warning",
    title: "결제 전환율 18% 하락 감지",
    summary: "최근 7일간 결제 CVR이 4.2% → 3.4%로 하락. GM Agent가 결제 UX 개선 티켓 우선순위 상향을 제안.",
    detectedBy: "GM",
    detectedAt: h(8),
    sourceId: "src-db",
    changes: [
      { metric: "결제 CVR", before: "4.2%", after: "3.4%", delta: "-19%", impact: "negative" },
      { metric: "일 평균 결제 이탈", before: "120건", after: "147건", delta: "+22.5%", impact: "negative" },
    ],
    agentProposals: [
      {
        agentId: "agent-pm",
        agentLabel: "PM",
        proposal: "결제 UX 개선 티켓 Medium → Critical 상향 및 FE/BE 즉시 배정",
        proposalType: "ticket_priority",
      },
    ],
    acknowledged: false,
  },

  // 4. Node.js 버전 업 — suggestion
  {
    id: "ctx-evt-4",
    type: "tech_stack_change",
    severity: "suggestion",
    title: "Node.js 22 LTS 출시 — 마이그레이션 검토 제안",
    summary: "Node.js 22 LTS가 출시됨. SM Agent가 현재 Node.js 20과의 차이를 분석하고 마이그레이션 루틴 등록을 제안.",
    detectedBy: "SM",
    detectedAt: h(18),
    sourceId: "src-git",
    changes: [
      { metric: "현재 Node.js 버전", before: "20.x LTS", after: "22.x LTS 출시", impact: "neutral" },
      { metric: "예상 마이그레이션 공수", before: "—", after: "4~8시간", impact: "neutral" },
    ],
    agentProposals: [
      {
        agentId: "agent-sm",
        agentLabel: "SM",
        proposal: "Node.js 22 호환성 테스트 및 마이그레이션 루틴 등록 (월 1회 버전 점검)",
        proposalType: "routine_update",
      },
    ],
    acknowledged: false,
  },

  // 5. Notion 동기화 완료 — info (acknowledged)
  {
    id: "ctx-evt-5",
    type: "sync_completed",
    severity: "info",
    title: "Notion 동기화 완료 — 기획서 12개 업데이트",
    summary: "Notion 워크스페이스 자동 동기화 완료. 기획서 12개, ADR 3개, 온보딩 문서 2개가 Context Layer에 반영됨.",
    detectedBy: "system",
    detectedAt: h(1),
    sourceId: "src-notion",
    changes: [
      { metric: "업데이트된 기획서", before: "45개", after: "57개", delta: "+12", impact: "positive" },
      { metric: "새 ADR", before: "8개", after: "11개", delta: "+3", impact: "positive" },
    ],
    agentProposals: [],
    acknowledged: true,
  },
];
