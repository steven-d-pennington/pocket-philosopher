# shadcn/ui Component Guide

This guide captures the design tokens, variants, and accessibility patterns used across our shadcn/ui primitives.

## Design Tokens

- **Spacing:** Tailwind spacing scale with emphasis on `gap-3`, `gap-6`, and `px-6` for layout rhythm.
- **Radius:** `rounded-2xl` for cards, `rounded-full` for status pills.
- **Color:** Theme palette derived from Tailwind CSS variables (`bg-card`, `bg-muted`, `text-muted-foreground`).
- **Typography:** Self-hosted Geist variable fonts (`--font-sans`, `--font-mono`) ensure offline parity; apply via `font-sans` /
  `font-mono` utility classes.
- **Focus Ring:** Components use `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`.

## Button Variants

| Variant | Usage | Notes |
| ------- | ----- | ----- |
| `default` | Primary calls to action | Adds subtle shadow and hover opacity. |
| `secondary` | Complementary actions | Uses secondary palette with hover blend. |
| `ghost` | Inline text actions | Transparent background, used for secondary navigation. |
| `outline` | Minimal emphasis | Border with hover accent. |
| `destructive` | Dangerous actions | Red palette aligning with `destructive` tokens. |
| `subtle` | Quiet secondary buttons | Muted background for toolbars. |
| `link` | Inline links | Underline on hover with primary color. |

## Motion & Accessibility

- Motion uses Framer Motion with reduced-motion guards to respect user preferences.
- Feature cards animate with scale and opacity transitions under 250ms.
- Focus states remain visible during motion by applying `transition` classes only to transform/opacity.

## Usage Patterns

- **Cards:** Use `<article className="rounded-2xl border bg-card p-6 shadow-sm">` and apply `motion.article` for interactive states.
- **Lists:** Leverage `grid` layouts with `gap-3` and `rounded-lg` list items for dashboard modules.
- **Providers:** Wrap interactive surfaces in `<ServiceWorkerProvider>` and `<ThemeProvider>` to ensure offline and theme behavior remain consistent.

Update this guide when adding new shadcn/ui components or adjusting token usage to keep designers and engineers aligned.
