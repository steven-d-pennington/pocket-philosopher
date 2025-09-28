import type { FullConfig } from "@playwright/test";

import { getSupabaseServiceRoleClient } from "@/lib/supabase/service-role-client";

import { getTestUser } from "./utils/test-users";

const PRACTICE_FIXTURES = [
  {
    name: "Stoic Breathing Reset",
    description: "Pause for four steady breaths to reset attention.",
    virtue: "temperance",
    sort_order: 1,
  },
  {
    name: "Evening Reflection Ledger",
    description: "Close the day by naming a win and a lesson.",
    virtue: "wisdom",
    sort_order: 2,
  },
  {
    name: "Gratitude Capture",
    description: "Write one note of appreciation for someone who helped today.",
    virtue: "justice",
    sort_order: 3,
  },
] as const;

async function findUserIdByEmail(admin: ReturnType<typeof getSupabaseServiceRoleClient>, email: string) {
  let page = 1;
  const perPage = 100;

  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });

    if (error) {
      throw new Error(`Unable to list Supabase users: ${error.message}`);
    }

    const match = data.users.find((candidate) => candidate.email?.toLowerCase() === email.toLowerCase());
    if (match) {
      return match.id;
    }

    if (!data.nextPage) {
      return null;
    }

    page = data.nextPage;
  }
}

async function ensureTestUser() {
  const admin = getSupabaseServiceRoleClient();
  const user = getTestUser("primary");

  let userId = await findUserIdByEmail(admin, user.email);

  if (!userId) {
    const { data, error } = await admin.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true,
    });

    if (error || !data.user) {
      throw new Error(`Failed to create test user: ${error?.message ?? "unknown error"}`);
    }

    userId = data.user.id;
  } else {
    const { error: updateError } = await admin.auth.admin.updateUserById(userId, {
      password: user.password,
      email_confirm: true,
    });

    if (updateError) {
      throw new Error(`Failed to update test user credentials: ${updateError.message}`);
    }
  }

  return { admin, userId } as const;
}

async function resetDashboardData(admin: ReturnType<typeof getSupabaseServiceRoleClient>, userId: string) {
  const today = new Date().toISOString().slice(0, 10);

  const deletions = [
    admin.from("marcus_messages").delete().eq("user_id", userId),
    admin.from("marcus_conversations").delete().eq("user_id", userId),
    admin.from("habit_logs").delete().eq("user_id", userId),
    admin.from("habits").delete().eq("user_id", userId),
    admin.from("daily_progress").delete().eq("user_id", userId).neq("date", today),
  ];

  for (const deletion of deletions) {
    const { error } = await deletion;
    if (error) {
      throw new Error(`Failed to reset seeded data: ${error.message}`);
    }
  }

  const { error: profileError } = await admin
    .from("profiles")
    .upsert(
      {
        user_id: userId,
        preferred_persona: "marcus",
        preferred_virtue: "wisdom",
        onboarding_complete: true,
        timezone: "UTC",
      },
      { onConflict: "user_id" },
    );

  if (profileError) {
    throw new Error(`Failed to upsert profile for test user: ${profileError.message}`);
  }

  const { error: habitsError } = await admin
    .from("habits")
    .insert(
      PRACTICE_FIXTURES.map((practice, index) => ({
        user_id: userId,
        name: practice.name,
        description: practice.description,
        virtue: practice.virtue,
        frequency: "daily",
        sort_order: index + 1,
      })),
    );

  if (habitsError) {
    throw new Error(`Failed to seed practice fixtures: ${habitsError.message}`);
  }

  const { error: progressError } = await admin
    .from("daily_progress")
    .upsert(
      {
        user_id: userId,
        date: today,
        morning_intention: "Practice deliberate calm and focus.",
        return_score: 72,
        streak_days: 4,
        wisdom_score: 75,
        justice_score: 68,
        temperance_score: 70,
        courage_score: 71,
      },
      { onConflict: "user_id,date" },
    );

  if (progressError) {
    throw new Error(`Failed to seed daily progress: ${progressError.message}`);
  }
}

export default async function globalSetup(_: FullConfig) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is required for Playwright tests. Start Supabase locally and export the service role key before running the suite.",
    );
  }

  const { admin, userId } = await ensureTestUser();
  await resetDashboardData(admin, userId);
}
