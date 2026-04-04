"use client";

import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

interface MainWorkspaceProps {
  children: React.ReactNode;
}

export function MainWorkspace({ children }: MainWorkspaceProps) {
  const pathname = usePathname();

  return (
    <main data-tour="main-workspace" className="flex-1 overflow-y-auto bg-[var(--wiring-bg-primary)]">
      <AnimatePresence mode="wait">
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
      </AnimatePresence>
    </main>
  );
}
