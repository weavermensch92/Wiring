"use client";

import { use, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { DUMMY_TEAMS } from "@/dummy/teams";
import { getAllTicketsForProject, DUMMY_EPICS } from "@/dummy/projects";
import { DUMMY_USERS } from "@/dummy/users";
import { DUMMY_AGENTS } from "@/dummy/agents";
import { useHITLStore } from "@/stores/hitl-store";
import { useProjectStore } from "@/stores/project-store";
import { AddProjectDialog } from "@/components/project/add-project-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  PieChart, Pie, Cell,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  FolderOpen, Users, Ticket, AlertTriangle,
  ChevronRight, Plus, DollarSign, CheckCircle2, Clock, ArrowRight, TrendingUp,
} from "lucide-react";

const CHART_COLORS = { grid: "rgba(255,255,255,0.06)", text: "#9494A8" };

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-panel px-2.5 py-2 text-[11px]">
      {label && <p className="text-[var(--wiring-text-tertiary)] mb-1">{label}</p>}
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
          <span className="text-[var(--wiring-text-secondary)]">{p.name}:</span>
          <span className="font-medium text-[var(--wiring-text-primary)]">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

const STATUS_LABELS: Record<string, string> = {
  backlog: "백로그", todo: "할 일", in_progress: "진행 중", review: "검토", done: "완료",
};
const STATUS_COLORS: Record<string, string> = {
  backlog: "#5C5C6F", todo: "#3B82F6", in_progress: "#7C5CFC", review: "#F59E0B", done: "#22C55E",
};

function generateWeeklyDone(seed: number): { date: string; done: number }[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return {
      date: `${d.getMonth() + 1}/${d.getDate()}`,
      done: Math.max(0, Math.round((seed + i * 1.3 + Math.sin(i + seed) * 2) % 9)),
    };
  });
}

export default function TeamPage({ params }: { params: Promise<{ teamId: string }> }) {
  const { teamId } = use(params);
  const router = useRouter();
  const { queueItems } = useHITLStore();
  const { projects: storeProjects } = useProjectStore();
  const [addProjectOpen, setAddProjectOpen] = useState(false);

  const team = DUMMY_TEAMS.find((t) => t.id === teamId);
  const projects = useMemo(() => storeProjects.filter((p) => p.teamId === teamId), [storeProjects, teamId]);
  const members = DUMMY_USERS.filter((u) => u.teamIds.includes(teamId));

  if (!team) return <div className="p-6 text-[var(--wiring-text-tertiary)]">팀을 찾을 수 없습니다</div>;

  const allTickets = useMemo(() => projects.flatMap((p) => getAllTicketsForProject(p.id)), [projects]);
  const totalTickets = allTickets.length;
  const totalCost = allTickets.reduce((s, t) => s + (t.costUsd ?? 0), 0);
  const teamHITL = queueItems.filter((h) => {
    const epicIds = projects.flatMap((p) => (DUMMY_EPICS[p.id] ?? []).map((e) => e.id));
    return epicIds.includes(h.epicId) && h.status === "waiting";
  }).length;

  const statusDist = useMemo(() => {
    const counts: Record<string, number> = {};
    allTickets.forEach((t) => { counts[t.status] = (counts[t.status] ?? 0) + 1; });
    return Object.entries(counts).filter(([, v]) => v > 0)
      .map(([k, v]) => ({ name: STATUS_LABELS[k], value: v, fill: STATUS_COLORS[k] }));
  }, [allTickets]);

  const agentCostDist = (DUMMY_AGENTS as any[])
    .map((a) => ({ name: a.id, value: a.todayCostUsd ?? 0, fill: a.color }))
    .filter((a) => a.value > 0).slice(0, 6);

  const weeklyDone = generateWeeklyDone(teamId.length);

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-5">
        {/* Header */}
        <div className="glass-panel px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold" style={{ backgroundColor: team.color + "20", color: team.color }}>
              {team.abbreviation}
            </div>
            <div>
              <h1 className="text-xl font-semibold text-[var(--wiring-text-primary)]">{team.name}</h1>
              <p className="text-xs text-[var(--wiring-text-secondary)] mt-0.5">{team.description}</p>
            </div>
          </div>
          <button onClick={() => setAddProjectOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white" style={{ backgroundColor: "var(--wiring-accent)" }}>
            <Plus className="w-3.5 h-3.5" />새 프로젝트
          </button>
        </div>

        {/* KPI */}
        <div className="grid grid-cols-5 gap-3">
          {[
            { label: "프로젝트", value: projects.length, icon: <FolderOpen className="w-3.5 h-3.5" />, color: team.color },
            { label: "팀원", value: members.length, icon: <Users className="w-3.5 h-3.5" />, color: "var(--wiring-info)" },
            { label: "전체 티켓", value: totalTickets, icon: <Ticket className="w-3.5 h-3.5" />, color: "var(--wiring-accent)" },
            { label: "HITL 대기", value: teamHITL, icon: <AlertTriangle className="w-3.5 h-3.5" />, color: "var(--hitl-waiting)" },
            { label: "누적 비용", value: `$${totalCost.toFixed(0)}`, icon: <DollarSign className="w-3.5 h-3.5" />, color: "var(--wiring-warning)" },
          ].map((kpi) => (
            <div key={kpi.label} className="glass-panel p-3.5 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${kpi.color}18`, color: kpi.color }}>{kpi.icon}</div>
              <div>
                <p className="text-lg font-bold text-[var(--wiring-text-primary)]">{kpi.value}</p>
                <p className="text-[10px] text-[var(--wiring-text-tertiary)]">{kpi.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* 차트 3개 */}
        <div className="grid grid-cols-3 gap-4">
          <div className="glass-panel p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-[var(--wiring-accent)]" />
              <p className="text-sm font-semibold text-[var(--wiring-text-primary)]">주간 완료 추이</p>
            </div>
            <ResponsiveContainer width="100%" height={120}>
              <AreaChart data={weeklyDone} style={{ fontSize: 10 }}>
                <defs>
                  <linearGradient id={`tg-${teamId}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={team.color} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={team.color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
                <XAxis dataKey="date" tick={{ fill: CHART_COLORS.text, fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: CHART_COLORS.text, fontSize: 9 }} axisLine={false} tickLine={false} width={18} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="done" name="완료" stroke={team.color} fill={`url(#tg-${teamId})`} strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="glass-panel p-4">
            <div className="flex items-center gap-2 mb-2">
              <Ticket className="w-4 h-4 text-[var(--wiring-accent)]" />
              <p className="text-sm font-semibold text-[var(--wiring-text-primary)]">티켓 상태 분포</p>
            </div>
            {statusDist.length > 0 ? (
              <div className="flex items-center gap-2">
                <ResponsiveContainer width="50%" height={100}>
                  <PieChart>
                    <Pie data={statusDist} cx="50%" cy="50%" innerRadius={25} outerRadius={42} dataKey="value" paddingAngle={2}>
                      {statusDist.map((e, i) => <Cell key={i} fill={e.fill} />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-1">
                  {statusDist.slice(0, 4).map((s) => (
                    <div key={s.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: s.fill }} />
                        <span className="text-[9px] text-[var(--wiring-text-secondary)]">{s.name}</span>
                      </div>
                      <span className="text-[9px] font-medium text-[var(--wiring-text-primary)]">{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-24 flex items-center justify-center text-xs text-[var(--wiring-text-tertiary)]">데이터 없음</div>
            )}
          </div>

          <div className="glass-panel p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-[var(--wiring-accent)]" />
              <p className="text-sm font-semibold text-[var(--wiring-text-primary)]">오늘 AI 비용</p>
            </div>
            {agentCostDist.length > 0 ? (
              <div className="flex items-center gap-2">
                <ResponsiveContainer width="50%" height={100}>
                  <PieChart>
                    <Pie data={agentCostDist} cx="50%" cy="50%" outerRadius={42} dataKey="value" paddingAngle={2}>
                      {agentCostDist.map((e, i) => <Cell key={i} fill={e.fill} />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-1">
                  {agentCostDist.slice(0, 4).map((a) => (
                    <div key={a.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: a.fill }} />
                        <span className="text-[9px] text-[var(--wiring-text-secondary)]">{a.name}</span>
                      </div>
                      <span className="text-[9px] font-medium text-[var(--wiring-text-primary)]">${a.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-24 flex items-center justify-center text-xs text-[var(--wiring-text-tertiary)]">비용 없음</div>
            )}
          </div>
        </div>

        {/* 프로젝트 진행률 + 팀원 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="glass-panel p-4">
            <p className="text-sm font-semibold text-[var(--wiring-text-primary)] mb-4">프로젝트 진행률</p>
            <div className="space-y-3">
              {projects.length === 0 ? (
                <div className="py-6 text-center">
                  <FolderOpen className="w-8 h-8 text-[var(--wiring-text-tertiary)] mx-auto mb-2" />
                  <p className="text-xs text-[var(--wiring-text-tertiary)]">프로젝트가 없습니다</p>
                  <button onClick={() => setAddProjectOpen(true)} className="mt-2 text-xs text-[var(--wiring-accent)] hover:underline">+ 새 프로젝트</button>
                </div>
              ) : (
                projects.map((p) => {
                  const tks = getAllTicketsForProject(p.id);
                  const done = tks.filter((t) => t.status === "done").length;
                  const pct = tks.length > 0 ? Math.round((done / tks.length) * 100) : 0;
                  return (
                    <div key={p.id}>
                      <div className="flex items-center justify-between mb-1">
                        <button onClick={() => router.push(`/team/${teamId}/project/${p.id}`)} className="text-xs text-[var(--wiring-text-secondary)] hover:text-[var(--wiring-accent)] transition-colors truncate flex-1 text-left">{p.name}</button>
                        <span className="text-xs font-medium text-[var(--wiring-text-primary)] ml-2 shrink-0">{pct}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-[var(--wiring-glass-bg)]">
                        <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, backgroundColor: pct >= 80 ? "var(--wiring-success)" : pct >= 40 ? team.color : "var(--wiring-info)" }} />
                      </div>
                      <p className="text-[10px] text-[var(--wiring-text-tertiary)] mt-0.5">{done}/{tks.length} 티켓</p>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="glass-panel p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-[var(--wiring-text-primary)]">팀원</p>
              <button onClick={() => router.push(`/team/${teamId}/members`)} className="flex items-center gap-1 text-xs text-[var(--wiring-accent)] hover:underline">
                전체 <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="space-y-2">
              {members.slice(0, 5).map((user) => (
                <div key={user.id} className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-[var(--wiring-glass-hover)] transition-colors">
                  <Avatar className="w-7 h-7 shrink-0">
                    <AvatarFallback className="text-xs font-bold text-white bg-[var(--wiring-accent)]">{user.avatar}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-[var(--wiring-text-primary)]">{user.name}</p>
                    <p className="text-[10px] text-[var(--wiring-text-tertiary)]">{user.role} · {user.level}</p>
                  </div>
                </div>
              ))}
              {members.length > 5 && <p className="text-xs text-[var(--wiring-text-tertiary)] text-center">외 {members.length - 5}명</p>}
            </div>
          </div>
        </div>

        {/* 프로젝트 목록 */}
        <div>
          <p className="text-sm font-semibold text-[var(--wiring-text-primary)] mb-3">프로젝트 목록</p>
          <div className="space-y-2">
            {projects.map((p) => {
              const tks = getAllTicketsForProject(p.id);
              const inProg = tks.filter((t) => t.status === "in_progress").length;
              const done = tks.filter((t) => t.status === "done").length;
              return (
                <button key={p.id} onClick={() => router.push(`/team/${teamId}/project/${p.id}`)} className="w-full glass-panel px-4 py-3 flex items-center justify-between hover:border-[var(--wiring-accent)] transition-all text-left group">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: p.status === "active" ? team.color : "var(--wiring-text-tertiary)" }} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[var(--wiring-text-primary)] group-hover:text-[var(--wiring-accent)] transition-colors truncate">{p.name}</p>
                      <p className="text-[10px] text-[var(--wiring-text-tertiary)]">{p.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex items-center gap-1 text-[10px] text-[var(--wiring-text-tertiary)]"><Clock className="w-3 h-3" />{inProg}개 진행</div>
                    <div className="flex items-center gap-1 text-[10px] text-[var(--wiring-success)]"><CheckCircle2 className="w-3 h-3" />{done}개 완료</div>
                    <ChevronRight className="w-4 h-4 text-[var(--wiring-text-tertiary)]" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <AddProjectDialog open={addProjectOpen} onOpenChange={setAddProjectOpen} teamId={teamId} />
    </ScrollArea>
  );
}
