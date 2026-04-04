"use client";

import { useNavigationStore } from "@/stores/navigation-store";
import { useLayoutStore } from "@/stores/layout-store";
import { useHITLStore } from "@/stores/hitl-store";
import { useProjectStore } from "@/stores/project-store";
import { useFavoritesStore } from "@/stores/favorites-store";
import { getTeamIdFromSection, isTeamSection, NavSection } from "@/types/navigation";
import { DUMMY_TEAMS } from "@/dummy/teams";
import { getProjectsForTeam, getAllTicketsForProject, DUMMY_EPICS, DUMMY_TICKETS } from "@/dummy/projects";
import { DUMMY_USERS } from "@/dummy/users";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PanelLeftClose, PanelLeftOpen, Search, Inbox, Clock, Star, CalendarDays, BarChart3, MessageSquare, Plus, Users, Bot, Wallet, ChevronDown, ChevronRight, ExternalLink, FileText } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";

function getSectionTitle(section: NavSection): string {
  if (isTeamSection(section)) {
    const teamId = getTeamIdFromSection(section);
    const team = DUMMY_TEAMS.find((t) => t.id === teamId);
    return team?.name ?? "팀";
  }
  const titles: Record<string, string> = {
    home: "홈",
    skills: "스킬",
    governance: "거버넌스",
    settings: "설정",
  };
  return titles[section] ?? section;
}

// ─── Favorites Nav ───
function FavoritesNav() {
  const router = useRouter();
  const { items, remove } = useFavoritesStore();
  if (items.length === 0) {
    return <p className="pl-6 py-1 text-xs text-[var(--wiring-text-tertiary)]">즐겨찾기 없음</p>;
  }
  return (
    <>
      {items.map((fav) => (
        <div key={fav.id} className="flex items-center gap-1 group">
          <button
            className="flex items-center gap-2 flex-1 pl-6 pr-1 py-1.5 rounded-lg text-sm text-[var(--wiring-text-secondary)] hover:bg-[var(--wiring-glass-hover)] hover:text-[var(--wiring-text-primary)] transition-colors text-left"
            onClick={() => router.push(fav.href)}
          >
            {fav.teamColor && (
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: fav.teamColor }} />
            )}
            <span className="truncate">{fav.label}</span>
          </button>
          <button
            className="p-1 rounded opacity-0 group-hover:opacity-100 text-[var(--wiring-text-tertiary)] hover:text-[var(--wiring-danger)] transition-all"
            onClick={() => remove(fav.id)}
            title="즐겨찾기 제거"
          >
            <Star className="w-3 h-3 fill-current" />
          </button>
        </div>
      ))}
    </>
  );
}

// ─── Home SubNav ───
function HomeSubNav() {
  const { queueItems } = useHITLStore();
  const router = useRouter();
  const waitingCount = queueItems.filter((i) => i.status === "waiting").length;

  // 최근 열람: 활성 프로젝트 3개
  const recentProjects = DUMMY_TEAMS.flatMap((t) =>
    getProjectsForTeam(t.id).map((p) => ({ team: t, project: p }))
  ).filter(({ project }) => project.status === "active").slice(0, 3);

  // 진행 중 티켓 수
  const allInProgressTickets = DUMMY_TEAMS.flatMap((t) =>
    getProjectsForTeam(t.id).flatMap((p) => getAllTicketsForProject(p.id))
  ).filter((tk) => tk.status === "in_progress");

  return (
    <div className="space-y-1">
      <SearchBar />
      <SectionDivider />

      <NavRow
        icon={<Inbox className="w-4 h-4" />}
        label="인박스"
        badge={waitingCount}
        onClick={() => router.push(`/hitl/${queueItems.find((i) => i.status === "waiting")?.id ?? "hitl-1"}`)}
      />
      <NavRow
        icon={<Clock className="w-4 h-4" />}
        label="내 HITL 큐"
        badge={waitingCount}
        badgeColor="var(--hitl-waiting)"
        onClick={() => router.push(`/hitl/${queueItems.find((i) => i.status === "waiting")?.id ?? "hitl-1"}`)}
      />

      <SectionDivider />

      <CollapsibleSection title="내부 업무" defaultOpen>
        <NavRow label="진행 중" badge={allInProgressTickets.length} indent />
        <NavRow label="검토 대기" badge={queueItems.filter((i) => i.status === "waiting").length} indent />
        <NavRow label="예정" badge={4} indent />
      </CollapsibleSection>

      <CollapsibleSection title="외주 업무" defaultOpen>
        <NavRow label="제안 받은" badge={4} indent onClick={() => router.push("/external")} />
        <NavRow label="진행 중" badge={2} indent onClick={() => router.push("/external")} />
        <NavRow label="정산 대기" badge={1} indent onClick={() => router.push("/external")} />
      </CollapsibleSection>

      <SectionDivider />

      <CollapsibleSection title="즐겨찾기" defaultOpen>
        <FavoritesNav />
      </CollapsibleSection>

      <CollapsibleSection title="최근 열람" defaultOpen>
        {recentProjects.map(({ team, project }) => (
          <NavRow
            key={project.id}
            label={project.name}
            indent
            dot={team.color}
            onClick={() => router.push(`/team/${team.id}/project/${project.id}`)}
          />
        ))}
      </CollapsibleSection>

      <SectionDivider />

      <NavRow icon={<BarChart3 className="w-4 h-4" />} label="내 활동 리포트" onClick={() => router.push("/skills")} />
      <NavRow icon={<CalendarDays className="w-4 h-4" />} label="일정" onClick={() => router.push("/schedule")} />
      <NavRow icon={<FileText className="w-4 h-4" />} label="문서 라이브러리" onClick={() => router.push("/docs")} />
    </div>
  );
}

// ─── Status helpers ───
const TICKET_STATUS_COLORS: Record<string, string> = {
  backlog: "var(--wiring-text-tertiary)",
  todo: "var(--wiring-info)",
  in_progress: "var(--wiring-accent)",
  review: "var(--wiring-warning)",
  done: "var(--wiring-success)",
};
const EPIC_STATUS_COLORS: Record<string, string> = {
  backlog: "var(--wiring-text-tertiary)",
  in_progress: "var(--wiring-accent)",
  review: "var(--wiring-warning)",
  done: "var(--wiring-success)",
};

// ─── Team SubNav (드릴다운) ───
function TeamSubNav({ teamId }: { teamId: string }) {
  const router = useRouter();
  const team = DUMMY_TEAMS.find((t) => t.id === teamId);
  const projects = getProjectsForTeam(teamId);
  const members = DUMMY_USERS.filter((u) => u.teamIds.includes(teamId));
  const { subtasks } = useProjectStore();
  const {
    expandedProjects, expandedEpics, expandedTickets,
    toggleProjectExpand, toggleEpicExpand, toggleTicketExpand,
    openTicketDialog,
  } = useNavigationStore();

  if (!team) return <div className="text-sm text-[var(--wiring-text-tertiary)] px-3 py-2">팀을 찾을 수 없습니다</div>;

  return (
    <div className="space-y-1">
      <NavRow icon={<MessageSquare className="w-4 h-4" />} label="팀 피드" onClick={() => router.push(`/team/${teamId}/feed`)} />
      <SectionDivider />

      {/* 프로젝트 드릴다운 */}
      <div className="flex items-center gap-1 px-1 py-1 text-xs uppercase text-[var(--wiring-text-tertiary)]">
        <span>프로젝트</span>
        <button className="ml-auto p-0.5 rounded hover:bg-[var(--wiring-glass-hover)]">
          <Plus className="w-3 h-3" />
        </button>
      </div>

      {projects.map((p) => {
        const isProjectOpen = !!expandedProjects[p.id];
        const epics = DUMMY_EPICS[p.id] || [];
        const projectDot = p.status === "active" ? team.color : "var(--wiring-text-tertiary)";

        return (
          <div key={p.id}>
            {/* Project row */}
            <div className="flex items-center gap-1 w-full">
              <button
                className="flex items-center gap-1.5 flex-1 px-3 py-1.5 rounded-lg text-sm text-[var(--wiring-text-secondary)] hover:bg-[var(--wiring-glass-hover)] hover:text-[var(--wiring-text-primary)] transition-colors text-left"
                onClick={() => toggleProjectExpand(p.id)}
              >
                {isProjectOpen
                  ? <ChevronDown className="w-3 h-3 shrink-0 text-[var(--wiring-text-tertiary)]" />
                  : <ChevronRight className="w-3 h-3 shrink-0 text-[var(--wiring-text-tertiary)]" />}
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: projectDot }} />
                <span className="truncate flex-1">{p.name}</span>
                <span className="text-[10px] text-[var(--wiring-text-tertiary)] shrink-0">
                  {getAllTicketsForProject(p.id).length}
                </span>
              </button>
              <button
                className="p-1 rounded text-[var(--wiring-text-tertiary)] hover:text-[var(--wiring-accent)] hover:bg-[var(--wiring-glass-hover)] transition-colors"
                onClick={() => router.push(`/team/${teamId}/project/${p.id}`)}
                title="프로젝트 열기"
              >
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>

            {/* Epics */}
            {isProjectOpen && epics.map((epic) => {
              const isEpicOpen = !!expandedEpics[epic.id];
              const epicTickets = DUMMY_TICKETS[epic.id] || [];
              const epicDot = EPIC_STATUS_COLORS[epic.status] || "var(--wiring-text-tertiary)";

              return (
                <div key={epic.id}>
                  <button
                    className="flex items-center gap-1.5 w-full pl-7 pr-3 py-1.5 rounded-lg text-xs text-[var(--wiring-text-secondary)] hover:bg-[var(--wiring-glass-hover)] hover:text-[var(--wiring-text-primary)] transition-colors text-left"
                    onClick={() => toggleEpicExpand(epic.id)}
                  >
                    {isEpicOpen
                      ? <ChevronDown className="w-3 h-3 shrink-0 text-[var(--wiring-text-tertiary)]" />
                      : <ChevronRight className="w-3 h-3 shrink-0 text-[var(--wiring-text-tertiary)]" />}
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: epicDot }} />
                    <span className="truncate flex-1">{epic.title}</span>
                    <span className="text-[10px] text-[var(--wiring-text-tertiary)] shrink-0">
                      {epic.completedTickets}/{epic.ticketCount}
                    </span>
                  </button>

                  {/* Tickets */}
                  {isEpicOpen && epicTickets.map((ticket) => {
                    const isTicketOpen = !!expandedTickets[ticket.id];
                    const subs = subtasks[ticket.id] || [];
                    const ticketDot = TICKET_STATUS_COLORS[ticket.status] || "var(--wiring-text-tertiary)";
                    const hasSubs = subs.length > 0;

                    return (
                      <div key={ticket.id}>
                        <div className="flex items-center gap-1 w-full">
                          <button
                            className="flex items-center gap-1.5 flex-1 pl-11 pr-1 py-1 rounded-lg text-xs text-[var(--wiring-text-secondary)] hover:bg-[var(--wiring-glass-hover)] hover:text-[var(--wiring-text-primary)] transition-colors text-left"
                            onClick={() => hasSubs && toggleTicketExpand(ticket.id)}
                          >
                            {hasSubs
                              ? isTicketOpen
                                ? <ChevronDown className="w-2.5 h-2.5 shrink-0 text-[var(--wiring-text-tertiary)]" />
                                : <ChevronRight className="w-2.5 h-2.5 shrink-0 text-[var(--wiring-text-tertiary)]" />
                              : <span className="w-2.5 shrink-0" />}
                            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: ticketDot }} />
                            <span className="truncate flex-1">{ticket.title}</span>
                            {ticket.hitlRequired && (
                              <span className="text-[9px] text-[var(--hitl-waiting)] shrink-0">HITL</span>
                            )}
                          </button>
                          <button
                            className="p-1 rounded text-[var(--wiring-text-tertiary)] hover:text-[var(--wiring-accent)] hover:bg-[var(--wiring-glass-hover)] transition-colors"
                            onClick={() => openTicketDialog(ticket)}
                            title="티켓 상세 보기"
                          >
                            <ExternalLink className="w-2.5 h-2.5" />
                          </button>
                        </div>

                        {/* Subtasks */}
                        {isTicketOpen && subs.map((sub) => (
                          <div
                            key={sub.id}
                            className="flex items-center gap-1.5 pl-16 pr-3 py-1 text-[10px] text-[var(--wiring-text-tertiary)]"
                          >
                            <span className={`w-1 h-1 rounded-full shrink-0 ${sub.completed ? "bg-[var(--wiring-success)]" : "bg-[var(--wiring-text-tertiary)]"}`} />
                            <span className={`truncate ${sub.completed ? "line-through opacity-50" : ""}`}>
                              {sub.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        );
      })}

      <SectionDivider />

      <NavRow icon={<Clock className="w-4 h-4" />} label="팀 HITL 큐" badge={3} badgeColor="var(--hitl-waiting)" onClick={() => router.push(`/team/${teamId}/hitl-queue`)} />
      <NavRow icon={<Bot className="w-4 h-4" />} label="에이전트 현황" onClick={() => router.push("/agents")} />
      <NavRow icon={<Users className="w-4 h-4" />} label={`팀원 (${members.length})`} onClick={() => router.push(`/team/${teamId}/members`)} />
      <NavRow icon={<Wallet className="w-4 h-4" />} label="팀 예산" onClick={() => router.push(`/team/${teamId}/budget`)} />
    </div>
  );
}

// ─── Skills SubNav ───
function SkillsSubNav() {
  const router = useRouter();
  const go = (tab: string) => router.push(`/skills?tab=${tab}`);
  return (
    <div className="space-y-1">
      <SearchBar />
      <SectionDivider />

      <CollapsibleSection title="스킬 라이브러리" defaultOpen>
        <NavRow label="전사 공통" badge={6} indent onClick={() => go("library")} />
        <NavRow label="팀별" badge={4} indent onClick={() => go("library")} />
      </CollapsibleSection>

      <CollapsibleSection title="문서 번들" defaultOpen>
        <NavRow label="최근 생성" badge={5} indent onClick={() => go("documents")} />
        <NavRow label="카테고리별" indent onClick={() => go("documents")} />
        <NavRow label="전체 문서 →" indent onClick={() => router.push("/docs")} />
      </CollapsibleSection>

      <SectionDivider />

      <CollapsibleSection title="AI 활용 리포트" defaultOpen>
        <NavRow label="스킬 사용 현황" indent onClick={() => go("report")} />
        <NavRow label="에이전트별 비용" indent onClick={() => go("report")} />
      </CollapsibleSection>

      <SectionDivider />

      <NavRow icon={<BarChart3 className="w-4 h-4" />} label="리포트 전체 보기" onClick={() => go("report")} />
    </div>
  );
}

// ─── Governance SubNav ───
function GovernanceSubNav() {
  const router = useRouter();
  const go = (tab: string) => router.push(`/governance?tab=${tab}`);
  const { queueItems } = useHITLStore();
  const pendingAccess = queueItems.filter((i) => i.type === "security_approval" && i.status === "waiting").length;

  return (
    <div className="space-y-1">
      <NavRow icon={<BarChart3 className="w-4 h-4" />} label="개요 대시보드" onClick={() => go("overview")} />

      <SectionDivider />

      <CollapsibleSection title="데이터 소스 & 분류" defaultOpen>
        <NavRow label="DB 연결 관리" indent onClick={() => go("classification")} />
        <NavRow label="테이블/컬럼 분류" indent onClick={() => go("classification")} />
      </CollapsibleSection>

      <CollapsibleSection title="접근 정책" defaultOpen>
        <NavRow label="역할별 권한 매트릭스" indent onClick={() => go("policy")} />
        <NavRow label="AI Agent 접근 범위" indent onClick={() => go("policy")} />
      </CollapsibleSection>

      <SectionDivider />

      <CollapsibleSection title="승인 관리" defaultOpen>
        <NavRow label="대기 중 요청" badge={pendingAccess} badgeColor="var(--hitl-waiting)" indent onClick={() => go("audit")} />
        <NavRow label="임시 권한 관리" indent onClick={() => go("overview")} />
      </CollapsibleSection>

      <SectionDivider />

      <NavRow label="감사 로그" onClick={() => go("audit")} />
    </div>
  );
}

// ─── Settings SubNav ───
function SettingsSubNav() {
  const router = useRouter();
  const go = (tab: string) => router.push(`/settings?tab=${tab}`);
  return (
    <div className="space-y-1">
      <NavRow label="AI 설정" onClick={() => go("ai")} />
      <NavRow label="외부 업무 정책" onClick={() => go("external")} />

      <SectionDivider />

      <p className="text-xs uppercase text-[var(--wiring-text-tertiary)] px-1 pt-2">관리자</p>
      <NavRow label="팀 관리" onClick={() => go("team")} />
      <NavRow label="API 키 관리" onClick={() => go("team")} />
    </div>
  );
}

// ─── Analytics SubNav ───
function AnalyticsSubNav() {
  const router = useRouter();
  const go = (tab: string) => router.push(`/analytics?tab=${tab}`);
  return (
    <div className="space-y-1">
      <NavRow icon={<BarChart3 className="w-4 h-4" />} label="전체 개요" onClick={() => go("overview")} />
      <SectionDivider />
      <CollapsibleSection title="상세 분석" defaultOpen>
        <NavRow label="에이전트 비용" indent onClick={() => go("agents")} />
        <NavRow label="HITL 현황" indent onClick={() => go("hitl")} />
        <NavRow label="팀 속도" indent onClick={() => go("teams")} />
      </CollapsibleSection>
      <SectionDivider />
      <NavRow icon={<Bot className="w-4 h-4" />} label="에이전트 현황" onClick={() => router.push("/agents")} />
    </div>
  );
}

// ─── Shared UI Components ───

function SearchBar() {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--wiring-glass-bg)] border border-[var(--wiring-glass-border)] text-[var(--wiring-text-tertiary)] text-sm cursor-pointer hover:border-[var(--wiring-text-tertiary)] transition-colors">
      <Search className="w-4 h-4" />
      <span>검색</span>
      <span className="ml-auto text-xs opacity-50">⌘K</span>
    </div>
  );
}

function SectionDivider() {
  return <Separator className="my-2 bg-[var(--wiring-glass-border)]" />;
}

function NavRow({
  icon,
  label,
  badge,
  badgeColor,
  indent,
  dot,
  onClick,
}: {
  icon?: React.ReactNode;
  label: string;
  badge?: number;
  badgeColor?: string;
  indent?: boolean;
  dot?: string;
  onClick?: () => void;
}) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-[var(--wiring-text-secondary)] hover:bg-[var(--wiring-glass-hover)] hover:text-[var(--wiring-text-primary)] transition-colors ${indent ? "pl-6" : ""}`}>
      {dot && <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: dot }} />}
      {icon && <span className="shrink-0 text-[var(--wiring-text-tertiary)]">{icon}</span>}
      <span className="truncate text-left">{label}</span>
      {badge !== undefined && badge > 0 && (
        <Badge
          variant="secondary"
          className="ml-auto text-xs shrink-0 px-1.5 py-0"
          style={badgeColor ? { backgroundColor: badgeColor, color: "#000" } : undefined}
        >
          {badge}
        </Badge>
      )}
    </button>
  );
}

function CollapsibleSection({
  title,
  defaultOpen = false,
  action,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-1 px-1 py-1 text-xs uppercase text-[var(--wiring-text-tertiary)] hover:text-[var(--wiring-text-secondary)] transition-colors"
      >
        {open ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        <span>{title}</span>
        {action && (
          <span
            className="ml-auto p-0.5 rounded hover:bg-[var(--wiring-glass-hover)] cursor-pointer"
            onClick={(e) => e.stopPropagation()}
          >
            {action}
          </span>
        )}
      </button>
      {open && <div>{children}</div>}
    </div>
  );
}

// ─── Main SubNavPanel ───

function getSubNavContent(section: NavSection): React.ReactNode {
  if (isTeamSection(section)) {
    const teamId = getTeamIdFromSection(section);
    return teamId ? <TeamSubNav teamId={teamId} /> : null;
  }
  switch (section) {
    case "home": return <HomeSubNav />;
    case "skills": return <SkillsSubNav />;
    case "governance": return <GovernanceSubNav />;
    case "settings": return <SettingsSubNav />;
    case "analytics": return <AnalyticsSubNav />;
    default: return null;
  }
}

export function SubNavPanel() {
  const { activeSection, subNavCollapsed, toggleSubNav } = useNavigationStore();
  const { subNavWidth } = useLayoutStore();

  if (subNavCollapsed) {
    return (
      <div className="flex items-start pt-3 px-1 border-r border-[var(--wiring-glass-border)] bg-[var(--wiring-bg-secondary)]">
        <button
          onClick={toggleSubNav}
          className="p-1.5 rounded-lg text-[var(--wiring-text-tertiary)] hover:bg-[var(--wiring-glass-hover)] hover:text-[var(--wiring-text-secondary)] transition-colors"
        >
          <PanelLeftOpen className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col h-full border-r border-[var(--wiring-glass-border)] bg-[var(--wiring-bg-secondary)] shrink-0"
      style={{ width: subNavWidth }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-14 shrink-0">
        <AnimatePresence mode="wait">
          <motion.h2
            key={activeSection}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="text-sm font-semibold text-[var(--wiring-text-primary)]"
          >
            {getSectionTitle(activeSection)}
          </motion.h2>
        </AnimatePresence>
        <button
          onClick={toggleSubNav}
          className="p-1.5 rounded-lg text-[var(--wiring-text-tertiary)] hover:bg-[var(--wiring-glass-hover)] hover:text-[var(--wiring-text-secondary)] transition-colors"
        >
          <PanelLeftClose className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 px-3 pb-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            transition={{ duration: 0.15 }}
          >
            {getSubNavContent(activeSection)}
          </motion.div>
        </AnimatePresence>
      </ScrollArea>
    </div>
  );
}
