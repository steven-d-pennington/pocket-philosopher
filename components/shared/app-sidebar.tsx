"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";

import type { LucideIcon } from "lucide-react";
import {
  Bot,
  ChevronsLeft,
  ChevronsRight,
  HelpCircle,
  LayoutDashboard,
  ListChecks,
  NotebookPen,
  Settings,
  UserCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { selectSidebarCollapsed, selectUIActions, useUIStore } from "@/lib/stores/ui-store";

const navItems: Array<{ label: string; href: Route; icon: LucideIcon }> = [
  { label: "Today", href: "/today", icon: LayoutDashboard },
  { label: "Practices", href: "/practices", icon: ListChecks },
  { label: "Reflections", href: "/reflections", icon: NotebookPen },
  { label: "Coaches", href: "/marcus", icon: Bot },
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

  const ToggleIcon = collapsed ? ChevronsRight : ChevronsLeft;

  return (
    <aside
      className={cn(
        "hidden min-h-screen border-r border-border bg-card/80 backdrop-blur md:flex md:flex-col",
        collapsed ? "md:w-[92px]" : "md:w-[240px]",
      )}
    >
      <div className="flex items-center justify-between px-5 py-4">
        <Link
          href="/today"
          className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.22em]"
        >
          <span className="inline-flex size-2 rounded-full bg-primary" aria-hidden />
          {!collapsed && <span>Pocket Philosopher</span>}
        </Link>
        <Button variant="ghost" size="icon" className="size-8" onClick={toggleSidebar}>
          <ToggleIcon className="size-4" aria-hidden />
          <span className="sr-only">Toggle sidebar</span>
        </Button>
      </div>
      <nav className="flex-1 space-y-1 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition",
                isActive
                  ? "bg-primary text-primary-foreground shadow"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="size-4" aria-hidden />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>
      <div className="px-5 pb-6 text-xs text-muted-foreground">
        <p className="truncate">{userEmail ?? "workspace"}</p>
        <p className="text-[10px] uppercase tracking-[0.32em]">Build Alpha</p>
      </div>
    </aside>
  );
}




