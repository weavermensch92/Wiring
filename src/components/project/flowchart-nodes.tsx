"use client";

import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";
import { Badge } from "@/components/ui/badge";
import {
  Bot, User, AlertTriangle, CheckCircle, Clock, XCircle,
  ChevronDown, ChevronRight, CheckSquare, Square, RefreshCw, Zap,
} from "lucide-react";

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
  subtaskCount?: number;
  completedSubtaskCount?: number;
  expanded?: boolean;
  onToggleExpand?: (ticketId: string) => void;
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
  const hasSubtasks = (data.subtaskCount ?? 0) > 0;

  return (
    <>
      <Handle type="target" position={Position.Left} className="!bg-[var(--wiring-text-tertiary)] !w-2 !h-2 !border-[var(--wiring-bg-primary)]" />

      <div
        className={`w-56 rounded-xl border bg-[var(--wiring-bg-secondary)] transition-shadow ${
          selected ? "border-[var(--wiring-accent)] shadow-lg shadow-[var(--wiring-accent-glow)]" : "border-[var(--wiring-glass-border)]"
        }`}
      >
        {/* Status bar */}
        <div className="h-1 rounded-t-xl" style={{ backgroundColor: statusColor }} />

        <div className="p-3 space-y-2">
          {/* Title + expand toggle */}
          <div className="flex items-start gap-1">
            <p className="text-xs font-medium text-[var(--wiring-text-primary)] leading-tight flex-1 truncate">
              {data.label}
            </p>
            {hasSubtasks && (
              <button
                className="shrink-0 p-0.5 rounded hover:bg-[var(--wiring-glass-hover)] text-[var(--wiring-text-tertiary)] hover:text-[var(--wiring-text-secondary)] transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  data.onToggleExpand?.(data.ticketId);
                }}
              >
                {data.expanded
                  ? <ChevronDown className="w-3 h-3" />
                  : <ChevronRight className="w-3 h-3" />}
              </button>
            )}
          </div>

          {/* Badges */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <Badge
              variant="secondary"
              className="text-[9px] px-1 py-0 h-4"
              style={{ color: statusColor }}
            >
              {STATUS_LABELS[data.status] || data.status}
            </Badge>
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: priorityColor }} />
            {data.hitlRequired && (
              <span className="flex items-center gap-0.5 text-[9px] text-[var(--hitl-waiting)]">
                <AlertTriangle className="w-2.5 h-2.5" />
              </span>
            )}
            {hasSubtasks && (
              <span className="text-[9px] text-[var(--wiring-text-tertiary)]">
                {data.completedSubtaskCount}/{data.subtaskCount}
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

      <Handle type="source" position={Position.Right} className="!bg-[var(--wiring-text-tertiary)] !w-2 !h-2 !border-[var(--wiring-bg-primary)]" />
    </>
  );
});

// ─── Subtask Node ───

export interface SubtaskNodeData {
  label: string;
  subtaskId: string;
  ticketId: string;
  completed: boolean;
  [key: string]: unknown;
}

export const SubtaskNode = memo(function SubtaskNode({
  data,
  selected,
}: NodeProps & { data: SubtaskNodeData }) {
  return (
    <>
      <Handle type="target" position={Position.Left} className="!bg-[var(--wiring-text-tertiary)] !w-1.5 !h-1.5 !border-[var(--wiring-bg-primary)]" />

      <div
        className={`w-44 rounded-lg border bg-[var(--wiring-bg-secondary)] transition-shadow ${
          selected ? "border-[var(--wiring-accent)]" : "border-[var(--wiring-glass-border)]"
        }`}
      >
        <div className="px-2.5 py-2 flex items-center gap-2">
          {data.completed
            ? <CheckSquare className="w-3 h-3 shrink-0 text-[var(--wiring-success)]" />
            : <Square className="w-3 h-3 shrink-0 text-[var(--wiring-text-tertiary)]" />}
          <p
            className={`text-[10px] leading-tight flex-1 truncate ${
              data.completed
                ? "line-through text-[var(--wiring-text-tertiary)]"
                : "text-[var(--wiring-text-secondary)]"
            }`}
          >
            {data.label}
          </p>
        </div>
      </div>

      <Handle type="source" position={Position.Right} className="!bg-[var(--wiring-text-tertiary)] !w-1.5 !h-1.5 !border-[var(--wiring-bg-primary)]" />
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
  spec_decision: "스펙 결정",
  cost_approval: "비용 승인",
  assignment: "담당자 배정",
  model_allocation: "모델 배분",
};

export const HITLNode = memo(function HITLNode({
  data,
  selected,
}: NodeProps & { data: HITLNodeData }) {
  const config = HITL_STATUS_CONFIG[data.status] || HITL_STATUS_CONFIG.waiting;
  const Icon = config.icon;

  return (
    <>
      <Handle type="target" position={Position.Left} className="!bg-[var(--hitl-waiting)] !w-2 !h-2 !border-[var(--wiring-bg-primary)]" />

      <div
        className={`w-48 rounded-xl border-2 border-dashed bg-[var(--wiring-bg-secondary)] transition-shadow`}
        style={{ borderColor: selected ? config.color : "var(--wiring-glass-border)" }}
      >
        <div className="p-3 space-y-2">
          <div className="flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" style={{ color: config.color }} />
            <span className="text-[10px] font-semibold uppercase" style={{ color: config.color }}>
              HITL
            </span>
          </div>
          <p className="text-xs text-[var(--wiring-text-primary)]">
            {HITL_TYPE_LABELS[data.hitlType] || data.hitlType}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Icon className="w-3 h-3" style={{ color: config.color }} />
              <span className="text-[9px]" style={{ color: config.color }}>{config.label}</span>
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

      <Handle type="source" position={Position.Right} className="!bg-[var(--hitl-waiting)] !w-2 !h-2 !border-[var(--wiring-bg-primary)]" />
    </>
  );
});

// ─── Epic Node ───

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
      <Handle type="target" position={Position.Left} className="!bg-[var(--wiring-accent)] !w-2 !h-2 !border-[var(--wiring-bg-primary)]" />

      <div
        className={`w-60 rounded-xl border bg-[var(--wiring-bg-secondary)] transition-shadow ${
          selected ? "border-[var(--wiring-accent)] shadow-lg" : "border-[var(--wiring-accent)]/30"
        }`}
      >
        <div className="px-3 py-2.5 space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded bg-[var(--wiring-accent)]" />
            <p className="text-xs font-semibold text-[var(--wiring-text-primary)] truncate">{data.label}</p>
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

      <Handle type="source" position={Position.Right} className="!bg-[var(--wiring-accent)] !w-2 !h-2 !border-[var(--wiring-bg-primary)]" />
    </>
  );
});

// ─── Routine Node ───

export interface RoutineNodeData {
  label: string;
  routineId: string;
  triggerType: "schedule" | "event";
  automationLevel: "notify_only" | "result_check" | "approval_required";
  status: "active" | "paused";
  agents: string[];
  isGlobal: boolean;
  trigger: string;
  [key: string]: unknown;
}

const AUTOMATION_COLORS: Record<string, string> = {
  notify_only: "var(--wiring-success)",
  result_check: "var(--wiring-warning)",
  approval_required: "var(--hitl-waiting)",
};

const AUTOMATION_LABELS: Record<string, string> = {
  notify_only: "자동",
  result_check: "확인 필요",
  approval_required: "HITL 필수",
};

export const RoutineNode = memo(function RoutineNode({
  data,
  selected,
}: NodeProps & { data: RoutineNodeData }) {
  const autoColor = AUTOMATION_COLORS[data.automationLevel] || "var(--wiring-text-tertiary)";
  const autoLabel = AUTOMATION_LABELS[data.automationLevel] || data.automationLevel;
  const isPaused = data.status === "paused";

  return (
    <>
      <Handle type="target" position={Position.Left} className="!bg-[var(--wiring-success)] !w-2 !h-2 !border-[var(--wiring-bg-primary)]" />

      <div
        className={`w-52 rounded-xl border bg-[var(--wiring-bg-secondary)] transition-shadow ${
          selected ? "border-[var(--wiring-success)] shadow-lg" : "border-[var(--wiring-success)]/40"
        } ${isPaused ? "opacity-50" : ""}`}
      >
        {/* Top accent */}
        <div className="h-0.5 rounded-t-xl" style={{ backgroundColor: autoColor }} />
        <div className="p-3 space-y-2">
          {/* Header */}
          <div className="flex items-center gap-1.5">
            <RefreshCw className="w-3 h-3 text-[var(--wiring-success)]" />
            <span className="text-[10px] font-semibold text-[var(--wiring-success)] uppercase">
              {data.isGlobal ? "상시 루틴" : "에픽 루틴"}
            </span>
            {isPaused && (
              <span className="text-[9px] text-[var(--wiring-text-tertiary)] ml-auto">일시정지</span>
            )}
          </div>

          {/* Title */}
          <p className="text-xs font-medium text-[var(--wiring-text-primary)] truncate">{data.label}</p>

          {/* Trigger */}
          <div className="flex items-center gap-1">
            {data.triggerType === "schedule"
              ? <Clock className="w-2.5 h-2.5 text-[var(--wiring-text-tertiary)]" />
              : <Zap className="w-2.5 h-2.5 text-[var(--wiring-text-tertiary)]" />}
            <span className="text-[9px] text-[var(--wiring-text-tertiary)] truncate">{data.trigger}</span>
          </div>

          {/* Automation level + agents */}
          <div className="flex items-center justify-between">
            <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ backgroundColor: `${autoColor}20`, color: autoColor }}>
              {autoLabel}
            </span>
            <span className="text-[9px] text-[var(--wiring-text-tertiary)]">
              {data.agents.join(", ")}
            </span>
          </div>
        </div>
      </div>

      <Handle type="source" position={Position.Right} className="!bg-[var(--wiring-success)] !w-2 !h-2 !border-[var(--wiring-bg-primary)]" />
    </>
  );
});
