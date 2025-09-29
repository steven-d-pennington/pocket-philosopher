"use client";

import Link from "next/link";

import { BookOpenCheck, Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ConnectivityIndicator } from "@/components/shared/connectivity-banner";
import { ThemeSwitcher } from "@/components/shared/theme-switcher";
import { selectUIActions, useUIStore } from "@/lib/stores/ui-store";

interface TopBarProps {
  userEmail?: string | null;
}

export function TopBar({ userEmail }: TopBarProps) {
  const actions = useUIStore(selectUIActions);

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-card/70 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-card/50">
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-9 md:hidden"
          onClick={() => actions.toggleSidebar()}
        >
          <Menu className="size-5" aria-hidden />
          <span className="sr-only">Toggle navigation</span>
        </Button>
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Workspace</p>
          <p className="text-sm font-semibold">{userEmail ?? "Signed in"}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <ConnectivityIndicator />
        <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
          <Link href="/docs/build-plan" className="gap-2">
            <BookOpenCheck className="size-4" aria-hidden />
            Build plan
          </Link>
        </Button>
        <ThemeSwitcher />
      </div>
    </header>
  );
}
