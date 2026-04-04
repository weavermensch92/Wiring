"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CURRENT_USER, DUMMY_USERS } from "@/dummy/users";
import { DUMMY_TEAMS } from "@/dummy/teams";
import { getAllTicketsForProject, DUMMY_EPICS } from "@/dummy/projects";
import { useHITLStore } from "@/stores/hitl-store";
import { DUMMY_ACTIVITIES } from "@/dummy/activity";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/stores/toast-store";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import {
  User, Mail, Shield, Users, CheckCircle2, AlertTriangle,
  Clock, Activity, Bell, BellOff, Ticket, ChevronRight,
} from "lucide-react";

const LEVEL_COLORS: Record<string, string> = {
  L1: "var(--wiring-info)",
  L2: "var(--wiring-accent)",
  L3: "#EC4899",
  L4: "#F97316",
};

const NOTIF_TYPES = [
  { key: "hitl_waiting",      label: "HITL 승인 요청",     defaultOn: true },
  { key: "ticket_assigned",   label: "티켓 배정",           defaultOn: true },
  { key: "ticket_done",       label: "티켓 완료",           defaultOn: false },
  { key: "agent_message",     label: "에이전트 메시지",     defaultOn: true },
  { key: "budget_alert",      label: "예산 경고",           defaultOn: true },
  { key: "external_proposal", label: "외주 제안",           defaultOn: false },
];

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-panel px-2.5 py-2 text-[11px]">
      {label && <p className="text-[var(--wiring-text-tertiary)] mb-1">{label}</p>}
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: p.fill }} />
          <span className="font-medium text-[var(--wiring-text-primary)]">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

type Tab = "overview" | "hitl" | "notifications";

export default function ProfilePage() {
  const router = useRouter();
  const { queueItems } = useHITLStore();
  const [tab, setTab] = useState<Tab>("overview");
  const [notifSettings, setNotifSettings] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(NOTIF_TYPES.map((n) => [n.key, n.defaultOn]))
  );

  const myTeams = DUMMY_TEAMS.filter((t) => t.memberIds.includes(CURRENT_USER.id));

  // 내 HITL 의결 히스토리
  const myDecisions = queueItems
    .filter((h) => h.decisionHistory?.some((d) => d.userId === CURRENT_USER.id))
    .flatMap((h) => (h.decisionHistory ?? []).filter((d) => d.userId === CURRENT_USER.id).map((d) => ({ ...d, hitlType: h.type })));

  const approvedCount = myDecisions.filter((d) => d.action === "approve").length;
  const rejectedCount = myDecisions.filter((d) => d.action === "reject").length;
  const escalatedCount = myDecisions.filter((d) => d.action === "escalate").length;

  // 내 활동 (사람 활동)
  const myActivities = DUMMY_ACTIVITIES
    .filter((a) => a.actorId === CURRENT_USER.id)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 8);

  // 팀별 티켓 통계
  const teamStats = myTeams.map((team) => {
    const projects = team.projectIds.map((id) => ({ id }));
    const tickets = projects.flatMap((p) =>
      (DUMMY_EPICS[p.id] ?? []).flatMap((e) => getAllTicketsForProject(p.id))
    );
    const humanTickets = tickets.filter((t) => t.assignedHuman?.id === CURRENT_USER.id);
    return {
      name: team.abbreviation,
      total: humanTickets.length,
      done: humanTickets.filter((t) => t.status === "done").length,
      fill: team.color,
    };
  });

  function timeAgo(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}분 전`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}시간 전`;
    return `${Math.floor(hours / 24)}일 전`;
  }

  const TABS: { id: Tab; label: string }[] = [
    { id: "overview", label: "개요" },
    { id: "hitl", label: "HITL 의결 이력" },
    { id: "notifications", label: "알림 설정" },
  ];

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-5">
          {/* Profile card */}
          <div className="glass-panel px-6 py-5 flex items-center gap-5">
            <Avatar className="w-16 h-16 shrink-0">
              <AvatarFallback
                className="text-xl font-bold text-white"
                style={{ backgroundColor: LEVEL_COLORS[CURRENT_USER.level] ?? "var(--wiring-accent)" }}
              >
                {CURRENT_USER.avatar}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-semibold text-[var(--wiring-text-primary)]">{CURRENT_USER.name}</h1>
              <p className="text-sm text-[var(--wiring-text-secondary)] mt-0.5">{CURRENT_USER.role}</p>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <div className="flex items-center gap-1.5 text-xs text-[var(--wiring-text-tertiary)]">
                  <Mail className="w-3.5 h-3.5" />{CURRENT_USER.email}
                </div>
                <span
                  className="text-xs px-2 py-0.5 rounded font-medium text-white"
                  style={{ backgroundColor: LEVEL_COLORS[CURRENT_USER.level] }}
                >
                  {CURRENT_USER.level}
                </span>
                <div className="flex items-center gap-1.5 text-xs text-[var(--wiring-text-tertiary)]">
                  <Users className="w-3.5 h-3.5" />{myTeams.length}개 팀 소속
                </div>
                <button
                  onClick={() => { (window as any).__startWiringTour?.(); }}
                  className="text-xs text-[var(--wiring-accent)] hover:underline"
                >
                  가이드 투어 다시 보기
                </button>
              </div>
            </div>
          </div>

          {/* KPI */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "소속 팀", value: myTeams.length, icon: <Users className="w-4 h-4" />, color: "var(--wiring-info)" },
              { label: "HITL 승인", value: approvedCount, icon: <CheckCircle2 className="w-4 h-4" />, color: "var(--wiring-success)" },
              { label: "HITL 반려", value: rejectedCount, icon: <AlertTriangle className="w-4 h-4" />, color: "var(--wiring-danger)" },
              { label: "내 활동", value: myActivities.length, icon: <Activity className="w-4 h-4" />, color: "var(--wiring-accent)" },
            ].map((kpi) => (
              <div key={kpi.label} className="glass-panel p-3.5 flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${kpi.color}18`, color: kpi.color }}>{kpi.icon}</div>
                <div>
                  <p className="text-lg font-bold text-[var(--wiring-text-primary)]">{kpi.value}</p>
                  <p className="text-[10px] text-[var(--wiring-text-tertiary)]">{kpi.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-1">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${tab === t.id ? "bg-[var(--wiring-accent)] text-white font-medium" : "text-[var(--wiring-text-secondary)] hover:bg-[var(--wiring-glass-hover)]"}`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* ── 개요 탭 ── */}
          {tab === "overview" && (
            <div className="space-y-5">
              {/* 소속 팀 */}
              <div className="glass-panel p-4">
                <p className="text-sm font-semibold text-[var(--wiring-text-primary)] mb-3">소속 팀</p>
                <div className="space-y-2">
                  {myTeams.map((team) => (
                    <button
                      key={team.id}
                      onClick={() => router.push(`/team/${team.id}`)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[var(--wiring-glass-hover)] transition-colors text-left"
                    >
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0" style={{ backgroundColor: team.color + "20", color: team.color }}>
                        {team.abbreviation}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[var(--wiring-text-primary)]">{team.name}</p>
                        <p className="text-xs text-[var(--wiring-text-tertiary)]">{team.description}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[var(--wiring-text-tertiary)] shrink-0" />
                    </button>
                  ))}
                </div>
              </div>

              {/* 팀별 티켓 차트 */}
              {teamStats.some((s) => s.total > 0) && (
                <div className="glass-panel p-4">
                  <p className="text-sm font-semibold text-[var(--wiring-text-primary)] mb-3">팀별 배정 티켓</p>
                  <ResponsiveContainer width="100%" height={140}>
                    <BarChart data={teamStats} style={{ fontSize: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                      <XAxis dataKey="name" tick={{ fill: "#9494A8", fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: "#9494A8", fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="total" name="전체" radius={[4, 4, 0, 0]}>
                        {teamStats.map((e, i) => <Cell key={i} fill={e.fill} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* 최근 활동 */}
              <div className="glass-panel p-4">
                <p className="text-sm font-semibold text-[var(--wiring-text-primary)] mb-3">최근 내 활동</p>
                {myActivities.length === 0 ? (
                  <p className="text-xs text-[var(--wiring-text-tertiary)]">활동 내역이 없습니다</p>
                ) : (
                  <div className="space-y-2.5">
                    {myActivities.map((act) => (
                      <div key={act.id} className="flex items-start gap-2.5 py-1.5 border-b border-[var(--wiring-glass-border)] last:border-0">
                        <Activity className="w-3.5 h-3.5 text-[var(--wiring-accent)] shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-[var(--wiring-text-primary)]">{act.title}</p>
                          <p className="text-[10px] text-[var(--wiring-text-tertiary)] truncate">{act.body}</p>
                        </div>
                        <span className="text-[10px] text-[var(--wiring-text-tertiary)] shrink-0">{timeAgo(act.timestamp)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── HITL 의결 이력 탭 ── */}
          {tab === "hitl" && (
            <div className="glass-panel overflow-hidden">
              <div className="px-4 py-3 border-b border-[var(--wiring-glass-border)] flex items-center justify-between">
                <p className="text-sm font-semibold text-[var(--wiring-text-primary)]">HITL 의결 이력</p>
                <div className="flex items-center gap-3 text-xs text-[var(--wiring-text-tertiary)]">
                  <span className="text-[var(--wiring-success)]">승인 {approvedCount}</span>
                  <span className="text-[var(--wiring-danger)]">반려 {rejectedCount}</span>
                  <span className="text-[var(--wiring-warning)]">에스컬 {escalatedCount}</span>
                </div>
              </div>
              {myDecisions.length === 0 ? (
                <div className="p-8 text-center">
                  <Shield className="w-8 h-8 text-[var(--wiring-text-tertiary)] mx-auto mb-2" />
                  <p className="text-sm text-[var(--wiring-text-tertiary)]">의결 이력이 없습니다</p>
                </div>
              ) : (
                <div className="divide-y divide-[var(--wiring-glass-border)]">
                  {myDecisions.map((d) => {
                    const actionColors: Record<string, string> = { approve: "var(--wiring-success)", reject: "var(--wiring-danger)", escalate: "var(--wiring-warning)", delegate: "var(--wiring-info)" };
                    const actionLabels: Record<string, string> = { approve: "승인", reject: "반려", escalate: "에스컬레이션", delegate: "위임" };
                    return (
                      <div key={d.id} className="flex items-center gap-3 px-4 py-3">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: actionColors[d.action] ?? "#888" }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-[var(--wiring-text-primary)]">{d.hitlType?.replace(/_/g, " ").toUpperCase()}</p>
                          {d.reason && <p className="text-[10px] text-[var(--wiring-text-tertiary)] truncate">{d.reason}</p>}
                        </div>
                        <span className="text-xs font-medium px-2 py-0.5 rounded" style={{ color: actionColors[d.action], backgroundColor: `${actionColors[d.action]}18` }}>
                          {actionLabels[d.action] ?? d.action}
                        </span>
                        <span className="text-[10px] text-[var(--wiring-text-tertiary)] shrink-0">{timeAgo(d.timestamp)}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── 알림 설정 탭 ── */}
          {tab === "notifications" && (
            <div className="glass-panel overflow-hidden">
              <div className="px-4 py-3 border-b border-[var(--wiring-glass-border)]">
                <p className="text-sm font-semibold text-[var(--wiring-text-primary)]">알림 설정</p>
                <p className="text-xs text-[var(--wiring-text-tertiary)] mt-0.5">받고 싶은 알림 유형을 선택하세요</p>
              </div>
              <div className="divide-y divide-[var(--wiring-glass-border)]">
                {NOTIF_TYPES.map((n) => (
                  <div key={n.key} className="flex items-center justify-between px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      {notifSettings[n.key] ? (
                        <Bell className="w-4 h-4 text-[var(--wiring-accent)]" />
                      ) : (
                        <BellOff className="w-4 h-4 text-[var(--wiring-text-tertiary)]" />
                      )}
                      <span className={`text-sm ${notifSettings[n.key] ? "text-[var(--wiring-text-primary)]" : "text-[var(--wiring-text-tertiary)]"}`}>
                        {n.label}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        const next = !notifSettings[n.key];
                        setNotifSettings((prev) => ({ ...prev, [n.key]: next }));
                        toast.info(next ? "알림 켜짐" : "알림 꺼짐", n.label);
                      }}
                      className={`w-10 h-5.5 rounded-full transition-colors relative ${notifSettings[n.key] ? "bg-[var(--wiring-accent)]" : "bg-[var(--wiring-glass-border)]"}`}
                      style={{ height: "22px" }}
                    >
                      <span
                        className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform"
                        style={{ transform: notifSettings[n.key] ? "translateX(20px)" : "translateX(2px)" }}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
