"use client";

import { Ticket } from "@/types/project";
import { useProjectStore } from "@/stores/project-store";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Bot, User, Clock, AlertTriangle } from "lucide-react";

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  critical: { label: "긴급", color: "var(--wiring-danger)" },
  high: { label: "높음", color: "var(--wiring-warning)" },
  medium: { label: "중간", color: "var(--wiring-info)" },
  low: { label: "낮음", color: "var(--wiring-text-tertiary)" },
};

const STATUS_LABELS: Record<string, string> = {
  backlog: "Backlog",
  todo: "To Do",
  in_progress: "In Progress",
  review: "Review",
  done: "Done",
};

export function TicketDetailSheet({
  ticket,
  open,
  onOpenChange,
}: {
  ticket: Ticket | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!ticket) return null;

  const priority = PRIORITY_CONFIG[ticket.priority];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[400px] sm:max-w-[400px]">
        <SheetHeader>
          <SheetTitle className="text-[var(--wiring-text-primary)]">
            {ticket.title}
          </SheetTitle>
          <SheetDescription className="text-[var(--wiring-text-tertiary)]">
            {ticket.id}
          </SheetDescription>
        </SheetHeader>

        <div className="px-4 space-y-4 overflow-y-auto flex-1">
          {/* Status & Priority */}
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {STATUS_LABELS[ticket.status]}
            </Badge>
            <Badge
              variant="secondary"
              className="text-xs"
              style={{ color: priority.color }}
            >
              {priority.label}
            </Badge>
            {ticket.hitlRequired && (
              <Badge
                variant="secondary"
                className="text-xs gap-1"
                style={{ color: "var(--hitl-waiting)" }}
              >
                <AlertTriangle className="w-3 h-3" />
                HITL: {ticket.hitlType}
              </Badge>
            )}
          </div>

          <Separator className="bg-[var(--wiring-glass-border)]" />

          {/* Description */}
          <div>
            <p className="text-xs text-[var(--wiring-text-tertiary)] mb-1">설명</p>
            <p className="text-sm text-[var(--wiring-text-secondary)]">
              {ticket.description}
            </p>
          </div>

          <Separator className="bg-[var(--wiring-glass-border)]" />

          {/* Assignment */}
          <div className="space-y-2">
            <p className="text-xs text-[var(--wiring-text-tertiary)]">담당</p>
            {ticket.assignedAgent && (
              <div className="flex items-center gap-2 text-sm">
                <Bot className="w-4 h-4 text-[var(--wiring-accent)]" />
                <span className="text-[var(--wiring-text-primary)]">
                  {ticket.assignedAgent} Agent
                </span>
              </div>
            )}
            {ticket.assignedHuman && (
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-[var(--wiring-text-secondary)]" />
                <span className="text-[var(--wiring-text-primary)]">
                  {ticket.assignedHuman.name}
                </span>
                <Badge variant="secondary" className="text-[10px]">
                  {ticket.assignedHuman.level}
                </Badge>
              </div>
            )}
            {!ticket.assignedAgent && !ticket.assignedHuman && (
              <p className="text-sm text-[var(--wiring-text-tertiary)]">미배정</p>
            )}
          </div>

          <Separator className="bg-[var(--wiring-glass-border)]" />

          {/* Time & Cost */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-[var(--wiring-text-tertiary)] mb-1">예상 시간</p>
              <div className="flex items-center gap-1 text-sm text-[var(--wiring-text-primary)]">
                <Clock className="w-3.5 h-3.5" />
                {ticket.estimatedHours}h
              </div>
            </div>
            {ticket.actualHours !== undefined && (
              <div>
                <p className="text-xs text-[var(--wiring-text-tertiary)] mb-1">실제 시간</p>
                <p className="text-sm text-[var(--wiring-text-primary)]">
                  {ticket.actualHours}h
                </p>
              </div>
            )}
            {ticket.costUsd !== undefined && (
              <div>
                <p className="text-xs text-[var(--wiring-text-tertiary)] mb-1">비용</p>
                <p className="text-sm text-[var(--wiring-success)]">
                  ${ticket.costUsd.toFixed(2)}
                </p>
              </div>
            )}
          </div>

          {/* Dependencies */}
          {ticket.dependsOn && ticket.dependsOn.length > 0 && (
            <>
              <Separator className="bg-[var(--wiring-glass-border)]" />
              <div>
                <p className="text-xs text-[var(--wiring-text-tertiary)] mb-1">의존성</p>
                <div className="flex flex-wrap gap-1">
                  {ticket.dependsOn.map((dep) => (
                    <Badge key={dep} variant="secondary" className="text-[10px]">
                      {dep}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
