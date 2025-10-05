/**
 * Community Features - Feed Scoring & Ranking Algorithm
 * Created: 2025-10-04
 */

import type {
  CommunityPost,
  CommunityPostWithReaction,
  PostScore,
  UserContext,
} from './types';
import { createRequestLogger } from '@/lib/logging/logger';

const logger = createRequestLogger({ route: 'community/scoring' });

// ============================================================================
// Scoring Weights
// ============================================================================

const WEIGHTS = {
  VIRTUE_MATCH: 0.50, // 50% weight for matching virtue
  PERSONA_MATCH: 0.30, // 30% weight for matching persona
  FRESHNESS: 0.20, // 20% weight for recency
};

const FRESHNESS_DECAY_DAYS = 7; // Posts decay to 0 freshness score over 7 days

// ============================================================================
// Calculate Post Score
// ============================================================================

export function calculatePostScore(
  post: CommunityPost,
  userContext: UserContext
): PostScore {
  let score = 0;
  const breakdown = {
    virtue_match: 0,
    persona_match: 0,
    freshness: 0,
  };

  // Virtue matching (50% weight)
  if (post.virtue && userContext.preferred_virtue) {
    if (post.virtue === userContext.preferred_virtue) {
      breakdown.virtue_match = WEIGHTS.VIRTUE_MATCH * 100;
      score += breakdown.virtue_match;
    }
  } else if (post.virtue && userContext.recent_virtues) {
    // Partial match if in recent virtues
    if (userContext.recent_virtues.includes(post.virtue)) {
      breakdown.virtue_match = WEIGHTS.VIRTUE_MATCH * 50; // Half weight
      score += breakdown.virtue_match;
    }
  }

  // Persona matching (30% weight)
  if (post.persona_id && userContext.preferred_persona) {
    if (post.persona_id === userContext.preferred_persona) {
      breakdown.persona_match = WEIGHTS.PERSONA_MATCH * 100;
      score += breakdown.persona_match;
    }
  } else if (post.persona_id && userContext.recent_personas) {
    // Partial match if in recent personas
    if (userContext.recent_personas.includes(post.persona_id)) {
      breakdown.persona_match = WEIGHTS.PERSONA_MATCH * 50; // Half weight
      score += breakdown.persona_match;
    }
  }

  // Freshness (20% weight, decays over time)
  const ageHours = getAgeInHours(post.created_at);
  const maxAgeHours = FRESHNESS_DECAY_DAYS * 24;
  const freshnessRatio = Math.max(0, 1 - ageHours / maxAgeHours);
  breakdown.freshness = WEIGHTS.FRESHNESS * 100 * freshnessRatio;
  score += breakdown.freshness;

  return {
    post_id: post.id,
    score,
    breakdown,
  };
}

// ============================================================================
// Sort Posts by Score
// ============================================================================

export function sortFeedPosts(
  posts: CommunityPost[],
  userContext: UserContext
): CommunityPost[] {
  const scored = posts.map((post) => ({
    post,
    score: calculatePostScore(post, userContext),
  }));

  return scored
    .sort((a, b) => b.score.score - a.score.score)
    .map(({ post }) => post);
}

// ============================================================================
// Get Widget Posts (Top N with diversity)
// ============================================================================

export function getWidgetPosts(
  posts: CommunityPost[],
  userContext: UserContext,
  count: number = 5
): CommunityPost[] {
  // Sort by score
  const sorted = sortFeedPosts(posts, userContext);

  // Take top posts but ensure diversity of content types
  const selected: CommunityPost[] = [];
  const typesSeen = new Set<string>();

  for (const post of sorted) {
    // Add post if we haven't reached count
    if (selected.length < count) {
      selected.push(post);
      typesSeen.add(post.content_type);
    }
    
    // If we have count but low diversity, try to add different types
    else if (typesSeen.size < 3 && !typesSeen.has(post.content_type)) {
      // Replace lowest scored post with different type
      selected.pop();
      selected.push(post);
      typesSeen.add(post.content_type);
    }
    
    if (selected.length >= count && typesSeen.size >= 3) {
      break;
    }
  }

  return selected;
}

// ============================================================================
// Filter Posts by Criteria
// ============================================================================

export function filterByVirtue(
  posts: CommunityPost[],
  virtue: string
): CommunityPost[] {
  return posts.filter((post) => post.virtue === virtue);
}

export function filterByPersona(
  posts: CommunityPost[],
  personaId: string
): CommunityPost[] {
  return posts.filter((post) => post.persona_id === personaId);
}

export function filterByContentType(
  posts: CommunityPost[],
  contentType: string
): CommunityPost[] {
  return posts.filter((post) => post.content_type === contentType);
}

export function filterByDateRange(
  posts: CommunityPost[],
  startDate?: string,
  endDate?: string
): CommunityPost[] {
  return posts.filter((post) => {
    const postDate = new Date(post.created_at);
    
    if (startDate) {
      const start = new Date(startDate);
      if (postDate < start) return false;
    }
    
    if (endDate) {
      const end = new Date(endDate);
      if (postDate > end) return false;
    }
    
    return true;
  });
}

// ============================================================================
// Apply All Filters
// ============================================================================

export function applyFilters(
  posts: CommunityPost[],
  filters: {
    virtue?: string;
    persona?: string;
    content_type?: string;
    date_from?: string;
    date_to?: string;
  }
): CommunityPost[] {
  let filtered = posts;

  if (filters.virtue) {
    filtered = filterByVirtue(filtered, filters.virtue);
  }

  if (filters.persona) {
    filtered = filterByPersona(filtered, filters.persona);
  }

  if (filters.content_type) {
    filtered = filterByContentType(filtered, filters.content_type);
  }

  if (filters.date_from || filters.date_to) {
    filtered = filterByDateRange(filtered, filters.date_from, filters.date_to);
  }

  return filtered;
}

// ============================================================================
// Helper Functions
// ============================================================================

function getAgeInHours(dateString: string): number {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  return diffMs / (1000 * 60 * 60);
}

// ============================================================================
// Get User Context from Profile
// ============================================================================

export async function getUserContext(userId: string): Promise<UserContext> {
  const { createSupabaseServerClient } = await import('@/lib/supabase/server-client');
  const supabase = await createSupabaseServerClient();

  try {
    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('virtue_focus, persona_roster')
      .eq('id', userId)
      .single();

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: recentReflections } = await supabase
      .from('reflections')
      .select('virtue_focus')
      .eq('user_id', userId)
      .gte('created_at', sevenDaysAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(10);

    const { data: recentConversations } = await supabase
      .from('marcus_conversations')
      .select('persona_id')
      .eq('user_id', userId)
      .gte('created_at', sevenDaysAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(10);

    // Extract recent virtues and personas
    const recent_virtues = (recentReflections
      ?.map((r) => r.virtue_focus)
      .filter(Boolean) as string[]) || [];

    const recent_personas = (recentConversations
      ?.map((c: any) => c.persona_id)
      .filter(Boolean) as string[]) || [];

    return {
      user_id: userId,
      preferred_virtue: (profile as any)?.virtue_focus?.[0],
      preferred_persona: (profile as any)?.persona_roster?.[0],
      recent_virtues,
      recent_personas,
    };
  } catch (error) {
    console.error('Error getting user context', { userId, error });
    return {
      user_id: userId,
    };
  }
}

// ============================================================================
// A/B Testing Support (for future use)
// ============================================================================

export interface ScoringVariant {
  id: string;
  weights: {
    virtue_match: number;
    persona_match: number;
    freshness: number;
  };
}

export function calculatePostScoreWithVariant(
  post: CommunityPost,
  userContext: UserContext,
  variant: ScoringVariant
): PostScore {
  // Similar to calculatePostScore but uses custom weights
  // Implementation would be same pattern with different WEIGHTS object
  // For now, just use default
  return calculatePostScore(post, userContext);
}
