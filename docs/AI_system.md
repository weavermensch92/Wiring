# AI 시스템 규칙 (AI_system)

> 현재 Wiring은 **UI 전용** — 실제 AI API 연동 없음, 더미 응답으로 동작.
> 백엔드 연동 시 이 문서 기준으로 구현.

## HITL 시스템

### 개념

```
AI Agent가 액션 수행
  → 사람의 확인이 필요한 시점에 HITL 요청 생성
  → HITLQueueItem (status: waiting)
  → 담당자 승인 / 반려 / 에스컬레이션 / 위임
  → DecisionRecord 이력 기록
```

### 7가지 HITL 유형

| 유형 | 설명 | 주요 데이터 |
|------|------|-----------|
| `code_review` | 코드 리뷰 승인 | 변경 파일 목록, 코드 디프, Agent 코멘트 |
| `security_approval` | 보안 승인 | dataAccessRequest (DB/API 접근 권한) |
| `spec_decision` | 스펙 결정 | options[] (비용/리스크/개발일수 비교) |
| `design_review` | 디자인 리뷰 | designUrl, 체크리스트 6항목 (pass/warning/fail) |
| `assignment` | 인력 배정 | candidates[] (매칭점수/가용성/역량) |
| `cost_approval` | 비용 승인 | currentBudget, requestedAmount, breakdown[] |
| `model_allocation` | AI 모델 배분 조정 | 에이전트별 currentModel → proposedModel |

### HITL 상세 페이지 UI 규칙

- `/hitl/[itemId]` 풀 페이지 (다이얼로그 아님)
- 유형별 전용 UI 렌더링
- 승인/반려: 사유 입력 필수 (reject/escalate/delegate)
- 에스컬레이션: 상위 레벨만 선택 가능
- 위임: 동일/하위 레벨만 선택 가능
- DecisionRecord 타임라인 표시

## INBOX (AI 소통 채널)

메일형 비동기 AI 커뮤니케이션 채널. Chat Panel과 구분:

| | INBOX | Chat Panel |
|--|-------|-----------|
| 방식 | 비동기 | 실시간 |
| 범위 | 독립적 메시지 | 현재 컨텍스트 바인딩 |
| 용도 | 리포트, HITL 요청, 알림 | 티켓/HITL 문의 |

### 6가지 메시지 카테고리

| 카테고리 | 설명 | 예시 |
|---------|------|------|
| `agent_report` | AI 리포트 | 스프린트 요약, 비용 분석 |
| `hitl_request` | HITL 승인 요청 | 코드 리뷰, 보안 승인 |
| `system_alert` | 시스템 알림 | 예산 경고, 보안 이상 |
| `ticket_update` | 티켓 변경 | 완료, 배정, 상태 변경 |
| `agent_conversation` | 에이전트 대화 | 기획 제안, 마이그레이션 제안 |
| `external_update` | 외부 업데이트 | 외주 제안 도착 |

### 인라인 HITL 액션

`hitl_request` 카테고리 메시지에서 바로 승인/반려 가능:
- `handleInboxAction()` → `useHITLStore.approveItem()`/`rejectItem()` 연동
- 처리 후 스레드에 시스템 메시지 추가 ("✅ 승인 완료")

## Chat Panel (실시간 컨텍스트 AI)

### 컨텍스트 유형

```typescript
type ChatContextType = "ticket" | "hitl" | "epic" | "general";
```

현재 열람 중인 엔티티에 자동 바인딩. 각 컨텍스트별 다른 AI 응답.

### 슬래시 커맨드

| 커맨드 | 설명 |
|--------|------|
| `/status` | 현재 컨텍스트 상태 요약 |
| `/hitl` | HITL 대기 항목 조회 |
| `/cost` | 비용 현황 조회 |
| `/agents` | 에이전트 현황 조회 |
| `/assign` | 담당자 배정 |
| `/help` | 사용 가능 커맨드 목록 |

### 단축키

| 단축키 | 동작 |
|--------|------|
| `Ctrl+J` | 채팅 패널 토글 |

## 에이전트 토폴로지 (Agent Topology)

- `/agents` 탭 3: React Flow 기반 에이전트 소통 그래프
- 원형 레이아웃, 메시지 수 기반 엣지 강도
- 활성 에이전트 엣지 animated pulse

## NavSection → AI 통합

| NavSection | AI 관련 기능 |
|-----------|------------|
| `inbox` | AI 에이전트 비동기 메시지 수신/답장 |
| `home` | HITL 대기 수, AI 비용 KPI |
| `agents` | 에이전트 상태/비용/토폴로지 |
| `analytics` | AI 비용 분석, 모델 사용 분포 |
| `governance` | AI Agent 접근 정책 매트릭스 |

## 향후 연동 계획 (백엔드)

- [ ] MCP (Model Context Protocol) 연동 — AI Agent 통신
- [ ] WebSocket/SSE — 실시간 에이전트 작업 스트리밍
- [ ] 실제 Claude/GPT API 연동 (Chat Panel, HITL 처리)
- [ ] Agent Orchestration — PM Agent가 다른 Agent 고용/지시

## 관련 파일

- `src/types/hitl.ts` — HITLQueueItem, HITLType, DecisionRecord
- `src/types/inbox.ts` — InboxMessage, InboxMessageCategory, InboxAction
- `src/types/agent.ts` — Agent, AgentMessage, AgentWorkHistory, CommunicationTopology
- `src/stores/hitl-store.ts` — HITL 상태 및 액션
- `src/stores/inbox-store.ts` — Inbox 상태 및 액션
- `src/stores/chat-store.ts` — Chat Panel 상태
- `src/components/layout/chat-panel.tsx` — 채팅 패널
- `src/components/inbox/` — INBOX 컴포넌트 모음
- `src/app/hitl/[itemId]/page.tsx` — HITL 상세 페이지
- `src/app/agents/page.tsx` — 에이전트 현황
