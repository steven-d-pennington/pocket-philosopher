/**
 * Community Features - Content Formatters
 * Created: 2025-10-04
 */

import type {
  FormatReflectionInput,
  FormatChatExcerptInput,
  FormatChatSummaryInput,
  FormatPracticeInput,
  FormattedPost,
  ReflectionMetadata,
  ChatMetadata,
  PracticeMetadata,
} from './types';
import { sanitizeContent } from './validators';

// ============================================================================
// Reflection Formatters
// ============================================================================

export function formatReflectionPost(input: FormatReflectionInput): FormattedPost {
  const { reflection_id, reflection_type, content, virtue_focus, fields_to_share, include_virtue } = input;

  // Build content text from selected fields
  const contentParts: string[] = [];

  for (const field of fields_to_share) {
    if (content[field]) {
      const fieldLabel = formatFieldLabel(field);
      contentParts.push(`${fieldLabel}: ${content[field]}`);
    }
  }

  const content_text = contentParts.join('\n\n');
  const sanitized = sanitizeContent(content_text);

  if (!sanitized.isValid) {
    throw new Error(sanitized.error || 'Invalid content');
  }

  const metadata: ReflectionMetadata = {
    reflection_type,
    fields_shared: fields_to_share,
    include_virtue,
  };

  return {
    content_type: 'reflection',
    content_text: sanitized.sanitized!,
    content_metadata: metadata,
    source_id: reflection_id,
    source_table: 'reflections',
    virtue: include_virtue ? virtue_focus : undefined,
    original_date: new Date().toISOString().split('T')[0],
  };
}

function formatFieldLabel(field: string): string {
  const labels: Record<string, string> = {
    intention: 'Intention',
    challenges: 'Challenges',
    insights: 'Insights',
    wins: 'Wins',
    gratitude: 'Gratitude',
    lessons: 'Lessons Learned',
  };
  return labels[field] || field;
}

// ============================================================================
// Chat Formatters
// ============================================================================

export function formatChatExcerpt(input: FormatChatExcerptInput): FormattedPost {
  const { conversation_id, message_ids, messages, persona_id, persona_name, virtue } = input;

  // Format messages as dialogue
  const dialogueParts = messages.map((msg) => {
    const role = msg.role === 'user' ? 'You' : persona_name;
    return `${role}: ${msg.content}`;
  });

  const content_text = dialogueParts.join('\n\n');
  const sanitized = sanitizeContent(content_text);

  if (!sanitized.isValid) {
    throw new Error(sanitized.error || 'Invalid content');
  }

  const metadata: ChatMetadata = {
    conversation_id,
    share_method: 'excerpt',
    excerpt_messages: message_ids,
    coach_name: persona_name,
  };

  return {
    content_type: 'chat',
    content_text: sanitized.sanitized!,
    content_metadata: metadata,
    source_id: conversation_id,
    source_table: 'marcus_conversations',
    virtue,
    persona_id,
    share_method: 'excerpt',
    original_date: new Date().toISOString().split('T')[0],
  };
}

export function formatChatSummary(input: FormatChatSummaryInput): FormattedPost {
  const { conversation_id, summary, persona_id, persona_name, virtue, original_message_count } = input;

  const sanitized = sanitizeContent(summary);

  if (!sanitized.isValid) {
    throw new Error(sanitized.error || 'Invalid content');
  }

  const metadata: ChatMetadata = {
    conversation_id,
    share_method: 'ai_summary',
    summary_prompt: `Summary of ${original_message_count} messages`,
    coach_name: persona_name,
  };

  return {
    content_type: 'chat',
    content_text: sanitized.sanitized!,
    content_metadata: metadata,
    source_id: conversation_id,
    source_table: 'marcus_conversations',
    virtue,
    persona_id,
    share_method: 'ai_summary',
    original_date: new Date().toISOString().split('T')[0],
  };
}

// ============================================================================
// Practice Formatters
// ============================================================================

export function formatPracticeAchievement(input: FormatPracticeInput): FormattedPost {
  const { practice_id, practice_name, achievement_type, streak_days, user_note, virtue } = input;

  let content_text = '';

  switch (achievement_type) {
    case 'milestone':
      content_text = `🎯 Milestone Reached: ${practice_name}`;
      if (streak_days) {
        content_text += `\n\n${streak_days}-day streak! 🔥`;
      }
      break;

    case 'streak':
      content_text = `🔥 Streak Achievement: ${streak_days} days of ${practice_name}!`;
      break;

    case 'breakthrough':
      content_text = `✨ Breakthrough: ${practice_name}`;
      break;
  }

  if (user_note) {
    content_text += `\n\n${user_note}`;
  }

  const sanitized = sanitizeContent(content_text);

  if (!sanitized.isValid) {
    throw new Error(sanitized.error || 'Invalid content');
  }

  const metadata: PracticeMetadata = {
    practice_id,
    practice_name,
    achievement_type,
    streak_days,
    user_note,
  };

  return {
    content_type: 'practice',
    content_text: sanitized.sanitized!,
    content_metadata: metadata,
    source_id: practice_id,
    source_table: 'habit_logs',
    virtue,
    original_date: new Date().toISOString().split('T')[0],
  };
}

// ============================================================================
// Display Formatters (for rendering in UI)
// ============================================================================

export function getPostTypeLabel(contentType: string): string {
  const labels = {
    reflection: 'Reflection',
    chat: 'Wisdom',
    practice: 'Achievement',
  };
  return labels[contentType as keyof typeof labels] || contentType;
}

export function getReflectionTypeLabel(type: string): string {
  const labels = {
    morning: 'Morning',
    midday: 'Midday',
    evening: 'Evening',
  };
  return labels[type as keyof typeof labels] || type;
}

export function getAchievementTypeLabel(type: string): string {
  const labels = {
    milestone: 'Milestone',
    streak: 'Streak',
    breakthrough: 'Breakthrough',
  };
  return labels[type as keyof typeof labels] || type;
}

export function getShareMethodLabel(method: string | null): string {
  if (!method) return '';
  const labels = {
    excerpt: 'Excerpt',
    ai_summary: 'AI Summary',
  };
  return labels[method as keyof typeof labels] || method;
}

// ============================================================================
// Time Formatting
// ============================================================================

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  }

  const months = Math.floor(diffDays / 30);
  return `${months} month${months > 1 ? 's' : ''} ago`;
}

// ============================================================================
// Truncation Helpers
// ============================================================================

export function truncateContent(content: string, maxLength: number = 200): string {
  if (content.length <= maxLength) return content;
  return content.substring(0, maxLength).trim() + '...';
}

// ============================================================================
// Emoji Helpers
// ============================================================================

export function getVirtueEmoji(virtue?: string): string {
  if (!virtue) return '';

  const emojis: Record<string, string> = {
    wisdom: '🦉',
    justice: '⚖️',
    courage: '🦁',
    temperance: '🧘',
    compassion: '💙',
    resilience: '🌳',
  };

  return emojis[virtue.toLowerCase()] || '✨';
}

export function getContentTypeEmoji(contentType: string): string {
  const emojis = {
    reflection: '📝',
    chat: '💬',
    practice: '🎯',
  };
  return emojis[contentType as keyof typeof emojis] || '📌';
}
