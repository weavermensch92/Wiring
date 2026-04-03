"use client";

import { use, useEffect } from "react";
import { DUMMY_TEAMS } from "@/dummy/teams";
import { DUMMY_PROJECTS } from "@/dummy/projects";
import { useProjectStore } from "@/stores/project-store";
import { useNavigationStore } from "@/stores/navigation-store";
import { ProjectWorkspace } from "@/components/project/project-workspace";
import { NavSection } from "@/types/navigation";

export default function ProjectPage({
  params,
}: {
  params: Promise<{ teamId: string; projectId: string }>;
}) {
  const { teamId, projectId } = use(params);
  const { setCurrentProject } = useProjectStore();
  const { setActiveSection, setActiveProjectId } = useNavigationStore();

  const team = DUMMY_TEAMS.find((t) => t.id === teamId);
  const project = DUMMY_PROJECTS.find((p) => p.id === projectId);

  useEffect(() => {
    setCurrentProject(projectId);
    setActiveSection(`team-${teamId}` as NavSection);
    setActiveProjectId(projectId);
    return () => setActiveProjectId(null);
  }, [teamId, projectId, setCurrentProject, setActiveSection, setActiveProjectId]);

  if (!team || !project) {
    return (
      <div className="flex items-center justify-center h-full text-[var(--wiring-text-tertiary)]">
        <p className="text-sm">프로젝트를 찾을 수 없습니다</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Project Header */}
      <div className="px-6 py-4 border-b border-[var(--wiring-glass-border)]">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
            style={{ backgroundColor: team.color + "20", color: team.color }}
          >
            {team.abbreviation}
          </div>
          <div>
            <h1 className="text-lg font-semibold text-[var(--wiring-text-primary)]">
              {project.name}
            </h1>
            <p className="text-xs text-[var(--wiring-text-tertiary)]">
              {project.description}
            </p>
          </div>
        </div>
      </div>

      {/* Workspace */}
      <div className="flex-1 overflow-hidden">
        <ProjectWorkspace projectId={projectId} />
      </div>
    </div>
  );
}
