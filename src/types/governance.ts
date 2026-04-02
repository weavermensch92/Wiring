export type DataLevel = "meta" | "general" | "raw";
export type AccessAction = "auto_allow" | "denied" | "request_sent" | "temp_allow";

export interface DataSource {
  id: string;
  name: string;
  type: "postgresql" | "mysql" | "mongodb";
  host: string;
  status: "connected" | "disconnected" | "error";
  connectedAt: string;
  tableCount: number;
  classifiedTables: number;
  pendingClassification: number;
}

export interface ColumnInfo {
  name: string;
  type: string;
  classification: DataLevel | null;
  autoClassified: boolean;
  needsReview?: boolean;
  gmNote?: string;
}

export interface TableClassification {
  id: string;
  name: string;
  autoClassification: DataLevel;
  gmReason: string;
  confirmedBy: string | null;
  columnCount: number;
  overrideColumns?: number;
  columns?: ColumnInfo[];
}

export interface AccessPolicy {
  level: string;
  meta: "allow" | "request" | "deny";
  general: "allow" | "request" | "deny";
  raw: "allow" | "request" | "deny";
}

export interface AccessLogEntry {
  id: string;
  timestamp: string;
  subject: string;
  subjectType: "agent" | "human" | "external" | "system";
  data: string;
  classification: DataLevel;
  action: AccessAction;
  reason: string;
}

export interface TemporaryPermission {
  id: string;
  grantedTo: string;
  table: string;
  columns: string[];
  purpose: string;
  expiresWhen: string;
  grantedAt: string;
  grantedBy: string;
}
