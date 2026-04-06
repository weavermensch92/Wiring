"use client";

import { useState, useMemo, lazy, Suspense } from "react";
import { Ticket, TicketStatus, Priority } from "@/types/project";
import { useProjectStore } from "@/stores/project-store";
import { useHITLStore } from "@/stores/hitl-store";
import { useNavigationStore } from "@/stores/navigation-store";
import { DUMMY_EPICS } from "@/dummy/projects";
import { CURRENT_USER } from "@/dummy/users";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Bot,
  User,
  Clock,
  AlertTriangle,
  ChevronDown,
  CheckCircle,
  Square,
  CheckSquare,
  Plus,
  Send,
  Link2,
  ListTodo,
  DollarSign,
  Calendar,
  Tag,
  ArrowRight,
  GitBranch,
} from "lucide-react";
import Link from "next/link";
import { TraceWaterfall } from "@/components/trace/trace-waterfall";

// ─── Constants ───

const STATUS_CONFIG: Record<TicketStatus, { label: string; color: string }> = {
  backlog: { label: "Backlog", color: "var(--wiring-text-tertiary)" },
  todo: { label: "To Do", color: "var(--wiring-info)" },
  in_progress: { label: "In Progress", color: "var(--wiring-accent)" },
  review: { label: "Review", color: "var(--wiring-warning)" },
  done: { label: "Done", color: "var(--wiring-success)" },
};

const PRIORITY_CONFIG: Record<Priority, { label: string; color: string }> = {
  critical: { label: "긴급", color: "var(--wiring-danger)" },
  high: { label: "높음", color: "var(--wiring-warning)" },
  medium: { label: "중간", color: "var(--wiring-info)" },
  low: { label: "낮음", color: "var(--wiring-text-tertiary)" },
};

const ALL_STATUSES: TicketStatus[] = ["backlog", "todo", "in_progress", "review", "done"];
const ALL_PRIORITIES: Priority[] = ["critical", "high", "medium", "low"];

// ─── Main Component ───

export function TicketDetailDialog({
  ticket,
  open,
  onOpenChange,
}: {
  ticket: Ticket | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!ticket) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-6xl w-[90vw] h-[85vh] flex flex-col p-0 gap-0 overflow-hidden"
        showCloseButton
      >
        <TicketDetailInner ticket={ticket} />
      </DialogContent>
    </Dialog>
  );
}

function TicketDetailInner({ ticket }: { ticket: Ticket }) {
  const { moveTicket, updateTicket, subtasks, comments, activities, addComment, toggleSubtask, addSubtask } = useProjectStore();
  const { queueItems } = useHITLStore();
  const { setActiveHitl } = useNavigationStore();
  const relatedHITL = queueItems.filter((item) => item.ticketId === ticket.id);
  const [mainTab, setMainTab] = useState<"detail" | "trace">("detail");

  // Find parent epic
  const epic = useMemo(() => {
    for (const [, epics] of Object.entries(DUMMY_EPICS)) {
      const found = epics.find((e) => e.id === ticket.epicId);
      if (found) return found;
    }
    return null;
  }, [ticket.epicId]);

  const ticketSubtasks = subtasks[ticket.id] || [];
  const ticketComments = comments[ticket.id] || [];
  const ticketActivities = activities[ticket.id] || [];

  const statusConfig = STATUS_CONFIG[ticket.status];
  const priorityConfig = PRIORITY_CONFIG[ticket.priority];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <DialogHeader className="px-6 py-4 border-b border-[var(--wiring-glass-border)] shrink-0">
        <DialogDescription className="text-[var(--wiring-text-tertiary)] text-xs">
          {ticket.id}
        </DialogDescription>
        <DialogTitle className="text-lg font-semibold text-[var(--wiring-text-primary)]">
          {ticket.title}
        </DialogTitle>
        {/* Action toolbar */}
        <div className="flex items-center gap-2 mt-2">
          <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
            <ListTodo className="w-3 h-3" />
            하위 작업
          </Button>
          <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
            <Link2 className="w-3 h-3" />
            의존성
          </Button>
          {ticket.hitlRequired && (
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1 text-[var(--hitl-waiting)]">
              <AlertTriangle className="w-3 h-3" />
              HITL
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            className={`h-7 text-xs gap-1 ml-auto ${mainTab === "trace" ? "bg-[var(--wiring-accent-glow)] text-[var(--wiring-accent)] border-[var(--wiring-accent)]" : ""}`}
            onClick={() => setMainTab(mainTab === "trace" ? "detail" : "trace")}
          >
            <GitBranch className="w-3 h-3" />
            트레이스
          </Button>
        </div>
      </DialogHeader>

      {/* Body: 2 columns or trace full-width */}
      <div className="flex flex-1 overflow-hidden">
        {mainTab === "trace" ? (
          <div className="flex-1 overflow-y-auto p-6">
            <TraceWaterfall ticketId={ticket.id} />
          </div>
        ) : (
        <>
        {/* Left Column */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 border-r border-[var(--wiring-glass-border)]">
          {/* Description */}
          <section>
            <h3 className="text-xs font-semibold text-[var(--wiring-text-tertiary)] uppercase mb-2">설명</h3>
            <p className="text-sm text-[var(--wiring-text-secondary)] leading-relaxed whitespace-pre-wrap">
              {ticket.description}
            </p>
          </section>

          <Separator className="bg-[var(--wiring-glass-border)]" />

          {/* Subtasks */}
          <SubtaskSection
            ticketId={ticket.id}
            subtasks={ticketSubtasks}
            onToggle={(subtaskId) => toggleSubtask(ticket.id, subtaskId)}
            onAdd={(title) => addSubtask(ticket.id, { id: `sub-${Date.now()}`, ticketId: ticket.id, title, completed: false })}
          />

          <Separator className="bg-[var(--wiring-glass-border)]" />

          {/* Activity & Comments */}
          <ActivitySection
            ticketId={ticket.id}
            comments={ticketComments}
            activities={ticketActivities}
            onAddComment={(content) =>
              addComment(ticket.id, {
                id: `cmt-${Date.now()}`,
                ticketId: ticket.id,
                author: { type: "human", name: CURRENT_USER.name, id: CURRENT_USER.id },
                content,
                timestamp: new Date().toISOString(),
              })
            }
          />
        </div>

        {/* Right Column */}
        <div className="w-80 shrink-0 overflow-y-auto p-5 space-y-5">
          {/* Status Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:opacity-80"
              style={{ backgroundColor: statusConfig.color + "20", color: statusConfig.color }}
            >
              {statusConfig.label}
              <ChevronDown className="w-4 h-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {ALL_STATUSES.map((s) => (
                <DropdownMenuItem key={s} onClick={() => moveTicket(ticket.id, s)}>
                  <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: STATUS_CONFIG[s].color }} />
                  {STATUS_CONFIG[s].label}
                  {s === ticket.status && <CheckCircle className="w-3 h-3 ml-auto text-[var(--wiring-accent)]" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Separator className="bg-[var(--wiring-glass-border)]" />

          {/* Details Section */}
          <section className="space-y-3">
            <h3 className="text-xs font-semibold text-[var(--wiring-text-tertiary)] uppercase">세부 정보</h3>

            <DetailRow label="담당 Agent">
              {ticket.assignedAgent ? (
                <span className="flex items-center gap-1 text-sm text-[var(--wiring-accent)]">
                  <Bot className="w-3.5 h-3.5" />
                  {ticket.assignedAgent} Agent
                </span>
              ) : (
                <span className="text-sm text-[var(--wiring-text-tertiary)]">미배정</span>
              )}
            </DetailRow>

            <DetailRow label="담당자">
              {ticket.assignedHuman ? (
                <span className="flex items-center gap-1 text-sm text-[var(--wiring-text-primary)]">
                  <User className="w-3.5 h-3.5" />
                  {ticket.assignedHuman.name}
                  <Badge variant="secondary" className="text-[9px] ml-1">{ticket.assignedHuman.level}</Badge>
                </span>
              ) : (
                <span className="text-sm text-[var(--wiring-text-tertiary)]">미배정</span>
              )}
            </DetailRow>

            <DetailRow label="우선순위">
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1.5 text-sm hover:opacity-80 transition-opacity">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: priorityConfig.color }} />
                  <span style={{ color: priorityConfig.color }}>{priorityConfig.label}</span>
                  <ChevronDown className="w-3 h-3 text-[var(--wiring-text-tertiary)]" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {ALL_PRIORITIES.map((p) => (
                    <DropdownMenuItem key={p} onClick={() => updateTicket(ticket.id, { priority: p })}>
                      <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: PRIORITY_CONFIG[p].color }} />
                      {PRIORITY_CONFIG[p].label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </DetailRow>

            <DetailRow label="Epic">
              {epic ? (
                <span className="text-sm text-[var(--wiring-accent)]">{epic.title}</span>
              ) : (
                <span className="text-sm text-[var(--wiring-text-tertiary)]">—</span>
              )}
            </DetailRow>

            {ticket.labels && ticket.labels.length > 0 && (
              <DetailRow label="라벨">
                <div className="flex flex-wrap gap-1">
                  {ticket.labels.map((label) => (
                    <Badge key={label} variant="secondary" className="text-[9px]">
                      <Tag className="w-2.5 h-2.5 mr-0.5" />
                      {label}
                    </Badge>
                  ))}
                </div>
              </DetailRow>
            )}
          </section>

          <Separator className="bg-[var(--wiring-glass-border)]" />

          {/* Time & Cost */}
          <section className="space-y-3">
            <h3 className="text-xs font-semibold text-[var(--wiring-text-tertiary)] uppercase">시간 & 비용</h3>

            <DetailRow label="예상 시간">
              <span className="flex items-center gap-1 text-sm text-[var(--wiring-text-primary)]">
                <Clock className="w-3.5 h-3.5 text-[var(--wiring-text-tertiary)]" />
                {ticket.estimatedHours}h
              </span>
            </DetailRow>

            {ticket.actualHours !== undefined && (
              <DetailRow label="실제 시간">
                <span className="text-sm text-[var(--wiring-text-primary)]">{ticket.actualHours}h</span>
              </DetailRow>
            )}

            {ticket.costUsd !== undefined && (
              <DetailRow label="AI 비용">
                <span className="flex items-center gap-1 text-sm text-[var(--wiring-success)]">
                  <DollarSign className="w-3.5 h-3.5" />
                  ${ticket.costUsd.toFixed(2)}
                </span>
              </DetailRow>
            )}
          </section>

          {/* HITL Status */}
          {relatedHITL.length > 0 && (
            <>
              <Separator className="bg-[var(--wiring-glass-border)]" />
              <section className="space-y-3">
                <h3 className="text-xs font-semibold text-[var(--wiring-text-tertiary)] uppercase">HITL 상태</h3>
                {relatedHITL.map((item) => (
                  <button key={item.id} onClick={() => setActiveHitl(item.id)} className="w-full text-left">
                    <div className="p-2.5 rounded-lg border border-[var(--wiring-glass-border)] hover:bg-[var(--wiring-glass-hover)] transition-colors cursor-pointer">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-[var(--wiring-text-primary)]">{item.title}</span>
                        <ArrowRight className="w-3 h-3 text-[var(--wiring-text-tertiary)]" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-[9px]" style={{
                          color: item.status === "waiting" ? "var(--hitl-waiting)" : item.status === "approved" ? "var(--wiring-success)" : "var(--wiring-info)"
                        }}>
                          {item.status === "waiting" ? "대기" : item.status === "approved" ? "승인" : item.status}
                        </Badge>
                        <span className="text-[9px] text-[var(--wiring-text-tertiary)]">by {item.requestedBy}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </section>
            </>
          )}

          {/* Dependencies */}
          {ticket.dependsOn && ticket.dependsOn.length > 0 && (
            <>
              <Separator className="bg-[var(--wiring-glass-border)]" />
              <section className="space-y-3">
                <h3 className="text-xs font-semibold text-[var(--wiring-text-tertiary)] uppercase">의존성</h3>
                <div className="space-y-1">
                  {ticket.dependsOn.map((dep) => (
                    <div key={dep} className="flex items-center gap-2 text-xs">
                      <Link2 className="w-3 h-3 text-[var(--wiring-text-tertiary)]" />
                      <span className="text-[var(--wiring-text-secondary)]">{dep}</span>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}

          {/* Meta */}
          <Separator className="bg-[var(--wiring-glass-border)]" />
          <section className="space-y-1 text-[10px] text-[var(--wiring-text-tertiary)]">
            {ticket.createdAt && (
              <p>
                <Calendar className="w-2.5 h-2.5 inline mr-1" />
                생성: {new Date(ticket.createdAt).toLocaleDateString("ko-KR")}
              </p>
            )}
            {ticket.updatedAt && (
              <p>
                <Calendar className="w-2.5 h-2.5 inline mr-1" />
                수정: {new Date(ticket.updatedAt).toLocaleDateString("ko-KR")}
              </p>
            )}
          </section>
        </div>
        </>
        )}
      </div>
    </div>
  );
}

// ─── Sub-components ───

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between">
      <span className="text-xs text-[var(--wiring-text-tertiary)] min-w-[70px] pt-0.5">{label}</span>
      <div className="flex-1 text-right">{children}</div>
    </div>
  );
}

function SubtaskSection({
  ticketId,
  subtasks,
  onToggle,
  onAdd,
}: {
  ticketId: string;
  subtasks: { id: string; title: string; completed: boolean }[];
  onToggle: (id: string) => void;
  onAdd: (title: string) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  const completed = subtasks.filter((s) => s.completed).length;

  const handleAdd = () => {
    if (!newTitle.trim()) return;
    onAdd(newTitle.trim());
    setNewTitle("");
    setAdding(false);
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-semibold text-[var(--wiring-text-tertiary)] uppercase">
          하위 작업 {subtasks.length > 0 && `(${completed}/${subtasks.length})`}
        </h3>
        <button
          onClick={() => setAdding(true)}
          className="text-[var(--wiring-accent)] hover:opacity-80 transition-opacity"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {subtasks.length > 0 && (
        <div className="mb-2">
          <div className="w-full h-1.5 rounded-full bg-[var(--wiring-glass-border)] overflow-hidden">
            <div
              className="h-full rounded-full bg-[var(--wiring-accent)] transition-all"
              style={{ width: `${subtasks.length > 0 ? (completed / subtasks.length) * 100 : 0}%` }}
            />
          </div>
        </div>
      )}

      <div className="space-y-1">
        {subtasks.map((s) => (
          <button
            key={s.id}
            onClick={() => onToggle(s.id)}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm hover:bg-[var(--wiring-glass-hover)] transition-colors text-left"
          >
            {s.completed ? (
              <CheckSquare className="w-4 h-4 text-[var(--wiring-accent)] shrink-0" />
            ) : (
              <Square className="w-4 h-4 text-[var(--wiring-text-tertiary)] shrink-0" />
            )}
            <span className={s.completed ? "line-through text-[var(--wiring-text-tertiary)]" : "text-[var(--wiring-text-primary)]"}>
              {s.title}
            </span>
          </button>
        ))}
      </div>

      {adding && (
        <div className="flex items-center gap-2 mt-2">
          <Input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); if (e.key === "Escape") setAdding(false); }}
            placeholder="하위 작업 제목"
            className="h-8 text-xs bg-[var(--wiring-glass-bg)] border-[var(--wiring-glass-border)]"
            autoFocus
          />
          <Button size="sm" className="h-8 text-xs" onClick={handleAdd}>추가</Button>
        </div>
      )}

      {subtasks.length === 0 && !adding && (
        <p className="text-xs text-[var(--wiring-text-tertiary)]">하위 작업이 없습니다</p>
      )}
    </section>
  );
}

function ActivitySection({
  ticketId,
  comments,
  activities,
  onAddComment,
}: {
  ticketId: string;
  comments: { id: string; author: { type: string; name: string }; content: string; timestamp: string }[];
  activities: { id: string; type: string; description: string; timestamp: string }[];
  onAddComment: (content: string) => void;
}) {
  const [commentInput, setCommentInput] = useState("");

  const handleSubmit = () => {
    if (!commentInput.trim()) return;
    onAddComment(commentInput.trim());
    setCommentInput("");
  };

  // Merge comments and activities into a unified timeline
  const allItems = useMemo(() => {
    const items: { id: string; type: "comment" | "activity"; timestamp: string; data: unknown }[] = [
      ...comments.map((c) => ({ id: c.id, type: "comment" as const, timestamp: c.timestamp, data: c })),
      ...activities.map((a) => ({ id: a.id, type: "activity" as const, timestamp: a.timestamp, data: a })),
    ];
    return items.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }, [comments, activities]);

  return (
    <section>
      <h3 className="text-xs font-semibold text-[var(--wiring-text-tertiary)] uppercase mb-3">활동</h3>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all" className="text-xs">모두 ({allItems.length})</TabsTrigger>
          <TabsTrigger value="comments" className="text-xs">댓글 ({comments.length})</TabsTrigger>
          <TabsTrigger value="history" className="text-xs">기록 ({activities.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-3">
          <ActivityList items={allItems} />
        </TabsContent>
        <TabsContent value="comments" className="mt-3">
          <ActivityList items={allItems.filter((i) => i.type === "comment")} />
        </TabsContent>
        <TabsContent value="history" className="mt-3">
          <ActivityList items={allItems.filter((i) => i.type === "activity")} />
        </TabsContent>
      </Tabs>

      {/* Comment input */}
      <div className="flex items-end gap-2 mt-4">
        <textarea
          value={commentInput}
          onChange={(e) => setCommentInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
          placeholder="댓글 추가..."
          rows={2}
          className="flex-1 resize-none bg-[var(--wiring-glass-bg)] border border-[var(--wiring-glass-border)] rounded-lg px-3 py-2 text-xs text-[var(--wiring-text-primary)] placeholder:text-[var(--wiring-text-tertiary)] focus:outline-none focus:border-[var(--wiring-accent)] transition-colors"
        />
        <Button size="sm" onClick={handleSubmit} disabled={!commentInput.trim()} className="h-8">
          <Send className="w-3.5 h-3.5" />
        </Button>
      </div>
    </section>
  );
}

function ActivityList({ items }: { items: { id: string; type: "comment" | "activity"; timestamp: string; data: unknown }[] }) {
  if (items.length === 0) {
    return <p className="text-xs text-[var(--wiring-text-tertiary)] py-2">활동 내역이 없습니다</p>;
  }

  return (
    <div className="space-y-3">
      {items.map((item) => {
        if (item.type === "comment") {
          const c = item.data as { author: { type: string; name: string }; content: string; timestamp: string };
          const isAgent = c.author.type === "agent";
          return (
            <div key={item.id} className="flex gap-2">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0"
                style={{ backgroundColor: isAgent ? "var(--wiring-accent)" : "var(--wiring-text-secondary)" }}
              >
                {isAgent ? <Bot className="w-3 h-3" /> : c.author.name.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-medium text-[var(--wiring-text-primary)]">{c.author.name}</span>
                  <span className="text-[9px] text-[var(--wiring-text-tertiary)]">
                    {new Date(c.timestamp).toLocaleString("ko-KR", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <p className="text-xs text-[var(--wiring-text-secondary)] leading-relaxed">{c.content}</p>
              </div>
            </div>
          );
        } else {
          const a = item.data as { description: string; timestamp: string };
          return (
            <div key={item.id} className="flex items-center gap-2 text-[10px] text-[var(--wiring-text-tertiary)]">
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--wiring-glass-border)]" />
              <span>{a.description}</span>
              <span className="ml-auto">
                {new Date(a.timestamp).toLocaleString("ko-KR", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          );
        }
      })}
    </div>
  );
}
