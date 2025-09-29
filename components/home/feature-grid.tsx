"use client";

import * as React from "react";
import { BookOpenCheck, LineChart, Sparkles } from "lucide-react";
import { LazyMotion, m, domAnimation, useReducedMotion, type Variants } from "framer-motion";

const iconComponents = {
  sparkles: Sparkles,
  book: BookOpenCheck,
  chart: LineChart,
} as const;

type FeatureIcon = keyof typeof iconComponents;

interface Feature {
  title: string;
  description: string;
  icon: FeatureIcon;
}

interface FeatureGridProps {
  features: Feature[];
}

const cardVariants: Variants = {
  initial: { opacity: 0, y: 12 },
  visible: (index: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: index * 0.08,
      duration: 0.28,
      ease: "easeOut",
    },
  }),
};

export function FeatureGrid({ features }: FeatureGridProps) {
  const reduceMotion = useReducedMotion();

  return (
    <LazyMotion features={domAnimation} strict>
      <div className="grid gap-6 md:grid-cols-3">
        {features.map(({ title, description, icon }, index) => {
          const Icon = iconComponents[icon];
          return (
          <m.article
            key={title}
            className="group rounded-2xl border border-border bg-card p-6 shadow-sm transition focus-within:ring-2 focus-within:ring-primary/60 focus-within:ring-offset-2 focus-within:ring-offset-background hover:-translate-y-1 hover:border-primary/60 hover:shadow-lg"
            initial={reduceMotion ? undefined : "initial"}
            whileInView={reduceMotion ? undefined : "visible"}
            viewport={{ once: true, amount: 0.5 }}
            custom={index}
            variants={cardVariants}
          >
            <Icon className="mb-4 size-10 text-primary transition group-hover:scale-105" aria-hidden />
            <h2 className="mb-2 text-lg font-semibold">{title}</h2>
            <p className="text-sm text-muted-foreground">{description}</p>
          </m.article>
          );
        })}
      </div>
    </LazyMotion>
  );
}
