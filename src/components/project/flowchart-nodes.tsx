"use client";

import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";
import { Badge } from "@/components/ui/badge";
import { Bot, User, AlertTriangle, CheckCircle, Clock, XCircle } from "lucide-react";

// ─── Ticket Node ───

export interface TicketNodeData {
  label: string;
  ticketId: string;
  status: string;
  priority: string;
  assignedAgent: string | null;
  assignedHuman: { name: string; level: string } | null;
  hitlRequired?: boolean;
  hitlType?: string;
  estimatedHours: number;
  [key: string]: unknown;
}

const STATUS_COLORS: Record<string, string> = {
  backlog: "var(--wiring-text-tertiary)",
  todo: "var(--wiring-info)",
  in_progress: "var(--wiring-accent)",
  review: "var(--wiring-warning)",
  done: "var(--wiring-success)",
};

const STATUS_LABELS: Record<string, string> = {
  backlog: "Backlog",
  todo: "To Do",
  in_progress: "진행 중",
  review: "검토",
  done: "완료",
};

const PRIORITY_COLORS: Record<string, string> = {
  critical: "var(--wiring-danger)",
  high: "var(--wiring-warning)",
  medium: "var(--wiring-info)",
  low: "var(--wiring-text-tertiary)",
};

export const TicketNode = memo(function TicketNode({
  data,
  selected,
}: NodeProps & { data: TicketNodeData }) {
  const statusColor = STATUS_COLORS[data.status] || "var(--wiring-text-tertiary)";
  const priorityColor = PRIORITY_COLORS[data.priority] || "var(--wiring-text-tertiary)";

  return (
    <>
      <Handle type="target" position={Position.Top} className="!bg-[var(--wiring-text-tertiary)] !w-2 !h-2 !border-[var(--wiring-bg-primary)]" />

      <div
        className={`w-56 rounded-xl border bg-[var(--wiring-bg-secondary)] transition-shadow ${
          selected ? "border-[var(--wiring-accent)] shadow-lg shadow-[var(--wiring-accent-glow)]" : "border-[var(--wiring-glass-border)]"
        }`}
      >
        {/* Status bar */}
        <div className="h-1 rounded-t-xl" style={{ backgroundColor: statusColor }} />

        <div className="p-3 space-y-2">
          {/* Title */}
          <p className="text-xs font-medium text-[var(--wiring-text-primary)] leading-tight truncate">
            {data.label}
          </p>

          {/* Badges */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <Badge
              variant="secondary"
              className="text-[9px] px-1 py-0 h-4"
              style={{ color: statusColor }}
            >
              {STATUS_LABELS[data.status] || data.status}
            </Badge>
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: priorityColor }}
            />
            {data.hitlRequired && (
              <span className="flex items-center gap-0.5 text-[9px] text-[var(--hitl-waiting)]">
                <AlertTriangle className="w-2.5 h-2.5" />
              </span>
            )}
          </div>

          {/* Assignment */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              {data.assignedAgent && (
                <span className="flex items-center gap-0.5 text-[9px] text-[var(--wiring-accent)]">
                  <Bot className="w-2.5 h-2.5" />
                  {data.assignedAgent}
                </span>
              )}
              {data.assignedHuman && (
                <span className="flex items-center gap-0.5 text-[9px] text-[var(--wiring-text-secondary)]">
                  <User className="w-2.5 h-2.5" />
                  {data.assignedHuman.name}
                </span>
              )}
            </div>
            <span className="text-[9px] text-[var(--wiring-text-tertiary)]">
              {data.estimatedHours}h
            </span>
          </div>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-[var(--wiring-text-tertiary)] !w-2 !h-2 !border-[var(--wiring-bg-primary)]" />
    </>
  );
});

// ─── HITL Node ───

export interface HITLNodeData {
  label: string;
  ticketId: string;
  hitlType: string;
  status: "waiting" | "in_progress" | "approved" | "rejected";
  assignee?: string;
  [key: string]: unknown;
}

const HITL_STATUS_CONFIG: Record<string, { icon: typeof Clock; color: string; label: string }> = {
  waiting: { icon: Clock, color: "var(--hitl-waiting)", label: "대기" },
  in_progress: { icon: Clock, color: "var(--wiring-info)", label: "진행 중" },
  approved: { icon: CheckCircle, color: "var(--wiring-success)", label: "승인" },
  rejected: { icon: XCircle, color: "var(--wiring-danger)", label: "반려" },
};

const HITL_TYPE_LABELS: Record<string, string> = {
  code_review: "코드 리뷰",
  security_approval: "보안 검토",
  design_review: "디자인 리뷰",
  qa_review: "QA 검증",
};

export const HITLNode = memo(function HITLNode({
  data,
  selected,
}: NodeProps & { data: HITLNodeData }) {
  const config = HITL_STATUS_CONFIG[data.status] || HITL_STATUS_CONFIG.waiting;
  const Icon = config.icon;

  return (
    <>
      <Handle type="target" position={Position.Top} className="!bg-[var(--hitl-waiting)] !w-2 !h-2 !border-[var(--wiring-bg-primary)]" />

      <div
        className={`w-48 rounded-xl border-2 border-dashed bg-[var(--wiring-bg-secondary)] transition-shadow ${
          selected
            ? "border-[var(--hitl-waiting)] shadow-lg"
            : "border-[var(--wiring-glass-border)]"
        }`}
        style={{ borderColor: selected ? config.color : undefined }}
      >
        <div className="p-3 space-y-2">
          {/* Header */}
          <div className="flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" style={{ color: config.color }} />
            <span className="text-[10px] font-semibold uppercase" style={{ color: config.color }}>
              HITL
            </span>
          </div>

          {/* Type */}
          <p className="text-xs text-[var(--wiring-text-primary)]">
            {HITL_TYPE_LABELS[data.hitlType] || data.hitlType}
          </p>

          {/* Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Icon className="w-3 h-3" style={{ color: config.color }} />
              <span className="text-[9px]" style={{ color: config.color }}>
                {config.label}
              </span>
            </div>
            {data.assignee && (
              <span className="text-[9px] text-[var(--wiring-text-secondary)]">
                <User className="w-2.5 h-2.5 inline mr-0.5" />
                {data.assignee}
              </span>
            )}
          </div>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-[var(--hitl-waiting)] !w-2 !h-2 !border-[var(--wiring-bg-primary)]" />
    </>
  );
});

// ─── Epic Node (group header) ───

export interface EpicNodeData {
  label: string;
  epicId: string;
  status: string;
  ticketCount: number;
  completedTickets: number;
  [key: string]: unknown;
}

export const EpicNode = memo(function EpicNode({
  data,
  selected,
}: NodeProps & { data: EpicNodeData }) {
  const progress = data.ticketCount > 0 ? Math.round((data.completedTickets / data.ticketCount) * 100) : 0;

  return (
    <>
      <div
        className={`w-60 rounded-xl border bg-[var(--wiring-bg-secondary)] transition-shadow ${
          selected ? "border-[var(--wiring-accent)] shadow-lg" : "border-[var(--wiring-accent)]/30"
        }`}
      >
        <div className="px-3 py-2.5 space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded bg-[var(--wiring-accent)]" />
            <p className="text-xs font-semibold text-[var(--wiring-text-primary)] truncate">
              {data.label}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1 rounded-full bg-[var(--wiring-glass-border)] overflow-hidden">
              <div
                className="h-full rounded-full bg-[var(--wiring-accent)] transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-[9px] text-[var(--wiring-text-tertiary)]">
              {data.completedTickets}/{data.ticketCount}
            </span>
          </div>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-[var(--wiring-accent)] !w-2 !h-2 !border-[var(--wiring-bg-primary)]" />
    </>
  );
});
