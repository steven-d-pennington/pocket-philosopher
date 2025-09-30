import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { AppSidebar } from "@/components/shared/app-sidebar";
import { ConnectivityBannerWrapper } from "@/components/shared/connectivity-banner-wrapper";
import { TopBar } from "@/components/shared/top-bar";
import { PracticeModals } from "@/components/practices/practice-modals";
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
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen">
        <AppSidebar userEmail={user.email} />
        <div className="flex min-h-screen flex-1 flex-col">
          <TopBar userEmail={user.email} />
          <main className="flex-1 bg-muted/20 px-4 py-6 md:px-8">{children}</main>
          <PracticeModals />
        </div>
      </div>
      <ConnectivityBannerWrapper />
    </div>
  );
}
