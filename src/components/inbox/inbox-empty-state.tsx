"use client";

import { Inbox, Archive, Star, Clock } from "lucide-react";
import { InboxFolder } from "@/types/inbox";

const FOLDER_CONTENT: Record<InboxFolder, { icon: React.ReactNode; title: string; description: string }> = {
  all: { icon: <Inbox className="w-10 h-10" />, title: "인박스가 비어있습니다", description: "에이전트로부터 새로운 메시지가 도착하면 여기에 표시됩니다." },
  unread: { icon: <Inbox className="w-10 h-10" />, title: "읽지 않은 메시지 없음", description: "모든 메시지를 확인했습니다." },
  starred: { icon: <Star className="w-10 h-10" />, title: "중요 표시된 메시지 없음", description: "메시지에 별표를 달면 여기에 표시됩니다." },
  hitl: { icon: <Clock className="w-10 h-10" />, title: "HITL 요청 없음", description: "대기 중인 승인 요청이 없습니다." },
  agent: { icon: <Inbox className="w-10 h-10" />, title: "메시지 없음", description: "해당 에이전트의 메시지가 없습니다." },
  archive: { icon: <Archive className="w-10 h-10" />, title: "보관함이 비어있습니다", description: "보관한 메시지가 여기에 표시됩니다." },
};

export function InboxEmptyState({ folder }: { folder: InboxFolder }) {
  const content = FOLDER_CONTENT[folder];
  return (
    <div className="flex flex-col items-center justify-center h-full text-[var(--wiring-text-tertiary)] gap-3 px-8">
      {content.icon}
      <p className="text-sm font-medium text-[var(--wiring-text-secondary)]">{content.title}</p>
      <p className="text-xs text-center">{content.description}</p>
    </div>
  );
}

export function InboxDetailEmpty() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-[var(--wiring-text-tertiary)] gap-3">
      <Inbox className="w-12 h-12" />
      <p className="text-sm text-[var(--wiring-text-secondary)]">메시지를 선택하세요</p>
    </div>
  );
}
