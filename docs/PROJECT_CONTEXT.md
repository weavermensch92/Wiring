# GRIDGE Wiring AI — 프로젝트 컨텍스트 문서

> 마지막 업데이트: 2026-04-04 (Phase 17~28 완료)
> 브랜치: `claude/dev-management-groupware-ui-6hnmp` (main에 머지 완료)

---

## 1. 제품 개요

**GRIDGE Wiring AI** (줄임말: Wiring, 내부 코드명: 불혹)
- AI 기반 개발 관리 그룹웨어 — 팀 단위 Claude Code/Cursor/Codex에 대한 **관제 센터**
- AI Agent가 액션 수행, 사람이 HITL(Human-in-the-Loop) 과정에서 확인/승인
- 레퍼런스: Jira + Slack 하이브리드

---

## 2. 기술 스택

| 영역 | 선택 | 버전 |
|------|------|------|
| Framework | Next.js (App Router) | 16.2.2 |
| Language | TypeScript | — |
| UI Library | shadcn/ui + @base-ui/react | — |
| Styling | Tailwind CSS + CSS Variables | — |
| State (Client) | Zustand | — |
| Drag & Drop | @dnd-kit/core + @dnd-kit/sortable | 6.3.1 / 10.0.0 |
| Flowchart | @xyflow/react (React Flow) | 12.10.2 |
| Animation | framer-motion | — |
| Icons | Lucide React | — |
| Package Manager | pnpm | — |
| 언어 정책 | UI 텍스트: 한국어, 코드/변수명: 영어 | — |

### AGENTS.md 주의사항
`AGENTS.md`에 명시: "This is NOT the Next.js you know. Read `node_modules/next/dist/docs/` before writing code." — Next.js 16은 breaking changes가 있을 수 있으므로 API 확인 필수.

---

## 3. 구현 완료 단계 (Phase 1~16)

### Phase 1: 프로젝트 초기화 + 네비게이션 재설계
- 글래스모피즘 다크 테마 디자인 시스템
- 4구역 레이아웃: IconNav | SubNav | MainWorkspace | ChatPanel
- 동적 팀 네비게이션 (`team-${string}` NavSection)
- 5개 SubNav: Home/Team(Jira-style)/Skills/Governance/Settings

### Phase 2: 칸반보드 + 프로젝트 워크스페이스
- 데이터 모델 통합 (TeamProject 제거 → Project에 teamId)
- 9개 프로젝트, 에픽, 티켓 더미 데이터
- @dnd-kit 기반 칸반보드 (5컬럼: Backlog/Todo/InProgress/Review/Done)
- `/team/[teamId]/project/[projectId]` 라우트
- 프로젝트 워크스페이스 탭 (보드/타임라인/플로차트)
- 티켓 추가 Dialog, 티켓 클릭 → 상세 패널

### Phase 3: 플로차트 뷰 + 데이터 기반 홈
- React Flow 기반 플로차트 (커스텀 노드: Ticket/HITL/Epic)
- 자동 트리 레이아웃 (Epic → Ticket → HITL)
- 의존성 엣지, 애니메이션 상태 표시
- 홈 대시보드 실제 데이터 기반 (KPI 카드, 팀 목록, 진행 중 티켓)

### Phase 4: HITL 상세 페이지 + 타임라인 뷰
- HITL 상세 페이지 6가지 유형별 UI:
  - code_review, security_approval, spec_decision, design_review, assignment, model_allocation
- 승인/반려/에스컬레이션 버튼 (스토어 연동)
- 타임라인(간트) 뷰: 에픽/티켓별 진행 바

### Phase 5: Jira 스타일 티켓 상세 Dialog
- Sheet → Dialog 전환 (90vw × 85vh 오버레이)
- 2컬럼 레이아웃: 좌(설명/하위작업/활동) | 우(상태/세부정보/시간비용/HITL)
- 하위 작업 체크리스트 (추가/토글)
- 댓글 시스템 (Agent/Human 구분)
- 활동 히스토리 탭 (모두/댓글/기록)
- 상태 드롭다운, 우선순위 드롭다운 (인라인 수정)
- HITL 연결 표시 + 링크
- 타입 확장: Subtask, TicketComment, TicketActivity
- 스토어 확장: subtasks, comments, activities + addComment, toggleSubtask, addSubtask

### Phase 6: 에이전트 현황 모니터링 페이지 (`/agents`)
- KPI 카드 (전체/활성/대기/오늘 총 비용)
- 에이전트 카드 그리드: 역할·오늘 비용·완료 티켓·주 모델 표시
- 우측 상세 패널 (클릭 시): 통계, 현재 작업, 작업 이력, 소통 로그
- 소통 피드: 전체 / 에이전트 필터 탭
- 타입 확장: Agent에 role/todayCostUsd/primaryModel/AgentWorkHistory 추가
- 더미 추가: DUMMY_AGENT_MESSAGES (10개), DUMMY_AGENT_WORK_HISTORY (10개)

### Phase 7: 외부 업무 관리 (`/external`)
- 3탭: 새 제안 / 진행 중 / 완료·정산
- KPI: 누적 수익, 이번 달, 정산 대기, 완료 건수
- 제안 카드 클릭 → 상세 Dialog (수락/거절, HR 매칭 점수, 마감 D-day)
- 진행 중: 진행률 바 + 산출물 목록
- 완료: 정산 상태 (pending/requested/paid)
- 타입 신규: ExternalWorkProposal, ExternalWork, ExternalEarningsSummary
- aiAssistLevel (full/assisted/human_only) 개념 도입

### Phase 8: 거버넌스 페이지 (`/governance`)
- 4탭: 개요 / 데이터 소스·분류 / 접근 정책 / 감사 로그
- 테이블/컬럼 드릴다운, 미분류 컬럼 인라인 분류 버튼
- 역할×데이터레벨 접근 정책 매트릭스 (Agent/L1~L4/외부전문가)
- 감사 로그: 액션 유형별 필터 (auto_allow/denied/request_sent/temp_allow)
- 더미 추가: DUMMY_TEMPORARY_PERMISSIONS (임시 권한)
- governance-store에 DUMMY_TEMPORARY_PERMISSIONS 초기값 연결

### Phase 9: 스킬 페이지 (`/skills`)
- 3탭: 스킬 라이브러리 / 문서 번들 / AI 활용 리포트
- 라이브러리: 검색 + 범위(전사/팀)/카테고리 필터 + 우측 상세 패널
- 문서 번들: 생성 상태(완료/생성 중/업데이트 필요) + 에이전트 아바타
- AI 활용 리포트: KPI + 인기 스킬 TOP5 바 차트 + 에이전트별 사용량
- 타입 신규: Skill, SkillDocument, SkillUsageSummary
- 더미 신규: skills.ts (스킬 10개, 문서 5개, 사용 요약)

### Phase 10: 설정 페이지 (`/settings`)
- 3탭: AI 설정 / 외부 업무 정책 / 팀 관리
- AI 설정: HITL 모드 선택(항상/리스크기반/자동), 기본 모델, 월 비용 한도
- 외부 업무 정책: 수신 허용, HR 자동 매칭, 수락 기준(시급/매칭점수)
- 팀 관리: 팀 목록 + 팀원 드릴다운 + API 키 관리

### Phase 11: 팀 예산 관리 (`/team/[teamId]/budget`)
- 팀 전체 예산 소진율 (KPI 4개 + 진행 바)
- 프로젝트별 예산 소진 현황
- 에이전트별 오늘 비용 바 차트
- 에픽별 상세 비용 테이블
- SubNav "팀 예산" → 라우팅 연결

### Phase 12: 채팅 패널 고도화
- 컨텍스트 인식 응답 (ticket/hitl/epic/general 별 다른 응답 생성)
- 빠른 질문 버튼 (컨텍스트별 3개 제안)
- 타임스탬프 표시, 에이전트 이름 표시
- 메시지 하단 자동 스크롤

### Phase 13: 홈 SubNav 실데이터 연결
- 내 HITL 큐: waitingCount 실시간, 클릭 시 첫 번째 대기 항목으로 이동
- 인박스: waitingCount 뱃지, HITL 큐로 이동
- 최근 열람: 활성 프로젝트 3개 실데이터
- 외주 업무 항목: /external 라우팅 연결

### Phase 14: 레거시 페이지 정리
- `/dashboard` → `/home` 리다이렉트
- `/documents` → `/skills` 리다이렉트
- `/flowchart` → `/home` 리다이렉트
- `/tickets` → `/home` 리다이렉트
- Kanban hydration 버그 수정 (`DndContext` isMounted 가드)

### Phase 15: 플로차트 재개편 + 루틴 + SubNav 드릴다운 + HITL 의결
- 플로차트 좌→우(LR) 레이아웃으로 전환
- 티켓 클릭 시 서브태스크 노드 전개 (SubtaskNode 신규)
- 루틴 플로차트 통합: RoutineNode 신규, 상시 루틴(좌측 레인) / 에픽 루틴(에픽 앞)
- routine.ts에 `epicId?` 필드 추가
- SubNav 4단계 드릴다운: 프로젝트→에픽→티켓→서브태스크 접기/펼치기
- navigation-store에 expandedProjects/expandedEpics/expandedTickets + ticketDialog 상태 추가
- app-shell에 전역 TicketDetailDialog (SubNav에서 열 수 있도록)
- HITL 에스컬레이션: 상위 레벨 선택 + 사유 입력 UI
- HITL 위임: 하위 레벨 선택 + 사유 입력 UI
- DecisionRecord 타입 추가, decisionHistory 필드 추가
- 의결 이력 타임라인 UI
- 무한 루프 버그 수정 (flowchart useMemo + useEffect 패턴 제거)

### Phase 16: SubNav 완성 + 팀 피드 + 문서 동기화
- Skills/Governance/Settings SubNav → 탭 딥링크 (`?tab=xxx`) 연결
- 각 페이지 URL 쿼리 파라미터로 탭 초기화
- 팀 피드 페이지 신규 (`/team/[teamId]/feed`): 에이전트 소통·HITL·티켓·루틴 통합 피드
- SubNav "팀 피드" 항목 라우팅 연결
- 홈 SubNav "인박스" 실 HITL 대기 수 표시 및 클릭 라우팅

---

## 4. 파일 구조

### 4.1 Types (`src/types/`)

| 파일 | 설명 |
|------|------|
| `project.ts` | Project, Epic, Ticket, Subtask, TicketComment, TicketActivity |
| `team.ts` | Team 인터페이스 |
| `user.ts` | User 인터페이스 |
| `navigation.ts` | NavSection 유니온 타입 (`home \| skills \| governance \| settings \| team-${string}`) |
| `hitl.ts` | HITLQueueItem, HITLType, HITLStatus, ModelAllocationData, ModelAllocationAgent |
| `agent.ts` | Agent, AgentMessage, CommunicationTopology, ModelAllocation |
| `chat.ts` | ChatContext, ChatMessage |
| `governance.ts` | 거버넌스 관련 타입 |
| `flowchart.ts` | 플로차트 관련 타입 |
| `routine.ts` | 루틴 업무 타입 |
| `external.ts` | 외부 업무 타입 |
| `document.ts` | WiringDocument 타입 (spec/design/meeting/technical/runbook/report) |
| `skill.ts` | Skill, SkillDocument, SkillUsageSummary |

### 4.2 핵심 타입 상세

```typescript
// Project 계층: Project → Epic → Ticket → Subtask
interface Ticket {
  id: string;              // e.g. "t-cm1-2"
  epicId: string;
  title: string;
  description: string;
  status: TicketStatus;    // "backlog"|"todo"|"in_progress"|"review"|"done"
  priority: Priority;      // "critical"|"high"|"medium"|"low"
  assignedAgent: string | null;  // AI Agent (PM/GM/SM/Dsn/Pln/FE/BE/BM/HR)
  assignedHuman?: { id: string; name: string; level: string } | null;
  estimatedHours: number;
  actualHours?: number;
  costUsd?: number;
  subtaskIds?: string[];
  hitlRequired?: boolean;
  hitlType?: string;
  dependsOn?: string[];
  createdAt?: string;
  updatedAt?: string;
  labels?: string[];
}

interface TicketComment {
  id: string;
  ticketId: string;
  author: { type: "human" | "agent"; name: string; id: string };
  content: string;
  timestamp: string;
}

interface TicketActivity {
  id: string;
  ticketId: string;
  type: "status_change" | "assignment" | "comment" | "hitl_request" | "cost_update";
  description: string;
  timestamp: string;
}

// HITL 항목은 ticketId로 티켓에 연결됨
interface HITLQueueItem {
  id: string;
  type: HITLType;  // 7가지 유형
  ticketId?: string;  // 티켓 연결 (optional)
  epicId: string;
  status: HITLStatus;  // "waiting"|"in_progress"|"approved"|"rejected"|"escalated"
  // ... 유형별 추가 필드 (options, candidates, allocation, dataAccessRequest 등)
}
```

### 4.3 Stores (`src/stores/`)

| 파일 | 상태 | 주요 액션 |
|------|------|----------|
| `project-store.ts` | projects, epics, tickets, subtasks, comments, activities | moveTicket, addTicket, updateTicket, addComment, toggleSubtask, addSubtask |
| `navigation-store.ts` | activeSection, activeProjectId, subNavCollapsed | setActiveSection, setActiveProjectId, toggleSubNav |
| `layout-store.ts` | chatPanelOpen, subNavWidth, chatPanelWidth | toggleChatPanel, setChatPanelOpen |
| `hitl-store.ts` | queueItems, activeItemId | approveItem, rejectItem, escalateItem, addItem |
| `chat-store.ts` | currentContext, histories | addMessage, setContext |
| `agent-store.ts` | agents 상태 | — |
| `flowchart-store.ts` | 플로차트 상태 | — |
| `governance-store.ts` | 거버넌스 상태 | — |

### 4.4 Dummy Data (`src/dummy/`)

| 파일 | 내용 |
|------|------|
| `teams.ts` | 5개 팀 (커머스/결제/콘텐츠/플랫폼/그로스), getTeamsForUser() |
| `users.ts` | 5명 유저, CURRENT_USER = 김CTO (user-1, L3, 전 팀 소속) |
| `projects.ts` | 9개 프로젝트, 에픽, 티켓(~50개), 서브태스크, 댓글, 활동 이력 |
| `hitl.ts` | 6개 HITL 큐 항목 (code_review, security, spec, assignment, design, model_allocation) |
| `agents.ts` | 9개 AI Agent 더미 |
| `chat.ts` | 채팅 히스토리 더미 |
| `governance.ts` | 거버넌스 더미 |
| `flowchart.ts` | 플로차트 더미 |
| `routines.ts` | 루틴 업무 더미 |
| `external.ts` | 외부 업무 더미 |
| `documents.ts` | 10개 WiringDocument (팀/프로젝트별 스펙·회의록·런북 등) |
| `notifications.ts` | 8개 알림 더미 (hitl/ticket/agent/budget/external 유형) |

### 4.5 Components

#### Layout (`src/components/layout/`)
| 파일 | 설명 |
|------|------|
| `app-shell.tsx` | 최상위 레이아웃 (IconNav + SubNav + MainWorkspace + ChatPanel) |
| `icon-nav.tsx` | 좌측 아이콘 네비: Home(고정) → 팀(동적, 스크롤) → Skills/Governance(고정) → Settings/Profile(하단) |
| `sub-nav-panel.tsx` | 컨텍스트별 SubNav (Home/Team/Skills/Governance/Settings), NavRow/CollapsibleSection/SearchBar |
| `top-bar.tsx` | 상단 바: 뒤로/앞으로, 브레드크럼(팀/프로젝트 동적), 검색, HITL 뱃지, 채팅 토글 |
| `main-workspace.tsx` | 메인 콘텐츠 영역 (children 렌더) |
| `chat-panel.tsx` | 우측 AI 채팅 패널 (framer-motion 슬라이드, Agent별 아바타) |

#### Project (`src/components/project/`)
| 파일 | 설명 |
|------|------|
| `kanban-board.tsx` | DndContext + 5컬럼 + DragOverlay + 티켓 상세 Dialog 연결 |
| `kanban-column.tsx` | useDroppable + SortableContext, 컬럼 헤더 + 카드 목록 |
| `kanban-card.tsx` | useSortable, 우선순위/HITL/Agent 표시, 드래그 핸들 |
| `ticket-detail-dialog.tsx` | Jira 스타일 2컬럼 Dialog (설명/서브태스크/활동 \| 상태/세부정보/HITL) |
| `add-ticket-dialog.tsx` | 새 티켓 추가 Dialog (제목/설명/우선순위/Agent/시간) |
| `project-workspace.tsx` | 탭 컨테이너: 보드/타임라인/플로차트 |
| `flowchart-view.tsx` | ReactFlow + 커스텀 노드 + 자동 레이아웃 + 통계 패널 |
| `flowchart-nodes.tsx` | TicketNode/HITLNode/EpicNode 커스텀 React Flow 노드 |
| `timeline-view.tsx` | 간트 스타일 타임라인 (에픽/티켓 행, 주간 컬럼) |

#### UI (`src/components/ui/`)
shadcn/ui 기반 (모두 @base-ui/react 프리미티브 사용):
`avatar, badge, button, dialog, dropdown-menu, input, progress, scroll-area, separator, sheet, slider, tabs, tooltip`

### 4.6 Routes (`src/app/`)

| 라우트 | 설명 |
|--------|------|
| `/` | → `/home` 리다이렉트 |
| `/home` | 데이터 기반 대시보드 (KPI, 팀 목록, 활성 티켓) |
| `/team/[teamId]` | 팀 오버뷰 (KPI, 프로젝트 목록) |
| `/team/[teamId]/project/[projectId]` | 프로젝트 워크스페이스 (보드/타임라인/플로차트 탭) |
| `/team/[teamId]/budget` | 팀 예산 관리 (전체 예산, 프로젝트별, 에이전트별) |
| `/team/[teamId]/feed` | 팀 피드 (에이전트 소통·HITL·티켓·루틴 통합) |
| `/hitl/[itemId]` | HITL 상세 (7유형 UI, 승인/반려/에스컬레이션/위임 + 의결 이력) |
| `/skills` | 스킬 라이브러리·문서 번들·AI 활용 리포트 (탭 딥링크: ?tab=) |
| `/governance` | 거버넌스 4탭 (개요/분류/정책/감사로그, 탭 딥링크: ?tab=) |
| `/settings` | 설정 3탭 (AI설정/외부정책/팀관리, 탭 딥링크: ?tab=) |
| `/agents` | 에이전트 현황 + 소통 피드 + 상세 패널 |
| `/external` | 외부 업무 관리 (제안/진행/완료 3탭) |
| `/analytics` | 분석 대시보드 (4탭: 티켓 추이/에이전트 비용/HITL 대기/팀 속도) |
| `/activity` | 전사 활동 로그 (날짜 그룹, 5탭 필터) |
| `/profile` | 유저 프로필 (개요/HITL 의결/알림 설정 3탭) |
| `/docs` | 문서 라이브러리 (목록/검색/필터) |
| `/docs/[docId]` | 문서 상세 + 마크다운 에디터 (split view) |
| `/dashboard`, `/documents`, `/flowchart`, `/tickets` | 레거시 → 리다이렉트 처리 완료 |

---

## 5. 데이터 관계도

```
Company (전사)
├── Team (프로덕트/서비스 단위, 5개)
│   ├── Project (teamId로 연결, 9개)
│   │   ├── Epic (projectId로 연결)
│   │   │   ├── Ticket (epicId로 연결)
│   │   │   │   ├── Subtask (ticketId로 연결)
│   │   │   │   ├── TicketComment (ticketId로 연결)
│   │   │   │   ├── TicketActivity (ticketId로 연결)
│   │   │   │   └── HITLQueueItem (ticketId로 연결, optional)
│   │   │   │       └── 6가지 유형별 추가 데이터
│   │   │   └── Ticket.dependsOn → 다른 Ticket 참조
│   │   └── Epic.dependsOn → 다른 Epic 참조
│   └── User.teamIds[] (다대다: 유저가 여러 팀 소속)
├── User (5명, CURRENT_USER = 김CTO)
├── AI Agent (9종: PM/GM/SM/Dsn/Pln/FE/BE/BM/HR)
└── Governance (전사 레벨만, 팀 내 거버넌스 없음)
```

### 팀 목록
| ID | 이름 | 약어 | 색상 | 프로젝트 |
|----|------|------|------|----------|
| team-commerce | 커머스팀 | CM | #8B5CF6 | proj-cm-1, proj-cm-2 |
| team-payment | 결제팀 | PY | #F97316 | proj-py-1, proj-py-2 |
| team-content | 콘텐츠팀 | CT | #06B6D4 | proj-ct-1 |
| team-platform | 플랫폼팀 | PF | #10B981 | proj-pf-1, proj-pf-2, proj-pf-3 |
| team-growth | 그로스팀 | GR | #EC4899 | proj-gr-1 |

---

## 6. 디자인 시스템

### CSS Variables (글래스모피즘 다크 테마)
```
--wiring-bg-primary: #0F0F14       (배경)
--wiring-bg-secondary: #1A1A24     (카드/패널)
--wiring-bg-tertiary: #242430      
--wiring-accent: #7C5CFC           (보라색 액센트)
--wiring-accent-glow: rgba(124,92,252,0.1)
--wiring-glass-bg: rgba(255,255,255,0.03)
--wiring-glass-border: rgba(255,255,255,0.06)
--wiring-glass-hover: rgba(255,255,255,0.05)
--wiring-text-primary: #EAEAF0
--wiring-text-secondary: #9494A8
--wiring-text-tertiary: #5C5C6F
--wiring-success: #22C55E
--wiring-warning: #F59E0B
--wiring-danger: #EF4444
--wiring-info: #3B82F6
--hitl-waiting: #FBBF24            (HITL 대기 전용)
```

### 글래스 패널 스타일
```css
.glass-panel {
  background: var(--wiring-glass-bg);
  border: 1px solid var(--wiring-glass-border);
  border-radius: 12px;
  backdrop-filter: blur(20px);
}
```

---

## 7. 핵심 설계 원칙

1. **팀은 프로덕트/서비스 단위** (FE/BE 같은 기술 직군 아님)
2. **거버넌스는 전사 레벨만** (팀 내 거버넌스 없음, GM Agent가 전사 관할)
3. **HITL = 사람이 최종 결정** (AI가 제안, 사람이 승인/반려)
4. **유저는 여러 팀에 소속 가능** (User.teamIds 배열)
5. **네비게이션: 홈(고정) → 팀(동적) → 스킬/거버넌스(고정)** 순서
6. **홈에서 내부 업무 / 외주 업무 구분**

---

## 8. AI Agent 시스템 (9종)

| Agent | 역할 |
|-------|------|
| PM | 업무 분배, 티켓 발행, 일정 관리, Agent 고용 |
| GM | 거버넌스, 코드 의존성 검토, HITL 승인 감독 |
| SM | 기술 스펙 결정, 프레임워크 제안 |
| Dsn | UI 디자인 수행 |
| Pln | 기획서 제작, 하위 티켓 생성 |
| FE | 프론트엔드 개발 |
| BE | 백엔드 개발 |
| BM | 토큰/인력 비용 평가 |
| HR | HITL 인력 시간 고려, 자원 제안 |

Agent 색상: `src/lib/constants.ts` → `AGENT_COLORS`

---

## 9. 미구현 / 향후 작업

### Phase 17: 문서 라이브러리 (`/docs`, `/docs/[docId]`)
- `/docs` 문서 목록 페이지: 유형/상태/검색 필터, KPI 카드
- `/docs/[docId]` 문서 상세+에디터: 읽기 모드(마크다운 렌더링+사이드 메타) / 편집 모드(split view)
- 마크다운 → HTML 렌더러 (h1~h3, bold, code, table, list, hr 지원)
- 타입 신규: WiringDocument (spec/design/meeting/technical/runbook/report)
- 더미 신규: documents.ts (10개 문서, 각 팀/프로젝트별)
- HomeSubNav "문서 라이브러리" 항목 추가, SkillsSubNav "전체 문서 →" 링크 연결

### Phase 18: 글로벌 검색 (Cmd+K / Ctrl+K)
- GlobalSearch 모달 컴포넌트 (`src/components/layout/global-search.tsx`)
- 프로젝트·티켓·HITL·에이전트·문서 퍼지 검색 (score 기반 랭킹)
- 키보드 네비게이션 (↑↓ 탐색, Enter 이동, ESC 닫기)
- app-shell.tsx에 Cmd+K 단축키 등록
- layout-store에 `searchOpen` 상태 추가
- top-bar 검색 인풋 → 클릭 가능 검색 버튼으로 교체 (⌘K 힌트 표시)
- top-bar 브레드크럼에 /docs, /schedule 경로 추가

### Phase 19: 알림 센터
- NotificationPanel 컴포넌트 (`src/components/layout/notification-panel.tsx`)
- top-bar에 벨 아이콘 + 읽지 않은 알림 뱃지 (빨간 숫자)
- 알림 유형: hitl_waiting / ticket_assigned / ticket_done / agent_message / budget_alert / external_proposal
- 더미 신규: notifications.ts (8개 알림, 3개 미읽음)
- 알림 클릭 시 해당 페이지 이동 + 읽음 처리
- "모두 읽음" 버튼, 외부 클릭 시 닫기

### Phase 20: 분석 대시보드 (`/analytics`) — recharts 본격 활용
- `/analytics` 라우트 신규 (4탭: 전체 개요/에이전트/HITL/팀 속도)
- recharts 첫 활용: AreaChart(티켓 추이), LineChart(에이전트 비용), BarChart(팀 속도 비교)
- PieChart (모델 사용 분포), 수평 BarChart (에이전트 효율)
- 더미 신규: analytics.ts (14일치 daily stats, HITL 대기 통계, 팀 속도, 번다운 데이터)
- IconNav/SubNav에 "분석" 항목 추가 (BarChart3 아이콘)
- NavSection 타입에 "analytics" 추가

### Phase 21: 프로젝트 개요 탭
- ProjectWorkspace에 "개요" 탭 신규 추가 (기본 탭으로 설정)
- ProjectOverview 컴포넌트 (`src/components/project/project-overview.tsx`)
  - 4개 KPI (전체/완료/HITL/비용)
  - 번다운 차트 (AreaChart, 이상/실제 비교)
  - 에픽별 진행률 (진행 바)
  - 티켓 상태 분포 (수평 BarChart)
  - 에이전트 기여 (진행 바 + 아바타)
  - 최근 완료 티켓 리스트

### Phase 22: Agent 페이지 고도화
- 3탭 구조: 현황 / 분석 / 토폴로지
- **분석 탭**: 모델 사용 분포 PieChart + 에이전트 효율 BarChart + 7일 비용 LineChart
- **토폴로지 탭**: React Flow 기반 에이전트 소통 그래프
  - 원형 레이아웃, 메시지 수 기반 엣지 강도
  - 활성 에이전트 엣지 animated, pulse 애니메이션
  - 각 노드에 메시지 수 배지
- KPI 영역 헤더로 이동, 상태 pulse 애니메이션 추가

### Phase 23: 전역 토스트 시스템 + Optimistic UI
- `ToastItem` 타입, `useToastStore` Zustand 스토어 (`src/stores/toast-store.ts`)
- 편의 헬퍼: `toast.success/error/warning/info(title, body?)`
- `ToastContainer` 컴포넌트 — 화면 우하단 고정, framer-motion 슬라이드 인/아웃
- app-shell.tsx에 전역 마운트
- **Optimistic UI 연동**:
  - hitl-store: approve(성공) / reject(경고) / escalate/delegate(정보) 즉시 토스트
  - project-store: moveTicket 시 "티켓 이동 → 상태명" 성공 토스트
  - favorites-store: toggle 시 추가/제거 토스트

### Phase 24: 활동 로그 (`/activity`)
- `/activity` 라우트 신규 — 전사 타임라인 활동 로그
- 10가지 활동 타입 (ticket_created/moved/done, hitl_*/agent_action/deploy/comment/member_join)
- 날짜 그룹별 분리 (오늘/어제/날짜)
- 5탭 필터: 전체/내 활동/에이전트/HITL/배포
- KPI 카드 4개 (에이전트 활동/사람 활동/HITL/배포)
- 더미 신규: activity.ts (20개 항목, 메타 태그 포함)
- HomeSubNav "활동 로그" 항목 추가

### Phase 25: 홈 대시보드 고도화
- KPI 카드에 **recharts AreaChart 스파크라인** 내장 (7일 추이)
- 트렌드 배지 (▲▼ % 변화율)
- HITL 대기 건수 버튼 → 바로 HITL 상세로 이동
- 진행 중 티켓: 상태 컬러 배지, 에이전트 아바타, 비용 표시
- 소속 팀 카드: 프로젝트/진행 중 티켓 카운트 추가
- 활성 에이전트 목록: pulse 애니메이션, 오늘 비용
- 최근 활동 피드 5건 + /activity 링크

### Phase 26: 프로젝트·에픽 생성 + 팀 개요 차트화
- **AddProjectDialog** (`src/components/project/add-project-dialog.tsx`) — 팀 개요 "새 프로젝트" 버튼 연결
- **AddEpicDialog** (`src/components/project/add-epic-dialog.tsx`) — ProjectWorkspace "에픽 추가" 버튼 연결
- project-store에 `addProject`, `addEpic` 액션 + toast 연동
- **팀 개요 페이지 전면 고도화**:
  - 주간 완료 추이 AreaChart, 티켓 상태 분포 PieChart, 오늘 AI 비용 PieChart
  - 프로젝트 진행률 바, 팀원 카드, 프로젝트 목록 (진행/완료 카운트)
  - KPI 5개 (프로젝트/팀원/전체 티켓/HITL 대기/누적 비용)

### Phase 27: 채팅 패널 슬래시 커맨드 + 마크다운 렌더링
- **슬래시 커맨드 시스템** (`/help`, `/status`, `/hitl`, `/cost`, `/agents`, `/assign`)
- `/` 입력 시 자동완성 드롭다운 (↑↓ 키 탐색, Enter 선택, ESC 닫기)
- **마크다운 렌더링**: 볼드(`**text**`), 인라인 굵기, 리스트 항목 구조화 렌더링
- 메시지 복사 버튼 (호버 시 노출, 클립보드 복사)
- 입력창 플레이스홀더 "/ 커맨드" 힌트

### Phase 28: 예산 페이지 차트화 + 유저 프로필
- **팀 예산 페이지 recharts 통합**:
  - 7일 비용 추이 AreaChart + `ReferenceLine` (일일 한도)
  - 프로젝트별 예산 vs 소진 StackedBarChart
  - 에이전트별 비용 분포 PieChart
- **`/profile` 라우트 신규**:
  - 3탭: 개요 / HITL 의결 이력 / 알림 설정
  - 개요: 소속 팀 목록, 팀별 배정 티켓 BarChart, 최근 내 활동
  - HITL 의결 이력: 승인/반려/에스컬레이션 이력 타임라인
  - 알림 설정: 6종 알림 유형별 토글 (toast 연동)
- IconNav 프로필 아바타 클릭 → `/profile` 라우팅

### 기능 구현 대기 (Phase 29+)
- [ ] 커맨드 팔레트 (`>` / `#` / `@` prefix)
- [ ] Cmd+N 새 티켓, Cmd+B SubNav 토글, `?` 단축키 도움말
- [ ] EmptyState 공통 컴포넌트
- [ ] 온보딩 플로우
- [ ] React.lazy 코드 스플리팅

### 기술 미정 (백엔드 연동 시)
- [ ] 백엔드 아키텍처 (API, DB, 인증)
- [ ] 실시간 소통 인프라 (WebSocket/SSE)
- [ ] AI Agent 통신 프로토콜 (MCP 연동)
- [ ] GRIDGE Market 연동 (외부 업무 마켓플레이스)
- [ ] 모바일 반응형
- [ ] 권한 체계 실제 적용 (현재는 UI만)

---

## 10. Git 히스토리

```
cd12fe2 feat: 주요 페이지 UI 전면 구현 및 팀 서브페이지 추가 (Phase 6~16)
eab092a docs: add comprehensive project context document
c74a3b4 feat: Phase 5 - Jira-style ticket detail dialog
b5331a2 feat: Phase 4 - HITL detail page + timeline view
68a5b9e feat: Phase 3 - flowchart view + data-driven home dashboard
1b292fb feat: Phase 2 - kanban board + project workspace
3d44496 fix: change team structure from tech function to product/service units
bf6ed7f refactor: redesign navigation from flat to hierarchical structure
d29ca7c feat: Phase 1 - project init, layout shell, navigation, stores
0b1015b feat: initial commit
```

---

## 11. 배포

- Vercel 연동, `main` 브랜치 배포
- 개발 브랜치: `claude/dev-management-groupware-ui-6hnmp`
- 기능 완료 후 main에 머지 → Vercel 자동 배포
