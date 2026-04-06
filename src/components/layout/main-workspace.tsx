"use client";

import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigationStore } from "@/stores/navigation-store";
import { HitlWorkspacePanel } from "@/components/hitl/hitl-workspace-panel";

interface MainWorkspaceProps {
  children: React.ReactNode;
}

export function MainWorkspace({ children }: MainWorkspaceProps) {
  const pathname = usePathname();
  const { activeHitlId } = useNavigationStore();

  return (
    <main data-tour="main-workspace" className="flex-1 overflow-y-auto bg-[var(--wiring-bg-primary)] relative">
      <AnimatePresence mode="wait">
        {activeHitlId ? (
          // HITL 아이템 활성 시 Main 전체를 HITL 패널로 전환 (기획 §8.1)
          <motion.div
            key={`hitl-${activeHitlId}`}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
            transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
            className="h-full"
          >
            <HitlWorkspacePanel />
          </motion.div>
        ) : (
          // 일반 페이지 콘텐츠
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
            className="h-full"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
