"use client";

import { useMemo, useCallback, useState } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Panel,
  type Node,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useProjectStore } from "@/stores/project-store";
import { Epic, Ticket } from "@/types/project";
import { Routine } from "@/types/routine";
import { DUMMY_ROUTINES } from "@/dummy/routines";
import {
  TicketNode,
  HITLNode,
  EpicNode,
  SubtaskNode,
  RoutineNode,
  type TicketNodeData,
  type HITLNodeData,
  type EpicNodeData,
  type SubtaskNodeData,
  type RoutineNodeData,
} from "./flowchart-nodes";

const nodeTypes = {
  ticket: TicketNode,
  hitl: HITLNode,
  epic: EpicNode,
  subtask: SubtaskNode,
  routine: RoutineNode,
};

// ─── LR Layout Constants ───
const EPIC_X = 0;
const TICKET_X = 340;
const HITL_X_OFFSET = 260;   // ticket X + 260 when no subtasks
const SUBTASK_X_OFFSET = 260; // ticket X + 260 when expanded
const HITL_EXTRA_X = 260;     // subtask X + 260 when expanded
const NODE_Y_GAP = 150;       // vertical gap between nodes in a group
const EPIC_GROUP_GAP = 60;    // extra vertical gap between epic groups
const ROUTINE_X = -280;       // global routines to the left of epics

// ─── Build LR Flow Data ───
function buildFlowDataLR(
  epics: Epic[],
  allTickets: Record<string, Ticket[]>,
  allSubtasks: Record<string, { id: string; ticketId: string; title: string; completed: boolean }[]>,
  expandedTickets: Record<string, boolean>,
  routines: Routine[],
  onToggleExpand: (ticketId: string) => void
): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  const globalRoutines = routines.filter((r) => !r.epicId);
  const epicRoutinesMap = routines.reduce<Record<string, Routine[]>>((acc, r) => {
    if (r.epicId) { acc[r.epicId] = [...(acc[r.epicId] || []), r]; }
    return acc;
  }, {});

  // ── Global Routine Lane (leftmost) ──
  globalRoutines.forEach((routine, idx) => {
    const routineNodeId = `routine-global-${routine.id}`;
    const y = idx * NODE_Y_GAP;
    nodes.push({
      id: routineNodeId,
      type: "routine",
      position: { x: ROUTINE_X, y },
      data: {
        label: routine.title,
        routineId: routine.id,
        triggerType: routine.triggerType,
        automationLevel: routine.automationLevel,
        status: routine.status,
        agents: routine.agents,
        isGlobal: true,
        trigger: routine.trigger,
      } satisfies RoutineNodeData,
    });
  });

  // ── Epic Groups ──
  let currentGroupY = 0;

  for (const epic of epics) {
    const tickets = allTickets[epic.id] || [];
    const epicRoutines = epicRoutinesMap[epic.id] || [];

    // How many rows does this epic group take up?
    let groupRows = Math.max(tickets.length, 1);
    // Account for expanded tickets adding subtask rows
    for (const ticket of tickets) {
      if (expandedTickets[ticket.id]) {
        const subs = allSubtasks[ticket.id] || [];
        groupRows += Math.max(subs.length - 1, 0);
      }
    }

    const epicCenterY = currentGroupY + ((groupRows - 1) * NODE_Y_GAP) / 2;

    // Epic node
    const epicNodeId = `epic-${epic.id}`;
    nodes.push({
      id: epicNodeId,
      type: "epic",
      position: { x: EPIC_X, y: epicCenterY },
      data: {
        label: epic.title,
        epicId: epic.id,
        status: epic.status,
        ticketCount: epic.ticketCount,
        completedTickets: epic.completedTickets,
      } satisfies EpicNodeData,
    });

    // Epic routines (just to the right of epic, before tickets)
    epicRoutines.forEach((routine, ridx) => {
      const routineNodeId = `routine-epic-${routine.id}`;
      nodes.push({
        id: routineNodeId,
        type: "routine",
        position: { x: EPIC_X + 280, y: currentGroupY + ridx * NODE_Y_GAP },
        data: {
          label: routine.title,
          routineId: routine.id,
          triggerType: routine.triggerType,
          automationLevel: routine.automationLevel,
          status: routine.status,
          agents: routine.agents,
          isGlobal: false,
          trigger: routine.trigger,
        } satisfies RoutineNodeData,
      });
      // Epic → Routine edge
      edges.push({
        id: `e-${epicNodeId}-${routineNodeId}`,
        source: epicNodeId,
        target: routineNodeId,
        type: "smoothstep",
        style: { stroke: "var(--wiring-success)", strokeWidth: 1, strokeDasharray: "4 4", opacity: 0.6 },
      });
    });

    // Ticket nodes
    let ticketRowY = currentGroupY;

    for (const ticket of tickets) {
      const ticketNodeId = `ticket-${ticket.id}`;
      const subs = allSubtasks[ticket.id] || [];
      const isExpanded = !!expandedTickets[ticket.id];
      const completedSubs = subs.filter((s) => s.completed).length;

      // Ticket X offset: if epic has routines, push right
      const ticketXPos = epicRoutines.length > 0 ? TICKET_X + 280 : TICKET_X;

      nodes.push({
        id: ticketNodeId,
        type: "ticket",
        position: { x: ticketXPos, y: ticketRowY },
        data: {
          label: ticket.title,
          ticketId: ticket.id,
          status: ticket.status,
          priority: ticket.priority,
          assignedAgent: ticket.assignedAgent,
          assignedHuman: ticket.assignedHuman || null,
          hitlRequired: ticket.hitlRequired,
          hitlType: ticket.hitlType,
          estimatedHours: ticket.estimatedHours,
          subtaskCount: subs.length,
          completedSubtaskCount: completedSubs,
          expanded: isExpanded,
          onToggleExpand,
        } satisfies TicketNodeData,
      });

      // Epic → Ticket edge
      edges.push({
        id: `e-${epicNodeId}-${ticketNodeId}`,
        source: epicNodeId,
        target: ticketNodeId,
        type: "smoothstep",
        animated: ticket.status === "in_progress",
        style: {
          stroke:
            ticket.status === "done"
              ? "var(--wiring-success)"
              : ticket.status === "in_progress"
              ? "var(--wiring-accent)"
              : "var(--wiring-glass-border)",
          strokeWidth: 1.5,
        },
      });

      // Dependency edges
      if (ticket.dependsOn) {
        for (const depId of ticket.dependsOn) {
          edges.push({
            id: `e-dep-${depId}-${ticket.id}`,
            source: `ticket-${depId}`,
            target: ticketNodeId,
            type: "smoothstep",
            style: { stroke: "var(--wiring-text-tertiary)", strokeWidth: 1, strokeDasharray: "4 4" },
            label: "depends",
            labelStyle: { fontSize: 9, fill: "var(--wiring-text-tertiary)" },
          });
        }
      }

      // Subtask nodes (when expanded)
      const subtaskXPos = ticketXPos + SUBTASK_X_OFFSET;
      if (isExpanded && subs.length > 0) {
        subs.forEach((sub, sidx) => {
          const subNodeId = `subtask-${sub.id}`;
          const subY = ticketRowY + sidx * (NODE_Y_GAP * 0.65);
          nodes.push({
            id: subNodeId,
            type: "subtask",
            position: { x: subtaskXPos, y: subY },
            data: {
              label: sub.title,
              subtaskId: sub.id,
              ticketId: ticket.id,
              completed: sub.completed,
            } satisfies SubtaskNodeData,
          });
          // Ticket → Subtask edge
          edges.push({
            id: `e-${ticketNodeId}-${subNodeId}`,
            source: ticketNodeId,
            target: subNodeId,
            type: "smoothstep",
            style: { stroke: "var(--wiring-glass-border)", strokeWidth: 1 },
          });
        });
      }

      // HITL node
      if (ticket.hitlRequired && ticket.hitlType) {
        const hitlNodeId = `hitl-${ticket.id}`;
        const hitlXPos = isExpanded && subs.length > 0
          ? subtaskXPos + HITL_EXTRA_X
          : ticketXPos + HITL_X_OFFSET;
        const hitlStatus =
          ticket.status === "done" ? "approved"
          : ticket.status === "review" ? "waiting"
          : ticket.status === "in_progress" ? "in_progress"
          : "waiting";

        nodes.push({
          id: hitlNodeId,
          type: "hitl",
          position: { x: hitlXPos, y: ticketRowY },
          data: {
            label: ticket.hitlType,
            ticketId: ticket.id,
            hitlType: ticket.hitlType,
            status: hitlStatus,
            assignee: ticket.assignedHuman?.name,
          } satisfies HITLNodeData,
        });

        const hitlSource = isExpanded && subs.length > 0
          ? `subtask-${subs[subs.length - 1].id}`
          : ticketNodeId;

        edges.push({
          id: `e-${ticketNodeId}-${hitlNodeId}`,
          source: hitlSource,
          target: hitlNodeId,
          type: "smoothstep",
          animated: hitlStatus === "waiting",
          style: { stroke: "var(--hitl-waiting)", strokeWidth: 1.5, strokeDasharray: "5 3" },
        });
      }

      // Advance row
      if (isExpanded && subs.length > 0) {
        ticketRowY += Math.max(subs.length, 1) * (NODE_Y_GAP * 0.65);
      } else {
        ticketRowY += NODE_Y_GAP;
      }
    }

    currentGroupY = ticketRowY + EPIC_GROUP_GAP;
  }

  return { nodes, edges };
}

// ─── Stats Panel ───
function FlowStats({
  epics,
  tickets,
  routineCount,
}: {
  epics: Epic[];
  tickets: Ticket[];
  routineCount: number;
}) {
  const doneCount = tickets.filter((t) => t.status === "done").length;
  const hitlCount = tickets.filter((t) => t.hitlRequired).length;
  const inProgressCount = tickets.filter((t) => t.status === "in_progress").length;

  return (
    <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[var(--wiring-bg-secondary)] border border-[var(--wiring-glass-border)] text-[10px]">
      <span className="text-[var(--wiring-text-tertiary)]">에픽 <strong className="text-[var(--wiring-text-primary)]">{epics.length}</strong></span>
      <span className="text-[var(--wiring-text-tertiary)]">티켓 <strong className="text-[var(--wiring-text-primary)]">{tickets.length}</strong></span>
      <span className="text-[var(--wiring-text-tertiary)]">진행 <strong className="text-[var(--wiring-accent)]">{inProgressCount}</strong></span>
      <span className="text-[var(--wiring-text-tertiary)]">완료 <strong className="text-[var(--wiring-success)]">{doneCount}</strong></span>
      <span className="text-[var(--wiring-text-tertiary)]">HITL <strong className="text-[var(--hitl-waiting)]">{hitlCount}</strong></span>
      <span className="text-[var(--wiring-text-tertiary)]">루틴 <strong className="text-[var(--wiring-success)]">{routineCount}</strong></span>
    </div>
  );
}

// ─── Main Component ───
function FlowchartViewInner({ projectId }: { projectId: string }) {
  const { epics: allEpics, tickets: allTickets, subtasks: allSubtasks } = useProjectStore();
  const [expandedTickets, setExpandedTickets] = useState<Record<string, boolean>>({});

  const projectEpics = useMemo(() => allEpics[projectId] || [], [allEpics, projectId]);
  const projectTickets = useMemo(
    () => projectEpics.flatMap((epic) => allTickets[epic.id] || []),
    [projectEpics, allTickets]
  );

  // Memoize to prevent new array reference on every render
  const relevantRoutines = useMemo(
    () => {
      const epicIds = new Set(projectEpics.map((e) => e.id));
      return DUMMY_ROUTINES.filter((r) => !r.epicId || epicIds.has(r.epicId));
    },
    [projectEpics]
  );

  const handleToggleExpand = useCallback((ticketId: string) => {
    setExpandedTickets((prev) => ({ ...prev, [ticketId]: !prev[ticketId] }));
  }, []);

  const { nodes, edges } = useMemo(
    () => buildFlowDataLR(
      projectEpics,
      allTickets,
      allSubtasks,
      expandedTickets,
      relevantRoutines,
      handleToggleExpand
    ),
    [projectEpics, allTickets, allSubtasks, expandedTickets, relevantRoutines, handleToggleExpand]
  );

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        defaultEdgeOptions={{ type: "smoothstep" }}
        minZoom={0.2}
        maxZoom={1.5}
        proOptions={{ hideAttribution: true }}
        className="bg-[var(--wiring-bg-primary)]"
      >
        <Panel position="top-right">
          <FlowStats
            epics={projectEpics}
            tickets={projectTickets}
            routineCount={relevantRoutines.length}
          />
        </Panel>
        <Panel position="bottom-left">
          <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-[var(--wiring-bg-secondary)] border border-[var(--wiring-glass-border)] text-[10px] text-[var(--wiring-text-tertiary)]">
            <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-[var(--wiring-success)] inline-block rounded" />상시 루틴</span>
            <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-[var(--wiring-accent)] inline-block rounded" />에픽 → 티켓</span>
            <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-[var(--hitl-waiting)] inline-block rounded border-dashed" />HITL</span>
            <span className="flex items-center gap-1"><span className="text-[9px]">▶</span> 티켓 클릭 시 서브태스크 전개</span>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}

export function FlowchartView({ projectId }: { projectId: string }) {
  return (
    <ReactFlowProvider>
      <FlowchartViewInner projectId={projectId} />
    </ReactFlowProvider>
  );
}
