"use client";

import { create } from "zustand";
import { CompanyContext, ContextEvent, ContextSourceStatus } from "@/types/context";
import { DUMMY_COMPANY_CONTEXT, DUMMY_CONTEXT_EVENTS } from "@/dummy/context";

interface ContextState {
  company: CompanyContext;
  events: ContextEvent[];

  // Onboarding
  setOnboardingStep: (step: number) => void;
  completeOnboarding: () => void;

  // Source sync simulation
  connectSource: (sourceId: string) => void;
  syncSource: (sourceId: string) => void;

  // Event actions
  acknowledgeEvent: (eventId: string) => void;
  approveProposal: (eventId: string, proposalId: string) => void;
  rejectProposal: (eventId: string, proposalId: string) => void;
}

export const useContextStore = create<ContextState>((set, get) => ({
  company: DUMMY_COMPANY_CONTEXT,
  events: DUMMY_CONTEXT_EVENTS,

  setOnboardingStep: (step) =>
    set((s) => ({ company: { ...s.company, onboardingStep: step } })),

  completeOnboarding: () =>
    set((s) => ({ company: { ...s.company, onboardingCompleted: true, onboardingStep: 3 } })),

  connectSource: (sourceId) => {
    // 연결 시뮬레이션: syncing → connected (2초)
    set((s) => ({
      company: {
        ...s.company,
        sources: s.company.sources.map((src) =>
          src.id === sourceId ? { ...src, status: "syncing" as ContextSourceStatus } : src
        ),
      },
    }));
    setTimeout(() => {
      set((s) => ({
        company: {
          ...s.company,
          sources: s.company.sources.map((src) =>
            src.id === sourceId
              ? { ...src, status: "connected" as ContextSourceStatus, lastSyncAt: new Date().toISOString() }
              : src
          ),
        },
      }));
    }, 2000);
  },

  syncSource: (sourceId) => {
    set((s) => ({
      company: {
        ...s.company,
        sources: s.company.sources.map((src) =>
          src.id === sourceId ? { ...src, status: "syncing" as ContextSourceStatus } : src
        ),
      },
    }));
    setTimeout(() => {
      set((s) => ({
        company: {
          ...s.company,
          sources: s.company.sources.map((src) =>
            src.id === sourceId
              ? { ...src, status: "connected" as ContextSourceStatus, lastSyncAt: new Date().toISOString() }
              : src
          ),
        },
      }));
    }, 1500);
  },

  acknowledgeEvent: (eventId) =>
    set((s) => ({
      events: s.events.map((e) =>
        e.id === eventId ? { ...e, acknowledged: true } : e
      ),
    })),

  approveProposal: (eventId, proposalId) =>
    set((s) => ({
      events: s.events.map((e) =>
        e.id === eventId
          ? {
              ...e,
              agentProposals: e.agentProposals.map((p) =>
                // ContextEvent proposals don't have approved field — handled in HITL store
                p
              ),
            }
          : e
      ),
    })),

  rejectProposal: (eventId, proposalId) => {
    // handled via hitl store
  },
}));
