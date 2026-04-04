"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import {
  DUMMY_DAILY_TICKET_STATS,
  DUMMY_AGENT_DAILY_COST,
  DUMMY_HITL_WAIT_STATS,
  DUMMY_TEAM_VELOCITY,
  DUMMY_MODEL_USAGE,
  DUMMY_AGENT_EFFICIENCY,
} from "@/dummy/analytics";
import { DUMMY_AGENTS } from "@/dummy/agents";
import { DUMMY_TEAMS } from "@/dummy/teams";
import { AGENT_COLORS } from "@/lib/constants";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  BarChart3, TrendingUp, Clock, DollarSign,
  Zap, Bot, Users, Activity,
} from "lucide-react";

// ─── 공통 차트 테마 ───
const CHART_COLORS = {
  accent: "#7C5CFC",
  success: "#22C55E",
  warning: "#F59E0B",
  danger: "#EF4444",
  info: "#3B82F6",
  secondary: "#9494A8",
  grid: "rgba(255,255,255,0.06)",
  text: "#9494A8",
};

const CHART_STYLE = {
  backgroundColor: "transparent",
  fontSize: 11,
};

const customTooltipStyle = {
  backgroundColor: "#1A1A24",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: 8,
  fontSize: 11,
  color: "#EAEAF0",
};

// ─── 커스텀 툴팁 ───
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={customTooltipStyle} className="p-2.5">
      <p className="text-xs text-[var(--wiring-text-tertiary)] mb-1.5">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2 text-xs">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
          <span className="text-[var(--wiring-text-secondary)]">{p.name}:</span>
          <span className="font-medium text-[var(--wiring-text-primary)]">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

// ─── KPI 카드 ───
function KPICard({
  icon, label, value, sub, color, trend,
}: {
  icon: React.ReactNode; label: string; value: string | number;
  sub?: string; color: string; trend?: { value: number; label: string };
}) {
  return (
    <div className="glass-panel p-4">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}18`, color }}>
          {icon}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs ${trend.value >= 0 ? "text-[var(--wiring-success)]" : "text-[var(--wiring-danger)]"}`}>
            <TrendingUp className={`w-3 h-3 ${trend.value < 0 ? "rotate-180" : ""}`} />
            {Math.abs(trend.value)}%
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-[var(--wiring-text-primary)]">{value}</p>
      <p className="text-xs text-[var(--wiring-text-tertiary)] mt-0.5">{label}</p>
      {sub && <p className="text-xs mt-1" style={{ color }}>{sub}</p>}
    </div>
  );
}

// ─── 섹션 헤더 ───
function SectionHeader({ icon, title, sub }: { icon: React.ReactNode; title: string; sub?: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="text-[var(--wiring-accent)]">{icon}</div>
      <div>
        <p className="text-sm font-semibold text-[var(--wiring-text-primary)]">{title}</p>
        {sub && <p className="text-xs text-[var(--wiring-text-tertiary)]">{sub}</p>}
      </div>
    </div>
  );
}

type Tab = "overview" | "agents" | "hitl" | "teams";

export default function AnalyticsPage() {
  const [tab, setTab] = useState<Tab>("overview");

  // KPI 계산
  const latestTickets = DUMMY_DAILY_TICKET_STATS[DUMMY_DAILY_TICKET_STATS.length - 1];
  const prevTickets = DUMMY_DAILY_TICKET_STATS[DUMMY_DAILY_TICKET_STATS.length - 2];
  const totalCostToday = DUMMY_AGENTS.reduce((s, a) => s + (a.todayCostUsd ?? 0), 0);
  const latestHITL = DUMMY_HITL_WAIT_STATS[DUMMY_HITL_WAIT_STATS.length - 1];
  const totalAgentCostAll = DUMMY_AGENT_DAILY_COST.reduce((s, d) => {
    return s + d.FE + d.BE + d.Dsn + d.SM + d.PM + d.GM + d.Pln + d.BM + d.HR;
  }, 0);

  const TABS: { id: Tab; label: string }[] = [
    { id: "overview", label: "전체 개요" },
    { id: "agents", label: "에이전트" },
    { id: "hitl", label: "HITL" },
    { id: "teams", label: "팀 속도" },
  ];

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="shrink-0 px-6 py-4 border-b border-[var(--wiring-glass-border)]">
        <div className="flex items-center gap-3 mb-4">
          <BarChart3 className="w-5 h-5 text-[var(--wiring-accent)]" />
          <h1 className="text-xl font-semibold text-[var(--wiring-text-primary)]">분석 대시보드</h1>
          <span className="text-xs text-[var(--wiring-text-tertiary)] ml-auto">최근 14일 기준</span>
        </div>
        {/* Tab */}
        <div className="flex gap-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                tab === t.id
                  ? "bg-[var(--wiring-accent)] text-white font-medium"
                  : "text-[var(--wiring-text-secondary)] hover:bg-[var(--wiring-glass-hover)]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6 space-y-6">
          {/* ── 전체 개요 ── */}
          {tab === "overview" && (
            <>
              {/* KPI */}
              <div className="grid grid-cols-4 gap-3">
                <KPICard icon={<Activity className="w-4 h-4" />} label="오늘 완료 티켓" value={latestTickets.done} color={CHART_COLORS.success} trend={{ value: Math.round(((latestTickets.done - prevTickets.done) / Math.max(prevTickets.done, 1)) * 100), label: "전일 대비" }} />
                <KPICard icon={<Zap className="w-4 h-4" />} label="진행 중 티켓" value={latestTickets.inProgress} color={CHART_COLORS.accent} sub="전체 팀 합산" />
                <KPICard icon={<DollarSign className="w-4 h-4" />} label="오늘 AI 비용" value={`$${totalCostToday.toFixed(1)}`} color={CHART_COLORS.warning} trend={{ value: -8, label: "전일 대비" }} />
                <KPICard icon={<Clock className="w-4 h-4" />} label="14일 총 비용" value={`$${totalAgentCostAll.toFixed(0)}`} color={CHART_COLORS.info} sub="전사 합산" />
              </div>

              {/* 티켓 처리 추이 */}
              <div className="glass-panel p-5">
                <SectionHeader icon={<Activity className="w-4 h-4" />} title="티켓 처리 추이" sub="최근 14일" />
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={DUMMY_DAILY_TICKET_STATS} style={CHART_STYLE}>
                    <defs>
                      <linearGradient id="colorDone" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={CHART_COLORS.success} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={CHART_COLORS.success} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorInProgress" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={CHART_COLORS.accent} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={CHART_COLORS.accent} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={CHART_COLORS.info} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={CHART_COLORS.info} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
                    <XAxis dataKey="date" tick={{ fill: CHART_COLORS.text, fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: CHART_COLORS.text, fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 11, color: CHART_COLORS.text }} />
                    <Area type="monotone" dataKey="done" name="완료" stroke={CHART_COLORS.success} fill="url(#colorDone)" strokeWidth={2} dot={false} />
                    <Area type="monotone" dataKey="inProgress" name="진행 중" stroke={CHART_COLORS.accent} fill="url(#colorInProgress)" strokeWidth={2} dot={false} />
                    <Area type="monotone" dataKey="newTickets" name="신규" stroke={CHART_COLORS.info} fill="url(#colorNew)" strokeWidth={2} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* 모델 사용 분포 + 에이전트 효율 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="glass-panel p-5">
                  <SectionHeader icon={<Bot className="w-4 h-4" />} title="모델 사용 분포" sub="토큰 기준 %" />
                  <div className="flex items-center gap-4">
                    <ResponsiveContainer width="60%" height={160}>
                      <PieChart>
                        <Pie data={DUMMY_MODEL_USAGE} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                          {DUMMY_MODEL_USAGE.map((entry) => (
                            <Cell key={entry.name} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex-1 space-y-2">
                      {DUMMY_MODEL_USAGE.map((m) => (
                        <div key={m.name} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: m.color }} />
                            <span className="text-xs text-[var(--wiring-text-secondary)] truncate" style={{ maxWidth: 100 }}>{m.name}</span>
                          </div>
                          <span className="text-xs font-medium text-[var(--wiring-text-primary)]">{m.value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="glass-panel p-5">
                  <SectionHeader icon={<Zap className="w-4 h-4" />} title="에이전트 효율" sub="완료 티켓 / $100 비용" />
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={DUMMY_AGENT_EFFICIENCY} layout="vertical" style={CHART_STYLE}>
                      <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} horizontal={false} />
                      <XAxis type="number" tick={{ fill: CHART_COLORS.text, fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => v.toFixed(1)} />
                      <YAxis type="category" dataKey="agent" tick={{ fill: CHART_COLORS.text, fontSize: 10 }} axisLine={false} tickLine={false} width={30} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="efficiency" name="효율" fill={CHART_COLORS.accent} radius={[0, 4, 4, 0]}>
                        {DUMMY_AGENT_EFFICIENCY.map((entry, index) => (
                          <Cell key={index} fill={AGENT_COLORS[entry.agent as keyof typeof AGENT_COLORS] ?? CHART_COLORS.accent} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}

          {/* ── 에이전트 탭 ── */}
          {tab === "agents" && (
            <>
              {/* Agent 일간 비용 추이 */}
              <div className="glass-panel p-5">
                <SectionHeader icon={<DollarSign className="w-4 h-4" />} title="에이전트별 일간 비용 추이" sub="최근 14일 (USD)" />
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={DUMMY_AGENT_DAILY_COST} style={CHART_STYLE}>
                    <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
                    <XAxis dataKey="date" tick={{ fill: CHART_COLORS.text, fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: CHART_COLORS.text, fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 10, color: CHART_COLORS.text }} />
                    {(["FE", "BE", "Dsn", "SM", "PM", "GM"] as const).map((agentId) => (
                      <Line
                        key={agentId}
                        type="monotone"
                        dataKey={agentId}
                        name={agentId}
                        stroke={AGENT_COLORS[agentId as keyof typeof AGENT_COLORS]}
                        strokeWidth={2}
                        dot={false}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* 에이전트별 오늘 비용 바 차트 */}
              <div className="glass-panel p-5">
                <SectionHeader icon={<Bot className="w-4 h-4" />} title="오늘 에이전트 비용" sub="USD" />
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={DUMMY_AGENTS.map((a) => ({ name: a.id, cost: a.todayCostUsd ?? 0 }))} style={CHART_STYLE}>
                    <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: CHART_COLORS.text, fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: CHART_COLORS.text, fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="cost" name="비용" radius={[4, 4, 0, 0]}>
                      {DUMMY_AGENTS.map((a, i) => (
                        <Cell key={i} fill={a.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* 에이전트 완료 티켓 vs 비용 비교 */}
              <div className="glass-panel p-5">
                <SectionHeader icon={<Zap className="w-4 h-4" />} title="누적 비용 vs 완료 티켓" sub="14일 기준" />
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={DUMMY_AGENT_EFFICIENCY} style={CHART_STYLE}>
                    <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} vertical={false} />
                    <XAxis dataKey="agent" tick={{ fill: CHART_COLORS.text, fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="left" tick={{ fill: CHART_COLORS.text, fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fill: CHART_COLORS.text, fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 11, color: CHART_COLORS.text }} />
                    <Bar yAxisId="left" dataKey="totalCost" name="총 비용 ($)" radius={[4, 4, 0, 0]}>
                      {DUMMY_AGENT_EFFICIENCY.map((e, i) => (
                        <Cell key={i} fill={AGENT_COLORS[e.agent as keyof typeof AGENT_COLORS] ?? "#888"} />
                      ))}
                    </Bar>
                    <Bar yAxisId="right" dataKey="completedTickets" name="완료 티켓" fill="rgba(255,255,255,0.15)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          )}

          {/* ── HITL 탭 ── */}
          {tab === "hitl" && (
            <>
              {/* HITL KPI */}
              <div className="grid grid-cols-3 gap-3">
                <KPICard icon={<Clock className="w-4 h-4" />} label="평균 대기 시간" value={`${latestHITL.avgWaitHours}h`} color={CHART_COLORS.warning} sub="최근 기준" />
                <KPICard icon={<Activity className="w-4 h-4" />} label="이번 주 총 요청" value={latestHITL.totalRequests} color={CHART_COLORS.accent} />
                <KPICard icon={<Zap className="w-4 h-4" />} label="승인률" value={`${Math.round((latestHITL.approved / latestHITL.totalRequests) * 100)}%`} color={CHART_COLORS.success} />
              </div>

              {/* HITL 대기 시간 추이 */}
              <div className="glass-panel p-5">
                <SectionHeader icon={<Clock className="w-4 h-4" />} title="HITL 평균 대기 시간 추이" sub="시간 단위" />
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={DUMMY_HITL_WAIT_STATS} style={CHART_STYLE}>
                    <defs>
                      <linearGradient id="colorWait" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={CHART_COLORS.warning} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={CHART_COLORS.warning} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
                    <XAxis dataKey="date" tick={{ fill: CHART_COLORS.text, fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: CHART_COLORS.text, fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}h`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="avgWaitHours" name="평균 대기(h)" stroke={CHART_COLORS.warning} fill="url(#colorWait)" strokeWidth={2} dot={{ r: 3, fill: CHART_COLORS.warning }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* 승인/반려 현황 */}
              <div className="glass-panel p-5">
                <SectionHeader icon={<Activity className="w-4 h-4" />} title="승인 / 반려 현황" sub="날짜별" />
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={DUMMY_HITL_WAIT_STATS} style={CHART_STYLE}>
                    <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} vertical={false} />
                    <XAxis dataKey="date" tick={{ fill: CHART_COLORS.text, fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: CHART_COLORS.text, fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 11, color: CHART_COLORS.text }} />
                    <Bar dataKey="approved" name="승인" stackId="a" fill={CHART_COLORS.success} radius={[0, 0, 0, 0]} />
                    <Bar dataKey="rejected" name="반려" stackId="a" fill={CHART_COLORS.danger} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          )}

          {/* ── 팀 속도 탭 ── */}
          {tab === "teams" && (
            <>
              {/* 팀 KPI */}
              <div className="grid grid-cols-5 gap-3">
                {DUMMY_TEAMS.map((team) => {
                  const latestVelocity = DUMMY_TEAM_VELOCITY[DUMMY_TEAM_VELOCITY.length - 1];
                  const prevVelocity = DUMMY_TEAM_VELOCITY[DUMMY_TEAM_VELOCITY.length - 2];
                  const curr = latestVelocity[team.name as keyof typeof latestVelocity] as number;
                  const prev = prevVelocity[team.name as keyof typeof prevVelocity] as number;
                  const delta = Math.round(((curr - prev) / Math.max(prev, 1)) * 100);
                  return (
                    <KPICard
                      key={team.id}
                      icon={<Users className="w-4 h-4" />}
                      label={`${team.name} 속도`}
                      value={curr}
                      color={team.color}
                      trend={{ value: delta, label: "전 스프린트 대비" }}
                    />
                  );
                })}
              </div>

              {/* 팀 속도 비교 */}
              <div className="glass-panel p-5">
                <SectionHeader icon={<TrendingUp className="w-4 h-4" />} title="팀별 스프린트 속도" sub="완료 티켓 수 / 스프린트" />
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={DUMMY_TEAM_VELOCITY} style={CHART_STYLE}>
                    <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
                    <XAxis dataKey="sprint" tick={{ fill: CHART_COLORS.text, fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: CHART_COLORS.text, fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 11, color: CHART_COLORS.text }} />
                    {DUMMY_TEAMS.map((team) => (
                      <Line
                        key={team.id}
                        type="monotone"
                        dataKey={team.name}
                        stroke={team.color}
                        strokeWidth={2}
                        dot={{ r: 3, fill: team.color }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* 팀별 마지막 스프린트 비교 */}
              <div className="glass-panel p-5">
                <SectionHeader icon={<BarChart3 className="w-4 h-4" />} title="최근 스프린트 팀 비교" sub="완료 티켓 수" />
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart
                    data={[DUMMY_TEAM_VELOCITY[DUMMY_TEAM_VELOCITY.length - 1]]}
                    style={CHART_STYLE}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} vertical={false} />
                    <XAxis dataKey="sprint" tick={{ fill: CHART_COLORS.text, fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: CHART_COLORS.text, fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 11, color: CHART_COLORS.text }} />
                    {DUMMY_TEAMS.map((team) => (
                      <Bar key={team.id} dataKey={team.name} fill={team.color} radius={[4, 4, 0, 0]} />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
