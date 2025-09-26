import Link from "next/link";
import { notFound } from "next/navigation";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { buildMetadata } from "@/lib/metadata";

const DOCS_ROOT = path.join(process.cwd(), "docs", "build-plan");

function normaliseSlug(param?: string[]): string[] {
  if (!param || param.length === 0) {
    return ["README"];
  }
  return param;
}

function toTitle(slug: string[]) {
  return slug[slug.length - 1].replace(/-/g, " ");
}

async function resolveFilePath(slug: string[]) {
  const relative = slug.join("/");
  const candidate = relative.endsWith(".md") ? relative : `${relative}.md`;
  const fullPath = path.join(DOCS_ROOT, candidate);
  const normalised = path.normalize(fullPath);

  if (!normalised.startsWith(DOCS_ROOT)) {
    throw new Error("Invalid document path");
  }

  const fileStat = await stat(normalised).catch(() => null);

  if (!fileStat || !fileStat.isFile()) {
    return null;
  }

  return normalised;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{
    slug?: string[];
  }>;
}) {
  const resolvedParams = await params;
  const slug = normaliseSlug(resolvedParams.slug);
  const title = toTitle(slug);
  const pathSegment = slug.join("/");

  return buildMetadata({
    title,
    description: `Pocket Philosopher build plan entry for ${title}.`,
    path: `/docs/build-plan/${pathSegment}`,
  });
}

export default async function BuildPlanDocPage({
  params,
}: {
  params: Promise<{
    slug?: string[];
  }>;
}) {
  const resolvedParams = await params;
  const slug = normaliseSlug(resolvedParams.slug);
  const filePath = await resolveFilePath(slug);

  if (!filePath) {
    notFound();
  }

  const raw = await readFile(filePath, "utf8");
  const title = toTitle(slug);

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-6 py-12">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.32em] text-muted-foreground">Build Plan</p>
          <h1 className="text-balance text-3xl font-semibold capitalize sm:text-4xl">{title}</h1>
        </div>
        <Link
          href="/docs/build-plan"
          className="text-sm font-medium text-primary underline-offset-4 transition hover:underline"
        >
          Back to index
        </Link>
      </div>
      <article className="prose prose-neutral max-w-none dark:prose-invert">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{raw}</ReactMarkdown>
      </article>
    </main>
  );
}


