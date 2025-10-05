import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { AppSidebar } from "@/components/shared/app-sidebar";
import { ConnectivityBannerWrapper } from "@/components/shared/connectivity-banner-wrapper";
import { MobileDrawer } from "@/components/shared/mobile-drawer";
import { TopBar } from "@/components/shared/top-bar";
import { PracticeModals } from "@/components/practices/practice-modals";
import { PersonaThemeWrapper } from "@/components/shared/persona-theme-wrapper";
import { CommunityStateProvider } from "@/components/providers/community-state-provider";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <PersonaThemeWrapper>
      <CommunityStateProvider />
      <div className="min-h-screen bg-background text-foreground parchment-texture max-w-screen overflow-x-hidden">
        <div className="flex min-h-screen max-w-full">
          <AppSidebar userEmail={user.email} />
          <MobileDrawer />
          <div className="flex min-h-screen flex-1 flex-col min-w-0">
            <TopBar userEmail={user.email} />
            <main className="flex-1 bg-gradient-philosophy px-4 py-6 md:px-8 md:py-8 max-w-full">{children}</main>
            <PracticeModals />
          </div>
        </div>
        <ConnectivityBannerWrapper />
      </div>
    </PersonaThemeWrapper>
  );
}
