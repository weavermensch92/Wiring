"use client";

import { useState } from "react";
import { DUMMY_SKILLS, DUMMY_SKILL_DOCUMENTS, DUMMY_SKILL_USAGE_SUMMARY } from "@/dummy/skills";
import { Skill, SkillDocument, SkillCategory } from "@/types/skill";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AGENT_COLORS } from "@/lib/constants";
import { DUMMY_TEAMS } from "@/dummy/teams";
import {
  BookOpen,
  FileText,
  BarChart3,
  Search,
  Tag,
  Clock,
  DollarSign,
  CheckCircle2,
  Zap,
  Globe,
  Users,
  RefreshCw,
  AlertTriangle,
  ChevronRight,
  Sparkles,
  Code2,
  TestTube,
  FileCode,
  Shield,
  Database,
  ListChecks,
} from "lucide-react";

// ─── 유틸 ───
function formatDate(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}.${(d.getMonth() + 1).toString().padStart(2, "0")}.${d.getDate().toString().padStart(2, "0")}`;
}

// ─── 카테고리 설정 ───
const CATEGORY_CONFIG: Record<SkillCategory, { label: string; icon: React.ReactNode; color: string }> = {
  code_review: { label: "코드 리뷰", icon: <Code2 className="w-3.5 h-3.5" />, color: "#8B5CF6" },
  spec_writing: { label: "스펙 작성", icon: <FileCode className="w-3.5 h-3.5" />, color: "#3B82F6" },
  test_generation: { label: "테스트 생성", icon: <TestTube className="w-3.5 h-3.5" />, color: "#10B981" },
  documentation: { label: "문서화", icon: <FileText className="w-3.5 h-3.5" />, color: "#06B6D4" },
  refactoring: { label: "리팩토링", icon: <RefreshCw className="w-3.5 h-3.5" />, color: "#F97316" },
  security: { label: "보안", icon: <Shield className="w-3.5 h-3.5" />, color: "#EF4444" },
  data_analysis: { label: "데이터 분석", icon: <Database className="w-3.5 h-3.5" />, color: "#EAB308" },
  planning: { label: "기획", icon: <ListChecks className="w-3.5 h-3.5" />, color: "#EC4899" },
};

// ─── 문서 타입 설정 ───
const DOC_TYPE_LABELS: Record<SkillDocument["type"], string> = {
  api_docs: "API 문서",
  migration_guide: "마이그레이션 가이드",
  architecture: "아키텍처 문서",
  runbook: "런북",
  onboarding: "온보딩 가이드",
};

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

// ─── 스킬 카드 ───
function SkillCard({ skill, onClick }: { skill: Skill; onClick: () => void }) {
  const catCfg = CATEGORY_CONFIG[skill.category];
  const team = skill.teamId ? DUMMY_TEAMS.find((t) => t.id === skill.teamId) : null;

  return (
    <button
      onClick={onClick}
      className="w-full text-left glass-panel p-4 hover:border-[var(--wiring-accent)] transition-all"
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium"
            style={{ backgroundColor: `${catCfg.color}20`, color: catCfg.color }}
          >
            {catCfg.icon}
            {catCfg.label}
          </span>
          {team ? (
            <span
              className="px-1.5 py-0.5 rounded text-[10px] font-medium text-white"
              style={{ backgroundColor: team.color }}
            >
              {team.abbreviation}
            </span>
          ) : (
            <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] bg-[var(--wiring-glass-bg)] border border-[var(--wiring-glass-border)] text-[var(--wiring-text-tertiary)]">
              <Globe className="w-2.5 h-2.5" />전사
            </span>
          )}
        </div>
        <span className="text-[11px] text-[var(--wiring-success)] shrink-0">{skill.successRate}%</span>
      </div>

      <p className="text-sm font-semibold text-[var(--wiring-text-primary)] mb-1">{skill.title}</p>
      <p className="text-xs text-[var(--wiring-text-tertiary)] line-clamp-2 mb-3">{skill.description}</p>

      <div className="flex flex-wrap gap-1 mb-3">
        {skill.tags.slice(0, 3).map((t) => (
          <span
            key={t}
            className="px-1.5 py-0.5 rounded text-[10px] bg-[var(--wiring-glass-bg)] border border-[var(--wiring-glass-border)] text-[var(--wiring-text-tertiary)]"
          >
            {t}
          </span>
        ))}
      </div>

      <Separator className="bg-[var(--wiring-glass-border)] mb-3" />

      <div className="grid grid-cols-3 gap-2 text-center">
        <div>
          <p className="text-xs font-semibold text-[var(--wiring-text-primary)]">{skill.usageCount}</p>
          <p className="text-[10px] text-[var(--wiring-text-tertiary)]">사용</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-[var(--wiring-text-primary)]">${skill.avgCostUsd.toFixed(1)}</p>
          <p className="text-[10px] text-[var(--wiring-text-tertiary)]">평균 비용</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-[var(--wiring-text-primary)]">{skill.avgDurationMin}분</p>
          <p className="text-[10px] text-[var(--wiring-text-tertiary)]">평균 시간</p>
        </div>
      </div>
    </button>
  );
}

// ─── 스킬 상세 패널 ───
function SkillDetailPanel({ skill, onClose }: { skill: Skill; onClose: () => void }) {
  const catCfg = CATEGORY_CONFIG[skill.category];
  const team = skill.teamId ? DUMMY_TEAMS.find((t) => t.id === skill.teamId) : null;

  return (
    <div className="w-80 shrink-0 border-l border-[var(--wiring-glass-border)] bg-[var(--wiring-bg-secondary)] flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--wiring-glass-border)]">
        <p className="text-sm font-semibold text-[var(--wiring-text-primary)] truncate">{skill.title}</p>
        <button
          onClick={onClose}
          className="p-1 rounded text-[var(--wiring-text-tertiary)] hover:bg-[var(--wiring-glass-hover)] ml-2 shrink-0"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* 배지 */}
          <div className="flex flex-wrap gap-1.5">
            <span
              className="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium"
              style={{ backgroundColor: `${catCfg.color}20`, color: catCfg.color }}
            >
              {catCfg.icon}{catCfg.label}
            </span>
            {team ? (
              <span className="px-2 py-0.5 rounded text-xs font-medium text-white" style={{ backgroundColor: team.color }}>
                {team.name}
              </span>
            ) : (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-[var(--wiring-glass-bg)] border border-[var(--wiring-glass-border)] text-[var(--wiring-text-tertiary)]">
                <Globe className="w-3 h-3" />전사 공통
              </span>
            )}
          </div>

          {/* 설명 */}
          <p className="text-xs text-[var(--wiring-text-secondary)] leading-relaxed">{skill.description}</p>

          {/* 통계 */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { icon: <Zap className="w-3.5 h-3.5" />, label: "총 사용", val: `${skill.usageCount}회` },
              { icon: <CheckCircle2 className="w-3.5 h-3.5" />, label: "성공률", val: `${skill.successRate}%`, good: true },
              { icon: <DollarSign className="w-3.5 h-3.5" />, label: "평균 비용", val: `$${skill.avgCostUsd.toFixed(1)}` },
              { icon: <Clock className="w-3.5 h-3.5" />, label: "평균 시간", val: `${skill.avgDurationMin}분` },
            ].map(({ icon, label, val, good }) => (
              <div key={label} className="glass-panel p-3">
                <div className="flex items-center gap-1 text-[var(--wiring-text-tertiary)] mb-1">{icon}<span className="text-[10px]">{label}</span></div>
                <p className="text-sm font-semibold" style={{ color: good ? "var(--wiring-success)" : "var(--wiring-text-primary)" }}>{val}</p>
              </div>
            ))}
          </div>

          {/* 사용 에이전트 */}
          <div>
            <p className="text-[10px] text-[var(--wiring-text-tertiary)] uppercase font-medium mb-2">사용 에이전트</p>
            <div className="flex gap-1.5 flex-wrap">
              {skill.agentIds.map((id) => (
                <div key={id} className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-[var(--wiring-glass-bg)] border border-[var(--wiring-glass-border)]">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: AGENT_COLORS[id] ?? "#555" }} />
                  <span className="text-xs text-[var(--wiring-text-secondary)]">{id}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 태그 */}
          <div>
            <p className="text-[10px] text-[var(--wiring-text-tertiary)] uppercase font-medium mb-2">태그</p>
            <div className="flex flex-wrap gap-1">
              {skill.tags.map((t) => (
                <span key={t} className="flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-[var(--wiring-glass-bg)] border border-[var(--wiring-glass-border)] text-[var(--wiring-text-tertiary)]">
                  <Tag className="w-2.5 h-2.5" />{t}
                </span>
              ))}
            </div>
          </div>

          {/* 프롬프트 미리보기 */}
          {skill.promptPreview && (
            <div>
              <p className="text-[10px] text-[var(--wiring-text-tertiary)] uppercase font-medium mb-2">프롬프트 미리보기</p>
              <div className="glass-panel p-3 rounded-lg">
                <p className="text-xs text-[var(--wiring-text-secondary)] italic leading-relaxed">{skill.promptPreview}</p>
              </div>
            </div>
          )}

          <p className="text-[10px] text-[var(--wiring-text-tertiary)]">등록: {formatDate(skill.createdAt)}</p>
        </div>
      </ScrollArea>
    </div>
  );
}

// ─── 스킬 라이브러리 탭 ───
function LibraryTab() {
  const [search, setSearch] = useState("");
  const [scopeFilter, setScopeFilter] = useState<"all" | "global" | "team">("all");
  const [catFilter, setCatFilter] = useState<SkillCategory | "all">("all");
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);

  const filtered = DUMMY_SKILLS.filter((s) => {
    if (scopeFilter !== "all" && s.scope !== scopeFilter) return false;
    if (catFilter !== "all" && s.category !== catFilter) return false;
    if (search && !s.title.toLowerCase().includes(search.toLowerCase()) && !s.tags.some((t) => t.includes(search))) return false;
    return true;
  });

  const categories = Array.from(new Set(DUMMY_SKILLS.map((s) => s.category)));

  return (
    <div className="flex gap-4 h-full">
      <div className="flex-1 min-w-0 space-y-4">
        {/* 필터 */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--wiring-glass-bg)] border border-[var(--wiring-glass-border)] text-sm text-[var(--wiring-text-tertiary)] flex-1 max-w-xs">
            <Search className="w-4 h-4 shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="스킬 검색..."
              className="bg-transparent outline-none flex-1 text-[var(--wiring-text-primary)] placeholder:text-[var(--wiring-text-tertiary)] text-xs"
            />
          </div>
          <div className="flex gap-1">
            {(["all", "global", "team"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setScopeFilter(v)}
                className={`px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                  scopeFilter === v ? "bg-[var(--wiring-accent)] text-white" : "text-[var(--wiring-text-tertiary)] hover:bg-[var(--wiring-glass-hover)]"
                }`}
              >
                {v === "all" ? "전체" : v === "global" ? "전사" : "팀별"}
              </button>
            ))}
          </div>
          <div className="flex gap-1 flex-wrap">
            {categories.map((cat) => {
              const cfg = CATEGORY_CONFIG[cat];
              return (
                <button
                  key={cat}
                  onClick={() => setCatFilter(catFilter === cat ? "all" : cat)}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] transition-colors"
                  style={
                    catFilter === cat
                      ? { backgroundColor: `${cfg.color}30`, color: cfg.color, border: `1px solid ${cfg.color}` }
                      : { color: "var(--wiring-text-tertiary)", border: "1px solid var(--wiring-glass-border)" }
                  }
                >
                  {cfg.icon}{cfg.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 스킬 그리드 */}
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((skill) => (
            <SkillCard
              key={skill.id}
              skill={skill}
              onClick={() => setSelectedSkill(selectedSkill?.id === skill.id ? null : skill)}
            />
          ))}
          {filtered.length === 0 && (
            <div className="col-span-2 glass-panel p-10 flex flex-col items-center gap-2">
              <Search className="w-8 h-8 text-[var(--wiring-text-tertiary)]" />
              <p className="text-sm text-[var(--wiring-text-tertiary)]">검색 결과가 없습니다</p>
            </div>
          )}
        </div>
      </div>

      {selectedSkill && (
        <SkillDetailPanel skill={selectedSkill} onClose={() => setSelectedSkill(null)} />
      )}
    </div>
  );
}

// ─── 문서 번들 탭 ───
function DocumentsTab() {
  const statusConfig = {
    ready: { label: "완료", color: "var(--wiring-success)", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
    generating: { label: "생성 중", color: "var(--wiring-warning)", icon: <RefreshCw className="w-3.5 h-3.5 animate-spin" /> },
    outdated: { label: "업데이트 필요", color: "var(--wiring-danger)", icon: <AlertTriangle className="w-3.5 h-3.5" /> },
  };

  return (
    <div className="space-y-3">
      {DUMMY_SKILL_DOCUMENTS.map((doc) => {
        const st = statusConfig[doc.status];
        return (
          <div key={doc.id} className="glass-panel p-4 hover:border-[var(--wiring-text-tertiary)] transition-all">
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 shrink-0 mt-0.5 text-[var(--wiring-text-tertiary)]" />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div>
                    <p className="text-sm font-medium text-[var(--wiring-text-primary)]">{doc.title}</p>
                    <p className="text-xs text-[var(--wiring-text-tertiary)] mt-0.5">{DOC_TYPE_LABELS[doc.type]}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0" style={{ color: st.color }}>
                    {st.icon}
                    <span className="text-[10px]">{st.label}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-[var(--wiring-text-tertiary)] mb-2">
                  {doc.status === "ready" && (
                    <>
                      <span>{doc.pageCount}페이지</span>
                      <span>{doc.sizeKb}KB</span>
                    </>
                  )}
                  <span>업데이트: {formatDate(doc.updatedAt)}</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    {doc.generatedBy.map((id) => (
                      <Avatar key={id} className="w-5 h-5">
                        <AvatarFallback
                          className="text-[8px] font-bold text-white"
                          style={{ backgroundColor: AGENT_COLORS[id] ?? "#555" }}
                        >
                          {id}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {doc.tags.map((t) => (
                      <span
                        key={t}
                        className="px-1.5 py-0.5 rounded text-[10px] bg-[var(--wiring-glass-bg)] border border-[var(--wiring-glass-border)] text-[var(--wiring-text-tertiary)]"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── AI 활용 리포트 탭 ───
function ReportTab() {
  const s = DUMMY_SKILL_USAGE_SUMMARY;
  const maxUsage = Math.max(...s.agentBreakdown.map((a) => a.usageCount));

  return (
    <div className="space-y-5">
      {/* KPI */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "총 스킬 사용", val: `${s.totalUsage}회`, sub: `이번 달 ${s.thisMonthUsage}회` },
          { label: "총 비용", val: `$${s.totalCostUsd.toFixed(1)}`, sub: `이번 달 $${s.thisMonthCostUsd.toFixed(1)}` },
          { label: "활성 스킬", val: `${DUMMY_SKILLS.length}개`, sub: `전사 ${DUMMY_SKILLS.filter((s) => s.scope === "global").length} / 팀 ${DUMMY_SKILLS.filter((s) => s.scope === "team").length}` },
          { label: "평균 성공률", val: `${Math.round(DUMMY_SKILLS.reduce((acc, s) => acc + s.successRate, 0) / DUMMY_SKILLS.length)}%`, sub: "전체 스킬 기준" },
        ].map(({ label, val, sub }) => (
          <div key={label} className="glass-panel p-4">
            <p className="text-xs text-[var(--wiring-text-tertiary)] mb-1">{label}</p>
            <p className="text-2xl font-bold text-[var(--wiring-text-primary)]">{val}</p>
            <p className="text-[11px] text-[var(--wiring-text-tertiary)] mt-1">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* 인기 스킬 TOP 5 */}
        <div className="glass-panel p-4">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-[var(--wiring-accent)]" />
            <p className="text-xs font-medium text-[var(--wiring-text-tertiary)] uppercase">인기 스킬 TOP 5</p>
          </div>
          <div className="space-y-3">
            {s.topSkills.map((skill, idx) => {
              const maxCount = s.topSkills[0].usageCount;
              const pct = Math.round((skill.usageCount / maxCount) * 100);
              return (
                <div key={skill.skillId}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-[var(--wiring-text-tertiary)] w-4">{idx + 1}</span>
                      <span className="text-xs text-[var(--wiring-text-primary)] truncate max-w-[180px]">{skill.title}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] text-[var(--wiring-text-tertiary)]">${skill.costUsd.toFixed(0)}</span>
                      <span className="text-xs font-medium text-[var(--wiring-text-primary)]">{skill.usageCount}회</span>
                    </div>
                  </div>
                  <div className="h-1 rounded-full bg-[var(--wiring-glass-border)] overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, backgroundColor: "var(--wiring-accent)" }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 에이전트별 사용량 */}
        <div className="glass-panel p-4">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-[var(--wiring-text-tertiary)]" />
            <p className="text-xs font-medium text-[var(--wiring-text-tertiary)] uppercase">에이전트별 스킬 사용</p>
          </div>
          <div className="space-y-3">
            {s.agentBreakdown.map((a) => {
              const pct = Math.round((a.usageCount / maxUsage) * 100);
              return (
                <div key={a.agentId}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-5 h-5 shrink-0">
                        <AvatarFallback
                          className="text-[8px] font-bold text-white"
                          style={{ backgroundColor: AGENT_COLORS[a.agentId] ?? "#555" }}
                        >
                          {a.agentId}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-[var(--wiring-text-secondary)]">{a.agentId}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] text-[var(--wiring-text-tertiary)]">${a.costUsd.toFixed(1)}</span>
                      <span className="text-xs font-medium text-[var(--wiring-text-primary)]">{a.usageCount}회</span>
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full bg-[var(--wiring-glass-border)] overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, backgroundColor: AGENT_COLORS[a.agentId] ?? "#555" }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 카테고리별 비용 분포 */}
      <div className="glass-panel p-4">
        <p className="text-xs font-medium text-[var(--wiring-text-tertiary)] uppercase mb-4">카테고리별 스킬 현황</p>
        <div className="grid grid-cols-4 gap-3">
          {Array.from(new Set(DUMMY_SKILLS.map((s) => s.category))).map((cat) => {
            const skills = DUMMY_SKILLS.filter((s) => s.category === cat);
            const cfg = CATEGORY_CONFIG[cat];
            const totalUsage = skills.reduce((sum, s) => sum + s.usageCount, 0);
            const avgSuccess = Math.round(skills.reduce((sum, s) => sum + s.successRate, 0) / skills.length);
            return (
              <div key={cat} className="glass-panel p-3">
                <div
                  className="flex items-center gap-1.5 mb-2 text-xs font-medium"
                  style={{ color: cfg.color }}
                >
                  {cfg.icon}
                  <span>{cfg.label}</span>
                </div>
                <p className="text-lg font-bold text-[var(--wiring-text-primary)]">{skills.length}개</p>
                <p className="text-[11px] text-[var(--wiring-text-tertiary)]">{totalUsage}회 · {avgSuccess}%</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── 메인 ───
type Tab = "library" | "documents" | "report";

export default function SkillsPage() {
  const searchParams = typeof window !== "undefined"
    ? new URLSearchParams(window.location.search)
    : null;
  const initialTab = (searchParams?.get("tab") as Tab) || "library";
  const [tab, setTab] = useState<Tab>(initialTab);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-5">
          <div>
            <h1 className="text-xl font-semibold text-[var(--wiring-text-primary)] mb-4">스킬</h1>
            <div className="flex gap-2">
              <TabBtn active={tab === "library"} onClick={() => setTab("library")} icon={<BookOpen className="w-4 h-4" />}>
                스킬 라이브러리
              </TabBtn>
              <TabBtn active={tab === "documents"} onClick={() => setTab("documents")} icon={<FileText className="w-4 h-4" />}>
                문서 번들
              </TabBtn>
              <TabBtn active={tab === "report"} onClick={() => setTab("report")} icon={<BarChart3 className="w-4 h-4" />}>
                AI 활용 리포트
              </TabBtn>
            </div>
          </div>

          {tab === "library" && <LibraryTab />}
          {tab === "documents" && <DocumentsTab />}
          {tab === "report" && <ReportTab />}
        </div>
      </ScrollArea>
    </div>
  );
}
