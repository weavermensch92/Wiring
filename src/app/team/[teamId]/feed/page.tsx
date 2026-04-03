"use client";

import { use, useMemo } from "react";
import { DUMMY_TEAMS } from "@/dummy/teams";
import { getProjectsForTeam } from "@/dummy/projects";
import { DUMMY_AGENT_MESSAGES, DUMMY_AGENTS } from "@/dummy/agents";
import { DUMMY_HITL_QUEUE } from "@/dummy/hitl";
import { DUMMY_ROUTINES } from "@/dummy/routines";
import { DUMMY_EPICS, DUMMY_TICKETS } from "@/dummy/projects";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { AGENT_COLORS } from "@/lib/constants";
import {
  Bot, User, AlertTriangle, CheckCircle2, RefreshCw,
  Zap, MessageSquare, Activity, Clock, ArrowUpRight,
} from "lucide-react";

// ─── Feed Item Types ───
type FeedItemType = "agent_message" | "hitl_event" | "ticket_update" | "routine_run";

interface FeedItem {
  id: string;
  type: FeedItemType;
  timestamp: string;
  title: string;
  body: string;
  agentId?: string;
  status?: string;
  priority?: string;
  epicId?: string;
}

function formatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "방금";
  if (diffMin < 60) return `${diffMin}분 전`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}시간 전`;
  return `${Math.floor(diffH / 24)}일 전`;
}

// ─── Feed Item Card ───
function FeedCard({ item }: { item: FeedItem }) {
  const agent = item.agentId ? DUMMY_AGENTS.find((a) => a.id === item.agentId) : null;

  const iconMap: Record<FeedItemType, React.ReactNode> = {
    agent_message: <MessageSquare className="w-3.5 h-3.5 text-[var(--wiring-accent)]" />,
    hitl_event: <AlertTriangle className="w-3.5 h-3.5 text-[var(--hitl-waiting)]" />,
    ticket_update: <Activity className="w-3.5 h-3.5 text-[var(--wiring-info)]" />,
    routine_run: <RefreshCw className="w-3.5 h-3.5 text-[var(--wiring-success)]" />,
  };

  const statusColors: Record<string, string> = {
    waiting: "var(--hitl-waiting)",
    approved: "var(--wiring-success)",
    rejected: "var(--wiring-danger)",
    in_progress: "var(--wiring-info)",
    done: "var(--wiring-success)",
    active: "var(--wiring-success)",
  };

  return (
    <div className="flex gap-3 py-3 border-b border-[var(--wiring-glass-border)] last:border-0">
      {/* Avatar / Icon */}
      <div className="shrink-0 mt-0.5">
        {agent ? (
          <Avatar className="w-7 h-7">
            <AvatarFallback
              className="text-[9px] font-bold text-white"
              style={{ backgroundColor: agent.color }}
            >
              {agent.avatar}
            </AvatarFallback>
          </Avatar>
        ) : (
          <div className="w-7 h-7 rounded-full flex items-center justify-center bg-[var(--wiring-glass-bg)] border border-[var(--wiring-glass-border)]">
            {iconMap[item.type]}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
          <span className="text-xs font-medium text-[var(--wiring-text-primary)]">{item.title}</span>
          {item.status && (
            <span className="text-[10px] px-1.5 py-0.5 rounded" style={{
              backgroundColor: `${statusColors[item.status] ?? "#555"}20`,
              color: statusColors[item.status] ?? "var(--wiring-text-tertiary)",
            }}>
              {item.status === "waiting" ? "대기" : item.status === "approved" ? "승인" : item.status === "rejected" ? "반려" : item.status === "in_progress" ? "진행 중" : item.status === "done" ? "완료" : item.status}
            </span>
          )}
          <span className="text-[10px] text-[var(--wiring-text-tertiary)] ml-auto shrink-0">
            {formatTime(item.timestamp)}
          </span>
        </div>
        <p className="text-xs text-[var(--wiring-text-secondary)] leading-relaxed">{item.body}</p>
      </div>
    </div>
  );
}

export default function TeamFeedPage({ params }: { params: Promise<{ teamId: string }> }) {
  const { teamId } = use(params);
  const team = DUMMY_TEAMS.find((t) => t.id === teamId);
  const projects = getProjectsForTeam(teamId);

  // Collect all epic IDs for this team
  const teamEpicIds = useMemo(() => {
    const ids = new Set<string>();
    projects.forEach((p) => {
      (DUMMY_EPICS[p.id] ?? []).forEach((e) => ids.add(e.id));
    });
    return ids;
  }, [projects]);

  // Collect all ticket IDs for this team
  const teamTicketIds = useMemo(() => {
    const ids = new Set<string>();
    teamEpicIds.forEach((eid) => {
      (DUMMY_TICKETS[eid] ?? []).forEach((t) => ids.add(t.id));
    });
    return ids;
  }, [teamEpicIds]);

  // Build unified feed from multiple sources
  const feedItems = useMemo((): FeedItem[] => {
    const items: FeedItem[] = [];

    // Agent messages relevant to team's tickets
    DUMMY_AGENT_MESSAGES.forEach((msg) => {
      if (msg.ticketId && !teamTicketIds.has(msg.ticketId)) return;
      const fromAgent = DUMMY_AGENTS.find((a) => a.id === msg.fromAgent);
      const toAgent = DUMMY_AGENTS.find((a) => a.id === msg.toAgent);
      items.push({
        id: `msg-${msg.id}`,
        type: "agent_message",
        timestamp: msg.timestamp,
        title: `${fromAgent?.name ?? msg.fromAgent} → ${toAgent?.name ?? msg.toAgent}`,
        body: msg.content,
        agentId: msg.fromAgent,
        ...(msg.ticketId ? { epicId: msg.ticketId } : {}),
      });
    });

    // HITL events for team epics
    DUMMY_HITL_QUEUE.forEach((hitl) => {
      if (!teamEpicIds.has(hitl.epicId)) return;
      items.push({
        id: `hitl-${hitl.id}`,
        type: "hitl_event",
        timestamp: hitl.createdAt,
        title: hitl.title,
        body: `${hitl.requestedBy} Agent 요청 · 담당: ${hitl.assignedTo.name} (${hitl.assignedTo.level})`,
        agentId: hitl.requestedBy,
        status: hitl.status,
        priority: hitl.priority,
      });
    });

    // Ticket updates (in_progress tickets)
    teamEpicIds.forEach((epicId) => {
      (DUMMY_TICKETS[epicId] ?? [])
        .filter((t) => t.status === "in_progress" || t.status === "review")
        .forEach((ticket) => {
          items.push({
            id: `ticket-${ticket.id}`,
            type: "ticket_update",
            timestamp: ticket.updatedAt ?? ticket.createdAt ?? new Date().toISOString(),
            title: ticket.title,
            body: `${ticket.assignedAgent ?? "미배정"} Agent · 예상 ${ticket.estimatedHours}h`,
            agentId: ticket.assignedAgent ?? undefined,
            status: ticket.status,
          });
        });
    });

    // Routines for this team's epics
    DUMMY_ROUTINES.filter((r) => !r.epicId || teamEpicIds.has(r.epicId))
      .forEach((routine) => {
        items.push({
          id: `routine-${routine.id}`,
          type: "routine_run",
          timestamp: routine.lastExecution,
          title: routine.title,
          body: `트리거: ${routine.trigger} · 성공률 ${routine.successRate}% · ${routine.executionCount}회 실행`,
          status: routine.status,
        });
      });

    return items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [teamEpicIds, teamTicketIds]);

  // Stats
  const activeAgents = DUMMY_AGENTS.filter((a) => a.status === "active").length;
  const pendingHitl = DUMMY_HITL_QUEUE.filter(
    (h) => teamEpicIds.has(h.epicId) && h.status === "waiting"
  ).length;
  const activeRoutines = DUMMY_ROUTINES.filter(
    (r) => r.status === "active" && (!r.epicId || teamEpicIds.has(r.epicId))
  ).length;

  if (!team) return <div className="p-6 text-[var(--wiring-text-tertiary)]">팀을 찾을 수 없습니다</div>;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-5">
          {/* Header */}
          <div className="flex items-center gap-3">
            <span
              className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0"
              style={{ backgroundColor: team.color }}
            >
              {team.abbreviation}
            </span>
            <div>
              <h1 className="text-xl font-semibold text-[var(--wiring-text-primary)]">{team.name} 피드</h1>
              <p className="text-xs text-[var(--wiring-text-tertiary)]">에이전트 활동 · HITL · 루틴 통합 피드</p>
            </div>
          </div>

          {/* KPI */}
          <div className="grid grid-cols-3 gap-3">
            <div className="glass-panel p-4">
              <div className="flex items-center gap-2 mb-1">
                <Bot className="w-4 h-4 text-[var(--wiring-accent)]" />
                <p className="text-xs text-[var(--wiring-text-tertiary)]">활성 에이전트</p>
              </div>
              <p className="text-2xl font-bold" style={{ color: "var(--wiring-success)" }}>{activeAgents}</p>
            </div>
            <div className="glass-panel p-4">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="w-4 h-4 text-[var(--hitl-waiting)]" />
                <p className="text-xs text-[var(--wiring-text-tertiary)]">HITL 대기</p>
              </div>
              <p className="text-2xl font-bold" style={{ color: pendingHitl > 0 ? "var(--hitl-waiting)" : "var(--wiring-text-secondary)" }}>
                {pendingHitl}
              </p>
            </div>
            <div className="glass-panel p-4">
              <div className="flex items-center gap-2 mb-1">
                <RefreshCw className="w-4 h-4 text-[var(--wiring-success)]" />
                <p className="text-xs text-[var(--wiring-text-tertiary)]">활성 루틴</p>
              </div>
              <p className="text-2xl font-bold text-[var(--wiring-text-primary)]">{activeRoutines}</p>
            </div>
          </div>

          {/* Feed */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-4 h-4 text-[var(--wiring-text-tertiary)]" />
              <p className="text-xs font-medium text-[var(--wiring-text-tertiary)] uppercase">최신 활동</p>
              <Badge variant="secondary" className="text-[10px] ml-auto">{feedItems.length}개</Badge>
            </div>

            {/* Filter legend */}
            <div className="flex items-center gap-3 mb-3 text-[10px] text-[var(--wiring-text-tertiary)]">
              <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3 text-[var(--wiring-accent)]" />에이전트 소통</span>
              <span className="flex items-center gap-1"><AlertTriangle className="w-3 h-3 text-[var(--hitl-waiting)]" />HITL</span>
              <span className="flex items-center gap-1"><Activity className="w-3 h-3 text-[var(--wiring-info)]" />티켓 업데이트</span>
              <span className="flex items-center gap-1"><RefreshCw className="w-3 h-3 text-[var(--wiring-success)]" />루틴</span>
            </div>

            <div className="glass-panel px-4 py-2">
              {feedItems.length === 0 ? (
                <p className="text-sm text-[var(--wiring-text-tertiary)] py-6 text-center">활동 없음</p>
              ) : (
                feedItems.map((item) => <FeedCard key={item.id} item={item} />)
              )}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
