"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CURRENT_USER } from "@/dummy/users";
import {
  Bot, Zap, BarChart3, MessageSquare, Search,
  ArrowRight, ArrowLeft, X, Keyboard, Inbox,
  AlertTriangle, CheckCircle2, Sparkles,
} from "lucide-react";

// ─── 상수 ───
const TOUR_KEY = "wiring-tour-v2";
const TOUR_SEEN_KEY = "wiring-tour-seen-v2";

// ─── 코치마크 스텝 정의 ───
export interface CoachStep {
  id: string;
  target: string; // data-tour="xxx" selector
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  position: "right" | "bottom" | "left" | "top" | "center";
  action?: string; // 사용자에게 시도해 볼 액션 제안
}

const TOUR_STEPS: CoachStep[] = [
  {
    id: "welcome",
    target: "center", // 화면 중앙에 표시
    title: `${CURRENT_USER.name}님, GRIDGE Wiring AI에 오신 것을 환영합니다!`,
    description: "AI 에이전트가 개발 업무를 처리하고, 사람은 중요한 결정(HITL)만 내리는 관제 센터입니다. 주요 기능을 빠르게 안내해 드릴게요.",
    icon: <Sparkles className="w-6 h-6" />,
    color: "var(--wiring-accent)",
    position: "center",
  },
  {
    id: "icon-nav",
    target: "icon-nav",
    title: "네비게이션 바",
    description: "홈, 팀, 스킬, 거버넌스, 분석 등 주요 섹션으로 빠르게 이동합니다. 팀 아이콘을 클릭하면 해당 팀의 프로젝트를 볼 수 있습니다.",
    icon: <Zap className="w-5 h-5" />,
    color: "var(--wiring-accent)",
    position: "right",
  },
  {
    id: "sub-nav",
    target: "sub-nav",
    title: "컨텍스트 사이드바",
    description: "현재 섹션에 맞는 세부 메뉴가 표시됩니다. 홈에서는 내부 업무/외주 업무/즐겨찾기, 팀에서는 프로젝트 드릴다운이 표시됩니다.",
    icon: <Inbox className="w-5 h-5" />,
    color: "#10B981",
    position: "right",
    action: "Cmd+B로 접기/펼치기를 시도해 보세요",
  },
  {
    id: "main-workspace",
    target: "main-workspace",
    title: "메인 워크스페이스",
    description: "현재 선택한 페이지의 콘텐츠가 여기에 표시됩니다. 홈 대시보드, 칸반 보드, 플로차트, 분석 차트 등 다양한 뷰를 제공합니다.",
    icon: <BarChart3 className="w-5 h-5" />,
    color: "#3B82F6",
    position: "center",
  },
  {
    id: "search",
    target: "search-btn",
    title: "커맨드 팔레트 (⌘K)",
    description: "어디서든 프로젝트, 티켓, 에이전트, 문서를 검색할 수 있습니다. > 페이지 이동, # 티켓 검색, @ 에이전트 검색 모드를 지원합니다.",
    icon: <Search className="w-5 h-5" />,
    color: "var(--wiring-info)",
    position: "bottom",
    action: "Cmd+K를 눌러 직접 시도해 보세요",
  },
  {
    id: "hitl",
    target: "hitl-badge",
    title: "HITL 대기 알림",
    description: "AI 에이전트가 사람의 판단이 필요한 작업을 요청하면 여기에 배지가 표시됩니다. 코드 리뷰, 보안 승인, 비용 승인 등 7가지 유형을 지원합니다.",
    icon: <AlertTriangle className="w-5 h-5" />,
    color: "var(--hitl-waiting)",
    position: "bottom",
    action: "배지를 클릭하면 HITL 큐로 이동합니다",
  },
  {
    id: "chat",
    target: "chat-toggle",
    title: "AI 채팅 패널 (⌘J)",
    description: "Wiring AI와 대화하며 현황을 파악하세요. /status, /hitl, /cost 등 슬래시 커맨드를 지원하고, 현재 페이지 컨텍스트에 맞는 응답을 제공합니다.",
    icon: <MessageSquare className="w-5 h-5" />,
    color: "#EC4899",
    position: "left",
    action: "Cmd+J로 채팅 패널을 열어보세요",
  },
  {
    id: "done",
    target: "center",
    title: "준비 완료!",
    description: "이제 Wiring AI를 사용할 준비가 되었습니다. ?를 누르면 전체 키보드 단축키를 확인할 수 있습니다. 언제든 프로필 > 도움말에서 이 투어를 다시 시작할 수 있습니다.",
    icon: <CheckCircle2 className="w-6 h-6" />,
    color: "var(--wiring-success)",
    position: "center",
  },
];

// ─── 스포트라이트 + 툴팁 위치 계산 ───
function getTargetRect(target: string): DOMRect | null {
  if (target === "center") return null;
  const el = document.querySelector(`[data-tour="${target}"]`);
  return el ? el.getBoundingClientRect() : null;
}

function getTooltipStyle(
  rect: DOMRect | null,
  position: CoachStep["position"],
): React.CSSProperties {
  if (!rect || position === "center") {
    return { position: "fixed", left: "50%", top: "50%", transform: "translate(-50%, -50%)" };
  }

  const gap = 16;
  const tooltipW = 360;
  const tooltipH = 240;
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  let left = 0;
  let top = 0;

  switch (position) {
    case "right":
      left = rect.right + gap;
      top = rect.top + rect.height / 2 - tooltipH / 2;
      break;
    case "left":
      left = rect.left - tooltipW - gap;
      top = rect.top + rect.height / 2 - tooltipH / 2;
      break;
    case "bottom":
      left = rect.left + rect.width / 2 - tooltipW / 2;
      top = rect.bottom + gap;
      break;
    case "top":
      left = rect.left + rect.width / 2 - tooltipW / 2;
      top = rect.top - tooltipH - gap;
      break;
  }

  // 뷰포트 밖으로 밀리면 화면 중앙으로 보정
  if (top + tooltipH > vh - 20) top = vh / 2 - tooltipH / 2;
  if (top < 20) top = 20;
  if (left + tooltipW > vw - 20) left = vw - tooltipW - 20;
  if (left < 20) left = 20;

  return { position: "fixed", left, top };
}

// ─── 스포트라이트 오버레이 (SVG 마스크) ───
function SpotlightOverlay({ rect, padding = 8 }: { rect: DOMRect | null; padding?: number }) {
  if (!rect) {
    // center 모드: 반투명 오버레이만
    return <div className="fixed inset-0 z-[300] bg-black/70 backdrop-blur-sm" />;
  }

  const x = rect.left - padding;
  const y = rect.top - padding;
  const w = rect.width + padding * 2;
  const h = rect.height + padding * 2;
  const r = 12;

  return (
    <svg className="fixed inset-0 z-[300] w-screen h-screen pointer-events-none" style={{ pointerEvents: "auto" }}>
      <defs>
        <mask id="spotlight-mask">
          <rect x="0" y="0" width="100%" height="100%" fill="white" />
          <rect x={x} y={y} width={w} height={h} rx={r} ry={r} fill="black" />
        </mask>
      </defs>
      <rect
        x="0" y="0" width="100%" height="100%"
        fill="rgba(0,0,0,0.72)"
        mask="url(#spotlight-mask)"
      />
      {/* 타겟 주변 glow */}
      <rect
        x={x - 2} y={y - 2} width={w + 4} height={h + 4}
        rx={r + 2} ry={r + 2}
        fill="none"
        stroke="var(--wiring-accent)"
        strokeWidth="2"
        strokeDasharray="6 3"
        opacity="0.6"
      >
        <animate attributeName="stroke-dashoffset" from="0" to="18" dur="1.5s" repeatCount="indefinite" />
      </rect>
    </svg>
  );
}

// ─── 툴팁 카드 ───
function CoachTooltip({
  step,
  currentIdx,
  totalSteps,
  onNext,
  onPrev,
  onSkip,
  style,
}: {
  step: CoachStep;
  currentIdx: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  style: React.CSSProperties;
}) {
  const isFirst = currentIdx === 0;
  const isLast = currentIdx === totalSteps - 1;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92, y: 10 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="z-[301] w-[360px]"
      style={style}
    >
      <div
        className="rounded-2xl overflow-hidden border"
        style={{
          backgroundColor: "var(--wiring-bg-secondary)",
          borderColor: `${step.color}40`,
          boxShadow: `0 24px 64px rgba(0,0,0,0.6), 0 0 40px ${step.color}15`,
        }}
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-3 flex items-start gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${step.color}18`, color: step.color }}
          >
            {step.icon}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-[var(--wiring-text-primary)] leading-snug">{step.title}</h3>
          </div>
          <button
            onClick={onSkip}
            className="p-1 rounded-lg text-[var(--wiring-text-tertiary)] hover:bg-[var(--wiring-glass-hover)] transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 pb-3">
          <p className="text-xs text-[var(--wiring-text-secondary)] leading-relaxed">{step.description}</p>
          {step.action && (
            <div className="mt-2.5 flex items-center gap-2 px-3 py-2 rounded-lg" style={{ backgroundColor: `${step.color}10`, border: `1px solid ${step.color}20` }}>
              <Zap className="w-3 h-3 shrink-0" style={{ color: step.color }} />
              <p className="text-[11px]" style={{ color: step.color }}>{step.action}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 pb-4 flex items-center justify-between">
          {/* Progress dots */}
          <div className="flex items-center gap-1.5">
            {TOUR_STEPS.map((_, i) => (
              <div
                key={i}
                className="rounded-full transition-all"
                style={{
                  width: i === currentIdx ? 18 : 6,
                  height: 6,
                  backgroundColor: i === currentIdx ? step.color : "var(--wiring-glass-border)",
                }}
              />
            ))}
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-2">
            {!isFirst && (
              <button
                onClick={onPrev}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-[var(--wiring-text-tertiary)] hover:bg-[var(--wiring-glass-hover)] transition-colors"
              >
                <ArrowLeft className="w-3 h-3" />
                이전
              </button>
            )}
            <button
              onClick={onNext}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium text-white transition-all hover:opacity-90"
              style={{ backgroundColor: step.color }}
            >
              {isLast ? "시작하기" : "다음"}
              {!isLast && <ArrowRight className="w-3 h-3" />}
            </button>
          </div>
        </div>

        {/* Step counter */}
        <div className="px-5 pb-3 flex items-center justify-between">
          <span className="text-[10px] text-[var(--wiring-text-tertiary)]">
            {currentIdx + 1} / {totalSteps}
          </span>
          {!isLast && (
            <button
              onClick={onSkip}
              className="text-[10px] text-[var(--wiring-text-tertiary)] hover:text-[var(--wiring-text-secondary)] transition-colors"
            >
              건너뛰기
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── 메인 코치마크 컴포넌트 ───
export function OnboardingModal() {
  const [active, setActive] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  // 첫 방문 시 자동 시작
  useEffect(() => {
    const seen = localStorage.getItem(TOUR_SEEN_KEY);
    if (!seen) {
      const timer = setTimeout(() => setActive(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  // 스텝 변경 시 타겟 위치 갱신
  useEffect(() => {
    if (!active) return;
    const step = TOUR_STEPS[stepIdx];
    if (!step) return;

    const update = () => setTargetRect(getTargetRect(step.target));
    update();

    // 리사이즈/스크롤 시 위치 재계산
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [active, stepIdx]);

  const finish = useCallback(() => {
    localStorage.setItem(TOUR_SEEN_KEY, "true");
    setActive(false);
    setStepIdx(0);
  }, []);

  const next = useCallback(() => {
    if (stepIdx < TOUR_STEPS.length - 1) setStepIdx((s) => s + 1);
    else finish();
  }, [stepIdx, finish]);

  const prev = useCallback(() => {
    if (stepIdx > 0) setStepIdx((s) => s - 1);
  }, [stepIdx]);

  // 외부에서 투어 시작 가능하게 전역 함수 등록
  useEffect(() => {
    (window as any).__startWiringTour = () => {
      setStepIdx(0);
      setActive(true);
    };
    return () => { delete (window as any).__startWiringTour; };
  }, []);

  const currentStep = TOUR_STEPS[stepIdx];
  if (!currentStep) return null;

  const tooltipStyle = getTooltipStyle(targetRect, currentStep.position);

  return (
    <AnimatePresence>
      {active && (
        <>
          {/* 스포트라이트 오버레이 */}
          <SpotlightOverlay rect={targetRect} />

          {/* 툴팁 */}
          <CoachTooltip
            key={currentStep.id}
            step={currentStep}
            currentIdx={stepIdx}
            totalSteps={TOUR_STEPS.length}
            onNext={next}
            onPrev={prev}
            onSkip={finish}
            style={tooltipStyle}
          />
        </>
      )}
    </AnimatePresence>
  );
}
