"use client";

import { useState } from "react";
import { TicketStatus, Priority, Ticket } from "@/types/project";
import { useProjectStore } from "@/stores/project-store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const AGENTS = ["PM", "GM", "SM", "Dsn", "Pln", "FE", "BE", "BM", "HR"];

export function AddTicketDialog({
  open,
  onOpenChange,
  epicId,
  defaultStatus,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  epicId: string;
  defaultStatus: TicketStatus;
}) {
  const { addTicket } = useProjectStore();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [agent, setAgent] = useState("FE");
  const [hours, setHours] = useState("4");

  const handleSubmit = () => {
    if (!title.trim()) return;

    const ticket: Ticket = {
      id: `ticket-${Date.now()}`,
      epicId,
      title: title.trim(),
      description: description.trim(),
      status: defaultStatus,
      priority,
      assignedAgent: agent,
      estimatedHours: parseInt(hours) || 4,
    };

    addTicket(epicId, ticket);
    onOpenChange(false);
    setTitle("");
    setDescription("");
    setPriority("medium");
    setAgent("FE");
    setHours("4");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>새 티켓 추가</DialogTitle>
          <DialogDescription>
            {epicId} 에픽에 새 티켓을 추가합니다
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-[var(--wiring-text-tertiary)] mb-1 block">
              제목
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="티켓 제목"
              className="bg-[var(--wiring-glass-bg)] border-[var(--wiring-glass-border)]"
            />
          </div>

          <div>
            <label className="text-xs text-[var(--wiring-text-tertiary)] mb-1 block">
              설명
            </label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="티켓 설명"
              className="bg-[var(--wiring-glass-bg)] border-[var(--wiring-glass-border)]"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-xs text-[var(--wiring-text-tertiary)] mb-1 block">
                우선순위
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full h-9 rounded-md border border-[var(--wiring-glass-border)] bg-[var(--wiring-glass-bg)] px-2 text-sm text-[var(--wiring-text-primary)]"
              >
                <option value="critical">긴급</option>
                <option value="high">높음</option>
                <option value="medium">중간</option>
                <option value="low">낮음</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-[var(--wiring-text-tertiary)] mb-1 block">
                담당 Agent
              </label>
              <select
                value={agent}
                onChange={(e) => setAgent(e.target.value)}
                className="w-full h-9 rounded-md border border-[var(--wiring-glass-border)] bg-[var(--wiring-glass-bg)] px-2 text-sm text-[var(--wiring-text-primary)]"
              >
                {AGENTS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-[var(--wiring-text-tertiary)] mb-1 block">
                예상 시간
              </label>
              <Input
                type="number"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                min="1"
                className="bg-[var(--wiring-glass-bg)] border-[var(--wiring-glass-border)]"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleSubmit} disabled={!title.trim()}>
            추가
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
