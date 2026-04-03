"use client";

import { useMemo } from "react";
import { DUMMY_PROJECTS, DUMMY_EPICS, DUMMY_TICKETS } from "@/dummy/projects";
import { DUMMY_TEAMS } from "@/dummy/teams";
import { CURRENT_USER } from "@/dummy/users";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { BarChart3, Ticket, Clock, DollarSign } from "lucide-react";

export default function HomePage() {
  const myTeams = DUMMY_TEAMS.filter((t) => t.memberIds.includes(CURRENT_USER.id));
  const myProjects = DUMMY_PROJECTS.filter((p) =>
    myTeams.some((t) => t.id === p.teamId)
  );

  const allTickets = useMemo(() => {
    return myProjects.flatMap((project) => {
      const epics = DUMMY_EPICS[project.id] || [];
      return epics.flatMap((epic) => DUMMY_TICKETS[epic.id] || []);
    });
  }, [myProjects]);

  const totalTickets = allTickets.length;
  const inProgressCount = allTickets.filter((t) => t.status === "in_progress").length;
  const hitlCount = allTickets.filter((t) => t.hitlRequired).length;
  const totalCost = allTickets.reduce((sum, t) => sum + (t.costUsd || 0), 0);

  const recentTickets = allTickets
    .filter((t) => t.status === "in_progress" || t.status === "review")
    .slice(0, 5);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="glass-panel p-6">
        <h1 className="text-xl font-semibold text-[var(--wiring-text-primary)] mb-1">
          GRIDGE Wiring AI
        </h1>
        <p className="text-sm text-[var(--wiring-text-secondary)]">
          AI 기반 개발 관리 관제 센터 — {CURRENT_USER.name}님, 안녕하세요
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        <KPICard
          icon={<Ticket className="w-4 h-4" />}
          label="전체 티켓"
          value={totalTickets.toString()}
          color="var(--wiring-accent)"
        />
        <KPICard
          icon={<Clock className="w-4 h-4" />}
          label="진행 중"
          value={inProgressCount.toString()}
          color="var(--wiring-info)"
        />
        <KPICard
          icon={<BarChart3 className="w-4 h-4" />}
          label="HITL 대기"
          value={hitlCount.toString()}
          color="var(--wiring-warning)"
        />
        <KPICard
          icon={<DollarSign className="w-4 h-4" />}
          label="누적 비용"
          value={`$${totalCost.toFixed(0)}`}
          color="var(--wiring-success)"
        />
      </div>

      {/* Two columns */}
      <div className="grid grid-cols-2 gap-4">
        {/* Active Tickets */}
        <div className="glass-panel p-4">
          <h2 className="text-sm font-semibold text-[var(--wiring-text-primary)] mb-3">
            진행 중인 티켓
          </h2>
          <div className="space-y-2">
            {recentTickets.length === 0 ? (
              <p className="text-xs text-[var(--wiring-text-tertiary)]">진행 중인 티켓이 없습니다</p>
            ) : (
              recentTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-[var(--wiring-glass-hover)] transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{
                        backgroundColor:
                          ticket.status === "in_progress"
                            ? "var(--wiring-accent)"
                            : "var(--wiring-warning)",
                      }}
                    />
                    <span className="text-sm text-[var(--wiring-text-primary)] truncate">
                      {ticket.title}
                    </span>
                  </div>
                  <Badge variant="secondary" className="text-[10px] shrink-0">
                    {ticket.assignedAgent || "미배정"}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </div>

        {/* My Teams */}
        <div className="glass-panel p-4">
          <h2 className="text-sm font-semibold text-[var(--wiring-text-primary)] mb-3">
            소속 팀
          </h2>
          <div className="space-y-2">
            {myTeams.map((team) => {
              const teamProjects = myProjects.filter((p) => p.teamId === team.id);
              const activeCount = teamProjects.filter((p) => p.status === "active").length;
              return (
                <Link key={team.id} href={`/team/${team.id}`}>
                  <div className="flex items-center justify-between p-2 rounded-lg hover:bg-[var(--wiring-glass-hover)] transition-colors cursor-pointer">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded flex items-center justify-center text-[9px] font-bold"
                        style={{ backgroundColor: team.color + "20", color: team.color }}
                      >
                        {team.abbreviation}
                      </div>
                      <span className="text-sm text-[var(--wiring-text-primary)]">{team.name}</span>
                    </div>
                    <span className="text-xs text-[var(--wiring-text-tertiary)]">
                      {activeCount} 활성 프로젝트
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function KPICard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="glass-panel p-4">
      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-[var(--wiring-text-tertiary)]">{icon}</span>
        <p className="text-xs text-[var(--wiring-text-tertiary)]">{label}</p>
      </div>
      <p className="text-2xl font-bold" style={{ color }}>
        {value}
      </p>
    </div>
  );
}
