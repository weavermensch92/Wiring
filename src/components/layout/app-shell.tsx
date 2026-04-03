"use client";

import { IconNav } from "./icon-nav";
import { SubNavPanel } from "./sub-nav-panel";
import { TopBar } from "./top-bar";
import { ChatPanel } from "./chat-panel";
import { MainWorkspace } from "./main-workspace";
import { useLayoutStore } from "@/stores/layout-store";
import { useNavigationStore } from "@/stores/navigation-store";
import { TicketDetailDialog } from "@/components/project/ticket-detail-dialog";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { chatPanelOpen } = useLayoutStore();
  const { selectedTicketForDialog, ticketDialogOpen, closeTicketDialog } = useNavigationStore();

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
    </div>
  );
}
