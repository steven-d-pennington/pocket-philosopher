"use client";

import { useMemo } from "react";

import { Quote } from "lucide-react";

const quotes = [
  {
    text: "Waste no more time arguing about what a good person should be. Be one.",
    author: "Marcus Aurelius",
    tradition: "Stoicism",
  },
  {
    text: "When I let go of what I am, I become what I might be.",
    author: "Laozi",
    tradition: "Taoism",
  },
  {
    text: "One is not born, but rather becomes, a woman.",
    author: "Simone de Beauvoir",
    tradition: "Existentialism",
  },
  {
    text: "First say to yourself what you would be; and then do what you have to do.",
    author: "Epictetus",
    tradition: "Stoicism",
  },
];

export function DailyQuote() {
  const index = useMemo(() => {
    const today = new Date();
    const seed = today.getFullYear() * 1000 + today.getMonth() * 50 + today.getDate();
    return seed % quotes.length;
  }, []);

  const quote = quotes[index];

  return (
    <section className="rounded-3xl border border-border bg-gradient-to-br from-primary/10 via-background to-background p-6 shadow-sm">
      <div className="flex items-start gap-3">
        <Quote className="size-6 text-primary" aria-hidden />
        <div className="space-y-3 text-sm">
          <p className="text-lg font-medium text-foreground">“{quote.text}”</p>
          <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
            {quote.author} • {quote.tradition}
          </p>
        </div>
      </div>
    </section>
  );
}
