"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useContextStore } from "@/stores/context-store";
import { ContextSourceType } from "@/types/context";
import {
  GitBranch, FileText, Hash, Database, PenSquare, Cpu,
  BookOpen, Globe, CheckCircle2, Loader2, ArrowRight, Sparkles,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// ─── Source 설정 ──────────────────────────────────────────

const SOURCE_DEFS: {
  type: ContextSourceType;
  label: string;
  icon: typeof GitBranch;
  color: string;
  description: string;
  placeholder: string;
}[] = [
  { type: "git",         label: "Git",         icon: GitBranch, color: "#6366F1", description: "코드 구조, PR 히스토리, 브랜치 전략", placeholder: "https://github.com/your-org/repo" },
  { type: "notion",      label: "Notion",       icon: FileText,  color: "#F97316", description: "기획서, PRD, ADR, 온보딩 문서",        placeholder: "https://notion.so/your-workspace" },
  { type: "slack",       label: "Slack",        icon: Hash,      color: "#10B981", description: "기술 의사결정, 채널 컨텍스트",          placeholder: "https://your-team.slack.com" },
  { type: "db",          label: "DB",           icon: Database,  color: "#3B82F6", description: "스키마, 테이블 구조, 데이터 분류",      placeholder: "postgresql://host:5432/dbname" },
  { type: "figma",       label: "Figma",        icon: PenSquare, color: "#EC4899", description: "디자인 시스템, 컴포넌트 변경",          placeholder: "https://figma.com/team/..." },
  { type: "ci_cd",       label: "CI/CD",        icon: Cpu,       color: "#8B5CF6", description: "배포 규칙, 테스트 커버리지",            placeholder: "https://github.com/.../actions" },
];

// ─── 분석 결과 더미 ───────────────────────────────────────

const ANALYSIS_RESULT = {
  stack: ["Next.js 16", "TypeScript", "PostgreSQL", "Redis", "Tailwind CSS", "pnpm"],
  patterns: ["REST API", "모노레포 구조", "GitHub Actions CI/CD", "TDD (Jest)"],
  summary: "Next.js 16 기반 TypeScript 풀스택 SaaS 서비스. REST API 패턴, pnpm 모노레포 구조, GitHub Actions 기반 CI/CD를 사용합니다.",
};

// ─── 단계별 컴포넌트 ──────────────────────────────────────

function Step1({ onNext }: { onNext: () => void }) {
  const [url, setUrl] = useState("");
  const [gitUrl, setGitUrl] = useState("");
  const [analyzing, setAnalyzing] = useState(false);

  const canAnalyze = url.trim() || gitUrl.trim();

  const handleAnalyze = () => {
    if (!canAnalyze) return;
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      onNext();
    }, 1800);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-[var(--wiring-text-primary)] mb-1">
          프로덕트 정보 입력
        </h2>
        <p className="text-sm text-[var(--wiring-text-tertiary)]">
          하나 이상 입력하면 AI가 회사 기술 환경을 자동 분석합니다.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-medium text-[var(--wiring-text-secondary)] flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5" /> 프로덕트 URL
          </label>
          <Input
            placeholder="https://your-product.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="bg-[var(--wiring-glass-bg)] border-[var(--wiring-glass-border)]"
          />
          <p className="text-[10px] text-[var(--wiring-text-tertiary)]">
            크롤링으로 UI 구조, 기능, 기술 스택을 자동 추론합니다
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-[var(--wiring-glass-border)]" />
          <span className="text-[10px] text-[var(--wiring-text-tertiary)]">또는</span>
          <div className="flex-1 h-px bg-[var(--wiring-glass-border)]" />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-[var(--wiring-text-secondary)] flex items-center gap-1.5">
            <GitBranch className="w-3.5 h-3.5" /> 소스코드 레포지토리
          </label>
          <Input
            placeholder="https://github.com/your-org/repo"
            value={gitUrl}
            onChange={(e) => setGitUrl(e.target.value)}
            className="bg-[var(--wiring-glass-bg)] border-[var(--wiring-glass-border)]"
          />
          <p className="text-[10px] text-[var(--wiring-text-tertiary)]">
            아키텍처, 패키지, 컨벤션, API 구조를 더 정확하게 분석합니다
          </p>
        </div>
      </div>

      <Button
        onClick={handleAnalyze}
        disabled={!canAnalyze || analyzing}
        className="w-full gap-2"
      >
        {analyzing ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            AI 분석 중...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            분석 시작
          </>
        )}
      </Button>
    </div>
  );
}

function Step2({ onNext }: { onNext: () => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-[var(--wiring-text-primary)] mb-1">
          AI 분석 결과 확인
        </h2>
        <p className="text-sm text-[var(--wiring-text-tertiary)]">
          분석된 내용을 확인하고 보충할 정보를 추가하세요.
        </p>
      </div>

      {/* 요약 */}
      <div className="p-4 rounded-xl bg-[var(--wiring-accent-glow)] border border-[var(--wiring-accent)]/20">
        <div className="flex items-start gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-[var(--wiring-accent)] mt-0.5 shrink-0" />
          <p className="text-sm text-[var(--wiring-text-secondary)] leading-relaxed">
            {ANALYSIS_RESULT.summary}
          </p>
        </div>
      </div>

      {/* 기술 스택 */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-[var(--wiring-text-tertiary)] uppercase tracking-widest">
          감지된 기술 스택
        </p>
        <div className="flex flex-wrap gap-2">
          {ANALYSIS_RESULT.stack.map((tech) => (
            <span
              key={tech}
              className="px-2.5 py-1 rounded-lg text-xs font-medium bg-[var(--wiring-glass-bg)] border border-[var(--wiring-glass-border)] text-[var(--wiring-text-primary)]"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* 패턴 */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-[var(--wiring-text-tertiary)] uppercase tracking-widest">
          감지된 패턴
        </p>
        <div className="space-y-1.5">
          {ANALYSIS_RESULT.patterns.map((pattern) => (
            <div key={pattern} className="flex items-center gap-2 text-sm text-[var(--wiring-text-secondary)]">
              <CheckCircle2 className="w-3.5 h-3.5 text-[var(--wiring-success)] shrink-0" />
              {pattern}
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" className="flex-1 text-xs" onClick={() => {}}>
          수정하기
        </Button>
        <Button onClick={onNext} className="flex-1 gap-1.5">
          확인 및 계속
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}

function Step3({ onComplete }: { onComplete: () => void }) {
  const { company, connectSource } = useContextStore();
  const sources = company.sources;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-[var(--wiring-text-primary)] mb-1">
          추가 소스 연결
        </h2>
        <p className="text-sm text-[var(--wiring-text-tertiary)]">
          더 많은 소스를 연결할수록 Context Layer가 풍부해지고 Agent 정확도가 올라갑니다.
        </p>
      </div>

      <div className="space-y-2">
        {SOURCE_DEFS.map((def) => {
          const source = sources.find((s) => s.type === def.type);
          const status = source?.status ?? "disconnected";
          const Icon = def.icon;

          return (
            <div
              key={def.type}
              className="flex items-center gap-3 p-3.5 rounded-xl border border-[var(--wiring-glass-border)] bg-[var(--wiring-glass-bg)]"
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: def.color + "20", color: def.color }}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--wiring-text-primary)]">{def.label}</p>
                <p className="text-[10px] text-[var(--wiring-text-tertiary)] truncate">{def.description}</p>
              </div>
              {status === "connected" ? (
                <div className="flex items-center gap-1.5 text-[10px] text-[var(--wiring-success)] shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  연결됨
                </div>
              ) : status === "syncing" ? (
                <div className="flex items-center gap-1.5 text-[10px] text-[var(--wiring-accent)] shrink-0">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  연결 중
                </div>
              ) : (
                <button
                  onClick={() => source && connectSource(source.id)}
                  className="text-[10px] font-medium px-2.5 py-1 rounded-lg transition-colors shrink-0"
                  style={{ backgroundColor: def.color + "20", color: def.color }}
                >
                  연결하기
                </button>
              )}
            </div>
          );
        })}
      </div>

      <Button onClick={onComplete} className="w-full gap-1.5">
        <CheckCircle2 className="w-4 h-4" />
        완료 — Context Layer 활성화
      </Button>
    </div>
  );
}

// ─── Main Wizard ───────────────────────────────────────────

export function ContextSyncWizard() {
  const { setOnboardingStep, completeOnboarding, company } = useContextStore();
  const [step, setStep] = useState(company.onboardingStep === 3 ? 0 : company.onboardingStep);

  const steps = ["진입점 입력", "분석 확인", "소스 연결"];

  const goNext = () => {
    const next = step + 1;
    setStep(next);
    setOnboardingStep(next);
  };

  const handleComplete = () => {
    completeOnboarding();
  };

  return (
    <div className="space-y-8">
      {/* 스텝 인디케이터 */}
      <div className="flex items-center gap-2">
        {steps.map((label, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className={`flex items-center gap-2 ${i === step ? "text-[var(--wiring-text-primary)]" : i < step ? "text-[var(--wiring-success)]" : "text-[var(--wiring-text-tertiary)]"}`}>
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  i < step
                    ? "bg-[var(--wiring-success)] text-white"
                    : i === step
                    ? "bg-[var(--wiring-accent)] text-white"
                    : "bg-[var(--wiring-glass-bg)] border border-[var(--wiring-glass-border)]"
                }`}
              >
                {i < step ? "✓" : i + 1}
              </div>
              <span className="text-xs">{label}</span>
            </div>
            {i < steps.length - 1 && <ChevronRight className="w-3 h-3 text-[var(--wiring-text-tertiary)] shrink-0" />}
          </div>
        ))}
      </div>

      {/* 스텝 콘텐츠 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.2 }}
        >
          {step === 0 && <Step1 onNext={goNext} />}
          {step === 1 && <Step2 onNext={goNext} />}
          {step === 2 && <Step3 onComplete={handleComplete} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
