"use client";

export default function TicketsPage() {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-[var(--wiring-text-primary)]">티켓 관리</h1>
        <div className="flex gap-2">
          {["칸반", "타임라인", "테이블"].map((view) => (
            <button
              key={view}
              className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                view === "칸반"
                  ? "bg-[var(--wiring-accent-glow)] text-[var(--wiring-accent)]"
                  : "text-[var(--wiring-text-tertiary)] hover:bg-[var(--wiring-glass-hover)]"
              }`}
            >
              {view}
            </button>
          ))}
        </div>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {["Backlog", "To Do", "In Progress", "Review", "Done"].map((col) => (
          <div key={col} className="flex-shrink-0 w-64">
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-sm font-medium text-[var(--wiring-text-primary)]">{col}</h3>
              <span className="text-xs text-[var(--wiring-text-tertiary)] bg-[var(--wiring-glass-bg)] px-1.5 py-0.5 rounded">
                0
              </span>
            </div>
            <div className="glass-panel p-3 min-h-[200px] flex items-center justify-center">
              <p className="text-xs text-[var(--wiring-text-tertiary)]">Phase 2</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
