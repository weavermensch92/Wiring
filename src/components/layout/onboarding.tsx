"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { CURRENT_USER } from "@/dummy/users";
import { DUMMY_TEAMS } from "@/dummy/teams";
import {
  Bot, Zap, GitBranch, BarChart3, MessageSquare,
  ArrowRight, CheckCircle2, X, Keyboard,
} from "lucide-react";

const ONBOARDING_KEY = "wiring-onboarded-v1";

interface Step {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  highlight?: string;
}

const STEPS: Step[] = [
  {
    id: "welcome",
    title: `안녕하세요, ${CURRENT_USER.name}님!`,
    description: "GRIDGE Wiring AI에 오신 것을 환영합니다. AI 에이전트 기반 개발 관리 그룹웨어입니다. 주요 기능을 빠르게 소개해 드릴게요.",
    icon: <Zap className="w-8 h-8" />,
    color: "var(--wiring-accent)",
  },
  {
    id: "agents",
    title: "AI 에이전트가 일합니다",
    description: "PM·FE·BE·GM 등 9종의 AI 에이전트가 티켓을 처리합니다. 사람은 중요한 결정(HITL)만 승인하면 됩니다.",
    icon: <Bot className="w-8 h-8" />,
    color: "#8B5CF6",
    highlight: "/agents",
  },
  {
    id: "hitl",
    title: "HITL로 최종 결정권을",
    description: "Human-in-the-Loop: AI가 위험하거나 중요한 작업을 요청하면 당신의 승인을 기다립니다. 상단 HITL 배지를 확인하세요.",
    icon: <CheckCircle2 className="w-8 h-8" />,
    color: "var(--hitl-waiting)",
    highlight: "top-bar HITL",
  },
  {
    id: "search",
    title: "커맨드 팔레트로 빠르게",
    description: "Cmd+K로 어디서든 검색하거나 이동할 수 있습니다. > 페이지 이동, # 티켓 검색, @ 에이전트 검색 모드를 지원합니다.",
    icon: <Keyboard className="w-8 h-8" />,
    color: "var(--wiring-info)",
  },
  {
    id: "analytics",
    title: "분석으로 현황을 파악하세요",
    description: "에이전트 비용 추이, 팀 속도, HITL 대기 시간 등을 분석 대시보드에서 한눈에 확인할 수 있습니다.",
    icon: <BarChart3 className="w-8 h-8" />,
    color: "#10B981",
    highlight: "/analytics",
  },
];

export function OnboardingModal() {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const done = localStorage.getItem(ONBOARDING_KEY);
    if (!done) {
      const timer = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const finish = () => {
    localStorage.setItem(ONBOARDING_KEY, "true");
    setVisible(false);
  };

  const next = () => {
    if (step < STEPS.length - 1) setStep((s) => s + 1);
    else finish();
  };

  const current = STEPS[step];

  return (
    <AnimatePresence>
      {visible && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[201] w-full max-w-md"
          >
            <div
              className="rounded-2xl overflow-hidden border border-[var(--wiring-glass-border)]"
              style={{ backgroundColor: "var(--wiring-bg-secondary)", boxShadow: "0 40px 100px rgba(0,0,0,0.8)" }}
            >
              {/* Header */}
              <div className="px-6 pt-6 pb-4 flex items-start justify-between">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-white"
                  style={{ backgroundColor: `${current.color}20`, color: current.color }}
                >
                  {current.icon}
                </div>
                <button onClick={finish} className="p-1.5 rounded-lg text-[var(--wiring-text-tertiary)] hover:bg-[var(--wiring-glass-hover)] transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Content */}
              <div className="px-6 pb-6">
                <h2 className="text-lg font-bold text-[var(--wiring-text-primary)] mb-2">{current.title}</h2>
                <p className="text-sm text-[var(--wiring-text-secondary)] leading-relaxed">{current.description}</p>
                {current.highlight && (
                  <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--wiring-accent-glow)] border border-[var(--wiring-accent)]/20">
                    <ArrowRight className="w-3.5 h-3.5 text-[var(--wiring-accent)]" />
                    <span className="text-xs text-[var(--wiring-accent)]">{current.highlight} 바로가기</span>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 pb-6 flex items-center justify-between">
                {/* Step dots */}
                <div className="flex items-center gap-1.5">
                  {STEPS.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setStep(i)}
                      className={`rounded-full transition-all ${i === step ? "w-6 h-2" : "w-2 h-2 hover:bg-[var(--wiring-text-secondary)]"}`}
                      style={{ backgroundColor: i === step ? current.color : "var(--wiring-glass-border)" }}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button onClick={finish} className="text-xs text-[var(--wiring-text-tertiary)] hover:text-[var(--wiring-text-secondary)] transition-colors px-3 py-1.5">
                    건너뛰기
                  </button>
                  <button
                    onClick={next}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90"
                    style={{ backgroundColor: current.color }}
                  >
                    {step < STEPS.length - 1 ? "다음" : "시작하기"}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
