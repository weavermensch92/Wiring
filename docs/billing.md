# 비용/예산 규칙 (Billing)

> 현재 Wiring은 **UI 전용** — 실제 결제 없음, 더미 비용 데이터로 시각화.

## AI Agent 비용 모델

각 AI Agent 작업은 `costUsd`(달러)로 비용을 추적.

### 비용 추적 단위

| 레벨 | 필드 | 설명 |
|------|------|------|
| Ticket | `ticket.costUsd` | 티켓 단위 AI 비용 |
| Agent | `agent.todayCostUsd` | 에이전트 일일 비용 |
| Project | 티켓 비용 합산 | 프로젝트 누적 비용 |
| Team | 프로젝트 비용 합산 | 팀 월 예산 대비 소진 |

### 팀 예산 구조

```typescript
interface Team {
  id: string;
  name: string;
  monthlyBudgetUsd: number;   // 월 예산 ($)
  usedBudgetUsd: number;      // 소진 금액 ($)
  // ...
}
```

## 예산 모니터링 페이지 (`/team/[teamId]/budget`)

- 전체 예산 소진율 게이지
- 프로젝트별 예산 vs 소진 StackedBarChart
- 에이전트별 오늘 비용 바 차트
- 에픽별 상세 비용 테이블
- 7일 비용 추이 AreaChart + 일일 한도 ReferenceLine

## HITL 비용 승인 (cost_approval 유형)

```typescript
interface CostApprovalData {
  currentBudget: number;
  requestedAmount: number;
  reason: string;
  breakdown: { item: string; amount: number }[];
}
```

- 현재 vs 승인 후 예산 비교 게이지 UI
- 승인 시 예산 한도 초과 경고

## 모델 배분 승인 (model_allocation 유형)

```typescript
interface ModelAllocationAgent {
  agentId: string;
  currentModel: string;    // 현재 사용 모델
  proposedModel: string;   // 변경 제안 모델
  estimatedCostUsd: number;
}
```

- 에이전트별 모델 전환으로 비용 최적화 제안
- HITL 승인 후 적용

## 분석 대시보드 (`/analytics`)

- 에이전트별 비용 추이 (7일 LineChart)
- 모델 사용 분포 (PieChart)
- 팀별 속도 vs 비용 비교 (BarChart)

## 관련 파일

- `src/dummy/analytics.ts` — 비용 더미 데이터 (14일치 daily stats)
- `src/dummy/agents.ts` — 에이전트별 `todayCostUsd`
- `src/dummy/projects.ts` — 티켓별 `costUsd`
- `src/app/team/[teamId]/budget/page.tsx` — 팀 예산 페이지
- `src/app/analytics/page.tsx` — 분석 대시보드
- `src/types/hitl.ts` — CostApprovalData, ModelAllocationData
