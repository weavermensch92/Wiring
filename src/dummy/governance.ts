import { DataSource, TableClassification, AccessPolicy, AccessLogEntry, TemporaryPermission } from "@/types/governance";

export const DUMMY_DATA_SOURCES: DataSource[] = [
  {
    id: "ds-1",
    name: "프로덕션 DB (읽기 전용 레플리카)",
    type: "postgresql",
    host: "replica.company.internal",
    status: "connected",
    connectedAt: "2026-03-15T10:00:00Z",
    tableCount: 24,
    classifiedTables: 20,
    pendingClassification: 4,
  },
  {
    id: "ds-2",
    name: "분석용 DB",
    type: "mysql",
    host: "analytics.company.internal",
    status: "connected",
    connectedAt: "2026-03-20T14:00:00Z",
    tableCount: 8,
    classifiedTables: 8,
    pendingClassification: 0,
  },
];

export const DUMMY_TABLE_CLASSIFICATIONS: Record<string, TableClassification[]> = {
  "ds-1": [
    {
      id: "tbl-users",
      name: "users",
      autoClassification: "raw",
      gmReason: "개인정보 포함 테이블 (email, phone, password_hash)",
      confirmedBy: "user-1",
      columnCount: 12,
      overrideColumns: 2,
      columns: [
        { name: "id", type: "uuid", classification: "meta", autoClassified: true },
        { name: "email", type: "varchar", classification: "raw", autoClassified: true },
        { name: "phone", type: "varchar", classification: "raw", autoClassified: true },
        { name: "password_hash", type: "varchar", classification: "raw", autoClassified: true },
        { name: "display_name", type: "varchar", classification: "general", autoClassified: true },
        { name: "avatar_url", type: "varchar", classification: "general", autoClassified: true },
        { name: "bio", type: "text", classification: "general", autoClassified: false, needsReview: true, gmNote: "개인정보 포함 가능성" },
        { name: "role", type: "varchar", classification: "meta", autoClassified: true },
        { name: "team", type: "varchar", classification: "meta", autoClassified: true },
        { name: "created_at", type: "timestamptz", classification: "meta", autoClassified: true },
        { name: "last_login_at", type: "timestamptz", classification: "general", autoClassified: true },
        { name: "internal_note", type: "text", classification: null, autoClassified: false, needsReview: true, gmNote: "용도 판단 불가" },
      ],
    },
    {
      id: "tbl-orders",
      name: "orders",
      autoClassification: "raw",
      gmReason: "결제 관련 테이블",
      confirmedBy: null,
      columnCount: 10,
    },
    {
      id: "tbl-products",
      name: "products",
      autoClassification: "general",
      gmReason: "상품 카탈로그, 민감 데이터 없음",
      confirmedBy: "user-1",
      columnCount: 8,
    },
    {
      id: "tbl-categories",
      name: "categories",
      autoClassification: "meta",
      gmReason: "구조 정보만 포함",
      confirmedBy: "user-1",
      columnCount: 4,
    },
    {
      id: "tbl-posts",
      name: "posts",
      autoClassification: "general",
      gmReason: "게시물 데이터, user_id 참조 컬럼 예외 처리 필요",
      confirmedBy: "user-1",
      columnCount: 9,
      overrideColumns: 1,
    },
  ],
};

export const DUMMY_ACCESS_POLICIES: AccessPolicy[] = [
  { level: "Agent", meta: "allow", general: "allow", raw: "deny" },
  { level: "L1", meta: "allow", general: "allow", raw: "deny" },
  { level: "L2", meta: "allow", general: "allow", raw: "request" },
  { level: "L3", meta: "allow", general: "allow", raw: "allow" },
  { level: "L4", meta: "allow", general: "allow", raw: "allow" },
  { level: "외부전문가", meta: "allow", general: "request", raw: "deny" },
];

export const DUMMY_ACCESS_LOGS: AccessLogEntry[] = [
  { id: "log-1", timestamp: "2026-04-03T14:23:00Z", subject: "FE Agent", subjectType: "agent", data: "orders.schema", classification: "meta", action: "auto_allow", reason: "정책 일치" },
  { id: "log-2", timestamp: "2026-04-03T14:25:00Z", subject: "FE Agent", subjectType: "agent", data: "orders.user_id", classification: "raw", action: "denied", reason: "Agent 로우 데이터 접근 불가" },
  { id: "log-3", timestamp: "2026-04-03T14:26:00Z", subject: "GM → L3 큐", subjectType: "system", data: "orders.user_id", classification: "raw", action: "request_sent", reason: "FE 개발에 필수" },
  { id: "log-4", timestamp: "2026-04-03T14:30:00Z", subject: "김CTO (L3)", subjectType: "human", data: "orders.user_id", classification: "raw", action: "temp_allow", reason: "티켓 #ticket-6 한정" },
  { id: "log-5", timestamp: "2026-04-03T13:10:00Z", subject: "BE Agent", subjectType: "agent", data: "products.*", classification: "general", action: "auto_allow", reason: "정책 일치" },
  { id: "log-6", timestamp: "2026-04-03T12:45:00Z", subject: "박프론트 (외부)", subjectType: "external", data: "posts.content", classification: "general", action: "request_sent", reason: "외부 전문가 일반 데이터 접근 승인 필요" },
  { id: "log-7", timestamp: "2026-04-03T11:30:00Z", subject: "PM Agent", subjectType: "agent", data: "categories.*", classification: "meta", action: "auto_allow", reason: "정책 일치" },
  { id: "log-8", timestamp: "2026-04-03T10:00:00Z", subject: "이시니어 (L2)", subjectType: "human", data: "users.email", classification: "raw", action: "request_sent", reason: "버그 재현에 필요" },
  { id: "log-9", timestamp: "2026-04-03T09:15:00Z", subject: "Dsn Agent", subjectType: "agent", data: "posts.title", classification: "general", action: "auto_allow", reason: "정책 일치" },
];

export const DUMMY_TEMPORARY_PERMISSIONS: TemporaryPermission[] = [
  {
    id: "tmp-1",
    grantedTo: "FE Agent",
    table: "users",
    columns: ["user_id", "display_name"],
    purpose: "이미지 소유자 표시 (ticket-6)",
    expiresWhen: "ticket-6 완료 시",
    grantedAt: "2026-04-03T14:30:00Z",
    grantedBy: "김CTO",
  },
  {
    id: "tmp-2",
    grantedTo: "박프론트 (외부)",
    table: "posts",
    columns: ["content", "created_at"],
    purpose: "에디터 마이그레이션 검토",
    expiresWhen: "2026-04-10T18:00:00Z",
    grantedAt: "2026-04-03T13:00:00Z",
    grantedBy: "이시니어",
  },
];
