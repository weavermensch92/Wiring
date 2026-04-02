export type FlowNodeType = "task" | "hitl" | "branch" | "merge" | "escalation" | "routine";
export type NodeStatus = "waiting" | "in_progress" | "done" | "approved" | "rejected" | "escalated" | "todo" | "review";

export interface FlowNodeData {
  label: string;
  agent?: string;
  status: NodeStatus;
  ticketId?: string;
  hitlId?: string;
  assignee?: string;
}

export interface FlowNode {
  id: string;
  type: FlowNodeType;
  position: { x: number; y: number };
  data: FlowNodeData;
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  animated?: boolean;
}
