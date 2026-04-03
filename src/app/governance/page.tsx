"use client";

import { useState } from "react";
import { useGovernanceStore } from "@/stores/governance-store";
import { DataLevel, AccessAction, TableClassification } from "@/types/governance";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Database,
  ShieldCheck,
  ScrollText,
  LayoutDashboard,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  ChevronDown,
  ChevronRight,
  Lock,
  Unlock,
  Key,
  Activity,
  Server,
  Wifi,
  WifiOff,
  Bot,
  User,
  Users,
  Globe,
  Settings2,
} from "lucide-react";
import { Separator as Sep } from "@/components/ui/separator";

// ─── 유틸 ───
function formatTime(iso: string) {
  const d = new Date(iso);
  return `${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getDate().toString().padStart(2, "0")} ${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
}

// ─── 데이터 레벨 배지 ───
const LEVEL_CONFIG: Record<
  DataLevel,
  { label: string; color: string; bg: string; desc: string }
> = {
  meta: { label: "Meta", color: "#3B82F6", bg: "rgba(59,130,246,0.15)", desc: "구조/스키마 정보" },
  general: { label: "General", color: "#10B981", bg: "rgba(16,185,129,0.15)", desc: "일반 업무 데이터" },
  raw: { label: "Raw", color: "#EF4444", bg: "rgba(239,68,68,0.15)", desc: "민감/개인정보" },
};

function LevelBadge({ level }: { level: DataLevel | null }) {
  if (!level) return (
    <span className="px-1.5 py-0.5 rounded text-[10px] bg-[var(--wiring-glass-bg)] border border-[var(--wiring-glass-border)] text-[var(--wiring-text-tertiary)]">
      미분류
    </span>
  );
  const cfg = LEVEL_CONFIG[level];
  return (
    <span
      className="px-1.5 py-0.5 rounded text-[10px] font-medium"
      style={{ backgroundColor: cfg.bg, color: cfg.color }}
    >
      {cfg.label}
    </span>
  );
}

// ─── 접근 정책 셀 ───
function PolicyCell({ value }: { value: "allow" | "request" | "deny" }) {
  const map = {
    allow: { icon: <Unlock className="w-3.5 h-3.5" />, label: "허용", color: "var(--wiring-success)" },
    request: { icon: <Key className="w-3.5 h-3.5" />, label: "승인 요청", color: "var(--wiring-warning)" },
    deny: { icon: <Lock className="w-3.5 h-3.5" />, label: "차단", color: "var(--wiring-danger)" },
  };
  const { icon, label, color } = map[value];
  return (
    <div className="flex items-center justify-center gap-1.5" style={{ color }}>
      {icon}
      <span className="text-xs">{label}</span>
    </div>
  );
}

// ─── 접근 로그 액션 아이콘 ───
function ActionBadge({ action }: { action: AccessAction }) {
  const map: Record<AccessAction, { icon: React.ReactNode; label: string; color: string }> = {
    auto_allow: { icon: <CheckCircle2 className="w-3.5 h-3.5" />, label: "자동 허용", color: "var(--wiring-success)" },
    denied: { icon: <XCircle className="w-3.5 h-3.5" />, label: "차단", color: "var(--wiring-danger)" },
    request_sent: { icon: <Clock className="w-3.5 h-3.5" />, label: "승인 요청", color: "var(--wiring-warning)" },
    temp_allow: { icon: <Key className="w-3.5 h-3.5" />, label: "임시 허용", color: "#8B5CF6" },
  };
  const { icon, label, color } = map[action];
  return (
    <div className="flex items-center gap-1" style={{ color }}>
      {icon}
      <span className="text-xs whitespace-nowrap">{label}</span>
    </div>
  );
}

// ─── 주체 아이콘 ───
function SubjectIcon({ type }: { type: "agent" | "human" | "external" | "system" }) {
  const map = {
    agent: <Bot className="w-3.5 h-3.5 text-[var(--wiring-accent)]" />,
    human: <User className="w-3.5 h-3.5 text-[var(--wiring-text-secondary)]" />,
    external: <Globe className="w-3.5 h-3.5 text-[var(--wiring-warning)]" />,
    system: <Settings2 className="w-3.5 h-3.5 text-[var(--wiring-text-tertiary)]" />,
  };
  return map[type];
}

// ─── 탭 버튼 ───
function TabBtn({ active, onClick, icon, children }: {
  active: boolean; onClick: () => void; icon: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        active
          ? "bg-[var(--wiring-accent)] text-white"
          : "text-[var(--wiring-text-tertiary)] hover:bg-[var(--wiring-glass-hover)] hover:text-[var(--wiring-text-secondary)]"
      }`}
    >
      {icon}
      {children}
    </button>
  );
}

// ─── 개요 탭 ───
function OverviewTab() {
  const { dataSources, tableClassifications, accessLogs, temporaryPermissions } = useGovernanceStore();

  const totalTables = dataSources.reduce((s, ds) => s + ds.tableCount, 0);
  const classifiedTables = dataSources.reduce((s, ds) => s + ds.classifiedTables, 0);
  const pendingTables = dataSources.reduce((s, ds) => s + ds.pendingClassification, 0);
  const pendingRequests = accessLogs.filter((l) => l.action === "request_sent").length;

  const allTables = Object.values(tableClassifications).flat();
  const rawCount = allTables.filter((t) => t.autoClassification === "raw").length;
  const generalCount = allTables.filter((t) => t.autoClassification === "general").length;
  const metaCount = allTables.filter((t) => t.autoClassification === "meta").length;

  const recentLogs = [...accessLogs]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-5">
      {/* KPI */}
      <div className="grid grid-cols-4 gap-3">
        <div className="glass-panel p-4">
          <p className="text-xs text-[var(--wiring-text-tertiary)] mb-1">전체 테이블</p>
          <p className="text-2xl font-bold text-[var(--wiring-text-primary)]">{totalTables}</p>
          <p className="text-[11px] text-[var(--wiring-text-tertiary)] mt-1">분류 완료 {classifiedTables}</p>
        </div>
        <div className="glass-panel p-4">
          <p className="text-xs text-[var(--wiring-text-tertiary)] mb-1">미분류 대기</p>
          <p className="text-2xl font-bold" style={{ color: pendingTables > 0 ? "var(--wiring-warning)" : "var(--wiring-success)" }}>
            {pendingTables}
          </p>
        </div>
        <div className="glass-panel p-4">
          <p className="text-xs text-[var(--wiring-text-tertiary)] mb-1">접근 승인 대기</p>
          <p className="text-2xl font-bold" style={{ color: pendingRequests > 0 ? "var(--wiring-warning)" : "var(--wiring-success)" }}>
            {pendingRequests}
          </p>
        </div>
        <div className="glass-panel p-4">
          <p className="text-xs text-[var(--wiring-text-tertiary)] mb-1">임시 권한 활성</p>
          <p className="text-2xl font-bold" style={{ color: "#8B5CF6" }}>{temporaryPermissions.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* 테이블 분류 현황 */}
        <div className="glass-panel p-4">
          <p className="text-xs font-medium text-[var(--wiring-text-tertiary)] uppercase mb-4">테이블 분류 현황</p>
          <div className="space-y-3">
            {[
              { level: "raw" as DataLevel, count: rawCount },
              { level: "general" as DataLevel, count: generalCount },
              { level: "meta" as DataLevel, count: metaCount },
            ].map(({ level, count }) => {
              const cfg = LEVEL_CONFIG[level];
              const pct = allTables.length > 0 ? Math.round((count / allTables.length) * 100) : 0;
              return (
                <div key={level}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cfg.color }} />
                      <span className="text-xs text-[var(--wiring-text-secondary)]">{cfg.label}</span>
                      <span className="text-[10px] text-[var(--wiring-text-tertiary)]">{cfg.desc}</span>
                    </div>
                    <span className="text-xs font-medium text-[var(--wiring-text-primary)]">{count}개</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[var(--wiring-glass-border)] overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: cfg.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 최근 접근 로그 */}
        <div className="glass-panel p-4">
          <p className="text-xs font-medium text-[var(--wiring-text-tertiary)] uppercase mb-3">최근 접근 로그</p>
          <div className="space-y-2.5">
            {recentLogs.map((log) => (
              <div key={log.id} className="flex items-start gap-2">
                <SubjectIcon type={log.subjectType} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs text-[var(--wiring-text-primary)] truncate">{log.subject}</span>
                    <span className="text-[10px] text-[var(--wiring-text-tertiary)] font-mono">{log.data}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <ActionBadge action={log.action} />
                    <span className="text-[10px] text-[var(--wiring-text-tertiary)]">{formatTime(log.timestamp)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 임시 권한 */}
      {temporaryPermissions.length > 0 && (
        <div className="glass-panel p-4">
          <p className="text-xs font-medium text-[var(--wiring-text-tertiary)] uppercase mb-3">활성 임시 권한</p>
          <div className="space-y-2">
            {temporaryPermissions.map((perm) => (
              <div key={perm.id} className="flex items-center gap-3 py-2 border-b border-[var(--wiring-glass-border)] last:border-0">
                <Key className="w-4 h-4 shrink-0" style={{ color: "#8B5CF6" }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-[var(--wiring-text-primary)]">{perm.grantedTo}</span>
                    <span className="text-[10px] text-[var(--wiring-text-tertiary)]">→</span>
                    <span className="text-xs font-mono text-[var(--wiring-text-secondary)]">{perm.table}.{`{${perm.columns.join(", ")}}`}</span>
                  </div>
                  <p className="text-[11px] text-[var(--wiring-text-tertiary)] mt-0.5">{perm.purpose} · 만료: {perm.expiresWhen}</p>
                </div>
                <span className="text-[10px] text-[var(--wiring-text-tertiary)] shrink-0">승인: {perm.grantedBy}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── 데이터 소스 & 분류 탭 ───
function ClassificationTab() {
  const { dataSources, tableClassifications, classifyColumn } = useGovernanceStore();
  const [selectedDsId, setSelectedDsId] = useState(dataSources[0]?.id ?? "");
  const [expandedTable, setExpandedTable] = useState<string | null>(null);

  const tables = tableClassifications[selectedDsId] ?? [];
  const selectedDs = dataSources.find((ds) => ds.id === selectedDsId);

  return (
    <div className="space-y-4">
      {/* 데이터 소스 선택 */}
      <div className="flex gap-3">
        {dataSources.map((ds) => (
          <button
            key={ds.id}
            onClick={() => setSelectedDsId(ds.id)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all ${
              selectedDsId === ds.id
                ? "border-[var(--wiring-accent)] bg-[var(--wiring-accent-glow)]"
                : "border-[var(--wiring-glass-border)] bg-[var(--wiring-glass-bg)] hover:border-[var(--wiring-text-tertiary)]"
            }`}
          >
            {ds.status === "connected"
              ? <Wifi className="w-4 h-4 text-[var(--wiring-success)]" />
              : <WifiOff className="w-4 h-4 text-[var(--wiring-danger)]" />}
            <div className="text-left">
              <p className="text-xs font-medium text-[var(--wiring-text-primary)]">{ds.name}</p>
              <p className="text-[10px] text-[var(--wiring-text-tertiary)]">{ds.type} · {ds.tableCount}개 테이블</p>
            </div>
            {ds.pendingClassification > 0 && (
              <span
                className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium text-white"
                style={{ backgroundColor: "var(--wiring-warning)" }}
              >
                {ds.pendingClassification}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* 테이블 목록 */}
      {selectedDs && (
        <div className="glass-panel overflow-hidden">
          <div className="px-4 py-3 border-b border-[var(--wiring-glass-border)] flex items-center gap-3">
            <Server className="w-4 h-4 text-[var(--wiring-text-tertiary)]" />
            <span className="text-sm font-medium text-[var(--wiring-text-primary)]">{selectedDs.host}</span>
            <span className="text-xs text-[var(--wiring-text-tertiary)]">분류 완료: {selectedDs.classifiedTables}/{selectedDs.tableCount}</span>
          </div>
          <div className="divide-y divide-[var(--wiring-glass-border)]">
            {tables.map((table) => (
              <div key={table.id}>
                <button
                  onClick={() => setExpandedTable(expandedTable === table.id ? null : table.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[var(--wiring-glass-hover)] transition-colors"
                >
                  {expandedTable === table.id
                    ? <ChevronDown className="w-4 h-4 text-[var(--wiring-text-tertiary)] shrink-0" />
                    : <ChevronRight className="w-4 h-4 text-[var(--wiring-text-tertiary)] shrink-0" />}
                  <span className="text-sm font-mono text-[var(--wiring-text-primary)] flex-1 text-left">{table.name}</span>
                  <div className="flex items-center gap-3">
                    <LevelBadge level={table.autoClassification} />
                    {table.overrideColumns && table.overrideColumns > 0 && (
                      <span className="text-[10px] text-[var(--wiring-warning)]">{table.overrideColumns}개 예외</span>
                    )}
                    {table.confirmedBy
                      ? <CheckCircle2 className="w-3.5 h-3.5 text-[var(--wiring-success)]" />
                      : <AlertTriangle className="w-3.5 h-3.5 text-[var(--wiring-warning)]" />}
                    <span className="text-xs text-[var(--wiring-text-tertiary)] w-12 text-right">{table.columnCount}컬럼</span>
                  </div>
                </button>
                <div className="px-4 pb-1 -mt-1">
                  <p className="text-[11px] text-[var(--wiring-text-tertiary)]">{table.gmReason}</p>
                </div>

                {/* 컬럼 상세 */}
                {expandedTable === table.id && table.columns && (
                  <div className="mx-4 mb-3 glass-panel overflow-hidden">
                    <div className="grid grid-cols-[1fr_80px_80px_90px_auto] gap-0 text-[10px] text-[var(--wiring-text-tertiary)] uppercase px-3 py-2 border-b border-[var(--wiring-glass-border)]">
                      <span>컬럼명</span>
                      <span>타입</span>
                      <span>분류</span>
                      <span>방법</span>
                      <span></span>
                    </div>
                    {table.columns.map((col) => (
                      <div
                        key={col.name}
                        className={`grid grid-cols-[1fr_80px_80px_90px_auto] gap-0 px-3 py-2 items-center border-b border-[var(--wiring-glass-border)] last:border-0 ${
                          col.needsReview ? "bg-[rgba(245,158,11,0.05)]" : ""
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-mono text-[var(--wiring-text-primary)]">{col.name}</span>
                          {col.needsReview && <AlertTriangle className="w-3 h-3 text-[var(--wiring-warning)]" />}
                        </div>
                        <span className="text-[11px] font-mono text-[var(--wiring-text-tertiary)]">{col.type}</span>
                        <LevelBadge level={col.classification} />
                        <span className="text-[10px] text-[var(--wiring-text-tertiary)]">
                          {col.autoClassified ? "GM 자동" : "수동"}
                        </span>
                        {col.needsReview && (
                          <div className="flex gap-1">
                            {(["meta", "general", "raw"] as DataLevel[]).map((lvl) => (
                              <button
                                key={lvl}
                                onClick={() => classifyColumn(selectedDsId, table.id, col.name, lvl)}
                                className="px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors hover:opacity-80"
                                style={{
                                  backgroundColor: LEVEL_CONFIG[lvl].bg,
                                  color: LEVEL_CONFIG[lvl].color,
                                }}
                              >
                                {LEVEL_CONFIG[lvl].label}
                              </button>
                            ))}
                          </div>
                        )}
                        {!col.needsReview && col.gmNote && (
                          <span className="text-[10px] text-[var(--wiring-text-tertiary)]">{col.gmNote}</span>
                        )}
                        {!col.needsReview && !col.gmNote && <span />}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── 접근 정책 탭 ───
function PolicyTab() {
  const { accessPolicies } = useGovernanceStore();

  return (
    <div className="space-y-4">
      {/* 레벨 설명 */}
      <div className="grid grid-cols-3 gap-3">
        {(["meta", "general", "raw"] as DataLevel[]).map((level) => {
          const cfg = LEVEL_CONFIG[level];
          return (
            <div key={level} className="glass-panel p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cfg.color }} />
                <span className="text-sm font-semibold" style={{ color: cfg.color }}>{cfg.label}</span>
              </div>
              <p className="text-xs text-[var(--wiring-text-secondary)]">{cfg.desc}</p>
            </div>
          );
        })}
      </div>

      {/* 권한 매트릭스 */}
      <div className="glass-panel overflow-hidden">
        <div className="px-4 py-3 border-b border-[var(--wiring-glass-border)]">
          <p className="text-xs font-medium text-[var(--wiring-text-tertiary)] uppercase">역할별 접근 정책 매트릭스</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--wiring-glass-border)]">
                <th className="text-left px-4 py-3 text-xs text-[var(--wiring-text-tertiary)] uppercase font-medium w-36">역할</th>
                {(["meta", "general", "raw"] as DataLevel[]).map((level) => (
                  <th key={level} className="px-4 py-3 text-center">
                    <LevelBadge level={level} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--wiring-glass-border)]">
              {accessPolicies.map((policy) => (
                <tr key={policy.level} className="hover:bg-[var(--wiring-glass-hover)] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {policy.level === "Agent"
                        ? <Bot className="w-4 h-4 text-[var(--wiring-accent)]" />
                        : policy.level === "외부전문가"
                        ? <Globe className="w-4 h-4 text-[var(--wiring-warning)]" />
                        : <User className="w-4 h-4 text-[var(--wiring-text-secondary)]" />}
                      <span className="text-sm font-medium text-[var(--wiring-text-primary)]">{policy.level}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3"><PolicyCell value={policy.meta} /></td>
                  <td className="px-4 py-3"><PolicyCell value={policy.general} /></td>
                  <td className="px-4 py-3"><PolicyCell value={policy.raw} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 정책 범례 */}
      <div className="glass-panel p-4">
        <p className="text-xs font-medium text-[var(--wiring-text-tertiary)] uppercase mb-3">정책 범례</p>
        <div className="grid grid-cols-3 gap-4">
          {[
            { value: "allow" as const, desc: "별도 승인 없이 에이전트/유저가 자유롭게 접근 가능" },
            { value: "request" as const, desc: "접근 시 GM이 HITL 큐에 승인 요청 자동 발행" },
            { value: "deny" as const, desc: "접근 불가. 상위 레벨 특별 승인 없이는 접근 차단" },
          ].map(({ value, desc }) => (
            <div key={value} className="flex items-start gap-2">
              <PolicyCell value={value} />
              <p className="text-[11px] text-[var(--wiring-text-tertiary)] leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── 감사 로그 탭 ───
function AuditLogTab() {
  const { accessLogs } = useGovernanceStore();
  const [filter, setFilter] = useState<AccessAction | "all">("all");

  const filtered = filter === "all" ? accessLogs : accessLogs.filter((l) => l.action === filter);
  const sorted = [...filtered].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const counts: Record<AccessAction, number> = {
    auto_allow: accessLogs.filter((l) => l.action === "auto_allow").length,
    denied: accessLogs.filter((l) => l.action === "denied").length,
    request_sent: accessLogs.filter((l) => l.action === "request_sent").length,
    temp_allow: accessLogs.filter((l) => l.action === "temp_allow").length,
  };

  return (
    <div className="space-y-4">
      {/* 요약 카드 */}
      <div className="grid grid-cols-4 gap-3">
        {([
          { action: "auto_allow" as AccessAction, label: "자동 허용", color: "var(--wiring-success)" },
          { action: "denied" as AccessAction, label: "차단", color: "var(--wiring-danger)" },
          { action: "request_sent" as AccessAction, label: "승인 요청", color: "var(--wiring-warning)" },
          { action: "temp_allow" as AccessAction, label: "임시 허용", color: "#8B5CF6" },
        ] as const).map(({ action, label, color }) => (
          <button
            key={action}
            onClick={() => setFilter(filter === action ? "all" : action)}
            className={`glass-panel p-3 text-left transition-all hover:border-[var(--wiring-text-tertiary)] ${
              filter === action ? "border-[var(--wiring-accent)]" : ""
            }`}
          >
            <p className="text-xs text-[var(--wiring-text-tertiary)] mb-1">{label}</p>
            <p className="text-xl font-bold" style={{ color }}>{counts[action]}</p>
          </button>
        ))}
      </div>

      {/* 로그 테이블 */}
      <div className="glass-panel overflow-hidden">
        <div className="px-4 py-3 border-b border-[var(--wiring-glass-border)] flex items-center justify-between">
          <p className="text-xs font-medium text-[var(--wiring-text-tertiary)] uppercase">
            접근 로그 {filter !== "all" && `(필터: ${filter})`}
          </p>
          {filter !== "all" && (
            <button
              onClick={() => setFilter("all")}
              className="text-[11px] text-[var(--wiring-accent)] hover:underline"
            >
              필터 해제
            </button>
          )}
        </div>
        <div className="divide-y divide-[var(--wiring-glass-border)]">
          {sorted.map((log) => (
            <div key={log.id} className="flex items-center gap-4 px-4 py-3 hover:bg-[var(--wiring-glass-hover)] transition-colors">
              <span className="text-[11px] font-mono text-[var(--wiring-text-tertiary)] shrink-0 w-28">{formatTime(log.timestamp)}</span>
              <div className="flex items-center gap-1.5 shrink-0">
                <SubjectIcon type={log.subjectType} />
                <span className="text-xs text-[var(--wiring-text-secondary)]">{log.subject}</span>
              </div>
              <span className="text-xs font-mono text-[var(--wiring-text-primary)] flex-1 truncate">{log.data}</span>
              <LevelBadge level={log.classification} />
              <ActionBadge action={log.action} />
              <span className="text-[11px] text-[var(--wiring-text-tertiary)] truncate max-w-[180px]">{log.reason}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── 메인 페이지 ───
type Tab = "overview" | "classification" | "policy" | "audit";

export default function GovernancePage() {
  const searchParams = typeof window !== "undefined"
    ? new URLSearchParams(window.location.search)
    : null;
  const initialTab = (searchParams?.get("tab") as Tab) || "overview";
  const [tab, setTab] = useState<Tab>(initialTab);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-5">
          <div>
            <h1 className="text-xl font-semibold text-[var(--wiring-text-primary)] mb-4">거버넌스</h1>
            <div className="flex gap-2">
              <TabBtn active={tab === "overview"} onClick={() => setTab("overview")} icon={<LayoutDashboard className="w-4 h-4" />}>
                개요
              </TabBtn>
              <TabBtn active={tab === "classification"} onClick={() => setTab("classification")} icon={<Database className="w-4 h-4" />}>
                데이터 소스 & 분류
              </TabBtn>
              <TabBtn active={tab === "policy"} onClick={() => setTab("policy")} icon={<ShieldCheck className="w-4 h-4" />}>
                접근 정책
              </TabBtn>
              <TabBtn active={tab === "audit"} onClick={() => setTab("audit")} icon={<ScrollText className="w-4 h-4" />}>
                감사 로그
              </TabBtn>
            </div>
          </div>

          {tab === "overview" && <OverviewTab />}
          {tab === "classification" && <ClassificationTab />}
          {tab === "policy" && <PolicyTab />}
          {tab === "audit" && <AuditLogTab />}
        </div>
      </ScrollArea>
    </div>
  );
}
