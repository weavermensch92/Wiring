"use client";

import { useState, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DUMMY_TEAMS } from "@/dummy/teams";
import { DUMMY_PROJECTS, DUMMY_EPICS, DUMMY_TICKETS, DUMMY_SUBTASKS, getAllTicketsForProject } from "@/dummy/projects";
import { CURRENT_USER } from "@/dummy/users";
import { useHITLStore } from "@/stores/hitl-store";
import { useProjectStore } from "@/stores/project-store";
import { AGENT_COLORS } from "@/lib/constants";
import { EmptyState } from "@/components/ui/empty-state";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Ticket as TicketIcon, AlertTriangle, Clock, CheckCircle2, ArrowRight,
  CalendarDays, Bot, ChevronRight, Inbox, Filter,
} from "lucide-react";

// ─── 유틸 ───
function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "방금";
  if (mins < 60) return `${mins}분 전`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}시간 전`;
  return `${Math.floor(hours / 24)}일 전`;
}

const STATUS_COLORS: Record<string, string> = {
  backlog: "var(--wiring-text-tertiary)", todo: "var(--wiring-info)", in_progress: "var(--wiring-accent)", review: "var(--wiring-warning)", done: "var(--wiring-success)",
};
const STATUS_LABELS: Record<string, string> = {
  backlog: "백로그", todo: "할 일", in_progress: "진행 중", review: "검토", done: "완료",
};
const PRIORITY_COLORS: Record<string, string> = {
  critical: "var(--wiring-danger)", high: "var(--wiring-warning)", medium: "var(--wiring-info)", low: "var(--wiring-text-tertiary)",
};
const HITL_TYPE_LABELS: Record<string, string> = {
  code_review: "코드 리뷰", security_approval: "보안 승인", spec_decision: "스펙 결정",
  design_review: "디자인 검토", cost_approval: "비용 승인", assignment: "담당자 배정", model_allocation: "모델 배분",
};

type Tab = "tickets" | "hitl" | "schedule";

export default function MyWorkPage() {
  return (
    <Suspense fallback={<div className="h-full flex items-center justify-center text-[var(--wiring-text-tertiary)]">로딩 중...</div>}>
      <MyWorkContent />
    </Suspense>
  );
}

function MyWorkContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as Tab) ?? "tickets";
  const [tab, setTab] = useState<Tab>(initialTab);
  const { queueItems } = useHITLStore();
  const { tickets: storeTickets } = useProjectStore();

  // 내게 배정된 티켓
  const myTickets = useMemo(() => {
    const all: (typeof DUMMY_TICKETS[string][number] & { teamId?: string; projectName?: string })[] = [];
    DUMMY_TEAMS.forEach((team) => {
      DUMMY_PROJECTS.filter((p) => p.teamId === team.id).forEach((project) => {
        (DUMMY_EPICS[project.id] ?? []).forEach((epic) => {
          const tickets = storeTickets[epic.id] ?? DUMMY_TICKETS[epic.id] ?? [];
          tickets.forEach((t) => {
            if (t.assignedHuman?.id === CURRENT_USER.id) {
              all.push({ ...t, teamId: team.id, projectName: project.name });
            }
          });
        });
      });
    });
    return all;
  }, [storeTickets]);

  const ticketsByStatus = useMemo(() => {
    const groups: Record<string, typeof myTickets> = { in_progress: [], review: [], todo: [], backlog: [], done: [] };
    myTickets.forEach((t) => { (groups[t.status] ??= []).push(t); });
    return groups;
  }, [myTickets]);

  // 내 HITL 큐
  const myHITL = useMemo(
    () => queueItems
      .filter((h) => h.assignedTo.id === CURRENT_USER.id && (h.status === "waiting" || h.status === "in_progress"))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [queueItems]
  );

  // 예정 (다음 7일 이내 마감 추정 — 생성일+예상시간 기준)
  const upcoming = useMemo(() => {
    const now = Date.now();
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    return myTickets
      .filter((t) => {
        if (t.status === "done") return false;
        if (t.createdAt) {
          const created = new Date(t.createdAt).getTime();
          const dueEstimate = created + (t.estimatedHours ?? 8) * 3600 * 1000;
          return dueEstimate - now < sevenDays && dueEstimate > now;
        }
        return false;
      })
      .sort((a, b) => (a.estimatedHours ?? 0) - (b.estimatedHours ?? 0));
  }, [myTickets]);

  const inProgressCount = ticketsByStatus["in_progress"]?.length ?? 0;
  const reviewCount = ticketsByStatus["review"]?.length ?? 0;
  const hitlWaiting = myHITL.filter((h) => h.status === "waiting").length;

  const TABS: { id: Tab; label: string; badge?: number }[] = [
    { id: "tickets", label: "내 티켓", badge: inProgressCount + reviewCount },
    { id: "hitl", label: "내 HITL 큐", badge: hitlWaiting },
    { id: "schedule", label: "예정 일정", badge: upcoming.length },
  ];

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="shrink-0 px-6 py-4 border-b border-[var(--wiring-glass-border)]">
        <div className="flex items-center gap-3 mb-4">
          <Inbox className="w-5 h-5 text-[var(--wiring-accent)]" />
          <h1 className="text-xl font-semibold text-[var(--wiring-text-primary)]">내 업무</h1>
          <span className="text-xs text-[var(--wiring-text-tertiary)] ml-auto">{CURRENT_USER.name} · {CURRENT_USER.role}</span>
        </div>

        {/* KPI */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          {[
            { label: "진행 중 티켓", value: inProgressCount, color: "var(--wiring-accent)" },
            { label: "검토 대기", value: reviewCount, color: "var(--wiring-warning)" },
            { label: "HITL 대기", value: hitlWaiting, color: "var(--hitl-waiting)" },
            { label: "전체 배정", value: myTickets.filter((t) => t.status !== "done").length, color: "var(--wiring-info)" },
          ].map((kpi) => (
            <div key={kpi.label} className="glass-panel p-3">
              <p className="text-lg font-bold" style={{ color: kpi.color }}>{kpi.value}</p>
              <p className="text-xs text-[var(--wiring-text-tertiary)]">{kpi.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors ${
                tab === t.id
                  ? "bg-[var(--wiring-accent)] text-white font-medium"
                  : "text-[var(--wiring-text-secondary)] hover:bg-[var(--wiring-glass-hover)]"
              }`}
            >
              {t.label}
              {t.badge != null && t.badge > 0 && (
                <span className={`px-1.5 py-0 rounded-full text-[10px] font-bold ${tab === t.id ? "bg-white/20" : "bg-[var(--wiring-glass-bg)]"}`}>
                  {t.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-6">
          {/* ── 내 티켓 ── */}
          {tab === "tickets" && (
            <div className="space-y-5">
              {(["in_progress", "review", "todo", "backlog"] as const).map((status) => {
                const tickets = ticketsByStatus[status] ?? [];
                if (tickets.length === 0) return null;
                return (
                  <div key={status}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: STATUS_COLORS[status] }} />
                      <p className="text-xs font-semibold text-[var(--wiring-text-tertiary)] uppercase">{STATUS_LABELS[status]} ({tickets.length})</p>
                    </div>
                    <div className="space-y-2">
                      {tickets.map((ticket) => {
                        const team = DUMMY_TEAMS.find((t) => t.id === (ticket as any).teamId);
                        const subs = DUMMY_SUBTASKS[ticket.id] ?? [];
                        const completedSubs = subs.filter((s) => s.completed).length;
                        return (
                          <button
                            key={ticket.id}
                            onClick={() => {
                              if (team) router.push(`/team/${team.id}/project/${DUMMY_PROJECTS.find((p) => p.teamId === team.id)?.id ?? ""}`);
                            }}
                            className="w-full glass-panel px-4 py-3 flex items-start gap-3 hover:border-[var(--wiring-accent)] transition-all text-left group"
                          >
                            <span className="w-2 h-2 rounded-full shrink-0 mt-1.5" style={{ backgroundColor: PRIORITY_COLORS[ticket.priority] }} />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-[var(--wiring-text-primary)] group-hover:text-[var(--wiring-accent)] transition-colors">{ticket.title}</p>
                              <p className="text-xs text-[var(--wiring-text-tertiary)] mt-0.5 line-clamp-1">{ticket.description}</p>
                              <div className="flex items-center gap-3 mt-2 flex-wrap">
                                {team && <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ backgroundColor: `${team.color}18`, color: team.color }}>{team.name}</span>}
                                {ticket.assignedAgent && (
                                  <div className="flex items-center gap-1">
                                    <Avatar className="w-4 h-4">
                                      <AvatarFallback className="text-[7px] font-bold text-white" style={{ backgroundColor: AGENT_COLORS[ticket.assignedAgent as keyof typeof AGENT_COLORS] ?? "#888" }}>
                                        {ticket.assignedAgent.slice(0, 2)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className="text-[10px] text-[var(--wiring-text-tertiary)]">{ticket.assignedAgent}</span>
                                  </div>
                                )}
                                {ticket.hitlRequired && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--hitl-waiting)]/15 text-[var(--hitl-waiting)]">HITL</span>
                                )}
                                {subs.length > 0 && (
                                  <span className="text-[10px] text-[var(--wiring-text-tertiary)]">{completedSubs}/{subs.length} 서브태스크</span>
                                )}
                                {ticket.estimatedHours && (
                                  <span className="text-[10px] text-[var(--wiring-text-tertiary)]">{ticket.estimatedHours}h</span>
                                )}
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-[var(--wiring-text-tertiary)] shrink-0 mt-1" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
              {myTickets.filter((t) => t.status !== "done").length === 0 && (
                <EmptyState
                  icon={<TicketIcon className="w-10 h-10" />}
                  title="배정된 티켓이 없습니다"
                  description="아직 당신에게 배정된 내부 업무가 없습니다"
                />
              )}
            </div>
          )}

          {/* ── 내 HITL 큐 ── */}
          {tab === "hitl" && (
            <div className="space-y-2">
              {myHITL.length === 0 ? (
                <EmptyState
                  icon={<AlertTriangle className="w-10 h-10" />}
                  title="대기 중인 HITL 항목이 없습니다"
                  description="모든 HITL 항목이 처리되었습니다"
                />
              ) : (
                myHITL.map((hitl) => (
                  <button
                    key={hitl.id}
                    onClick={() => router.push(`/hitl/${hitl.id}`)}
                    className="w-full glass-panel px-4 py-3 flex items-start gap-3 hover:border-[var(--wiring-accent)] transition-all text-left group"
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: hitl.status === "waiting" ? "rgba(251,191,36,0.15)" : "rgba(59,130,246,0.15)", color: hitl.status === "waiting" ? "var(--hitl-waiting)" : "var(--wiring-info)" }}
                    >
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--wiring-text-primary)] group-hover:text-[var(--wiring-accent)]">{hitl.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--wiring-glass-bg)] text-[var(--wiring-text-tertiary)]">{HITL_TYPE_LABELS[hitl.type] ?? hitl.type}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ backgroundColor: PRIORITY_COLORS[hitl.priority] + "18", color: PRIORITY_COLORS[hitl.priority] }}>
                          {hitl.priority}
                        </span>
                        <span className="text-[10px] text-[var(--wiring-text-tertiary)]">요청: {hitl.requestedBy}</span>
                        <span className="text-[10px] text-[var(--wiring-text-tertiary)]">{timeAgo(hitl.createdAt)}</span>
                      </div>
                      <p className="text-xs text-[var(--wiring-text-tertiary)] mt-1 line-clamp-1">{hitl.briefing}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[var(--wiring-text-tertiary)] shrink-0 mt-1" />
                  </button>
                ))
              )}
            </div>
          )}

          {/* ── 예정 일정 ── */}
          {tab === "schedule" && (
            <div className="space-y-2">
              {upcoming.length === 0 ? (
                <EmptyState
                  icon={<CalendarDays className="w-10 h-10" />}
                  title="예정된 일정이 없습니다"
                  description="다음 7일 내 마감 예정인 업무가 없습니다"
                />
              ) : (
                upcoming.map((ticket) => {
                  const team = DUMMY_TEAMS.find((t) => t.id === (ticket as any).teamId);
                  return (
                    <div key={ticket.id} className="glass-panel px-4 py-3 flex items-center gap-3">
                      <CalendarDays className="w-4 h-4 text-[var(--wiring-accent)] shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[var(--wiring-text-primary)]">{ticket.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {team && <span className="text-[10px]" style={{ color: team.color }}>{team.name}</span>}
                          <span className="text-[10px] text-[var(--wiring-text-tertiary)]">{ticket.estimatedHours}h 예상</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ color: STATUS_COLORS[ticket.status], backgroundColor: `${STATUS_COLORS[ticket.status]}18` }}>
                            {STATUS_LABELS[ticket.status]}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
