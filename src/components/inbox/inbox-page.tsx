"use client";

import { useEffect } from "react";
import { useNavigationStore } from "@/stores/navigation-store";
import { InboxMessageList } from "./inbox-message-list";
import { InboxMessageDetail } from "./inbox-message-detail";

export function InboxPage() {
  const { setActiveSection } = useNavigationStore();

  useEffect(() => {
    setActiveSection("inbox");
  }, [setActiveSection]);

  return (
    <div className="flex h-full">
      {/* Message list */}
      <div className="w-[400px] shrink-0">
        <InboxMessageList />
      </div>
      {/* Message detail */}
      <div className="flex-1 min-w-0">
        <InboxMessageDetail />
      </div>
    </div>
  );
}
