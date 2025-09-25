import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server-client";

interface AuthLayoutProps {
  children: ReactNode;
}

export default async function AuthLayout({ children }: AuthLayoutProps) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/today");
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-background via-background to-primary/10">
      <div
        className="bg-grid-white/[0.04] dark:bg-grid-zinc-600/[0.06] absolute inset-0"
        aria-hidden
      />
      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col items-center justify-center px-6 py-20">
        <div className="grid w-full gap-10 rounded-3xl border border-border/60 bg-background/95 p-10 shadow-xl backdrop-blur">
          {children}
        </div>
      </div>
    </div>
  );
}
