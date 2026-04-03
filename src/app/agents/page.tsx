"use client";

import { useState } from "react";
import { useAgentStore } from "@/stores/agent-store";
import { DUMMY_AGENT_MESSAGES, DUMMY_AGENT_WORK_HISTORY } from "@/dummy/agents";
import { Agent } from "@/types/agent";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Activity, MessageSquare, Zap, DollarSign, CheckCircle2, Clock, ChevronRight } from "lucide-react";

// ─── 모델 색상 ───
const MODEL_COLORS: Record<string, string> = {
  "claude-sonnet-4": "#8B5CF6",
  "claude-haiku": "#A78BFA",
  "gpt-4o": "#10B981",
  "gemini-2.0-flash": "#3B82F6",
};

// ─── 전체 비용 합산 ───
function getTotalTodayCost(agents: Agent[]): number {
  return agents.reduce((sum, a) => sum + (a.todayCostUsd ?? 0), 0);
}

// ─── 상태 배지 ───
function StatusDot({ status }: { status: Agent["status"] }) {
  const colors: Record<string, string> = {
    active: "var(--wiring-success)",
    idle: "var(--wiring-text-tertiary)",
    error: "var(--wiring-danger)",
  };
  const labels: Record<string, string> = { active: "활성", idle: "대기", error: "오류" };
  return (
    <div className="flex items-center gap-1.5">
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: colors[status] }} />
      <span className="text-[10px]" style={{ color: colors[status] }}>{labels[status]}</span>
    </div>
  );
}

// ─── 에이전트 카드 ───
function AgentCard({ agent, selected, onClick }: { agent: Agent; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left glass-panel p-4 transition-all hover:border-[var(--wiring-accent)] ${
        selected ? "border-[var(--wiring-accent)] bg-[var(--wiring-accent-glow)]" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2.5">
          <Avatar className="w-9 h-9 shrink-0">
            <AvatarFallback
              className="text-xs font-bold text-white"
              style={{ backgroundColor: agent.color }}
            >
              {agent.avatar}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium text-[var(--wiring-text-primary)] leading-tight">{agent.name}</p>
            <p className="text-[11px] text-[var(--wiring-text-tertiary)] mt-0.5">{agent.role}</p>
          </div>
        </div>
        <StatusDot status={agent.status} />
      </div>

      {agent.currentTask ? (
        <p className="text-xs text-[var(--wiring-text-secondary)] truncate mb-3 pl-0.5">
          {agent.currentTask}
        </p>
      ) : (
        <p className="text-xs text-[var(--wiring-text-tertiary)] mb-3 pl-0.5">대기 중</p>
      )}

      <div className="flex items-center justify-between text-[11px] text-[var(--wiring-text-tertiary)]">
        <div className="flex items-center gap-1">
          <DollarSign className="w-3 h-3" />
          <span>${(agent.todayCostUsd ?? 0).toFixed(1)}</span>
        </div>
        <div className="flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" />
          <span>{agent.todayCompletedTickets ?? 0}건</span>
        </div>
        {agent.primaryModel && (
          <div
            className="px-1.5 py-0.5 rounded text-[10px] font-medium text-white"
            style={{ backgroundColor: MODEL_COLORS[agent.primaryModel] ?? "#555" }}
          >
            {agent.primaryModel.split("-").slice(0, 2).join("-")}
          </div>
        )}
      </div>
    </button>
  );
}

// ─── 소통 피드 ───
function CommFeed({ agentId }: { agentId: string | null }) {
  const messages = agentId
    ? DUMMY_AGENT_MESSAGES.filter((m) => m.fromAgent === agentId || m.toAgent === agentId)
    : DUMMY_AGENT_MESSAGES;

  const sorted = [...messages].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const allAgents = useAgentStore.getState().agents;
  function getAgent(id: string) {
    return allAgents.find((a) => a.id === id);
  }

  function formatTime(ts: string) {
    const d = new Date(ts);
    return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
  }

  return (
    <div className="space-y-3">
      {sorted.map((msg) => {
        const from = getAgent(msg.fromAgent);
        const to = getAgent(msg.toAgent);
        return (
          <div key={msg.id} className="flex gap-2.5">
            <Avatar className="w-6 h-6 shrink-0 mt-0.5">
              <AvatarFallback
                className="text-[9px] font-bold text-white"
                style={{ backgroundColor: from?.color ?? "#555" }}
              >
                {from?.avatar ?? msg.fromAgent}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-[11px] font-medium" style={{ color: from?.color ?? "var(--wiring-text-secondary)" }}>
                  {from?.name ?? msg.fromAgent}
                </span>
                <ChevronRight className="w-3 h-3 text-[var(--wiring-text-tertiary)]" />
                <span className="text-[11px] text-[var(--wiring-text-tertiary)]">
                  {to?.name ?? msg.toAgent}
                </span>
                <span className="ml-auto text-[10px] text-[var(--wiring-text-tertiary)] shrink-0">
                  {formatTime(msg.timestamp)}
                </span>
              </div>
              <p className="text-xs text-[var(--wiring-text-secondary)] leading-relaxed">{msg.content}</p>
              {msg.ticketId && (
                <span className="text-[10px] text-[var(--wiring-text-tertiary)] mt-0.5 block">
                  #{msg.ticketId}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── 에이전트 상세 패널 ───
function AgentDetailPanel({ agent }: { agent: Agent }) {
  const history = DUMMY_AGENT_WORK_HISTORY.filter((h) => h.agentId === agent.id);
  const messages = DUMMY_AGENT_MESSAGES.filter(
    (m) => m.fromAgent === agent.id || m.toAgent === agent.id
  ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const allAgents = useAgentStore.getState().agents;
  function getAgent(id: string) { return allAgents.find((a) => a.id === id); }
  function formatTime(ts: string) {
    const d = new Date(ts);
    return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
  }

  const totalCost = history.reduce((s, h) => s + (h.costUsd ?? 0), 0);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 p-5 border-b border-[var(--wiring-glass-border)]">
        <Avatar className="w-11 h-11 shrink-0">
          <AvatarFallback
            className="text-sm font-bold text-white"
            style={{ backgroundColor: agent.color }}
          >
            {agent.avatar}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-[var(--wiring-text-primary)]">{agent.name}</h3>
            <StatusDot status={agent.status} />
          </div>
          <p className="text-xs text-[var(--wiring-text-tertiary)] mt-0.5">{agent.role}</p>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-5 space-y-5">
          {/* 오늘 통계 */}
          <div className="grid grid-cols-3 gap-3">
            <div className="glass-panel p-3 text-center">
              <DollarSign className="w-4 h-4 mx-auto mb-1 text-[var(--wiring-text-tertiary)]" />
              <p className="text-sm font-semibold text-[var(--wiring-text-primary)]">${agent.todayCostUsd?.toFixed(1)}</p>
              <p className="text-[10px] text-[var(--wiring-text-tertiary)]">오늘 비용</p>
            </div>
            <div className="glass-panel p-3 text-center">
              <CheckCircle2 className="w-4 h-4 mx-auto mb-1 text-[var(--wiring-text-tertiary)]" />
              <p className="text-sm font-semibold text-[var(--wiring-text-primary)]">{agent.todayCompletedTickets}</p>
              <p className="text-[10px] text-[var(--wiring-text-tertiary)]">완료 티켓</p>
            </div>
            <div className="glass-panel p-3 text-center">
              <Zap className="w-4 h-4 mx-auto mb-1 text-[var(--wiring-text-tertiary)]" />
              <p
                className="text-[11px] font-semibold"
                style={{ color: MODEL_COLORS[agent.primaryModel ?? ""] ?? "var(--wiring-text-secondary)" }}
              >
                {agent.primaryModel?.split("-").slice(0, 2).join("-") ?? "—"}
              </p>
              <p className="text-[10px] text-[var(--wiring-text-tertiary)]">주 모델</p>
            </div>
          </div>

          {/* 현재 작업 */}
          {agent.currentTask && (
            <div>
              <p className="text-xs font-medium text-[var(--wiring-text-tertiary)] uppercase mb-2">현재 작업</p>
              <div className="glass-panel p-3 flex items-start gap-2">
                <Activity className="w-4 h-4 text-[var(--wiring-success)] shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-[var(--wiring-text-primary)]">{agent.currentTask}</p>
                  {agent.currentTicketId && (
                    <p className="text-[11px] text-[var(--wiring-text-tertiary)] mt-0.5">#{agent.currentTicketId}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          <Separator className="bg-[var(--wiring-glass-border)]" />

          {/* 작업 이력 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-[var(--wiring-text-tertiary)] uppercase">작업 이력</p>
              <span className="text-[11px] text-[var(--wiring-text-tertiary)]">누적 ${totalCost.toFixed(1)}</span>
            </div>
            {history.length === 0 ? (
              <p className="text-xs text-[var(--wiring-text-tertiary)]">이력 없음</p>
            ) : (
              <div className="space-y-2">
                {history.map((h) => (
                  <div key={h.id} className="glass-panel p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-[var(--wiring-text-primary)] truncate">{h.ticketTitle}</p>
                        <p className="text-[11px] text-[var(--wiring-text-secondary)] mt-0.5">{h.action}</p>
                      </div>
                      <div className="text-right shrink-0">
                        {h.costUsd && <p className="text-[11px] text-[var(--wiring-text-tertiary)]">${h.costUsd.toFixed(1)}</p>}
                        {h.durationMin && (
                          <p className="text-[10px] text-[var(--wiring-text-tertiary)] flex items-center gap-0.5 justify-end">
                            <Clock className="w-2.5 h-2.5" />{h.durationMin}분
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Separator className="bg-[var(--wiring-glass-border)]" />

          {/* 소통 로그 */}
          <div>
            <p className="text-xs font-medium text-[var(--wiring-text-tertiary)] uppercase mb-3">
              소통 로그 ({messages.length})
            </p>
            {messages.length === 0 ? (
              <p className="text-xs text-[var(--wiring-text-tertiary)]">소통 이력 없음</p>
            ) : (
              <div className="space-y-3">
                {messages.map((msg) => {
                  const from = getAgent(msg.fromAgent);
                  const to = getAgent(msg.toAgent);
                  const isFrom = msg.fromAgent === agent.id;
                  return (
                    <div key={msg.id} className="flex gap-2">
                      <Avatar className="w-5 h-5 shrink-0 mt-0.5">
                        <AvatarFallback
                          className="text-[8px] font-bold text-white"
                          style={{ backgroundColor: from?.color ?? "#555" }}
                        >
                          {from?.avatar ?? msg.fromAgent}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 mb-0.5">
                          <span
                            className="text-[10px] font-medium"
                            style={{ color: isFrom ? agent.color : "var(--wiring-text-tertiary)" }}
                          >
                            {isFrom ? "나" : from?.name}
                          </span>
                          <ChevronRight className="w-2.5 h-2.5 text-[var(--wiring-text-tertiary)]" />
                          <span className="text-[10px] text-[var(--wiring-text-tertiary)]">
                            {msg.toAgent === agent.id ? "나" : to?.name}
                          </span>
                          <span className="ml-auto text-[10px] text-[var(--wiring-text-tertiary)] shrink-0">
                            {formatTime(msg.timestamp)}
                          </span>
                        </div>
                        <p className="text-[11px] text-[var(--wiring-text-secondary)] leading-relaxed">{msg.content}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}

// ─── 메인 페이지 ───
export default function AgentsPage() {
  const { agents } = useAgentStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [feedTab, setFeedTab] = useState<"all" | "agent">("all");

  const selectedAgent = agents.find((a) => a.id === selectedId) ?? null;
  const activeCount = agents.filter((a) => a.status === "active").length;
  const idleCount = agents.filter((a) => a.status === "idle").length;
  const totalCost = getTotalTodayCost(agents);

  return (
    <div className="flex h-full overflow-hidden">
      {/* ─── 왼쪽: 메인 콘텐츠 ─── */}
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        <ScrollArea className="flex-1">
          <div className="p-6 space-y-6">
            {/* 상단 KPI */}
            <div>
              <h1 className="text-xl font-semibold text-[var(--wiring-text-primary)] mb-4">에이전트 현황</h1>
              <div className="grid grid-cols-4 gap-3">
                <div className="glass-panel p-4">
                  <p className="text-xs text-[var(--wiring-text-tertiary)] mb-1">전체 에이전트</p>
                  <p className="text-2xl font-bold text-[var(--wiring-text-primary)]">{agents.length}</p>
                </div>
                <div className="glass-panel p-4">
                  <p className="text-xs text-[var(--wiring-text-tertiary)] mb-1">활성</p>
                  <p className="text-2xl font-bold" style={{ color: "var(--wiring-success)" }}>{activeCount}</p>
                </div>
                <div className="glass-panel p-4">
                  <p className="text-xs text-[var(--wiring-text-tertiary)] mb-1">대기</p>
                  <p className="text-2xl font-bold text-[var(--wiring-text-secondary)]">{idleCount}</p>
                </div>
                <div className="glass-panel p-4">
                  <p className="text-xs text-[var(--wiring-text-tertiary)] mb-1">오늘 총 비용</p>
                  <p className="text-2xl font-bold text-[var(--wiring-text-primary)]">${totalCost.toFixed(1)}</p>
                </div>
              </div>
            </div>

            {/* 에이전트 그리드 */}
            <div>
              <p className="text-xs font-medium text-[var(--wiring-text-tertiary)] uppercase mb-3">에이전트</p>
              <div className="grid grid-cols-3 gap-3">
                {agents.map((agent) => (
                  <AgentCard
                    key={agent.id}
                    agent={agent}
                    selected={selectedId === agent.id}
                    onClick={() => setSelectedId(selectedId === agent.id ? null : agent.id)}
                  />
                ))}
              </div>
            </div>

            {/* 소통 피드 */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <MessageSquare className="w-4 h-4 text-[var(--wiring-text-tertiary)]" />
                <p className="text-xs font-medium text-[var(--wiring-text-tertiary)] uppercase">소통 피드</p>
                <div className="ml-auto flex gap-1">
                  <button
                    onClick={() => setFeedTab("all")}
                    className={`px-2.5 py-1 rounded text-xs transition-colors ${
                      feedTab === "all"
                        ? "bg-[var(--wiring-accent)] text-white"
                        : "text-[var(--wiring-text-tertiary)] hover:text-[var(--wiring-text-secondary)]"
                    }`}
                  >
                    전체
                  </button>
                  {selectedAgent && (
                    <button
                      onClick={() => setFeedTab("agent")}
                      className={`px-2.5 py-1 rounded text-xs transition-colors ${
                        feedTab === "agent"
                          ? "bg-[var(--wiring-accent)] text-white"
                          : "text-[var(--wiring-text-tertiary)] hover:text-[var(--wiring-text-secondary)]"
                      }`}
                    >
                      {selectedAgent.name}
                    </button>
                  )}
                </div>
              </div>
              <div className="glass-panel p-4">
                <CommFeed agentId={feedTab === "agent" && selectedAgent ? selectedAgent.id : null} />
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* ─── 오른쪽: 에이전트 상세 패널 ─── */}
      {selectedAgent && (
        <div className="w-80 shrink-0 border-l border-[var(--wiring-glass-border)] bg-[var(--wiring-bg-secondary)]">
          <AgentDetailPanel agent={selectedAgent} />
        </div>
      )}
    </div>
  );
}
