"use client";

import { useMemo } from "react";
import { DUMMY_AGENTS, DUMMY_AGENT_WORK_HISTORY, DUMMY_AGENT_MESSAGES } from "@/dummy/agents";
import { Agent } from "@/types/agent";
import { useNavigationStore } from "@/stores/navigation-store";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Pause, Zap, DollarSign, CheckCircle2, AlertTriangle,
  Loader2, Clock, ArrowRight, Activity,
} from "lucide-react";

// ─── Utilities ─────────────────────────────────────────────

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "방금";
  if (m < 60) return `${m}분 전`;
  const h = Math.floor(m / 60);
  return `${h}시간 전`;
}

function waitDuration(iso: string): string {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 60) return `${m}분`;
  return `${Math.floor(m / 60)}시간 ${m % 60}분`;
}

// ─── Status Indicator ──────────────────────────────────────

function StatusIndicator({ status }: { status: Agent["status"] }) {
  const configs = {
    active:      { color: "var(--wiring-success)",  label: "실행 중",  dot: "bg-[var(--wiring-success)] animate-pulse" },
    interrupted: { color: "var(--hitl-waiting)",    label: "HITL 대기", dot: "bg-[var(--hitl-waiting)]" },
    idle:        { color: "var(--wiring-text-tertiary)", label: "대기", dot: "bg-[var(--wiring-text-tertiary)]" },
    error:       { color: "var(--wiring-danger)",   label: "오류",     dot: "bg-[var(--wiring-danger)]" },
  };
  const cfg = configs[status];
  return (
    <div className="flex items-center gap-1.5">
      <span className={`w-2 h-2 rounded-full shrink-0 ${cfg.dot}`} />
      <span className="text-xs font-medium" style={{ color: cfg.color }}>{cfg.label}</span>
    </div>
  );
}

// ─── Token Usage Bar ───────────────────────────────────────

function TokenBar({ used, budget }: { used: number; budget: number }) {
  if (!budget) return null;
  const pct = Math.min((used / budget) * 100, 100);
  const color = pct > 80 ? "var(--wiring-danger)" : pct > 60 ? "var(--wiring-warning)" : "var(--wiring-accent)";
  return (
    <div>
      <div className="flex justify-between text-[10px] text-[var(--wiring-text-tertiary)] mb-0.5">
        <span>토큰</span>
        <span>{(used / 1000).toFixed(1)}K / {(budget / 1000).toFixed(0)}K</span>
      </div>
      <div className="h-1 rounded-full bg-[var(--wiring-glass-bg)]">
        <div
          className="h-1 rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

// ─── Agent Card ────────────────────────────────────────────

function AgentCard({ agent }: { agent: Agent }) {
  const { setActiveHitl } = useNavigationStore();
  const isInterrupted = agent.status === "interrupted";
  const isActive = agent.status === "active";

  return (
    <div
      className={`glass-panel p-4 space-y-3 transition-all ${
        isInterrupted
          ? "border-[var(--hitl-waiting)] shadow-[0_0_12px_rgba(251,191,36,0.15)]"
          : ""
      }`}
    >
      {/* 헤더 */}
      <div className="flex items-start gap-3">
        <Avatar className="w-9 h-9 shrink-0">
          <AvatarFallback
            className="text-xs font-bold"
            style={{ backgroundColor: agent.color + "20", color: agent.color }}
          >
            {agent.avatar}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="text-sm font-semibold text-[var(--wiring-text-primary)]">{agent.avatar} Agent</p>
            {agent.primaryModel && (
              <Badge variant="secondary" className="text-[9px] px-1.5 py-0">{agent.primaryModel}</Badge>
            )}
          </div>
          <p className="text-[10px] text-[var(--wiring-text-tertiary)] truncate">{agent.role}</p>
        </div>
        <StatusIndicator status={agent.status} />
      </div>

      {/* 현재 작업 */}
      <div className="text-xs">
        {isInterrupted ? (
          <div className="space-y-1.5">
            <p className="text-[var(--wiring-text-tertiary)] flex items-center gap-1">
              <Clock className="w-3 h-3 text-[var(--hitl-waiting)]" />
              <span className="text-[var(--hitl-waiting)] font-medium">
                {agent.interruptedSince ? `${waitDuration(agent.interruptedSince)} 대기 중` : "대기 중"}
              </span>
            </p>
            {agent.waitingHitlId && (
              <button
                onClick={() => setActiveHitl(agent.waitingHitlId!)}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-colors"
                style={{ backgroundColor: "rgba(251,191,36,0.15)", color: "var(--hitl-waiting)" }}
              >
                <Pause className="w-3 h-3" />
                HITL 검토하기
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        ) : isActive ? (
          <p className="text-[var(--wiring-text-secondary)] truncate flex items-center gap-1">
            <Loader2 className="w-3 h-3 animate-spin text-[var(--wiring-accent)] shrink-0" />
            {agent.currentTask ?? "작업 중"}
          </p>
        ) : (
          <p className="text-[var(--wiring-text-tertiary)]">대기 중</p>
        )}
      </div>

      {/* 토큰 사용량 */}
      {agent.tokenUsage && (
        <TokenBar used={agent.tokenUsage.used} budget={agent.tokenUsage.budget} />
      )}

      {/* 하단 KPI */}
      <div className="flex items-center gap-3 pt-1 border-t border-[var(--wiring-glass-border)]">
        {agent.todayCostUsd !== undefined && (
          <div className="flex items-center gap-1 text-[10px] text-[var(--wiring-text-tertiary)]">
            <DollarSign className="w-3 h-3" />
            ${agent.todayCostUsd.toFixed(1)}
          </div>
        )}
        {agent.todayCompletedTickets !== undefined && (
          <div className="flex items-center gap-1 text-[10px] text-[var(--wiring-text-tertiary)]">
            <CheckCircle2 className="w-3 h-3" />
            {agent.todayCompletedTickets}건 완료
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Status Board ─────────────────────────────────────

export function AgentStatusBoard() {
  const agents = DUMMY_AGENTS;
  const { setActiveHitl } = useNavigationStore();

  const interrupted = agents.filter((a) => a.status === "interrupted");
  const active = agents.filter((a) => a.status === "active");
  const idle = agents.filter((a) => a.status === "idle");
  const errored = agents.filter((a) => a.status === "error");

  const totalCost = agents.reduce((s, a) => s + (a.todayCostUsd ?? 0), 0);
  const totalCompleted = agents.reduce((s, a) => s + (a.todayCompletedTickets ?? 0), 0);

  // 최근 작업 피드 (시간 역순)
  const recentFeed = useMemo(() => {
    const history = [...DUMMY_AGENT_WORK_HISTORY]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 8);
    return history;
  }, []);

  // 에이전트 순서: interrupted → active → idle → error
  const sorted = [...interrupted, ...active, ...idle, ...errored];

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-6">

        {/* 긴급 배너: interrupted 에이전트 */}
        {interrupted.length > 0 && (
          <div className="rounded-xl border border-[var(--hitl-waiting)]/40 bg-[var(--hitl-waiting)]/10 p-4 space-y-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[var(--hitl-waiting)]" />
              <p className="text-sm font-semibold text-[var(--hitl-waiting)]">
                {interrupted.length}개 에이전트 — HITL 승인 대기로 중단됨
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {interrupted.map((a) => (
                <button
                  key={a.id}
                  onClick={() => a.waitingHitlId && setActiveHitl(a.waitingHitlId)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors hover:brightness-110"
                  style={{ backgroundColor: a.color + "20", color: a.color, border: `1px solid ${a.color}40` }}
                >
                  <Pause className="w-3 h-3" />
                  {a.avatar} Agent
                  {a.interruptedSince && (
                    <span className="text-[var(--hitl-waiting)] ml-1">{waitDuration(a.interruptedSince)} 대기</span>
                  )}
                  <ArrowRight className="w-3 h-3 text-[var(--hitl-waiting)]" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* KPI 카드 4개 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "실행 중", value: active.length, color: "var(--wiring-success)", icon: Loader2 },
            { label: "HITL 대기", value: interrupted.length, color: "var(--hitl-waiting)", icon: Pause },
            { label: "오늘 완료", value: totalCompleted, color: "var(--wiring-info)", icon: CheckCircle2 },
            { label: "오늘 비용", value: `$${totalCost.toFixed(1)}`, color: "var(--wiring-accent)", icon: DollarSign },
          ].map((kpi) => (
            <div key={kpi.label} className="glass-panel px-4 py-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: kpi.color + "20", color: kpi.color }}>
                <kpi.icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-lg font-bold text-[var(--wiring-text-primary)]">{kpi.value}</p>
                <p className="text-[10px] text-[var(--wiring-text-tertiary)]">{kpi.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* 에이전트 그리드 */}
        <div>
          <h2 className="text-sm font-semibold text-[var(--wiring-text-secondary)] mb-3 flex items-center gap-2">
            <Activity className="w-4 h-4 text-[var(--wiring-accent)]" />
            에이전트 현황
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {sorted.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        </div>

        {/* 실시간 액션 피드 */}
        <div className="glass-panel overflow-hidden">
          <div className="px-5 py-3 border-b border-[var(--wiring-glass-border)] flex items-center gap-2">
            <Activity className="w-4 h-4 text-[var(--wiring-accent)]" />
            <p className="text-sm font-semibold text-[var(--wiring-text-primary)]">실시간 액션 피드</p>
          </div>
          <div className="divide-y divide-[var(--wiring-glass-border)]">
            {recentFeed.map((entry) => {
              const agent = agents.find((a) => a.id === entry.agentId);
              const color = agent?.color ?? "#6B7280";
              return (
                <div key={entry.id} className="flex items-center gap-3 px-5 py-3">
                  <Avatar className="w-6 h-6 shrink-0">
                    <AvatarFallback className="text-[9px] font-bold" style={{ backgroundColor: color + "20", color }}>
                      {entry.agentId}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[var(--wiring-text-primary)] truncate">{entry.ticketTitle}</p>
                    <p className="text-[10px] text-[var(--wiring-text-tertiary)] truncate">{entry.action}</p>
                  </div>
                  <div className="text-right shrink-0 space-y-0.5">
                    <p className="text-[10px] text-[var(--wiring-text-tertiary)]">{timeAgo(entry.timestamp)}</p>
                    {entry.costUsd && (
                      <p className="text-[10px] font-mono text-[var(--wiring-text-tertiary)]">${entry.costUsd.toFixed(1)}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}
