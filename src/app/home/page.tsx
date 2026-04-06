"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { DUMMY_PROJECTS, DUMMY_EPICS, DUMMY_TICKETS } from "@/dummy/projects";
import { DUMMY_TEAMS } from "@/dummy/teams";
import { CURRENT_USER } from "@/dummy/users";
import { DUMMY_AGENTS } from "@/dummy/agents";
import { useHITLStore } from "@/stores/hitl-store";
import { useNavigationStore } from "@/stores/navigation-store";
import { DUMMY_ACTIVITIES } from "@/dummy/activity";
import { DUMMY_DAILY_TICKET_STATS } from "@/dummy/analytics";
import { AGENT_COLORS } from "@/lib/constants";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AreaChart, Area, ResponsiveContainer, Tooltip, XAxis,
} from "recharts";
import {
  Ticket, Clock, DollarSign, AlertTriangle, Activity,
  TrendingUp, ArrowRight, Bot, CheckCircle2, Zap,
} from "lucide-react";

// ─── 미니 스파크라인 툴팁 ───
function SparkTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-panel px-2 py-1 text-[10px] text-[var(--wiring-text-secondary)]">
      {payload[0].value}
    </div>
  );
}

// ─── KPI 카드 (스파크라인 포함) ───
function KPICard({
  icon, label, value, color, sparkData, sparkKey, trend,
}: {
  icon: React.ReactNode; label: string; value: string | number;
  color: string; sparkData?: { date: string; [k: string]: any }[];
  sparkKey?: string; trend?: { delta: number };
}) {
  return (
    <div className="glass-panel p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}18`, color }}>
            {icon}
          </div>
          <p className="text-xs text-[var(--wiring-text-tertiary)]">{label}</p>
        </div>
        {trend && (
          <span className={`text-[10px] flex items-center gap-0.5 ${trend.delta >= 0 ? "text-[var(--wiring-success)]" : "text-[var(--wiring-danger)]"}`}>
            <TrendingUp className={`w-3 h-3 ${trend.delta < 0 ? "rotate-180" : ""}`} />
            {Math.abs(trend.delta)}%
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-[var(--wiring-text-primary)]">{value}</p>
      {sparkData && sparkKey && (
        <ResponsiveContainer width="100%" height={36}>
          <AreaChart data={sparkData} style={{ fontSize: 10 }}>
            <defs>
              <linearGradient id={`spark-${sparkKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.4} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Tooltip content={<SparkTooltip />} />
            <Area type="monotone" dataKey={sparkKey} stroke={color} fill={`url(#spark-${sparkKey})`} strokeWidth={1.5} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const { queueItems } = useHITLStore();
  const { setActiveHitl } = useNavigationStore();
  const myTeams = DUMMY_TEAMS.filter((t) => t.memberIds.includes(CURRENT_USER.id));
  const myProjects = DUMMY_PROJECTS.filter((p) => myTeams.some((t) => t.id === p.teamId));

  const allTickets = useMemo(() => {
    return myProjects.flatMap((project) => {
      const epics = DUMMY_EPICS[project.id] || [];
      return epics.flatMap((epic) => DUMMY_TICKETS[epic.id] || []);
    });
  }, [myProjects]);

  const totalTickets = allTickets.length;
  const inProgressCount = allTickets.filter((t) => t.status === "in_progress").length;
  const hitlWaiting = queueItems.filter((i) => i.status === "waiting").length;
  const totalCost = allTickets.reduce((sum, t) => sum + (t.costUsd || 0), 0);

  // 최근 진행 중 티켓
  const recentTickets = allTickets
    .filter((t) => t.status === "in_progress" || t.status === "review")
    .slice(0, 6);

  // 활성 에이전트
  const activeAgents = (DUMMY_AGENTS as any[]).filter((a) => a.status === "active");

  // 최근 활동 5개
  const recentActivity = [...DUMMY_ACTIVITIES]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);

  function timeAgo(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "방금";
    if (mins < 60) return `${mins}분 전`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}시간 전`;
    return `${Math.floor(hours / 24)}일 전`;
  }

  const STATUS_COLORS: Record<string, string> = {
    backlog: "var(--wiring-text-tertiary)",
    todo: "var(--wiring-info)",
    in_progress: "var(--wiring-accent)",
    review: "var(--wiring-warning)",
    done: "var(--wiring-success)",
  };
  const STATUS_LABELS: Record<string, string> = {
    backlog: "백로그", todo: "할 일", in_progress: "진행 중", review: "검토", done: "완료",
  };

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-5">
        {/* Header */}
        <div className="glass-panel px-5 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-[var(--wiring-text-primary)]">
              GRIDGE Wiring AI
            </h1>
            <p className="text-xs text-[var(--wiring-text-secondary)] mt-0.5">
              {CURRENT_USER.name}님, 안녕하세요 — {new Date().toLocaleDateString("ko-KR", { month: "long", day: "numeric", weekday: "long" })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {hitlWaiting > 0 && (
              <button
                onClick={() => { const first = queueItems.find((i) => i.status === "waiting"); if (first) setActiveHitl(first.id); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-black"
                style={{ backgroundColor: "var(--hitl-waiting)" }}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                HITL {hitlWaiting}건 대기
              </button>
            )}
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-4 gap-3">
          <KPICard
            icon={<Ticket className="w-3.5 h-3.5" />}
            label="전체 티켓"
            value={totalTickets}
            color="var(--wiring-accent)"
            sparkData={DUMMY_DAILY_TICKET_STATS.slice(-7)}
            sparkKey="newTickets"
            trend={{ delta: 12 }}
          />
          <KPICard
            icon={<Clock className="w-3.5 h-3.5" />}
            label="진행 중"
            value={inProgressCount}
            color="var(--wiring-info)"
            sparkData={DUMMY_DAILY_TICKET_STATS.slice(-7)}
            sparkKey="inProgress"
          />
          <KPICard
            icon={<AlertTriangle className="w-3.5 h-3.5" />}
            label="HITL 대기"
            value={hitlWaiting}
            color="var(--hitl-waiting)"
          />
          <KPICard
            icon={<DollarSign className="w-3.5 h-3.5" />}
            label="누적 AI 비용"
            value={`$${totalCost.toFixed(0)}`}
            color="var(--wiring-warning)"
            sparkData={DUMMY_DAILY_TICKET_STATS.slice(-7)}
            sparkKey="done"
            trend={{ delta: -8 }}
          />
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-3 gap-4">
          {/* 진행 중 티켓 (2/3 width) */}
          <div className="col-span-2 glass-panel p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-[var(--wiring-text-primary)]">진행 중인 티켓</h2>
              <button
                onClick={() => router.push("/analytics")}
                className="flex items-center gap-1 text-xs text-[var(--wiring-accent)] hover:underline"
              >
                전체 보기 <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="space-y-1.5">
              {recentTickets.length === 0 ? (
                <p className="text-xs text-[var(--wiring-text-tertiary)] py-4 text-center">진행 중인 티켓이 없습니다</p>
              ) : (
                recentTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-[var(--wiring-glass-hover)] transition-colors cursor-pointer group"
                  >
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: STATUS_COLORS[ticket.status] }} />
                    <span className="text-sm text-[var(--wiring-text-primary)] flex-1 truncate">{ticket.title}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded shrink-0" style={{ color: STATUS_COLORS[ticket.status], backgroundColor: `${STATUS_COLORS[ticket.status]}18` }}>
                      {STATUS_LABELS[ticket.status]}
                    </span>
                    {ticket.assignedAgent && (
                      <Avatar className="w-5 h-5 shrink-0">
                        <AvatarFallback className="text-[8px] font-bold text-white" style={{ backgroundColor: AGENT_COLORS[ticket.assignedAgent as keyof typeof AGENT_COLORS] ?? "#888" }}>
                          {ticket.assignedAgent.slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    {ticket.costUsd != null && (
                      <span className="text-[10px] text-[var(--wiring-text-tertiary)] shrink-0 group-hover:visible">${ticket.costUsd}</span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 소속 팀 (1/3 width) */}
          <div className="glass-panel p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-[var(--wiring-text-primary)]">소속 팀</h2>
            </div>
            <div className="space-y-2">
              {myTeams.map((team) => {
                const teamProjects = myProjects.filter((p) => p.teamId === team.id);
                const activeCount = teamProjects.filter((p) => p.status === "active").length;
                const teamTickets = teamProjects.flatMap((p) => {
                  const epics = DUMMY_EPICS[p.id] || [];
                  return epics.flatMap((e) => DUMMY_TICKETS[e.id] || []);
                });
                const inProg = teamTickets.filter((t) => t.status === "in_progress").length;
                return (
                  <button
                    key={team.id}
                    onClick={() => router.push(`/team/${team.id}`)}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-[var(--wiring-glass-hover)] transition-colors text-left"
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0"
                      style={{ backgroundColor: team.color + "20", color: team.color }}
                    >
                      {team.abbreviation}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-[var(--wiring-text-primary)] truncate">{team.name}</p>
                      <p className="text-[10px] text-[var(--wiring-text-tertiary)]">{activeCount}개 프로젝트 · {inProg}개 진행 중</p>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-[var(--wiring-text-tertiary)] shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 하단 2컬럼 */}
        <div className="grid grid-cols-2 gap-4">
          {/* 활성 에이전트 */}
          <div className="glass-panel p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-[var(--wiring-text-primary)]">활성 에이전트</h2>
              <button
                onClick={() => router.push("/agents")}
                className="flex items-center gap-1 text-xs text-[var(--wiring-accent)] hover:underline"
              >
                전체 <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="space-y-2">
              {activeAgents.length === 0 ? (
                <p className="text-xs text-[var(--wiring-text-tertiary)]">활성 에이전트 없음</p>
              ) : (
                activeAgents.map((agent: any) => (
                  <div key={agent.id} className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-[var(--wiring-glass-hover)] transition-colors">
                    <Avatar className="w-7 h-7 shrink-0">
                      <AvatarFallback className="text-[10px] font-bold text-white" style={{ backgroundColor: agent.color }}>
                        {agent.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-[var(--wiring-text-primary)]">{agent.name}</p>
                      {agent.currentTask && (
                        <p className="text-[10px] text-[var(--wiring-text-tertiary)] truncate">{agent.currentTask}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--wiring-success)] animate-pulse" />
                      <span className="text-[10px] text-[var(--wiring-text-tertiary)]">${(agent.todayCostUsd ?? 0).toFixed(1)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 최근 활동 */}
          <div className="glass-panel p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-[var(--wiring-text-primary)]">최근 활동</h2>
              <button
                onClick={() => router.push("/activity")}
                className="flex items-center gap-1 text-xs text-[var(--wiring-accent)] hover:underline"
              >
                전체 <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="space-y-2.5">
              {recentActivity.map((act) => {
                const agentColor = act.actorType === "agent"
                  ? (AGENT_COLORS[act.actorId as keyof typeof AGENT_COLORS] ?? "#888")
                  : "var(--wiring-info)";
                return (
                  <div key={act.id} className="flex items-start gap-2.5">
                    <Avatar className="w-5 h-5 shrink-0 mt-0.5">
                      <AvatarFallback className="text-[7px] font-bold text-white" style={{ backgroundColor: agentColor }}>
                        {act.actorName.slice(0, 1)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-[var(--wiring-text-secondary)] truncate">{act.title}</p>
                      <p className="text-[10px] text-[var(--wiring-text-tertiary)] mt-0.5 truncate">{act.body}</p>
                    </div>
                    <span className="text-[10px] text-[var(--wiring-text-tertiary)] shrink-0">{timeAgo(act.timestamp)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}
