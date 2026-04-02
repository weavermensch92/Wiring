"use client";

import { IconNav } from "./icon-nav";
import { SubNavPanel } from "./sub-nav-panel";
import { TopBar } from "./top-bar";
import { ChatPanel } from "./chat-panel";
import { MainWorkspace } from "./main-workspace";
import { useLayoutStore } from "@/stores/layout-store";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { chatPanelOpen } = useLayoutStore();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--wiring-bg-primary)]">
      {/* Icon Nav */}
      <IconNav />

      {/* Sub Nav */}
      <SubNavPanel />

      {/* Main area (TopBar + Workspace) */}
      <div className="flex flex-col flex-1 min-w-0">
        <TopBar />
        <MainWorkspace>{children}</MainWorkspace>
      </div>

      {/* Chat Panel */}
      {chatPanelOpen && <ChatPanel />}
    </div>
  );
}
