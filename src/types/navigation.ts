export type NavSection =
  | "dashboard"
  | "tickets"
  | "flowchart"
  | "documents"
  | "agents"
  | "governance"
  | "external"
  | "settings";

export interface NavItem {
  id: NavSection;
  label: string;
  icon: string; // lucide icon name
  href: string;
  separated?: boolean; // visual separator before this item
}
