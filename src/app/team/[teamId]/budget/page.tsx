"use client";

import { use } from "react";
import { DUMMY_TEAMS } from "@/dummy/teams";
import { getProjectsForTeam } from "@/dummy/projects";
import { DUMMY_EPICS } from "@/dummy/projects";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AGENT_COLORS } from "@/lib/constants";
import { DUMMY_AGENTS } from "@/dummy/agents";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  BarChart3,
  Zap,
  Clock,
} from "lucide-react";

// ─── 프로젝트별 예산 계산 ───
function getProjectBudgetData(projectId: string) {
  const epics = DUMMY_EPICS[projectId] ?? [];
  const totalBudget = epics.reduce((s, e) => s + (e.estimatedCost ?? 0), 0);
  // 완료된 에픽 비율로 소진 추정
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

  if (!team) return (
    <div className="p-6 text-[var(--wiring-text-tertiary)]">팀을 찾을 수 없습니다</div>
  );

  const projectBudgets = projects.map((p) => ({
    project: p,
    ...getProjectBudgetData(p.id),
  }));

  const totalBudget = projectBudgets.reduce((s, pb) => s + pb.totalBudget, 0);
  const totalSpent = projectBudgets.reduce((s, pb) => s + pb.spent, 0);
  const remaining = totalBudget - totalSpent;
  const spentPct = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  // 에이전트별 오늘 비용 (더미)
  const agentCosts = DUMMY_AGENTS.map((a) => ({
    agent: a,
    todayCost: a.todayCostUsd ?? 0,
  })).sort((a, b) => b.todayCost - a.todayCost);

  const totalTodayCost = agentCosts.reduce((s, a) => s + a.todayCost, 0);

  const budgetStatus =
    spentPct >= 90 ? "danger" : spentPct >= 70 ? "warning" : "ok";

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-6">
          {/* 헤더 */}
          <div className="flex items-center gap-3">
            <span
              className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0"
              style={{ backgroundColor: team.color }}
            >
              {team.abbreviation}
            </span>
            <div>
              <h1 className="text-xl font-semibold text-[var(--wiring-text-primary)]">{team.name} 예산 관리</h1>
              <p className="text-xs text-[var(--wiring-text-tertiary)]">{team.description}</p>
            </div>
          </div>

          {/* 전체 예산 KPI */}
          <div className="grid grid-cols-4 gap-3">
            <div className="glass-panel p-4">
              <p className="text-xs text-[var(--wiring-text-tertiary)] mb-1">전체 예산</p>
              <p className="text-2xl font-bold text-[var(--wiring-text-primary)]">${totalBudget.toFixed(0)}</p>
            </div>
            <div className="glass-panel p-4">
              <p className="text-xs text-[var(--wiring-text-tertiary)] mb-1">소진</p>
              <p
                className="text-2xl font-bold"
                style={{
                  color: budgetStatus === "danger"
                    ? "var(--wiring-danger)"
                    : budgetStatus === "warning"
                    ? "var(--wiring-warning)"
                    : "var(--wiring-text-primary)",
                }}
              >
                ${totalSpent.toFixed(0)}
              </p>
              <p className="text-[11px] mt-1" style={{ color: "var(--wiring-text-tertiary)" }}>{spentPct}% 소진</p>
            </div>
            <div className="glass-panel p-4">
              <p className="text-xs text-[var(--wiring-text-tertiary)] mb-1">잔여</p>
              <p className="text-2xl font-bold" style={{ color: "var(--wiring-success)" }}>
                ${remaining.toFixed(0)}
              </p>
            </div>
            <div className="glass-panel p-4">
              <p className="text-xs text-[var(--wiring-text-tertiary)] mb-1">오늘 소비</p>
              <p className="text-2xl font-bold text-[var(--wiring-text-primary)]">${totalTodayCost.toFixed(1)}</p>
            </div>
          </div>

          {/* 전체 예산 진행 바 */}
          <div className="glass-panel p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-[var(--wiring-text-primary)]">팀 전체 예산 소진율</p>
              <div className="flex items-center gap-1.5">
                {budgetStatus === "danger" && <AlertTriangle className="w-4 h-4 text-[var(--wiring-danger)]" />}
                {budgetStatus === "warning" && <AlertTriangle className="w-4 h-4 text-[var(--wiring-warning)]" />}
                {budgetStatus === "ok" && <CheckCircle2 className="w-4 h-4 text-[var(--wiring-success)]" />}
                <span className="text-sm font-semibold" style={{
                  color: budgetStatus === "danger" ? "var(--wiring-danger)"
                    : budgetStatus === "warning" ? "var(--wiring-warning)"
                    : "var(--wiring-success)"
                }}>{spentPct}%</span>
              </div>
            </div>
            <div className="h-3 rounded-full bg-[var(--wiring-glass-border)] overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(spentPct, 100)}%`,
                  backgroundColor: budgetStatus === "danger"
                    ? "var(--wiring-danger)"
                    : budgetStatus === "warning"
                    ? "var(--wiring-warning)"
                    : "var(--wiring-success)",
                }}
              />
            </div>
            <div className="flex justify-between mt-1.5 text-[11px] text-[var(--wiring-text-tertiary)]">
              <span>$0</span>
              <span>${totalBudget.toFixed(0)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* 프로젝트별 예산 */}
            <div className="glass-panel overflow-hidden">
              <div className="px-4 py-3 border-b border-[var(--wiring-glass-border)]">
                <p className="text-xs font-medium text-[var(--wiring-text-tertiary)] uppercase">프로젝트별 예산</p>
              </div>
              <div className="divide-y divide-[var(--wiring-glass-border)]">
                {projectBudgets.map(({ project, totalBudget: pb, spent, epicsCount }) => {
                  const pct = pb > 0 ? Math.round((spent / pb) * 100) : 0;
                  const st = pct >= 90 ? "danger" : pct >= 70 ? "warning" : "ok";
                  const stColor = st === "danger" ? "var(--wiring-danger)" : st === "warning" ? "var(--wiring-warning)" : "var(--wiring-accent)";
                  return (
                    <div key={project.id} className="px-4 py-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <div>
                          <p className="text-xs font-medium text-[var(--wiring-text-primary)]">{project.name}</p>
                          <p className="text-[10px] text-[var(--wiring-text-tertiary)]">{epicsCount}개 에픽</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-semibold text-[var(--wiring-text-primary)]">${spent.toFixed(0)} / ${pb.toFixed(0)}</p>
                          <p className="text-[10px]" style={{ color: stColor }}>{pct}%</p>
                        </div>
                      </div>
                      <div className="h-1.5 rounded-full bg-[var(--wiring-glass-border)] overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: stColor }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 에이전트별 오늘 비용 */}
            <div className="glass-panel overflow-hidden">
              <div className="px-4 py-3 border-b border-[var(--wiring-glass-border)] flex items-center justify-between">
                <p className="text-xs font-medium text-[var(--wiring-text-tertiary)] uppercase">에이전트별 오늘 비용</p>
                <span className="text-xs font-semibold text-[var(--wiring-text-primary)]">${totalTodayCost.toFixed(1)} 합계</span>
              </div>
              <div className="divide-y divide-[var(--wiring-glass-border)]">
                {agentCosts.map(({ agent, todayCost }) => {
                  const pct = totalTodayCost > 0 ? Math.round((todayCost / totalTodayCost) * 100) : 0;
                  return (
                    <div key={agent.id} className="px-4 py-2.5">
                      <div className="flex items-center gap-2.5 mb-1.5">
                        <Avatar className="w-6 h-6 shrink-0">
                          <AvatarFallback
                            className="text-[9px] font-bold text-white"
                            style={{ backgroundColor: agent.color }}
                          >
                            {agent.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs font-medium text-[var(--wiring-text-primary)] flex-1">{agent.name}</span>
                        <span className="text-xs font-semibold text-[var(--wiring-text-primary)]">${todayCost.toFixed(1)}</span>
                        <span className="text-[10px] text-[var(--wiring-text-tertiary)] w-8 text-right">{pct}%</span>
                      </div>
                      <div className="h-1 rounded-full bg-[var(--wiring-glass-border)] overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${pct}%`, backgroundColor: agent.color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 에픽별 상세 비용 */}
          {projectBudgets.map(({ project }) => {
            const epics = DUMMY_EPICS[project.id] ?? [];
            if (epics.length === 0) return null;
            return (
              <div key={project.id} className="glass-panel overflow-hidden">
                <div className="px-4 py-3 border-b border-[var(--wiring-glass-border)]">
                  <p className="text-xs font-medium text-[var(--wiring-text-tertiary)] uppercase">{project.name} — 에픽별 예산</p>
                </div>
                <div className="divide-y divide-[var(--wiring-glass-border)]">
                  {epics.map((epic) => {
                    const statusColors: Record<string, string> = {
                      done: "var(--wiring-success)",
                      in_progress: "var(--wiring-accent)",
                      review: "var(--wiring-warning)",
                      backlog: "var(--wiring-text-tertiary)",
                    };
                    const statusLabels: Record<string, string> = {
                      done: "완료",
                      in_progress: "진행 중",
                      review: "검토 중",
                      backlog: "백로그",
                    };
                    return (
                      <div key={epic.id} className="flex items-center gap-4 px-4 py-3">
                        <span
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ backgroundColor: statusColors[epic.status] ?? "#555" }}
                        />
                        <p className="text-xs font-medium text-[var(--wiring-text-primary)] flex-1 truncate">{epic.title}</p>
                        <span className="text-[10px]" style={{ color: statusColors[epic.status] ?? "var(--wiring-text-tertiary)" }}>
                          {statusLabels[epic.status] ?? epic.status}
                        </span>
                        <span className="text-xs text-[var(--wiring-text-tertiary)]">{epic.estimatedDays}일</span>
                        <span className="text-xs font-semibold text-[var(--wiring-text-primary)] w-16 text-right">
                          ${(epic.estimatedCost ?? 0).toFixed(0)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
