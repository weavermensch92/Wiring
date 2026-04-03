"use client";

import { useSortable } from "@dnd-kit/sortable";
import { Ticket } from "@/types/project";
import { Badge } from "@/components/ui/badge";
import { GripVertical, AlertTriangle, User, Bot } from "lucide-react";

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  critical: { label: "긴급", color: "var(--wiring-danger)" },
  high: { label: "높음", color: "var(--wiring-warning)" },
  medium: { label: "중간", color: "var(--wiring-info)" },
  low: { label: "낮음", color: "var(--wiring-text-tertiary)" },
};

export function KanbanCard({
  ticket,
  onClick,
}: {
  ticket: Ticket;
  onClick: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: ticket.id, data: { type: "ticket", ticket } });

  const style: React.CSSProperties = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const priority = PRIORITY_CONFIG[ticket.priority];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="glass-panel p-3 cursor-pointer hover:bg-[var(--wiring-glass-hover)] transition-colors group"
      onClick={onClick}
    >
      <div className="flex items-start gap-2">
        <button
          {...attributes}
          {...listeners}
          className="mt-0.5 p-0.5 rounded text-[var(--wiring-text-tertiary)] opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="w-3 h-3" />
        </button>

        <div className="flex-1 min-w-0">
          <p className="text-sm text-[var(--wiring-text-primary)] truncate">
            {ticket.title}
          </p>

          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <Badge
              variant="secondary"
              className="text-[10px] px-1.5 py-0"
              style={{ color: priority.color, borderColor: priority.color + "40" }}
            >
              {priority.label}
            </Badge>

            {ticket.hitlRequired && (
              <span className="flex items-center gap-0.5 text-[10px] text-[var(--hitl-waiting)]">
                <AlertTriangle className="w-3 h-3" />
                HITL
              </span>
            )}
          </div>

          <div className="flex items-center justify-between mt-2">
            <span className="text-[10px] text-[var(--wiring-text-tertiary)]">
              {ticket.id}
            </span>
            <div className="flex items-center gap-1">
              {ticket.assignedAgent && (
                <span className="flex items-center gap-0.5 text-[10px] text-[var(--wiring-accent)]">
                  <Bot className="w-3 h-3" />
                  {ticket.assignedAgent}
                </span>
              )}
              {ticket.assignedHuman && (
                <span className="flex items-center gap-0.5 text-[10px] text-[var(--wiring-text-secondary)]">
                  <User className="w-3 h-3" />
                  {ticket.assignedHuman.name}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function KanbanCardOverlay({ ticket }: { ticket: Ticket }) {
  const priority = PRIORITY_CONFIG[ticket.priority];
  return (
    <div className="glass-panel p-3 w-64 shadow-xl rotate-2 border-[var(--wiring-accent)] border">
      <p className="text-sm text-[var(--wiring-text-primary)] truncate">{ticket.title}</p>
      <div className="flex items-center gap-2 mt-1.5">
        <Badge
          variant="secondary"
          className="text-[10px] px-1.5 py-0"
          style={{ color: priority.color }}
        >
          {priority.label}
        </Badge>
      </div>
    </div>
  );
}
