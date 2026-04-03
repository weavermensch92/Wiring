"use client";

import { useNavigationStore } from "@/stores/navigation-store";
import { useLayoutStore } from "@/stores/layout-store";
import { useHITLStore } from "@/stores/hitl-store";
import { getTeamIdFromSection, isTeamSection, NavSection } from "@/types/navigation";
import { DUMMY_TEAMS, getProjectsForTeam } from "@/dummy/teams";
import { DUMMY_USERS } from "@/dummy/users";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PanelLeftClose, PanelLeftOpen, Search, Inbox, Clock, Star, CalendarDays, BarChart3, MessageSquare, Plus, Users, Bot, Wallet, ChevronDown, ChevronRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
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

// ─── Home SubNav ───
function HomeSubNav() {
  const { queueItems } = useHITLStore();
  const waitingCount = queueItems.filter((i) => i.status === "waiting").length;

  return (
    <div className="space-y-1">
      <SearchBar />
      <SectionDivider />

      <NavRow icon={<Inbox className="w-4 h-4" />} label="인박스" badge={3} />
      <NavRow icon={<Clock className="w-4 h-4" />} label="내 HITL 큐" badge={waitingCount} badgeColor="var(--hitl-waiting)" />

      <SectionDivider />

      <CollapsibleSection title="내부 업무" defaultOpen>
        <NavRow label="진행 중" badge={2} indent />
        <NavRow label="검토 대기" badge={1} indent />
        <NavRow label="예정" badge={4} indent />
      </CollapsibleSection>

      <CollapsibleSection title="외주 업무" defaultOpen>
        <NavRow label="제안 받은" badge={1} indent />
        <NavRow label="진행 중" badge={2} indent />
        <NavRow label="정산 대기" badge={0} indent />
      </CollapsibleSection>

      <SectionDivider />

      <NavRow icon={<Star className="w-4 h-4" />} label="즐겨찾기" />
      <NavRow icon={<Clock className="w-4 h-4" />} label="최근 열람" />

      <SectionDivider />

      <NavRow icon={<BarChart3 className="w-4 h-4" />} label="내 활동 리포트" />
      <NavRow icon={<CalendarDays className="w-4 h-4" />} label="일정" />
    </div>
  );
}

// ─── Team SubNav ───
function TeamSubNav({ teamId }: { teamId: string }) {
  const team = DUMMY_TEAMS.find((t) => t.id === teamId);
  const projects = getProjectsForTeam(teamId);
  const members = DUMMY_USERS.filter((u) => u.teamIds.includes(teamId));

  if (!team) return <div className="text-sm text-[var(--wiring-text-tertiary)] px-3 py-2">팀을 찾을 수 없습니다</div>;

  return (
    <div className="space-y-1">
      <NavRow icon={<MessageSquare className="w-4 h-4" />} label="팀 피드" />

      <SectionDivider />

      <CollapsibleSection title="프로젝트" defaultOpen action={<Plus className="w-3.5 h-3.5" />}>
        {projects.map((p) => (
          <NavRow
            key={p.id}
            label={p.name}
            badge={p.ticketCount}
            indent
            dot={p.status === "active" ? team.color : "var(--wiring-text-tertiary)"}
          />
        ))}
      </CollapsibleSection>

      <SectionDivider />

      <NavRow icon={<Clock className="w-4 h-4" />} label="팀 HITL 큐" badge={3} badgeColor="var(--hitl-waiting)" />
      <NavRow icon={<Bot className="w-4 h-4" />} label="에이전트 현황" />
      <NavRow icon={<Users className="w-4 h-4" />} label={`팀원 (${members.length})`} />
      <NavRow icon={<Wallet className="w-4 h-4" />} label="팀 예산" />
    </div>
  );
}

// ─── Skills SubNav ───
function SkillsSubNav() {
  return (
    <div className="space-y-1">
      <SearchBar />
      <SectionDivider />

      <CollapsibleSection title="스킬 라이브러리" defaultOpen>
        <NavRow label="전사 공통" badge={15} indent />
        <NavRow label="Backend팀" badge={8} indent />
        <NavRow label="Frontend팀" badge={5} indent />
      </CollapsibleSection>

      <CollapsibleSection title="문서 번들" defaultOpen>
        <NavRow label="최근 생성" indent />
        <NavRow label="카테고리별" indent />
      </CollapsibleSection>

      <SectionDivider />

      <CollapsibleSection title="AI 활용 리포트">
        <NavRow label="내 활용도" indent />
        <NavRow label="팀 비교" indent />
      </CollapsibleSection>

      <CollapsibleSection title="활동 로그">
        <NavRow label="내 로그" indent />
        <NavRow label="전체" indent />
      </CollapsibleSection>

      <SectionDivider />

      <CollapsibleSection title="가이드">
        <NavRow label="추천 가이드" indent />
        <NavRow label="학습 경로" indent />
      </CollapsibleSection>
    </div>
  );
}

// ─── Governance SubNav ───
function GovernanceSubNav() {
  return (
    <div className="space-y-1">
      <NavRow icon={<BarChart3 className="w-4 h-4" />} label="개요 대시보드" />

      <SectionDivider />

      <CollapsibleSection title="데이터 소스" defaultOpen>
        <NavRow label="DB 연결 관리" indent />
        <NavRow label="Git 저장소" indent />
        <NavRow label="외부 서비스" indent />
      </CollapsibleSection>

      <CollapsibleSection title="데이터 분류">
        <NavRow label="분류 정책" indent />
        <NavRow label="테이블/컬럼 분류" indent />
      </CollapsibleSection>

      <SectionDivider />

      <CollapsibleSection title="접근 정책">
        <NavRow label="팀별 권한 매트릭스" indent />
        <NavRow label="역할별 권한" indent />
        <NavRow label="AI Agent 접근 범위" indent />
      </CollapsibleSection>

      <CollapsibleSection title="승인 관리" defaultOpen>
        <NavRow label="대기 중 요청" badge={2} badgeColor="var(--hitl-waiting)" indent />
        <NavRow label="팀간 공유 요청" badge={1} indent />
        <NavRow label="임시 권한 관리" indent />
      </CollapsibleSection>

      <SectionDivider />

      <NavRow label="감사 로그" />
      <NavRow label="GM 설정" />
    </div>
  );
}

// ─── Settings SubNav ───
function SettingsSubNav() {
  return (
    <div className="space-y-1">
      <NavRow label="일반" />
      <NavRow label="AI 설정" />
      <NavRow label="외부 업무 정책" />

      <SectionDivider />

      <p className="text-xs uppercase text-[var(--wiring-text-tertiary)] px-1 pt-2">관리자</p>
      <NavRow label="팀 관리" />
      <NavRow label="시스템" />
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
}: {
  icon?: React.ReactNode;
  label: string;
  badge?: number;
  badgeColor?: string;
  indent?: boolean;
  dot?: string;
}) {
  return (
    <button className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-[var(--wiring-text-secondary)] hover:bg-[var(--wiring-glass-hover)] hover:text-[var(--wiring-text-primary)] transition-colors ${indent ? "pl-6" : ""}`}>
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
