"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useHITLStore } from "@/stores/hitl-store";
import { useNavigationStore } from "@/stores/navigation-store";
import { HITLQueueItem, DecisionRecord } from "@/types/hitl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DUMMY_USERS } from "@/dummy/users";
import {
  CheckCircle, XCircle, ArrowUpRight, ArrowDownRight,
  FileText, Bot, User, Shield, Palette, DollarSign,
  Users, Cpu, MessageSquare, X,
  ChevronRight, ChevronDown,
} from "lucide-react";

// ─── Config ────────────────────────────────────────────────

const LEVEL_ORDER = ["L1", "L2", "L3", "L4"];
function getHigherLevels(l: string) {
  const i = LEVEL_ORDER.indexOf(l);
  return i >= 0 ? LEVEL_ORDER.slice(i + 1) : [];
}
function getLowerOrSameLevels(l: string) {
  const i = LEVEL_ORDER.indexOf(l);
  return i > 0 ? LEVEL_ORDER.slice(0, i) : [];
}

const TYPE_CONFIG: Record<string, { label: string; icon: typeof FileText; color: string }> = {
  code_review:       { label: "코드 리뷰",    icon: FileText,    color: "var(--wiring-info)" },
  security_approval: { label: "보안 승인",    icon: Shield,      color: "var(--wiring-danger)" },
  spec_decision:     { label: "스펙 결정",    icon: Cpu,         color: "var(--wiring-accent)" },
  design_review:     { label: "디자인 검토",  icon: Palette,     color: "#EC4899" },
  cost_approval:     { label: "비용 승인",    icon: DollarSign,  color: "var(--wiring-warning)" },
  assignment:        { label: "담당자 배정",  icon: Users,       color: "var(--wiring-success)" },
  model_allocation:  { label: "모델 배분",    icon: Cpu,         color: "var(--wiring-accent)" },
};

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  waiting:    { label: "대기 중",       color: "var(--hitl-waiting)" },
  in_progress:{ label: "진행 중",       color: "var(--wiring-info)" },
  approved:   { label: "승인",          color: "var(--wiring-success)" },
  rejected:   { label: "반려",          color: "var(--wiring-danger)" },
  escalated:  { label: "에스컬레이션",  color: "var(--wiring-warning)" },
};

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  critical: { label: "긴급", color: "var(--wiring-danger)" },
  high:     { label: "높음", color: "var(--wiring-warning)" },
  medium:   { label: "중간", color: "var(--wiring-info)" },
  low:      { label: "낮음", color: "var(--wiring-text-tertiary)" },
};

// ─── Main Panel ────────────────────────────────────────────

export function HitlWorkspacePanel() {
  const { activeHitlId, setActiveHitl } = useNavigationStore();
  const { queueItems, approveItem, rejectItem, escalateItem, delegateItem } = useHITLStore();

  const item = activeHitlId ? queueItems.find((i) => i.id === activeHitlId) : null;

  if (!item) return null;

  const typeConfig = TYPE_CONFIG[item.type] ?? TYPE_CONFIG.code_review;
  const statusConfig = STATUS_CONFIG[item.status];
  const priorityConfig = PRIORITY_CONFIG[item.priority];
  const TypeIcon = typeConfig.icon;
  const isActionable = item.status === "waiting" || item.status === "in_progress";

  return (
    <motion.div
      key={activeHitlId}
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }}
      transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
      className="h-full flex flex-col bg-[var(--wiring-bg-primary)]"
    >
      {/* 상단 닫기 버튼 바 */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-[var(--wiring-glass-border)] shrink-0">
        <div className="flex items-center gap-2 text-xs text-[var(--wiring-text-tertiary)]">
          <span>HITL</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-[var(--wiring-text-secondary)] font-medium truncate max-w-xs">{item.title}</span>
        </div>
        <button
          onClick={() => setActiveHitl(null)}
          className="p-1.5 rounded-lg text-[var(--wiring-text-tertiary)] hover:bg-[var(--wiring-glass-hover)] hover:text-[var(--wiring-text-primary)] transition-colors"
          title="닫기 (← 이전 화면)"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* 콘텐츠 */}
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-6">

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
                <div className="flex items-center gap-2 mb-1 flex-wrap">
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
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Bot className="w-3 h-3 text-[var(--wiring-accent)]" />
                  <p className="text-[10px] font-medium text-[var(--wiring-text-tertiary)]">Agent 논의 요약</p>
                </div>
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
            <ActionPanel
              item={item}
              onApprove={(reason) => approveItem(item.id, reason)}
              onReject={(reason) => rejectItem(item.id, reason)}
              onEscalate={(tId, tName, tLevel, reason) => escalateItem(item.id, tId, tName, tLevel, reason)}
              onDelegate={(tId, tName, tLevel, reason) => delegateItem(item.id, tId, tName, tLevel, reason)}
            />
          )}

          {/* Decision history */}
          {(item.decisionHistory?.length ?? 0) > 0 && (
            <DecisionTimeline history={item.decisionHistory!} />
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
      </ScrollArea>
    </motion.div>
  );
}

// ─── Action Panel ───────────────────────────────────────────

function ActionPanel({
  item, onApprove, onReject, onEscalate, onDelegate,
}: {
  item: HITLQueueItem;
  onApprove: (reason?: string) => void;
  onReject: (reason: string) => void;
  onEscalate: (tId: string, tName: string, tLevel: string, reason: string) => void;
  onDelegate: (tId: string, tName: string, tLevel: string, reason: string) => void;
}) {
  const [mode, setMode] = useState<"idle" | "reject" | "escalate" | "delegate">("idle");
  const [reason, setReason] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");

  const currentLevel = item.currentLevel ?? item.assignedTo.level;
  const escalateTargets = DUMMY_USERS.filter((u) => getHigherLevels(currentLevel).includes(u.level));
  const delegateTargets = DUMMY_USERS.filter((u) => getLowerOrSameLevels(currentLevel).includes(u.level));

  function handleConfirm() {
    if (mode === "reject") {
      if (!reason.trim()) return;
      onReject(reason.trim());
    } else if (mode === "escalate") {
      const target = DUMMY_USERS.find((u) => u.id === selectedUserId);
      if (!target || !reason.trim()) return;
      onEscalate(target.id, target.name, target.level, reason.trim());
    } else if (mode === "delegate") {
      const target = DUMMY_USERS.find((u) => u.id === selectedUserId);
      if (!target || !reason.trim()) return;
      onDelegate(target.id, target.name, target.level, reason.trim());
    }
    setMode("idle"); setReason(""); setSelectedUserId("");
  }

  return (
    <div className="glass-panel p-5 space-y-4">
      <h2 className="text-sm font-semibold text-[var(--wiring-text-primary)]">액션</h2>

      {mode === "idle" && (
        <div className="flex items-center gap-3 flex-wrap">
          <Button onClick={() => onApprove()} className="bg-[var(--wiring-success)] hover:bg-[var(--wiring-success)]/80 text-white gap-1.5">
            <CheckCircle className="w-4 h-4" />승인
          </Button>
          <Button variant="outline" onClick={() => setMode("reject")} className="text-[var(--wiring-danger)] border-[var(--wiring-danger)]/30 hover:bg-[var(--wiring-danger)]/10 gap-1.5">
            <XCircle className="w-4 h-4" />반려
          </Button>
          {escalateTargets.length > 0 && (
            <Button variant="outline" onClick={() => setMode("escalate")} className="text-[var(--wiring-warning)] border-[var(--wiring-warning)]/30 hover:bg-[var(--wiring-warning)]/10 gap-1.5">
              <ArrowUpRight className="w-4 h-4" />에스컬레이션
            </Button>
          )}
          {delegateTargets.length > 0 && (
            <Button variant="outline" onClick={() => setMode("delegate")} className="text-[var(--wiring-info)] border-[var(--wiring-info)]/30 hover:bg-[var(--wiring-info)]/10 gap-1.5">
              <ArrowDownRight className="w-4 h-4" />위임
            </Button>
          )}
        </div>
      )}

      {(mode === "reject" || mode === "escalate" || mode === "delegate") && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            {mode === "reject"   && <XCircle     className="w-4 h-4 text-[var(--wiring-danger)]" />}
            {mode === "escalate" && <ArrowUpRight className="w-4 h-4 text-[var(--wiring-warning)]" />}
            {mode === "delegate" && <ArrowDownRight className="w-4 h-4 text-[var(--wiring-info)]" />}
            <p className="text-sm font-medium text-[var(--wiring-text-primary)]">
              {mode === "reject" ? "반려 사유" : mode === "escalate" ? "에스컬레이션 대상 & 사유" : "위임 대상 & 사유"}
            </p>
          </div>

          {(mode === "escalate" || mode === "delegate") && (
            <div className="space-y-1">
              <p className="text-xs text-[var(--wiring-text-tertiary)]">대상자 선택</p>
              {(mode === "escalate" ? escalateTargets : delegateTargets).map((u) => (
                <button
                  key={u.id}
                  onClick={() => setSelectedUserId(u.id)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg border text-left transition-all ${
                    selectedUserId === u.id
                      ? "border-[var(--wiring-accent)] bg-[var(--wiring-accent-glow)]"
                      : "border-[var(--wiring-glass-border)] hover:border-[var(--wiring-text-tertiary)]"
                  }`}
                >
                  <User className="w-3.5 h-3.5 text-[var(--wiring-text-tertiary)]" />
                  <span className="text-sm text-[var(--wiring-text-primary)]">{u.name}</span>
                  <Badge variant="secondary" className="text-[9px] ml-1">{u.level}</Badge>
                  <span className="text-xs text-[var(--wiring-text-tertiary)] ml-auto">{u.role}</span>
                </button>
              ))}
            </div>
          )}

          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="사유를 입력하세요 (필수)"
            rows={3}
            className="w-full bg-[var(--wiring-glass-bg)] border border-[var(--wiring-glass-border)] rounded-lg px-3 py-2 text-xs text-[var(--wiring-text-primary)] placeholder:text-[var(--wiring-text-tertiary)] focus:outline-none focus:border-[var(--wiring-accent)] transition-colors resize-none"
          />

          <div className="flex gap-2">
            <Button
              onClick={handleConfirm}
              disabled={!reason.trim() || ((mode === "escalate" || mode === "delegate") && !selectedUserId)}
              size="sm"
              className="bg-[var(--wiring-accent)] hover:bg-[var(--wiring-accent)]/80 text-white"
            >
              확인
            </Button>
            <Button
              variant="outline" size="sm"
              onClick={() => { setMode("idle"); setReason(""); setSelectedUserId(""); }}
              className="text-[var(--wiring-text-secondary)]"
            >
              취소
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Decision Timeline ──────────────────────────────────────

function DecisionTimeline({ history }: { history: DecisionRecord[] }) {
  const ACTION_CONFIG: Record<string, { icon: typeof CheckCircle; color: string; label: string }> = {
    approve:  { icon: CheckCircle,    color: "var(--wiring-success)",  label: "승인" },
    reject:   { icon: XCircle,        color: "var(--wiring-danger)",   label: "반려" },
    escalate: { icon: ArrowUpRight,   color: "var(--wiring-warning)",  label: "에스컬레이션" },
    delegate: { icon: ArrowDownRight, color: "var(--wiring-info)",     label: "위임" },
    comment:  { icon: MessageSquare,  color: "var(--wiring-text-tertiary)", label: "코멘트" },
  };

  return (
    <div className="glass-panel p-5">
      <h2 className="text-sm font-semibold text-[var(--wiring-text-primary)] mb-4">의결 이력</h2>
      <div className="relative">
        <div className="absolute left-3.5 top-0 bottom-0 w-px bg-[var(--wiring-glass-border)]" />
        <div className="space-y-4">
          {history.map((record) => {
            const cfg = ACTION_CONFIG[record.action] ?? ACTION_CONFIG.comment;
            const Icon = cfg.icon;
            return (
              <div key={record.id} className="flex gap-3 relative">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10"
                  style={{ backgroundColor: `${cfg.color}20`, border: `1px solid ${cfg.color}` }}
                >
                  <Icon className="w-3.5 h-3.5" style={{ color: cfg.color }} />
                </div>
                <div className="flex-1 min-w-0 pb-1">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className="text-xs font-medium text-[var(--wiring-text-primary)]">{record.userName}</span>
                    <Badge variant="secondary" className="text-[9px]">{record.userLevel}</Badge>
                    <span className="text-[10px] font-medium ml-1" style={{ color: cfg.color }}>{cfg.label}</span>
                    {record.toUserName && (
                      <span className="text-[10px] text-[var(--wiring-text-tertiary)]">
                        → {record.toUserName} ({record.toUserLevel})
                      </span>
                    )}
                    <span className="text-[10px] text-[var(--wiring-text-tertiary)] ml-auto">
                      {new Date(record.timestamp).toLocaleString("ko-KR", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  {record.reason && (
                    <p className="text-xs text-[var(--wiring-text-secondary)] leading-relaxed">{record.reason}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Type-specific content ──────────────────────────────────

function TypeSpecificContent({ item }: { item: HITLQueueItem }) {
  switch (item.type) {
    case "code_review":       return <CodeReviewSection item={item} />;
    case "security_approval": return <SecuritySection item={item} />;
    case "spec_decision":     return <SpecDecisionSection item={item} />;
    case "assignment":        return <AssignmentSection item={item} />;
    case "design_review":     return <DesignReviewSection item={item} />;
    case "model_allocation":  return <ModelAllocationSection item={item} />;
    case "cost_approval":     return <CostApprovalSection item={item} />;
    default: return null;
  }
}

function CodeReviewSection({ item }: { item: HITLQueueItem }) {
  const [openFile, setOpenFile] = useState<string | null>(null);
  if (!item.relatedFiles?.length) return null;
  return (
    <div className="glass-panel p-5 space-y-3">
      <h2 className="text-sm font-semibold text-[var(--wiring-text-primary)]">변경 파일 ({item.relatedFiles.length})</h2>
      {item.relatedFiles.map((file) => (
        <div key={file} className="border border-[var(--wiring-glass-border)] rounded-lg overflow-hidden">
          <button
            onClick={() => setOpenFile(openFile === file ? null : file)}
            className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-[var(--wiring-glass-hover)] transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-[var(--wiring-info)] shrink-0" />
            <span className="text-xs font-mono text-[var(--wiring-text-secondary)] flex-1 truncate">{file}</span>
            {openFile === file ? <ChevronDown className="w-3.5 h-3.5 text-[var(--wiring-text-tertiary)]" /> : <ChevronRight className="w-3.5 h-3.5 text-[var(--wiring-text-tertiary)]" />}
          </button>
          {openFile === file && (
            <div className="bg-[var(--wiring-bg-tertiary)] px-4 py-3 border-t border-[var(--wiring-glass-border)]">
              <div className="space-y-1">
                <p className="text-[10px] font-mono text-[var(--wiring-success)]">+ 새로운 코드 추가됨</p>
                <p className="text-[10px] font-mono text-[var(--wiring-danger)]">- 기존 코드 제거됨</p>
                <p className="text-[10px] text-[var(--wiring-text-tertiary)] mt-2">실제 코드 diff는 백엔드 연동 후 표시됩니다.</p>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function SecuritySection({ item }: { item: HITLQueueItem }) {
  const req = item.dataAccessRequest;
  if (!req) return null;
  return (
    <div className="glass-panel p-5 space-y-3">
      <h2 className="text-sm font-semibold text-[var(--wiring-text-primary)]">데이터 접근 요청</h2>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="p-2.5 rounded-lg bg-[var(--wiring-glass-bg)] border border-[var(--wiring-glass-border)]">
          <p className="text-[var(--wiring-text-tertiary)] mb-0.5">테이블</p>
          <p className="font-mono text-[var(--wiring-text-primary)]">{req.table}</p>
        </div>
        <div className="p-2.5 rounded-lg bg-[var(--wiring-glass-bg)] border border-[var(--wiring-glass-border)]">
          <p className="text-[var(--wiring-text-tertiary)] mb-0.5">컬럼</p>
          <p className="text-[var(--wiring-text-primary)]">{req.columns.join(", ")}</p>
        </div>
        <div className="p-2.5 rounded-lg bg-[var(--wiring-glass-bg)] border border-[var(--wiring-glass-border)] col-span-2">
          <p className="text-[var(--wiring-text-tertiary)] mb-0.5">목적</p>
          <p className="text-[var(--wiring-text-primary)]">{req.purpose}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[var(--wiring-danger)]/10 border border-[var(--wiring-danger)]/20">
        <Shield className="w-3.5 h-3.5 text-[var(--wiring-danger)] shrink-0" />
        <p className="text-xs text-[var(--wiring-danger)]">민감 데이터 접근 — 신중하게 검토하세요</p>
      </div>
    </div>
  );
}

function SpecDecisionSection({ item }: { item: HITLQueueItem }) {
  const [selected, setSelected] = useState<string | null>(item.selectedOption ?? null);
  if (!item.options?.length) return null;
  return (
    <div className="glass-panel p-5 space-y-3">
      <h2 className="text-sm font-semibold text-[var(--wiring-text-primary)]">스펙 선택지</h2>
      {item.options.map((opt) => (
        <button
          key={opt.id}
          onClick={() => setSelected(opt.id)}
          className={`w-full text-left p-3.5 rounded-lg border transition-all ${
            selected === opt.id
              ? "border-[var(--wiring-accent)] bg-[var(--wiring-accent-glow)]"
              : "border-[var(--wiring-glass-border)] hover:border-[var(--wiring-text-tertiary)]"
          }`}
        >
          <p className="text-sm font-medium text-[var(--wiring-text-primary)] mb-1">{opt.label}</p>
          <div className="flex gap-3 text-[10px] text-[var(--wiring-text-tertiary)]">
            <span>비용: {opt.cost}</span>
            <span>리스크: {opt.risk}</span>
            <span>개발: {opt.devDays}일</span>
          </div>
        </button>
      ))}
    </div>
  );
}

function AssignmentSection({ item }: { item: HITLQueueItem }) {
  const [selected, setSelected] = useState<string | null>(item.selectedCandidate ?? null);
  if (!item.candidates?.length) return null;
  return (
    <div className="glass-panel p-5 space-y-3">
      <h2 className="text-sm font-semibold text-[var(--wiring-text-primary)]">후보 목록</h2>
      {item.candidates.map((c) => (
        <button
          key={c.id}
          onClick={() => setSelected(c.id)}
          className={`w-full text-left p-3.5 rounded-lg border transition-all ${
            selected === c.id
              ? "border-[var(--wiring-accent)] bg-[var(--wiring-accent-glow)]"
              : "border-[var(--wiring-glass-border)] hover:border-[var(--wiring-text-tertiary)]"
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-medium text-[var(--wiring-text-primary)]">{c.name}</p>
            <span className="text-xs text-[var(--wiring-accent)]">매칭 {c.matchScore}%</span>
          </div>
          <div className="flex gap-3 text-[10px] text-[var(--wiring-text-tertiary)]">
            <span>{c.level}</span>
            <span>{c.availability}</span>
          </div>
        </button>
      ))}
    </div>
  );
}

function DesignReviewSection({ item }: { item: HITLQueueItem }) {
  const anyItem = item as any;
  if (!item.designUrl && !anyItem.checklistItems?.length) return null;
  return (
    <div className="glass-panel p-5 space-y-3">
      <h2 className="text-sm font-semibold text-[var(--wiring-text-primary)]">디자인 검토</h2>
      {item.designUrl && (
        <a
          href={item.designUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-xs text-[var(--wiring-accent)] hover:underline"
        >
          <Palette className="w-3.5 h-3.5" />
          Figma에서 디자인 보기 →
        </a>
      )}
      {anyItem.checklistItems?.length > 0 && (
        <div className="space-y-1.5">
          {anyItem.checklistItems.map((c: any) => {
            const color = c.status === "pass" ? "var(--wiring-success)" : c.status === "fail" ? "var(--wiring-danger)" : "var(--wiring-warning)";
            return (
              <div key={c.id} className="flex items-center gap-2 text-xs">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                <span className="text-[var(--wiring-text-secondary)] flex-1">{c.item}</span>
                <Badge variant="secondary" className="text-[9px]" style={{ color }}>{c.status}</Badge>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ModelAllocationSection({ item }: { item: HITLQueueItem }) {
  if (!item.allocation) return null;
  const { agents, totalCost, alternatives, smComment } = item.allocation;
  return (
    <div className="glass-panel p-5 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[var(--wiring-text-primary)]">AI 모델 배분</h2>
        <span className="text-xs text-[var(--wiring-text-tertiary)]">예상 총 비용: <span className="font-medium text-[var(--wiring-text-primary)]">${totalCost}</span></span>
      </div>
      {smComment && (
        <p className="text-xs text-[var(--wiring-text-secondary)] bg-[var(--wiring-glass-bg)] rounded-lg p-2.5">{smComment}</p>
      )}
      <div className="space-y-2">
        {agents.map((a) => (
          <div key={a.agentId} className="flex items-center gap-3 text-xs">
            <span className="text-[var(--wiring-text-secondary)] w-8 shrink-0">{a.agentId.replace("agent-","").toUpperCase()}</span>
            <div className="flex-1 h-1.5 rounded-full bg-[var(--wiring-glass-bg)]">
              <div className="h-1.5 rounded-full bg-[var(--wiring-accent)]" style={{ width: `${Math.min((a.models[0]?.ratio ?? 0) * 100, 100)}%` }} />
            </div>
            <span className="text-[var(--wiring-text-tertiary)] truncate">{a.models.map(m => `${m.model}(${Math.round(m.ratio*100)}%)`).join(", ")}</span>
          </div>
        ))}
      </div>
      {alternatives?.length > 0 && (
        <div className="mt-2 pt-3 border-t border-[var(--wiring-glass-border)]">
          <p className="text-[10px] text-[var(--wiring-text-tertiary)] mb-1.5">비용 절감 대안</p>
          {alternatives.map((alt) => (
            <div key={alt.id} className="flex items-center justify-between text-xs text-[var(--wiring-text-secondary)] py-1">
              <span>{alt.label}</span>
              <span className="text-[var(--wiring-success)]">${alt.totalCost}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CostApprovalSection({ item }: { item: HITLQueueItem }) {
  const data = item.costApproval as any;
  if (!data) return null;
  const pct = Math.min((data.usedBudget / data.totalBudget) * 100, 100);
  const afterPct = Math.min(((data.usedBudget + data.requestedAmount) / data.totalBudget) * 100, 100);
  return (
    <div className="glass-panel p-5 space-y-4">
      <h2 className="text-sm font-semibold text-[var(--wiring-text-primary)]">비용 승인 요청</h2>
      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-[var(--wiring-text-tertiary)]">현재 소진</span>
            <span className="text-[var(--wiring-text-primary)]">${data.usedBudget} / ${data.totalBudget}</span>
          </div>
          <div className="h-2 rounded-full bg-[var(--wiring-glass-bg)]">
            <div className="h-2 rounded-full bg-[var(--wiring-accent)]" style={{ width: `${pct}%` }} />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-[var(--wiring-text-tertiary)]">승인 후</span>
            <span className="font-medium" style={{ color: afterPct > 90 ? "var(--wiring-danger)" : "var(--wiring-warning)" }}>
              ${data.usedBudget + data.requestedAmount} / ${data.totalBudget}
            </span>
          </div>
          <div className="h-2 rounded-full bg-[var(--wiring-glass-bg)]">
            <div
              className="h-2 rounded-full"
              style={{ width: `${afterPct}%`, backgroundColor: afterPct > 90 ? "var(--wiring-danger)" : "var(--wiring-warning)" }}
            />
          </div>
        </div>
      </div>
      <div className="p-3 rounded-lg bg-[var(--wiring-warning)]/10 border border-[var(--wiring-warning)]/20">
        <p className="text-xs text-[var(--wiring-warning)]">추가 요청액: <span className="font-bold">${data.requestedAmount}</span></p>
        {data.reason && <p className="text-xs text-[var(--wiring-text-secondary)] mt-1">{data.reason}</p>}
      </div>
    </div>
  );
}
