import type { Metadata } from "next";

const APP_NAME = "Pocket Philosopher";
const DEFAULT_DESCRIPTION =
  "A daily practice companion blending Stoic, Taoist, and Existentialist wisdom with practices, reflections, and AI mentors.";
const DEFAULT_BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

type MetadataInput = {
  title: string;
  description?: string;
  path?: string;
  disableSuffix?: boolean;
};

export function buildMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  path,
  disableSuffix = false,
}: MetadataInput): Metadata {
  const resolvedTitle = disableSuffix ? title : `${title} · ${APP_NAME}`;
  const url = path ? new URL(path, DEFAULT_BASE_URL).toString() : undefined;

  return {
    title: resolvedTitle,
    description,
    openGraph: {
      title: resolvedTitle,
      description,
      siteName: APP_NAME,
      url,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: resolvedTitle,
      description,
    },
    alternates: url
      ? {
          canonical: url,
        }
      : undefined,
  };
}

export const siteMetadata = {
  appName: APP_NAME,
  defaultDescription: DEFAULT_DESCRIPTION,
  baseUrl: DEFAULT_BASE_URL,
};

