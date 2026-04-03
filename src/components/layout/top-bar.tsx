"use client";

import { usePathname } from "next/navigation";
import { useLayoutStore } from "@/stores/layout-store";
import { useHITLStore } from "@/stores/hitl-store";
import { DUMMY_TEAMS } from "@/dummy/teams";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Search,
  MessageSquare,
} from "lucide-react";

const BREADCRUMB_MAP: Record<string, string> = {
  "/home": "홈",
  "/skills": "스킬",
  "/governance": "거버넌스",
  "/settings": "설정",
  "/tickets": "티켓 관리",
  "/flowchart": "플로차트",
  "/agents": "에이전트",
  "/external": "외부 업무",
  "/dashboard": "대시보드",
  "/documents": "문서 / 스킬",
};

function getBreadcrumb(pathname: string): string {
  // Check static routes first
  if (BREADCRUMB_MAP[pathname]) return BREADCRUMB_MAP[pathname];

  // Dynamic team route: /team/team-be → "Backend"
  const teamMatch = pathname.match(/^\/team\/(.+)$/);
  if (teamMatch) {
    const team = DUMMY_TEAMS.find((t) => t.id === teamMatch[1]);
    return team ? team.name : "팀";
  }

  // HITL detail route
  if (pathname.startsWith("/hitl/")) return "HITL 상세";

  return pathname.split("/").pop() || "";
}

export function TopBar() {
  const pathname = usePathname();
  const { chatPanelOpen, toggleChatPanel } = useLayoutStore();
  const { queueItems } = useHITLStore();
  const waitingCount = queueItems.filter((i) => i.status === "waiting").length;

  const breadcrumb = getBreadcrumb(pathname);

  return (
    <header className="flex items-center h-14 px-4 border-b border-[var(--wiring-glass-border)] bg-[var(--wiring-bg-secondary)] shrink-0">
      {/* Left: navigation buttons + breadcrumb */}
      <div className="flex items-center gap-1 min-w-0">
        <button className="p-1.5 rounded-lg text-[var(--wiring-text-tertiary)] hover:bg-[var(--wiring-glass-hover)] transition-colors">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button className="p-1.5 rounded-lg text-[var(--wiring-text-tertiary)] hover:bg-[var(--wiring-glass-hover)] transition-colors">
          <ChevronRight className="w-4 h-4" />
        </button>
        <span className="ml-2 text-sm text-[var(--wiring-text-primary)] font-medium truncate">
          {breadcrumb}
        </span>
      </div>

      {/* Center: history */}
      <div className="flex-1 flex justify-center">
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[var(--wiring-text-tertiary)] hover:bg-[var(--wiring-glass-hover)] transition-colors text-xs">
          <Clock className="w-3.5 h-3.5" />
          히스토리
        </button>
      </div>

      {/* Right: search + HITL badge + chat toggle */}
      <div className="flex items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--wiring-text-tertiary)]" />
          <Input
            placeholder="검색..."
            className="h-8 w-48 pl-8 text-xs bg-[var(--wiring-glass-bg)] border-[var(--wiring-glass-border)] focus:border-[var(--wiring-accent)] focus:w-64 transition-all duration-200"
          />
        </div>

        {waitingCount > 0 && (
          <Badge
            variant="secondary"
            className="bg-[var(--hitl-waiting)] text-black text-[10px] px-1.5 py-0.5"
          >
            HITL {waitingCount}
          </Badge>
        )}

        <button
          onClick={toggleChatPanel}
          className={`relative p-2 rounded-lg transition-all duration-150 ${
            chatPanelOpen
              ? "bg-[var(--wiring-accent-glow)] text-[var(--wiring-accent)]"
              : "text-[var(--wiring-text-secondary)] hover:bg-[var(--wiring-glass-hover)] hover:text-[var(--wiring-text-primary)]"
          }`}
        >
          <MessageSquare className="w-4.5 h-4.5" />
          {chatPanelOpen && (
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[var(--wiring-accent)]" />
          )}
        </button>
      </div>
    </header>
  );
}
