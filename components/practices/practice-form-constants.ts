import { z } from "zod";

export const virtueOptions = [
  "Wisdom",
  "Justice",
  "Temperance",
  "Courage",
  "Compassion",
  "Resilience",
];

export const dayOptions = [
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
  { value: 7, label: "Sun" },
];

export const practiceFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().max(500, "Keep it under 500 characters").optional().or(z.literal("")),
  virtue: z.string().min(1, "Choose a virtue"),
  frequency: z.enum(["daily", "weekly", "custom"], {
    required_error: "Frequency is required",
  }),
  difficulty: z.enum(["easy", "medium", "hard"]).optional().or(z.literal("")),
  reminderTime: z.string().optional(),
  tags: z.string().optional(),
  activeDays: z
    .array(z.number().int().min(1).max(7))
    .min(1, "Pick at least one day"),
});

export type PracticeFormValues = z.infer<typeof practiceFormSchema>;

