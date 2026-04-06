"use client";

import { useState, useMemo } from "react";
import { TraceRun, TraceSpan, SpanType } from "@/types/trace";
import { DUMMY_TRACES } from "@/dummy/traces";
import { AGENT_COLORS } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Cpu, Wrench, ArrowRightLeft, Pause, Code2, Eye, Map,
  DollarSign, Zap, Clock, ChevronRight, AlertTriangle, CheckCircle2,
  Loader2, X,
} from "lucide-react";

// ─── Config ────────────────────────────────────────────────

const SPAN_TYPE_CONFIG: Record<SpanType, { label: string; icon: typeof Cpu; color: string }> = {
  llm_call:      { label: "LLM 호출",    icon: Cpu,           color: "#8B5CF6" },
  tool_call:     { label: "Tool/MCP",    icon: Wrench,        color: "#06B6D4" },
  agent_handoff: { label: "Agent 인계",  icon: ArrowRightLeft, color: "#F97316" },
  hitl_gate:     { label: "HITL 대기",   icon: Pause,         color: "#FBBF24" },
  code_gen:      { label: "코드 생성",   icon: Code2,         color: "#10B981" },
  review:        { label: "검토",        icon: Eye,           color: "#EC4899" },
  planning:      { label: "계획 수립",   icon: Map,           color: "#3B82F6" },
};

const STATUS_CONFIG = {
  running:     { label: "실행 중",  color: "var(--wiring-accent)",   icon: Loader2,      pulse: true  },
  done:        { label: "완료",     color: "var(--wiring-success)",  icon: CheckCircle2, pulse: false },
  failed:      { label: "실패",     color: "var(--wiring-danger)",   icon: X,            pulse: false },
  interrupted: { label: "HITL 대기", color: "var(--hitl-waiting)",   icon: Pause,        pulse: false },
};

function formatDuration(ms?: number): string {
  if (!ms) return "—";
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
}

function formatTokens(n?: number): string {
  if (!n) return "—";
  return n >= 1000 ? `${(n / 1000).toFixed(1)}K` : `${n}`;
}

// ─── Span Bar ──────────────────────────────────────────────

function SpanBar({
  span,
  leftPct,
  widthPct,
  isSelected,
  onClick,
  agentColor,
}: {
  span: TraceSpan;
  leftPct: number;
  widthPct: number;
  isSelected: boolean;
  onClick: () => void;
  agentColor: string;
}) {
  const cfg = SPAN_TYPE_CONFIG[span.type];
  const statusCfg = STATUS_CONFIG[span.status];
  const isHitl = span.type === "hitl_gate";
  const isRunning = span.status === "running";

  const barColor = isHitl ? "var(--hitl-waiting)" : agentColor;
  const minWidth = Math.max(widthPct, 2); // 최소 2% 너비 보장

  return (
    <button
      onClick={onClick}
      title={span.label}
      className={`absolute top-1 h-6 rounded transition-all group ${
        isSelected ? "ring-2 ring-white/50 z-10" : "hover:brightness-110"
      } ${isRunning ? "animate-pulse" : ""}`}
      style={{
        left: `${leftPct}%`,
        width: `${minWidth}%`,
        backgroundColor: isHitl ? "rgba(251,191,36,0.3)" : barColor + "90",
        border: `1px solid ${isHitl ? "var(--hitl-waiting)" : barColor}`,
      }}
    >
      {/* HITL 게이트: 세로선 스타일 */}
      {isHitl ? (
        <div className="flex items-center justify-center h-full gap-1 px-1">
          <Pause className="w-3 h-3 text-[var(--hitl-waiting)] shrink-0" />
          <span className="text-[9px] text-[var(--hitl-waiting)] font-bold truncate hidden group-hover:block">HITL</span>
        </div>
      ) : (
        <span className="text-[9px] text-white px-1 truncate block leading-6">{span.label}</span>
      )}
    </button>
  );
}

// ─── Span Detail Panel ─────────────────────────────────────

function SpanDetail({ span }: { span: TraceSpan }) {
  const cfg = SPAN_TYPE_CONFIG[span.type];
  const statusCfg = STATUS_CONFIG[span.status];
  const Icon = cfg.icon;
  const StatusIcon = statusCfg.icon;

  return (
    <div className="glass-panel p-4 space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: cfg.color + "20", color: cfg.color }}>
          <Icon className="w-3.5 h-3.5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[var(--wiring-text-primary)] truncate">{span.label}</p>
          <p className="text-[10px] text-[var(--wiring-text-tertiary)]">{span.agentLabel} Agent · {cfg.label}</p>
        </div>
        <Badge variant="secondary" className="text-[10px] shrink-0" style={{ color: statusCfg.color }}>
          {statusCfg.label}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        {span.durationMs !== undefined && (
          <div className="flex items-center gap-1.5 text-[var(--wiring-text-secondary)]">
            <Clock className="w-3 h-3 text-[var(--wiring-text-tertiary)]" />
            {formatDuration(span.durationMs)}
          </div>
        )}
        {span.costUsd !== undefined && span.costUsd > 0 && (
          <div className="flex items-center gap-1.5 text-[var(--wiring-text-secondary)]">
            <DollarSign className="w-3 h-3 text-[var(--wiring-text-tertiary)]" />
            ${span.costUsd.toFixed(4)}
          </div>
        )}
        {(span.inputTokens || span.outputTokens) && (
          <div className="flex items-center gap-1.5 text-[var(--wiring-text-secondary)] col-span-2">
            <Zap className="w-3 h-3 text-[var(--wiring-text-tertiary)]" />
            IN {formatTokens(span.inputTokens)} / OUT {formatTokens(span.outputTokens)}
            {span.model && <span className="ml-1 text-[var(--wiring-text-tertiary)]">· {span.model}</span>}
          </div>
        )}
        {span.toolName && (
          <div className="flex items-center gap-1.5 text-[var(--wiring-text-secondary)]">
            <Wrench className="w-3 h-3 text-[var(--wiring-text-tertiary)]" />
            {span.toolName}
          </div>
        )}
      </div>

      {span.metadata && Object.keys(span.metadata).length > 0 && (
        <div className="space-y-1">
          {Object.entries(span.metadata).map(([k, v]) => (
            <div key={k} className="flex items-center justify-between text-[10px]">
              <span className="text-[var(--wiring-text-tertiary)]">{k.replace(/_/g, " ")}</span>
              <span className="text-[var(--wiring-text-secondary)] font-medium">{v}</span>
            </div>
          ))}
        </div>
      )}

      {span.error && (
        <div className="flex items-start gap-2 p-2 rounded bg-[var(--wiring-danger)]/10 border border-[var(--wiring-danger)]/20">
          <AlertTriangle className="w-3.5 h-3.5 text-[var(--wiring-danger)] shrink-0 mt-0.5" />
          <p className="text-[10px] text-[var(--wiring-danger)]">{span.error}</p>
        </div>
      )}
    </div>
  );
}

// ─── Main Waterfall ────────────────────────────────────────

export function TraceWaterfall({ ticketId }: { ticketId: string }) {
  const [selectedSpanId, setSelectedSpanId] = useState<string | null>(null);

  const run = DUMMY_TRACES[ticketId];

  if (!run) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-[var(--wiring-text-tertiary)] gap-2">
        <Cpu className="w-8 h-8" />
        <p className="text-sm">이 티켓의 트레이스 데이터가 없습니다</p>
        <p className="text-xs">백엔드 연동 후 실시간 트레이스가 표시됩니다</p>
      </div>
    );
  }

  // 에이전트별 레인 그룹화
  const agentIds = useMemo(() => {
    const ids = new Set(run.spans.map((s) => s.agentId));
    return [...ids];
  }, [run]);

  // 전체 시간 범위 계산
  const { runStart, totalMs } = useMemo(() => {
    const start = new Date(run.startedAt).getTime();
    const end = run.endedAt
      ? new Date(run.endedAt).getTime()
      : Date.now();
    return { runStart: start, totalMs: Math.max(end - start, 1) };
  }, [run]);

  // 눈금 생성 (5개)
  const ticks = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => ({
      pct: (i / 5) * 100,
      label: formatDuration((totalMs * i) / 5),
    }));
  }, [totalMs]);

  const selectedSpan = run.spans.find((s) => s.id === selectedSpanId);
  const statusCfg = STATUS_CONFIG[run.status];
  const StatusIcon = statusCfg.icon;

  return (
    <div className="space-y-4">
      {/* Run 헤더 */}
      <div className="glass-panel px-5 py-3 flex items-center gap-6 flex-wrap">
        <div className="flex items-center gap-2">
          <StatusIcon
            className={`w-4 h-4 ${run.status === "running" ? "animate-spin" : ""}`}
            style={{ color: statusCfg.color }}
          />
          <span className="text-sm font-medium" style={{ color: statusCfg.color }}>{statusCfg.label}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[var(--wiring-text-secondary)]">
          <DollarSign className="w-3.5 h-3.5 text-[var(--wiring-text-tertiary)]" />
          총 비용 <span className="font-mono font-medium text-[var(--wiring-text-primary)]">${run.totalCostUsd.toFixed(3)}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[var(--wiring-text-secondary)]">
          <Zap className="w-3.5 h-3.5 text-[var(--wiring-text-tertiary)]" />
          <span className="font-mono font-medium text-[var(--wiring-text-primary)]">{formatTokens(run.totalTokens)}</span> 토큰
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[var(--wiring-text-secondary)]">
          <Clock className="w-3.5 h-3.5 text-[var(--wiring-text-tertiary)]" />
          <span className="font-mono font-medium text-[var(--wiring-text-primary)]">{formatDuration(totalMs)}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[var(--wiring-text-secondary)]">
          <span>{run.spans.length}개 span</span>
        </div>
      </div>

      {/* 워터폴 캔버스 */}
      <div className="glass-panel overflow-hidden">
        {/* 에이전트 레인 */}
        <div className="divide-y divide-[var(--wiring-glass-border)]">
          {agentIds.map((agentId) => {
            const agentSpans = run.spans.filter((s) => s.agentId === agentId);
            const agentLabel = agentSpans[0]?.agentLabel ?? agentId;
            const agentColor = AGENT_COLORS[agentLabel] ?? "#6B7280";

            return (
              <div key={agentId} className="flex">
                {/* 레인 라벨 */}
                <div
                  className="w-20 shrink-0 flex items-center justify-end pr-3 py-2 text-xs font-bold"
                  style={{ color: agentColor }}
                >
                  {agentLabel}
                </div>

                {/* 레인 본체 */}
                <div className="flex-1 relative h-8 bg-[var(--wiring-glass-bg)] border-l border-[var(--wiring-glass-border)]">
                  {agentSpans.map((span) => {
                    const spanStart = new Date(span.startedAt).getTime();
                    const spanEnd = span.endedAt
                      ? new Date(span.endedAt).getTime()
                      : Date.now();
                    const leftPct = ((spanStart - runStart) / totalMs) * 100;
                    const widthPct = ((spanEnd - spanStart) / totalMs) * 100;

                    return (
                      <SpanBar
                        key={span.id}
                        span={span}
                        leftPct={Math.max(0, leftPct)}
                        widthPct={Math.min(widthPct, 100 - leftPct)}
                        isSelected={selectedSpanId === span.id}
                        onClick={() => setSelectedSpanId(selectedSpanId === span.id ? null : span.id)}
                        agentColor={agentColor}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* 타임라인 눈금 */}
        <div className="flex border-t border-[var(--wiring-glass-border)]">
          <div className="w-20 shrink-0" />
          <div className="flex-1 relative h-5 border-l border-[var(--wiring-glass-border)]">
            {ticks.map(({ pct, label }) => (
              <div
                key={pct}
                className="absolute top-0 flex flex-col items-center"
                style={{ left: `${pct}%` }}
              >
                <div className="w-px h-2 bg-[var(--wiring-glass-border)]" />
                <span className="text-[9px] text-[var(--wiring-text-tertiary)] -translate-x-1/2">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Span 범례 */}
      <div className="flex flex-wrap gap-3">
        {(Object.entries(SPAN_TYPE_CONFIG) as [SpanType, typeof SPAN_TYPE_CONFIG[SpanType]][]).map(([type, cfg]) => {
          const Icon = cfg.icon;
          const hasSpan = run.spans.some((s) => s.type === type);
          if (!hasSpan) return null;
          return (
            <div key={type} className="flex items-center gap-1.5 text-[10px] text-[var(--wiring-text-tertiary)]">
              <Icon className="w-3 h-3" style={{ color: cfg.color }} />
              {cfg.label}
            </div>
          );
        })}
      </div>

      {/* 선택된 Span 상세 */}
      {selectedSpan && (
        <div>
          <p className="text-[10px] font-medium text-[var(--wiring-text-tertiary)] uppercase mb-2 flex items-center gap-1">
            <ChevronRight className="w-3 h-3" /> Span 상세
          </p>
          <SpanDetail span={selectedSpan} />
        </div>
      )}

      {/* Span 목록 (테이블) */}
      <div className="glass-panel overflow-hidden">
        <div className="px-4 py-2 border-b border-[var(--wiring-glass-border)]">
          <p className="text-xs font-semibold text-[var(--wiring-text-secondary)]">실행 로그</p>
        </div>
        <div className="divide-y divide-[var(--wiring-glass-border)]">
          {run.spans.map((span) => {
            const cfg = SPAN_TYPE_CONFIG[span.type];
            const statusCfg = STATUS_CONFIG[span.status];
            const Icon = cfg.icon;
            const StatusIcon = statusCfg.icon;
            const agentColor = AGENT_COLORS[span.agentLabel] ?? "#6B7280";

            return (
              <button
                key={span.id}
                onClick={() => setSelectedSpanId(selectedSpanId === span.id ? null : span.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                  selectedSpanId === span.id
                    ? "bg-[var(--wiring-accent-glow)]"
                    : "hover:bg-[var(--wiring-glass-hover)]"
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: cfg.color }} />
                <span
                  className="text-[10px] font-bold w-6 shrink-0"
                  style={{ color: agentColor }}
                >
                  {span.agentLabel}
                </span>
                <span className="text-xs text-[var(--wiring-text-secondary)] flex-1 truncate">{span.label}</span>
                <StatusIcon
                  className={`w-3 h-3 shrink-0 ${span.status === "running" ? "animate-spin" : ""}`}
                  style={{ color: statusCfg.color }}
                />
                <span className="text-[10px] text-[var(--wiring-text-tertiary)] w-14 text-right shrink-0">
                  {formatDuration(span.durationMs)}
                </span>
                {span.costUsd !== undefined && span.costUsd > 0 && (
                  <span className="text-[10px] font-mono text-[var(--wiring-text-tertiary)] w-16 text-right shrink-0">
                    ${span.costUsd.toFixed(4)}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
