"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DUMMY_TEAMS } from "@/dummy/teams";
import { getProjectsForTeam, DUMMY_EPICS, DUMMY_TICKETS } from "@/dummy/projects";
import { CURRENT_USER } from "@/dummy/users";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, ChevronLeft, ChevronRight, ExternalLink, Bot, AlertTriangle } from "lucide-react";

// ─── Week generation ───
function generateWeeks(count: number, offsetWeeks = 0) {
  const weeks: { label: string; start: Date }[] = [];
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay() + 1);

  for (let i = offsetWeeks - 2; i < offsetWeeks + count; i++) {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i * 7);
    weeks.push({
      label: `${d.getMonth() + 1}/${d.getDate()}`,
      start: d,
    });
  }
  return weeks;
}

const STATUS_COLORS: Record<string, string> = {
  backlog: "var(--wiring-text-tertiary)",
  todo: "var(--wiring-info)",
  in_progress: "var(--wiring-accent)",
  review: "var(--wiring-warning)",
  done: "var(--wiring-success)",
};

function getProgressWidth(status: string): number {
  return status === "done" ? 100 : status === "review" ? 85 : status === "in_progress" ? 50 : status === "todo" ? 15 : 5;
}

const WEEK_WIDTH = 80;
const WEEKS_VISIBLE = 10;

export default function SchedulePage() {
  const router = useRouter();
  const [offset, setOffset] = useState(0);
  const weeks = generateWeeks(WEEKS_VISIBLE, offset);

  // Collect all projects/epics/tickets for current user's teams
  const userTeams = DUMMY_TEAMS.filter((t) => CURRENT_USER.teamIds.includes(t.id));
  const allProjectGroups = userTeams.flatMap((team) =>
    getProjectsForTeam(team.id)
      .filter((p) => p.status === "active")
      .map((p) => ({ team, project: p }))
  );

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CalendarDays className="w-5 h-5 text-[var(--wiring-accent)]" />
              <h1 className="text-xl font-semibold text-[var(--wiring-text-primary)]">일정</h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setOffset((o) => o - 1)}
                className="p-1.5 rounded-lg text-[var(--wiring-text-tertiary)] hover:bg-[var(--wiring-glass-hover)] transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setOffset(0)}
                className="px-3 py-1.5 rounded-lg text-xs text-[var(--wiring-accent)] hover:bg-[var(--wiring-accent-glow)] transition-colors"
              >
                오늘
              </button>
              <button
                onClick={() => setOffset((o) => o + 1)}
                className="p-1.5 rounded-lg text-[var(--wiring-text-tertiary)] hover:bg-[var(--wiring-glass-hover)] transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Gantt */}
          <div className="glass-panel overflow-hidden">
            {/* Week header */}
            <div className="flex border-b border-[var(--wiring-glass-border)] sticky top-0 bg-[var(--wiring-bg-secondary)] z-10">
              <div className="w-56 shrink-0 px-4 py-2 text-xs text-[var(--wiring-text-tertiary)] border-r border-[var(--wiring-glass-border)]">
                프로젝트 / 에픽 / 티켓
              </div>
              <div className="flex overflow-hidden">
                {weeks.map((w, i) => {
                  const isCurrentWeek = i === 2; // offset=0 기준 현재 주 위치
                  return (
                    <div
                      key={i}
                      className={`shrink-0 text-center py-2 text-[10px] font-medium border-r border-[var(--wiring-glass-border)] last:border-0 ${
                        isCurrentWeek && offset === 0
                          ? "text-[var(--wiring-accent)] bg-[var(--wiring-accent-glow)]"
                          : "text-[var(--wiring-text-tertiary)]"
                      }`}
                      style={{ width: WEEK_WIDTH }}
                    >
                      {w.label}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Rows */}
            {allProjectGroups.map(({ team, project }) => {
              const epics = DUMMY_EPICS[project.id] ?? [];
              return (
                <div key={project.id}>
                  {/* Project row */}
                  <div className="flex items-center border-b border-[var(--wiring-glass-border)] bg-[var(--wiring-bg-tertiary)]">
                    <div className="w-56 shrink-0 px-4 py-2 flex items-center gap-2 border-r border-[var(--wiring-glass-border)]">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: team.color }} />
                      <span className="text-xs font-semibold text-[var(--wiring-text-primary)] truncate">{project.name}</span>
                      <button
                        className="ml-auto text-[var(--wiring-text-tertiary)] hover:text-[var(--wiring-accent)] transition-colors"
                        onClick={() => router.push(`/team/${team.id}/project/${project.id}?tab=timeline`)}
                      >
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="flex" style={{ width: WEEK_WIDTH * WEEKS_VISIBLE }}>
                      {/* Project span bar */}
                      <div className="relative w-full h-8 flex items-center px-2">
                        <div
                          className="h-1.5 rounded-full opacity-30"
                          style={{ width: "100%", backgroundColor: team.color }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Epic rows */}
                  {epics.map((epic) => {
                    const tickets = DUMMY_TICKETS[epic.id] ?? [];
                    const epicProgress = epic.ticketCount > 0
                      ? Math.round((epic.completedTickets / epic.ticketCount) * 100) : 0;
                    const epicColor =
                      epic.status === "done" ? "var(--wiring-success)"
                      : epic.status === "in_progress" ? "var(--wiring-accent)"
                      : "var(--wiring-text-tertiary)";

                    return (
                      <div key={epic.id}>
                        {/* Epic row */}
                        <div className="flex items-center border-b border-[var(--wiring-glass-border)]">
                          <div className="w-56 shrink-0 pl-7 pr-4 py-2 flex items-center gap-2 border-r border-[var(--wiring-glass-border)]">
                            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: epicColor }} />
                            <span className="text-xs font-medium text-[var(--wiring-text-primary)] truncate">{epic.title}</span>
                            <span className="ml-auto text-[10px] text-[var(--wiring-text-tertiary)] shrink-0">{epicProgress}%</span>
                          </div>
                          <div className="flex items-center px-2" style={{ width: WEEK_WIDTH * WEEKS_VISIBLE }}>
                            <div className="relative w-full h-2 rounded-full bg-[var(--wiring-glass-border)] overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all"
                                style={{ width: `${epicProgress}%`, backgroundColor: epicColor }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Ticket rows */}
                        {tickets.map((ticket) => {
                          const barWidth = getProgressWidth(ticket.status);
                          const statusColor = STATUS_COLORS[ticket.status] || "var(--wiring-text-tertiary)";
                          return (
                            <div key={ticket.id} className="flex items-center border-b border-[var(--wiring-glass-border)] hover:bg-[var(--wiring-glass-hover)] transition-colors">
                              <div className="w-56 shrink-0 pl-12 pr-3 py-1.5 flex items-center gap-1.5 border-r border-[var(--wiring-glass-border)]">
                                <span className="w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: statusColor }} />
                                <span className="text-xs text-[var(--wiring-text-secondary)] truncate">{ticket.title}</span>
                                {ticket.hitlRequired && (
                                  <AlertTriangle className="w-2.5 h-2.5 shrink-0 text-[var(--hitl-waiting)]" />
                                )}
                              </div>
                              <div className="flex items-center px-2" style={{ width: WEEK_WIDTH * WEEKS_VISIBLE }}>
                                <div
                                  className="h-4 rounded-sm flex items-center px-1.5 min-w-[16px] transition-all"
                                  style={{
                                    width: `${barWidth}%`,
                                    backgroundColor: `${statusColor}30`,
                                    border: `1px solid ${statusColor}60`,
                                  }}
                                >
                                  {ticket.assignedAgent && (
                                    <span className="text-[8px] truncate" style={{ color: statusColor }}>
                                      {ticket.assignedAgent}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 text-[10px] text-[var(--wiring-text-tertiary)]">
            {[
              { status: "backlog", label: "Backlog" },
              { status: "todo", label: "To Do" },
              { status: "in_progress", label: "진행 중" },
              { status: "review", label: "검토" },
              { status: "done", label: "완료" },
            ].map(({ status, label }) => (
              <span key={status} className="flex items-center gap-1.5">
                <span className="w-3 h-2 rounded-sm inline-block" style={{ backgroundColor: `${STATUS_COLORS[status]}40`, border: `1px solid ${STATUS_COLORS[status]}80` }} />
                {label}
              </span>
            ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
