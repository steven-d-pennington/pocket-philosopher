# Philosophy Design Component Patterns

## Quick Reference Guide for Using the New Design System

### Color Usage

#### When to Use Each Philosophy Color

**Primary (Blue-Grey)** - Main actions, navigation, emphasis
```tsx
className="text-primary bg-primary border-primary"
```

**Philosophy Gold** - Special emphasis, awards, achievements
```tsx
className="text-philosophy-gold bg-philosophy-gold/10"
```

**Philosophy Olive** - Nature, growth, balance elements
```tsx
className="text-philosophy-olive"
```

**Accent (Ochre)** - Highlights, calls-to-action, important info
```tsx
className="text-accent bg-accent/10"
```

### Typography Patterns

#### Page Titles
```tsx
<h1 className="text-5xl font-display font-bold tracking-tight text-gradient-philosophy">
  Page Title
</h1>
```

#### Section Headers
```tsx
<h2 className="text-3xl font-serif font-semibold">
  Section Header
</h2>
```

#### Eyebrows (Small Labels)
```tsx
<p className="text-2xs uppercase tracking-[0.35em] text-muted-foreground font-medium">
  Label Text
</p>
```

#### Body Text
```tsx
<p className="text-sm leading-relaxed text-muted-foreground">
  Body content
</p>
```

#### Quotes
```tsx
<blockquote className="philosophy-quote text-xl leading-relaxed">
  Philosophical wisdom
</blockquote>
```

### Card Patterns

#### Standard Card
```tsx
<section className="philosophy-card p-6 animate-fade-in-up">
  <header className="space-y-2">
    <p className="text-2xs uppercase tracking-[0.35em] text-muted-foreground font-medium">
      Eyebrow
    </p>
    <h2 className="text-2xl font-serif font-semibold">Card Title</h2>
  </header>
  <div className="mt-5">
    {/* Card content */}
  </div>
</section>
```

#### Card with Header Action
```tsx
<section className="philosophy-card p-6">
  <header className="flex items-center justify-between">
    <div className="space-y-2">
      <p className="text-2xs uppercase tracking-[0.35em] text-muted-foreground font-medium">
        Eyebrow
      </p>
      <h2 className="text-2xl font-serif font-semibold">Card Title</h2>
    </div>
    <Button variant="ghost" size="sm">
      Action
    </Button>
  </header>
  <div className="mt-5">
    {/* Card content */}
  </div>
</section>
```

#### Highlighted Card (for special content)
```tsx
<div className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/10 via-accent/5 to-transparent p-6 shadow-philosophy">
  {/* Special content */}
</div>
```

#### Nested Card/Sub-section
```tsx
<div className="rounded-xl border border-border/40 bg-philosophy-scroll/30 p-4">
  {/* Sub-content */}
</div>
```

### Button Patterns

#### Primary Action
```tsx
<Button className="shadow-philosophy transition-all hover:shadow-philosophy-lg">
  Primary Action
</Button>
```

#### Secondary Action
```tsx
<Button variant="secondary">
  Secondary Action
</Button>
```

#### Outline/Ghost for Navigation
```tsx
<Button variant="outline" className="hover:border-primary/30">
  Navigate
</Button>
```

#### With Icon
```tsx
<Button className="gap-2">
  <Icon className="size-4" />
  Label
</Button>
```

### Input Patterns

#### Text Input
```tsx
<Input
  placeholder="Enter your intention..."
  className="border-philosophy-scroll bg-philosophy-marble/50 focus:border-primary/50"
/>
```

#### With Label
```tsx
<div className="space-y-2">
  <label className="text-sm font-medium">Field Label</label>
  <Input placeholder="Value..." />
</div>
```

### List Patterns

#### Practice/Task List
```tsx
<div className="grid gap-2.5">
  {items.map((item) => (
    <div
      key={item.id}
      className="flex items-center justify-between rounded-xl border border-border/40 px-4 py-3.5 transition-all hover:shadow-philosophy hover:border-primary/30"
    >
      <span className="flex flex-col gap-1">
        <span className="font-semibold">{item.title}</span>
        {item.description && (
          <span className="text-xs text-muted-foreground">{item.description}</span>
        )}
      </span>
      <Icon className="size-5 text-primary" />
    </div>
  ))}
</div>
```

#### Stat/Metric Cards
```tsx
<div className="grid gap-3 sm:grid-cols-2">
  <div className="rounded-xl border border-primary/10 bg-gradient-to-br from-primary/5 to-transparent p-4">
    <p className="text-2xs uppercase tracking-[0.32em] text-muted-foreground font-medium">
      Metric Label
    </p>
    <p className="mt-3 text-4xl font-display font-semibold tracking-tight">
      {value}
    </p>
    <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
      Description
    </p>
  </div>
</div>
```

### Layout Patterns

#### Two-Column Dashboard Layout
```tsx
<div className="grid gap-5 xl:grid-cols-[2fr,1fr]">
  <div className="grid gap-4">
    {/* Main content */}
  </div>
  <div className="grid gap-4">
    {/* Sidebar content */}
  </div>
</div>
```

#### Section Divider
```tsx
<div className="philosophy-divider">
  <span className="philosophy-divider-ornament text-xl">✦</span>
</div>
```

#### Gradient Divider Lines
```tsx
<div className="flex items-center gap-3">
  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
  <span className="text-xs text-muted-foreground">Text</span>
  <div className="h-px flex-1 bg-gradient-to-l from-transparent via-border to-transparent" />
</div>
```

### Icon Usage

#### With Text
```tsx
<div className="flex items-center gap-2">
  <Icon className="size-4 text-primary" />
  <span>Text</span>
</div>
```

#### Decorative (Large)
```tsx
<Icon className="size-8 text-philosophy-gold animate-glow" />
```

#### In Badge/Pill
```tsx
<span className="virtue-badge">
  <Target className="size-3" />
  <span>Wisdom</span>
</span>
```

### Animation Usage

#### Card Entrance
```tsx
<div className="philosophy-card animate-fade-in-up">
  {/* Content fades in from below */}
</div>
```

#### Pulsing Emphasis
```tsx
<span className="animate-glow">
  {/* Subtle pulse effect */}
</span>
```

#### Loading Shimmer
```tsx
<div className="animate-shimmer">
  {/* Shimmer loading effect */}
</div>
```

### Spacing Guidelines

#### Page-Level
```tsx
<div className="space-y-6">
  {/* Comfortable page section spacing */}
</div>
```

#### Within Cards
```tsx
<div className="space-y-3">
  {/* Tight card content spacing */}
</div>
```

#### Grid Gaps
```tsx
<div className="grid gap-4">        {/* Between cards */}
<div className="grid gap-2.5">     {/* List items */}
<div className="grid gap-3">       {/* Sub-sections */}
```

### Color Combinations

#### Success/Positive
```tsx
<div className="bg-philosophy-olive/10 border-philosophy-olive/30 text-philosophy-olive">
  Positive state
</div>
```

#### Emphasis/Important
```tsx
<div className="bg-accent/10 border-accent/30 text-accent">
  Important info
</div>
```

#### Neutral/Info
```tsx
<div className="bg-philosophy-scroll/30 border-border/40 text-foreground">
  Neutral info
</div>
```

#### Premium/Special
```tsx
<div className="bg-gradient-to-br from-philosophy-gold/10 to-primary/5 border-philosophy-gold/20">
  Premium content
</div>
```

### Responsive Patterns

#### Hide on Mobile
```tsx
<div className="hidden md:block">
  {/* Desktop only */}
</div>
```

#### Responsive Grid
```tsx
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
  {/* 1 col mobile, 2 tablet, 3 desktop */}
</div>
```

#### Responsive Text
```tsx
<h1 className="text-4xl sm:text-5xl md:text-6xl">
  {/* Scales with viewport */}
</h1>
```

### Accessibility Patterns

#### Screen Reader Only
```tsx
<span className="sr-only">Descriptive text for screen readers</span>
```

#### Aria Hidden Icons
```tsx
<Icon className="size-4" aria-hidden />
```

#### Semantic Landmarks
```tsx
<section aria-labelledby="section-title">
  <h2 id="section-title">Section Title</h2>
</section>
```

---

## Common Mistakes to Avoid

❌ **Don't mix old styles with new**
```tsx
// Bad
<div className="rounded-3xl bg-card">

// Good
<div className="philosophy-card">
```

❌ **Don't forget animation classes**
```tsx
// Missing entrance animation
<section className="philosophy-card p-6">

// Better
<section className="philosophy-card p-6 animate-fade-in-up">
```

❌ **Don't use default border radius**
```tsx
// Too generic
<div className="rounded-md">

// Philosophy style
<div className="rounded-xl">
```

❌ **Don't skip eyebrow labels**
```tsx
// Missing context
<h2 className="text-2xl font-serif">Title</h2>

// Complete pattern
<div className="space-y-2">
  <p className="text-2xs uppercase tracking-[0.35em] text-muted-foreground font-medium">
    Section
  </p>
  <h2 className="text-2xl font-serif font-semibold">Title</h2>
</div>
```

## Quick Copy-Paste Snippets

### Full Card Template
```tsx
<section className="philosophy-card p-6 animate-fade-in-up">
  <header className="space-y-2">
    <p className="text-2xs uppercase tracking-[0.35em] text-muted-foreground font-medium">
      Eyebrow Label
    </p>
    <h2 className="text-3xl font-serif font-semibold">Card Title</h2>
  </header>
  <div className="mt-5">
    <p className="text-sm text-muted-foreground leading-relaxed">
      Card description or content goes here.
    </p>
  </div>
</section>
```

### Stat Display
```tsx
<div className="rounded-xl border border-primary/10 bg-gradient-to-br from-primary/5 to-transparent p-4 transition-all hover:border-primary/20 hover:shadow-philosophy">
  <p className="text-2xs uppercase tracking-[0.32em] text-muted-foreground font-medium">
    Today
  </p>
  <p className="mt-3 text-4xl font-display font-semibold text-foreground tracking-tight">
    {value}
  </p>
  <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
    Description text
  </p>
</div>
```

### Quote Block
```tsx
<div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-accent/5 to-transparent p-6 shadow-philosophy parchment-texture">
  <div className="flex items-start gap-4">
    <Quote className="size-8 text-philosophy-gold flex-shrink-0 mt-1" />
    <div className="space-y-4 flex-1">
      <p className="philosophy-quote text-xl leading-relaxed pl-3">
        Quote text here
      </p>
      <div className="flex items-center gap-2 text-xs">
        <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
        <p className="uppercase tracking-[0.32em] text-muted-foreground font-medium">
          Author
        </p>
        <span className="text-philosophy-gold">•</span>
        <p className="uppercase tracking-[0.32em] text-muted-foreground font-medium">
          Tradition
        </p>
        <div className="h-px flex-1 bg-gradient-to-l from-border to-transparent" />
      </div>
    </div>
  </div>
</div>
```
