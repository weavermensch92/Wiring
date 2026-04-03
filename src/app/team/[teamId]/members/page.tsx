"use client";

import { use, useState } from "react";
import { DUMMY_TEAMS } from "@/dummy/teams";
import { DUMMY_USERS, CURRENT_USER } from "@/dummy/users";
import { getProjectsForTeam, getAllTicketsForProject, DUMMY_TICKETS } from "@/dummy/projects";
import { DUMMY_EPICS } from "@/dummy/projects";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Users, UserPlus, Mail, Briefcase, CheckCircle2,
  Clock, ChevronRight, X, Send,
} from "lucide-react";

interface InviteFormState {
  name: string;
  email: string;
  role: string;
  level: string;
}

const LEVEL_COLORS: Record<string, string> = {
  L1: "var(--wiring-text-tertiary)",
  L2: "var(--wiring-info)",
  L3: "var(--wiring-accent)",
  L4: "#EC4899",
};

function MemberCard({
  user,
  teamId,
  isCurrentUser,
}: {
  user: (typeof DUMMY_USERS)[0];
  teamId: string;
  isCurrentUser: boolean;
}) {
  const projects = getProjectsForTeam(teamId);

  // Count in-progress tickets for this user across team projects
  const inProgressTickets = projects.flatMap((p) =>
    (DUMMY_EPICS[p.id] ?? []).flatMap((e) =>
      (DUMMY_TICKETS[e.id] ?? []).filter(
        (t) => t.assignedHuman?.id === user.id && t.status === "in_progress"
      )
    )
  );

  const doneTickets = projects.flatMap((p) =>
    (DUMMY_EPICS[p.id] ?? []).flatMap((e) =>
      (DUMMY_TICKETS[e.id] ?? []).filter(
        (t) => t.assignedHuman?.id === user.id && t.status === "done"
      )
    )
  );

  return (
    <div className={`glass-panel p-5 ${isCurrentUser ? "border-[var(--wiring-accent)]/50" : ""}`}>
      <div className="flex items-start gap-4">
        <Avatar className="w-11 h-11 shrink-0">
          <AvatarFallback
            className="text-sm font-bold text-white"
            style={{ backgroundColor: LEVEL_COLORS[user.level] ?? "var(--wiring-accent)" }}
          >
            {user.avatar}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-semibold text-[var(--wiring-text-primary)]">{user.name}</h3>
            <span
              className="text-[10px] px-1.5 py-0.5 rounded font-bold"
              style={{
                color: LEVEL_COLORS[user.level] ?? "var(--wiring-text-tertiary)",
                backgroundColor: `${LEVEL_COLORS[user.level] ?? "#555"}20`,
              }}
            >
              {user.level}
            </span>
            {isCurrentUser && (
              <Badge variant="secondary" className="text-[9px] text-[var(--wiring-accent)]">나</Badge>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[var(--wiring-text-tertiary)] mb-3">
            <Briefcase className="w-3 h-3" />
            <span>{user.role}</span>
            <span className="mx-1">·</span>
            <Mail className="w-3 h-3" />
            <span>{user.email}</span>
          </div>

          {/* Ticket stats */}
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-[var(--wiring-accent)]" />
              <span className="text-[var(--wiring-text-secondary)]">진행 중</span>
              <span className="font-semibold text-[var(--wiring-text-primary)]">{inProgressTickets.length}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3 h-3 text-[var(--wiring-success)]" />
              <span className="text-[var(--wiring-text-secondary)]">완료</span>
              <span className="font-semibold text-[var(--wiring-text-primary)]">{doneTickets.length}</span>
            </div>
          </div>

          {/* Active tickets preview */}
          {inProgressTickets.length > 0 && (
            <div className="mt-3 space-y-1">
              {inProgressTickets.slice(0, 2).map((ticket) => (
                <div key={ticket.id} className="flex items-center gap-2 text-xs text-[var(--wiring-text-tertiary)]">
                  <span className="w-1 h-1 rounded-full bg-[var(--wiring-accent)] shrink-0" />
                  <span className="truncate">{ticket.title}</span>
                </div>
              ))}
              {inProgressTickets.length > 2 && (
                <p className="text-[10px] text-[var(--wiring-text-tertiary)] pl-3">
                  외 {inProgressTickets.length - 2}개
                </p>
              )}
            </div>
          )}

          {/* Other teams */}
          <div className="mt-3 flex flex-wrap gap-1">
            {user.teamIds
              .filter((tid) => tid !== teamId)
              .map((tid) => {
                const t = DUMMY_TEAMS.find((t) => t.id === tid);
                if (!t) return null;
                return (
                  <span
                    key={tid}
                    className="text-[10px] px-1.5 py-0.5 rounded text-white"
                    style={{ backgroundColor: t.color }}
                  >
                    {t.abbreviation}
                  </span>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}

function InviteModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState<InviteFormState>({
    name: "",
    email: "",
    role: "",
    level: "L1",
  });
  const [sent, setSent] = useState(false);

  function handleSubmit() {
    if (!form.name.trim() || !form.email.trim()) return;
    setSent(true);
    setTimeout(() => {
      setSent(false);
      onClose();
    }, 1500);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[var(--wiring-bg-secondary)] border border-[var(--wiring-glass-border)] rounded-2xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-[var(--wiring-accent)]" />
            <h2 className="text-base font-semibold text-[var(--wiring-text-primary)]">팀원 초대</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[var(--wiring-text-tertiary)] hover:bg-[var(--wiring-glass-hover)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {sent ? (
          <div className="flex flex-col items-center gap-3 py-6">
            <CheckCircle2 className="w-10 h-10 text-[var(--wiring-success)]" />
            <p className="text-sm font-medium text-[var(--wiring-text-primary)]">초대 이메일 발송 완료</p>
            <p className="text-xs text-[var(--wiring-text-tertiary)]">{form.email}</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-[var(--wiring-text-tertiary)] block mb-1">이름</label>
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="홍길동"
                className="w-full bg-[var(--wiring-glass-bg)] border border-[var(--wiring-glass-border)] rounded-lg px-3 py-2 text-sm text-[var(--wiring-text-primary)] placeholder:text-[var(--wiring-text-tertiary)] focus:outline-none focus:border-[var(--wiring-accent)] transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--wiring-text-tertiary)] block mb-1">이메일</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="user@company.com"
                className="w-full bg-[var(--wiring-glass-bg)] border border-[var(--wiring-glass-border)] rounded-lg px-3 py-2 text-sm text-[var(--wiring-text-primary)] placeholder:text-[var(--wiring-text-tertiary)] focus:outline-none focus:border-[var(--wiring-accent)] transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--wiring-text-tertiary)] block mb-1">역할</label>
              <input
                value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                placeholder="예: Frontend Developer"
                className="w-full bg-[var(--wiring-glass-bg)] border border-[var(--wiring-glass-border)] rounded-lg px-3 py-2 text-sm text-[var(--wiring-text-primary)] placeholder:text-[var(--wiring-text-tertiary)] focus:outline-none focus:border-[var(--wiring-accent)] transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--wiring-text-tertiary)] block mb-1">레벨</label>
              <div className="flex gap-2">
                {["L1", "L2", "L3", "L4"].map((lv) => (
                  <button
                    key={lv}
                    onClick={() => setForm((f) => ({ ...f, level: lv }))}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all border ${
                      form.level === lv
                        ? "border-[var(--wiring-accent)] bg-[var(--wiring-accent-glow)]"
                        : "border-[var(--wiring-glass-border)] text-[var(--wiring-text-tertiary)]"
                    }`}
                    style={{ color: form.level === lv ? LEVEL_COLORS[lv] : undefined }}
                  >
                    {lv}
                  </button>
                ))}
              </div>
            </div>

            <Separator className="bg-[var(--wiring-glass-border)]" />

            <div className="flex gap-3">
              <button
                onClick={handleSubmit}
                disabled={!form.name.trim() || !form.email.trim()}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium bg-[var(--wiring-accent)] text-white disabled:opacity-40 hover:opacity-90 transition-opacity"
              >
                <Send className="w-3.5 h-3.5" />
                초대 발송
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium border border-[var(--wiring-glass-border)] text-[var(--wiring-text-secondary)] hover:bg-[var(--wiring-glass-hover)] transition-colors"
              >
                취소
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TeamMembersPage({ params }: { params: Promise<{ teamId: string }> }) {
  const { teamId } = use(params);
  const [showInvite, setShowInvite] = useState(false);
  const team = DUMMY_TEAMS.find((t) => t.id === teamId);
  const members = DUMMY_USERS.filter((u) => u.teamIds.includes(teamId));

  if (!team) return <div className="p-6 text-[var(--wiring-text-tertiary)]">팀을 찾을 수 없습니다</div>;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {showInvite && <InviteModal onClose={() => setShowInvite(false)} />}
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span
                className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0"
                style={{ backgroundColor: team.color }}
              >
                {team.abbreviation}
              </span>
              <div>
                <h1 className="text-xl font-semibold text-[var(--wiring-text-primary)]">{team.name} 팀원</h1>
                <p className="text-xs text-[var(--wiring-text-tertiary)]">총 {members.length}명</p>
              </div>
            </div>
            <button
              onClick={() => setShowInvite(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-[var(--wiring-accent)] text-white hover:opacity-90 transition-opacity"
            >
              <UserPlus className="w-4 h-4" />
              팀원 초대
            </button>
          </div>

          {/* Level breakdown */}
          <div className="grid grid-cols-4 gap-3">
            {["L1", "L2", "L3", "L4"].map((lv) => {
              const count = members.filter((u) => u.level === lv).length;
              return (
                <div key={lv} className="glass-panel p-4 text-center">
                  <p className="text-xs text-[var(--wiring-text-tertiary)] mb-1">{lv}</p>
                  <p className="text-2xl font-bold" style={{ color: LEVEL_COLORS[lv] }}>{count}</p>
                </div>
              );
            })}
          </div>

          {/* Member cards */}
          <div className="grid grid-cols-2 gap-4">
            {members.map((user) => (
              <MemberCard
                key={user.id}
                user={user}
                teamId={teamId}
                isCurrentUser={user.id === CURRENT_USER.id}
              />
            ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
