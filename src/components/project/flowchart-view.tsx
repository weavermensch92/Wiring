"use client";

import { useMemo, useCallback } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  Panel,
  type Node,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useProjectStore } from "@/stores/project-store";
import { Epic, Ticket } from "@/types/project";
import {
  TicketNode,
  HITLNode,
  EpicNode,
  type TicketNodeData,
  type HITLNodeData,
  type EpicNodeData,
} from "./flowchart-nodes";

const nodeTypes = {
  ticket: TicketNode,
  hitl: HITLNode,
  epic: EpicNode,
};

// ─── Auto-layout ───
// Simple tree layout: Epic at top, tickets below, HITL nodes branched off

const EPIC_Y = 0;
const TICKET_Y = 120;
const HITL_Y = 280;
const NODE_X_GAP = 240;
const EPIC_X_GAP = 280;

function buildFlowData(
  epics: Epic[],
  allTickets: Record<string, Ticket[]>
): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  let epicX = 0;

  for (const epic of epics) {
    const tickets = allTickets[epic.id] || [];
    const epicWidth = Math.max(tickets.length, 1) * NODE_X_GAP;

    // Epic node
    const epicNodeId = `epic-${epic.id}`;
    nodes.push({
      id: epicNodeId,
      type: "epic",
      position: { x: epicX + epicWidth / 2 - 120, y: EPIC_Y },
      data: {
        label: epic.title,
        epicId: epic.id,
        status: epic.status,
        ticketCount: epic.ticketCount,
        completedTickets: epic.completedTickets,
      } satisfies EpicNodeData,
    });

    // Ticket nodes
    let ticketX = epicX;
    for (const ticket of tickets) {
      const ticketNodeId = `ticket-${ticket.id}`;

      nodes.push({
        id: ticketNodeId,
        type: "ticket",
        position: { x: ticketX, y: TICKET_Y },
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

      // HITL node if required
      if (ticket.hitlRequired && ticket.hitlType) {
        const hitlNodeId = `hitl-${ticket.id}`;
        const hitlStatus =
          ticket.status === "done"
            ? "approved"
            : ticket.status === "review"
            ? "waiting"
            : ticket.status === "in_progress"
            ? "in_progress"
            : "waiting";

        nodes.push({
          id: hitlNodeId,
          type: "hitl",
          position: { x: ticketX + 20, y: HITL_Y },
          data: {
            label: ticket.hitlType,
            ticketId: ticket.id,
            hitlType: ticket.hitlType,
            status: hitlStatus,
            assignee: ticket.assignedHuman?.name,
          } satisfies HITLNodeData,
        });

        // Ticket → HITL edge
        edges.push({
          id: `e-${ticketNodeId}-${hitlNodeId}`,
          source: ticketNodeId,
          target: hitlNodeId,
          type: "smoothstep",
          animated: hitlStatus === "waiting",
          style: {
            stroke: "var(--hitl-waiting)",
            strokeWidth: 1.5,
            strokeDasharray: "5 3",
          },
        });
      }

      // Dependency edges (ticket → ticket)
      if (ticket.dependsOn) {
        for (const depId of ticket.dependsOn) {
          edges.push({
            id: `e-dep-${depId}-${ticket.id}`,
            source: `ticket-${depId}`,
            target: ticketNodeId,
            type: "smoothstep",
            style: {
              stroke: "var(--wiring-text-tertiary)",
              strokeWidth: 1,
              strokeDasharray: "4 4",
            },
            label: "depends",
            labelStyle: {
              fontSize: 9,
              fill: "var(--wiring-text-tertiary)",
            },
          });
        }
      }

      ticketX += NODE_X_GAP;
    }

    epicX += epicWidth + EPIC_X_GAP;
  }

  return { nodes, edges };
}

// ─── Stats Panel ───

function FlowStats({ epics, tickets }: { epics: Epic[]; tickets: Ticket[] }) {
  const totalTickets = tickets.length;
  const doneCount = tickets.filter((t) => t.status === "done").length;
  const hitlCount = tickets.filter((t) => t.hitlRequired).length;
  const inProgressCount = tickets.filter((t) => t.status === "in_progress").length;

  return (
    <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[var(--wiring-bg-secondary)] border border-[var(--wiring-glass-border)] text-[10px]">
      <span className="text-[var(--wiring-text-tertiary)]">
        에픽 <strong className="text-[var(--wiring-text-primary)]">{epics.length}</strong>
      </span>
      <span className="text-[var(--wiring-text-tertiary)]">
        티켓 <strong className="text-[var(--wiring-text-primary)]">{totalTickets}</strong>
      </span>
      <span className="text-[var(--wiring-text-tertiary)]">
        진행 <strong className="text-[var(--wiring-accent)]">{inProgressCount}</strong>
      </span>
      <span className="text-[var(--wiring-text-tertiary)]">
        완료 <strong className="text-[var(--wiring-success)]">{doneCount}</strong>
      </span>
      <span className="text-[var(--wiring-text-tertiary)]">
        HITL <strong className="text-[var(--hitl-waiting)]">{hitlCount}</strong>
      </span>
    </div>
  );
}

// ─── Main Component ───

function FlowchartViewInner({ projectId }: { projectId: string }) {
  const { epics: allEpics, tickets: allTickets } = useProjectStore();

  const projectEpics = allEpics[projectId] || [];
  const projectTickets = useMemo(() => {
    return projectEpics.flatMap((epic) => allTickets[epic.id] || []);
  }, [projectEpics, allTickets]);

  const { nodes: initialNodes, edges: initialEdges } = useMemo(
    () => buildFlowData(projectEpics, allTickets),
    [projectEpics, allTickets]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        defaultEdgeOptions={{ type: "smoothstep" }}
        minZoom={0.3}
        maxZoom={1.5}
        proOptions={{ hideAttribution: true }}
        className="bg-[var(--wiring-bg-primary)]"
      >
        <Panel position="top-right">
          <FlowStats epics={projectEpics} tickets={projectTickets} />
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
