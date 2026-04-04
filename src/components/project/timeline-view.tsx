"use client";

import { useMemo } from "react";
import { useProjectStore } from "@/stores/project-store";
import { Epic, Ticket, TicketStatus } from "@/types/project";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AGENT_COLORS } from "@/lib/constants";
import { Bot, AlertTriangle, Diamond, ArrowRight } from "lucide-react";

const STATUS_COLORS: Record<TicketStatus, string> = {
  backlog: "var(--wiring-text-tertiary)",
  todo: "var(--wiring-info)",
  in_progress: "var(--wiring-accent)",
  review: "var(--wiring-warning)",
  done: "var(--wiring-success)",
};

const STATUS_LABELS: Record<TicketStatus, string> = {
  backlog: "백로그", todo: "할 일", in_progress: "진행 중", review: "검토", done: "완료",
};

const WEEK_WIDTH = 80;
const WEEKS_COUNT = 12;

function generateWeeks(count: number): { label: string; start: Date }[] {
  const weeks: { label: string; start: Date }[] = [];
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay() + 1);
  for (let i = -3; i < count; i++) {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i * 7);
    weeks.push({ label: `${d.getMonth() + 1}/${d.getDate()}`, start: d });
  }
  return weeks;
}

function getProgressWidth(status: TicketStatus): number {
  switch (status) {
    case "done": return 100;
    case "review": return 85;
    case "in_progress": return 50;
    case "todo": return 15;
    case "backlog": return 5;
  }
}

// 오늘 위치 계산 (주 단위에서 %)
function getTodayPosition(weeks: { start: Date }[]): number {
  const now = new Date();
  for (let i = 0; i < weeks.length - 1; i++) {
    const start = weeks[i].start.getTime();
    const end = weeks[i + 1].start.getTime();
    if (now.getTime() >= start && now.getTime() < end) {
      const ratio = (now.getTime() - start) / (end - start);
      return ((i + ratio) / weeks.length) * 100;
    }
  }
  return -1;
}

export function TimelineView({ projectId }: { projectId: string }) {
  const { epics: allEpics, tickets: allTickets } = useProjectStore();
  const projectEpics = allEpics[projectId] || [];
  const weeks = useMemo(() => generateWeeks(WEEKS_COUNT), []);
  const todayPct = useMemo(() => getTodayPosition(weeks), [weeks]);

  if (projectEpics.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-[var(--wiring-text-tertiary)]">
        <p className="text-sm">에픽이 없습니다</p>
      </div>
    );
  }

  // 의존성 데이터 수집
  const allTicketsList = projectEpics.flatMap((e) => allTickets[e.id] ?? []);
  const dependencies = allTicketsList
    .filter((t) => t.dependsOn?.length)
    .flatMap((t) => (t.dependsOn ?? []).map((dep) => ({ from: dep, to: t.id })));

  return (
    <div className="h-full overflow-auto">
      <div style={{ minWidth: `${WEEK_WIDTH * weeks.length + 224}px` }}>
        {/* Header */}
        <div className="flex border-b border-[var(--wiring-glass-border)] sticky top-0 bg-[var(--wiring-bg-primary)] z-10">
          <div className="w-56 shrink-0 px-4 py-2 text-xs font-semibold text-[var(--wiring-text-primary)] border-r border-[var(--wiring-glass-border)]">
            에픽 / 티켓
          </div>
          <div className="flex-1 flex relative">
            {weeks.map((w, i) => (
              <div
                key={i}
                className="px-2 py-2 text-[10px] text-[var(--wiring-text-tertiary)] text-center border-r border-[var(--wiring-glass-border)] last:border-r-0"
                style={{ width: WEEK_WIDTH }}
              >
                {w.label}
              </div>
            ))}
            {/* 오늘 표시선 (헤더) */}
            {todayPct >= 0 && (
              <div
                className="absolute top-0 bottom-0 w-px bg-[var(--wiring-danger)] z-20"
                style={{ left: `${todayPct}%` }}
              >
                <span className="absolute -top-0 -translate-x-1/2 px-1 py-0.5 rounded text-[8px] font-bold text-white bg-[var(--wiring-danger)]">
                  오늘
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="relative">
          {/* 오늘 표시선 (바디 전체) */}
          {todayPct >= 0 && (
            <div
              className="absolute top-0 bottom-0 w-px bg-[var(--wiring-danger)]/40 z-10 pointer-events-none"
              style={{ left: `calc(224px + ${todayPct}%)` }}
            />
          )}

          {projectEpics.map((epic) => {
            const tickets = allTickets[epic.id] || [];
            return <EpicRow key={epic.id} epic={epic} tickets={tickets} weekCount={weeks.length} dependencies={dependencies} />;
          })}
        </div>
      </div>
    </div>
  );
}

function EpicRow({ epic, tickets, weekCount, dependencies }: { epic: Epic; tickets: Ticket[]; weekCount: number; dependencies: { from: string; to: string }[] }) {
  const progress = epic.ticketCount > 0 ? Math.round((epic.completedTickets / epic.ticketCount) * 100) : 0;
  const allDone = tickets.length > 0 && tickets.every((t) => t.status === "done");

  return (
    <div>
      {/* Epic header */}
      <div className="flex border-b border-[var(--wiring-glass-border)] bg-[var(--wiring-bg-secondary)]">
        <div className="w-56 shrink-0 px-4 py-2.5 border-r border-[var(--wiring-glass-border)]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded bg-[var(--wiring-accent)]" />
            <span className="text-xs font-semibold text-[var(--wiring-text-primary)] truncate">{epic.title}</span>
          </div>
          <div className="flex items-center gap-2 mt-1.5">
            <div className="w-16 h-1.5 rounded-full bg-[var(--wiring-glass-border)]">
              <div className="h-full rounded-full bg-[var(--wiring-accent)]" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-[9px] text-[var(--wiring-text-tertiary)]">{epic.completedTickets}/{epic.ticketCount}</span>
          </div>
        </div>
        <div className="flex-1 relative flex items-center px-2">
          <div style={{ width: `${progress}%` }} className="h-3 rounded-full bg-[var(--wiring-accent)]/15">
            <div className="h-full rounded-full bg-[var(--wiring-accent)]" style={{ width: "100%" }} />
          </div>
          {/* 마일스톤 마커 — 에픽 완료 시 */}
          {allDone && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[var(--wiring-success)]">
              <Diamond className="w-3.5 h-3.5" />
              <span className="text-[9px] font-medium">완료</span>
            </div>
          )}
        </div>
      </div>

      {/* Ticket rows */}
      {tickets.map((ticket) => {
        const hasDependency = dependencies.some((d) => d.to === ticket.id);
        return <TicketRow key={ticket.id} ticket={ticket} weekCount={weekCount} hasDependency={hasDependency} />;
      })}
    </div>
  );
}

function TicketRow({ ticket, weekCount, hasDependency }: { ticket: Ticket; weekCount: number; hasDependency: boolean }) {
  const statusColor = STATUS_COLORS[ticket.status];
  const progressWidth = getProgressWidth(ticket.status);

  return (
    <div className="flex border-b border-[var(--wiring-glass-border)] hover:bg-[var(--wiring-glass-hover)] transition-colors">
      <div className="w-56 shrink-0 px-4 py-2 border-r border-[var(--wiring-glass-border)]">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: statusColor }} />
          <span className="text-xs text-[var(--wiring-text-primary)] truncate flex-1">{ticket.title}</span>
          {hasDependency && (
            <span title="의존성 있음"><ArrowRight className="w-3 h-3 text-[var(--wiring-warning)] shrink-0" /></span>
          )}
        </div>
        <div className="flex items-center gap-1.5 mt-1 pl-3.5">
          {ticket.assignedAgent && (
            <Avatar className="w-3.5 h-3.5">
              <AvatarFallback className="text-[7px] font-bold text-white" style={{ backgroundColor: AGENT_COLORS[ticket.assignedAgent as keyof typeof AGENT_COLORS] ?? "#888" }}>
                {ticket.assignedAgent.slice(0, 2)}
              </AvatarFallback>
            </Avatar>
          )}
          {ticket.hitlRequired && <AlertTriangle className="w-2.5 h-2.5 text-[var(--hitl-waiting)]" />}
          <span className="text-[8px] px-1 py-0 rounded" style={{ color: statusColor, backgroundColor: `${statusColor}18` }}>
            {STATUS_LABELS[ticket.status]}
          </span>
          {ticket.dependsOn?.length ? (
            <span className="text-[8px] text-[var(--wiring-warning)]">← dep</span>
          ) : null}
        </div>
      </div>

      <div className="flex-1 relative flex items-center px-2">
        {/* Background grid */}
        <div className="absolute inset-0 flex">
          {Array.from({ length: weekCount }).map((_, i) => (
            <div key={i} className="border-r border-[var(--wiring-glass-border)]/20" style={{ width: WEEK_WIDTH }} />
          ))}
        </div>

        {/* Progress bar */}
        <div className="relative w-full">
          <div className="h-6 rounded" style={{ width: `${progressWidth}%`, backgroundColor: `${statusColor}20` }}>
            <div className="h-full rounded" style={{ width: ticket.status === "done" ? "100%" : "70%", backgroundColor: statusColor, opacity: 0.7 }} />
          </div>
          <span className="absolute right-1 top-1 text-[9px] text-[var(--wiring-text-tertiary)]">
            {ticket.estimatedHours}h
          </span>
        </div>
      </div>
    </div>
  );
}
