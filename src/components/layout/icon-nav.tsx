"use client";

import { usePathname, useRouter } from "next/navigation";
import { useNavigationStore } from "@/stores/navigation-store";
import { NAV_ITEMS } from "@/lib/constants";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { CURRENT_USER } from "@/dummy/users";
import {
  LayoutDashboard,
  KanbanSquare,
  GitBranch,
  FileText,
  Bot,
  Shield,
  Briefcase,
  Settings,
} from "lucide-react";
import { NavSection } from "@/types/navigation";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  KanbanSquare,
  GitBranch,
  FileText,
  Bot,
  Shield,
  Briefcase,
  Settings,
};

export function IconNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { setActiveSection } = useNavigationStore();

  const handleNav = (id: NavSection, href: string) => {
    setActiveSection(id);
    router.push(href);
  };

  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <nav className="flex flex-col items-center w-16 h-screen bg-[var(--wiring-bg-secondary)] border-r border-[var(--wiring-glass-border)] shrink-0">
      {/* Logo */}
      <div className="flex items-center justify-center w-full h-14 mb-2">
        <span className="text-sm font-bold text-[var(--wiring-accent)]">W</span>
      </div>

      {/* Main nav items */}
      <div className="flex flex-col items-center gap-1 flex-1">
        {NAV_ITEMS.map((item) => {
          const Icon = ICON_MAP[item.icon];
          const active = isActive(item.href);
          return (
            <div key={item.id}>
              {item.separated && (
                <Separator className="my-2 w-8 mx-auto bg-[var(--wiring-glass-border)]" />
              )}
              <Tooltip>
                <TooltipTrigger
                  onClick={() => handleNav(item.id, item.href)}
                  className={`relative flex items-center justify-center w-11 h-11 rounded-lg transition-all duration-150 cursor-pointer ${
                    active
                      ? "bg-[var(--wiring-accent-glow)] text-[var(--wiring-accent)]"
                      : "text-[var(--wiring-text-secondary)] hover:bg-[var(--wiring-glass-hover)] hover:text-[var(--wiring-text-primary)]"
                  }`}
                >
                  {active && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-5 bg-[var(--wiring-accent)] rounded-r" />
                  )}
                  {Icon && <Icon className="w-5 h-5" />}
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={8}>
                  {item.label}
                </TooltipContent>
              </Tooltip>
            </div>
          );
        })}
      </div>

      {/* Bottom: Settings + Profile */}
      <div className="flex flex-col items-center gap-1 pb-4">
        <Tooltip>
          <TooltipTrigger
            onClick={() => handleNav("settings", "/settings")}
            className={`flex items-center justify-center w-11 h-11 rounded-lg transition-all duration-150 cursor-pointer ${
              pathname.startsWith("/settings")
                ? "bg-[var(--wiring-accent-glow)] text-[var(--wiring-accent)]"
                : "text-[var(--wiring-text-secondary)] hover:bg-[var(--wiring-glass-hover)] hover:text-[var(--wiring-text-primary)]"
            }`}
          >
            <Settings className="w-5 h-5" />
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={8}>
            설정
          </TooltipContent>
        </Tooltip>

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
