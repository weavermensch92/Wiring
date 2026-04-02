"use client";

export default function ExternalPage() {
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold text-[var(--wiring-text-primary)] mb-6">외부 업무</h1>
      <div className="flex gap-4 mb-6">
        {["새 업무 제안", "진행 중", "완료 / 정산"].map((tab) => (
          <button
            key={tab}
            className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
              tab === "새 업무 제안"
                ? "bg-[var(--wiring-accent-glow)] text-[var(--wiring-accent)]"
                : "text-[var(--wiring-text-tertiary)] hover:bg-[var(--wiring-glass-hover)]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="glass-panel p-6 flex items-center justify-center min-h-[200px]">
        <p className="text-xs text-[var(--wiring-text-tertiary)]">Phase 7에서 구현 예정</p>
      </div>
    </div>
  );
}
