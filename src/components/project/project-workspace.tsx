"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KanbanBoard } from "./kanban-board";
import { FlowchartView } from "./flowchart-view";
import { TimelineView } from "./timeline-view";
import { ProjectOverview } from "./project-overview";
import { LayoutGrid, CalendarDays, GitBranch, BarChart3 } from "lucide-react";

export function ProjectWorkspace({ projectId }: { projectId: string }) {
  return (
    <Tabs defaultValue="overview" className="flex flex-col h-full">
      <div className="px-4 pt-3 border-b border-[var(--wiring-glass-border)]">
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
  );
}
