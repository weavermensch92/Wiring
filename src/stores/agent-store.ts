"use client";

import { create } from "zustand";
import { Agent, AgentMessage, ModelAllocation } from "@/types/agent";
import { DUMMY_AGENTS, DUMMY_AGENT_MESSAGES } from "@/dummy/agents";

interface AgentState {
  agents: Agent[];
  communicationLogs: AgentMessage[];
  modelAllocations: Record<string, ModelAllocation>;
  setModelAllocation: (epicId: string, allocation: ModelAllocation) => void;
  addCommunicationLog: (msg: AgentMessage) => void;
  updateAgentStatus: (agentId: string, status: Agent["status"], task: string | null) => void;
}

export const useAgentStore = create<AgentState>((set) => ({
  agents: DUMMY_AGENTS,
  communicationLogs: DUMMY_AGENT_MESSAGES,
  modelAllocations: {},
  setModelAllocation: (epicId, allocation) =>
    set((state) => ({
      modelAllocations: { ...state.modelAllocations, [epicId]: allocation },
    })),
  addCommunicationLog: (msg) =>
    set((state) => ({
      communicationLogs: [...state.communicationLogs, msg],
    })),
  updateAgentStatus: (agentId, status, task) =>
    set((state) => ({
      agents: state.agents.map((a) =>
        a.id === agentId ? { ...a, status, currentTask: task } : a
      ),
    })),
}));
