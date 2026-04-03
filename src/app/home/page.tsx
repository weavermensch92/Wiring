"use client";

export default function HomePage() {
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
      <div className="grid grid-cols-2 gap-4">
        <div className="glass-panel p-4">
          <h2 className="text-sm font-semibold text-[var(--wiring-text-primary)] mb-3">내부 업무</h2>
          <div className="space-y-2">
            {[
              { status: "진행 중", count: 2, color: "var(--wiring-info)" },
              { status: "검토 대기", count: 1, color: "var(--wiring-warning)" },
              { status: "예정", count: 4, color: "var(--wiring-text-tertiary)" },
            ].map((item) => (
              <div key={item.status} className="flex items-center justify-between text-sm">
                <span className="text-[var(--wiring-text-secondary)]">{item.status}</span>
                <span className="font-medium" style={{ color: item.color }}>{item.count}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="glass-panel p-4">
          <h2 className="text-sm font-semibold text-[var(--wiring-text-primary)] mb-3">외주 업무</h2>
          <div className="space-y-2">
            {[
              { status: "제안 받은", count: 1, color: "var(--wiring-accent)" },
              { status: "진행 중", count: 2, color: "var(--wiring-info)" },
              { status: "정산 대기", count: 0, color: "var(--wiring-text-tertiary)" },
            ].map((item) => (
              <div key={item.status} className="flex items-center justify-between text-sm">
                <span className="text-[var(--wiring-text-secondary)]">{item.status}</span>
                <span className="font-medium" style={{ color: item.color }}>{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
