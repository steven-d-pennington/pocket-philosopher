import Link from "next/link";

import { AuthForm } from "@/components/auth/auth-form";

export default function SignupPage() {
  return (
    <div className="grid gap-10 md:grid-cols-[1fr_1fr]">
      <section className="rounded-2xl border border-border bg-card/80 p-8 shadow-sm backdrop-blur">
        <AuthForm mode="signup" />
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Sign in instead
          </Link>
        </p>
      </section>
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">What you unlock</h2>
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>
            Signing up provisions a Supabase-backed workspace connected to the Pocket Philosopher
            rebuild. Your credentials stay local; feel free to reset the database as you iterate.
          </p>
          <p>
            We recommend using a throwaway password while the authentication flow is in development.
            Future milestones will wire in email magic links and multi-factor options.
          </p>
        </div>
        <div className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
          <p className="font-semibold text-foreground">Build plan alignment</p>
          <p>
            Completion of this sign-up flow corresponds to Frontend Architecture Phase 2 tasks—once
            live, move on to feature routes, persona switchers, and offline caching.
          </p>
        </div>
      </section>
    </div>
  );
}
