"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  BookHeart,
  Pen,
  MessageCircle,
  User,
  Settings,
  X,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useSwipe } from "@/lib/hooks/use-swipe";
import { selectUIActions, useUIStore } from "@/lib/stores/ui-store";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { href: "/today", label: "Today", icon: Home },
  { href: "/practices", label: "Practices", icon: BookHeart },
  { href: "/reflections", label: "Reflections", icon: Pen },
  { href: "/marcus", label: "Coach", icon: MessageCircle },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function MobileDrawer() {
  const pathname = usePathname();
  const sidebarCollapsed = useUIStore((state) => state.sidebarCollapsed);
  const actions = useUIStore(selectUIActions);
  const drawerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const isOpen = !sidebarCollapsed;

  // Close drawer when route changes
  useEffect(() => {
    if (isOpen) {
      actions.toggleSidebar();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        actions.toggleSidebar();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, actions]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Swipe to close
  const swipeHandlers = useSwipe({
    onSwipedLeft: () => {
      if (isOpen) {
        actions.toggleSidebar();
      }
    },
    delta: 50,
    preventScrollOnSwipe: true,
  });

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        ref={overlayRef}
        className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
        onClick={() => actions.toggleSidebar()}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        ref={drawerRef}
        {...swipeHandlers}
        className={cn(
          "fixed bottom-0 left-0 top-0 z-50 w-72 md:hidden",
          "flex flex-col bg-card shadow-2xl",
          "transform transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
        role="dialog"
        aria-label="Mobile navigation"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 px-4 py-4">
          <div className="flex items-center gap-2">
            <Sparkles className="size-6 text-primary" aria-hidden />
            <h2 className="font-display text-lg font-semibold">Pocket Philosopher</h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => actions.toggleSidebar()}
            className="size-10 touch-manipulation no-tap-highlight"
            aria-label="Close navigation"
          >
            <X className="size-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium transition-all touch-manipulation",
                      "hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                      isActive
                        ? "bg-primary/10 text-primary shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <Icon className="size-5 shrink-0" aria-hidden />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="border-t border-border/60 p-4">
          <div className="rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 p-4">
            <p className="text-2xs uppercase tracking-[0.28em] text-muted-foreground mb-2">
              Philosophy in Practice
            </p>
            <p className="text-xs text-foreground/80">
              Blend Stoic, Taoist, and Existentialist wisdom into your daily life.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
