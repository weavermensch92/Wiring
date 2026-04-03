"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KanbanBoard } from "./kanban-board";
import { FlowchartView } from "./flowchart-view";
import { LayoutGrid, CalendarDays, GitBranch } from "lucide-react";

export function ProjectWorkspace({ projectId }: { projectId: string }) {
  return (
    <Tabs defaultValue="board" className="flex flex-col h-full">
      <div className="px-4 pt-3 border-b border-[var(--wiring-glass-border)]">
        <TabsList>
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
      </div>

      <TabsContent value="board" className="flex-1 overflow-hidden mt-0">
        <KanbanBoard projectId={projectId} />
      </TabsContent>

      <TabsContent value="timeline" className="flex-1 mt-0">
        <div className="flex items-center justify-center h-full text-[var(--wiring-text-tertiary)]">
          <div className="text-center">
            <CalendarDays className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">타임라인 뷰 (준비 중)</p>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="flowchart" className="flex-1 mt-0 overflow-hidden">
        <FlowchartView projectId={projectId} />
      </TabsContent>
    </Tabs>
  );
}
