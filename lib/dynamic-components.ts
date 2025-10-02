/**
 * Lazy-loaded component exports for code splitting
 *
 * These components are dynamically imported to reduce initial bundle size.
 * Use these instead of direct imports for heavy or conditionally rendered components.
 */

import dynamic from "next/dynamic";

// Coach/AI Components (heavy due to streaming logic)
export const CoachConversation = dynamic(
  () => import("@/components/marcus/coach-conversation").then((mod) => ({ default: mod.CoachConversation })),
  {
    loading: () => (
      <div className="flex items-center justify-center py-12">
        <div className="animate-pulse text-muted-foreground">Loading coach...</div>
      </div>
    ),
    ssr: false, // Disable SSR for interactive streaming components
  },
);

// Chart Components (heavy due to chart libraries)
export const ReturnScoreTiles = dynamic(
  () => import("@/components/dashboard/return-score-tiles").then((mod) => ({ default: mod.ReturnScoreTiles })),
  {
    loading: () => (
      <div className="philosophy-card animate-pulse">
        <div className="h-24 bg-muted/20 rounded"></div>
      </div>
    ),
  },
);

// Rich Editor Components
export const ReflectionComposer = dynamic(
  () => import("@/components/reflections/reflection-composer").then((mod) => ({ default: mod.ReflectionComposer })),
  {
    loading: () => (
      <div className="philosophy-card animate-pulse">
        <div className="h-64 bg-muted/20 rounded"></div>
      </div>
    ),
  },
);

// Admin Components (rarely accessed)
export const AdminLayout = dynamic(
  () => import("@/components/admin/admin-layout").then((mod) => ({ default: mod.AdminLayout })),
  {
    ssr: false,
  },
);

// Modal Components (only loaded when needed)
export const BottomSheet = dynamic(
  () => import("@/components/ui/bottom-sheet").then((mod) => ({ default: mod.BottomSheet })),
  {
    ssr: false,
  },
);
