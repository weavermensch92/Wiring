"use client";

import { usePathname, useRouter } from "next/navigation";
import { useNavigationStore } from "@/stores/navigation-store";
import { TOP_NAV_ITEMS, BOTTOM_NAV_ITEMS } from "@/lib/constants";
import { getTeamsForUser } from "@/dummy/teams";
import { CURRENT_USER } from "@/dummy/users";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Home,
  BookOpen,
  Shield,
  Settings,
} from "lucide-react";
import { NavSection } from "@/types/navigation";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Home,
  BookOpen,
  Shield,
  Settings,
};

const userTeams = getTeamsForUser(CURRENT_USER.id);

export function IconNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { activeSection, setActiveSection } = useNavigationStore();

  const handleNav = (id: NavSection, href: string) => {
    setActiveSection(id);
    router.push(href);
  };

  const isActive = (section: NavSection) => activeSection === section;

  return (
    <nav className="flex flex-col items-center w-16 h-screen bg-[var(--wiring-bg-secondary)] border-r border-[var(--wiring-glass-border)] shrink-0">
      {/* Logo */}
      <div className="flex items-center justify-center w-full h-14 mb-2 shrink-0">
        <span className="text-sm font-bold text-[var(--wiring-accent)]">W</span>
      </div>

      {/* Top fixed: Home */}
      <div className="flex flex-col items-center gap-1 shrink-0">
        {TOP_NAV_ITEMS.map((item) => {
          const Icon = ICON_MAP[item.icon];
          const active = isActive(item.id);
          return (
            <NavButton
              key={item.id}
              active={active}
              label={item.label}
              onClick={() => handleNav(item.id, item.href)}
            >
              {Icon && <Icon className="w-5 h-5" />}
            </NavButton>
          );
        })}
      </div>

      <Separator className="my-2 w-8 bg-[var(--wiring-glass-border)]" />

      {/* Dynamic: Teams (scrollable if many) */}
      <ScrollArea className="flex-1 w-full">
        <div className="flex flex-col items-center gap-1 py-1">
          {userTeams.map((team) => {
            const section: NavSection = `team-${team.id}`;
            const active = isActive(section);
            return (
              <NavButton
                key={team.id}
                active={active}
                label={team.name}
                onClick={() => handleNav(section, `/team/${team.id}`)}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold transition-all duration-150"
                  style={{
                    backgroundColor: active ? team.color + "20" : "var(--wiring-bg-elevated)",
                    color: active ? team.color : "var(--wiring-text-secondary)",
                    border: active ? `1.5px solid ${team.color}` : "1.5px solid transparent",
                  }}
                >
                  {team.abbreviation}
                </div>
              </NavButton>
            );
          })}
        </div>
      </ScrollArea>

      <Separator className="my-2 w-8 bg-[var(--wiring-glass-border)]" />

      {/* Bottom-middle fixed: Skills + Governance */}
      <div className="flex flex-col items-center gap-1 shrink-0">
        {BOTTOM_NAV_ITEMS.map((item) => {
          const Icon = ICON_MAP[item.icon];
          const active = isActive(item.id);
          return (
            <NavButton
              key={item.id}
              active={active}
              label={item.label}
              onClick={() => handleNav(item.id, item.href)}
            >
              {Icon && <Icon className="w-5 h-5" />}
            </NavButton>
          );
        })}
      </div>

      {/* Bottom fixed: Settings + Profile */}
      <div className="flex flex-col items-center gap-1 pb-4 pt-2 shrink-0">
        <NavButton
          active={isActive("settings")}
          label="설정"
          onClick={() => handleNav("settings", "/settings")}
        >
          <Settings className="w-5 h-5" />
        </NavButton>

        <Tooltip>
          <TooltipTrigger className="flex items-center justify-center w-11 h-11 cursor-pointer">
            <Avatar className="w-8 h-8 border border-[var(--wiring-glass-border)]">
              <AvatarFallback className="bg-[var(--wiring-bg-elevated)] text-xs text-[var(--wiring-text-secondary)]">
                {CURRENT_USER.avatar}
              </AvatarFallback>
            </Avatar>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={8}>
            {CURRENT_USER.name}
          </TooltipContent>
        </Tooltip>
      </div>
    </nav>
  );
}

function NavButton({
  active,
  label,
  onClick,
  children,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        onClick={onClick}
        className={`relative flex items-center justify-center w-11 h-11 rounded-lg transition-all duration-150 cursor-pointer ${
          active
            ? "bg-[var(--wiring-accent-glow)] text-[var(--wiring-accent)]"
            : "text-[var(--wiring-text-secondary)] hover:bg-[var(--wiring-glass-hover)] hover:text-[var(--wiring-text-primary)]"
        }`}
      >
        {active && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-5 bg-[var(--wiring-accent)] rounded-r" />
        )}
        {children}
      </TooltipTrigger>
      <TooltipContent side="right" sideOffset={8}>
        {label}
      </TooltipContent>
    </Tooltip>
  );
}
