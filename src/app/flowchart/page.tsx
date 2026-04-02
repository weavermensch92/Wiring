"use client";

export default function FlowchartPage() {
  return (
    <div className="p-6 h-full flex flex-col">
      <h1 className="text-xl font-semibold text-[var(--wiring-text-primary)] mb-6">플로차트</h1>
      <div className="flex-1 glass-panel flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-[var(--wiring-text-secondary)] mb-1">React Flow 캔버스</p>
          <p className="text-xs text-[var(--wiring-text-tertiary)]">Phase 3에서 구현 예정</p>
        </div>
      </div>
    </div>
  );
}
