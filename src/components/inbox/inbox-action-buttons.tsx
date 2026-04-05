"use client";

import { InboxAction } from "@/types/inbox";
import { useInboxStore } from "@/stores/inbox-store";
import { useRouter } from "next/navigation";

const VARIANT_CLASSES: Record<string, string> = {
  primary: "bg-[var(--wiring-success)] hover:bg-[var(--wiring-success)]/80 text-black",
  danger: "bg-[var(--wiring-danger)] hover:bg-[var(--wiring-danger)]/80 text-white",
  secondary: "bg-[var(--wiring-glass-bg)] hover:bg-[var(--wiring-glass-hover)] text-[var(--wiring-text-primary)] border border-[var(--wiring-glass-border)]",
};

export function InboxActionButtons({ messageId, actions }: { messageId: string; actions: InboxAction[] }) {
  const { handleInboxAction } = useInboxStore();
  const router = useRouter();

  if (actions.length === 0) return null;

  return (
    <div className="flex items-center gap-2 pt-4">
      {actions.map((action) => (
        <button
          key={action.id}
          onClick={() => {
            if (action.type === "navigate" && action.hitlItemId) {
              router.push(`/hitl/${action.hitlItemId}`);
            } else if (action.type === "navigate") {
              // Navigate to first attachment href if exists
            } else {
              handleInboxAction(messageId, action.id);
            }
          }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${VARIANT_CLASSES[action.variant] ?? VARIANT_CLASSES.secondary}`}
        >
          {action.label}
        </button>
      ))}
    </div>
  );
}
