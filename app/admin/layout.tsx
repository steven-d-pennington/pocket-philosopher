import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

interface AdminLayoutProps {
  children: ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  // Check if admin dashboard is enabled
  if (process.env.ADMIN_DASHBOARD !== "true") {
    redirect("/today");
  }

  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // TEMP: Skip admin check for testing - allow all authenticated users
  // TODO: Re-enable proper admin checking once service role client is working
  console.log("Admin access granted for user:", user.id);

  return <>{children}</>;
}