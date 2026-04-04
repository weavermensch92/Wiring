"use client";

import { usePathname } from "next/navigation";
import { useLayoutStore } from "@/stores/layout-store";
import { useHITLStore } from "@/stores/hitl-store";
import { useFavoritesStore } from "@/stores/favorites-store";
import { DUMMY_DOCUMENTS } from "@/dummy/documents";
import { DUMMY_TEAMS } from "@/dummy/teams";
import { DUMMY_PROJECTS } from "@/dummy/projects";
import { NotificationPanel } from "./notification-panel";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Search,
  MessageSquare,
  Star,
} from "lucide-react";

// breadcrumb에 /docs 경로 추가
const EXTRA_BREADCRUMB: Record<string, string> = {
  "/docs": "문서 라이브러리",
  "/schedule": "일정",
  "/agents": "에이전트",
  "/external": "외부 업무",
};

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
  "/documents": "문서 번들",
  "/docs": "문서 라이브러리",
  "/schedule": "일정",
  "/analytics": "분석 대시보드",
  "/activity": "활동 로그",
};

function getBreadcrumb(pathname: string): string {
  // Check static routes first
  if (BREADCRUMB_MAP[pathname]) return BREADCRUMB_MAP[pathname];

  // Dynamic project route: /team/{teamId}/project/{projectId}
  const projectMatch = pathname.match(/^\/team\/(.+?)\/project\/(.+)$/);
  if (projectMatch) {
    const team = DUMMY_TEAMS.find((t) => t.id === projectMatch[1]);
    const project = DUMMY_PROJECTS.find((p) => p.id === projectMatch[2]);
    const teamName = team?.name ?? "팀";
    const projectName = project?.name ?? "프로젝트";
    return `${teamName} / ${projectName}`;
  }

  // Dynamic team route: /team/{teamId}
  const teamMatch = pathname.match(/^\/team\/(.+)$/);
  if (teamMatch) {
    const team = DUMMY_TEAMS.find((t) => t.id === teamMatch[1]);
    return team ? team.name : "팀";
  }

  // HITL detail route
  if (pathname.startsWith("/hitl/")) return "HITL 상세";

  // Docs detail route
  if (pathname.startsWith("/docs/")) {
    const docId = pathname.replace("/docs/", "");
    if (docId === "new") return "새 문서";
    const doc = DUMMY_DOCUMENTS.find((d) => d.id === docId);
    return doc ? doc.title : "문서";
  }

  return pathname.split("/").pop() || "";
}

export function TopBar() {
  const pathname = usePathname();
  const { chatPanelOpen, toggleChatPanel, openSearch } = useLayoutStore();
  const { queueItems } = useHITLStore();
  const { toggle, has } = useFavoritesStore();
  const waitingCount = queueItems.filter((i) => i.status === "waiting").length;

  const breadcrumb = getBreadcrumb(pathname);

  // Build favorite item from current page
  const projectMatch = pathname.match(/^\/team\/(.+?)\/project\/(.+)$/);
  const currentFavItem = projectMatch ? {
    id: `project-${projectMatch[2]}`,
    type: "project" as const,
    label: breadcrumb,
    href: pathname,
    teamColor: DUMMY_TEAMS.find((t) => t.id === projectMatch[1])?.color,
  } : null;
  const isFavorited = currentFavItem ? has(currentFavItem.id) : false;

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
        {currentFavItem && (
          <button
            onClick={() => toggle(currentFavItem)}
            className={`ml-1 p-1 rounded-lg transition-colors ${
              isFavorited
                ? "text-[var(--wiring-warning)]"
                : "text-[var(--wiring-text-tertiary)] hover:text-[var(--wiring-warning)]"
            }`}
            title={isFavorited ? "즐겨찾기 제거" : "즐겨찾기 추가"}
          >
            <Star className={`w-3.5 h-3.5 ${isFavorited ? "fill-current" : ""}`} />
          </button>
        )}
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
        <button
          onClick={openSearch}
          className="flex items-center gap-2 h-8 px-3 rounded-lg text-xs text-[var(--wiring-text-tertiary)] bg-[var(--wiring-glass-bg)] border border-[var(--wiring-glass-border)] hover:border-[var(--wiring-accent)] hover:text-[var(--wiring-text-secondary)] transition-all w-48"
          title="검색 (Ctrl+K)"
        >
          <Search className="w-3.5 h-3.5 shrink-0" />
          <span className="flex-1 text-left">검색...</span>
          <kbd className="text-[10px] px-1 py-0.5 rounded border border-[var(--wiring-glass-border)] bg-[var(--wiring-bg-tertiary)] shrink-0">⌘K</kbd>
        </button>

        {waitingCount > 0 && (
          <Badge
            variant="secondary"
            className="bg-[var(--hitl-waiting)] text-black text-[10px] px-1.5 py-0.5"
          >
            HITL {waitingCount}
          </Badge>
        )}

        <NotificationPanel />

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
