export type DocumentType = "spec" | "design" | "meeting" | "technical" | "runbook" | "report";
export type DocumentStatus = "draft" | "published" | "archived";

export interface WiringDocument {
  id: string;
  title: string;
  content: string; // markdown
  type: DocumentType;
  status: DocumentStatus;
  teamId?: string;
  projectId?: string;
  skillIds?: string[];
  tags: string[];
  authorId: string; // user or agent id
  authorType: "human" | "agent";
  createdAt: string;
  updatedAt: string;
  viewCount: number;
}
