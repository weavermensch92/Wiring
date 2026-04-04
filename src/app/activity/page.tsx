"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { EmptyState } from "@/components/ui/empty-state";
import { DUMMY_ACTIVITIES, ActivityEntry, ActivityType } from "@/dummy/activity";
import { DUMMY_TEAMS } from "@/dummy/teams";
import { AGENT_COLORS } from "@/lib/constants";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Activity, Ticket, CheckCircle2, AlertTriangle, Bot,
  Rocket, MessageSquare, UserPlus, ArrowRight, Filter,
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

function formatAbsTime(iso: string): string {
  const d = new Date(iso);
  return `${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getDate().toString().padStart(2, "0")} ${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
}

// ─── 타입 설정 ───
const TYPE_CONFIG: Record<ActivityType, { label: string; icon: React.ReactNode; color: string }> = {
  ticket_created:  { label: "티켓 생성",   icon: <Ticket className="w-3.5 h-3.5" />,       color: "var(--wiring-info)" },
  ticket_moved:    { label: "상태 변경",   icon: <ArrowRight className="w-3.5 h-3.5" />,   color: "var(--wiring-accent)" },
  ticket_done:     { label: "완료",        icon: <CheckCircle2 className="w-3.5 h-3.5" />, color: "var(--wiring-success)" },
  hitl_requested:  { label: "HITL 요청",   icon: <AlertTriangle className="w-3.5 h-3.5" />,color: "var(--hitl-waiting)" },
  hitl_approved:   { label: "HITL 승인",   icon: <CheckCircle2 className="w-3.5 h-3.5" />, color: "var(--wiring-success)" },
  hitl_rejected:   { label: "HITL 반려",   icon: <AlertTriangle className="w-3.5 h-3.5" />,color: "var(--wiring-danger)" },
  agent_action:    { label: "에이전트 작업",icon: <Bot className="w-3.5 h-3.5" />,          color: "#8B5CF6" },
  deploy:          { label: "배포",        icon: <Rocket className="w-3.5 h-3.5" />,       color: "#10B981" },
  comment:         { label: "댓글",        icon: <MessageSquare className="w-3.5 h-3.5" />,color: "var(--wiring-text-secondary)" },
  member_join:     { label: "팀원 합류",   icon: <UserPlus className="w-3.5 h-3.5" />,     color: "var(--wiring-info)" },
};

type FilterTab = "all" | "my" | "agent" | "hitl" | "deploy";

const FILTER_TABS: { id: FilterTab; label: string }[] = [
  { id: "all", label: "전체" },
  { id: "my", label: "내 활동" },
  { id: "agent", label: "에이전트" },
  { id: "hitl", label: "HITL" },
  { id: "deploy", label: "배포" },
];

function matchFilter(item: ActivityEntry, filter: FilterTab): boolean {
  switch (filter) {
    case "my":     return item.actorType === "human";
    case "agent":  return item.actorType === "agent";
    case "hitl":   return item.type.startsWith("hitl_");
    case "deploy": return item.type === "deploy";
    default:       return true;
  }
}

// ─── 활동 카드 ───
function ActivityCard({ entry }: { entry: ActivityEntry }) {
  const cfg = TYPE_CONFIG[entry.type];
  const team = DUMMY_TEAMS.find((t) => t.id === entry.teamId);
  const agentColor = entry.actorType === "agent"
    ? (AGENT_COLORS[entry.actorId as keyof typeof AGENT_COLORS] ?? "#888")
    : "var(--wiring-info)";

  return (
    <div className="flex gap-3 py-4 border-b border-[var(--wiring-glass-border)] last:border-0 group">
      {/* Timeline dot */}
      <div className="flex flex-col items-center gap-1 shrink-0 pt-0.5">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${cfg.color}18`, color: cfg.color }}
        >
          {cfg.icon}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3 mb-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="text-[10px] px-1.5 py-0.5 rounded font-medium"
              style={{ backgroundColor: `${cfg.color}18`, color: cfg.color }}
            >
              {cfg.label}
            </span>
            {team && (
              <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ backgroundColor: `${team.color}18`, color: team.color }}>
                {team.name}
              </span>
            )}
          </div>
          <span className="text-[10px] text-[var(--wiring-text-tertiary)] shrink-0">{timeAgo(entry.timestamp)}</span>
        </div>

        <p className="text-sm font-medium text-[var(--wiring-text-primary)] mb-0.5">{entry.title}</p>
        <p className="text-xs text-[var(--wiring-text-secondary)] leading-relaxed">{entry.body}</p>

        {/* Meta tags */}
        {entry.meta && Object.keys(entry.meta).length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {Object.entries(entry.meta).map(([k, v]) => (
              <span key={k} className="text-[10px] px-2 py-0.5 rounded bg-[var(--wiring-glass-bg)] border border-[var(--wiring-glass-border)] text-[var(--wiring-text-tertiary)]">
                {k}: {v}
              </span>
            ))}
          </div>
        )}

        {/* Actor */}
        <div className="flex items-center gap-1.5 mt-2">
          <Avatar className="w-4 h-4">
            <AvatarFallback className="text-[7px] font-bold text-white" style={{ backgroundColor: agentColor }}>
              {entry.actorName.slice(0, 1)}
            </AvatarFallback>
          </Avatar>
          <span className="text-[10px] text-[var(--wiring-text-tertiary)]">{entry.actorName}</span>
          <span className="text-[10px] text-[var(--wiring-text-tertiary)]">·</span>
          <span className="text-[10px] text-[var(--wiring-text-tertiary)]">{formatAbsTime(entry.timestamp)}</span>
        </div>
      </div>
    </div>
  );
}

// ─── 날짜 그룹 헤더 ───
function DateGroupHeader({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 py-2 sticky top-0 bg-[var(--wiring-bg-primary)] z-10">
      <span className="text-xs font-medium text-[var(--wiring-text-tertiary)] uppercase tracking-wider">{label}</span>
      <div className="flex-1 h-px bg-[var(--wiring-glass-border)]" />
    </div>
  );
}

function getDateLabel(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return "오늘";
  if (d.toDateString() === yesterday.toDateString()) return "어제";
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
}

export default function ActivityPage() {
  const [filter, setFilter] = useState<FilterTab>("all");

  const filtered = useMemo(
    () => [...DUMMY_ACTIVITIES]
      .filter((a) => matchFilter(a, filter))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
    [filter]
  );

  // 날짜별 그룹화
  const grouped = useMemo(() => {
    const groups: { label: string; items: ActivityEntry[] }[] = [];
    let currentLabel = "";
    filtered.forEach((entry) => {
      const label = getDateLabel(entry.timestamp);
      if (label !== currentLabel) {
        currentLabel = label;
        groups.push({ label, items: [] });
      }
      groups[groups.length - 1].items.push(entry);
    });
    return groups;
  }, [filtered]);

  // KPI
  const today = DUMMY_ACTIVITIES.filter((a) => getDateLabel(a.timestamp) === "오늘");
  const agentActions = today.filter((a) => a.actorType === "agent").length;
  const humanActions = today.filter((a) => a.actorType === "human").length;
  const hitlEvents = today.filter((a) => a.type.startsWith("hitl_")).length;
  const deploys = today.filter((a) => a.type === "deploy").length;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="shrink-0 px-6 py-4 border-b border-[var(--wiring-glass-border)]">
        <div className="flex items-center gap-3 mb-4">
          <Activity className="w-5 h-5 text-[var(--wiring-accent)]" />
          <h1 className="text-xl font-semibold text-[var(--wiring-text-primary)]">활동 로그</h1>
          <span className="text-xs text-[var(--wiring-text-tertiary)] ml-auto">{filtered.length}개 항목</span>
        </div>

        {/* KPI */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          {[
            { label: "에이전트 활동", value: agentActions, color: "#8B5CF6" },
            { label: "사람 활동", value: humanActions, color: "var(--wiring-info)" },
            { label: "HITL 이벤트", value: hitlEvents, color: "var(--hitl-waiting)" },
            { label: "배포", value: deploys, color: "#10B981" },
          ].map((kpi) => (
            <div key={kpi.label} className="glass-panel p-3">
              <p className="text-lg font-bold" style={{ color: kpi.color }}>{kpi.value}</p>
              <p className="text-xs text-[var(--wiring-text-tertiary)]">{kpi.label}</p>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1">
          {FILTER_TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setFilter(t.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors ${
                filter === t.id
                  ? "bg-[var(--wiring-accent)] text-white font-medium"
                  : "text-[var(--wiring-text-secondary)] hover:bg-[var(--wiring-glass-hover)]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <ScrollArea className="flex-1">
        <div className="px-6 pb-6">
          {grouped.length === 0 ? (
            <EmptyState
              icon={<Activity className="w-10 h-10" />}
              title="활동 내역이 없습니다"
              description={filter !== "all" ? "해당 필터에 맞는 활동이 없습니다" : "아직 기록된 활동이 없습니다"}
              action={filter !== "all" ? { label: "전체 보기", onClick: () => setFilter("all") } : undefined}
            />
          ) : (
            grouped.map((group) => (
              <div key={group.label}>
                <DateGroupHeader label={group.label} />
                <div className="glass-panel px-4">
                  {group.items.map((entry) => (
                    <ActivityCard key={entry.id} entry={entry} />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
