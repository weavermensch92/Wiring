# 인증/권한 규칙 (Auth)

> 현재 Wiring은 **UI 전용** — 실제 인증 없음, 더미 유저로 동작.
> 백엔드 연동 시 이 문서 기준으로 구현.

## 현재 유저 모델

```typescript
interface User {
  id: string;         // e.g. "user-1"
  name: string;
  email: string;
  avatar: string;     // 이니셜 (예: "김")
  level: string;      // "L1"|"L2"|"L3"|"L4" (권한 레벨)
  teamIds: string[];  // 소속 팀 목록 (다대다)
  role: string;
}
```

## 현재 사용자

- `CURRENT_USER` = 김CTO (`user-1`, L3, 전 팀 소속)
- 위치: `src/dummy/users.ts`

## 권한 레벨 (HITL 의사결정)

| 레벨 | 설명 | 에스컬레이션 대상 | 위임 가능 대상 |
|------|------|------------------|---------------|
| L1 | 일반 개발자 | L2 이상 | — |
| L2 | 시니어 / 팀 리드 | L3 이상 | L1 |
| L3 | CTO / 기술 이사 | L4 | L1, L2 |
| L4 | CEO / 최고 결정권자 | — | L1, L2, L3 |

### 에스컬레이션 규칙
- 본인보다 **상위 레벨**에만 에스컬레이션 가능
- 본인보다 **같거나 하위 레벨**에만 위임 가능
- 어드민(L4)은 정지 불가

## HITL 의결 플로우

```
HITL 요청 도착
  → assignedTo (레벨별 담당자)
  → 승인 / 반려 / 에스컬레이션 / 위임
  → DecisionRecord 이력 기록
  → 상태 변경: waiting → approved | rejected | escalated
```

## NavSection 권한

현재 모든 섹션 접근 제한 없음 (UI 전용).
백엔드 연동 시 추가 예정:
- `/governance` — L3 이상만
- `/settings` — L3 이상만 (팀 관리)
- Admin 어드민 패널 — L4만

## 컴포넌트 레벨 권한 가드 (예정)

```typescript
// 백엔드 연동 시 구현 예정
<RequireLevel level="L3">
  <GovernancePage />
</RequireLevel>
```

## 관련 파일

- `src/dummy/users.ts` — 유저 더미 데이터, `CURRENT_USER`
- `src/types/user.ts` — User 타입
- `src/components/layout/icon-nav.tsx` — 프로필 아바타 → `/profile`
- `src/app/profile/page.tsx` — 프로필 3탭 (개요/HITL 의결 이력/알림 설정)
- `src/stores/hitl-store.ts` — HITL 의결 (approveItem, rejectItem, escalateItem, delegateItem)
