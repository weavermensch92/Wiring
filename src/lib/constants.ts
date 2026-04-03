import { NavSection } from "@/types/navigation";

export interface NavItemDef {
  id: NavSection;
  label: string;
  icon: string;
  href: string;
  separated?: boolean;
}

// Fixed top nav items (teams are injected dynamically between home and skills)
export const TOP_NAV_ITEMS: NavItemDef[] = [
  { id: "home", label: "홈", icon: "Home", href: "/home" },
];

// Fixed bottom-middle nav items (below teams)
export const BOTTOM_NAV_ITEMS: NavItemDef[] = [
  { id: "skills", label: "스킬", icon: "BookOpen", href: "/skills", separated: true },
  { id: "governance", label: "거버넌스", icon: "Shield", href: "/governance" },
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
