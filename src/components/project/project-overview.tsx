"use client";

import { useMemo } from "react";
import {
  AreaChart, Area, BarChart, Bar, RadialBarChart, RadialBar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell,
} from "recharts";
import { DUMMY_EPICS, DUMMY_TICKETS, getAllTicketsForProject } from "@/dummy/projects";
import { DUMMY_PROJECT_BURNDOWN } from "@/dummy/analytics";
import { DUMMY_AGENTS } from "@/dummy/agents";
import { AGENT_COLORS } from "@/lib/constants";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  CheckCircle2, Clock, AlertTriangle, TrendingDown,
  DollarSign, Zap, BarChart3, Activity, Bot,
} from "lucide-react";

const CHART_COLORS = {
  accent: "#7C5CFC",
  success: "#22C55E",
  warning: "#F59E0B",
  danger: "#EF4444",
  info: "#3B82F6",
  grid: "rgba(255,255,255,0.06)",
  text: "#9494A8",
};

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-panel p-2.5 text-xs" style={{ fontSize: 11 }}>
      <p className="text-[var(--wiring-text-tertiary)] mb-1.5">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
          <span className="text-[var(--wiring-text-secondary)]">{p.name}:</span>
          <span className="font-medium text-[var(--wiring-text-primary)]">{typeof p.value === "number" ? (p.name.includes("$") || p.name === "비용" ? `$${p.value}` : p.value) : p.value}</span>
        </div>
      ))}
    </div>
  );
}

const STATUS_COLORS: Record<string, string> = {
  backlog: CHART_COLORS.text,
  todo: CHART_COLORS.info,
  in_progress: CHART_COLORS.accent,
  review: CHART_COLORS.warning,
  done: CHART_COLORS.success,
};

const STATUS_LABELS: Record<string, string> = {
  backlog: "백로그", todo: "할 일", in_progress: "진행 중", review: "검토", done: "완료",
};

export function ProjectOverview({ projectId }: { projectId: string }) {
  const epics = useMemo(() => DUMMY_EPICS[projectId] ?? [], [projectId]);
  const allTickets = useMemo(() => getAllTicketsForProject(projectId), [projectId]);

  // 상태별 분포
  const statusDist = useMemo(() => {
    const counts: Record<string, number> = { backlog: 0, todo: 0, in_progress: 0, review: 0, done: 0 };
    allTickets.forEach((t) => { counts[t.status] = (counts[t.status] ?? 0) + 1; });
    return Object.entries(counts).map(([status, count]) => ({
      status: STATUS_LABELS[status],
      count,
      fill: STATUS_COLORS[status],
    }));
  }, [allTickets]);

  // 에픽별 진행률
  const epicProgress = useMemo(() => {
    return epics.map((epic) => {
      const tickets = DUMMY_TICKETS[epic.id] ?? [];
      const done = tickets.filter((t) => t.status === "done").length;
      const total = tickets.length;
      const pct = total > 0 ? Math.round((done / total) * 100) : 0;
      const cost = tickets.reduce((s, t) => s + (t.costUsd ?? 0), 0);
      return { name: epic.title.slice(0, 20) + (epic.title.length > 20 ? "…" : ""), done, total, pct, cost: Math.round(cost * 10) / 10 };
    });
  }, [epics]);

  // 에이전트별 작업량
  const agentDist = useMemo(() => {
    const counts: Record<string, { tickets: number; cost: number }> = {};
    allTickets.forEach((t) => {
      if (t.assignedAgent) {
        if (!counts[t.assignedAgent]) counts[t.assignedAgent] = { tickets: 0, cost: 0 };
        counts[t.assignedAgent].tickets++;
        counts[t.assignedAgent].cost += t.costUsd ?? 0;
      }
    });
    return Object.entries(counts).map(([agent, data]) => ({
      agent,
      tickets: data.tickets,
      cost: Math.round(data.cost * 10) / 10,
      color: AGENT_COLORS[agent as keyof typeof AGENT_COLORS] ?? "#888",
    })).sort((a, b) => b.tickets - a.tickets);
  }, [allTickets]);

  const totalTickets = allTickets.length;
  const doneTickets = allTickets.filter((t) => t.status === "done").length;
  const inProgressTickets = allTickets.filter((t) => t.status === "in_progress").length;
  const hitlTickets = allTickets.filter((t) => t.hitlRequired).length;
  const totalCost = allTickets.reduce((s, t) => s + (t.costUsd ?? 0), 0);
  const completionPct = totalTickets > 0 ? Math.round((doneTickets / totalTickets) * 100) : 0;

  // 번다운 - 현재 프로젝트 기준 (proj-cm-1만 실데이터, 나머지는 총 티켓 수 기준 생성)
  const burndownData = useMemo(() => {
    if (projectId === "proj-cm-1") return DUMMY_PROJECT_BURNDOWN;
    const startRemaining = totalTickets;
    const dates = ["03/05", "03/12", "03/19", "03/26", "04/04"];
    return dates.map((date, i) => {
      const idealFraction = 1 - (i / (dates.length - 1));
      const actualFraction = Math.max(0, idealFraction + (Math.random() * 0.1 - 0.05) + 0.05 * (i / dates.length));
      return {
        date,
        ideal: Math.round(startRemaining * idealFraction),
        actual: Math.round(startRemaining * actualFraction),
      };
    });
  }, [projectId, totalTickets]);

  return (
    <ScrollArea className="h-full">
      <div className="p-5 space-y-5">
        {/* KPI */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { icon: <Activity className="w-4 h-4" />, label: "전체 티켓", value: totalTickets, color: CHART_COLORS.accent },
            { icon: <CheckCircle2 className="w-4 h-4" />, label: `완료 (${completionPct}%)`, value: doneTickets, color: CHART_COLORS.success },
            { icon: <AlertTriangle className="w-4 h-4" />, label: "HITL 필요", value: hitlTickets, color: CHART_COLORS.warning },
            { icon: <DollarSign className="w-4 h-4" />, label: "누적 비용", value: `$${totalCost.toFixed(1)}`, color: CHART_COLORS.info },
          ].map((kpi) => (
            <div key={kpi.label} className="glass-panel p-3.5 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${kpi.color}18`, color: kpi.color }}>
                {kpi.icon}
              </div>
              <div>
                <p className="text-lg font-bold text-[var(--wiring-text-primary)]">{kpi.value}</p>
                <p className="text-xs text-[var(--wiring-text-tertiary)]">{kpi.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* 번다운 + 에픽 진행률 */}
        <div className="grid grid-cols-2 gap-4">
          {/* 번다운 */}
          <div className="glass-panel p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingDown className="w-4 h-4 text-[var(--wiring-accent)]" />
              <p className="text-sm font-semibold text-[var(--wiring-text-primary)]">번다운 차트</p>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={burndownData} style={{ fontSize: 11 }}>
                <defs>
                  <linearGradient id="idealGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_COLORS.text} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={CHART_COLORS.text} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_COLORS.accent} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={CHART_COLORS.accent} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
                <XAxis dataKey="date" tick={{ fill: CHART_COLORS.text, fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: CHART_COLORS.text, fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 10, color: CHART_COLORS.text }} />
                <Area type="monotone" dataKey="ideal" name="이상" stroke={CHART_COLORS.text} fill="url(#idealGrad)" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
                <Area type="monotone" dataKey="actual" name="실제" stroke={CHART_COLORS.accent} fill="url(#actualGrad)" strokeWidth={2} dot={{ r: 3, fill: CHART_COLORS.accent }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* 에픽별 진행률 */}
          <div className="glass-panel p-4">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="w-4 h-4 text-[var(--wiring-accent)]" />
              <p className="text-sm font-semibold text-[var(--wiring-text-primary)]">에픽 진행률</p>
            </div>
            {epicProgress.length === 0 ? (
              <div className="h-40 flex items-center justify-center text-xs text-[var(--wiring-text-tertiary)]">에픽 없음</div>
            ) : (
              <div className="space-y-3">
                {epicProgress.slice(0, 5).map((ep) => (
                  <div key={ep.name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-[var(--wiring-text-secondary)] truncate flex-1">{ep.name}</span>
                      <span className="text-xs font-medium text-[var(--wiring-text-primary)] ml-2 shrink-0">{ep.pct}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-[var(--wiring-glass-bg)]">
                      <div
                        className="h-1.5 rounded-full transition-all"
                        style={{
                          width: `${ep.pct}%`,
                          backgroundColor: ep.pct >= 80 ? CHART_COLORS.success : ep.pct >= 40 ? CHART_COLORS.accent : CHART_COLORS.info,
                        }}
                      />
                    </div>
                    <p className="text-[10px] text-[var(--wiring-text-tertiary)] mt-0.5">{ep.done}/{ep.total} 티켓 · ${ep.cost}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 티켓 상태 분포 + 에이전트 작업량 */}
        <div className="grid grid-cols-2 gap-4">
          {/* 상태 분포 */}
          <div className="glass-panel p-4">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-[var(--wiring-accent)]" />
              <p className="text-sm font-semibold text-[var(--wiring-text-primary)]">티켓 상태 분포</p>
            </div>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={statusDist} style={{ fontSize: 11 }} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} horizontal={false} />
                <XAxis type="number" tick={{ fill: CHART_COLORS.text, fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="status" tick={{ fill: CHART_COLORS.text, fontSize: 10 }} axisLine={false} tickLine={false} width={45} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="티켓 수" radius={[0, 4, 4, 0]}>
                  {statusDist.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* 에이전트 기여 */}
          <div className="glass-panel p-4">
            <div className="flex items-center gap-2 mb-3">
              <Bot className="w-4 h-4 text-[var(--wiring-accent)]" />
              <p className="text-sm font-semibold text-[var(--wiring-text-primary)]">에이전트 기여</p>
            </div>
            {agentDist.length === 0 ? (
              <div className="h-40 flex items-center justify-center text-xs text-[var(--wiring-text-tertiary)]">데이터 없음</div>
            ) : (
              <div className="space-y-2 mt-1">
                {agentDist.slice(0, 5).map((a) => (
                  <div key={a.agent} className="flex items-center gap-2.5">
                    <Avatar className="w-6 h-6 shrink-0">
                      <AvatarFallback className="text-[9px] font-bold text-white" style={{ backgroundColor: a.color }}>
                        {a.agent.slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-xs text-[var(--wiring-text-secondary)]">{a.agent}</span>
                        <span className="text-xs text-[var(--wiring-text-tertiary)]">{a.tickets}개 · ${a.cost}</span>
                      </div>
                      <div className="h-1 rounded-full bg-[var(--wiring-glass-bg)]">
                        <div
                          className="h-1 rounded-full"
                          style={{
                            width: `${(a.tickets / Math.max(...agentDist.map(x => x.tickets))) * 100}%`,
                            backgroundColor: a.color,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 최근 완료 활동 */}
        <div className="glass-panel p-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-[var(--wiring-accent)]" />
            <p className="text-sm font-semibold text-[var(--wiring-text-primary)]">최근 완료 티켓</p>
          </div>
          <div className="space-y-2">
            {allTickets.filter((t) => t.status === "done").slice(0, 5).map((t) => (
              <div key={t.id} className="flex items-center gap-2.5 py-1.5 border-b border-[var(--wiring-glass-border)] last:border-0">
                <CheckCircle2 className="w-3.5 h-3.5 text-[var(--wiring-success)] shrink-0" />
                <span className="text-xs text-[var(--wiring-text-secondary)] flex-1 truncate">{t.title}</span>
                {t.assignedAgent && (
                  <Avatar className="w-4 h-4 shrink-0">
                    <AvatarFallback className="text-[7px] font-bold text-white" style={{ backgroundColor: AGENT_COLORS[t.assignedAgent as keyof typeof AGENT_COLORS] ?? "#888" }}>
                      {t.assignedAgent.slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                )}
                {t.costUsd != null && (
                  <span className="text-[10px] text-[var(--wiring-text-tertiary)] shrink-0">${t.costUsd}</span>
                )}
              </div>
            ))}
            {allTickets.filter((t) => t.status === "done").length === 0 && (
              <p className="text-xs text-[var(--wiring-text-tertiary)] py-2 text-center">완료된 티켓 없음</p>
            )}
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}
