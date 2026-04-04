"use client";

import { useToastStore, ToastItem, ToastType } from "@/stores/toast-store";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";

const CONFIG: Record<ToastType, { icon: React.ReactNode; color: string; bg: string; border: string }> = {
  success: {
    icon: <CheckCircle2 className="w-4 h-4" />,
    color: "var(--wiring-success)",
    bg: "rgba(34,197,94,0.12)",
    border: "rgba(34,197,94,0.3)",
  },
  error: {
    icon: <XCircle className="w-4 h-4" />,
    color: "var(--wiring-danger)",
    bg: "rgba(239,68,68,0.12)",
    border: "rgba(239,68,68,0.3)",
  },
  warning: {
    icon: <AlertTriangle className="w-4 h-4" />,
    color: "var(--wiring-warning)",
    bg: "rgba(245,158,11,0.12)",
    border: "rgba(245,158,11,0.3)",
  },
  info: {
    icon: <Info className="w-4 h-4" />,
    color: "var(--wiring-info)",
    bg: "rgba(59,130,246,0.12)",
    border: "rgba(59,130,246,0.3)",
  },
};

function ToastCard({ item }: { item: ToastItem }) {
  const { dismiss } = useToastStore();
  const cfg = CONFIG[item.type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 60, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 60, scale: 0.95 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="flex items-start gap-3 rounded-xl px-4 py-3 shadow-2xl min-w-72 max-w-sm cursor-default"
      style={{
        backgroundColor: cfg.bg,
        border: `1px solid ${cfg.border}`,
        backdropFilter: "blur(20px)",
      }}
    >
      {/* Icon */}
      <div className="shrink-0 mt-0.5" style={{ color: cfg.color }}>
        {cfg.icon}
      </div>
      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--wiring-text-primary)]">{item.title}</p>
        {item.body && <p className="text-xs text-[var(--wiring-text-secondary)] mt-0.5">{item.body}</p>}
      </div>
      {/* Close */}
      <button
        onClick={() => dismiss(item.id)}
        className="shrink-0 p-0.5 rounded text-[var(--wiring-text-tertiary)] hover:text-[var(--wiring-text-secondary)] transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}

export function ToastContainer() {
  const { items } = useToastStore();

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 items-end pointer-events-none">
      <AnimatePresence mode="popLayout">
        {items.map((item) => (
          <div key={item.id} className="pointer-events-auto">
            <ToastCard item={item} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
