"use client";

import { useState, useMemo, useCallback } from "react";
import { useAgentStore } from "@/stores/agent-store";
import { DUMMY_AGENT_MESSAGES, DUMMY_AGENT_WORK_HISTORY } from "@/dummy/agents";
import { DUMMY_AGENT_DAILY_COST, DUMMY_MODEL_USAGE, DUMMY_AGENT_EFFICIENCY } from "@/dummy/analytics";
import { Agent } from "@/types/agent";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { AGENT_COLORS } from "@/lib/constants";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  ReactFlow, Background, Controls, MiniMap,
  Handle, Position, NodeTypes,
  type Node, type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  Activity, MessageSquare, Zap, DollarSign, CheckCircle2, Clock,
  ChevronRight, BarChart3, Bot, Network,
} from "lucide-react";

// ─── 모델 색상 ───
const MODEL_COLORS: Record<string, string> = {
  "claude-sonnet-4": "#8B5CF6",
  "claude-haiku": "#A78BFA",
  "gpt-4o": "#10B981",
  "gemini-2.0-flash": "#3B82F6",
};

const CHART_COLORS = {
  grid: "rgba(255,255,255,0.06)",
  text: "#9494A8",
};

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-panel p-2.5" style={{ fontSize: 11 }}>
      <p className="text-[var(--wiring-text-tertiary)] mb-1">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
          <span className="text-[var(--wiring-text-secondary)]">{p.name}:</span>
          <span className="font-medium text-[var(--wiring-text-primary)]">{p.value}</span>
        </div>
      ))}
    </div>
  );
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
      <span
        className={`w-1.5 h-1.5 rounded-full ${status === "active" ? "animate-pulse" : ""}`}
        style={{ backgroundColor: colors[status] }}
      />
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
            <AvatarFallback className="text-xs font-bold text-white" style={{ backgroundColor: agent.color }}>
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
        <p className="text-xs text-[var(--wiring-text-secondary)] truncate mb-3">{agent.currentTask}</p>
      ) : (
        <p className="text-xs text-[var(--wiring-text-tertiary)] mb-3">대기 중</p>
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
  const sorted = [...messages].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  const allAgents = useAgentStore.getState().agents;
  const getAgent = (id: string) => allAgents.find((a) => a.id === id);
  const fmt = (ts: string) => {
    const d = new Date(ts);
    return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
  };
  return (
    <div className="space-y-3">
      {sorted.map((msg) => {
        const from = getAgent(msg.fromAgent);
        const to = getAgent(msg.toAgent);
        return (
          <div key={msg.id} className="flex gap-2.5">
            <Avatar className="w-6 h-6 shrink-0 mt-0.5">
              <AvatarFallback className="text-[9px] font-bold text-white" style={{ backgroundColor: from?.color ?? "#555" }}>
                {from?.avatar ?? msg.fromAgent}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-[11px] font-medium" style={{ color: from?.color ?? "var(--wiring-text-secondary)" }}>
                  {from?.name ?? msg.fromAgent}
                </span>
                <ChevronRight className="w-3 h-3 text-[var(--wiring-text-tertiary)]" />
                <span className="text-[11px] text-[var(--wiring-text-tertiary)]">{to?.name ?? msg.toAgent}</span>
                <span className="ml-auto text-[10px] text-[var(--wiring-text-tertiary)] shrink-0">{fmt(msg.timestamp)}</span>
              </div>
              <p className="text-xs text-[var(--wiring-text-secondary)] leading-relaxed">{msg.content}</p>
              {msg.ticketId && <span className="text-[10px] text-[var(--wiring-text-tertiary)] mt-0.5 block">#{msg.ticketId}</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── 상세 패널 ───
function AgentDetailPanel({ agent }: { agent: Agent }) {
  const history = DUMMY_AGENT_WORK_HISTORY.filter((h) => h.agentId === agent.id);
  const messages = DUMMY_AGENT_MESSAGES
    .filter((m) => m.fromAgent === agent.id || m.toAgent === agent.id)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  const allAgents = useAgentStore.getState().agents;
  const getAgent = (id: string) => allAgents.find((a) => a.id === id);
  const fmt = (ts: string) => {
    const d = new Date(ts);
    return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
  };
  const totalCost = history.reduce((s, h) => s + (h.costUsd ?? 0), 0);
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 p-5 border-b border-[var(--wiring-glass-border)]">
        <Avatar className="w-11 h-11 shrink-0">
          <AvatarFallback className="text-sm font-bold text-white" style={{ backgroundColor: agent.color }}>{agent.avatar}</AvatarFallback>
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
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: <DollarSign className="w-4 h-4" />, val: `$${agent.todayCostUsd?.toFixed(1)}`, label: "오늘 비용" },
              { icon: <CheckCircle2 className="w-4 h-4" />, val: agent.todayCompletedTickets, label: "완료" },
              { icon: <Zap className="w-4 h-4" />, val: agent.primaryModel?.split("-").slice(0, 2).join("-") ?? "—", label: "모델" },
            ].map((item) => (
              <div key={item.label} className="glass-panel p-3 text-center">
                <div className="flex justify-center mb-1 text-[var(--wiring-text-tertiary)]">{item.icon}</div>
                <p className="text-sm font-semibold text-[var(--wiring-text-primary)]">{item.val}</p>
                <p className="text-[10px] text-[var(--wiring-text-tertiary)]">{item.label}</p>
              </div>
            ))}
          </div>
          {agent.currentTask && (
            <div>
              <p className="text-xs font-medium text-[var(--wiring-text-tertiary)] uppercase mb-2">현재 작업</p>
              <div className="glass-panel p-3 flex items-start gap-2">
                <Activity className="w-4 h-4 text-[var(--wiring-success)] shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-[var(--wiring-text-primary)]">{agent.currentTask}</p>
                  {agent.currentTicketId && <p className="text-[11px] text-[var(--wiring-text-tertiary)] mt-0.5">#{agent.currentTicketId}</p>}
                </div>
              </div>
            </div>
          )}
          <Separator className="bg-[var(--wiring-glass-border)]" />
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-[var(--wiring-text-tertiary)] uppercase">작업 이력</p>
              <span className="text-[11px] text-[var(--wiring-text-tertiary)]">누적 ${totalCost.toFixed(1)}</span>
            </div>
            {history.length === 0 ? <p className="text-xs text-[var(--wiring-text-tertiary)]">이력 없음</p> : (
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
          <div>
            <p className="text-xs font-medium text-[var(--wiring-text-tertiary)] uppercase mb-3">소통 로그 ({messages.length})</p>
            {messages.length === 0 ? <p className="text-xs text-[var(--wiring-text-tertiary)]">이력 없음</p> : (
              <div className="space-y-3">
                {messages.map((msg) => {
                  const from = getAgent(msg.fromAgent);
                  const to = getAgent(msg.toAgent);
                  const isFrom = msg.fromAgent === agent.id;
                  return (
                    <div key={msg.id} className="flex gap-2">
                      <Avatar className="w-5 h-5 shrink-0 mt-0.5">
                        <AvatarFallback className="text-[8px] font-bold text-white" style={{ backgroundColor: from?.color ?? "#555" }}>
                          {from?.avatar ?? msg.fromAgent}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 mb-0.5">
                          <span className="text-[10px] font-medium" style={{ color: isFrom ? agent.color : "var(--wiring-text-tertiary)" }}>
                            {isFrom ? "나" : from?.name}
                          </span>
                          <ChevronRight className="w-2.5 h-2.5 text-[var(--wiring-text-tertiary)]" />
                          <span className="text-[10px] text-[var(--wiring-text-tertiary)]">{msg.toAgent === agent.id ? "나" : to?.name}</span>
                          <span className="ml-auto text-[10px] text-[var(--wiring-text-tertiary)] shrink-0">{fmt(msg.timestamp)}</span>
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

// ─── 토폴로지 노드 ───
function AgentTopoNode({ data }: { data: { agent: Agent; messageCount: number } }) {
  const { agent, messageCount } = data;
  return (
    <div
      className="glass-panel px-3 py-2 flex flex-col items-center gap-1.5 cursor-pointer transition-all hover:scale-105"
      style={{
        borderColor: agent.status === "active" ? agent.color : "rgba(255,255,255,0.06)",
        minWidth: 80,
      }}
    >
      <Handle type="target" position={Position.Left} style={{ background: agent.color, width: 8, height: 8 }} />
      <Avatar className="w-8 h-8">
        <AvatarFallback className="text-xs font-bold text-white" style={{ backgroundColor: agent.color }}>
          {agent.avatar}
        </AvatarFallback>
      </Avatar>
      <p className="text-[10px] font-medium text-[var(--wiring-text-primary)]">{agent.id}</p>
      {agent.status === "active" && (
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--wiring-success)] animate-pulse" />
      )}
      {messageCount > 0 && (
        <span
          className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-[9px] font-bold text-white flex items-center justify-center"
          style={{ backgroundColor: agent.color }}
        >
          {messageCount}
        </span>
      )}
      <Handle type="source" position={Position.Right} style={{ background: agent.color, width: 8, height: 8 }} />
    </div>
  );
}

const nodeTypes: NodeTypes = { agentNode: AgentTopoNode };

// ─── 토폴로지 뷰 ───
function AgentTopology({ agents }: { agents: Agent[] }) {
  const { nodes, edges } = useMemo(() => {
    // 메시지 카운트
    const msgCount: Record<string, number> = {};
    DUMMY_AGENT_MESSAGES.forEach((m) => {
      msgCount[m.fromAgent] = (msgCount[m.fromAgent] ?? 0) + 1;
    });

    // 원형 배치
    const count = agents.length;
    const radius = 180;
    const cx = 400, cy = 260;

    const nodes: Node[] = agents.map((agent, i) => {
      const angle = (i / count) * 2 * Math.PI - Math.PI / 2;
      return {
        id: agent.id,
        type: "agentNode",
        position: {
          x: cx + radius * Math.cos(angle) - 40,
          y: cy + radius * Math.sin(angle) - 40,
        },
        data: { agent, messageCount: msgCount[agent.id] ?? 0 },
      };
    });

    // 메시지 기반 엣지 (중복 제거, 강도 표시)
    const edgeMap: Record<string, number> = {};
    DUMMY_AGENT_MESSAGES.forEach((m) => {
      const key = `${m.fromAgent}-${m.toAgent}`;
      edgeMap[key] = (edgeMap[key] ?? 0) + 1;
    });

    const edges: Edge[] = Object.entries(edgeMap).map(([key, count]) => {
      const [source, target] = key.split("-");
      const fromAgent = agents.find((a) => a.id === source);
      return {
        id: key,
        source,
        target,
        animated: fromAgent?.status === "active",
        style: {
          stroke: fromAgent?.color ?? "#888",
          strokeWidth: Math.min(1 + count * 0.5, 3),
          opacity: 0.7,
        },
        label: count > 1 ? `${count}` : undefined,
        labelStyle: { fill: "#9494A8", fontSize: 9 },
        labelBgStyle: { fill: "#1A1A24", fillOpacity: 0.8 },
      };
    });

    return { nodes, edges };
  }, [agents]);

  return (
    <div className="h-full w-full" style={{ height: 520 }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
        style={{ backgroundColor: "transparent" }}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="rgba(255,255,255,0.04)" gap={20} />
        <Controls
          style={{ backgroundColor: "#1A1A24", border: "1px solid rgba(255,255,255,0.06)" }}
        />
      </ReactFlow>
    </div>
  );
}

// ─── 분석 탭 ───
function AgentAnalyticsTab() {
  const recentCost = DUMMY_AGENT_DAILY_COST.slice(-7);
  return (
    <div className="space-y-5">
      {/* 모델 분포 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass-panel p-4">
          <p className="text-sm font-semibold text-[var(--wiring-text-primary)] mb-3">모델 사용 분포</p>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="55%" height={140}>
              <PieChart>
                <Pie data={DUMMY_MODEL_USAGE} cx="50%" cy="50%" innerRadius={40} outerRadius={60} dataKey="value" paddingAngle={3}>
                  {DUMMY_MODEL_USAGE.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {DUMMY_MODEL_USAGE.map((m) => (
                <div key={m.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: m.color }} />
                    <span className="text-xs text-[var(--wiring-text-secondary)] truncate" style={{ maxWidth: 80 }}>{m.name.split("-").slice(0, 2).join("-")}</span>
                  </div>
                  <span className="text-xs font-medium text-[var(--wiring-text-primary)]">{m.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="glass-panel p-4">
          <p className="text-sm font-semibold text-[var(--wiring-text-primary)] mb-3">에이전트 효율 (완료/비용)</p>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={DUMMY_AGENT_EFFICIENCY} layout="vertical" style={{ fontSize: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} horizontal={false} />
              <XAxis type="number" tick={{ fill: CHART_COLORS.text, fontSize: 9 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="agent" tick={{ fill: CHART_COLORS.text, fontSize: 9 }} axisLine={false} tickLine={false} width={25} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="efficiency" name="효율" radius={[0, 3, 3, 0]}>
                {DUMMY_AGENT_EFFICIENCY.map((e, i) => (
                  <Cell key={i} fill={AGENT_COLORS[e.agent as keyof typeof AGENT_COLORS] ?? "#888"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 주간 비용 추이 */}
      <div className="glass-panel p-4">
        <p className="text-sm font-semibold text-[var(--wiring-text-primary)] mb-3">최근 7일 에이전트 비용</p>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={recentCost} style={{ fontSize: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
            <XAxis dataKey="date" tick={{ fill: CHART_COLORS.text, fontSize: 9 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: CHART_COLORS.text, fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 9, color: CHART_COLORS.text }} />
            {(["FE", "BE", "Dsn", "SM", "PM"] as const).map((id) => (
              <Line key={id} type="monotone" dataKey={id} name={id} stroke={AGENT_COLORS[id as keyof typeof AGENT_COLORS]} strokeWidth={1.5} dot={false} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ─── 메인 페이지 ───
type MainTab = "status" | "analytics" | "topology";

export default function AgentsPage() {
  const { agents } = useAgentStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [feedTab, setFeedTab] = useState<"all" | "agent">("all");
  const [mainTab, setMainTab] = useState<MainTab>("status");

  const selectedAgent = agents.find((a) => a.id === selectedId) ?? null;
  const activeCount = agents.filter((a) => a.status === "active").length;
  const idleCount = agents.filter((a) => a.status === "idle").length;
  const totalCost = agents.reduce((s, a) => s + (a.todayCostUsd ?? 0), 0);

  const TABS: { id: MainTab; label: string; icon: React.ReactNode }[] = [
    { id: "status", label: "현황", icon: <Activity className="w-3.5 h-3.5" /> },
    { id: "analytics", label: "분석", icon: <BarChart3 className="w-3.5 h-3.5" /> },
    { id: "topology", label: "토폴로지", icon: <Network className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="flex h-full overflow-hidden">
      {/* ─── 메인 영역 ─── */}
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        {/* Header + Tab */}
        <div className="shrink-0 px-6 pt-5 pb-3 border-b border-[var(--wiring-glass-border)]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Bot className="w-5 h-5 text-[var(--wiring-accent)]" />
              <h1 className="text-xl font-semibold text-[var(--wiring-text-primary)]">에이전트 현황</h1>
            </div>
          </div>
          {/* KPI */}
          <div className="grid grid-cols-4 gap-3 mb-4">
            {[
              { label: "전체", value: agents.length, color: "var(--wiring-accent)" },
              { label: "활성", value: activeCount, color: "var(--wiring-success)" },
              { label: "대기", value: idleCount, color: "var(--wiring-text-secondary)" },
              { label: "오늘 비용", value: `$${totalCost.toFixed(1)}`, color: "var(--wiring-warning)" },
            ].map((kpi) => (
              <div key={kpi.label} className="glass-panel p-3">
                <p className="text-xs text-[var(--wiring-text-tertiary)]">{kpi.label}</p>
                <p className="text-xl font-bold mt-0.5" style={{ color: kpi.color }}>{kpi.value}</p>
              </div>
            ))}
          </div>
          {/* Tabs */}
          <div className="flex gap-1">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setMainTab(t.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors ${
                  mainTab === t.id
                    ? "bg-[var(--wiring-accent)] text-white font-medium"
                    : "text-[var(--wiring-text-secondary)] hover:bg-[var(--wiring-glass-hover)]"
                }`}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-6">
            {/* ── 현황 탭 ── */}
            {mainTab === "status" && (
              <div className="space-y-5">
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
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <MessageSquare className="w-4 h-4 text-[var(--wiring-text-tertiary)]" />
                    <p className="text-xs font-medium text-[var(--wiring-text-tertiary)] uppercase">소통 피드</p>
                    <div className="ml-auto flex gap-1">
                      {(["all", "agent"] as const).map((t) => (
                        t === "agent" && !selectedAgent ? null : (
                          <button
                            key={t}
                            onClick={() => setFeedTab(t)}
                            className={`px-2.5 py-1 rounded text-xs transition-colors ${
                              feedTab === t
                                ? "bg-[var(--wiring-accent)] text-white"
                                : "text-[var(--wiring-text-tertiary)] hover:text-[var(--wiring-text-secondary)]"
                            }`}
                          >
                            {t === "all" ? "전체" : selectedAgent?.name}
                          </button>
                        )
                      ))}
                    </div>
                  </div>
                  <div className="glass-panel p-4">
                    <CommFeed agentId={feedTab === "agent" && selectedAgent ? selectedAgent.id : null} />
                  </div>
                </div>
              </div>
            )}

            {/* ── 분석 탭 ── */}
            {mainTab === "analytics" && <AgentAnalyticsTab />}

            {/* ── 토폴로지 탭 ── */}
            {mainTab === "topology" && (
              <div className="glass-panel overflow-hidden" style={{ height: 560 }}>
                <div className="px-4 py-3 border-b border-[var(--wiring-glass-border)] flex items-center gap-2">
                  <Network className="w-4 h-4 text-[var(--wiring-accent)]" />
                  <p className="text-sm font-semibold text-[var(--wiring-text-primary)]">에이전트 소통 토폴로지</p>
                  <p className="text-xs text-[var(--wiring-text-tertiary)] ml-2">메시지 수 기반 연결 강도</p>
                </div>
                <div style={{ height: 510 }}>
                  <AgentTopology agents={agents} />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* ─── 상세 패널 ─── */}
      {selectedAgent && mainTab === "status" && (
        <div className="w-80 shrink-0 border-l border-[var(--wiring-glass-border)] bg-[var(--wiring-bg-secondary)]">
          <AgentDetailPanel agent={selectedAgent} />
        </div>
      )}
    </div>
  );
}
