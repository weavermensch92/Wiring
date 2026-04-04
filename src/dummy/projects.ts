import { Project, Epic, Ticket, Subtask, TicketComment, TicketActivity } from "@/types/project";

export const DUMMY_PROJECTS: Project[] = [
  // 커머스팀 (team-commerce)
  {
    id: "proj-cm-1",
    teamId: "team-commerce",
    name: "상품 상세 리뉴얼",
    description: "상품 상세 페이지 전면 리뉴얼",
    startDate: "2026-03-01",
    endDate: "2026-05-31",
    memberCount: 5,
    status: "active",
  },
  {
    id: "proj-cm-2",
    teamId: "team-commerce",
    name: "장바구니 최적화",
    description: "장바구니 UX 개선 및 성능 최적화",
    startDate: "2026-03-15",
    endDate: "2026-04-30",
    memberCount: 3,
    status: "active",
  },
  // 결제팀 (team-payment)
  {
    id: "proj-py-1",
    teamId: "team-payment",
    name: "PG 연동 v2",
    description: "신규 PG사 결제 모듈 연동",
    startDate: "2026-02-01",
    endDate: "2026-05-15",
    memberCount: 4,
    status: "active",
  },
  {
    id: "proj-py-2",
    teamId: "team-payment",
    name: "정산 자동화",
    description: "정산 프로세스 자동화 시스템 구축",
    startDate: "2026-04-01",
    endDate: "2026-06-30",
    memberCount: 2,
    status: "paused",
  },
  // 콘텐츠팀 (team-content)
  {
    id: "proj-ct-1",
    teamId: "team-content",
    name: "에디터 고도화",
    description: "콘텐츠 에디터 기능 확장 및 개선",
    startDate: "2026-03-01",
    endDate: "2026-06-15",
    memberCount: 4,
    status: "active",
  },
  // 플랫폼팀 (team-platform)
  {
    id: "proj-pf-1",
    teamId: "team-platform",
    name: "CI/CD 파이프라인 개선",
    description: "빌드/배포 파이프라인 최적화",
    startDate: "2026-03-10",
    endDate: "2026-04-30",
    memberCount: 3,
    status: "active",
  },
  {
    id: "proj-pf-2",
    teamId: "team-platform",
    name: "모니터링 대시보드",
    description: "인프라 및 서비스 모니터링 대시보드",
    startDate: "2026-02-15",
    endDate: "2026-05-31",
    memberCount: 3,
    status: "active",
  },
  {
    id: "proj-pf-3",
    teamId: "team-platform",
    name: "API Gateway 마이그레이션",
    description: "API Gateway 신규 아키텍처 이관",
    startDate: "2026-01-15",
    endDate: "2026-06-30",
    memberCount: 5,
    status: "paused",
  },
  // 그로스팀 (team-growth)
  {
    id: "proj-gr-1",
    teamId: "team-growth",
    name: "온보딩 퍼널 개선",
    description: "신규 유저 온보딩 전환율 개선",
    startDate: "2026-03-01",
    endDate: "2026-05-15",
    memberCount: 3,
    status: "active",
  },
];

export const DUMMY_EPICS: Record<string, Epic[]> = {
  "proj-cm-1": [
    {
      id: "epic-cm1-1",
      projectId: "proj-cm-1",
      title: "상품 이미지 갤러리",
      description: "상품 이미지 뷰어 및 확대/스와이프 기능",
      status: "in_progress",
      priority: "high",
      ticketCount: 4,
      completedTickets: 1,
      estimatedCost: 180.0,
      estimatedDays: 10,
    },
    {
      id: "epic-cm1-2",
      projectId: "proj-cm-1",
      title: "상품 리뷰 시스템",
      description: "리뷰 작성/조회/평점 기능",
      status: "backlog",
      priority: "medium",
      ticketCount: 3,
      completedTickets: 0,
      estimatedCost: 140.0,
      estimatedDays: 8,
    },
  ],
  "proj-cm-2": [
    {
      id: "epic-cm2-1",
      projectId: "proj-cm-2",
      title: "장바구니 UI 개선",
      description: "장바구니 페이지 UX 리디자인",
      status: "in_progress",
      priority: "high",
      ticketCount: 3,
      completedTickets: 1,
      estimatedCost: 90.0,
      estimatedDays: 5,
    },
  ],
  "proj-py-1": [
    {
      id: "epic-py1-1",
      projectId: "proj-py-1",
      title: "결제 모듈 연동",
      description: "신규 PG사 SDK 연동 및 테스트",
      status: "in_progress",
      priority: "critical",
      ticketCount: 5,
      completedTickets: 2,
      estimatedCost: 320.0,
      estimatedDays: 15,
    },
  ],
  "proj-py-2": [
    {
      id: "epic-py2-1",
      projectId: "proj-py-2",
      title: "정산 배치 시스템",
      description: "일별/주별 자동 정산 배치",
      status: "backlog",
      priority: "medium",
      ticketCount: 3,
      completedTickets: 0,
      estimatedCost: 200.0,
      estimatedDays: 12,
    },
  ],
  "proj-ct-1": [
    {
      id: "epic-ct1-1",
      projectId: "proj-ct-1",
      title: "블록 에디터",
      description: "블록 기반 콘텐츠 에디터 구현",
      status: "in_progress",
      priority: "high",
      ticketCount: 4,
      completedTickets: 1,
      estimatedCost: 250.0,
      estimatedDays: 14,
    },
  ],
  "proj-pf-1": [
    {
      id: "epic-pf1-1",
      projectId: "proj-pf-1",
      title: "빌드 속도 개선",
      description: "CI 빌드 시간 50% 단축",
      status: "in_progress",
      priority: "high",
      ticketCount: 3,
      completedTickets: 1,
      estimatedCost: 80.0,
      estimatedDays: 5,
    },
  ],
  "proj-pf-2": [
    {
      id: "epic-pf2-1",
      projectId: "proj-pf-2",
      title: "메트릭 수집",
      description: "서비스 메트릭 수집 파이프라인",
      status: "in_progress",
      priority: "medium",
      ticketCount: 4,
      completedTickets: 2,
      estimatedCost: 150.0,
      estimatedDays: 10,
    },
  ],
  "proj-pf-3": [
    {
      id: "epic-pf3-1",
      projectId: "proj-pf-3",
      title: "라우팅 마이그레이션",
      description: "기존 API 라우팅 신규 Gateway로 이관",
      status: "backlog",
      priority: "high",
      ticketCount: 6,
      completedTickets: 0,
      estimatedCost: 400.0,
      estimatedDays: 20,
    },
  ],
  "proj-gr-1": [
    {
      id: "epic-gr1-1",
      projectId: "proj-gr-1",
      title: "온보딩 플로우 리디자인",
      description: "단계별 온보딩 UX 개선",
      status: "in_progress",
      priority: "high",
      ticketCount: 5,
      completedTickets: 2,
      estimatedCost: 200.0,
      estimatedDays: 12,
    },
  ],
};

export const DUMMY_TICKETS: Record<string, Ticket[]> = {
  // 상품 이미지 갤러리
  "epic-cm1-1": [
    { id: "t-cm1-1", epicId: "epic-cm1-1", title: "이미지 CDN 연동", description: "S3 + CloudFront 이미지 서빙", status: "done", priority: "high", assignedAgent: "BE", estimatedHours: 8, actualHours: 7, costUsd: 21.0 },
    { id: "t-cm1-2", epicId: "epic-cm1-1", title: "갤러리 컴포넌트 개발", description: "이미지 슬라이더 + 줌 UI. Swiper 기반으로 터치/마우스 스와이프를 지원하고, 핀치 줌 + 더블탭 줌 기능을 구현합니다. 기존 FileUploader 컴포넌트와의 인터페이스 호환성을 유지해야 합니다.", status: "in_progress", priority: "high", assignedAgent: "FE", assignedHuman: { id: "user-3", name: "김주니어", level: "L1" }, estimatedHours: 12, hitlRequired: true, hitlType: "code_review", createdAt: "2026-03-25T09:00:00Z", updatedAt: "2026-04-02T14:30:00Z", labels: ["frontend", "component"], subtaskIds: ["sub-1", "sub-2", "sub-3", "sub-4"] },
    { id: "t-cm1-3", epicId: "epic-cm1-1", title: "이미지 최적화 파이프라인", description: "업로드된 이미지를 자동으로 리사이즈(4가지 해상도)하고 WebP 포맷으로 변환하는 파이프라인을 구축합니다. Lambda@Edge를 통해 원본 대비 70% 이상 용량을 절감하고, 캐시 무효화 전략도 함께 설계해야 합니다.", status: "todo", priority: "medium", assignedAgent: "BE", assignedHuman: { id: "user-1", name: "김CTO", level: "L3" }, estimatedHours: 10, createdAt: "2026-03-28T09:00:00Z", labels: ["backend", "infra", "optimization"] },
    { id: "t-cm1-4", epicId: "epic-cm1-1", title: "360도 뷰어 프로토타입", description: "상품 360도 회전 뷰어", status: "backlog", priority: "low", assignedAgent: null, estimatedHours: 16 },
  ],
  // 상품 리뷰 시스템
  "epic-cm1-2": [
    { id: "t-cm1-5", epicId: "epic-cm1-2", title: "리뷰 API 설계", description: "리뷰 CRUD API 엔드포인트", status: "backlog", priority: "medium", assignedAgent: "BE", estimatedHours: 8 },
    { id: "t-cm1-6", epicId: "epic-cm1-2", title: "리뷰 작성 UI", description: "별점 + 텍스트 리뷰 폼", status: "backlog", priority: "medium", assignedAgent: "FE", estimatedHours: 6 },
    { id: "t-cm1-7", epicId: "epic-cm1-2", title: "리뷰 모더레이션", description: "AI 기반 리뷰 필터링", status: "backlog", priority: "low", assignedAgent: "GM", estimatedHours: 4, hitlRequired: true, hitlType: "security_approval" },
  ],
  // 장바구니 UI 개선
  "epic-cm2-1": [
    { id: "t-cm2-1", epicId: "epic-cm2-1", title: "장바구니 레이아웃 리디자인", description: "새 디자인 시안 적용", status: "done", priority: "high", assignedAgent: "FE", estimatedHours: 8, actualHours: 9, costUsd: 27.0 },
    { id: "t-cm2-2", epicId: "epic-cm2-1", title: "수량 변경 UX 개선", description: "인라인 수량 편집 + 애니메이션", status: "in_progress", priority: "medium", assignedAgent: "FE", estimatedHours: 4 },
    { id: "t-cm2-3", epicId: "epic-cm2-1", title: "장바구니 성능 최적화", description: "리렌더링 최소화 + 가상화", status: "todo", priority: "medium", assignedAgent: "FE", estimatedHours: 6 },
  ],
  // 결제 모듈 연동
  "epic-py1-1": [
    { id: "t-py1-1", epicId: "epic-py1-1", title: "PG SDK 초기 연동", description: "신규 PG사 SDK 설치 및 초기 설정", status: "done", priority: "critical", assignedAgent: "BE", estimatedHours: 8, actualHours: 6, costUsd: 18.0 },
    { id: "t-py1-2", epicId: "epic-py1-1", title: "카드 결제 구현", description: "신용/체크카드 결제 로직", status: "done", priority: "critical", assignedAgent: "BE", estimatedHours: 16, actualHours: 14, costUsd: 42.0 },
    { id: "t-py1-3", epicId: "epic-py1-1", title: "간편결제 연동", description: "카카오페이, 네이버페이, 토스페이 3종 간편결제를 순차적으로 연동합니다. 각 결제사 SDK 초기화, 결제 요청/승인/취소 플로우를 구현하고, 웹훅 핸들러로 비동기 결과를 처리해야 합니다. 테스트 환경(sandbox)과 운영 환경 분리 필수.", status: "in_progress", priority: "high", assignedAgent: "BE", assignedHuman: { id: "user-1", name: "김CTO", level: "L3" }, estimatedHours: 12, createdAt: "2026-03-22T09:00:00Z", updatedAt: "2026-04-03T11:00:00Z", labels: ["backend", "payment", "sdk"], subtaskIds: ["sub-8", "sub-9", "sub-10", "sub-11"] },
    { id: "t-py1-4", epicId: "epic-py1-1", title: "결제 UI 컴포넌트", description: "결제 수단 선택 + 결제 진행 UI. 카드/간편결제/계좌이체 3가지 탭으로 구분하고, 각 결제 수단별 입력 폼을 구현합니다. PG SDK의 결제창 호출 인터페이스와 연동해야 합니다.", status: "review", priority: "high", assignedAgent: "FE", assignedHuman: { id: "user-2", name: "이시니어", level: "L2" }, estimatedHours: 10, hitlRequired: true, hitlType: "code_review", createdAt: "2026-03-20T10:00:00Z", updatedAt: "2026-04-01T16:00:00Z", labels: ["frontend", "payment"], subtaskIds: ["sub-5", "sub-6", "sub-7"] },
    { id: "t-py1-5", epicId: "epic-py1-1", title: "결제 보안 검토", description: "PCI-DSS 준수 여부를 검토하고, 카드번호/CVV 로깅 여부 감사, 세션 토큰 관리 방식, 외부 API 호출 시 TLS 강제 적용 등을 확인합니다. GM Agent가 자동 스캔 후 결과를 HITL로 제출합니다.", status: "todo", priority: "critical", assignedAgent: "GM", assignedHuman: { id: "user-1", name: "김CTO", level: "L3" }, estimatedHours: 6, hitlRequired: true, hitlType: "security_approval", labels: ["security", "compliance"] },
  ],
  // 정산 배치 시스템
  "epic-py2-1": [
    { id: "t-py2-1", epicId: "epic-py2-1", title: "정산 스케줄러 설계", description: "일별/주별 정산 배치 스케줄러", status: "backlog", priority: "medium", assignedAgent: "BE", estimatedHours: 10 },
    { id: "t-py2-2", epicId: "epic-py2-1", title: "정산 리포트 API", description: "정산 결과 조회 API", status: "backlog", priority: "medium", assignedAgent: "BE", estimatedHours: 8 },
    { id: "t-py2-3", epicId: "epic-py2-1", title: "정산 대시보드", description: "정산 현황 대시보드 UI", status: "backlog", priority: "low", assignedAgent: "FE", estimatedHours: 12 },
  ],
  // 블록 에디터
  "epic-ct1-1": [
    { id: "t-ct1-1", epicId: "epic-ct1-1", title: "에디터 코어 설계", description: "Tiptap 기반 에디터 아키텍처", status: "done", priority: "high", assignedAgent: "FE", estimatedHours: 12, actualHours: 10, costUsd: 30.0 },
    { id: "t-ct1-2", epicId: "epic-ct1-1", title: "블록 타입 구현", description: "텍스트/이미지/코드/테이블/임베드 5가지 블록 타입을 Tiptap Extension으로 구현합니다. 각 블록은 삽입/삭제/드래그 재정렬을 지원하고, 코드 블록은 syntax highlighting(Prism)을 적용합니다.", status: "in_progress", priority: "high", assignedAgent: "FE", assignedHuman: { id: "user-1", name: "김CTO", level: "L3" }, estimatedHours: 16, createdAt: "2026-03-15T09:00:00Z", updatedAt: "2026-04-04T10:00:00Z", labels: ["frontend", "editor"], subtaskIds: ["sub-12", "sub-13", "sub-14", "sub-15"] },
    { id: "t-ct1-3", epicId: "epic-ct1-1", title: "실시간 협업", description: "WebSocket 기반 동시 편집", status: "todo", priority: "medium", assignedAgent: "BE", estimatedHours: 20, dependsOn: ["t-ct1-2"] },
    { id: "t-ct1-4", epicId: "epic-ct1-1", title: "에디터 접근 권한", description: "문서별 읽기/쓰기 권한 관리", status: "backlog", priority: "medium", assignedAgent: "GM", estimatedHours: 6, hitlRequired: true, hitlType: "security_approval" },
  ],
  // 빌드 속도 개선
  "epic-pf1-1": [
    { id: "t-pf1-1", epicId: "epic-pf1-1", title: "캐시 레이어 도입", description: "빌드 캐시 계층 구성", status: "done", priority: "high", assignedAgent: "BE", estimatedHours: 6, actualHours: 5, costUsd: 15.0 },
    { id: "t-pf1-2", epicId: "epic-pf1-1", title: "병렬 빌드 구성", description: "GitHub Actions 워크플로우를 멀티스테이지 병렬 빌드로 전환합니다. 린트/타입체크/유닛테스트/빌드를 병렬 실행하고, 매트릭스 전략으로 Node 18/20 크로스 호환 검증. 예상 빌드 시간 12분→5분 단축.", status: "in_progress", priority: "high", assignedAgent: "BE", assignedHuman: { id: "user-1", name: "김CTO", level: "L3" }, estimatedHours: 8, createdAt: "2026-03-18T09:00:00Z", labels: ["devops", "ci-cd"] },
    { id: "t-pf1-3", epicId: "epic-pf1-1", title: "빌드 메트릭 수집", description: "빌드 시간 추적 대시보드", status: "todo", priority: "medium", assignedAgent: "FE", estimatedHours: 4 },
  ],
  // 메트릭 수집
  "epic-pf2-1": [
    { id: "t-pf2-1", epicId: "epic-pf2-1", title: "메트릭 수집기", description: "Prometheus 메트릭 수집 설정", status: "done", priority: "medium", assignedAgent: "BE", estimatedHours: 8, actualHours: 7, costUsd: 21.0 },
    { id: "t-pf2-2", epicId: "epic-pf2-1", title: "Grafana 대시보드", description: "메트릭 시각화 대시보드 구성", status: "done", priority: "medium", assignedAgent: "BE", estimatedHours: 6, actualHours: 5, costUsd: 15.0 },
    { id: "t-pf2-3", epicId: "epic-pf2-1", title: "알림 규칙 설정", description: "임계값 기반 알림 설정", status: "in_progress", priority: "high", assignedAgent: "BE", estimatedHours: 4 },
    { id: "t-pf2-4", epicId: "epic-pf2-1", title: "커스텀 메트릭 UI", description: "팀별 커스텀 대시보드 빌더", status: "todo", priority: "low", assignedAgent: "FE", estimatedHours: 10 },
  ],
  // 라우팅 마이그레이션
  "epic-pf3-1": [
    { id: "t-pf3-1", epicId: "epic-pf3-1", title: "라우팅 규칙 매핑", description: "기존 → 신규 라우팅 테이블 매핑", status: "backlog", priority: "high", assignedAgent: "BE", estimatedHours: 8 },
    { id: "t-pf3-2", epicId: "epic-pf3-1", title: "카나리 배포 설정", description: "점진적 트래픽 전환 설정", status: "backlog", priority: "high", assignedAgent: "BE", estimatedHours: 10 },
    { id: "t-pf3-3", epicId: "epic-pf3-1", title: "롤백 전략", description: "장애 시 즉시 롤백 메커니즘", status: "backlog", priority: "critical", assignedAgent: "BE", estimatedHours: 6, hitlRequired: true, hitlType: "security_approval" },
    { id: "t-pf3-4", epicId: "epic-pf3-1", title: "API 호환성 테스트", description: "모든 API 엔드포인트 호환성 검증", status: "backlog", priority: "high", assignedAgent: "BE", estimatedHours: 12 },
    { id: "t-pf3-5", epicId: "epic-pf3-1", title: "모니터링 연동", description: "신규 Gateway 메트릭 연동", status: "backlog", priority: "medium", assignedAgent: "BE", estimatedHours: 4, dependsOn: ["t-pf3-2"] },
    { id: "t-pf3-6", epicId: "epic-pf3-1", title: "문서화", description: "마이그레이션 가이드 작성", status: "backlog", priority: "low", assignedAgent: "PM", estimatedHours: 4 },
  ],
  // 온보딩 플로우 리디자인
  "epic-gr1-1": [
    { id: "t-gr1-1", epicId: "epic-gr1-1", title: "온보딩 A/B 테스트 설계", description: "전환율 개선 가설 수립 및 실험 설계", status: "done", priority: "high", assignedAgent: "PM", estimatedHours: 6, actualHours: 5, costUsd: 15.0 },
    { id: "t-gr1-2", epicId: "epic-gr1-1", title: "스텝별 UI 컴포넌트", description: "온보딩 스텝 위저드 UI", status: "done", priority: "high", assignedAgent: "FE", estimatedHours: 10, actualHours: 9, costUsd: 27.0 },
    { id: "t-gr1-3", epicId: "epic-gr1-1", title: "프로그레스 트래킹", description: "온보딩 진행률 추적 로직", status: "in_progress", priority: "medium", assignedAgent: "BE", estimatedHours: 6 },
    { id: "t-gr1-4", epicId: "epic-gr1-1", title: "개인화 추천", description: "유저 프로필 기반 추천 콘텐츠", status: "todo", priority: "medium", assignedAgent: "BE", estimatedHours: 8 },
    { id: "t-gr1-5", epicId: "epic-gr1-1", title: "분석 대시보드", description: "퍼널별 전환율 시각화", status: "backlog", priority: "low", assignedAgent: "FE", estimatedHours: 10 },
  ],
};

export function getProjectsForTeam(teamId: string): Project[] {
  return DUMMY_PROJECTS.filter((p) => p.teamId === teamId);
}

export function getEpicsForProject(projectId: string): Epic[] {
  return DUMMY_EPICS[projectId] || [];
}

export function getTicketsForEpic(epicId: string): Ticket[] {
  return DUMMY_TICKETS[epicId] || [];
}

export function getAllTicketsForProject(projectId: string): Ticket[] {
  const epics = getEpicsForProject(projectId);
  return epics.flatMap((epic) => DUMMY_TICKETS[epic.id] || []);
}

// ─── Subtasks ───

export const DUMMY_SUBTASKS: Record<string, Subtask[]> = {
  "t-cm1-2": [
    { id: "sub-1", ticketId: "t-cm1-2", title: "Swiper 라이브러리 설치 및 기본 설정", completed: true },
    { id: "sub-2", ticketId: "t-cm1-2", title: "이미지 슬라이더 UI 구현", completed: true },
    { id: "sub-3", ticketId: "t-cm1-2", title: "핀치 줌 + 더블탭 줌 구현", completed: false },
    { id: "sub-4", ticketId: "t-cm1-2", title: "FileUploader 호환 인터페이스 정리", completed: false },
  ],
  "t-py1-4": [
    { id: "sub-5", ticketId: "t-py1-4", title: "결제 수단 탭 UI 레이아웃", completed: true },
    { id: "sub-6", ticketId: "t-py1-4", title: "카드 결제 입력 폼", completed: true },
    { id: "sub-7", ticketId: "t-py1-4", title: "간편결제 SDK 호출 연동", completed: false },
  ],
  "t-py1-3": [
    { id: "sub-8", ticketId: "t-py1-3", title: "카카오페이 SDK 초기화 + 결제 요청", completed: true },
    { id: "sub-9", ticketId: "t-py1-3", title: "네이버페이 연동 (결제/취소)", completed: true },
    { id: "sub-10", ticketId: "t-py1-3", title: "토스페이 연동 (결제/취소)", completed: false },
    { id: "sub-11", ticketId: "t-py1-3", title: "웹훅 핸들러 + 비동기 결과 처리", completed: false },
  ],
  "t-ct1-2": [
    { id: "sub-12", ticketId: "t-ct1-2", title: "텍스트 블록 + 마크다운 변환", completed: true },
    { id: "sub-13", ticketId: "t-ct1-2", title: "이미지 블록 + 드래그 업로드", completed: true },
    { id: "sub-14", ticketId: "t-ct1-2", title: "코드 블록 + Prism 하이라이팅", completed: false },
    { id: "sub-15", ticketId: "t-ct1-2", title: "테이블 블록 + 셀 편집", completed: false },
  ],
  "t-cm2-2": [
    { id: "sub-16", ticketId: "t-cm2-2", title: "수량 증감 버튼 애니메이션", completed: true },
    { id: "sub-17", ticketId: "t-cm2-2", title: "인라인 숫자 입력 + 유효성 검증", completed: false },
    { id: "sub-18", ticketId: "t-cm2-2", title: "장바구니 총액 실시간 업데이트", completed: false },
  ],
  "t-pf2-3": [
    { id: "sub-19", ticketId: "t-pf2-3", title: "Slack 알림 웹훅 연동", completed: true },
    { id: "sub-20", ticketId: "t-pf2-3", title: "PagerDuty 인시던트 자동 생성", completed: false },
    { id: "sub-21", ticketId: "t-pf2-3", title: "임계값 기반 에스컬레이션 규칙", completed: false },
  ],
  "t-gr1-3": [
    { id: "sub-22", ticketId: "t-gr1-3", title: "온보딩 이벤트 로깅 API", completed: true },
    { id: "sub-23", ticketId: "t-gr1-3", title: "퍼널 단계별 전환율 계산 로직", completed: false },
    { id: "sub-24", ticketId: "t-gr1-3", title: "A/B 그룹 분배 + 실험 플랫폼 연동", completed: false },
  ],
};

// ─── Comments ───

export const DUMMY_COMMENTS: Record<string, TicketComment[]> = {
  "t-cm1-2": [
    { id: "cmt-1", ticketId: "t-cm1-2", author: { type: "agent", name: "SM", id: "agent-sm" }, content: "Swiper 대신 네이티브 Drag API를 사용하는 것을 권장합니다. 번들 크기를 줄일 수 있습니다.", timestamp: "2026-03-26T10:00:00Z" },
    { id: "cmt-2", ticketId: "t-cm1-2", author: { type: "agent", name: "FE", id: "agent-fe" }, content: "네이티브 API로 전환했습니다. 터치 이벤트 핸들링은 직접 구현하겠습니다.", timestamp: "2026-03-26T11:30:00Z" },
    { id: "cmt-3", ticketId: "t-cm1-2", author: { type: "human", name: "김주니어", id: "user-3" }, content: "줌 기능 구현 중인데, 모바일에서 핀치 줌과 브라우저 기본 줌이 충돌합니다. touch-action: none 처리가 필요할 것 같습니다.", timestamp: "2026-04-01T14:00:00Z" },
    { id: "cmt-4", ticketId: "t-cm1-2", author: { type: "agent", name: "FE", id: "agent-fe" }, content: "맞습니다. 갤러리 컨테이너에 touch-action: none을 적용하고, 줌 영역 밖에서는 기본 스크롤이 동작하도록 처리하겠습니다.", timestamp: "2026-04-01T14:20:00Z" },
  ],
  "t-py1-4": [
    { id: "cmt-5", ticketId: "t-py1-4", author: { type: "agent", name: "BE", id: "agent-be" }, content: "결제 API 엔드포인트 준비 완료. POST /api/payments/initiate 로 호출하면 됩니다.", timestamp: "2026-03-28T09:00:00Z" },
    { id: "cmt-6", ticketId: "t-py1-4", author: { type: "human", name: "이시니어", id: "user-2" }, content: "카드 결제 폼 리뷰 완료. 카드번호 마스킹 처리가 빠져있어서 추가 필요합니다.", timestamp: "2026-04-01T15:00:00Z" },
  ],
  "t-py1-3": [
    { id: "cmt-7", ticketId: "t-py1-3", author: { type: "agent", name: "BE", id: "agent-be" }, content: "카카오페이 sandbox 테스트 통과. 결제 요청 → 승인 → 콜백 전체 플로우 확인 완료.", timestamp: "2026-03-30T14:00:00Z" },
    { id: "cmt-8", ticketId: "t-py1-3", author: { type: "agent", name: "BE", id: "agent-be" }, content: "네이버페이 연동 완료. 취소 API가 비동기라 웹훅 대기 필요합니다.", timestamp: "2026-04-02T11:00:00Z" },
    { id: "cmt-9", ticketId: "t-py1-3", author: { type: "human", name: "김CTO", id: "user-1" }, content: "토스페이 연동은 신규 계약 완료 후 진행해 주세요. 계약팀에 확인 중입니다.", timestamp: "2026-04-03T09:30:00Z" },
  ],
  "t-ct1-2": [
    { id: "cmt-10", ticketId: "t-ct1-2", author: { type: "agent", name: "FE", id: "agent-fe" }, content: "텍스트/이미지 블록 구현 완료. Tiptap Extension 기반으로 Node 스펙에 맞게 커스텀했습니다.", timestamp: "2026-04-01T10:00:00Z" },
    { id: "cmt-11", ticketId: "t-ct1-2", author: { type: "human", name: "김CTO", id: "user-1" }, content: "코드 블록 Prism 적용 시 번들 크기 영향도 같이 체크해 주세요.", timestamp: "2026-04-02T15:00:00Z" },
    { id: "cmt-12", ticketId: "t-ct1-2", author: { type: "agent", name: "SM", id: "agent-sm" }, content: "Prism은 lazy-load 방식으로 필요 언어만 로드하면 ~50KB 수준. 수용 가능합니다.", timestamp: "2026-04-02T15:30:00Z" },
  ],
  "t-pf1-2": [
    { id: "cmt-13", ticketId: "t-pf1-2", author: { type: "agent", name: "BE", id: "agent-be" }, content: "GitHub Actions 매트릭스 전략으로 Node 18/20 병렬 테스트 설정 완료. 빌드 12분→7분으로 단축.", timestamp: "2026-04-03T14:00:00Z" },
    { id: "cmt-14", ticketId: "t-pf1-2", author: { type: "human", name: "김CTO", id: "user-1" }, content: "좋습니다. 캐시 히트율 모니터링도 추가해 주세요.", timestamp: "2026-04-03T14:30:00Z" },
  ],
};

// ─── Activities ───

export const DUMMY_ACTIVITIES: Record<string, TicketActivity[]> = {
  "t-cm1-2": [
    { id: "act-1", ticketId: "t-cm1-2", type: "status_change", description: "상태 변경: Backlog → To Do", timestamp: "2026-03-25T09:00:00Z" },
    { id: "act-2", ticketId: "t-cm1-2", type: "assignment", description: "FE Agent에 배정", timestamp: "2026-03-25T09:05:00Z" },
    { id: "act-3", ticketId: "t-cm1-2", type: "assignment", description: "김주니어 (L1) 리뷰어로 배정", timestamp: "2026-03-25T09:10:00Z" },
    { id: "act-4", ticketId: "t-cm1-2", type: "status_change", description: "상태 변경: To Do → In Progress", timestamp: "2026-03-26T10:00:00Z" },
    { id: "act-5", ticketId: "t-cm1-2", type: "comment", description: "SM Agent가 댓글 작성", timestamp: "2026-03-26T10:00:00Z" },
    { id: "act-6", ticketId: "t-cm1-2", type: "hitl_request", description: "코드 리뷰 HITL 요청 생성", timestamp: "2026-04-01T14:30:00Z" },
  ],
  "t-py1-4": [
    { id: "act-7", ticketId: "t-py1-4", type: "status_change", description: "상태 변경: To Do → In Progress", timestamp: "2026-03-22T09:00:00Z" },
    { id: "act-8", ticketId: "t-py1-4", type: "assignment", description: "FE Agent에 배정", timestamp: "2026-03-22T09:05:00Z" },
    { id: "act-9", ticketId: "t-py1-4", type: "status_change", description: "상태 변경: In Progress → Review", timestamp: "2026-03-31T16:00:00Z" },
    { id: "act-10", ticketId: "t-py1-4", type: "hitl_request", description: "코드 리뷰 HITL 요청 생성", timestamp: "2026-04-01T10:00:00Z" },
  ],
  "t-py1-3": [
    { id: "act-11", ticketId: "t-py1-3", type: "assignment", description: "BE Agent에 배정, 김CTO 리뷰어", timestamp: "2026-03-22T09:00:00Z" },
    { id: "act-12", ticketId: "t-py1-3", type: "status_change", description: "상태 변경: To Do → In Progress", timestamp: "2026-03-22T10:00:00Z" },
    { id: "act-13", ticketId: "t-py1-3", type: "comment", description: "BE Agent: 카카오페이 sandbox 테스트 완료", timestamp: "2026-03-30T14:00:00Z" },
    { id: "act-14", ticketId: "t-py1-3", type: "cost_update", description: "비용 갱신: +$18.5 (BE Agent)", timestamp: "2026-04-02T16:00:00Z" },
  ],
  "t-ct1-2": [
    { id: "act-15", ticketId: "t-ct1-2", type: "assignment", description: "FE Agent에 배정, 김CTO 감독", timestamp: "2026-03-15T09:00:00Z" },
    { id: "act-16", ticketId: "t-ct1-2", type: "status_change", description: "상태 변경: Backlog → In Progress", timestamp: "2026-03-20T10:00:00Z" },
    { id: "act-17", ticketId: "t-ct1-2", type: "comment", description: "FE Agent: 텍스트/이미지 블록 구현 완료", timestamp: "2026-04-01T10:00:00Z" },
  ],
  "t-pf1-2": [
    { id: "act-18", ticketId: "t-pf1-2", type: "assignment", description: "BE Agent에 배정", timestamp: "2026-03-18T09:00:00Z" },
    { id: "act-19", ticketId: "t-pf1-2", type: "status_change", description: "상태 변경: To Do → In Progress", timestamp: "2026-03-25T10:00:00Z" },
  ],
};
