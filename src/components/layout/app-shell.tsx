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
import { useHITLStore } from "@/stores/hitl-store";
import { useChatStore } from "@/stores/chat-store";
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
  const { selectedTicketForDialog, ticketDialogOpen, closeTicketDialog, toggleSubNav, newTicketOpen, openNewTicket, closeNewTicket, setActiveSection, activeHitlId } = useNavigationStore();
  const { queueItems } = useHITLStore();
  const { setOpen: setChatOpen, setContext: setChatContext } = useChatStore();
  const appRouter = useRouter();

  // HITL 활성화 시 Chat 자동 열림 + 맥락 브리핑 주입 (기획 §8.1 Critical #3)
  useEffect(() => {
    if (!activeHitlId) return;
    const item = queueItems.find((i) => i.id === activeHitlId);
    if (!item) return;

    // Chat 패널 자동 열기
    setChatOpen(true);

    // HITL 컨텍스트 설정
    setChatContext({ type: "hitl", id: item.id, title: item.title });

    // 맥락 브리핑 메시지 주입 (아직 없는 경우)
    const { histories, addMessage } = useChatStore.getState();
    const contextId = item.id;
    if (!histories[contextId]?.length) {
      addMessage(contextId, {
        id: `briefing-${item.id}`,
        role: "agent",
        agent: "GM",
        content: `**[HITL 브리핑]** ${item.title}\n\n${item.briefing}${item.agentDiscussionSummary ? `\n\n**Agent 논의 요약:** ${item.agentDiscussionSummary}` : ""}\n\n승인, 반려, 에스컬레이션 중 어떻게 처리할지 알려주세요.`,
        timestamp: new Date().toISOString(),
      });
    }
  }, [activeHitlId]);

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
