"use client";

import { use, useState } from "react";
import { useHITLStore } from "@/stores/hitl-store";
import { HITLQueueItem, DecisionRecord, CostApprovalData } from "@/types/hitl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { DUMMY_USERS } from "@/dummy/users";
import {
  CheckCircle,
  XCircle,
  ArrowUpRight,
  ArrowDownRight,
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
  MessageSquare,
  ChevronDown,
} from "lucide-react";

// ─── Level hierarchy ───
const LEVEL_ORDER = ["L1", "L2", "L3", "L4"];
function getHigherLevels(currentLevel: string): string[] {
  const idx = LEVEL_ORDER.indexOf(currentLevel);
  return idx >= 0 ? LEVEL_ORDER.slice(idx + 1) : [];
}
function getLowerOrSameLevels(currentLevel: string): string[] {
  const idx = LEVEL_ORDER.indexOf(currentLevel);
  return idx > 0 ? LEVEL_ORDER.slice(0, idx) : [];
}

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
  const { queueItems, approveItem, rejectItem, escalateItem, delegateItem } = useHITLStore();
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
  );
}

// ─── Action Panel ───
function ActionPanel({
  item,
  onApprove,
  onReject,
  onEscalate,
  onDelegate,
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
    setMode("idle");
    setReason("");
    setSelectedUserId("");
  }

  return (
    <div className="glass-panel p-5 space-y-4">
      <h2 className="text-sm font-semibold text-[var(--wiring-text-primary)]">액션</h2>

      {mode === "idle" && (
        <div className="flex items-center gap-3 flex-wrap">
          <Button
            onClick={() => onApprove()}
            className="bg-[var(--wiring-success)] hover:bg-[var(--wiring-success)]/80 text-white gap-1.5"
          >
            <CheckCircle className="w-4 h-4" />승인
          </Button>
          <Button
            variant="outline"
            onClick={() => setMode("reject")}
            className="text-[var(--wiring-danger)] border-[var(--wiring-danger)]/30 hover:bg-[var(--wiring-danger)]/10 gap-1.5"
          >
            <XCircle className="w-4 h-4" />반려
          </Button>
          {escalateTargets.length > 0 && (
            <Button
              variant="outline"
              onClick={() => setMode("escalate")}
              className="text-[var(--wiring-warning)] border-[var(--wiring-warning)]/30 hover:bg-[var(--wiring-warning)]/10 gap-1.5"
            >
              <ArrowUpRight className="w-4 h-4" />에스컬레이션
            </Button>
          )}
          {delegateTargets.length > 0 && (
            <Button
              variant="outline"
              onClick={() => setMode("delegate")}
              className="text-[var(--wiring-info)] border-[var(--wiring-info)]/30 hover:bg-[var(--wiring-info)]/10 gap-1.5"
            >
              <ArrowDownRight className="w-4 h-4" />위임
            </Button>
          )}
        </div>
      )}

      {(mode === "reject" || mode === "escalate" || mode === "delegate") && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            {mode === "reject" && <XCircle className="w-4 h-4 text-[var(--wiring-danger)]" />}
            {mode === "escalate" && <ArrowUpRight className="w-4 h-4 text-[var(--wiring-warning)]" />}
            {mode === "delegate" && <ArrowDownRight className="w-4 h-4 text-[var(--wiring-info)]" />}
            <p className="text-sm font-medium text-[var(--wiring-text-primary)]">
              {mode === "reject" ? "반려 사유" : mode === "escalate" ? "에스컬레이션 대상 & 사유" : "위임 대상 & 사유"}
            </p>
          </div>

          {(mode === "escalate" || mode === "delegate") && (
            <div className="space-y-1">
              <p className="text-xs text-[var(--wiring-text-tertiary)]">대상자 선택</p>
              <div className="space-y-1">
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
              variant="outline"
              size="sm"
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

// ─── Decision Timeline ───
function DecisionTimeline({ history }: { history: DecisionRecord[] }) {
  const ACTION_CONFIG: Record<string, { icon: typeof CheckCircle; color: string; label: string }> = {
    approve: { icon: CheckCircle, color: "var(--wiring-success)", label: "승인" },
    reject: { icon: XCircle, color: "var(--wiring-danger)", label: "반려" },
    escalate: { icon: ArrowUpRight, color: "var(--wiring-warning)", label: "에스컬레이션" },
    delegate: { icon: ArrowDownRight, color: "var(--wiring-info)", label: "위임" },
    comment: { icon: MessageSquare, color: "var(--wiring-text-tertiary)", label: "코멘트" },
  };

  return (
    <div className="glass-panel p-5">
      <h2 className="text-sm font-semibold text-[var(--wiring-text-primary)] mb-4">의결 이력</h2>
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-3.5 top-0 bottom-0 w-px bg-[var(--wiring-glass-border)]" />
        <div className="space-y-4">
          {history.map((record) => {
            const cfg = ACTION_CONFIG[record.action] || ACTION_CONFIG.comment;
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
                  <div className="flex items-center gap-2 mb-0.5">
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
                    <p className="text-xs text-[var(--wiring-text-secondary)] leading-relaxed">
                      {record.reason}
                    </p>
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
    case "cost_approval":
      return <CostApprovalSection item={item} />;
    default:
      return null;
  }
}

// ─── 더미 코드 디프 데이터 ───
const DUMMY_DIFF = [
  {
    file: "src/components/ImageUploader.tsx",
    changes: [
      { type: "context", line: 12, content: "import { useCallback, useState } from 'react';" },
      { type: "remove", line: 13, content: "import { FileUploader } from './FileUploader';" },
      { type: "add", line: 13, content: "import { DragDropZone } from './DragDropZone';" },
      { type: "add", line: 14, content: "import { ImagePreview } from './ImagePreview';" },
      { type: "context", line: 15, content: "" },
      { type: "context", line: 16, content: "interface ImageUploaderProps {" },
      { type: "remove", line: 17, content: "  onUpload: (file: File) => void;" },
      { type: "add", line: 17, content: "  onUpload: (files: File[]) => Promise<void>;" },
      { type: "add", line: 18, content: "  maxFiles?: number;" },
      { type: "add", line: 19, content: "  maxSizeMB?: number;" },
      { type: "context", line: 20, content: "}" },
      { type: "context", line: 21, content: "" },
      { type: "add", line: 22, content: "const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];" },
      { type: "add", line: 23, content: "" },
      { type: "remove", line: 24, content: "export function ImageUploader({ onUpload }: ImageUploaderProps) {" },
      { type: "add", line: 24, content: "export function ImageUploader({ onUpload, maxFiles = 10, maxSizeMB = 5 }: ImageUploaderProps) {" },
      { type: "add", line: 25, content: "  const [previews, setPreviews] = useState<string[]>([]);" },
      { type: "add", line: 26, content: "  const [isDragging, setIsDragging] = useState(false);" },
    ],
    agentComment: "SM Agent: FileUploader 의존성 제거하고 네이티브 Drag API로 전환. 멀티 파일 + 프리뷰 + 타입/사이즈 검증 추가.",
  },
  {
    file: "src/components/FileUploader.tsx",
    changes: [
      { type: "context", line: 1, content: "// 기존 FileUploader — 하위 호환 유지" },
      { type: "add", line: 2, content: "/** @deprecated ImageUploader를 사용하세요 */" },
      { type: "context", line: 3, content: "export function FileUploader(props: any) {" },
      { type: "add", line: 4, content: "  console.warn('FileUploader is deprecated. Use ImageUploader.');" },
      { type: "context", line: 5, content: "  return <div>...</div>;" },
    ],
    agentComment: null,
  },
];

function CodeReviewSection({ item }: { item: HITLQueueItem }) {
  const [activeFileIdx, setActiveFileIdx] = useState(0);
  const diff = DUMMY_DIFF;
  const activeFile = diff[activeFileIdx];

  return (
    <div className="space-y-4">
      {/* 파일 탭 */}
      <div className="glass-panel overflow-hidden">
        <div className="flex items-center border-b border-[var(--wiring-glass-border)] overflow-x-auto">
          {diff.map((d, i) => (
            <button
              key={d.file}
              onClick={() => setActiveFileIdx(i)}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-xs whitespace-nowrap border-b-2 transition-colors ${
                i === activeFileIdx
                  ? "border-[var(--wiring-accent)] text-[var(--wiring-accent)] bg-[var(--wiring-accent-glow)]"
                  : "border-transparent text-[var(--wiring-text-tertiary)] hover:text-[var(--wiring-text-secondary)]"
              }`}
            >
              <FileText className="w-3 h-3" />
              {d.file.split("/").pop()}
            </button>
          ))}
        </div>

        {/* 디프 뷰 */}
        <div className="p-0 font-mono text-xs overflow-x-auto">
          {activeFile.changes.map((change, i) => {
            const bgColor = change.type === "add" ? "rgba(34,197,94,0.08)" : change.type === "remove" ? "rgba(239,68,68,0.08)" : "transparent";
            const textColor = change.type === "add" ? "var(--wiring-success)" : change.type === "remove" ? "var(--wiring-danger)" : "var(--wiring-text-secondary)";
            const prefix = change.type === "add" ? "+" : change.type === "remove" ? "−" : " ";
            return (
              <div
                key={i}
                className="flex"
                style={{ backgroundColor: bgColor }}
              >
                <span className="w-10 text-right pr-2 py-0.5 text-[10px] text-[var(--wiring-text-tertiary)] select-none shrink-0 border-r border-[var(--wiring-glass-border)]">
                  {change.line}
                </span>
                <span className="w-5 text-center py-0.5 text-[10px] shrink-0 select-none" style={{ color: textColor }}>
                  {prefix}
                </span>
                <span className="py-0.5 pr-4 whitespace-pre" style={{ color: textColor }}>
                  {change.content}
                </span>
              </div>
            );
          })}
        </div>

        {/* Agent 코멘트 */}
        {activeFile.agentComment && (
          <div className="px-4 py-3 border-t border-[var(--wiring-glass-border)] bg-[var(--wiring-glass-bg)]">
            <div className="flex items-start gap-2">
              <MessageSquare className="w-3.5 h-3.5 text-[var(--wiring-accent)] shrink-0 mt-0.5" />
              <p className="text-xs text-[var(--wiring-text-secondary)] leading-relaxed">{activeFile.agentComment}</p>
            </div>
          </div>
        )}
      </div>

      {/* 관련 파일 목록 */}
      {item.relatedFiles && item.relatedFiles.length > 0 && (
        <div className="glass-panel p-4">
          <h2 className="text-xs font-semibold text-[var(--wiring-text-tertiary)] uppercase mb-2">전체 관련 파일</h2>
          <div className="space-y-1">
            {item.relatedFiles.map((f) => (
              <div key={f} className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-[var(--wiring-glass-bg)] text-xs">
                <FileText className="w-3 h-3 text-[var(--wiring-text-tertiary)]" />
                <code className="text-[var(--wiring-accent)]">{f}</code>
              </div>
            ))}
          </div>
        </div>
      )}
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

const DESIGN_CHECKLIST = [
  { id: "dc-1", label: "디자인 시스템 컬러 팔레트 준수", status: "pass" as const },
  { id: "dc-2", label: "타이포그래피 가이드라인 준수", status: "pass" as const },
  { id: "dc-3", label: "모바일 반응형 (320~767px) 대응", status: "warning" as const, note: "일부 마진 값 미적용" },
  { id: "dc-4", label: "접근성 (WCAG 2.1 AA)", status: "pass" as const },
  { id: "dc-5", label: "인터랙션 명세 (호버/포커스/로딩)", status: "fail" as const, note: "로딩 스켈레톤 누락" },
  { id: "dc-6", label: "다크 모드 대응", status: "pass" as const },
];

function DesignReviewSection({ item }: { item: HITLQueueItem }) {
  return (
    <div className="space-y-4">
      {/* 디자인 시안 */}
      <div className="glass-panel overflow-hidden">
        <div className="px-4 py-3 border-b border-[var(--wiring-glass-border)]">
          <h2 className="text-sm font-semibold text-[var(--wiring-text-primary)]">디자인 시안</h2>
        </div>
        <div className="grid grid-cols-3 gap-px bg-[var(--wiring-glass-border)]">
          {["Before", "After", "변경점"].map((label, i) => (
            <div key={label} className="bg-[var(--wiring-bg-primary)] p-3 min-h-[180px] flex flex-col items-center justify-center">
              <p className="text-[10px] text-[var(--wiring-text-tertiary)] mb-2">{label}</p>
              <div className="w-full h-32 rounded-lg flex items-center justify-center" style={{
                backgroundColor: i === 0 ? "rgba(239,68,68,0.06)" : i === 1 ? "rgba(34,197,94,0.06)" : "rgba(59,130,246,0.06)",
                border: `1px dashed ${i === 0 ? "rgba(239,68,68,0.2)" : i === 1 ? "rgba(34,197,94,0.2)" : "rgba(59,130,246,0.2)"}`,
              }}>
                <div className="text-center">
                  <Palette className="w-6 h-6 mx-auto mb-1" style={{ color: i === 0 ? "var(--wiring-danger)" : i === 1 ? "var(--wiring-success)" : "var(--wiring-info)", opacity: 0.3 }} />
                  <p className="text-[10px] text-[var(--wiring-text-tertiary)]">{i === 0 ? "이전 버전" : i === 1 ? "신규 시안" : "변경 하이라이트"}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        {item.designUrl && (
          <div className="px-4 py-2 border-t border-[var(--wiring-glass-border)] flex items-center gap-2">
            <Palette className="w-3 h-3 text-[var(--wiring-accent)]" />
            <span className="text-[10px] text-[var(--wiring-accent)]">{item.designUrl}</span>
          </div>
        )}
      </div>

      {/* 디자인 체크리스트 */}
      <div className="glass-panel p-5">
        <h2 className="text-sm font-semibold text-[var(--wiring-text-primary)] mb-3">Dsn Agent 디자인 체크리스트</h2>
        <div className="space-y-2">
          {DESIGN_CHECKLIST.map((c) => {
            const statusCfg = {
              pass: { icon: <CheckCircle className="w-3.5 h-3.5" />, color: "var(--wiring-success)", label: "통과" },
              warning: { icon: <AlertTriangle className="w-3.5 h-3.5" />, color: "var(--wiring-warning)", label: "주의" },
              fail: { icon: <XCircle className="w-3.5 h-3.5" />, color: "var(--wiring-danger)", label: "미통과" },
            }[c.status];
            return (
              <div key={c.id} className="flex items-start gap-2.5 p-2 rounded-lg bg-[var(--wiring-glass-bg)]">
                <span style={{ color: statusCfg.color }} className="shrink-0 mt-0.5">{statusCfg.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-[var(--wiring-text-primary)]">{c.label}</p>
                    <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ color: statusCfg.color, backgroundColor: `${statusCfg.color}18` }}>
                      {statusCfg.label}
                    </span>
                  </div>
                  {c.note && <p className="text-[10px] text-[var(--wiring-text-tertiary)] mt-0.5">{c.note}</p>}
                </div>
              </div>
            );
          })}
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

function CostApprovalSection({ item }: { item: HITLQueueItem }) {
  const ca = item.costApproval;
  if (!ca) return null;
  const spentPct = ca.currentBudget > 0 ? Math.round((ca.currentSpent / ca.currentBudget) * 100) : 0;
  const afterBudget = ca.currentBudget + ca.requestedAdditional;
  const afterPct = afterBudget > 0 ? Math.round((ca.projectedTotal / afterBudget) * 100) : 0;
  return (
    <div className="space-y-4">
      {/* 예산 현황 비교 */}
      <div className="glass-panel p-5">
        <h2 className="text-sm font-semibold text-[var(--wiring-text-primary)] mb-4">예산 현황</h2>
        <div className="grid grid-cols-2 gap-4">
          {/* 현재 */}
          <div className="p-3 rounded-lg bg-[var(--wiring-glass-bg)] border border-[var(--wiring-glass-border)]">
            <p className="text-xs text-[var(--wiring-text-tertiary)] mb-2">현재</p>
            <div className="flex items-end justify-between mb-2">
              <span className="text-lg font-bold text-[var(--wiring-text-primary)]">${ca.currentSpent}</span>
              <span className="text-xs text-[var(--wiring-text-tertiary)]">/ ${ca.currentBudget}</span>
            </div>
            <div className="h-2 rounded-full bg-[var(--wiring-glass-border)]">
              <div className="h-2 rounded-full" style={{ width: `${Math.min(spentPct, 100)}%`, backgroundColor: spentPct >= 90 ? "var(--wiring-danger)" : spentPct >= 70 ? "var(--wiring-warning)" : "var(--wiring-accent)" }} />
            </div>
            <p className="text-[10px] text-[var(--wiring-text-tertiary)] mt-1">{spentPct}% 소진</p>
          </div>
          {/* 승인 후 */}
          <div className="p-3 rounded-lg border" style={{ borderColor: "var(--wiring-accent)", backgroundColor: "rgba(124,92,252,0.04)" }}>
            <p className="text-xs text-[var(--wiring-accent)] mb-2">승인 후 예상</p>
            <div className="flex items-end justify-between mb-2">
              <span className="text-lg font-bold text-[var(--wiring-accent)]">${ca.projectedTotal}</span>
              <span className="text-xs text-[var(--wiring-text-tertiary)]">/ ${afterBudget}</span>
            </div>
            <div className="h-2 rounded-full bg-[var(--wiring-glass-border)]">
              <div className="h-2 rounded-full bg-[var(--wiring-accent)]" style={{ width: `${Math.min(afterPct, 100)}%` }} />
            </div>
            <p className="text-[10px] text-[var(--wiring-text-tertiary)] mt-1">{afterPct}% 소진 예상</p>
          </div>
        </div>
      </div>

      {/* 추가 예산 요청 */}
      <div className="glass-panel p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-[var(--wiring-text-primary)]">추가 예산 요청</h2>
          <span className="text-lg font-bold text-[var(--wiring-warning)]">+${ca.requestedAdditional}</span>
        </div>
        <p className="text-xs text-[var(--wiring-text-secondary)] mb-3">{ca.reason}</p>

        {/* 내역 */}
        <div className="space-y-1.5">
          {ca.breakdown.map((b, i) => (
            <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-[var(--wiring-glass-bg)]">
              <span className="text-xs text-[var(--wiring-text-secondary)]">{b.item}</span>
              <span className="text-xs font-medium text-[var(--wiring-text-primary)]">${b.cost}</span>
            </div>
          ))}
          <div className="flex items-center justify-between p-2 border-t border-[var(--wiring-glass-border)]">
            <span className="text-xs font-medium text-[var(--wiring-text-primary)]">합계</span>
            <span className="text-sm font-bold text-[var(--wiring-warning)]">${ca.breakdown.reduce((s, b) => s + b.cost, 0)}</span>
          </div>
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
