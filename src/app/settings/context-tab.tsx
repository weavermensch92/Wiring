"use client";

import { useContextStore } from "@/stores/context-store";
import { useNavigationStore } from "@/stores/navigation-store";
import { ContextSyncWizard } from "@/components/context/context-sync-wizard";
import { ContextSource, ContextEvent, ContextEventSeverity } from "@/types/context";
import { Badge } from "@/components/ui/badge";
import {
  GitBranch, FileText, Hash, Database, Globe, Cpu,
  CheckCircle2, XCircle, Loader2, RefreshCw, AlertTriangle,
  TrendingUp, TrendingDown, Minus, Bell, ArrowRight,
  Info, Sparkles, PenSquare,
} from "lucide-react";

// ─── Source icon map ───────────────────────────────────────

const SOURCE_ICONS: Record<string, typeof GitBranch> = {
  git: GitBranch,
  notion: FileText,
  slack: Hash,
  db: Database,
  figma: PenSquare,
  ci_cd: Cpu,
  docs: FileText,
  product_url: Globe,
};

const SOURCE_COLORS: Record<string, string> = {
  git: "#6366F1",
  notion: "#F97316",
  slack: "#10B981",
  db: "#3B82F6",
  figma: "#EC4899",
  ci_cd: "#8B5CF6",
  docs: "#F97316",
  product_url: "#06B6D4",
};

// ─── Severity config ───────────────────────────────────────

const SEVERITY_CONFIG: Record<ContextEventSeverity, { label: string; color: string; dot: string; icon: typeof AlertTriangle }> = {
  action_required: { label: "조치 필요",  color: "var(--wiring-danger)",   dot: "bg-[var(--wiring-danger)]",   icon: AlertTriangle },
  warning:         { label: "경고",       color: "var(--wiring-warning)",  dot: "bg-[var(--wiring-warning)]",  icon: AlertTriangle },
  suggestion:      { label: "제안",       color: "var(--wiring-accent)",   dot: "bg-[var(--wiring-accent)]",   icon: Sparkles },
  info:            { label: "정보",       color: "var(--wiring-info)",     dot: "bg-[var(--wiring-info)]",     icon: Info },
};

function timeAgo(iso: string): string {
  const d = Date.now() - new Date(iso).getTime();
  const m = Math.floor(d / 60000);
  if (m < 1) return "방금";
  if (m < 60) return `${m}분 전`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}시간 전`;
  return `${Math.floor(h / 24)}일 전`;
}

// ─── Source Row ────────────────────────────────────────────

function SourceRow({ source }: { source: ContextSource }) {
  const { connectSource, syncSource } = useContextStore();
  const Icon = SOURCE_ICONS[source.type] ?? Globe;
  const color = SOURCE_COLORS[source.type] ?? "#6B7280";

  return (
    <div className="flex items-center gap-3 py-3 border-b border-[var(--wiring-glass-border)] last:border-0">
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
        style={{ backgroundColor: color + "20", color }}
      >
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-[var(--wiring-text-primary)]">{source.label}</p>
        <div className="flex items-center gap-2 mt-0.5">
          {source.status === "connected" && (
            <span className="text-[10px] text-[var(--wiring-success)] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--wiring-success)]" />
              연결됨
            </span>
          )}
          {source.status === "syncing" && (
            <span className="text-[10px] text-[var(--wiring-accent)] flex items-center gap-1">
              <Loader2 className="w-2.5 h-2.5 animate-spin" />
              동기화 중
            </span>
          )}
          {source.status === "error" && (
            <span className="text-[10px] text-[var(--wiring-danger)] flex items-center gap-1">
              <XCircle className="w-2.5 h-2.5" />
              오류
            </span>
          )}
          {source.status === "disconnected" && (
            <span className="text-[10px] text-[var(--wiring-text-tertiary)]">연결 안됨</span>
          )}
          {source.lastSyncAt && (
            <span className="text-[10px] text-[var(--wiring-text-tertiary)]">
              · 마지막 동기화 {timeAgo(source.lastSyncAt)}
            </span>
          )}
        </div>
      </div>
      <div className="shrink-0">
        {source.status === "connected" ? (
          <button
            onClick={() => syncSource(source.id)}
            className="flex items-center gap-1 text-[10px] text-[var(--wiring-text-tertiary)] hover:text-[var(--wiring-text-primary)] transition-colors px-2 py-1 rounded hover:bg-[var(--wiring-glass-hover)]"
          >
            <RefreshCw className="w-3 h-3" />
            재동기화
          </button>
        ) : source.status === "syncing" ? (
          <span className="text-[10px] text-[var(--wiring-text-tertiary)]">동기화 중...</span>
        ) : (
          <button
            onClick={() => connectSource(source.id)}
            className="text-[10px] font-medium px-2.5 py-1 rounded-lg transition-colors"
            style={{ backgroundColor: color + "20", color }}
          >
            연결하기
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Event Row ─────────────────────────────────────────────

function EventRow({ event }: { event: ContextEvent }) {
  const { acknowledgeEvent } = useContextStore();
  const { setActiveHitl } = useNavigationStore();
  const cfg = SEVERITY_CONFIG[event.severity];
  const Icon = cfg.icon;

  return (
    <div className={`flex items-start gap-3 py-3 border-b border-[var(--wiring-glass-border)] last:border-0 ${event.acknowledged ? "opacity-50" : ""}`}>
      <div className="mt-0.5 shrink-0">
        {event.acknowledged ? (
          <CheckCircle2 className="w-4 h-4 text-[var(--wiring-success)]" />
        ) : (
          <span className={`w-2.5 h-2.5 rounded-full block mt-1 ${cfg.dot}`} />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <Badge
            variant="secondary"
            className="text-[9px] px-1.5 py-0"
            style={{ color: cfg.color }}
          >
            {cfg.label}
          </Badge>
          <span className="text-[10px] text-[var(--wiring-text-tertiary)]">{timeAgo(event.detectedAt)}</span>
        </div>
        <p className="text-sm text-[var(--wiring-text-primary)]">{event.title}</p>
        <p className="text-[10px] text-[var(--wiring-text-tertiary)] mt-0.5 line-clamp-2">{event.summary}</p>
      </div>
      <div className="shrink-0 flex flex-col gap-1">
        {event.hitlId && !event.acknowledged ? (
          <button
            onClick={() => setActiveHitl(event.hitlId!)}
            className="flex items-center gap-1 text-[10px] font-medium px-2.5 py-1.5 rounded-lg transition-colors"
            style={{ backgroundColor: cfg.color + "20", color: cfg.color }}
          >
            HITL 검토
            <ArrowRight className="w-3 h-3" />
          </button>
        ) : !event.acknowledged ? (
          <button
            onClick={() => acknowledgeEvent(event.id)}
            className="text-[10px] text-[var(--wiring-text-tertiary)] hover:text-[var(--wiring-text-primary)] px-2.5 py-1.5 rounded-lg hover:bg-[var(--wiring-glass-hover)] transition-colors"
          >
            확인
          </button>
        ) : null}
      </div>
    </div>
  );
}

// ─── Main Context Tab ──────────────────────────────────────

export function ContextTab() {
  const { company, events } = useContextStore();

  if (!company.onboardingCompleted) {
    return (
      <div className="max-w-lg mx-auto py-8">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-[var(--wiring-accent-glow)] flex items-center justify-center mx-auto mb-3">
            <Sparkles className="w-6 h-6 text-[var(--wiring-accent)]" />
          </div>
          <h2 className="text-lg font-semibold text-[var(--wiring-text-primary)]">회사 맥락 동기화</h2>
          <p className="text-sm text-[var(--wiring-text-tertiary)] mt-1">
            Wiring이 회사 환경을 학습하도록 소스를 연결하세요
          </p>
        </div>
        <ContextSyncWizard />
      </div>
    );
  }

  const connectedCount = company.sources.filter((s) => s.status === "connected").length;
  const actionRequired = events.filter((e) => e.severity === "action_required" && !e.acknowledged);
  const unacknowledged = events.filter((e) => !e.acknowledged);

  return (
    <div className="space-y-6 max-w-2xl">
      {/* KPI */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "연결된 소스", value: `${connectedCount}/${company.sources.length}`, color: "var(--wiring-success)" },
          { label: "조치 필요", value: actionRequired.length, color: actionRequired.length > 0 ? "var(--wiring-danger)" : "var(--wiring-text-tertiary)" },
          { label: "미확인 이벤트", value: unacknowledged.length, color: "var(--wiring-accent)" },
        ].map((kpi) => (
          <div key={kpi.label} className="glass-panel px-4 py-3">
            <p className="text-[10px] text-[var(--wiring-text-tertiary)] mb-0.5">{kpi.label}</p>
            <p className="text-xl font-bold" style={{ color: kpi.color }}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* 연결된 소스 */}
      <div className="glass-panel overflow-hidden">
        <div className="px-5 py-3 border-b border-[var(--wiring-glass-border)]">
          <p className="text-sm font-semibold text-[var(--wiring-text-primary)]">연결된 소스</p>
          {company.lastFullSyncAt && (
            <p className="text-[10px] text-[var(--wiring-text-tertiary)] mt-0.5">
              전체 동기화: {timeAgo(company.lastFullSyncAt)}
            </p>
          )}
        </div>
        <div className="px-5">
          {company.sources.map((source) => (
            <SourceRow key={source.id} source={source} />
          ))}
        </div>
      </div>

      {/* 감지된 맥락 변화 */}
      <div className="glass-panel overflow-hidden">
        <div className="px-5 py-3 border-b border-[var(--wiring-glass-border)] flex items-center gap-2">
          <Bell className="w-4 h-4 text-[var(--wiring-accent)]" />
          <p className="text-sm font-semibold text-[var(--wiring-text-primary)]">감지된 맥락 변화</p>
          {unacknowledged.length > 0 && (
            <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-[var(--wiring-danger)]/20 text-[var(--wiring-danger)]">
              {unacknowledged.length}개 미확인
            </span>
          )}
        </div>
        <div className="px-5">
          {events.length === 0 ? (
            <p className="py-6 text-center text-sm text-[var(--wiring-text-tertiary)]">감지된 변화 없음</p>
          ) : (
            events.map((event) => (
              <EventRow key={event.id} event={event} />
            ))
          )}
        </div>
      </div>

      {/* 재설정 */}
      <div className="text-right">
        <button
          onClick={() => useContextStore.getState().setOnboardingStep(0)}
          className="text-xs text-[var(--wiring-text-tertiary)] hover:text-[var(--wiring-text-secondary)] underline"
        >
          소스 연결 재설정
        </button>
      </div>
    </div>
  );
}
