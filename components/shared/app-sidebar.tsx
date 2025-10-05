"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";

import type { LucideIcon } from "lucide-react";
import {
  Bot,
  ChevronsLeft,
  ChevronsRight,
  Flag,
  HelpCircle,
  LayoutDashboard,
  ListChecks,
  NotebookPen,
  Settings,
  UserCircle,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { selectSidebarCollapsed, selectUIActions, useUIStore } from "@/lib/stores/ui-store";
import { useCommunityStore } from "@/lib/stores/community-store";

const navItems: Array<{ label: string; href: Route; icon: LucideIcon; requiresCommunity?: boolean }> = [
  { label: "Today", href: "/today", icon: LayoutDashboard },
  { label: "Practices", href: "/practices", icon: ListChecks },
  { label: "Reflections", href: "/reflections", icon: NotebookPen },
  { label: "Coaches", href: "/marcus", icon: Bot },
  { label: "Community", href: "/community", icon: Users, requiresCommunity: true },
  { label: "Onboarding", href: "/onboarding", icon: Flag },
  { label: "Profile", href: "/profile", icon: UserCircle },
  { label: "Settings", href: "/settings", icon: Settings },
  { label: "Help", href: "/help", icon: HelpCircle },
];

interface AppSidebarProps {
  userEmail?: string | null;
}

export function AppSidebar({ userEmail }: AppSidebarProps) {
  const pathname = usePathname();
  const collapsed = useUIStore(selectSidebarCollapsed);
  const { toggleSidebar } = useUIStore(selectUIActions);
  const { isEnabled: communityEnabled } = useCommunityStore();

  const ToggleIcon = collapsed ? ChevronsRight : ChevronsLeft;

  // Filter nav items based on community enabled status
  const visibleNavItems = navItems.filter(
    (item) => !item.requiresCommunity || communityEnabled
  );

  return (
    <aside
      className={cn(
        "hidden min-h-screen border-r border-border bg-card/95 backdrop-blur-xl md:flex md:flex-col shadow-philosophy",
        collapsed ? "md:w-[92px]" : "md:w-[260px]",
      )}
    >
      <div className="flex items-center justify-between px-5 py-5 border-b border-border/40">
        <Link
          href="/today"
          className="flex items-center gap-2.5 text-xs font-serif font-semibold uppercase tracking-[0.25em]"
        >
          <span className="inline-flex size-2.5 rounded-full bg-philosophy-gold animate-glow" aria-hidden />
          {!collapsed && <span className="text-gradient-philosophy">Pocket Philosopher</span>}
        </Link>
        <Button variant="ghost" size="icon" className="size-8" onClick={toggleSidebar}>
          <ToggleIcon className="size-4" aria-hidden />
          <span className="sr-only">Toggle sidebar</span>
        </Button>
      </div>
      <nav className="flex-1 space-y-1 px-2 py-4">
        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-primary text-primary-foreground shadow-philosophy"
                  : "text-muted-foreground hover:bg-philosophy-scroll/50 hover:text-foreground hover:border-primary/20",
              )}
            >
              <Icon className="size-4 flex-shrink-0" aria-hidden />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>
      <div className="px-5 pb-6 pt-4 border-t border-border/40">
        <p className="truncate text-xs text-muted-foreground">{userEmail ?? "workspace"}</p>
        <p className="text-2xs uppercase tracking-[0.35em] text-philosophy-gold/60 font-medium mt-1">Build Alpha</p>
      </div>
    </aside>
  );
}




