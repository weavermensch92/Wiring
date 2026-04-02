"use client";

import { create } from "zustand";
import { FlowNode, FlowEdge, NodeStatus } from "@/types/flowchart";
import { DUMMY_FLOW_NODES, DUMMY_FLOW_EDGES } from "@/dummy/flowchart";

interface FlowchartState {
  nodes: Record<string, FlowNode[]>;
  edges: Record<string, FlowEdge[]>;
  selectedEpicId: string;
  viewport: { x: number; y: number; zoom: number };
  setSelectedEpic: (epicId: string) => void;
  setViewport: (vp: { x: number; y: number; zoom: number }) => void;
  updateNodeStatus: (epicId: string, nodeId: string, status: NodeStatus) => void;
  addNode: (epicId: string, node: FlowNode) => void;
  removeNode: (epicId: string, nodeId: string) => void;
}

export const useFlowchartStore = create<FlowchartState>((set) => ({
  nodes: DUMMY_FLOW_NODES,
  edges: DUMMY_FLOW_EDGES,
  selectedEpicId: "epic-1",
  viewport: { x: 0, y: 0, zoom: 1 },
  setSelectedEpic: (epicId) => set({ selectedEpicId: epicId }),
  setViewport: (vp) => set({ viewport: vp }),
  updateNodeStatus: (epicId, nodeId, status) =>
    set((state) => ({
      nodes: {
        ...state.nodes,
        [epicId]: (state.nodes[epicId] || []).map((n) =>
          n.id === nodeId ? { ...n, data: { ...n.data, status } } : n
        ),
      },
    })),
  addNode: (epicId, node) =>
    set((state) => ({
      nodes: {
        ...state.nodes,
        [epicId]: [...(state.nodes[epicId] || []), node],
      },
    })),
  removeNode: (epicId, nodeId) =>
    set((state) => ({
      nodes: {
        ...state.nodes,
        [epicId]: (state.nodes[epicId] || []).filter((n) => n.id !== nodeId),
      },
    })),
}));
