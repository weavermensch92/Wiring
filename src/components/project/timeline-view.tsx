"use client";

import { useMemo } from "react";
import { useProjectStore } from "@/stores/project-store";
import { Epic, Ticket, TicketStatus } from "@/types/project";
import { Badge } from "@/components/ui/badge";
import { Bot, AlertTriangle } from "lucide-react";

const STATUS_COLORS: Record<TicketStatus, string> = {
  backlog: "var(--wiring-text-tertiary)",
  todo: "var(--wiring-info)",
  in_progress: "var(--wiring-accent)",
  review: "var(--wiring-warning)",
  done: "var(--wiring-success)",
};

const STATUS_LABELS: Record<TicketStatus, string> = {
  backlog: "Backlog",
  todo: "To Do",
  in_progress: "진행 중",
  review: "검토",
  done: "완료",
};

// Generate week labels for the timeline header
function generateWeeks(count: number): { label: string; start: Date }[] {
  const weeks: { label: string; start: Date }[] = [];
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay() + 1); // Monday

  for (let i = -2; i < count; i++) {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i * 7);
    weeks.push({
      label: `${d.getMonth() + 1}/${d.getDate()}`,
      start: d,
    });
  }
  return weeks;
}

// Map ticket status to a progress percentage within the timeline
function getProgressWidth(status: TicketStatus): number {
  switch (status) {
    case "done": return 100;
    case "review": return 85;
    case "in_progress": return 50;
    case "todo": return 15;
    case "backlog": return 5;
  }
}

export function TimelineView({ projectId }: { projectId: string }) {
  const { epics: allEpics, tickets: allTickets } = useProjectStore();
  const projectEpics = allEpics[projectId] || [];
  const weeks = useMemo(() => generateWeeks(10), []);

  if (projectEpics.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-[var(--wiring-text-tertiary)]">
        <p className="text-sm">에픽이 없습니다</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto">
      <div className="min-w-[900px]">
        {/* Header - Week columns */}
        <div className="flex border-b border-[var(--wiring-glass-border)] sticky top-0 bg-[var(--wiring-bg-primary)] z-10">
          <div className="w-56 shrink-0 px-4 py-2 text-xs font-semibold text-[var(--wiring-text-primary)] border-r border-[var(--wiring-glass-border)]">
            에픽 / 티켓
          </div>
          <div className="flex-1 flex">
            {weeks.map((w, i) => (
              <div
                key={i}
                className="flex-1 px-2 py-2 text-[10px] text-[var(--wiring-text-tertiary)] text-center border-r border-[var(--wiring-glass-border)] last:border-r-0"
              >
                {w.label}
              </div>
            ))}
          </div>
        </div>

        {/* Body - Epic rows */}
        {projectEpics.map((epic) => {
          const tickets = allTickets[epic.id] || [];
          return (
            <EpicRow key={epic.id} epic={epic} tickets={tickets} weekCount={weeks.length} />
          );
        })}
      </div>
    </div>
  );
}

function EpicRow({ epic, tickets, weekCount }: { epic: Epic; tickets: Ticket[]; weekCount: number }) {
  const progress = epic.ticketCount > 0 ? Math.round((epic.completedTickets / epic.ticketCount) * 100) : 0;

  return (
    <div>
      {/* Epic header row */}
      <div className="flex border-b border-[var(--wiring-glass-border)] bg-[var(--wiring-bg-secondary)]">
        <div className="w-56 shrink-0 px-4 py-2 border-r border-[var(--wiring-glass-border)]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded bg-[var(--wiring-accent)]" />
            <span className="text-xs font-semibold text-[var(--wiring-text-primary)] truncate">
              {epic.title}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-16 h-1 rounded-full bg-[var(--wiring-glass-border)] overflow-hidden">
              <div
                className="h-full rounded-full bg-[var(--wiring-accent)]"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-[9px] text-[var(--wiring-text-tertiary)]">
              {epic.completedTickets}/{epic.ticketCount}
            </span>
          </div>
        </div>
        <div className="flex-1 relative">
          {/* Epic-level progress bar spanning columns */}
          <div className="absolute inset-y-0 left-0 flex items-center px-2" style={{ width: `${progress}%` }}>
            <div className="w-full h-2 rounded-full bg-[var(--wiring-accent)]/20">
              <div className="h-full rounded-full bg-[var(--wiring-accent)]" style={{ width: "100%" }} />
            </div>
          </div>
        </div>
      </div>

      {/* Ticket rows */}
      {tickets.map((ticket) => (
        <TicketRow key={ticket.id} ticket={ticket} weekCount={weekCount} />
      ))}
    </div>
  );
}

function TicketRow({ ticket, weekCount }: { ticket: Ticket; weekCount: number }) {
  const statusColor = STATUS_COLORS[ticket.status];
  const progressWidth = getProgressWidth(ticket.status);

  return (
    <div className="flex border-b border-[var(--wiring-glass-border)] hover:bg-[var(--wiring-glass-hover)] transition-colors">
      {/* Label */}
      <div className="w-56 shrink-0 px-4 py-2 border-r border-[var(--wiring-glass-border)]">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: statusColor }} />
          <span className="text-xs text-[var(--wiring-text-primary)] truncate">{ticket.title}</span>
        </div>
        <div className="flex items-center gap-1.5 mt-1 pl-3.5">
          {ticket.assignedAgent && (
            <span className="flex items-center gap-0.5 text-[9px] text-[var(--wiring-accent)]">
              <Bot className="w-2.5 h-2.5" />
              {ticket.assignedAgent}
            </span>
          )}
          {ticket.hitlRequired && (
            <span className="text-[9px] text-[var(--hitl-waiting)]">
              <AlertTriangle className="w-2.5 h-2.5 inline" />
            </span>
          )}
          <Badge variant="secondary" className="text-[8px] px-1 py-0 h-3" style={{ color: statusColor }}>
            {STATUS_LABELS[ticket.status]}
          </Badge>
        </div>
      </div>

      {/* Gantt bar */}
      <div className="flex-1 relative flex items-center px-2">
        {/* Background grid */}
        <div className="absolute inset-0 flex">
          {Array.from({ length: weekCount }).map((_, i) => (
            <div key={i} className="flex-1 border-r border-[var(--wiring-glass-border)]/30 last:border-r-0" />
          ))}
        </div>

        {/* Progress bar */}
        <div className="relative w-full">
          <div className="h-5 rounded" style={{
            width: `${progressWidth}%`,
            backgroundColor: statusColor + "30",
          }}>
            <div
              className="h-full rounded"
              style={{
                width: ticket.status === "done" ? "100%" : "70%",
                backgroundColor: statusColor,
                opacity: 0.7,
              }}
            />
          </div>
          <span className="absolute right-1 top-0.5 text-[9px] text-[var(--wiring-text-tertiary)]">
            {ticket.estimatedHours}h
          </span>
        </div>
      </div>
    </div>
  );
}
