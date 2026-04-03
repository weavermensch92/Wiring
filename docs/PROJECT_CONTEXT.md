# GRIDGE Wiring AI — 프로젝트 컨텍스트 문서

> 마지막 업데이트: 2026-04-03
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

## 3. 구현 완료 단계 (Phase 1~5)

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
| `/team/[teamId]` | 팀 오버뷰 (KPI, 프로젝트 목록 → 프로젝트 링크) |
| `/team/[teamId]/project/[projectId]` | 프로젝트 워크스페이스 (보드/타임라인/플로차트 탭) |
| `/hitl/[itemId]` | HITL 상세 (6유형 UI, 승인/반려/에스컬레이션) |
| `/skills` | 스킬 플레이스홀더 (탭: 라이브러리/문서/가이드) |
| `/governance` | 거버넌스 플레이스홀더 |
| `/settings` | 설정 플레이스홀더 |
| `/agents`, `/dashboard`, `/documents`, `/external`, `/flowchart`, `/tickets` | Phase 1 레거시 플레이스홀더 페이지 |

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

### 기능 구현 대기
- [ ] 스킬 페이지 (스킬 라이브러리, 문서 번들, AI 활용 리포트)
- [ ] 거버넌스 페이지 (데이터 소스, 분류, 접근 정책, 감사 로그)
- [ ] 설정 페이지 (AI 설정, 외부 업무 정책, 팀 관리)
- [ ] 채팅 패널 고도화 (컨텍스트별 채팅, UI 조작 연동)
- [ ] 문서 편집기 (Tiptap/Univer)
- [ ] Agent 간 소통 피드 (팀 피드)
- [ ] Agent 현황 모니터링 페이지
- [ ] 팀 예산 관리 페이지
- [ ] 홈 SubNav 세부 항목 (인박스, 즐겨찾기, 최근 열람, 활동 리포트, 일정)

### 기술 미정
- [ ] 백엔드 아키텍처 (API, DB, 인증)
- [ ] 실시간 소통 인프라 (WebSocket/SSE)
- [ ] AI Agent 통신 프로토콜 (MCP 연동)
- [ ] GRIDGE Market 연동
- [ ] 모바일 반응형
- [ ] 권한 체계 (관리자 레벨별 접근)

### 레거시 정리 대상
`/agents`, `/dashboard`, `/documents`, `/external`, `/flowchart`, `/tickets` — Phase 1에서 생성된 플레이스홀더 페이지. 실제 기능이 새 라우트로 이전되었으므로 정리 가능.

---

## 10. Git 히스토리

```
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
