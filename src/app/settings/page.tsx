"use client";

import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DUMMY_USERS, CURRENT_USER } from "@/dummy/users";
import { DUMMY_TEAMS } from "@/dummy/teams";
import { AGENT_COLORS } from "@/lib/constants";
import {
  Settings,
  Bot,
  Briefcase,
  Users,
  ChevronRight,
  Check,
  DollarSign,
  Zap,
  Shield,
  Globe,
  Clock,
  User,
  Plus,
  Trash2,
  ToggleLeft,
  ToggleRight,
  AlertTriangle,
  Key,
  Sparkles,
} from "lucide-react";
import { ContextTab } from "./context-tab";

// ─── 탭 버튼 ───
function TabBtn({ active, onClick, icon, children }: {
  active: boolean; onClick: () => void; icon: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        active
          ? "bg-[var(--wiring-accent)] text-white"
          : "text-[var(--wiring-text-tertiary)] hover:bg-[var(--wiring-glass-hover)] hover:text-[var(--wiring-text-secondary)]"
      }`}
    >
      {icon}{children}
    </button>
  );
}

// ─── 토글 스위치 ───
function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className="transition-colors"
      style={{ color: value ? "var(--wiring-accent)" : "var(--wiring-text-tertiary)" }}
    >
      {value
        ? <ToggleRight className="w-6 h-6" />
        : <ToggleLeft className="w-6 h-6" />}
    </button>
  );
}

// ─── 설정 행 ───
function SettingRow({ label, desc, children }: { label: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-[var(--wiring-glass-border)] last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--wiring-text-primary)]">{label}</p>
        {desc && <p className="text-xs text-[var(--wiring-text-tertiary)] mt-0.5">{desc}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

// ─── 섹션 헤더 ───
function SectionHeader({ title }: { title: string }) {
  return (
    <p className="text-xs font-medium text-[var(--wiring-text-tertiary)] uppercase tracking-wider mb-3 mt-5 first:mt-0">{title}</p>
  );
}

// ─── AI 설정 탭 ───
function AiSettingsTab() {
  const [hitlMode, setHitlMode] = useState<"always" | "risk_based" | "off">("risk_based");
  const [autoAssign, setAutoAssign] = useState(true);
  const [costAlert, setCostAlert] = useState(true);
  const [costLimit, setCostLimit] = useState("200");
  const [defaultModel, setDefaultModel] = useState("claude-sonnet-4");
  const [parallelAgents, setParallelAgents] = useState(true);
  const [agentLogs, setAgentLogs] = useState(true);

  const models = [
    { id: "claude-sonnet-4", label: "Claude Sonnet 4", desc: "고성능 · 범용", color: "#8B5CF6" },
    { id: "claude-haiku", label: "Claude Haiku", desc: "빠름 · 저비용", color: "#A78BFA" },
    { id: "gpt-4o", label: "GPT-4o", desc: "멀티모달 강점", color: "#10B981" },
    { id: "gemini-2.0-flash", label: "Gemini 2.0 Flash", desc: "경량 · 저비용", color: "#3B82F6" },
  ];

  const hitlOptions = [
    { id: "always", label: "항상 HITL", desc: "모든 에이전트 액션에 승인 요청" },
    { id: "risk_based", label: "리스크 기반 (권장)", desc: "GM이 판단하여 필요 시만 HITL 발행" },
    { id: "off", label: "자동 실행", desc: "승인 없이 에이전트가 자율 실행" },
  ] as const;

  return (
    <div className="space-y-1">
      <SectionHeader title="HITL (Human-in-the-Loop)" />
      <div className="glass-panel p-4">
        <p className="text-xs text-[var(--wiring-text-tertiary)] mb-3">에이전트 액션에 대한 인간 승인 정책</p>
        <div className="space-y-2">
          {hitlOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setHitlMode(opt.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${
                hitlMode === opt.id
                  ? "border-[var(--wiring-accent)] bg-[var(--wiring-accent-glow)]"
                  : "border-[var(--wiring-glass-border)] hover:border-[var(--wiring-text-tertiary)]"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  hitlMode === opt.id ? "border-[var(--wiring-accent)]" : "border-[var(--wiring-text-tertiary)]"
                }`}
              >
                {hitlMode === opt.id && (
                  <div className="w-2 h-2 rounded-full bg-[var(--wiring-accent)]" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--wiring-text-primary)]">{opt.label}</p>
                <p className="text-xs text-[var(--wiring-text-tertiary)]">{opt.desc}</p>
              </div>
              {opt.id === "off" && (
                <div className="ml-auto flex items-center gap-1 text-[var(--wiring-warning)]">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span className="text-[10px]">주의</span>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      <SectionHeader title="에이전트 동작" />
      <div className="glass-panel p-4">
        <SettingRow label="자동 담당자 배정" desc="HR 에이전트가 티켓에 최적 담당자 자동 배정">
          <Toggle value={autoAssign} onChange={setAutoAssign} />
        </SettingRow>
        <SettingRow label="에이전트 병렬 실행" desc="여러 에이전트가 동시에 작업 (비용 증가 가능)">
          <Toggle value={parallelAgents} onChange={setParallelAgents} />
        </SettingRow>
        <SettingRow label="에이전트 소통 로그 저장" desc="에이전트 간 메시지 및 의사결정 기록 보존">
          <Toggle value={agentLogs} onChange={setAgentLogs} />
        </SettingRow>
      </div>

      <SectionHeader title="기본 AI 모델" />
      <div className="glass-panel p-4">
        <p className="text-xs text-[var(--wiring-text-tertiary)] mb-3">에이전트 기본 모델 설정 (에이전트별 개별 설정 가능)</p>
        <div className="grid grid-cols-2 gap-2">
          {models.map((m) => (
            <button
              key={m.id}
              onClick={() => setDefaultModel(m.id)}
              className={`flex items-center gap-2.5 p-3 rounded-lg border transition-all text-left ${
                defaultModel === m.id
                  ? "border-[var(--wiring-accent)] bg-[var(--wiring-accent-glow)]"
                  : "border-[var(--wiring-glass-border)] hover:border-[var(--wiring-text-tertiary)]"
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: m.color }} />
              <div className="min-w-0">
                <p className="text-xs font-medium text-[var(--wiring-text-primary)] truncate">{m.label}</p>
                <p className="text-[10px] text-[var(--wiring-text-tertiary)]">{m.desc}</p>
              </div>
              {defaultModel === m.id && <Check className="w-3.5 h-3.5 ml-auto text-[var(--wiring-accent)] shrink-0" />}
            </button>
          ))}
        </div>
      </div>

      <SectionHeader title="비용 관리" />
      <div className="glass-panel p-4">
        <SettingRow label="월 비용 한도 초과 알림" desc="BM 에이전트가 한도 80% 도달 시 경고">
          <Toggle value={costAlert} onChange={setCostAlert} />
        </SettingRow>
        <div className="py-3 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-[var(--wiring-text-primary)]">월 비용 한도</p>
            <p className="text-xs text-[var(--wiring-text-tertiary)] mt-0.5">초과 시 신규 에이전트 태스크 중단</p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-sm text-[var(--wiring-text-tertiary)]">$</span>
            <input
              type="number"
              value={costLimit}
              onChange={(e) => setCostLimit(e.target.value)}
              className="w-20 bg-[var(--wiring-glass-bg)] border border-[var(--wiring-glass-border)] rounded-lg px-2 py-1.5 text-sm text-[var(--wiring-text-primary)] text-right focus:outline-none focus:border-[var(--wiring-accent)] transition-colors"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 외부 업무 정책 탭 ───
function ExternalPolicyTab() {
  const [allowExternal, setAllowExternal] = useState(true);
  const [hrAutoMatch, setHrAutoMatch] = useState(true);
  const [requireApproval, setRequireApproval] = useState(true);
  const [maxHourlyRate, setMaxHourlyRate] = useState("80");
  const [minMatchScore, setMinMatchScore] = useState("75");
  const [allowAiFull, setAllowAiFull] = useState(true);
  const [allowAiAssisted, setAllowAiAssisted] = useState(true);

  return (
    <div className="space-y-1">
      <SectionHeader title="외부 업무 수신" />
      <div className="glass-panel p-4">
        <SettingRow label="외부 업무 제안 수신" desc="GRIDGE Market에서 외부 업무 제안을 받습니다">
          <Toggle value={allowExternal} onChange={setAllowExternal} />
        </SettingRow>
        <SettingRow label="HR 에이전트 자동 매칭" desc="제안 수신 시 HR이 최적 담당자를 자동으로 분석">
          <Toggle value={hrAutoMatch} onChange={setHrAutoMatch} />
        </SettingRow>
        <SettingRow label="수락 전 CTO 승인 필요" desc="외부 업무 수락 시 L3 이상 승인 필수">
          <Toggle value={requireApproval} onChange={setRequireApproval} />
        </SettingRow>
      </div>

      <SectionHeader title="수락 기준" />
      <div className="glass-panel p-4">
        <div className="py-3 flex items-center justify-between gap-4 border-b border-[var(--wiring-glass-border)]">
          <div>
            <p className="text-sm font-medium text-[var(--wiring-text-primary)]">최대 시급 기준</p>
            <p className="text-xs text-[var(--wiring-text-tertiary)] mt-0.5">이 금액 이하 제안만 표시</p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-sm text-[var(--wiring-text-tertiary)]">$</span>
            <input
              type="number"
              value={maxHourlyRate}
              onChange={(e) => setMaxHourlyRate(e.target.value)}
              className="w-20 bg-[var(--wiring-glass-bg)] border border-[var(--wiring-glass-border)] rounded-lg px-2 py-1.5 text-sm text-[var(--wiring-text-primary)] text-right focus:outline-none focus:border-[var(--wiring-accent)] transition-colors"
            />
            <span className="text-sm text-[var(--wiring-text-tertiary)]">/h</span>
          </div>
        </div>
        <div className="py-3 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-[var(--wiring-text-primary)]">최소 HR 매칭 점수</p>
            <p className="text-xs text-[var(--wiring-text-tertiary)] mt-0.5">이 점수 미만 제안은 자동 필터</p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <input
              type="number"
              value={minMatchScore}
              onChange={(e) => setMinMatchScore(e.target.value)}
              className="w-16 bg-[var(--wiring-glass-bg)] border border-[var(--wiring-glass-border)] rounded-lg px-2 py-1.5 text-sm text-[var(--wiring-text-primary)] text-right focus:outline-none focus:border-[var(--wiring-accent)] transition-colors"
            />
            <span className="text-sm text-[var(--wiring-text-tertiary)]">%</span>
          </div>
        </div>
      </div>

      <SectionHeader title="AI 참여 수준 허용 범위" />
      <div className="glass-panel p-4">
        <SettingRow label="AI 전담 허용" desc="AI 에이전트가 단독으로 외부 업무 수행">
          <Toggle value={allowAiFull} onChange={setAllowAiFull} />
        </SettingRow>
        <SettingRow label="AI 보조 허용" desc="사람이 주도하고 AI가 보조하는 방식">
          <Toggle value={allowAiAssisted} onChange={setAllowAiAssisted} />
        </SettingRow>
        <div className="pt-3">
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[var(--wiring-glass-bg)] border border-[var(--wiring-glass-border)]">
            <Shield className="w-4 h-4 text-[var(--wiring-success)] shrink-0" />
            <p className="text-xs text-[var(--wiring-text-tertiary)]">사람 전담 업무는 항상 허용됩니다</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 팀 관리 탭 ───
function TeamManagementTab() {
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const selectedTeam = DUMMY_TEAMS.find((t) => t.id === selectedTeamId);
  const teamMembers = selectedTeam
    ? DUMMY_USERS.filter((u) => selectedTeam.memberIds.includes(u.id))
    : [];

  const levelColors: Record<string, string> = {
    L1: "var(--wiring-text-tertiary)",
    L2: "var(--wiring-info)",
    L3: "var(--wiring-accent)",
  };

  return (
    <div className="space-y-4">
      <SectionHeader title="팀 목록" />
      <div className="grid grid-cols-2 gap-3">
        {DUMMY_TEAMS.map((team) => {
          const members = DUMMY_USERS.filter((u) => team.memberIds.includes(u.id));
          const isSelected = selectedTeamId === team.id;
          return (
            <button
              key={team.id}
              onClick={() => setSelectedTeamId(isSelected ? null : team.id)}
              className={`glass-panel p-4 text-left transition-all hover:border-[var(--wiring-text-tertiary)] ${
                isSelected ? "border-[var(--wiring-accent)] bg-[var(--wiring-accent-glow)]" : ""
              }`}
            >
              <div className="flex items-center gap-2.5 mb-2">
                <span
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0"
                  style={{ backgroundColor: team.color }}
                >
                  {team.abbreviation}
                </span>
                <div>
                  <p className="text-sm font-medium text-[var(--wiring-text-primary)]">{team.name}</p>
                  <p className="text-[11px] text-[var(--wiring-text-tertiary)]">{team.description}</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-[var(--wiring-text-tertiary)]">
                <span>{members.length}명</span>
                <span>{team.projectIds.length}개 프로젝트</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </button>
          );
        })}
      </div>

      {selectedTeam && (
        <div className="glass-panel overflow-hidden">
          <div className="px-4 py-3 border-b border-[var(--wiring-glass-border)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold text-white" style={{ backgroundColor: selectedTeam.color }}>
                {selectedTeam.abbreviation}
              </span>
              <p className="text-sm font-semibold text-[var(--wiring-text-primary)]">{selectedTeam.name} 팀원</p>
            </div>
            <button className="flex items-center gap-1 text-xs text-[var(--wiring-accent)] hover:underline">
              <Plus className="w-3.5 h-3.5" />팀원 추가
            </button>
          </div>
          <div className="divide-y divide-[var(--wiring-glass-border)]">
            {teamMembers.map((user) => (
              <div key={user.id} className="flex items-center gap-3 px-4 py-3">
                <Avatar className="w-8 h-8 shrink-0">
                  <AvatarFallback className="text-xs font-bold bg-[var(--wiring-accent)] text-white">
                    {user.avatar}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--wiring-text-primary)]">{user.name}</p>
                  <p className="text-xs text-[var(--wiring-text-tertiary)]">{user.role}</p>
                </div>
                <span
                  className="text-xs font-semibold px-2 py-0.5 rounded"
                  style={{
                    color: levelColors[user.level] ?? "var(--wiring-text-tertiary)",
                    backgroundColor: `${levelColors[user.level] ?? "#555"}20`,
                  }}
                >
                  {user.level}
                </span>
                {user.id !== CURRENT_USER.id && (
                  <button className="p-1 rounded text-[var(--wiring-text-tertiary)] hover:text-[var(--wiring-danger)] hover:bg-[var(--wiring-glass-hover)] transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <Separator className="bg-[var(--wiring-glass-border)]" />

      <SectionHeader title="내 프로필" />
      <div className="glass-panel p-4">
        <div className="flex items-center gap-3 mb-4">
          <Avatar className="w-10 h-10 shrink-0">
            <AvatarFallback className="text-sm font-bold bg-[var(--wiring-accent)] text-white">
              {CURRENT_USER.avatar}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-semibold text-[var(--wiring-text-primary)]">{CURRENT_USER.name}</p>
            <p className="text-xs text-[var(--wiring-text-tertiary)]">{CURRENT_USER.email}</p>
          </div>
          <span className="ml-auto px-2 py-0.5 rounded text-xs font-bold text-white" style={{ backgroundColor: "var(--wiring-accent)" }}>
            {CURRENT_USER.level}
          </span>
        </div>
        <div className="space-y-2">
          <SettingRow label="소속 팀">
            <div className="flex gap-1 flex-wrap justify-end">
              {DUMMY_TEAMS.filter((t) => CURRENT_USER.teamIds.includes(t.id)).map((t) => (
                <span key={t.id} className="px-1.5 py-0.5 rounded text-[10px] font-bold text-white" style={{ backgroundColor: t.color }}>
                  {t.abbreviation}
                </span>
              ))}
            </div>
          </SettingRow>
          <SettingRow label="역할">
            <span className="text-sm text-[var(--wiring-text-secondary)]">{CURRENT_USER.role}</span>
          </SettingRow>
        </div>
      </div>

      <SectionHeader title="API 키 관리" />
      <div className="glass-panel p-4 space-y-0">
        {[
          { label: "Anthropic API Key", hint: "sk-ant-••••••••••3f2a", connected: true },
          { label: "OpenAI API Key", hint: "sk-••••••••••••••••9c1d", connected: true },
          { label: "Google AI Key", hint: "연결되지 않음", connected: false },
        ].map(({ label, hint, connected }) => (
          <SettingRow key={label} label={label} desc={hint}>
            <div className="flex items-center gap-2">
              <span className="text-[10px]" style={{ color: connected ? "var(--wiring-success)" : "var(--wiring-text-tertiary)" }}>
                {connected ? "연결됨" : "미연결"}
              </span>
              <button className="text-xs text-[var(--wiring-accent)] hover:underline flex items-center gap-1">
                <Key className="w-3 h-3" />{connected ? "변경" : "연결"}
              </button>
            </div>
          </SettingRow>
        ))}
      </div>
    </div>
  );
}

// ─── 메인 ───
type Tab = "ai" | "external" | "team" | "context";

export default function SettingsPage() {
  const searchParams = typeof window !== "undefined"
    ? new URLSearchParams(window.location.search)
    : null;
  const initialTab = (searchParams?.get("tab") as Tab) || "ai";
  const [tab, setTab] = useState<Tab>(initialTab);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-5">
          <div>
            <h1 className="text-xl font-semibold text-[var(--wiring-text-primary)] mb-4">설정</h1>
            <div className="flex gap-2">
              <TabBtn active={tab === "context"} onClick={() => setTab("context")} icon={<Sparkles className="w-4 h-4" />}>
                회사 맥락
              </TabBtn>
              <TabBtn active={tab === "ai"} onClick={() => setTab("ai")} icon={<Bot className="w-4 h-4" />}>
                AI 설정
              </TabBtn>
              <TabBtn active={tab === "external"} onClick={() => setTab("external")} icon={<Globe className="w-4 h-4" />}>
                외부 업무 정책
              </TabBtn>
              <TabBtn active={tab === "team"} onClick={() => setTab("team")} icon={<Users className="w-4 h-4" />}>
                팀 관리
              </TabBtn>
            </div>
          </div>

          {tab === "context" && <ContextTab />}
          {tab === "ai" && <AiSettingsTab />}
          {tab === "external" && <ExternalPolicyTab />}
          {tab === "team" && <TeamManagementTab />}
        </div>
      </ScrollArea>
    </div>
  );
}
