"use client";

import { useEffect } from "react";
import { IconNav } from "./icon-nav";
import { SubNavPanel } from "./sub-nav-panel";
import { TopBar } from "./top-bar";
import { ChatPanel } from "./chat-panel";
import { MainWorkspace } from "./main-workspace";
import { GlobalSearch } from "./global-search";
import { ToastContainer } from "./toast-container";
import { useLayoutStore } from "@/stores/layout-store";
import { useNavigationStore } from "@/stores/navigation-store";
import { TicketDetailDialog } from "@/components/project/ticket-detail-dialog";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { chatPanelOpen, searchOpen, openSearch, closeSearch } = useLayoutStore();
  const { selectedTicketForDialog, ticketDialogOpen, closeTicketDialog } = useNavigationStore();

  // Cmd+K / Ctrl+K 글로벌 단축키
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        openSearch();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [openSearch]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--wiring-bg-primary)]">
      <IconNav />
      <SubNavPanel />
      <div className="flex flex-col flex-1 min-w-0">
        <TopBar />
        <MainWorkspace>{children}</MainWorkspace>
      </div>
      {chatPanelOpen && <ChatPanel />}

      {/* Global TicketDetailDialog — opened from SubNav */}
      <TicketDetailDialog
        ticket={selectedTicketForDialog}
        open={ticketDialogOpen}
        onOpenChange={(open) => { if (!open) closeTicketDialog(); }}
      />

      {/* Global Search Modal */}
      <GlobalSearch open={searchOpen} onClose={closeSearch} />

      {/* Toast notifications */}
      <ToastContainer />
    </div>
  );
}
