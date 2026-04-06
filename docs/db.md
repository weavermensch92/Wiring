# 데이터 모델 규칙 (DB)

> 현재 Wiring은 **프론트엔드 전용** — 실제 DB 없음, Zustand + 더미 데이터로 동작.
> 백엔드 연동 시 이 문서 기준으로 스키마 설계.

## 데이터 계층 구조

```
Project → Epic → Ticket → Subtask
                         └── TicketComment
                         └── TicketActivity
                         └── HITLQueueItem (optional)
```

## 핵심 타입 정의

### Ticket

```typescript
interface Ticket {
  id: string;                    // e.g. "t-cm1-2"
  epicId: string;
  title: string;
  description: string;
  status: TicketStatus;          // "backlog"|"todo"|"in_progress"|"review"|"done"
  priority: Priority;            // "critical"|"high"|"medium"|"low"
  assignedAgent: string | null;  // "PM"|"GM"|"SM"|"Dsn"|"Pln"|"FE"|"BE"|"BM"|"HR"
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
```

### HITLQueueItem

```typescript
type HITLType =
  | "code_review"
  | "security_approval"
  | "spec_decision"
  | "design_review"
  | "assignment"
  | "cost_approval"
  | "model_allocation";

type HITLStatus = "waiting" | "in_progress" | "approved" | "rejected" | "escalated";

interface HITLQueueItem {
  id: string;
  type: HITLType;
  ticketId?: string;   // 티켓 연결 (optional)
  epicId: string;
  status: HITLStatus;
  priority: "critical" | "high" | "medium" | "low";
  requestedBy: string;
  assignedTo: { id: string; name: string; level: string };
  briefing: string;
  decisionHistory?: DecisionRecord[];
  // 유형별 추가 필드: options, candidates, allocation, dataAccessRequest 등
}

interface DecisionRecord {
  id: string;
  action: "approve" | "reject" | "escalate" | "delegate" | "comment";
  userId: string;
  userName: string;
  userLevel: string;
  reason?: string;
  toUserId?: string;
  toUserName?: string;
  toUserLevel?: string;
  timestamp: string;
}
```

### InboxMessage

```typescript
type InboxMessageCategory =
  | "agent_report"
  | "hitl_request"
  | "system_alert"
  | "ticket_update"
  | "agent_conversation"
  | "external_update";

interface InboxMessage {
  id: string;
  category: InboxMessageCategory;
  priority: "critical" | "high" | "normal" | "low";
  status: "unread" | "read" | "archived";
  starred: boolean;
  senderAgentId?: string;
  senderAgentLabel?: string;
  senderSystem?: string;
  subject: string;
  preview: string;         // 100자 미리보기
  body: string;            // 마크다운 본문
  threadId: string;
  thread: InboxThreadMessage[];
  hasUnreadReply: boolean;
  createdAt: string;
  updatedAt: string;
  attachments: InboxAttachment[];
  actions: InboxAction[];  // 승인/반려 등 인라인 액션
  hitlItemId?: string;
  ticketId?: string;
}
```

## 타입 파일 목록 (`src/types/`)

| 파일 | 내용 |
|------|------|
| `project.ts` | Project, Epic, Ticket, Subtask, TicketComment, TicketActivity, TicketStatus, Priority |
| `team.ts` | Team |
| `user.ts` | User |
| `navigation.ts` | NavSection 유니온 (`"home" \| "inbox" \| "skills" \| "governance" \| "settings" \| "analytics" \| \`team-${string}\``) |
| `hitl.ts` | HITLQueueItem, HITLType, HITLStatus, DecisionRecord, ModelAllocationData |
| `agent.ts` | Agent, AgentMessage, AgentWorkHistory, CommunicationTopology |
| `chat.ts` | ChatContext, ChatMessage |
| `inbox.ts` | InboxMessage, InboxMessageCategory, InboxFolder, InboxAttachment, InboxAction, InboxThreadMessage |
| `governance.ts` | DataClassification, AccessPolicy, AuditLog, TemporaryPermission |
| `flowchart.ts` | FlowchartNode, FlowchartEdge |
| `routine.ts` | Routine, RoutineTask |
| `external.ts` | ExternalWorkProposal, ExternalWork, ExternalEarnings |
| `document.ts` | WiringDocument (spec/design/meeting/technical/runbook/report) |
| `skill.ts` | Skill, SkillDocument, SkillUsageSummary |

## 더미 데이터 파일 (`src/dummy/`)

| 파일 | 내용 |
|------|------|
| `teams.ts` | 5개 팀, `getTeamsForUser()` |
| `users.ts` | 5명 유저, `CURRENT_USER` = 김CTO (user-1, L3) |
| `projects.ts` | 9개 프로젝트, 에픽, 티켓(100+), 서브태스크, 댓글, 활동 이력 |
| `hitl.ts` | 8개 HITL 큐 항목 (7가지 유형 커버) |
| `inbox.ts` | 16개 인박스 메시지 (6가지 카테고리 커버) |
| `agents.ts` | 9개 AI Agent |
| `chat.ts` | 채팅 히스토리 (컨텍스트별) |
| `governance.ts` | DataClassification, AccessPolicy, AuditLog |
| `flowchart.ts` | FlowchartNode, FlowchartEdge |
| `routine.ts` | Routine, RoutineTask |
| `external.ts` | ExternalWorkProposal, ExternalWork |
| `documents.ts` | 10개 WiringDocument |
| `notifications.ts` | 8개 알림 (레거시 — inbox로 통합 예정) |
| `analytics.ts` | 14일 daily stats, 번다운, 팀 속도 |
| `activity.ts` | 20개 활동 로그 |
| `skills.ts` | Skill 10개, SkillDocument 5개 |

## Zustand 스토어 (`src/stores/`)

| 파일 | 상태 | 주요 액션 |
|------|------|----------|
| `project-store.ts` | projects, epics, tickets, subtasks, comments, activities | moveTicket, addTicket, updateTicket, addComment, toggleSubtask, addEpic, addProject |
| `navigation-store.ts` | activeSection, activeProjectId, activeEpicId, subNavCollapsed, expandedProjects/Epics/Tickets, ticketDialog | setActiveSection, setActiveEpicId, toggleProjectExpand, openTicketDialog |
| `layout-store.ts` | chatPanelOpen, searchOpen, helpOpen, subNavWidth, chatPanelWidth | toggleChatPanel, openSearch, openHelp |
| `hitl-store.ts` | queueItems, activeItemId | approveItem, rejectItem, escalateItem, delegateItem |
| `inbox-store.ts` | messages, activeMessageId, activeFolder, searchQuery, selectedMessageIds | setActiveMessage, markAsRead, toggleStar, archiveMessage, addReply, handleInboxAction |
| `chat-store.ts` | currentContext, histories, isOpen | addMessage, setContext, togglePanel |
| `agent-store.ts` | agents, agentMessages, workHistory | — |
| `flowchart-store.ts` | nodes, edges, layout | — |
| `governance-store.ts` | dataClassification, accessPolicies, auditLogs, temporaryPermissions | — |
| `favorites-store.ts` | items | add, remove, toggle |
| `toast-store.ts` | toasts | push, dismiss |
