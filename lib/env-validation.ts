import { z } from "zod";

type EnvInput = Record<string, string | undefined>;

const toOptional = (value?: string | null) => {
  if (!value) return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  NEXT_PUBLIC_SUPABASE_URL: z
    .string({ required_error: "NEXT_PUBLIC_SUPABASE_URL is required" })
    .url({ message: "NEXT_PUBLIC_SUPABASE_URL must be a valid URL" }),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string({ required_error: "NEXT_PUBLIC_SUPABASE_ANON_KEY is required" })
    .min(1, "NEXT_PUBLIC_SUPABASE_ANON_KEY cannot be empty"),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  TOGETHER_API_KEY: z.string().optional(),
  OLLAMA_URL: z.string().url().optional(),
  POSTHOG_API_KEY: z.string().optional(),
  NEXT_PUBLIC_POSTHOG_HOST: z.string().url().optional(),
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().email().optional(),
  PWA_DEV: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => value === "true"),
  CUSTOM_KEY: z.string().optional(),
});

const envInput: EnvInput = {
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: toOptional(process.env.SUPABASE_SERVICE_ROLE_KEY),
  OPENAI_API_KEY: toOptional(process.env.OPENAI_API_KEY),
  ANTHROPIC_API_KEY: toOptional(process.env.ANTHROPIC_API_KEY),
  TOGETHER_API_KEY: toOptional(process.env.TOGETHER_API_KEY),
  OLLAMA_URL: toOptional(process.env.OLLAMA_URL),
  POSTHOG_API_KEY: toOptional(process.env.POSTHOG_API_KEY),
  NEXT_PUBLIC_POSTHOG_HOST: toOptional(process.env.NEXT_PUBLIC_POSTHOG_HOST),
  RESEND_API_KEY: toOptional(process.env.RESEND_API_KEY),
  EMAIL_FROM: toOptional(process.env.EMAIL_FROM),
  PWA_DEV: toOptional(process.env.PWA_DEV),
  CUSTOM_KEY: toOptional(process.env.CUSTOM_KEY),
};

const parsed = envSchema.safeParse(envInput);

if (!parsed.success) {
  const formatted = parsed.error.flatten((issue) => issue.message);
  const errorMessage = Object.entries(formatted.fieldErrors)
    .map(([key, value]) => `${key}: ${value?.join(", ") ?? "Invalid"}`)
    .join("\n");

  throw new Error(`Invalid environment variables:\n${errorMessage}`);
}

export const env = parsed.data;

export const clientEnv = {
  NEXT_PUBLIC_SUPABASE_URL: env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_POSTHOG_HOST: env.NEXT_PUBLIC_POSTHOG_HOST,
  PWA_DEV: env.PWA_DEV,
  CUSTOM_KEY: env.CUSTOM_KEY,
};
