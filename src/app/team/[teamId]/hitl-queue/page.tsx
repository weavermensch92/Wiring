"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { useHITLStore } from "@/stores/hitl-store";
import { useNavigationStore } from "@/stores/navigation-store";
import { DUMMY_TEAMS } from "@/dummy/teams";
import { DUMMY_EPICS } from "@/dummy/projects";
import { getProjectsForTeam } from "@/dummy/projects";
import { HITLQueueItem } from "@/types/hitl";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AGENT_COLORS } from "@/lib/constants";
import {
  AlertTriangle, Clock, CheckCircle2, XCircle, ArrowUpRight,
  FileText, Shield, Cpu, Palette, DollarSign, Users,
  Filter, ChevronRight,
} from "lucide-react";

const TYPE_CONFIG: Record<string, { label: string; icon: typeof FileText; color: string }> = {
  code_review:       { label: "코드 리뷰",    icon: FileText,  color: "var(--wiring-info)" },
  security_approval: { label: "보안 승인",    icon: Shield,    color: "var(--wiring-danger)" },
  spec_decision:     { label: "스펙 결정",    icon: Cpu,       color: "var(--wiring-accent)" },
  design_review:     { label: "디자인 검토",  icon: Palette,   color: "#EC4899" },
  cost_approval:     { label: "비용 승인",    icon: DollarSign,color: "var(--wiring-warning)" },
  assignment:        { label: "담당자 배정",  icon: Users,     color: "var(--wiring-success)" },
  model_allocation:  { label: "모델 배분",    icon: Cpu,       color: "var(--wiring-accent)" },
};

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  waiting:   { label: "대기 중",       color: "var(--hitl-waiting)", icon: Clock },
  in_progress:{ label: "진행 중",      color: "var(--wiring-info)",  icon: Clock },
  approved:  { label: "승인",          color: "var(--wiring-success)",icon: CheckCircle2 },
  rejected:  { label: "반려",          color: "var(--wiring-danger)", icon: XCircle },
  escalated: { label: "에스컬레이션",  color: "var(--wiring-warning)",icon: ArrowUpRight },
};

const PRIORITY_COLORS: Record<string, string> = {
  critical: "var(--wiring-danger)",
  high: "var(--wiring-warning)",
  medium: "var(--wiring-info)",
  low: "var(--wiring-text-tertiary)",
};

function HITLCard({ item, onClick }: { item: HITLQueueItem; onClick: () => void }) {
  const typeCfg = TYPE_CONFIG[item.type] ?? TYPE_CONFIG.code_review;
  const statusCfg = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.waiting;
  const StatusIcon = statusCfg.icon;
  const TypeIcon = typeCfg.icon;

  return (
    <button
      onClick={onClick}
      className="w-full text-left glass-panel p-4 hover:border-[var(--wiring-accent)] transition-all"
    >
      <div className="flex items-start gap-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
          style={{ backgroundColor: `${typeCfg.color}20`, color: typeCfg.color }}
        >
          <TypeIcon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span
              className="text-[10px] px-1.5 py-0.5 rounded font-medium"
              style={{ backgroundColor: `${typeCfg.color}15`, color: typeCfg.color }}
            >
              {typeCfg.label}
            </span>
            <span
              className="flex items-center gap-1 text-[10px]"
              style={{ color: statusCfg.color }}
            >
              <StatusIcon className="w-3 h-3" />{statusCfg.label}
            </span>
            <span
              className="text-[10px] ml-auto shrink-0 font-medium"
              style={{ color: PRIORITY_COLORS[item.priority] }}
            >
              {item.priority === "critical" ? "긴급" : item.priority === "high" ? "높음" : item.priority === "medium" ? "중간" : "낮음"}
            </span>
          </div>
          <p className="text-sm font-medium text-[var(--wiring-text-primary)] truncate">{item.title}</p>
          <div className="flex items-center gap-3 mt-1.5 text-[11px] text-[var(--wiring-text-tertiary)]">
            <span>요청: <span className="text-[var(--wiring-accent)]">{item.requestedBy}</span></span>
            <span>담당: {item.assignedTo.name} ({item.assignedTo.level})</span>
            <span className="ml-auto">{new Date(item.createdAt).toLocaleDateString("ko-KR")}</span>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-[var(--wiring-text-tertiary)] shrink-0 mt-1" />
      </div>
    </button>
  );
}

export default function TeamHITLQueuePage({ params }: { params: Promise<{ teamId: string }> }) {
  const { teamId } = use(params);
  const router = useRouter();
  const team = DUMMY_TEAMS.find((t) => t.id === teamId);
  const { queueItems } = useHITLStore();
  const { setActiveHitl } = useNavigationStore();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  // Get all epic IDs for this team
  const projects = getProjectsForTeam(teamId);
  const teamEpicIds = new Set(
    projects.flatMap((p) => (DUMMY_EPICS[p.id] ?? []).map((e) => e.id))
  );

  // Filter HITL items to this team
  const teamItems = queueItems.filter((i) => teamEpicIds.has(i.epicId));

  // Apply filters
  const filtered = teamItems.filter((i) => {
    if (statusFilter !== "all" && i.status !== statusFilter) return false;
    if (typeFilter !== "all" && i.type !== typeFilter) return false;
    return true;
  });

  // Stats
  const waitingCount  = teamItems.filter((i) => i.status === "waiting").length;
  const approvedCount = teamItems.filter((i) => i.status === "approved").length;
  const rejectedCount = teamItems.filter((i) => i.status === "rejected").length;
  const escalatedCount= teamItems.filter((i) => i.status === "escalated").length;

  if (!team) return <div className="p-6 text-[var(--wiring-text-tertiary)]">팀을 찾을 수 없습니다</div>;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-5">
          {/* Header */}
          <div className="flex items-center gap-3">
            <span
              className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0"
              style={{ backgroundColor: team.color }}
            >
              {team.abbreviation}
            </span>
            <div>
              <h1 className="text-xl font-semibold text-[var(--wiring-text-primary)]">{team.name} HITL 큐</h1>
              <p className="text-xs text-[var(--wiring-text-tertiary)]">Human-in-the-Loop 의사결정 목록</p>
            </div>
          </div>

          {/* KPI */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "대기 중", count: waitingCount, color: "var(--hitl-waiting)" },
              { label: "승인",    count: approvedCount, color: "var(--wiring-success)" },
              { label: "반려",    count: rejectedCount, color: "var(--wiring-danger)" },
              { label: "에스컬",  count: escalatedCount,color: "var(--wiring-warning)" },
            ].map(({ label, count, color }) => (
              <div key={label} className="glass-panel p-4">
                <p className="text-xs text-[var(--wiring-text-tertiary)] mb-1">{label}</p>
                <p className="text-2xl font-bold" style={{ color }}>{count}</p>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3 flex-wrap">
            <Filter className="w-4 h-4 text-[var(--wiring-text-tertiary)] shrink-0" />
            {/* Status filter */}
            <div className="flex gap-1 flex-wrap">
              {["all", "waiting", "in_progress", "approved", "rejected", "escalated"].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-2.5 py-1 rounded-lg text-xs transition-colors ${
                    statusFilter === s
                      ? "bg-[var(--wiring-accent)] text-white"
                      : "text-[var(--wiring-text-tertiary)] hover:bg-[var(--wiring-glass-hover)]"
                  }`}
                >
                  {s === "all" ? "전체 상태"
                    : s === "waiting" ? "대기"
                    : s === "in_progress" ? "진행 중"
                    : s === "approved" ? "승인"
                    : s === "rejected" ? "반려"
                    : "에스컬"}
                </button>
              ))}
            </div>
            <div className="w-px h-4 bg-[var(--wiring-glass-border)]" />
            {/* Type filter */}
            <div className="flex gap-1 flex-wrap">
              {["all", ...Object.keys(TYPE_CONFIG)].map((t) => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={`px-2.5 py-1 rounded-lg text-xs transition-colors ${
                    typeFilter === t
                      ? "bg-[var(--wiring-accent)] text-white"
                      : "text-[var(--wiring-text-tertiary)] hover:bg-[var(--wiring-glass-hover)]"
                  }`}
                >
                  {t === "all" ? "전체 유형" : TYPE_CONFIG[t]?.label}
                </button>
              ))}
            </div>
          </div>

          {/* List */}
          <div className="space-y-2">
            {filtered.length === 0 ? (
              <div className="glass-panel p-10 flex flex-col items-center gap-2">
                <AlertTriangle className="w-8 h-8 text-[var(--wiring-text-tertiary)]" />
                <p className="text-sm text-[var(--wiring-text-tertiary)]">해당하는 HITL 항목이 없습니다</p>
              </div>
            ) : (
              filtered.map((item) => (
                <HITLCard
                  key={item.id}
                  item={item}
                  onClick={() => setActiveHitl(item.id)}
                />
              ))
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
