"use client";

import { use, useMemo } from "react";
import { DUMMY_TEAMS } from "@/dummy/teams";
import { getProjectsForTeam, DUMMY_EPICS } from "@/dummy/projects";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DUMMY_AGENTS } from "@/dummy/agents";
import { DUMMY_AGENT_DAILY_COST } from "@/dummy/analytics";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend,
} from "recharts";
import {
  DollarSign, AlertTriangle, CheckCircle2, TrendingUp, TrendingDown,
} from "lucide-react";

const CHART = { grid: "rgba(255,255,255,0.06)", text: "#9494A8" };

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-panel px-2.5 py-2 text-[11px]">
      {label && <p className="text-[var(--wiring-text-tertiary)] mb-1">{label}</p>}
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: p.color ?? p.fill }} />
          <span className="text-[var(--wiring-text-secondary)]">{p.name}:</span>
          <span className="font-medium text-[var(--wiring-text-primary)]">{typeof p.value === "number" ? `$${p.value.toFixed(1)}` : p.value}</span>
        </div>
      ))}
    </div>
  );
}

function getProjectBudgetData(projectId: string) {
  const epics = DUMMY_EPICS[projectId] ?? [];
  const totalBudget = epics.reduce((s, e) => s + (e.estimatedCost ?? 0), 0);
  const completedEpics = epics.filter((e) => e.status === "done").length;
  const inProgressEpics = epics.filter((e) => e.status === "in_progress").length;
  const spent = completedEpics * (totalBudget / Math.max(epics.length, 1))
    + inProgressEpics * (totalBudget / Math.max(epics.length, 1)) * 0.5;
  return { totalBudget, spent: Math.round(spent * 10) / 10, epicsCount: epics.length };
}

export default function TeamBudgetPage({ params }: { params: Promise<{ teamId: string }> }) {
  const { teamId } = use(params);
  const team = DUMMY_TEAMS.find((t) => t.id === teamId);
  const projects = getProjectsForTeam(teamId);

  if (!team) return <div className="p-6 text-[var(--wiring-text-tertiary)]">팀을 찾을 수 없습니다</div>;

  const projectBudgets = projects.map((p) => ({ project: p, ...getProjectBudgetData(p.id) }));
  const totalBudget = projectBudgets.reduce((s, pb) => s + pb.totalBudget, 0);
  const totalSpent = projectBudgets.reduce((s, pb) => s + pb.spent, 0);
  const remaining = totalBudget - totalSpent;
  const spentPct = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;
  const budgetStatus = spentPct >= 90 ? "danger" : spentPct >= 70 ? "warning" : "ok";
  const statusColor = budgetStatus === "danger" ? "var(--wiring-danger)" : budgetStatus === "warning" ? "var(--wiring-warning)" : "var(--wiring-success)";

  const agentCosts = (DUMMY_AGENTS as any[]).map((a) => ({
    agent: a, todayCost: a.todayCostUsd ?? 0,
  })).sort((a, b) => b.todayCost - a.todayCost);
  const totalTodayCost = agentCosts.reduce((s, a) => s + a.todayCost, 0);

  // 7일 누적 비용 추이 (area chart)
  const recentCostTrend = useMemo(() => {
    return DUMMY_AGENT_DAILY_COST.slice(-7).map((d) => ({
      date: d.date,
      total: +(d.FE + d.BE + d.Dsn + d.SM + d.PM + d.GM + d.Pln + d.BM + d.HR).toFixed(1),
      FE: d.FE, BE: d.BE, Dsn: d.Dsn,
    }));
  }, []);

  // 프로젝트별 예산 대비 실적 (stacked bar)
  const projectBarData = projectBudgets.map((pb) => ({
    name: pb.project.name.slice(0, 8) + (pb.project.name.length > 8 ? "…" : ""),
    소진: +pb.spent.toFixed(0),
    잔여: +Math.max(pb.totalBudget - pb.spent, 0).toFixed(0),
  }));

  // 에이전트별 비용 pie
  const agentPie = agentCosts.map((a) => ({ name: a.agent.id, value: +a.todayCost.toFixed(1), fill: a.agent.color })).filter((a) => a.value > 0);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-5">
          {/* Header */}
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ backgroundColor: team.color }}>{team.abbreviation}</span>
            <div>
              <h1 className="text-xl font-semibold text-[var(--wiring-text-primary)]">{team.name} 예산 관리</h1>
              <p className="text-xs text-[var(--wiring-text-tertiary)]">{team.description}</p>
            </div>
          </div>

          {/* KPI */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "전체 예산", value: `$${totalBudget.toFixed(0)}`, icon: <DollarSign className="w-4 h-4" />, color: "var(--wiring-accent)" },
              { label: `소진 (${spentPct}%)`, value: `$${totalSpent.toFixed(0)}`, icon: budgetStatus !== "ok" ? <AlertTriangle className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />, color: statusColor },
              { label: "잔여", value: `$${remaining.toFixed(0)}`, icon: <CheckCircle2 className="w-4 h-4" />, color: "var(--wiring-success)" },
              { label: "오늘 소비", value: `$${totalTodayCost.toFixed(1)}`, icon: <TrendingDown className="w-4 h-4" />, color: "var(--wiring-warning)" },
            ].map((kpi) => (
              <div key={kpi.label} className="glass-panel p-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${kpi.color}18`, color: kpi.color }}>{kpi.icon}</div>
                <div>
                  <p className="text-lg font-bold text-[var(--wiring-text-primary)]">{kpi.value}</p>
                  <p className="text-xs text-[var(--wiring-text-tertiary)]">{kpi.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* 7일 비용 추이 */}
          <div className="glass-panel p-4">
            <p className="text-sm font-semibold text-[var(--wiring-text-primary)] mb-3">7일 AI 비용 추이</p>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={recentCostTrend} style={{ fontSize: 11 }}>
                <defs>
                  <linearGradient id="costGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={team.color} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={team.color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} />
                <XAxis dataKey="date" tick={{ fill: CHART.text, fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: CHART.text, fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 10, color: CHART.text }} />
                <ReferenceLine y={totalBudget / 30} stroke="var(--wiring-warning)" strokeDasharray="4 4" label={{ value: "일일 한도", fill: "var(--wiring-warning)", fontSize: 9 }} />
                <Area type="monotone" dataKey="total" name="총 비용" stroke={team.color} fill="url(#costGrad)" strokeWidth={2} dot={false} />
                <Area type="monotone" dataKey="FE" name="FE" stroke="#06B6D4" fill="none" strokeWidth={1} dot={false} />
                <Area type="monotone" dataKey="BE" name="BE" stroke="#6366F1" fill="none" strokeWidth={1} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* 프로젝트별 예산 대비 실적 + 에이전트 파이 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="glass-panel p-4">
              <p className="text-sm font-semibold text-[var(--wiring-text-primary)] mb-3">프로젝트별 예산 vs 소진</p>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={projectBarData} style={{ fontSize: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: CHART.text, fontSize: 9 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: CHART.text, fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 10, color: CHART.text }} />
                  <Bar dataKey="소진" stackId="a" fill={team.color} radius={[0, 0, 0, 0]} />
                  <Bar dataKey="잔여" stackId="a" fill="rgba(255,255,255,0.08)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="glass-panel p-4">
              <p className="text-sm font-semibold text-[var(--wiring-text-primary)] mb-3">오늘 에이전트별 비용 분포</p>
              <div className="flex items-center gap-3">
                <ResponsiveContainer width="55%" height={150}>
                  <PieChart>
                    <Pie data={agentPie} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" paddingAngle={2}>
                      {agentPie.map((e, i) => <Cell key={i} fill={e.fill} />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-1.5">
                  {agentPie.slice(0, 5).map((a) => (
                    <div key={a.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: a.fill }} />
                        <span className="text-xs text-[var(--wiring-text-secondary)]">{a.name}</span>
                      </div>
                      <span className="text-xs font-medium text-[var(--wiring-text-primary)]">${a.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 프로젝트별 예산 진행 바 */}
          <div className="glass-panel overflow-hidden">
            <div className="px-4 py-3 border-b border-[var(--wiring-glass-border)]">
              <p className="text-xs font-medium text-[var(--wiring-text-tertiary)] uppercase">프로젝트별 상세 예산</p>
            </div>
            <div className="divide-y divide-[var(--wiring-glass-border)]">
              {projectBudgets.map(({ project, totalBudget: pb, spent, epicsCount }) => {
                const pct = pb > 0 ? Math.round((spent / pb) * 100) : 0;
                const st = pct >= 90 ? "var(--wiring-danger)" : pct >= 70 ? "var(--wiring-warning)" : team.color;
                return (
                  <div key={project.id} className="px-4 py-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <div>
                        <p className="text-xs font-medium text-[var(--wiring-text-primary)]">{project.name}</p>
                        <p className="text-[10px] text-[var(--wiring-text-tertiary)]">{epicsCount}개 에픽</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-semibold text-[var(--wiring-text-primary)]">${spent.toFixed(0)} / ${pb.toFixed(0)}</p>
                        <p className="text-[10px]" style={{ color: st }}>{pct}%</p>
                      </div>
                    </div>
                    <div className="h-2 rounded-full bg-[var(--wiring-glass-bg)]">
                      <div className="h-2 rounded-full" style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: st }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 에픽별 상세 */}
          {projectBudgets.map(({ project }) => {
            const epics = DUMMY_EPICS[project.id] ?? [];
            if (epics.length === 0) return null;
            const statusColors: Record<string, string> = { done: "var(--wiring-success)", in_progress: "var(--wiring-accent)", review: "var(--wiring-warning)", backlog: "var(--wiring-text-tertiary)" };
            const statusLabels: Record<string, string> = { done: "완료", in_progress: "진행 중", review: "검토", backlog: "백로그" };
            return (
              <div key={project.id} className="glass-panel overflow-hidden">
                <div className="px-4 py-3 border-b border-[var(--wiring-glass-border)]">
                  <p className="text-xs font-medium text-[var(--wiring-text-tertiary)] uppercase">{project.name} — 에픽별 예산</p>
                </div>
                <div className="divide-y divide-[var(--wiring-glass-border)]">
                  {epics.map((epic) => (
                    <div key={epic.id} className="flex items-center gap-4 px-4 py-3">
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: statusColors[epic.status] }} />
                      <p className="text-xs font-medium text-[var(--wiring-text-primary)] flex-1 truncate">{epic.title}</p>
                      <span className="text-[10px]" style={{ color: statusColors[epic.status] }}>{statusLabels[epic.status]}</span>
                      <span className="text-xs text-[var(--wiring-text-tertiary)]">{epic.estimatedDays}일</span>
                      <span className="text-xs font-semibold text-[var(--wiring-text-primary)] w-16 text-right">${(epic.estimatedCost ?? 0).toFixed(0)}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
