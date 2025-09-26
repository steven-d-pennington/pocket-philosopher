import Link from "next/link";

import { AuthForm } from "@/components/auth/auth-form";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({
  title: "Log In",
  description:
    "Sign in to access the Pocket Philosopher dashboard, practices, reflections, analytics, and AI coaches.",
  path: "/login",
});

export default function LoginPage() {
  return (
    <div className="grid gap-10 md:grid-cols-[1.2fr_1fr]">
      <section className="space-y-6">
        <div className="space-y-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
            Pocket Philosopher
          </span>
          <h1 className="text-balance text-4xl font-semibold leading-tight tracking-tight">
            The daily practice hub for grounded courage and calm clarity.
          </h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            Log in to access the rebuilt dashboard, AI coaches, analytics, and practice rituals. This
            environment evolves alongside the build plan—expect frequent updates.
          </p>
        </div>
        <ul className="grid gap-3 text-sm text-muted-foreground">
          <li className="flex gap-2">
            <span className="mt-1 inline-flex size-2 rounded-full bg-primary" aria-hidden />
            Daily loops for intentions, practices, reflections, and Return Score insight.
          </li>
          <li className="flex gap-2">
            <span className="mt-1 inline-flex size-2 rounded-full bg-primary" aria-hidden />
            Persona-based coaching with retrieval-ready context and streaming responses.
          </li>
          <li className="flex gap-2">
            <span className="mt-1 inline-flex size-2 rounded-full bg-primary" aria-hidden />
            Virtue analytics, practice heatmaps, and upcoming philosophy themes.
          </li>
        </ul>
      </section>
      <section className="rounded-2xl border border-border bg-card/80 p-8 shadow-sm backdrop-blur">
        <AuthForm mode="login" />
        <p className="mt-6 text-center text-sm text-muted-foreground">
          New here?{" "}
          <Link
            href="/signup"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Create an account
          </Link>
        </p>
      </section>
    </div>
  );
}


