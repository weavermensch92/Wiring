# GRIDGE Wiring AI — 문서 인덱스

> 마지막 업데이트: 2026-04-06
> Phase 1~35 + INBOX 구현 완료

문서가 주제별로 분리되었습니다. 필요한 맥락에 따라 선택적으로 불러오세요.

---

## 문서 목록

| 파일 | 내용 | 언제 참고 |
|------|------|----------|
| [overview.md](./overview.md) | 제품 정의, 기술 스택, 설계 원칙, AI Agent 목록, 라우트 목록 | 전반적인 제품 구조 파악 시 |
| [db.md](./db.md) | 타입 정의, 더미 데이터 파일 목록, Zustand 스토어 목록 | 데이터 모델/스토어 작업 시 |
| [auth.md](./auth.md) | 유저 모델, 권한 레벨, HITL 의결 권한 체계 | 인증/권한 관련 작업 시 |
| [deploy.md](./deploy.md) | 배포 설정, Git 브랜치 규칙, 빌드 명령 | 배포/Git 작업 시 |
| [billing.md](./billing.md) | AI 비용 모델, 예산 구조, 비용 관련 HITL | 비용/예산 관련 작업 시 |
| [AI_system.md](./AI_system.md) | HITL 시스템, INBOX, Chat Panel, 에이전트 토폴로지 | AI 관련 기능 작업 시 |

---

## 빠른 참조

### 핵심 경로

| 목적 | 경로 |
|------|------|
| 타입 파일 | `src/types/` |
| 더미 데이터 | `src/dummy/` |
| Zustand 스토어 | `src/stores/` |
| 레이아웃 컴포넌트 | `src/components/layout/` |
| 프로젝트 컴포넌트 | `src/components/project/` |
| INBOX 컴포넌트 | `src/components/inbox/` |
| 페이지 | `src/app/` |
| CSS 변수 | `src/app/globals.css` |
| 상수 (AGENT_COLORS 등) | `src/lib/constants.ts` |

### 핵심 CSS 변수

```css
--wiring-bg-primary: #0F0F14
--wiring-bg-secondary: #1A1A24
--wiring-accent: #7C5CFC
--wiring-accent-glow: rgba(124,92,252,0.1)
--wiring-glass-bg: rgba(255,255,255,0.03)
--wiring-glass-border: rgba(255,255,255,0.06)
--wiring-text-primary: #EAEAF0
--wiring-text-secondary: #9494A8
--wiring-success: #22C55E
--wiring-warning: #F59E0B
--wiring-danger: #EF4444
--hitl-waiting: #FBBF24
```

### 단축키

| 단축키 | 동작 |
|--------|------|
| `Ctrl+K` | 글로벌 검색 |
| `Ctrl+J` | 채팅 패널 토글 |
| `Ctrl+B` | SubNav 접기/펼치기 |
| `Ctrl+N` | 새 티켓 생성 |
| `Ctrl+I` | INBOX 이동 |
| `?` | 키보드 단축키 도움말 |
