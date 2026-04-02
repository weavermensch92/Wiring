"use client";

import { useParams } from "next/navigation";

export default function HITLDetailPage() {
  const params = useParams();
  const itemId = params.itemId as string;

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold text-[var(--wiring-text-primary)] mb-2">HITL 상세</h1>
      <p className="text-sm text-[var(--wiring-text-secondary)] mb-6">ID: {itemId}</p>
      <div className="glass-panel p-6 flex items-center justify-center min-h-[300px]">
        <p className="text-xs text-[var(--wiring-text-tertiary)]">Phase 4에서 구현 예정</p>
      </div>
    </div>
  );
}
