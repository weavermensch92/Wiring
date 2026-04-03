"use client";

import { use } from "react";
import { useHITLStore } from "@/stores/hitl-store";
import { HITLQueueItem } from "@/types/hitl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle,
  XCircle,
  ArrowUpRight,
  Clock,
  AlertTriangle,
  FileText,
  Bot,
  User,
  Shield,
  Palette,
  DollarSign,
  Users,
  Cpu,
} from "lucide-react";

const TYPE_CONFIG: Record<string, { label: string; icon: typeof FileText; color: string }> = {
  code_review: { label: "코드 리뷰", icon: FileText, color: "var(--wiring-info)" },
  security_approval: { label: "보안 승인", icon: Shield, color: "var(--wiring-danger)" },
  spec_decision: { label: "스펙 결정", icon: Cpu, color: "var(--wiring-accent)" },
  design_review: { label: "디자인 검토", icon: Palette, color: "#EC4899" },
  cost_approval: { label: "비용 승인", icon: DollarSign, color: "var(--wiring-warning)" },
  assignment: { label: "담당자 배정", icon: Users, color: "var(--wiring-success)" },
  model_allocation: { label: "모델 배분", icon: Cpu, color: "var(--wiring-accent)" },
};

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  waiting: { label: "대기 중", color: "var(--hitl-waiting)" },
  in_progress: { label: "진행 중", color: "var(--wiring-info)" },
  approved: { label: "승인", color: "var(--wiring-success)" },
  rejected: { label: "반려", color: "var(--wiring-danger)" },
  escalated: { label: "에스컬레이션", color: "var(--wiring-warning)" },
};

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  critical: { label: "긴급", color: "var(--wiring-danger)" },
  high: { label: "높음", color: "var(--wiring-warning)" },
  medium: { label: "중간", color: "var(--wiring-info)" },
  low: { label: "낮음", color: "var(--wiring-text-tertiary)" },
};

export default function HITLDetailPage({ params }: { params: Promise<{ itemId: string }> }) {
  const { itemId } = use(params);
  const { queueItems, approveItem, rejectItem, escalateItem } = useHITLStore();
  const item = queueItems.find((i) => i.id === itemId);

  if (!item) {
    return (
      <div className="p-6">
        <p className="text-[var(--wiring-text-tertiary)]">HITL 항목을 찾을 수 없습니다</p>
      </div>
    );
  }

  const typeConfig = TYPE_CONFIG[item.type] || TYPE_CONFIG.code_review;
  const statusConfig = STATUS_CONFIG[item.status];
  const priorityConfig = PRIORITY_CONFIG[item.priority];
  const TypeIcon = typeConfig.icon;
  const isActionable = item.status === "waiting" || item.status === "in_progress";

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="glass-panel p-6">
        <div className="flex items-start gap-4">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: typeConfig.color + "20", color: typeConfig.color }}
          >
            <TypeIcon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="secondary" className="text-[10px]" style={{ color: statusConfig.color }}>
                {statusConfig.label}
              </Badge>
              <Badge variant="secondary" className="text-[10px]" style={{ color: priorityConfig.color }}>
                {priorityConfig.label}
              </Badge>
              <Badge variant="secondary" className="text-[10px]" style={{ color: typeConfig.color }}>
                {typeConfig.label}
              </Badge>
            </div>
            <h1 className="text-lg font-semibold text-[var(--wiring-text-primary)]">{item.title}</h1>
            <p className="text-xs text-[var(--wiring-text-tertiary)] mt-1">
              {item.id} · 요청: {item.requestedBy} Agent · {new Date(item.createdAt).toLocaleString("ko-KR")}
            </p>
          </div>
        </div>
      </div>

      {/* Briefing */}
      <div className="glass-panel p-5">
        <h2 className="text-sm font-semibold text-[var(--wiring-text-primary)] mb-2">브리핑</h2>
        <p className="text-sm text-[var(--wiring-text-secondary)] leading-relaxed">{item.briefing}</p>
        {item.agentDiscussionSummary && (
          <div className="mt-3 p-3 rounded-lg bg-[var(--wiring-glass-bg)] border border-[var(--wiring-glass-border)]">
            <p className="text-[10px] text-[var(--wiring-text-tertiary)] mb-1">Agent 논의 요약</p>
            <p className="text-xs text-[var(--wiring-text-secondary)]">{item.agentDiscussionSummary}</p>
          </div>
        )}
      </div>

      {/* Assignee */}
      <div className="glass-panel p-5">
        <h2 className="text-sm font-semibold text-[var(--wiring-text-primary)] mb-2">담당자</h2>
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-[var(--wiring-text-secondary)]" />
          <span className="text-sm text-[var(--wiring-text-primary)]">{item.assignedTo.name}</span>
          <Badge variant="secondary" className="text-[10px]">{item.assignedTo.level}</Badge>
        </div>
      </div>

      {/* Type-specific content */}
      <TypeSpecificContent item={item} />

      {/* Actions */}
      {isActionable && (
        <div className="glass-panel p-5">
          <h2 className="text-sm font-semibold text-[var(--wiring-text-primary)] mb-3">액션</h2>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => approveItem(item.id)}
              className="bg-[var(--wiring-success)] hover:bg-[var(--wiring-success)]/80 text-white gap-1.5"
            >
              <CheckCircle className="w-4 h-4" />
              승인
            </Button>
            <Button
              variant="outline"
              onClick={() => rejectItem(item.id, "사유 미입력")}
              className="text-[var(--wiring-danger)] border-[var(--wiring-danger)]/30 hover:bg-[var(--wiring-danger)]/10 gap-1.5"
            >
              <XCircle className="w-4 h-4" />
              반려
            </Button>
            <Button
              variant="outline"
              onClick={() => escalateItem(item.id)}
              className="text-[var(--wiring-warning)] border-[var(--wiring-warning)]/30 hover:bg-[var(--wiring-warning)]/10 gap-1.5"
            >
              <ArrowUpRight className="w-4 h-4" />
              에스컬레이션
            </Button>
          </div>
        </div>
      )}

      {/* Completed info */}
      {item.completedAt && (
        <div className="glass-panel p-5">
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className="w-4 h-4 text-[var(--wiring-success)]" />
            <span className="text-[var(--wiring-text-secondary)]">
              {new Date(item.completedAt).toLocaleString("ko-KR")} 완료
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Type-specific content sections ───

function TypeSpecificContent({ item }: { item: HITLQueueItem }) {
  switch (item.type) {
    case "code_review":
      return <CodeReviewSection item={item} />;
    case "security_approval":
      return <SecuritySection item={item} />;
    case "spec_decision":
      return <SpecDecisionSection item={item} />;
    case "assignment":
      return <AssignmentSection item={item} />;
    case "design_review":
      return <DesignReviewSection item={item} />;
    case "model_allocation":
      return <ModelAllocationSection item={item} />;
    default:
      return null;
  }
}

function CodeReviewSection({ item }: { item: HITLQueueItem }) {
  if (!item.relatedFiles?.length) return null;
  return (
    <div className="glass-panel p-5">
      <h2 className="text-sm font-semibold text-[var(--wiring-text-primary)] mb-2">관련 파일</h2>
      <div className="space-y-1">
        {item.relatedFiles.map((f) => (
          <div key={f} className="flex items-center gap-2 p-2 rounded-lg bg-[var(--wiring-glass-bg)] text-xs">
            <FileText className="w-3.5 h-3.5 text-[var(--wiring-text-tertiary)]" />
            <code className="text-[var(--wiring-accent)]">{f}</code>
          </div>
        ))}
      </div>
    </div>
  );
}

function SecuritySection({ item }: { item: HITLQueueItem }) {
  if (!item.dataAccessRequest) return null;
  const req = item.dataAccessRequest;
  return (
    <div className="glass-panel p-5">
      <h2 className="text-sm font-semibold text-[var(--wiring-text-primary)] mb-3">데이터 접근 요청</h2>
      <div className="grid grid-cols-2 gap-3">
        <InfoField label="테이블" value={req.table} />
        <InfoField label="컬럼" value={req.columns.join(", ")} />
        <InfoField label="용도" value={req.purpose} />
        <InfoField label="기간" value={req.duration} />
      </div>
    </div>
  );
}

function SpecDecisionSection({ item }: { item: HITLQueueItem }) {
  if (!item.options?.length) return null;
  return (
    <div className="glass-panel p-5">
      <h2 className="text-sm font-semibold text-[var(--wiring-text-primary)] mb-3">옵션</h2>
      <div className="space-y-2">
        {item.options.map((opt) => (
          <div
            key={opt.id}
            className={`p-3 rounded-lg border transition-colors ${
              item.selectedOption === opt.id
                ? "border-[var(--wiring-accent)] bg-[var(--wiring-accent-glow)]"
                : "border-[var(--wiring-glass-border)] bg-[var(--wiring-glass-bg)]"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-[var(--wiring-text-primary)]">
                {opt.label}
                {opt.recommended && (
                  <Badge variant="secondary" className="ml-2 text-[9px] text-[var(--wiring-accent)]">
                    추천
                  </Badge>
                )}
              </span>
              {item.selectedOption === opt.id && (
                <CheckCircle className="w-4 h-4 text-[var(--wiring-accent)]" />
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-[var(--wiring-text-tertiary)]">
              <span>비용: {opt.cost}</span>
              <span>리스크: {opt.risk}</span>
              <span>{opt.devDays}일</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AssignmentSection({ item }: { item: HITLQueueItem }) {
  if (!item.candidates?.length) return null;
  return (
    <div className="glass-panel p-5">
      <h2 className="text-sm font-semibold text-[var(--wiring-text-primary)] mb-3">후보자</h2>
      <div className="space-y-2">
        {item.candidates.map((c) => (
          <div
            key={c.id}
            className={`p-3 rounded-lg border transition-colors ${
              item.selectedCandidate === c.id
                ? "border-[var(--wiring-accent)] bg-[var(--wiring-accent-glow)]"
                : "border-[var(--wiring-glass-border)] bg-[var(--wiring-glass-bg)]"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-[var(--wiring-text-primary)]">{c.name}</span>
                <Badge variant="secondary" className="text-[9px]">
                  {c.type === "internal" ? "내부" : "외부"}
                </Badge>
                {c.level && <Badge variant="secondary" className="text-[9px]">{c.level}</Badge>}
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium" style={{
                  color: c.matchScore >= 90 ? "var(--wiring-success)" : c.matchScore >= 70 ? "var(--wiring-warning)" : "var(--wiring-text-tertiary)"
                }}>
                  {c.matchScore}%
                </span>
                {item.selectedCandidate === c.id && (
                  <CheckCircle className="w-4 h-4 text-[var(--wiring-accent)]" />
                )}
              </div>
            </div>
            <div className="text-xs text-[var(--wiring-text-tertiary)] space-y-0.5">
              <p>{c.availability} · {c.costPerHour > 0 ? `$${c.costPerHour}/h` : "무료"}</p>
              <p>{c.note}</p>
              {c.reworkRisk && <p className="text-[var(--wiring-warning)]">재작업 리스크: {c.reworkRisk}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DesignReviewSection({ item }: { item: HITLQueueItem }) {
  if (!item.designUrl) return null;
  return (
    <div className="glass-panel p-5">
      <h2 className="text-sm font-semibold text-[var(--wiring-text-primary)] mb-2">디자인 시안</h2>
      <div className="p-4 rounded-lg bg-[var(--wiring-glass-bg)] border border-[var(--wiring-glass-border)] flex items-center justify-center min-h-[200px]">
        <div className="text-center">
          <Palette className="w-8 h-8 mx-auto mb-2 text-[var(--wiring-text-tertiary)] opacity-40" />
          <p className="text-xs text-[var(--wiring-text-tertiary)]">디자인 미리보기</p>
          <p className="text-[10px] text-[var(--wiring-accent)] mt-1">{item.designUrl}</p>
        </div>
      </div>
    </div>
  );
}

function ModelAllocationSection({ item }: { item: HITLQueueItem }) {
  if (!item.allocation) return null;
  const alloc = item.allocation;
  return (
    <div className="space-y-4">
      <div className="glass-panel p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-[var(--wiring-text-primary)]">모델 배분</h2>
          <span className="text-sm font-bold text-[var(--wiring-accent)]">${alloc.totalCost.toFixed(0)}</span>
        </div>
        <div className="space-y-3">
          {alloc.agents.map((agent) => (
            <div key={agent.agentId} className="p-3 rounded-lg bg-[var(--wiring-glass-bg)] border border-[var(--wiring-glass-border)]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Bot className="w-3.5 h-3.5 text-[var(--wiring-accent)]" />
                  <span className="text-xs font-medium text-[var(--wiring-text-primary)]">
                    {agent.label || `${agent.agentId} Agent`}
                  </span>
                </div>
                <span className="text-xs font-medium text-[var(--wiring-text-primary)]">
                  ${agent.totalCost.toFixed(0)}
                </span>
              </div>
              <div className="space-y-1">
                {agent.models.map((m) => (
                  <div key={m.model} className="flex items-center justify-between text-[10px]">
                    <div className="flex items-center gap-2">
                      <span className="text-[var(--wiring-text-secondary)]">{m.model}</span>
                      <div className="w-16 h-1 rounded-full bg-[var(--wiring-glass-border)] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[var(--wiring-accent)]"
                          style={{ width: `${m.ratio * 100}%` }}
                        />
                      </div>
                      <span className="text-[var(--wiring-text-tertiary)]">{Math.round(m.ratio * 100)}%</span>
                    </div>
                    <span className="text-[var(--wiring-text-tertiary)]">${m.estimatedCost.toFixed(1)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        {alloc.smComment && (
          <div className="mt-3 p-3 rounded-lg bg-[var(--wiring-glass-bg)] border border-[var(--wiring-glass-border)]">
            <p className="text-[10px] text-[var(--wiring-text-tertiary)] mb-1">SM 코멘트</p>
            <p className="text-xs text-[var(--wiring-text-secondary)]">{alloc.smComment}</p>
          </div>
        )}
      </div>

      <div className="glass-panel p-5">
        <h2 className="text-sm font-semibold text-[var(--wiring-text-primary)] mb-3">대안</h2>
        <div className="space-y-2">
          {alloc.alternatives.map((alt) => (
            <div
              key={alt.id}
              className={`p-3 rounded-lg border ${
                alt.recommended
                  ? "border-[var(--wiring-accent)] bg-[var(--wiring-accent-glow)]"
                  : "border-[var(--wiring-glass-border)] bg-[var(--wiring-glass-bg)]"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[var(--wiring-text-primary)]">
                  {alt.label}
                  {alt.recommended && (
                    <Badge variant="secondary" className="ml-2 text-[9px] text-[var(--wiring-accent)]">추천</Badge>
                  )}
                </span>
                <span className="text-xs font-bold" style={{
                  color: alt.qualityImpact === "none" ? "var(--wiring-success)" : "var(--wiring-warning)"
                }}>
                  ${alt.totalCost.toFixed(0)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] text-[var(--wiring-text-tertiary)] mb-0.5">{label}</p>
      <p className="text-xs text-[var(--wiring-text-primary)]">{value}</p>
    </div>
  );
}
