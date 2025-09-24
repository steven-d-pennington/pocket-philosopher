import Link from "next/link";
import path from "node:path";
import { readdir } from "node:fs/promises";

import { ArrowRight } from "lucide-react";

const DOCS_ROOT = path.join(process.cwd(), "docs", "build-plan");

async function getDocuments() {
  const entries = await readdir(DOCS_ROOT, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => ({
      slug: entry.name.replace(/\.md$/, ""),
      title: entry.name.replace(/-/g, " ").replace(/\.md$/, ""),
    }))
    .sort((a, b) => a.title.localeCompare(b.title));
}

export default async function BuildPlanIndexPage() {
  const docs = await getDocuments();

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-6 py-12">
      <header className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-[0.32em] text-muted-foreground">
          Build Plan Library
        </p>
        <h1 className="text-balance text-4xl font-semibold tracking-tight">
          Pocket Philosopher project playbooks
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
          The source of truth for each workstream. Browse the documents below or jump straight
          from the dashboard launchpad.
        </p>
      </header>
      <div className="grid gap-4">
        {docs.map((doc) => (
          <Link
            key={doc.slug}
            href={`/docs/build-plan/${doc.slug}`}
            className="group flex items-center justify-between rounded-2xl border border-border bg-card px-5 py-4 transition hover:border-primary/70 hover:shadow-lg"
          >
            <span className="flex flex-col">
              <span className="text-base font-semibold capitalize">{doc.title}</span>
              <span className="text-xs text-muted-foreground">docs/build-plan/{doc.slug}.md</span>
            </span>
            <ArrowRight className="size-5 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
          </Link>
        ))}
      </div>
    </main>
  );
}
