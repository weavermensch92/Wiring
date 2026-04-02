"use client";

import { DUMMY_AGENTS } from "@/dummy/agents";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function AgentsPage() {
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold text-[var(--wiring-text-primary)] mb-6">에이전트 현황</h1>
      <div className="grid grid-cols-3 gap-4">
        {DUMMY_AGENTS.map((agent) => (
          <div key={agent.id} className="glass-panel p-4">
            <div className="flex items-center gap-3 mb-2">
              <Avatar className="w-8 h-8">
                <AvatarFallback
                  className="text-xs font-bold text-white"
                  style={{ backgroundColor: agent.color }}
                >
                  {agent.avatar}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-sm font-medium text-[var(--wiring-text-primary)]">{agent.name}</p>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      agent.status === "active" ? "bg-[var(--wiring-success)]" : "bg-[var(--wiring-text-tertiary)]"
                    }`}
                  />
                  <span className="text-[10px] text-[var(--wiring-text-tertiary)]">
                    {agent.status === "active" ? "활성" : "대기"}
                  </span>
                </div>
              </div>
            </div>
            {agent.currentTask && (
              <p className="text-xs text-[var(--wiring-text-secondary)] truncate">
                {agent.currentTask}
              </p>
            )}
          </div>
        ))}
      </div>
      <p className="text-xs text-[var(--wiring-text-tertiary)] mt-4">Phase 6에서 상세 구현 예정</p>
    </div>
  );
}
