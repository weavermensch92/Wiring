"use client";

import { useState } from "react";
import { useProjectStore } from "@/stores/project-store";
import { Project, ProjectStatus } from "@/types/project";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FolderPlus } from "lucide-react";

const AGENTS = ["PM", "GM", "SM", "Dsn", "Pln", "FE", "BE", "BM", "HR"];

export function AddProjectDialog({
  open,
  onOpenChange,
  teamId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teamId: string;
}) {
  const { addProject } = useProjectStore();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 2);
    return d.toISOString().slice(0, 10);
  });

  const handleSubmit = () => {
    if (!name.trim()) return;
    const project: Project = {
      id: `proj-${Date.now()}`,
      teamId,
      name: name.trim(),
      description: description.trim(),
      startDate,
      endDate,
      memberCount: 1,
      status: "active" as ProjectStatus,
    };
    addProject(project);
    onOpenChange(false);
    setName("");
    setDescription("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <FolderPlus className="w-4 h-4 text-[var(--wiring-accent)]" />
            <DialogTitle>새 프로젝트 생성</DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* 프로젝트명 */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[var(--wiring-text-secondary)]">프로젝트명 *</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 결제 시스템 v3"
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
              placeholder="프로젝트 목표와 범위를 간략하게 설명해 주세요..."
              rows={3}
              className="w-full px-3 py-2 text-sm rounded-lg bg-[var(--wiring-glass-bg)] border border-[var(--wiring-glass-border)] text-[var(--wiring-text-primary)] placeholder-[var(--wiring-text-tertiary)] outline-none focus:border-[var(--wiring-accent)] resize-none"
            />
          </div>

          {/* 기간 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--wiring-text-secondary)]">시작일</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg bg-[var(--wiring-glass-bg)] border border-[var(--wiring-glass-border)] text-[var(--wiring-text-primary)] outline-none focus:border-[var(--wiring-accent)]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--wiring-text-secondary)]">종료일</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg bg-[var(--wiring-glass-bg)] border border-[var(--wiring-glass-border)] text-[var(--wiring-text-primary)] outline-none focus:border-[var(--wiring-accent)]"
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
            disabled={!name.trim()}
            className="text-sm"
            style={{ backgroundColor: name.trim() ? "var(--wiring-accent)" : undefined }}
          >
            프로젝트 생성
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
