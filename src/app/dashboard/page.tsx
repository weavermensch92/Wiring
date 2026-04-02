"use client";

export default function DashboardPage() {
  return (
    <div className="p-6">
      <div className="glass-panel p-6 mb-6">
        <h1 className="text-xl font-semibold text-[var(--wiring-text-primary)] mb-2">
          GRIDGE Wiring AI
        </h1>
        <p className="text-sm text-[var(--wiring-text-secondary)]">
          AI 기반 개발 관리 관제 센터
        </p>
      </div>
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "전체 티켓", value: "17", color: "var(--wiring-accent)" },
          { label: "진행 중", value: "4", color: "var(--wiring-info)" },
          { label: "HITL 대기", value: "4", color: "var(--wiring-warning)" },
          { label: "이번 주 비용", value: "$245", color: "var(--wiring-success)" },
        ].map((kpi) => (
          <div key={kpi.label} className="glass-panel p-4">
            <p className="text-xs text-[var(--wiring-text-tertiary)] mb-1">{kpi.label}</p>
            <p className="text-2xl font-bold" style={{ color: kpi.color }}>
              {kpi.value}
            </p>
          </div>
        ))}
      </div>
      <p className="text-xs text-[var(--wiring-text-tertiary)]">
        Phase 2에서 상세 대시보드 구현 예정
      </p>
    </div>
  );
}
