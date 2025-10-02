# Persona System - Developer Integration Guide

## 🚀 Quick Start

### 1. Display Daily Insight
The easiest enhancement - add to any dashboard page:

```tsx
import { DailyInsight } from "@/components/dashboard/daily-insight";

export function MyDashboardPage() {
  return (
    <div>
      <DailyInsight /> {/* That's it! */}
    </div>
  );
}
```

**Features you get**:
- Automatically uses active persona from Zustand
- Shows daily insight with category badge
- Displays timeframe indicator
- Responsive design
- Updates daily

---

### 2. Get Quote for Display
Show persona-specific quotes anywhere:

```tsx
import { getDailyQuote } from "@/lib/constants/persona-quotes";
import { useCoachStore } from "@/lib/stores/coach-store";

export function QuoteCard() {
  const activePersonaId = useCoachStore((state) => state.activePersonaId);
  const quote = getDailyQuote(activePersonaId);
  
  return (
    <div>
      <p>{quote.text}</p>
      <cite>— {quote.author}</cite>
      <span>{quote.theme}</span>
    </div>
  );
}
```

---

### 3. Filter Practices by Category
Organize practices with visual categories:

```tsx
import { getCategoriesForPersona, getCategoryById } from "@/lib/constants/practice-categories";
import { useCoachStore } from "@/lib/stores/coach-store";

export function CategorizedPractices() {
  const activePersonaId = useCoachStore((state) => state.activePersonaId);
  const categoryIds = getCategoriesForPersona(activePersonaId);
  
  return (
    <div>
      {categoryIds.map(id => {
        const category = getCategoryById(id);
        return (
          <div key={id}>
            <h3>{category.icon} {category.name}</h3>
            <p>{category.description}</p>
            {/* Render practices for this category */}
          </div>
        );
      })}
    </div>
  );
}
```

---

### 4. Use Greeting in Coach
Personalize the coach conversation start:

```tsx
import { getDailyGreeting } from "@/lib/constants/persona-greetings";
import { useCoachStore } from "@/lib/stores/coach-store";

export function CoachWelcome() {
  const activePersonaId = useCoachStore((state) => state.activePersonaId);
  const greeting = getDailyGreeting(activePersonaId);
  
  return (
    <div>
      <h2>{greeting.opening}</h2>
      <p>{greeting.context}</p>
      <p><em>{greeting.invitation}</em></p>
    </div>
  );
}
```

---

## 📚 API Reference

### Quote Functions

```typescript
import { 
  getDailyQuote, 
  getQuotesForPersona 
} from "@/lib/constants/persona-quotes";

// Get today's quote (consistent all day)
const quote = getDailyQuote("marcus");
// Returns: { text, author, tradition, theme }

// Get all quotes for a persona
const allQuotes = getQuotesForPersona("lao");
// Returns: Quote[] (20 quotes)

// Get quote for specific date
const quote = getDailyQuote("simone", new Date("2025-01-01"));
```

---

### Insight Functions

```typescript
import { 
  getDailyInsight,
  getInsightsByCategory,
  getInsightsByTimeframe,
  getInsightsForPersona
} from "@/lib/constants/persona-insights";

// Get today's insight
const insight = getDailyInsight("epictetus");
// Returns: { title, content, category, timeframe? }

// Get all insights for persona
const allInsights = getInsightsForPersona("marcus");
// Returns: PersonaInsight[] (12 insights)

// Filter by category
const mindsetInsights = getInsightsByCategory("lao", "mindset");
// Categories: mindset | practice | wisdom | reflection | action

// Filter by timeframe
const morningInsights = getInsightsByTimeframe("simone", "morning");
// Timeframes: morning | evening | anytime
```

---

### Category Functions

```typescript
import { 
  getCategoryById,
  getCategoriesForPersona,
  practiceCategories
} from "@/lib/constants/practice-categories";

// Get single category
const category = getCategoryById("virtue");
// Returns: { id, name, description, icon, color }

// Get categories for persona (ordered by emphasis)
const relevantCategories = getCategoriesForPersona("marcus");
// Returns: string[] (category IDs)

// Get all categories
const allCategories = practiceCategories;
// Returns: PracticeCategory[] (8 categories)
```

---

### Greeting Functions

```typescript
import { 
  getGreeting,
  getDailyGreeting,
  getGreetingsForPersona
} from "@/lib/constants/persona-greetings";

// Get greeting based on conversation count
const greeting = getGreeting("epictetus", 5); // 6th conversation
// Returns: { opening, context, invitation }

// Get today's greeting (consistent all day)
const dailyGreeting = getDailyGreeting("lao");

// Get all greetings for persona
const allGreetings = getGreetingsForPersona("simone");
// Returns: PersonaGreeting[] (5 greetings)
```

---

## 🎨 TypeScript Types

### Quote
```typescript
interface Quote {
  text: string;
  author: string;
  tradition: string;
  theme?: string; // Optional theme tag
}
```

### PersonaInsight
```typescript
interface PersonaInsight {
  title: string;
  content: string;
  category: "mindset" | "practice" | "wisdom" | "reflection" | "action";
  timeframe?: "morning" | "evening" | "anytime";
}
```

### PracticeCategory
```typescript
interface PracticeCategory {
  id: string;
  name: string;
  description: string;
  icon: string; // emoji
  color: string; // Tailwind classes
}
```

### PersonaGreeting
```typescript
interface PersonaGreeting {
  opening: string;
  context: string;
  invitation: string;
}
```

---

## 🎯 Common Patterns

### Pattern 1: Morning Dashboard Card
Show morning-specific content:

```tsx
import { getDailyInsight } from "@/lib/constants/persona-insights";
import { useCoachStore } from "@/lib/stores/coach-store";

export function MorningCard() {
  const personaId = useCoachStore((state) => state.activePersonaId);
  const insight = getDailyInsight(personaId);
  
  // Only show if it's a morning insight
  if (insight.timeframe !== "morning") {
    return null;
  }
  
  return (
    <div className="morning-card">
      <h3>☀️ Morning Wisdom</h3>
      <h4>{insight.title}</h4>
      <p>{insight.content}</p>
    </div>
  );
}
```

---

### Pattern 2: Category Browser
Let users explore practices by category:

```tsx
import { getCategoriesForPersona, getCategoryById } from "@/lib/constants/practice-categories";
import { useCoachStore } from "@/lib/stores/coach-store";
import { useState } from "react";

export function CategoryBrowser() {
  const personaId = useCoachStore((state) => state.activePersonaId);
  const categoryIds = getCategoriesForPersona(personaId);
  const [selected, setSelected] = useState(categoryIds[0]);
  
  const selectedCategory = getCategoryById(selected);
  
  return (
    <div>
      {/* Category tabs */}
      <div className="flex gap-2">
        {categoryIds.map(id => {
          const cat = getCategoryById(id);
          return (
            <button
              key={id}
              onClick={() => setSelected(id)}
              className={selected === id ? "active" : ""}
            >
              {cat.icon} {cat.name}
            </button>
          );
        })}
      </div>
      
      {/* Selected category content */}
      <div>
        <h3>{selectedCategory.icon} {selectedCategory.name}</h3>
        <p>{selectedCategory.description}</p>
        {/* Show practices for this category */}
      </div>
    </div>
  );
}
```

---

### Pattern 3: Quote Rotation Widget
Show rotating quotes with themes:

```tsx
import { getQuotesForPersona } from "@/lib/constants/persona-quotes";
import { useCoachStore } from "@/lib/stores/coach-store";
import { useState, useEffect } from "react";

export function QuoteRotator() {
  const personaId = useCoachStore((state) => state.activePersonaId);
  const quotes = getQuotesForPersona(personaId);
  const [index, setIndex] = useState(0);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setIndex(i => (i + 1) % quotes.length);
    }, 10000); // Rotate every 10 seconds
    
    return () => clearInterval(timer);
  }, [quotes.length]);
  
  const quote = quotes[index];
  
  return (
    <div>
      <blockquote>{quote.text}</blockquote>
      <cite>— {quote.author}</cite>
      {quote.theme && (
        <span className="theme-badge">{quote.theme}</span>
      )}
    </div>
  );
}
```

---

### Pattern 4: Coach System Message with Greeting
Integrate greeting into AI coach:

```typescript
import { getDailyGreeting } from "@/lib/constants/persona-greetings";

function buildCoachSystemMessage(personaId: string, userName: string) {
  const greeting = getDailyGreeting(personaId);
  
  return {
    role: "system",
    content: `
You are a philosophical coach. Begin the conversation with this greeting:

${greeting.opening}

${greeting.context}

${greeting.invitation}

Now respond to the user (${userName}) with warmth and philosophical insight.
    `.trim()
  };
}
```

---

## 🎨 Styling Tips

### Category Badge Component
Reusable badge for categories:

```tsx
import { getCategoryById } from "@/lib/constants/practice-categories";

export function CategoryBadge({ categoryId }: { categoryId: string }) {
  const category = getCategoryById(categoryId);
  if (!category) return null;
  
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${category.color}`}>
      <span>{category.icon}</span>
      <span>{category.name}</span>
    </span>
  );
}
```

Usage:
```tsx
<CategoryBadge categoryId="virtue" />
<CategoryBadge categoryId="mindfulness" />
```

---

### Insight Card Component
Custom insight display:

```tsx
import { getDailyInsight } from "@/lib/constants/persona-insights";
import { Clock } from "lucide-react";

export function InsightCard({ personaId }: { personaId: string }) {
  const insight = getDailyInsight(personaId);
  
  const categoryColors = {
    mindset: "border-blue-500",
    practice: "border-purple-500",
    wisdom: "border-amber-500",
    reflection: "border-green-500",
    action: "border-orange-500",
  };
  
  return (
    <div className={`rounded-lg border-l-4 p-4 ${categoryColors[insight.category]}`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold">{insight.title}</h3>
        {insight.timeframe && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="size-3" />
            {insight.timeframe}
          </span>
        )}
      </div>
      <p className="text-sm text-muted-foreground">{insight.content}</p>
    </div>
  );
}
```

---

## 🔄 Daily Rotation Logic

All daily functions use the same seeding algorithm:

```typescript
// Internal implementation (you don't need to use this)
function getDailyIndex(items: any[], date: Date = new Date()): number {
  const seed = date.getFullYear() * 1000 + date.getMonth() * 50 + date.getDate();
  return seed % items.length;
}
```

**Result**: 
- Same content throughout the day
- Changes at midnight
- Deterministic (same date = same content)
- Works across all functions (quotes, insights, greetings)

---

## 🧪 Testing

### Test Daily Rotation
```typescript
import { getDailyQuote } from "@/lib/constants/persona-quotes";

const today = new Date("2025-10-02");
const tomorrow = new Date("2025-10-03");

const quoteToday = getDailyQuote("marcus", today);
const quoteTomorrow = getDailyQuote("marcus", tomorrow);

console.log(quoteToday.text !== quoteTomorrow.text); // true (different quotes)

const quoteTodayAgain = getDailyQuote("marcus", today);
console.log(quoteToday.text === quoteTodayAgain.text); // true (consistent)
```

### Test Category Emphasis
```typescript
import { getCategoriesForPersona } from "@/lib/constants/practice-categories";

const marcusCategories = getCategoriesForPersona("marcus");
// ["virtue", "reflection", "resilience", "mindfulness", "wisdom"]

const laoziCategories = getCategoriesForPersona("lao");
// ["simplicity", "mindfulness", "wisdom", "action", "connection"]

console.log(marcusCategories[0]); // "virtue" (primary emphasis)
console.log(laoziCategories[0]); // "simplicity" (primary emphasis)
```

---

## 🚨 Common Mistakes

### ❌ Don't: Create new Date() multiple times
```typescript
// BAD - might get different content
const quote1 = getDailyQuote(personaId, new Date());
const quote2 = getDailyQuote(personaId, new Date());
// Could be different if called at midnight!
```

### ✅ Do: Reuse the same date
```typescript
// GOOD - consistent within component
const today = new Date();
const quote = getDailyQuote(personaId, today);
const insight = getDailyInsight(personaId, today);
```

---

### ❌ Don't: Hardcode persona IDs
```typescript
// BAD - not dynamic
const quote = getDailyQuote("marcus");
```

### ✅ Do: Use active persona from store
```typescript
// GOOD - respects user choice
const personaId = useCoachStore((state) => state.activePersonaId);
const quote = getDailyQuote(personaId);
```

---

### ❌ Don't: Ignore TypeScript types
```typescript
// BAD - no type safety
const category = "invalid_category";
const insights = getInsightsByCategory(personaId, category);
```

### ✅ Do: Use proper types
```typescript
// GOOD - type-safe
const category: PersonaInsight["category"] = "mindset";
const insights = getInsightsByCategory(personaId, category);
```

---

## 📦 Bundle Size Impact

All content is tree-shakeable:

```typescript
// Only imports what you use
import { getDailyQuote } from "@/lib/constants/persona-quotes";
// ✅ Only includes quote data

import { getDailyInsight } from "@/lib/constants/persona-insights";
// ✅ Only includes insight data

// Not importing categories? Not in your bundle! 🎉
```

**Total added bundle size**: ~15KB gzipped
- persona-quotes.ts: ~5KB
- persona-insights.ts: ~7KB
- persona-greetings.ts: ~2KB
- practice-categories.ts: ~1KB

---

## 🎉 Quick Wins

### Add Daily Insight to Dashboard
**Time**: 2 minutes
```tsx
import { DailyInsight } from "@/components/dashboard/daily-insight";

// Add anywhere in your dashboard
<DailyInsight />
```

### Show Category Icons in Practice List
**Time**: 5 minutes
```tsx
import { getCategoryById } from "@/lib/constants/practice-categories";

practices.map(practice => {
  const category = getCategoryById(practice.categoryId);
  return (
    <div>
      <span>{category.icon}</span>
      <span>{practice.name}</span>
    </div>
  );
})
```

### Use Greeting in Coach Welcome
**Time**: 10 minutes
```tsx
import { getDailyGreeting } from "@/lib/constants/persona-greetings";

const greeting = getDailyGreeting(personaId);
// Use in system message or welcome UI
```

---

## 📚 Further Reading

- **Full Guide**: `docs/persona-system-enhancement.md`
- **Quick Summary**: `docs/persona-enhancement-summary.md`
- **Visual Showcase**: `docs/persona-enhancement-showcase.md`
- **This File**: Quick integration patterns

---

## 💡 Pro Tips

1. **Cache the date**: Create `const today = new Date()` once per component
2. **Use TypeScript**: Let the types guide you
3. **Tree-shake**: Only import what you need
4. **Consistent UX**: Use the same daily content across pages
5. **Test rotation**: Verify content changes at midnight

---

**Happy coding!** 🚀✨
