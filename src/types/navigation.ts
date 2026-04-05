// NavSection can be a fixed section or a dynamic team section (team-{teamId})
export type NavSection =
  | "home"
  | "inbox"
  | "skills"
  | "governance"
  | "settings"
  | "analytics"
  | `team-${string}`;

export function isTeamSection(section: NavSection): section is `team-${string}` {
  return section.startsWith("team-");
}

export function getTeamIdFromSection(section: NavSection): string | null {
  if (isTeamSection(section)) {
    return section.replace("team-", "");
  }
  return null;
}

export interface NavItem {
  id: NavSection;
  label: string;
  icon: string;
  href: string;
  separated?: boolean;
}
