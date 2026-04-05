"use client";

import { useEffect } from "react";
import { IconNav } from "./icon-nav";
import { SubNavPanel } from "./sub-nav-panel";
import { TopBar } from "./top-bar";
import { ChatPanel } from "./chat-panel";
import { MainWorkspace } from "./main-workspace";
import { GlobalSearch } from "./global-search";
import { ToastContainer } from "./toast-container";
import { KeyboardHelp } from "./keyboard-help";
import { OnboardingModal } from "./onboarding";
import { useRouter } from "next/navigation";
import { useLayoutStore } from "@/stores/layout-store";
import { useNavigationStore } from "@/stores/navigation-store";
import { TicketDetailDialog } from "@/components/project/ticket-detail-dialog";
import { AddTicketDialog } from "@/components/project/add-ticket-dialog";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const {
    chatPanelOpen, searchOpen, helpOpen,
    openSearch, closeSearch, toggleChatPanel,
    openHelp, closeHelp,
  } = useLayoutStore();
  const { selectedTicketForDialog, ticketDialogOpen, closeTicketDialog, toggleSubNav, newTicketOpen, openNewTicket, closeNewTicket, setActiveSection } = useNavigationStore();
  const appRouter = useRouter();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isTyping = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;

      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); openSearch(); return; }
      if ((e.metaKey || e.ctrlKey) && e.key === "j") { e.preventDefault(); toggleChatPanel(); return; }
      if ((e.metaKey || e.ctrlKey) && e.key === "b") { e.preventDefault(); toggleSubNav(); return; }
      if ((e.metaKey || e.ctrlKey) && e.key === "n") { e.preventDefault(); openNewTicket(); return; }
      if ((e.metaKey || e.ctrlKey) && e.key === "i") { e.preventDefault(); setActiveSection("inbox"); appRouter.push("/inbox"); return; }
      if (!isTyping && e.key === "?") { e.preventDefault(); openHelp(); return; }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [openSearch, toggleChatPanel, toggleSubNav, openHelp, openNewTicket, setActiveSection, appRouter]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--wiring-bg-primary)]">
      <IconNav />
      <SubNavPanel />
      <div className="flex flex-col flex-1 min-w-0">
        <TopBar />
        <MainWorkspace>{children}</MainWorkspace>
      </div>
      {chatPanelOpen && <ChatPanel />}

      <TicketDetailDialog
        ticket={selectedTicketForDialog}
        open={ticketDialogOpen}
        onOpenChange={(open) => { if (!open) closeTicketDialog(); }}
      />

      <AddTicketDialog
        open={newTicketOpen ?? false}
        onOpenChange={(open) => { if (!open) closeNewTicket?.(); }}
        epicId="epic-1"
        defaultStatus="todo"
      />

      <GlobalSearch open={searchOpen} onClose={closeSearch} />
      <KeyboardHelp open={helpOpen} onClose={closeHelp} />
      <OnboardingModal />
      <ToastContainer />
    </div>
  );
}
