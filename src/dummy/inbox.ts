import { InboxMessage } from "@/types/inbox";

const h = (hoursAgo: number) =>
  new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString();
const m = (minAgo: number) =>
  new Date(Date.now() - minAgo * 60 * 1000).toISOString();

export const DUMMY_INBOX_MESSAGES: InboxMessage[] = [
  // 1. PM Agent - 스프린트 요약 리포트
  {
    id: "inbox-1",
    category: "agent_report",
    priority: "normal",
    status: "unread",
    starred: true,
    senderAgentId: "agent-pm",
    senderAgentLabel: "PM",
    subject: "4월 1주차 스프린트 요약 리포트",
    preview: "이번 주 스프린트 완료율 87%, 3개 티켓 롤오버 예정...",
    body: `## 4월 1주차 스프린트 요약

**완료율**: 87% (13/15 티켓)

### 주요 성과
- 결제 모듈 v2 API 연동 완료
- 홈 화면 성능 최적화 (LCP 2.1s → 0.8s)
- 추천 알고리즘 A/B 테스트 배포

### 롤오버 티켓 (3건)
1. TICKET-42: 정기결제 SDK 교체 — 외부 의존성 지연
2. TICKET-45: 관리자 대시보드 리팩토링 — 디자인 리뷰 대기
3. TICKET-48: 알림 시스템 고도화 — 스펙 확정 필요

### AI 비용 현황
- 이번 주: $142.30 (예산 대비 71%)
- Opus 4 사용량: 68% / Sonnet 4: 32%

다음 주 스프린트 계획이 필요합니다. 우선순위 조정이 필요한 항목이 있으면 답장해 주세요.`,
    threadId: "inbox-1",
    thread: [],
    hasUnreadReply: false,
    createdAt: m(30),
    updatedAt: m(30),
    attachments: [
      { id: "att-1", type: "project", refId: "proj-cm-1", label: "커머스 플랫폼 v2", href: "/team/team-commerce/project/proj-cm-1" },
      { id: "att-2", type: "ticket", refId: "ticket-42", label: "TICKET-42", href: "/team/team-commerce/project/proj-cm-1" },
    ],
    actions: [
      { id: "act-1", type: "reply", label: "답장", variant: "primary" },
    ],
    teamId: "team-commerce",
  },

  // 2. GM Agent - HITL 코드 리뷰 승인 요청
  {
    id: "inbox-2",
    category: "hitl_request",
    priority: "high",
    status: "unread",
    starred: false,
    senderAgentId: "agent-gm",
    senderAgentLabel: "GM",
    subject: "결제 모듈 코드 리뷰 승인 요청",
    preview: "커머스 플랫폼 v2 — 결제 모듈 핵심 로직 변경에 대한 코드 리뷰 승인이 필요합니다.",
    body: `## 코드 리뷰 승인 요청

**티켓**: TICKET-38 결제 모듈 v2 API 연동
**변경 범위**: 12 파일, +342줄 / -89줄

### 주요 변경 사항
- \`PaymentService\` 클래스 신규 생성
- PG사 연동 어댑터 패턴 적용
- 결제 상태 머신 구현 (대기 → 진행 → 완료/실패)

### FE Agent 리뷰 코멘트
> 타입 안전성 확보됨. PG 어댑터 인터페이스가 향후 확장에 적합한 구조입니다.

### BE Agent 리뷰 코멘트
> 트랜잭션 처리 로직 검증 완료. 동시성 제어를 위한 낙관적 잠금이 적절히 적용됨.

승인 또는 반려를 결정해 주세요.`,
    threadId: "inbox-2",
    thread: [],
    hasUnreadReply: false,
    createdAt: m(45),
    updatedAt: m(45),
    attachments: [
      { id: "att-3", type: "hitl", refId: "hitl-1", label: "HITL-1 코드 리뷰", href: "/hitl/hitl-1" },
      { id: "att-4", type: "ticket", refId: "ticket-38", label: "TICKET-38", href: "/team/team-commerce/project/proj-cm-1" },
    ],
    actions: [
      { id: "act-2", type: "approve", label: "승인", variant: "primary", hitlItemId: "hitl-1" },
      { id: "act-3", type: "reject", label: "반려", variant: "danger", hitlItemId: "hitl-1" },
      { id: "act-4", type: "navigate", label: "상세 리뷰", variant: "secondary" },
    ],
    hitlItemId: "hitl-1",
    teamId: "team-commerce",
  },

  // 3. GM Agent - 보안 승인 요청
  {
    id: "inbox-3",
    category: "hitl_request",
    priority: "critical",
    status: "unread",
    starred: false,
    senderAgentId: "agent-gm",
    senderAgentLabel: "GM",
    subject: "보안 승인: 외부 API 키 연동",
    preview: "결제 서비스 외부 API 키 연동에 대한 보안 검토가 필요합니다.",
    body: `## 보안 승인 요청

**유형**: 외부 API 키 연동
**대상 서비스**: Kakao Pay PG API
**요청 에이전트**: BE Agent

### 접근 요청 사항
- API 키 저장소 접근 (Vault)
- 외부 네트워크 아웃바운드 허용 (pay.kakao.com:443)
- PII 데이터 처리 권한 (결제 정보)

### 보안 검토 결과
- 데이터 암호화: AES-256 적용 확인
- 키 로테이션: 90일 주기 설정
- 감사 로그: 모든 API 호출 기록

**Critical** — 결제 서비스 배포 블로커입니다.`,
    threadId: "inbox-3",
    thread: [],
    hasUnreadReply: false,
    createdAt: m(60),
    updatedAt: m(60),
    attachments: [
      { id: "att-5", type: "hitl", refId: "hitl-2", label: "HITL-2 보안 승인", href: "/hitl/hitl-2" },
    ],
    actions: [
      { id: "act-5", type: "approve", label: "승인", variant: "primary", hitlItemId: "hitl-2" },
      { id: "act-6", type: "reject", label: "반려", variant: "danger", hitlItemId: "hitl-2" },
    ],
    hitlItemId: "hitl-2",
    teamId: "team-payment",
  },

  // 4. BM Agent - 비용 분석 리포트
  {
    id: "inbox-4",
    category: "agent_report",
    priority: "normal",
    status: "unread",
    starred: false,
    senderAgentId: "agent-bm",
    senderAgentLabel: "BM",
    subject: "AI 비용 월간 분석 리포트 (3월)",
    preview: "3월 총 AI 비용 $1,240. 전월 대비 12% 증가. 모델별 상세 분석...",
    body: `## 3월 AI 비용 월간 분석

**총 비용**: $1,240.50 (예산 $1,500 대비 82.7%)
**전월 대비**: +12.3%

### 팀별 비용
| 팀 | 비용 | 예산 대비 |
|---|---|---|
| 커머스팀 | $420 | 84% |
| 결제팀 | $380 | 76% |
| 플랫폼팀 | $290 | 97% |
| AI/ML팀 | $150 | 60% |

### 모델별 사용량
- **Opus 4**: $680 (55%) — 코드 리뷰, 아키텍처 설계
- **Sonnet 4**: $420 (34%) — 일반 코딩, 문서 작성
- **Haiku 4.5**: $140 (11%) — 분류, 간단한 처리

### 비용 절감 제안
1. 플랫폼팀 예산 초과 위험 — Opus → Sonnet 전환 검토
2. 반복 작업 Haiku 전환 시 월 $80 절감 가능

상세 분석이 필요한 항목이 있으면 답장해 주세요.`,
    threadId: "inbox-4",
    thread: [],
    hasUnreadReply: false,
    createdAt: h(2),
    updatedAt: h(2),
    attachments: [
      { id: "att-6", type: "url", refId: "", label: "비용 대시보드", href: "/analytics" },
    ],
    actions: [
      { id: "act-7", type: "reply", label: "답장", variant: "primary" },
    ],
  },

  // 5. System - 예산 경고
  {
    id: "inbox-5",
    category: "system_alert",
    priority: "high",
    status: "unread",
    starred: false,
    senderSystem: "Wiring System",
    subject: "예산 경고: 플랫폼팀 97% 도달",
    preview: "플랫폼팀 4월 AI 비용이 예산의 97%에 도달했습니다.",
    body: `## 예산 경고

**팀**: 플랫폼팀
**현재 사용**: $291 / $300 (97%)
**남은 예산**: $9

### 주요 소비 내역 (최근 7일)
- API v3 마이그레이션 코드 생성: $85
- 레거시 코드 분석 및 리팩토링: $120
- 테스트 코드 자동 생성: $86

### 권장 조치
1. 잔여 작업의 모델을 Sonnet 4로 전환
2. 추가 예산 승인 요청 ($100)
3. 비긴급 작업 다음 달로 연기

즉시 조치가 필요합니다.`,
    threadId: "inbox-5",
    thread: [],
    hasUnreadReply: false,
    createdAt: h(3),
    updatedAt: h(3),
    attachments: [
      { id: "att-7", type: "url", refId: "", label: "플랫폼팀 예산", href: "/team/team-platform/budget" },
    ],
    actions: [
      { id: "act-8", type: "acknowledge", label: "확인", variant: "primary" },
    ],
    teamId: "team-platform",
  },

  // 6. FE Agent - 티켓 완료 알림
  {
    id: "inbox-6",
    category: "ticket_update",
    priority: "normal",
    status: "read",
    starred: false,
    senderAgentId: "agent-fe",
    senderAgentLabel: "FE",
    subject: "티켓 완료: 홈 화면 성능 최적화",
    preview: "FE Agent가 홈 화면 성능 최적화 작업을 완료했습니다. LCP 2.1s → 0.8s",
    body: `## 티켓 완료 보고

**티켓**: TICKET-35 홈 화면 성능 최적화
**상태**: Done ✅

### 수행 내역
- React.memo 적용: 불필요한 리렌더 제거 (12개 컴포넌트)
- 이미지 lazy loading 구현
- 번들 크기 최적화: 280KB → 195KB (-30%)
- API 응답 캐싱 (React Query staleTime 조정)

### 성능 개선 결과
| 지표 | 이전 | 이후 | 개선 |
|---|---|---|---|
| LCP | 2.1s | 0.8s | -62% |
| FID | 120ms | 45ms | -63% |
| CLS | 0.15 | 0.02 | -87% |

추가 최적화가 필요한 페이지가 있으면 알려주세요.`,
    threadId: "inbox-6",
    thread: [],
    hasUnreadReply: false,
    createdAt: h(4),
    updatedAt: h(4),
    attachments: [
      { id: "att-8", type: "ticket", refId: "ticket-35", label: "TICKET-35", href: "/team/team-commerce/project/proj-cm-1" },
    ],
    actions: [
      { id: "act-9", type: "reply", label: "답장", variant: "primary" },
    ],
    teamId: "team-commerce",
  },

  // 7. PM Agent - 티켓 배정 알림
  {
    id: "inbox-7",
    category: "ticket_update",
    priority: "normal",
    status: "read",
    starred: false,
    senderAgentId: "agent-pm",
    senderAgentLabel: "PM",
    subject: "새 티켓 배정: 정기결제 SDK 모듈 교체",
    preview: "PM Agent가 '정기결제 SDK 모듈 교체' 티켓을 배정했습니다.",
    body: `## 티켓 배정 알림

**티켓**: TICKET-42 정기결제 SDK 모듈 교체
**우선순위**: High
**예상 소요**: 16시간

### 배경
현재 사용 중인 정기결제 SDK(v2.x)가 EOL 예정(4월 말). 신규 SDK(v3.x)로 마이그레이션 필요.

### 주요 작업
1. 신규 SDK 설치 및 타입 정의 업데이트
2. 기존 결제 흐름 마이그레이션
3. 웹훅 핸들러 업데이트
4. 통합 테스트 작성

**담당 에이전트**: BE Agent (코드), FE Agent (UI 연동)
**휴먼 리뷰어**: 본인

질문이 있으면 답장해 주세요.`,
    threadId: "inbox-7",
    thread: [],
    hasUnreadReply: false,
    createdAt: h(5),
    updatedAt: h(5),
    attachments: [
      { id: "att-9", type: "ticket", refId: "ticket-42", label: "TICKET-42", href: "/team/team-payment/project/proj-py-2" },
    ],
    actions: [
      { id: "act-10", type: "navigate", label: "티켓 보기", variant: "primary" },
    ],
    ticketId: "ticket-42",
    teamId: "team-payment",
  },

  // 8. SM Agent - 대화 (스레드 있음)
  {
    id: "inbox-8",
    category: "agent_conversation",
    priority: "normal",
    status: "read",
    starred: true,
    senderAgentId: "agent-sm",
    senderAgentLabel: "SM",
    subject: "추천 알고리즘 기획서 초안 완성",
    preview: "추천 알고리즘 v3 기획서 초안을 완성했습니다. 검토 후 피드백 부탁드립니다.",
    body: `## 추천 알고리즘 v3 기획서

기획서 초안을 완성했습니다. 핵심 변경 사항을 요약합니다.

### 주요 변경점
1. **협업 필터링 → 하이브리드 추천**: 콘텐츠 기반 + 협업 필터링 결합
2. **실시간 피드백 반영**: 사용자 행동 이벤트 스트리밍 파이프라인
3. **A/B 테스트 프레임워크**: Feature flag 기반 실험 구조

### 예상 효과
- CTR 15~20% 향상 (벤치마크 기준)
- 콜드 스타트 문제 80% 해소

### 일정 (안)
- 설계 리뷰: 4월 2주차
- 구현: 4월 3~4주차
- A/B 테스트: 5월 1~2주차

전체 기획서는 첨부 문서를 확인해 주세요.`,
    threadId: "inbox-8",
    thread: [
      {
        id: "thread-8-1",
        role: "user",
        content: "콜드 스타트 해소 방법 구체적으로 설명해 줄 수 있어?",
        timestamp: h(3.5),
      },
      {
        id: "thread-8-2",
        role: "agent",
        agentId: "agent-sm",
        agentLabel: "SM",
        content: `네, 콜드 스타트 해소는 두 가지 전략을 결합합니다:

1. **메타데이터 기반 초기 추천**: 상품 카테고리, 가격대, 인기도를 활용하여 신규 사용자에게도 의미 있는 추천 제공
2. **탐색-활용 밸런싱**: 초기 5회 인터랙션 동안 다양한 카테고리를 노출하여 선호도 파악 후, 점진적으로 개인화 강화

기존 협업 필터링 단독 대비 신규 사용자 첫 세션 전환율이 벤치마크에서 3.2배 높았습니다.`,
        timestamp: h(3),
      },
    ],
    hasUnreadReply: false,
    createdAt: h(6),
    updatedAt: h(3),
    attachments: [
      { id: "att-10", type: "document", refId: "doc-rec-v3", label: "추천 알고리즘 v3 기획서", href: "/docs/doc-rec-v3" },
    ],
    actions: [
      { id: "act-11", type: "reply", label: "답장", variant: "primary" },
    ],
    teamId: "team-commerce",
  },

  // 9. Pln Agent - 일정 충돌 분석
  {
    id: "inbox-9",
    category: "agent_report",
    priority: "high",
    status: "read",
    starred: false,
    senderAgentId: "agent-pln",
    senderAgentLabel: "Pln",
    subject: "이번 주 일정 충돌 분석",
    preview: "2건의 일정 충돌이 감지되었습니다. 우선순위 조정이 필요합니다.",
    body: `## 일정 충돌 분석

**기간**: 4월 1주차 (4/1 ~ 4/5)
**충돌 건수**: 2건

### 충돌 1: BE Agent 과부하
- TICKET-42 (정기결제 SDK 교체): 16h
- TICKET-44 (API Rate Limiting): 8h
- **합계 24h > 가용 20h**
- 🔧 제안: TICKET-44를 다음 주로 이동

### 충돌 2: 디자인 리뷰 병목
- TICKET-45 (관리자 대시보드) — Dsn Agent 리뷰 대기
- TICKET-47 (모바일 UI 개선) — Dsn Agent 리뷰 대기
- 🔧 제안: TICKET-47을 PM에게 1차 리뷰 위임

조정 방향을 알려주시면 일정을 업데이트하겠습니다.`,
    threadId: "inbox-9",
    thread: [],
    hasUnreadReply: false,
    createdAt: h(8),
    updatedAt: h(8),
    attachments: [
      { id: "att-11", type: "url", refId: "", label: "일정 보기", href: "/schedule" },
    ],
    actions: [
      { id: "act-12", type: "reply", label: "답장", variant: "primary" },
    ],
  },

  // 10. External - 외주 제안
  {
    id: "inbox-10",
    category: "external_update",
    priority: "normal",
    status: "read",
    starred: false,
    senderSystem: "외부 연동",
    subject: "Kakao Pay 외주 제안: 정기결제 SDK 고도화",
    preview: "Kakao Pay에서 정기결제 SDK 고도화 외주 제안이 도착했습니다.",
    body: `## 외주 제안 도착

**발신**: Kakao Pay 기술파트너십팀
**제안명**: 정기결제 SDK v3 고도화 지원

### 제안 내용
- SDK v3 마이그레이션 기술 지원 (2주)
- 커스텀 웹훅 개발
- 부하 테스트 및 안정성 검증

### 비용
- 기본: ₩8,000,000
- 부하 테스트 포함: ₩10,500,000

### 일정
- 착수 가능: 4월 2주차
- 완료 예정: 4월 4주차

검토 후 진행 여부를 결정해 주세요.`,
    threadId: "inbox-10",
    thread: [],
    hasUnreadReply: false,
    createdAt: h(10),
    updatedAt: h(10),
    attachments: [
      { id: "att-12", type: "url", refId: "", label: "외주 관리", href: "/external" },
    ],
    actions: [
      { id: "act-13", type: "navigate", label: "제안 상세", variant: "primary" },
    ],
  },

  // 11. System - 보안 알림
  {
    id: "inbox-11",
    category: "system_alert",
    priority: "critical",
    status: "read",
    starred: false,
    senderSystem: "Wiring Security",
    subject: "보안 이상 감지: 비정상 API 호출 패턴",
    preview: "플랫폼팀 API v3 엔드포인트에서 비정상적인 호출 패턴이 감지되었습니다.",
    body: `## 보안 이상 감지

**심각도**: Critical
**감지 시각**: ${h(12)}
**대상**: 플랫폼팀 API v3 엔드포인트

### 감지 내역
- 5분 내 동일 엔드포인트 1,200회 호출 (평균 대비 15배)
- 요청 패턴: 순차적 ID 스캔 의심
- 원본 IP: 내부 개발 환경 (192.168.1.xxx)

### 자동 대응
- Rate limiting 강화 적용 완료
- 해당 IP 임시 차단 (30분)

### 조사 결과 (BE Agent)
> 부하 테스트 스크립트가 프로덕션 환경을 대상으로 실행된 것으로 확인. 개발 환경 설정 오류로 판단됩니다.

환경 설정 검토 후 차단 해제가 필요합니다.`,
    threadId: "inbox-11",
    thread: [],
    hasUnreadReply: false,
    createdAt: h(12),
    updatedAt: h(12),
    attachments: [],
    actions: [
      { id: "act-14", type: "acknowledge", label: "확인", variant: "primary" },
    ],
    teamId: "team-platform",
  },

  // 12. FE Agent - 대화 (컴포넌트 마이그레이션)
  {
    id: "inbox-12",
    category: "agent_conversation",
    priority: "normal",
    status: "read",
    starred: false,
    senderAgentId: "agent-fe",
    senderAgentLabel: "FE",
    subject: "컴포넌트 라이브러리 마이그레이션 제안",
    preview: "현재 사용 중인 UI 컴포넌트 중 5개가 deprecated 상태입니다. 마이그레이션을 제안합니다.",
    body: `## 컴포넌트 마이그레이션 제안

현재 프로젝트에서 사용 중인 UI 컴포넌트 중 일부가 deprecated 되었습니다.

### Deprecated 컴포넌트 (5개)
1. \`Dialog\` → \`@base-ui/react\` Dialog로 전환
2. \`DropdownMenu\` → Base UI Menu로 전환
3. \`Select\` → Base UI Select로 전환
4. \`Popover\` → Base UI Popover로 전환
5. \`Tooltip\` → 이미 전환 완료 ✅

### 영향 범위
- 총 23개 파일, 45개 사용처
- 예상 소요: 8시간

### 제안
한 번에 전환하면 리스크가 크므로, 컴포넌트별 순차 마이그레이션을 권장합니다.

진행 여부를 알려주세요.`,
    threadId: "inbox-12",
    thread: [
      {
        id: "thread-12-1",
        role: "user",
        content: "Dialog부터 시작하자. 영향 범위가 가장 큰 게 뭐야?",
        timestamp: h(15),
      },
      {
        id: "thread-12-2",
        role: "agent",
        agentId: "agent-fe",
        agentLabel: "FE",
        content: `Dialog 사용처 분석 결과:

- \`ticket-detail-dialog.tsx\`: 가장 복잡 (450줄, 중첩 Dialog 포함)
- \`add-ticket-dialog.tsx\`: 폼 포함 (280줄)
- \`add-epic-dialog.tsx\`: 단순 (120줄)
- \`add-project-dialog.tsx\`: 단순 (150줄)
- \`keyboard-help.tsx\`: 정보 표시용 (90줄)

\`ticket-detail-dialog.tsx\`가 가장 영향이 크고 복잡합니다. 여기를 먼저 마이그레이션하고 패턴을 확립한 뒤 나머지를 진행하는 것을 권장합니다.`,
        timestamp: h(14.5),
      },
    ],
    hasUnreadReply: false,
    createdAt: h(16),
    updatedAt: h(14.5),
    attachments: [],
    actions: [
      { id: "act-15", type: "reply", label: "답장", variant: "primary" },
    ],
  },

  // 13. PM Agent - 에이전트 성과 리포트
  {
    id: "inbox-13",
    category: "agent_report",
    priority: "low",
    status: "read",
    starred: false,
    senderAgentId: "agent-pm",
    senderAgentLabel: "PM",
    subject: "3월 에이전트 성과 요약",
    preview: "9개 에이전트의 3월 성과를 요약했습니다. 전체 티켓 처리율 92%...",
    body: `## 3월 에이전트 성과 요약

**전체 티켓 처리율**: 92% (목표: 90%)
**평균 응답 시간**: 4.2분

### 에이전트별 성과
| 에이전트 | 처리 티켓 | 완료율 | 평균 품질 |
|---|---|---|---|
| FE Agent | 28 | 96% | 4.5/5 |
| BE Agent | 32 | 94% | 4.3/5 |
| SM Agent | 15 | 87% | 4.7/5 |
| Dsn Agent | 18 | 89% | 4.2/5 |

### 개선 필요 사항
- Dsn Agent: 디자인 리뷰 속도 개선 필요
- BE Agent: 테스트 커버리지 목표(80%) 미달 (현재 72%)

상세 분석이 필요하면 답장해 주세요.`,
    threadId: "inbox-13",
    thread: [],
    hasUnreadReply: false,
    createdAt: h(24),
    updatedAt: h(24),
    attachments: [
      { id: "att-13", type: "url", refId: "", label: "에이전트 모니터링", href: "/agents" },
    ],
    actions: [],
  },

  // 14. BE Agent - 티켓 상태 변경
  {
    id: "inbox-14",
    category: "ticket_update",
    priority: "normal",
    status: "read",
    starred: false,
    senderAgentId: "agent-be",
    senderAgentLabel: "BE",
    subject: "티켓 상태 변경: API Rate Limiting → In Progress",
    preview: "BE Agent가 API Rate Limiting 티켓 작업을 시작했습니다.",
    body: `## 티켓 상태 변경

**티켓**: TICKET-44 API Rate Limiting 구현
**변경**: Todo → In Progress
**담당**: BE Agent

### 작업 계획
1. Token bucket 알고리즘 구현 (2h)
2. Redis 기반 분산 Rate Limiting (4h)
3. 미들웨어 적용 및 테스트 (2h)

예상 완료: 내일 오전`,
    threadId: "inbox-14",
    thread: [],
    hasUnreadReply: false,
    createdAt: h(26),
    updatedAt: h(26),
    attachments: [
      { id: "att-14", type: "ticket", refId: "ticket-44", label: "TICKET-44", href: "/team/team-platform/project/proj-pl-1" },
    ],
    actions: [],
    ticketId: "ticket-44",
    teamId: "team-platform",
  },

  // 15. BM Agent - HITL 모델 배분 승인
  {
    id: "inbox-15",
    category: "hitl_request",
    priority: "normal",
    status: "read",
    starred: false,
    senderAgentId: "agent-bm",
    senderAgentLabel: "BM",
    subject: "모델 배분 승인 요청: 플랫폼팀 Opus 비율 조정",
    preview: "플랫폼팀의 Opus 4 사용 비율을 60% → 40%로 조정 요청합니다.",
    body: `## 모델 배분 승인 요청

**대상**: 플랫폼팀
**요청**: Opus 4 사용 비율 60% → 40% 조정

### 배경
플랫폼팀 예산이 97%에 도달하여 비용 절감이 필요합니다.

### 현재 배분
- Opus 4: 60% ($174)
- Sonnet 4: 30% ($87)
- Haiku 4.5: 10% ($29)

### 제안 배분
- Opus 4: 40% ($116) — 코드 리뷰/아키텍처만
- Sonnet 4: 45% ($131) — 일반 코딩
- Haiku 4.5: 15% ($44) — 분류/포맷팅

**예상 절감**: 월 $58 (20%)`,
    threadId: "inbox-15",
    thread: [],
    hasUnreadReply: false,
    createdAt: h(28),
    updatedAt: h(28),
    attachments: [
      { id: "att-15", type: "hitl", refId: "hitl-6", label: "HITL-6 모델 배분", href: "/hitl/hitl-6" },
    ],
    actions: [
      { id: "act-16", type: "approve", label: "승인", variant: "primary", hitlItemId: "hitl-6" },
      { id: "act-17", type: "reject", label: "반려", variant: "danger", hitlItemId: "hitl-6" },
    ],
    hitlItemId: "hitl-6",
    teamId: "team-platform",
  },

  // 16. Dsn Agent - 디자인 리뷰 완료
  {
    id: "inbox-16",
    category: "ticket_update",
    priority: "normal",
    status: "read",
    starred: false,
    senderAgentId: "agent-dsn",
    senderAgentLabel: "Dsn",
    subject: "디자인 리뷰 완료: 모바일 UI 개선",
    preview: "모바일 UI 개선 디자인 리뷰가 완료되었습니다. 3건의 피드백이 있습니다.",
    body: `## 디자인 리뷰 완료

**티켓**: TICKET-47 모바일 UI 개선
**결과**: 조건부 승인 (피드백 반영 필요)

### 피드백 (3건)
1. **터치 타겟 크기**: CTA 버튼 최소 44px 확보 필요 (현재 36px)
2. **색상 대비**: 보조 텍스트 WCAG AA 기준 미달 (#999 → #767676 이상)
3. **레이아웃**: 카드 간 여백 12px → 16px로 조정 권장

피드백 반영 후 최종 승인 진행하겠습니다.`,
    threadId: "inbox-16",
    thread: [],
    hasUnreadReply: false,
    createdAt: h(32),
    updatedAt: h(32),
    attachments: [
      { id: "att-16", type: "ticket", refId: "ticket-47", label: "TICKET-47", href: "/team/team-commerce/project/proj-cm-1" },
    ],
    actions: [],
    ticketId: "ticket-47",
    teamId: "team-commerce",
  },
];
