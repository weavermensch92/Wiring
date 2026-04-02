"use client";

import { useNavigationStore } from "@/stores/navigation-store";
import { useLayoutStore } from "@/stores/layout-store";
import { useProjectStore } from "@/stores/project-store";
import { useHITLStore } from "@/stores/hitl-store";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { NavSection } from "@/types/navigation";
import { AnimatePresence, motion } from "framer-motion";

const SECTION_TITLES: Record<NavSection, string> = {
  dashboard: "대시보드",
  tickets: "티켓 관리",
  flowchart: "플로차트",
  documents: "문서 / 스킬",
  agents: "에이전트",
  governance: "거버넌스",
  external: "외부 업무",
  settings: "설정",
};

function DashboardSubNav() {
  const { projects, currentProjectId, setCurrentProject } = useProjectStore();
  const { queueItems } = useHITLStore();
  const waitingCount = queueItems.filter((i) => i.status === "waiting").length;

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase text-[var(--wiring-text-tertiary)] mb-2 px-1">프로젝트</p>
        {projects.map((p) => (
          <button
            key={p.id}
            onClick={() => setCurrentProject(p.id)}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
              currentProjectId === p.id
                ? "bg-[var(--wiring-accent-glow)] text-[var(--wiring-accent)]"
                : "text-[var(--wiring-text-secondary)] hover:bg-[var(--wiring-glass-hover)]"
            }`}
          >
            {p.name}
          </button>
        ))}
      </div>
      <div>
        <p className="text-xs uppercase text-[var(--wiring-text-tertiary)] mb-2 px-1">HITL 큐</p>
        <div className="px-3 py-2 rounded-lg bg-[var(--wiring-glass-bg)] border border-[var(--wiring-glass-border)]">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[var(--wiring-text-secondary)]">대기 중</span>
            <Badge variant="secondary" className="bg-[var(--hitl-waiting)] text-black text-xs">
              {waitingCount}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}

function TicketsSubNav() {
  const { epics, currentProjectId } = useProjectStore();
  const projectEpics = epics[currentProjectId] || [];

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase text-[var(--wiring-text-tertiary)] mb-2 px-1">Epics</p>
        {projectEpics.map((e) => (
          <div
            key={e.id}
            className="px-3 py-2 rounded-lg text-sm text-[var(--wiring-text-secondary)] hover:bg-[var(--wiring-glass-hover)] cursor-pointer transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="truncate">{e.title}</span>
              <span className="text-xs text-[var(--wiring-text-tertiary)]">
                {e.completedTickets}/{e.ticketCount}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FlowchartSubNav() {
  const { epics, currentProjectId } = useProjectStore();
  const projectEpics = epics[currentProjectId] || [];

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase text-[var(--wiring-text-tertiary)] mb-2 px-1">Epic 선택</p>
        {projectEpics.map((e) => (
          <div
            key={e.id}
            className="px-3 py-2 rounded-lg text-sm text-[var(--wiring-text-secondary)] hover:bg-[var(--wiring-glass-hover)] cursor-pointer transition-colors"
          >
            {e.title}
          </div>
        ))}
      </div>
      <div>
        <p className="text-xs uppercase text-[var(--wiring-text-tertiary)] mb-2 px-1">범례</p>
        <div className="space-y-1 px-3">
          {[
            { color: "var(--node-task)", label: "작업" },
            { color: "var(--node-hitl)", label: "HITL" },
            { color: "var(--node-branch)", label: "분기" },
            { color: "var(--node-merge)", label: "병합" },
            { color: "var(--node-escalation)", label: "에스컬레이션" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2 text-xs text-[var(--wiring-text-tertiary)]">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              {item.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PlaceholderSubNav({ label }: { label: string }) {
  return (
    <div className="px-3 py-2 text-sm text-[var(--wiring-text-tertiary)]">
      {label} 네비게이션
    </div>
  );
}

const SUB_NAV_CONTENT: Record<NavSection, React.ComponentType> = {
  dashboard: DashboardSubNav,
  tickets: TicketsSubNav,
  flowchart: FlowchartSubNav,
  documents: () => <PlaceholderSubNav label="문서 / 스킬" />,
  agents: () => <PlaceholderSubNav label="에이전트" />,
  governance: () => <PlaceholderSubNav label="거버넌스" />,
  external: () => <PlaceholderSubNav label="외부 업무" />,
  settings: () => <PlaceholderSubNav label="설정" />,
};

export function SubNavPanel() {
  const { activeSection, subNavCollapsed, toggleSubNav } = useNavigationStore();
  const { subNavWidth } = useLayoutStore();
  const Content = SUB_NAV_CONTENT[activeSection];

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
            {SECTION_TITLES[activeSection]}
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
            <Content />
          </motion.div>
        </AnimatePresence>
      </ScrollArea>
    </div>
  );
}
