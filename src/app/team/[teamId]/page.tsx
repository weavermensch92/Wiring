"use client";

import { use } from "react";
import { DUMMY_TEAMS, getProjectsForTeam } from "@/dummy/teams";
import { DUMMY_USERS } from "@/dummy/users";
import { Badge } from "@/components/ui/badge";

export default function TeamPage({ params }: { params: Promise<{ teamId: string }> }) {
  const { teamId } = use(params);
  const team = DUMMY_TEAMS.find((t) => t.id === teamId);
  const projects = getProjectsForTeam(teamId);
  const members = DUMMY_USERS.filter((u) => u.teamIds.includes(teamId));

  if (!team) {
    return (
      <div className="p-6">
        <p className="text-[var(--wiring-text-tertiary)]">팀을 찾을 수 없습니다</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="glass-panel p-6 mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold"
            style={{ backgroundColor: team.color + "20", color: team.color }}
          >
            {team.abbreviation}
          </div>
          <div>
            <h1 className="text-xl font-semibold text-[var(--wiring-text-primary)]">{team.name}</h1>
            <p className="text-sm text-[var(--wiring-text-secondary)]">{team.description}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="glass-panel p-4">
          <p className="text-xs text-[var(--wiring-text-tertiary)] mb-1">프로젝트</p>
          <p className="text-2xl font-bold" style={{ color: team.color }}>{projects.length}</p>
        </div>
        <div className="glass-panel p-4">
          <p className="text-xs text-[var(--wiring-text-tertiary)] mb-1">팀원</p>
          <p className="text-2xl font-bold text-[var(--wiring-text-primary)]">{members.length}</p>
        </div>
        <div className="glass-panel p-4">
          <p className="text-xs text-[var(--wiring-text-tertiary)] mb-1">전체 티켓</p>
          <p className="text-2xl font-bold text-[var(--wiring-info)]">
            {projects.reduce((sum, p) => sum + p.ticketCount, 0)}
          </p>
        </div>
      </div>

      <h2 className="text-sm font-semibold text-[var(--wiring-text-primary)] mb-3">프로젝트</h2>
      <div className="space-y-2">
        {projects.map((p) => (
          <div key={p.id} className="glass-panel p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: p.status === "active" ? team.color : "var(--wiring-text-tertiary)" }}
              />
              <span className="text-sm text-[var(--wiring-text-primary)]">{p.name}</span>
            </div>
            <Badge variant="secondary" className="text-xs">
              {p.ticketCount} 티켓
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}
