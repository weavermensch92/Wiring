"use client";

import { useState } from "react";
import { useProjectStore } from "@/stores/project-store";
import { Epic, EpicStatus, Priority } from "@/types/project";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Layers } from "lucide-react";

const PRIORITIES: { value: Priority; label: string; color: string }[] = [
  { value: "critical", label: "긴급", color: "var(--wiring-danger)" },
  { value: "high", label: "높음", color: "var(--wiring-warning)" },
  { value: "medium", label: "보통", color: "var(--wiring-info)" },
  { value: "low", label: "낮음", color: "var(--wiring-text-tertiary)" },
];

export function AddEpicDialog({
  open,
  onOpenChange,
  projectId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
}) {
  const { addEpic } = useProjectStore();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [estimatedDays, setEstimatedDays] = useState("14");
  const [estimatedCost, setEstimatedCost] = useState("500");

  const handleSubmit = () => {
    if (!title.trim()) return;
    const epic: Epic = {
      id: `epic-${Date.now()}`,
      projectId,
      title: title.trim(),
      description: description.trim(),
      status: "backlog" as EpicStatus,
      priority,
      ticketCount: 0,
      completedTickets: 0,
      estimatedCost: parseFloat(estimatedCost) || 500,
      estimatedDays: parseInt(estimatedDays) || 14,
    };
    addEpic(projectId, epic);
    onOpenChange(false);
    setTitle("");
    setDescription("");
    setPriority("medium");
    setEstimatedDays("14");
    setEstimatedCost("500");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[var(--wiring-accent)]" />
            <DialogTitle>새 에픽 생성</DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* 에픽명 */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[var(--wiring-text-secondary)]">에픽명 *</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 사용자 인증 시스템 구축"
              className="text-sm"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
          </div>

          {/* 설명 */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[var(--wiring-text-secondary)]">설명</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="에픽의 목표와 주요 산출물을 설명해 주세요..."
              rows={3}
              className="w-full px-3 py-2 text-sm rounded-lg bg-[var(--wiring-glass-bg)] border border-[var(--wiring-glass-border)] text-[var(--wiring-text-primary)] placeholder-[var(--wiring-text-tertiary)] outline-none focus:border-[var(--wiring-accent)] resize-none"
            />
          </div>

          {/* 우선순위 */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[var(--wiring-text-secondary)]">우선순위</label>
            <div className="flex gap-2">
              {PRIORITIES.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setPriority(p.value)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                    priority === p.value
                      ? "border-transparent text-white"
                      : "border-[var(--wiring-glass-border)] text-[var(--wiring-text-secondary)] hover:bg-[var(--wiring-glass-hover)]"
                  }`}
                  style={priority === p.value ? { backgroundColor: p.color } : undefined}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* 예상 기간 & 비용 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--wiring-text-secondary)]">예상 기간 (일)</label>
              <Input
                type="number"
                value={estimatedDays}
                onChange={(e) => setEstimatedDays(e.target.value)}
                min="1"
                className="text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--wiring-text-secondary)]">예상 비용 ($)</label>
              <Input
                type="number"
                value={estimatedCost}
                onChange={(e) => setEstimatedCost(e.target.value)}
                min="0"
                className="text-sm"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="text-sm">
            취소
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!title.trim()}
            className="text-sm"
            style={{ backgroundColor: title.trim() ? "var(--wiring-accent)" : undefined }}
          >
            에픽 생성
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
