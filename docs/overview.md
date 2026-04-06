# Wiring — 제품 개요 & 설계 원칙

## 제품 정의

**GRIDGE Wiring AI** (줄임말: Wiring, 내부 코드명: 불혹)
- AI 기반 개발 관리 그룹웨어 — 팀 단위 Claude Code/Cursor/Codex에 대한 **관제 센터**
- AI Agent가 액션 수행, 사람이 HITL(Human-in-the-Loop) 과정에서 확인/승인
- 레퍼런스: Jira + Slack 하이브리드

## 기술 스택

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

> ⚠️ `AGENTS.md` 주의: "This is NOT the Next.js you know." — Next.js 16 breaking changes, API 확인 필수

## 핵심 설계 원칙

1. **팀은 프로덕트/서비스 단위** (FE/BE 같은 기술 직군 아님)
2. **거버넌스는 전사 레벨만** (팀 내 거버넌스 없음, GM Agent가 전사 관할)
3. **HITL = 사람이 최종 결정** (AI가 제안, 사람이 승인/반려)
4. **유저는 여러 팀에 소속 가능** (User.teamIds 배열)
5. **네비게이션: 홈(고정) → 팀(동적) → 스킬/거버넌스(고정)** 순서
6. **홈에서 내부 업무 / 외주 업무 구분**

## AI Agent 시스템 (9종)

| Agent | 역할 | 색상 |
|-------|------|------|
| PM | 업무 분배, 티켓 발행, 일정 관리, Agent 고용 | #8B5CF6 |
| GM | 거버넌스, 코드 의존성 검토, HITL 승인 감독 | #F97316 |
| SM | 기술 스펙 결정, 프레임워크 제안 | #3B82F6 |
| Dsn | UI 디자인 수행 | #EC4899 |
| Pln | 기획서 제작, 하위 티켓 생성 | #10B981 |
| FE | 프론트엔드 개발 | #06B6D4 |
| BE | 백엔드 개발 | #6366F1 |
| BM | 토큰/인력 비용 평가 | #EAB308 |
| HR | HITL 인력 시간 고려, 자원 제안 | #14B8A6 |

색상 정의 위치: `src/lib/constants.ts` → `AGENT_COLORS`

## 데이터 관계도

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
│   │   │   └── Ticket.dependsOn → 다른 Ticket 참조
│   │   └── Epic.dependsOn → 다른 Epic 참조
│   └── User.teamIds[] (다대다: 유저가 여러 팀 소속)
├── User (5명, CURRENT_USER = 김CTO)
├── AI Agent (9종)
└── Governance (전사 레벨만)
```

## 팀 목록

| ID | 이름 | 약어 | 색상 | 프로젝트 |
|----|------|------|------|----------|
| team-commerce | 커머스팀 | CM | #8B5CF6 | proj-cm-1, proj-cm-2 |
| team-payment | 결제팀 | PY | #F97316 | proj-py-1, proj-py-2 |
| team-content | 콘텐츠팀 | CT | #06B6D4 | proj-ct-1 |
| team-platform | 플랫폼팀 | PF | #10B981 | proj-pf-1, proj-pf-2, proj-pf-3 |
| team-growth | 그로스팀 | GR | #EC4899 | proj-gr-1 |

## 구현 완료 페이지 (Phase 1~35)

| 라우트 | 설명 |
|--------|------|
| `/` | → `/home` 리다이렉트 |
| `/home` | 데이터 기반 대시보드 (KPI, 팀 목록, 활성 티켓) |
| `/inbox` | 메일형 AI 소통 채널 (메시지 목록 + 상세 + 스레드) |
| `/team/[teamId]` | 팀 오버뷰 (KPI, 프로젝트 목록, 차트) |
| `/team/[teamId]/project/[projectId]` | 프로젝트 워크스페이스 (개요/보드/타임라인/플로차트) |
| `/team/[teamId]/budget` | 팀 예산 관리 |
| `/team/[teamId]/feed` | 팀 피드 (에이전트 소통·HITL·티켓 통합) |
| `/hitl/[itemId]` | HITL 상세 (7유형, 승인/반려/에스컬레이션/위임) |
| `/skills` | 스킬 라이브러리·문서 번들·AI 활용 리포트 |
| `/governance` | 거버넌스 4탭 (개요/분류/정책/감사로그) |
| `/settings` | 설정 3탭 (AI설정/외부정책/팀관리) |
| `/agents` | 에이전트 현황 + 소통 피드 + 토폴로지 |
| `/external` | 외부 업무 관리 (제안/진행/완료) |
| `/analytics` | 분석 대시보드 (4탭) |
| `/activity` | 전사 활동 로그 |
| `/profile` | 유저 프로필 |
| `/my-work` | 내 업무 허브 (티켓/HITL큐/일정) |
| `/docs`, `/docs/[docId]` | 문서 라이브러리 + 에디터 |
| `/schedule` | 일정 |

## 향후 필요 작업 (백엔드 연동)

- [ ] 백엔드 API (REST/GraphQL)
- [ ] 실시간 소통 (WebSocket/SSE)
- [ ] AI Agent 통신 (MCP 연동)
- [ ] 인증/권한 체계 실제 적용
- [ ] 모바일 반응형
- [ ] React.lazy 코드 스플리팅
- [ ] GRIDGE Market 연동 (외부 업무 마켓플레이스)
