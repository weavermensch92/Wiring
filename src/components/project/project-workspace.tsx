"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KanbanBoard } from "./kanban-board";
import { FlowchartView } from "./flowchart-view";
import { TimelineView } from "./timeline-view";
import { ProjectOverview } from "./project-overview";
import { AddEpicDialog } from "./add-epic-dialog";
import { LayoutGrid, CalendarDays, GitBranch, BarChart3, Plus, Layers } from "lucide-react";

export function ProjectWorkspace({ projectId }: { projectId: string }) {
  const [addEpicOpen, setAddEpicOpen] = useState(false);

  return (
    <>
    <Tabs defaultValue="overview" className="flex flex-col h-full">
      <div className="px-4 pt-3 border-b border-[var(--wiring-glass-border)] flex items-center justify-between">
        <TabsList>
          <TabsTrigger value="overview" className="gap-1.5">
            <BarChart3 className="w-3.5 h-3.5" />
            개요
          </TabsTrigger>
          <TabsTrigger value="board" className="gap-1.5">
            <LayoutGrid className="w-3.5 h-3.5" />
            보드
          </TabsTrigger>
          <TabsTrigger value="timeline" className="gap-1.5">
            <CalendarDays className="w-3.5 h-3.5" />
            타임라인
          </TabsTrigger>
          <TabsTrigger value="flowchart" className="gap-1.5">
            <GitBranch className="w-3.5 h-3.5" />
            플로차트
          </TabsTrigger>
        </TabsList>
        <button
          onClick={() => setAddEpicOpen(true)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs text-[var(--wiring-text-secondary)] hover:bg-[var(--wiring-glass-hover)] border border-[var(--wiring-glass-border)] transition-colors ml-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <Layers className="w-3 h-3" />
          에픽 추가
        </button>
      </div>

      <TabsContent value="overview" className="flex-1 overflow-hidden mt-0">
        <ProjectOverview projectId={projectId} />
      </TabsContent>

      <TabsContent value="board" className="flex-1 overflow-hidden mt-0">
        <KanbanBoard projectId={projectId} />
      </TabsContent>

      <TabsContent value="timeline" className="flex-1 mt-0 overflow-hidden">
        <TimelineView projectId={projectId} />
      </TabsContent>

      <TabsContent value="flowchart" className="flex-1 mt-0 overflow-hidden">
        <FlowchartView projectId={projectId} />
      </TabsContent>
    </Tabs>
    <AddEpicDialog open={addEpicOpen} onOpenChange={setAddEpicOpen} projectId={projectId} />
    </>
  );
}
