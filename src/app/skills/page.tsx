"use client";

export default function SkillsPage() {
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold text-[var(--wiring-text-primary)] mb-6">스킬</h1>
      <div className="flex gap-4 mb-6">
        {["스킬 라이브러리", "문서 번들", "AI 활용 리포트"].map((tab, i) => (
          <button
            key={tab}
            className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
              i === 0
                ? "bg-[var(--wiring-accent-glow)] text-[var(--wiring-accent)]"
                : "text-[var(--wiring-text-tertiary)] hover:bg-[var(--wiring-glass-hover)]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="glass-panel p-6 flex items-center justify-center min-h-[200px]">
        <p className="text-xs text-[var(--wiring-text-tertiary)]">스킬 라이브러리 구현 예정</p>
      </div>
    </div>
  );
}
