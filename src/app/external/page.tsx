"use client";

import { useState } from "react";
import {
  DUMMY_EXTERNAL_PROPOSALS,
  DUMMY_EXTERNAL_ACTIVE,
  DUMMY_EXTERNAL_COMPLETED,
  DUMMY_EARNINGS_SUMMARY,
} from "@/dummy/external";
import { ExternalWorkProposal, ExternalWork } from "@/types/external";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Clock,
  DollarSign,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Building2,
  User,
  CalendarDays,
  Tag,
  Bot,
  X,
  TrendingUp,
  Inbox,
} from "lucide-react";
import { DUMMY_USERS } from "@/dummy/users";

// ─── 유틸 ───
function formatDate(iso: string) {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
}

function daysUntil(iso: string) {
  const diff = new Date(iso).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// ─── 긴급도 배지 ───
function UrgencyBadge({ urgency }: { urgency: ExternalWorkProposal["urgency"] }) {
  const map = {
    high: { label: "긴급", color: "var(--wiring-danger)" },
    medium: { label: "보통", color: "var(--wiring-warning)" },
    low: { label: "여유", color: "var(--wiring-success)" },
  };
  const { label, color } = map[urgency];
  return (
    <span
      className="px-1.5 py-0.5 rounded text-[10px] font-medium text-white"
      style={{ backgroundColor: color }}
    >
      {label}
    </span>
  );
}

// ─── AI 참여 수준 배지 ───
function AiLevelBadge({ level }: { level: "full" | "assisted" | "human_only" }) {
  const map = {
    full: { label: "AI 전담", color: "#8B5CF6" },
    assisted: { label: "AI 보조", color: "#3B82F6" },
    human_only: { label: "사람 전담", color: "#6B7280" },
  };
  const { label, color } = map[level];
  return (
    <div className="flex items-center gap-1">
      <Bot className="w-3 h-3" style={{ color }} />
      <span className="text-[10px]" style={{ color }}>{label}</span>
    </div>
  );
}

// ─── 결제 상태 배지 ───
function PaymentBadge({ status }: { status: "pending" | "requested" | "paid" }) {
  const map = {
    pending: { label: "정산 대기", color: "var(--wiring-text-tertiary)" },
    requested: { label: "정산 요청", color: "var(--wiring-warning)" },
    paid: { label: "정산 완료", color: "var(--wiring-success)" },
  };
  const { label, color } = map[status];
  return <span className="text-[10px]" style={{ color }}>{label}</span>;
}

// ─── 매칭 점수 바 ───
function MatchBar({ score }: { score: number }) {
  const color = score >= 90 ? "var(--wiring-success)" : score >= 75 ? "var(--wiring-warning)" : "var(--wiring-danger)";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1 rounded-full bg-[var(--wiring-glass-border)]">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-[11px] font-medium" style={{ color }}>{score}%</span>
    </div>
  );
}

// ─── 제안 상세 Dialog ───
function ProposalDialog({
  proposal,
  onClose,
  onAccept,
}: {
  proposal: ExternalWorkProposal;
  onClose: () => void;
  onAccept: () => void;
}) {
  const assignee = DUMMY_USERS.find((u) => u.id === proposal.recommendedAssignee);
  const days = proposal.deadline ? daysUntil(proposal.deadline) : null;
  const estimatedTotal = proposal.hourlyRate * proposal.estimatedHours;

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl bg-[var(--wiring-bg-secondary)] border-[var(--wiring-glass-border)] text-[var(--wiring-text-primary)]">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <UrgencyBadge urgency={proposal.urgency} />
                <AiLevelBadge level={proposal.aiAssistLevel} />
              </div>
              <DialogTitle className="text-base font-semibold leading-tight">
                {proposal.title}
              </DialogTitle>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-5 pr-2">
            {/* 클라이언트 정보 */}
            <div className="glass-panel p-4 grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[var(--wiring-text-tertiary)] shrink-0" />
                <div>
                  <p className="text-[10px] text-[var(--wiring-text-tertiary)]">의뢰사</p>
                  <p className="text-sm font-medium">{proposal.clientCompany}</p>
                </div>
              </div>
              {proposal.clientContact && (
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-[var(--wiring-text-tertiary)] shrink-0" />
                  <div>
                    <p className="text-[10px] text-[var(--wiring-text-tertiary)]">담당자</p>
                    <p className="text-sm font-medium">{proposal.clientContact}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-[var(--wiring-text-tertiary)] shrink-0" />
                <div>
                  <p className="text-[10px] text-[var(--wiring-text-tertiary)]">시급 / 예상 총액</p>
                  <p className="text-sm font-medium">${proposal.hourlyRate}/h · ${estimatedTotal}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[var(--wiring-text-tertiary)] shrink-0" />
                <div>
                  <p className="text-[10px] text-[var(--wiring-text-tertiary)]">예상 시간</p>
                  <p className="text-sm font-medium">{proposal.estimatedHours}시간</p>
                </div>
              </div>
              {proposal.deadline && (
                <div className="flex items-center gap-2 col-span-2">
                  <CalendarDays className="w-4 h-4 text-[var(--wiring-text-tertiary)] shrink-0" />
                  <div>
                    <p className="text-[10px] text-[var(--wiring-text-tertiary)]">마감</p>
                    <p className="text-sm font-medium">
                      {formatDateTime(proposal.deadline)}
                      <span
                        className="ml-2 text-xs"
                        style={{ color: days !== null && days <= 2 ? "var(--wiring-danger)" : "var(--wiring-text-tertiary)" }}
                      >
                        ({days !== null && days > 0 ? `D-${days}` : "오늘 마감"})
                      </span>
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* 업무 설명 */}
            <div>
              <p className="text-xs font-medium text-[var(--wiring-text-tertiary)] uppercase mb-2">업무 설명</p>
              <p className="text-sm text-[var(--wiring-text-secondary)] leading-relaxed">{proposal.description}</p>
            </div>

            {/* 필요 역량 */}
            <div>
              <p className="text-xs font-medium text-[var(--wiring-text-tertiary)] uppercase mb-2">필요 역량</p>
              <div className="flex flex-wrap gap-1.5">
                {proposal.requiredExpertise.map((ex) => (
                  <div key={ex} className="flex items-center gap-1 px-2 py-1 rounded-full bg-[var(--wiring-glass-bg)] border border-[var(--wiring-glass-border)]">
                    <Tag className="w-3 h-3 text-[var(--wiring-text-tertiary)]" />
                    <span className="text-xs text-[var(--wiring-text-secondary)]">{ex}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* HR 매칭 추천 */}
            {assignee && proposal.matchScore !== undefined && (
              <div>
                <p className="text-xs font-medium text-[var(--wiring-text-tertiary)] uppercase mb-2">
                  HR 에이전트 추천
                </p>
                <div className="glass-panel p-3 flex items-center gap-3">
                  <Avatar className="w-8 h-8 shrink-0">
                    <AvatarFallback className="text-xs font-bold bg-[var(--wiring-accent)] text-white">
                      {assignee.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium">{assignee.name}</p>
                      <span className="text-[10px] text-[var(--wiring-text-tertiary)]">{assignee.level} · {assignee.role}</span>
                    </div>
                    <MatchBar score={proposal.matchScore} />
                  </div>
                </div>
              </div>
            )}

            <Separator className="bg-[var(--wiring-glass-border)]" />

            {/* 액션 버튼 */}
            <div className="flex gap-3">
              <button
                onClick={onAccept}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium bg-[var(--wiring-accent)] text-white hover:opacity-90 transition-opacity"
              >
                수락하기
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium border border-[var(--wiring-glass-border)] text-[var(--wiring-text-secondary)] hover:bg-[var(--wiring-glass-hover)] transition-colors"
              >
                거절
              </button>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

// ─── 제안 카드 ───
function ProposalCard({ proposal, onClick }: { proposal: ExternalWorkProposal; onClick: () => void }) {
  const days = proposal.deadline ? daysUntil(proposal.deadline) : null;
  const estimatedTotal = proposal.hourlyRate * proposal.estimatedHours;

  return (
    <button
      onClick={onClick}
      className="w-full text-left glass-panel p-4 hover:border-[var(--wiring-accent)] transition-all"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <UrgencyBadge urgency={proposal.urgency} />
          <AiLevelBadge level={proposal.aiAssistLevel} />
        </div>
        {days !== null && (
          <span
            className="text-[10px] shrink-0"
            style={{ color: days <= 2 ? "var(--wiring-danger)" : "var(--wiring-text-tertiary)" }}
          >
            D-{days}
          </span>
        )}
      </div>

      <p className="text-sm font-medium text-[var(--wiring-text-primary)] mb-1 text-left">{proposal.title}</p>
      <p className="text-xs text-[var(--wiring-text-tertiary)] mb-3 text-left">{proposal.clientCompany}</p>

      {proposal.matchScore !== undefined && (
        <div className="mb-3">
          <MatchBar score={proposal.matchScore} />
        </div>
      )}

      <div className="flex flex-wrap gap-1 mb-3">
        {proposal.requiredExpertise.slice(0, 3).map((ex) => (
          <span
            key={ex}
            className="px-1.5 py-0.5 rounded text-[10px] bg-[var(--wiring-glass-bg)] border border-[var(--wiring-glass-border)] text-[var(--wiring-text-tertiary)]"
          >
            {ex}
          </span>
        ))}
        {proposal.requiredExpertise.length > 3 && (
          <span className="text-[10px] text-[var(--wiring-text-tertiary)]">+{proposal.requiredExpertise.length - 3}</span>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-[var(--wiring-text-secondary)]">
        <span>${proposal.hourlyRate}/h · {proposal.estimatedHours}h</span>
        <span className="font-medium text-[var(--wiring-text-primary)]">${estimatedTotal}</span>
      </div>
    </button>
  );
}

// ─── 진행 중 카드 ───
function ActiveWorkCard({ work }: { work: ExternalWork }) {
  const progress = Math.round((work.hoursWorked / work.totalHours) * 100);
  const earned = work.hourlyRate * work.hoursWorked;

  return (
    <div className="glass-panel p-4">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <p className="text-sm font-medium text-[var(--wiring-text-primary)]">{work.title}</p>
          <p className="text-xs text-[var(--wiring-text-tertiary)] mt-0.5">{work.clientCompany}</p>
        </div>
        <AiLevelBadge level={work.aiAssistLevel} />
      </div>

      <div className="mb-3">
        <div className="flex items-center justify-between text-xs text-[var(--wiring-text-tertiary)] mb-1">
          <span>{work.hoursWorked}h / {work.totalHours}h</span>
          <span>{progress}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-[var(--wiring-glass-border)] overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${progress}%`,
              backgroundColor: progress >= 80 ? "var(--wiring-warning)" : "var(--wiring-accent)",
            }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-[var(--wiring-text-tertiary)]">
          <User className="w-3 h-3" />
          <span>{work.assigneeName}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <DollarSign className="w-3 h-3 text-[var(--wiring-text-tertiary)]" />
          <span className="text-[var(--wiring-text-primary)] font-medium">${earned}</span>
          <span className="text-[var(--wiring-text-tertiary)]">/ ${work.hourlyRate * work.totalHours}</span>
        </div>
      </div>

      {work.deliverables && (
        <div className="mt-3 pt-3 border-t border-[var(--wiring-glass-border)]">
          <p className="text-[10px] text-[var(--wiring-text-tertiary)] mb-1">산출물</p>
          <div className="space-y-0.5">
            {work.deliverables.map((d, i) => (
              <div key={i} className="flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-[var(--wiring-text-tertiary)]" />
                <span className="text-xs text-[var(--wiring-text-secondary)]">{d}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── 완료 카드 ───
function CompletedWorkCard({ work }: { work: ExternalWork }) {
  return (
    <div className="glass-panel p-4">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[var(--wiring-text-primary)] truncate">{work.title}</p>
          <p className="text-xs text-[var(--wiring-text-tertiary)] mt-0.5">{work.clientCompany}</p>
        </div>
        <PaymentBadge status={work.paymentStatus} />
      </div>

      <div className="flex items-center justify-between text-xs mt-3">
        <div className="flex items-center gap-1 text-[var(--wiring-text-tertiary)]">
          <CalendarDays className="w-3 h-3" />
          <span>{work.completedAt ? formatDate(work.completedAt) : "—"}</span>
        </div>
        <div className="flex items-center gap-1">
          <User className="w-3 h-3 text-[var(--wiring-text-tertiary)]" />
          <span className="text-[var(--wiring-text-tertiary)]">{work.assigneeName}</span>
        </div>
        <div className="flex items-center gap-1">
          <DollarSign className="w-3 h-3 text-[var(--wiring-success)]" />
          <span className="font-medium text-[var(--wiring-success)]">${work.totalEarnings}</span>
        </div>
      </div>
    </div>
  );
}

// ─── 탭 버튼 ───
function TabBtn({
  active,
  onClick,
  children,
  count,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  count?: number;
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
      {children}
      {count !== undefined && count > 0 && (
        <span
          className={`text-[10px] px-1.5 py-0.5 rounded-full ${
            active ? "bg-white/20 text-white" : "bg-[var(--wiring-glass-bg)] text-[var(--wiring-text-tertiary)]"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}

// ─── 메인 페이지 ───
type Tab = "proposals" | "active" | "completed";

export default function ExternalPage() {
  const [tab, setTab] = useState<Tab>("proposals");
  const [selectedProposal, setSelectedProposal] = useState<ExternalWorkProposal | null>(null);
  const [acceptedIds, setAcceptedIds] = useState<Set<string>>(new Set());

  const proposals = DUMMY_EXTERNAL_PROPOSALS.filter((p) => !acceptedIds.has(p.id));
  const summary = DUMMY_EARNINGS_SUMMARY;

  function handleAccept(proposal: ExternalWorkProposal) {
    setAcceptedIds((prev) => new Set([...prev, proposal.id]));
    setSelectedProposal(null);
    setTab("active");
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* 제안 상세 Dialog */}
      {selectedProposal && (
        <ProposalDialog
          proposal={selectedProposal}
          onClose={() => setSelectedProposal(null)}
          onAccept={() => handleAccept(selectedProposal)}
        />
      )}

      <ScrollArea className="flex-1">
        <div className="p-6 space-y-6">
          {/* 상단 KPI */}
          <div>
            <h1 className="text-xl font-semibold text-[var(--wiring-text-primary)] mb-4">외부 업무</h1>
            <div className="grid grid-cols-4 gap-3">
              <div className="glass-panel p-4">
                <p className="text-xs text-[var(--wiring-text-tertiary)] mb-1">누적 수익</p>
                <p className="text-2xl font-bold text-[var(--wiring-text-primary)]">${summary.totalEarnings}</p>
              </div>
              <div className="glass-panel p-4">
                <p className="text-xs text-[var(--wiring-text-tertiary)] mb-1">이번 달</p>
                <p className="text-2xl font-bold" style={{ color: "var(--wiring-success)" }}>
                  ${summary.thisMonthEarnings}
                </p>
              </div>
              <div className="glass-panel p-4">
                <p className="text-xs text-[var(--wiring-text-tertiary)] mb-1">정산 대기</p>
                <p className="text-2xl font-bold" style={{ color: "var(--wiring-warning)" }}>
                  ${summary.pendingPayment}
                </p>
              </div>
              <div className="glass-panel p-4">
                <p className="text-xs text-[var(--wiring-text-tertiary)] mb-1">완료 건수</p>
                <p className="text-2xl font-bold text-[var(--wiring-text-primary)]">{summary.completedCount}</p>
              </div>
            </div>
          </div>

          {/* 탭 */}
          <div className="flex gap-2">
            <TabBtn active={tab === "proposals"} onClick={() => setTab("proposals")} count={proposals.length}>
              <Inbox className="w-4 h-4" />
              새 제안
            </TabBtn>
            <TabBtn active={tab === "active"} onClick={() => setTab("active")} count={DUMMY_EXTERNAL_ACTIVE.length}>
              <Zap className="w-4 h-4" />
              진행 중
            </TabBtn>
            <TabBtn active={tab === "completed"} onClick={() => setTab("completed")} count={DUMMY_EXTERNAL_COMPLETED.length}>
              <CheckCircle2 className="w-4 h-4" />
              완료 / 정산
            </TabBtn>
          </div>

          {/* 탭 콘텐츠 */}
          {tab === "proposals" && (
            <div>
              {proposals.length === 0 ? (
                <div className="glass-panel p-10 flex flex-col items-center justify-center gap-2">
                  <Inbox className="w-8 h-8 text-[var(--wiring-text-tertiary)]" />
                  <p className="text-sm text-[var(--wiring-text-tertiary)]">새로운 제안이 없습니다</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {proposals.map((p) => (
                    <ProposalCard key={p.id} proposal={p} onClick={() => setSelectedProposal(p)} />
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "active" && (
            <div>
              {DUMMY_EXTERNAL_ACTIVE.length === 0 ? (
                <div className="glass-panel p-10 flex flex-col items-center justify-center gap-2">
                  <Zap className="w-8 h-8 text-[var(--wiring-text-tertiary)]" />
                  <p className="text-sm text-[var(--wiring-text-tertiary)]">진행 중인 외부 업무가 없습니다</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {DUMMY_EXTERNAL_ACTIVE.map((w) => (
                    <ActiveWorkCard key={w.id} work={w} />
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "completed" && (
            <div>
              {DUMMY_EXTERNAL_COMPLETED.length === 0 ? (
                <div className="glass-panel p-10 flex flex-col items-center justify-center gap-2">
                  <CheckCircle2 className="w-8 h-8 text-[var(--wiring-text-tertiary)]" />
                  <p className="text-sm text-[var(--wiring-text-tertiary)]">완료된 업무가 없습니다</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {/* 정산 현황 요약 */}
                  <div className="glass-panel p-4 flex items-center gap-6">
                    <TrendingUp className="w-5 h-5 text-[var(--wiring-success)] shrink-0" />
                    <div className="flex gap-6 text-sm">
                      <div>
                        <p className="text-[10px] text-[var(--wiring-text-tertiary)]">정산 완료</p>
                        <p className="font-semibold text-[var(--wiring-success)]">
                          ${DUMMY_EXTERNAL_COMPLETED.filter((w) => w.paymentStatus === "paid").reduce((s, w) => s + (w.totalEarnings ?? 0), 0)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-[var(--wiring-text-tertiary)]">정산 요청 중</p>
                        <p className="font-semibold" style={{ color: "var(--wiring-warning)" }}>
                          ${DUMMY_EXTERNAL_COMPLETED.filter((w) => w.paymentStatus === "requested").reduce((s, w) => s + (w.totalEarnings ?? 0), 0)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {DUMMY_EXTERNAL_COMPLETED.map((w) => (
                      <CompletedWorkCard key={w.id} work={w} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
