import { WiringDocument } from "@/types/document";

export const DUMMY_DOCUMENTS: WiringDocument[] = [
  {
    id: "doc-1",
    title: "커머스 플랫폼 v2 기술 스펙",
    content: `# 커머스 플랫폼 v2 기술 스펙

## 개요
커머스 플랫폼 v2는 기존 모놀리식 아키텍처에서 마이크로서비스로의 전환을 목표로 합니다.

## 목표
- **성능**: API 응답 시간 50ms 이하 (p99)
- **가용성**: 99.95% SLA
- **확장성**: 트래픽 10배 급증 처리 가능

## 아키텍처

### 서비스 분리
| 서비스 | 역할 | 기술 스택 |
|--------|------|----------|
| product-svc | 상품 정보 | Go + PostgreSQL |
| order-svc | 주문 처리 | Go + PostgreSQL |
| cart-svc | 장바구니 | Node.js + Redis |
| search-svc | 검색 | Elasticsearch |
| notification-svc | 알림 | Node.js + SQS |

### API 게이트웨이
- Kong 기반 라우팅
- JWT 인증 미들웨어
- Rate limiting: 1,000 req/min per user

## 데이터베이스 전략
- 서비스별 독립 DB (Database per Service 패턴)
- 이벤트 소싱으로 서비스 간 동기화
- PostgreSQL 15 (마스터-레플리카 구성)

## 마이그레이션 계획
1. Phase A: product-svc 분리 (2주)
2. Phase B: order-svc 분리 (3주)
3. Phase C: 모놀리스 셧다운 (1주)

## HITL 필요 항목
- DB 스키마 마이그레이션: 보안팀 승인 필요
- 외부 API 연동: 계약팀 검토 필요`,
    type: "spec",
    status: "published",
    teamId: "team-commerce",
    projectId: "proj-cm-1",
    skillIds: ["skill-be-arch", "skill-db"],
    tags: ["MSA", "아키텍처", "v2"],
    authorId: "agent-sm",
    authorType: "agent",
    createdAt: "2026-03-15T09:00:00Z",
    updatedAt: "2026-03-28T14:30:00Z",
    viewCount: 47,
  },
  {
    id: "doc-2",
    title: "결제 시스템 보안 감사 보고서",
    content: `# 결제 시스템 보안 감사 보고서

## 감사 일정
- 감사 기간: 2026-03-01 ~ 2026-03-14
- 감사자: GM Agent + 외부 보안 전문가

## 발견 사항

### Critical (즉시 조치 필요)
1. **PCI-DSS 위반**: 카드 번호 로그 기록 확인
   - 영향: 전체 결제 플로우
   - 조치: 로그 마스킹 패치 배포 완료

### High
1. **세션 토큰 만료 부재**: 토큰 갱신 로직 없음
   - 조치 기한: 2주 내

2. **SQL Injection 취약점**: 상품 검색 엔드포인트
   - 조치: Parameterized query로 전환 완료

### Medium
1. **CORS 정책 과도 허용**: \`*\` 설정 확인
   - 조치: 화이트리스트 방식으로 변경

## 권고 사항
- 분기별 정기 보안 감사 실시
- 개발자 보안 교육 (연 2회)
- 취약점 버그바운티 프로그램 도입 검토`,
    type: "report",
    status: "published",
    teamId: "team-payment",
    projectId: "proj-py-1",
    tags: ["보안", "PCI-DSS", "감사"],
    authorId: "agent-gm",
    authorType: "agent",
    createdAt: "2026-03-14T18:00:00Z",
    updatedAt: "2026-03-14T18:00:00Z",
    viewCount: 23,
  },
  {
    id: "doc-3",
    title: "추천 알고리즘 기획서 v1.2",
    content: `# 추천 알고리즘 기획서 v1.2

## 배경
현재 콘텐츠 소비율이 월간 -3% 추세. 개인화 추천으로 반등 목표.

## 목표 지표
- CTR 20% 향상
- 세션 길이 30% 증가
- 콘텐츠 소비율 15% 증가

## 추천 모델 후보

### 1. Collaborative Filtering
- 유사 유저 행동 기반
- 콜드 스타트 문제 존재
- 구현 난이도: 중

### 2. Content-Based Filtering
- 콘텐츠 속성 기반
- 콜드 스타트 해결
- 다양성 부족 문제

### 3. Hybrid (권장)
- CF + CBF 앙상블
- A/B 테스트로 가중치 조정
- 구현 난이도: 상

## 데이터 요구사항
| 데이터 | 수집 방식 | 보존 기간 |
|--------|----------|----------|
| 클릭 이벤트 | Kafka | 90일 |
| 시청 시간 | Kafka | 90일 |
| 검색 쿼리 | Elasticsearch | 30일 |
| 유저 프로필 | PostgreSQL | 무제한 |

## 출시 일정
- 1차 모델 학습: 4월 2주
- A/B 테스트 시작: 4월 4주
- 전체 출시: 5월 2주`,
    type: "spec",
    status: "draft",
    teamId: "team-content",
    projectId: "proj-ct-1",
    tags: ["추천", "ML", "개인화"],
    authorId: "agent-pln",
    authorType: "agent",
    createdAt: "2026-04-01T10:00:00Z",
    updatedAt: "2026-04-03T16:20:00Z",
    viewCount: 12,
  },
  {
    id: "doc-4",
    title: "플랫폼 API v3 마이그레이션 가이드",
    content: `# 플랫폼 API v3 마이그레이션 가이드

## 개요
API v2에서 v3로의 마이그레이션 가이드입니다. v3는 REST에서 GraphQL로 전환됩니다.

## Breaking Changes

### 인증
\`\`\`
// v2
Authorization: Bearer <token>

// v3
X-Wiring-Token: <token>
Content-Type: application/json
\`\`\`

### 엔드포인트 변경
| v2 | v3 |
|----|-----|
| GET /api/v2/users | query { users { id name } } |
| POST /api/v2/tickets | mutation { createTicket(...) } |
| DELETE /api/v2/tickets/:id | mutation { deleteTicket(id: ...) } |

## 마이그레이션 단계

### Step 1: 클라이언트 SDK 업데이트
\`\`\`bash
npm install @wiring/sdk@3.0.0
\`\`\`

### Step 2: 인증 헤더 변경
기존 Bearer 토큰을 X-Wiring-Token으로 교체.

### Step 3: REST → GraphQL 쿼리 변환
GraphQL Playground에서 쿼리 테스트 후 적용.

## 지원 기간
- v2 Sunset: 2026-06-30
- v2 → v3 동시 지원: ~ 2026-06-30`,
    type: "technical",
    status: "published",
    teamId: "team-platform",
    projectId: "proj-pf-1",
    tags: ["API", "GraphQL", "마이그레이션"],
    authorId: "agent-sm",
    authorType: "agent",
    createdAt: "2026-03-20T11:00:00Z",
    updatedAt: "2026-03-25T09:15:00Z",
    viewCount: 38,
  },
  {
    id: "doc-5",
    title: "온보딩 퍼널 UI 디자인 가이드",
    content: `# 온보딩 퍼널 UI 디자인 가이드

## 디자인 원칙
- **단순함**: 한 화면에 하나의 행동
- **진행감**: 명확한 스텝 인디케이터
- **신뢰**: 일관된 브랜드 톤

## 화면 구성 (7단계)

### Step 1: 이메일 입력
- 큰 인풋 + 소셜 로그인 버튼
- 에러 메시지: 빨간색 #EF4444

### Step 2: 비밀번호 설정
- 강도 인디케이터 (4단계)
- 요구사항 체크리스트

### Step 3: 프로필 설정
- 이름, 역할 선택 (드롭다운)
- 프로필 이미지 업로드 (선택)

### Step 4: 팀 선택/생성
- 기존 팀 검색 + 초대 코드 입력
- 또는 신규 팀 생성

### Step 5: 플랜 선택
- Free / Pro / Enterprise 카드
- 연간 결제 할인 배지

### Step 6: 결제 정보 (Pro 이상)
- Stripe 위젯 임베드
- 보안 배지 표시

### Step 7: 완료
- 애니메이션 + 시작하기 CTA

## 컬러 팔레트
- Primary: #7C5CFC
- Background: #0F0F14
- Text: #EAEAF0

## 반응형 브레이크포인트
- Mobile: 320~767px (전체 너비)
- Tablet: 768~1023px (중앙 정렬, max 480px)
- Desktop: 1024px+ (중앙 정렬, max 560px)`,
    type: "design",
    status: "published",
    teamId: "team-growth",
    projectId: "proj-gr-1",
    tags: ["디자인", "온보딩", "UX"],
    authorId: "agent-dsn",
    authorType: "agent",
    createdAt: "2026-03-22T13:30:00Z",
    updatedAt: "2026-03-29T10:00:00Z",
    viewCount: 19,
  },
  {
    id: "doc-6",
    title: "주간 팀 회의록 — 2026-03-31",
    content: `# 주간 팀 회의록 — 2026-03-31

## 참석자
- 김CTO (의장)
- 이PM (커머스팀)
- 박BE (플랫폼팀)
- PM Agent, SM Agent

## 안건 1: Q2 로드맵 검토

### 커머스팀
- 장바구니 개편 — 4월 말 출시 목표
- 결제 MSA 전환 — 5월 착수

### 플랫폼팀
- API v3 전환 — 6월 완료 목표
- 인프라 쿠버네티스 이전 — 진행 중

## 안건 2: AI Agent 예산 검토
- 3월 총 소비: $1,240 (예산 대비 82%)
- FE Agent 비중 높음 — 업무 재배분 논의 필요
- **결정**: BM Agent에게 4월 예산 재배분 분석 위임

## 안건 3: HITL 큐 현황
- 대기 중: 3건 (code_review 2건, security 1건)
- 평균 대기 시간: 4.2시간 → 목표 2시간 이내로 단축

## 다음 회의
- 일시: 2026-04-07 (월) 10:00
- 안건: Q2 스프린트 킥오프`,
    type: "meeting",
    status: "published",
    tags: ["회의록", "Q2", "로드맵"],
    authorId: "user-1",
    authorType: "human",
    createdAt: "2026-03-31T11:30:00Z",
    updatedAt: "2026-03-31T12:00:00Z",
    viewCount: 8,
  },
  {
    id: "doc-7",
    title: "Kubernetes 배포 런북",
    content: `# Kubernetes 배포 런북

## 전제 조건
- kubectl 1.29+ 설치
- 클러스터 접근 권한 (DevOps L3 이상)
- Helm 3.14+ 설치

## 배포 절차

### 1. 사전 확인
\`\`\`bash
# 클러스터 상태 확인
kubectl get nodes

# 현재 배포 버전 확인
kubectl get deployments -n production
\`\`\`

### 2. 이미지 태그 업데이트
\`\`\`bash
# values.yaml 수정
image:
  repository: registry.wiring.io/commerce-api
  tag: "v2.4.1"  # 배포할 버전
\`\`\`

### 3. Helm 업그레이드
\`\`\`bash
helm upgrade --install commerce-api ./charts/commerce \
  -f values.yaml \
  -n production \
  --atomic \
  --timeout 5m
\`\`\`

### 4. 배포 검증
\`\`\`bash
# 롤아웃 상태 확인
kubectl rollout status deployment/commerce-api -n production

# 헬스체크
curl -f https://api.wiring.io/health
\`\`\`

## 롤백 절차
\`\`\`bash
# 이전 버전으로 롤백
helm rollback commerce-api -n production

# 롤백 이유 기록 (HITL 필수)
\`\`\`

## HITL 필수 상황
- 데이터베이스 마이그레이션 포함 시
- Critical 패치 주말 배포
- 트래픽 50% 이상 영향`,
    type: "runbook",
    status: "published",
    teamId: "team-platform",
    tags: ["Kubernetes", "배포", "런북", "DevOps"],
    authorId: "agent-be",
    authorType: "agent",
    createdAt: "2026-03-10T09:00:00Z",
    updatedAt: "2026-03-18T14:00:00Z",
    viewCount: 31,
  },
  {
    id: "doc-8",
    title: "그로스팀 A/B 테스트 가이드라인",
    content: `# 그로스팀 A/B 테스트 가이드라인

## 원칙
1. 가설 기반으로만 테스트 진행
2. 최소 샘플 사이즈: 1,000 유저/variant
3. 최소 기간: 7일 (트래픽 패턴 커버)
4. 동시 실험 최대: 3개 (상호 간섭 방지)

## 실험 계획서 작성
### 필수 항목
- **가설**: "~를 변경하면 ~가 X% 향상될 것이다"
- **지표**: Primary KPI + Secondary KPI
- **트래픽 분배**: Control(50%) / Variant(50%)
- **성공 기준**: p-value < 0.05, Effect size ≥ 2%

## 현재 진행 중 실험

| 실험 ID | 가설 | 시작일 | 상태 |
|---------|------|--------|------|
| exp-031 | 온보딩 스텝 5→3 단축 시 전환율 향상 | 03-28 | 진행 중 |
| exp-032 | 알림 전송 시간 최적화 | 04-01 | 진행 중 |

## 결과 분석 프로세스
1. 데이터 팀에 분석 요청 (Jira 티켓)
2. SM Agent가 통계 검증
3. 결과 리뷰 회의 (해당 팀 + CTO)
4. 의사결정 → 문서 기록

## 도구
- **실험 플랫폼**: Growthbook (self-hosted)
- **데이터 파이프라인**: Segment → BigQuery
- **시각화**: Metabase 대시보드`,
    type: "technical",
    status: "published",
    teamId: "team-growth",
    projectId: "proj-gr-1",
    tags: ["A/B테스트", "그로스", "실험"],
    authorId: "user-1",
    authorType: "human",
    createdAt: "2026-02-20T10:00:00Z",
    updatedAt: "2026-04-01T09:30:00Z",
    viewCount: 26,
  },
  {
    id: "doc-9",
    title: "결제 SDK 연동 기술 스펙",
    content: `# 결제 SDK 연동 기술 스펙

## 지원 결제 수단
- 신용/체크카드 (Visa, Mastercard, 국내 5사)
- 간편결제 (카카오페이, 네이버페이, 토스페이)
- 계좌이체
- 가상계좌

## SDK 설치
\`\`\`bash
npm install @wiring/payment-sdk
\`\`\`

## 초기화
\`\`\`typescript
import { PaymentSDK } from '@wiring/payment-sdk';

const payment = new PaymentSDK({
  apiKey: process.env.PAYMENT_API_KEY,
  env: 'production', // 'sandbox' | 'production'
  timeout: 10000,
});
\`\`\`

## 결제 요청
\`\`\`typescript
const result = await payment.request({
  orderId: 'order-12345',
  amount: 15000,
  currency: 'KRW',
  method: 'card',
  metadata: {
    userId: 'user-1',
    productIds: ['prod-1', 'prod-2'],
  },
});
\`\`\`

## 웹훅 처리
\`\`\`typescript
// POST /webhooks/payment
app.post('/webhooks/payment', async (req, res) => {
  const event = payment.verifyWebhook(
    req.headers['x-wiring-signature'],
    req.body
  );

  switch (event.type) {
    case 'payment.completed':
      await fulfillOrder(event.data.orderId);
      break;
    case 'payment.failed':
      await handleFailure(event.data);
      break;
  }
  res.sendStatus(200);
});
\`\`\`

## 오류 코드
| 코드 | 의미 | 조치 |
|------|------|------|
| E001 | 잔액 부족 | 사용자에게 안내 |
| E002 | 카드 만료 | 카드 재등록 요청 |
| E003 | 타임아웃 | 3초 후 재시도 |`,
    type: "technical",
    status: "published",
    teamId: "team-payment",
    projectId: "proj-py-2",
    tags: ["결제", "SDK", "API"],
    authorId: "agent-be",
    authorType: "agent",
    createdAt: "2026-03-05T14:00:00Z",
    updatedAt: "2026-03-12T11:00:00Z",
    viewCount: 44,
  },
  {
    id: "doc-10",
    title: "AI Agent 운영 가이드라인",
    content: `# AI Agent 운영 가이드라인

## Agent 역할 정의
Wiring에서 운영되는 9종의 AI Agent에 대한 운영 원칙을 정의합니다.

## HITL(Human-in-the-Loop) 원칙

### 반드시 HITL을 거쳐야 하는 상황
1. **코드 배포**: production 환경 배포 전 반드시 human 검토
2. **외부 API 호출**: 비용 발생 가능한 외부 서비스 연동
3. **데이터 삭제**: 복구 불가능한 삭제 작업
4. **보안 설정 변경**: 권한, 방화벽, 인증 설정 변경
5. **예산 10만원 이상 의사결정**

### 자동 승인 가능한 상황
- 읽기 전용 작업
- 테스트 환경 작업
- 50만 토큰 이하 작업

## Agent별 권한 범위
| Agent | 자율 권한 | HITL 필요 |
|-------|-----------|----------|
| PM | 티켓 생성/수정 | 에픽 삭제, 인원 배정 |
| GM | 감사 로그 열람 | 데이터 레벨 변경 |
| SM | 스펙 초안 작성 | 기술 스택 확정 |
| FE | 컴포넌트 개발 | 배포 요청 |
| BE | API 개발 | DB 스키마 변경 |
| BM | 비용 분석 | 예산 조정 권고 |

## 비용 관리
- Agent별 일일 예산 상한: $50
- 월간 팀 예산 초과 시: 자동 일시정지
- 이상 비용 감지: 평균 대비 300% 초과 시 알림

## 사고 대응
1. Agent 이상 행동 감지 시 즉시 일시정지
2. GM Agent에 로그 분석 요청
3. HITL로 재가동 승인
4. 사후 원인 분석 문서 작성`,
    type: "technical",
    status: "published",
    tags: ["Agent", "운영", "HITL", "가이드라인"],
    authorId: "user-1",
    authorType: "human",
    createdAt: "2026-02-01T09:00:00Z",
    updatedAt: "2026-03-15T10:00:00Z",
    viewCount: 62,
  },
];

export function getDocumentsByTeam(teamId: string): WiringDocument[] {
  return DUMMY_DOCUMENTS.filter((d) => d.teamId === teamId);
}

export function getDocumentsByProject(projectId: string): WiringDocument[] {
  return DUMMY_DOCUMENTS.filter((d) => d.projectId === projectId);
}

export function searchDocuments(query: string): WiringDocument[] {
  const q = query.toLowerCase();
  return DUMMY_DOCUMENTS.filter(
    (d) =>
      d.title.toLowerCase().includes(q) ||
      d.tags.some((t) => t.toLowerCase().includes(q)) ||
      d.content.toLowerCase().includes(q)
  );
}
