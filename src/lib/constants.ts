import { NavSection } from "@/types/navigation";

export interface NavItemDef {
  id: NavSection;
  label: string;
  icon: string;
  href: string;
  separated?: boolean;
}

export const NAV_ITEMS: NavItemDef[] = [
  { id: "dashboard", label: "대시보드", icon: "LayoutDashboard", href: "/dashboard" },
  { id: "tickets", label: "티켓", icon: "KanbanSquare", href: "/tickets" },
  { id: "flowchart", label: "플로차트", icon: "GitBranch", href: "/flowchart" },
  { id: "documents", label: "문서/스킬", icon: "FileText", href: "/documents" },
  { id: "agents", label: "에이전트", icon: "Bot", href: "/agents" },
  { id: "governance", label: "거버넌스", icon: "Shield", href: "/governance" },
  { id: "external", label: "외부 업무", icon: "Briefcase", href: "/external", separated: true },
];

export const AGENT_COLORS: Record<string, string> = {
  PM: "#8B5CF6",
  GM: "#F97316",
  SM: "#3B82F6",
  Dsn: "#EC4899",
  Pln: "#10B981",
  FE: "#06B6D4",
  BE: "#6366F1",
  BM: "#EAB308",
  HR: "#14B8A6",
};
