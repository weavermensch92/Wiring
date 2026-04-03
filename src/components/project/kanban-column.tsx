"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Ticket, TicketStatus } from "@/types/project";
import { KanbanCard } from "./kanban-card";
import { Plus } from "lucide-react";

const COLUMN_CONFIG: Record<TicketStatus, { label: string; color: string }> = {
  backlog: { label: "Backlog", color: "var(--wiring-text-tertiary)" },
  todo: { label: "To Do", color: "var(--wiring-info)" },
  in_progress: { label: "In Progress", color: "var(--wiring-accent)" },
  review: { label: "Review", color: "var(--wiring-warning)" },
  done: { label: "Done", color: "var(--wiring-success)" },
};

export function KanbanColumn({
  status,
  tickets,
  onTicketClick,
  onAddTicket,
}: {
  status: TicketStatus;
  tickets: Ticket[];
  onTicketClick: (ticket: Ticket) => void;
  onAddTicket: (status: TicketStatus) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${status}`,
    data: { type: "column", status },
  });

  const config = COLUMN_CONFIG[status];
  const ticketIds = tickets.map((t) => t.id);

  return (
    <div
      className={`flex flex-col w-64 shrink-0 rounded-xl bg-[var(--wiring-bg-primary)] border transition-colors ${
        isOver
          ? "border-[var(--wiring-accent)] bg-[var(--wiring-accent-glow)]"
          : "border-[var(--wiring-glass-border)]"
      }`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-[var(--wiring-glass-border)]">
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: config.color }}
          />
          <span className="text-xs font-semibold text-[var(--wiring-text-primary)]">
            {config.label}
          </span>
          <span className="text-xs text-[var(--wiring-text-tertiary)]">
            {tickets.length}
          </span>
        </div>
        <button
          onClick={() => onAddTicket(status)}
          className="p-1 rounded text-[var(--wiring-text-tertiary)] hover:bg-[var(--wiring-glass-hover)] hover:text-[var(--wiring-text-secondary)] transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Cards */}
      <div ref={setNodeRef} className="flex-1 p-2 space-y-2 min-h-[80px] overflow-y-auto">
        <SortableContext items={ticketIds} strategy={verticalListSortingStrategy}>
          {tickets.map((ticket) => (
            <KanbanCard
              key={ticket.id}
              ticket={ticket}
              onClick={() => onTicketClick(ticket)}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}
