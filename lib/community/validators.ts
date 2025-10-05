/**
 * Community Features - Content Validators
 * Created: 2025-10-04
 */

import type { DisplayNameValidation, ContentValidation } from './types';

// ============================================================================
// Display Name Validation
// ============================================================================

const DISPLAY_NAME_MIN_LENGTH = 3;
const DISPLAY_NAME_MAX_LENGTH = 50;
const DISPLAY_NAME_REGEX = /^[a-zA-Z0-9\s\-_]+$/;

// Basic profanity filter (expand as needed)
const PROFANITY_LIST = [
  'badword1', 'badword2', // Replace with actual words
  // Add more as needed
];

export function validateDisplayName(name: string): DisplayNameValidation {
  if (!name || typeof name !== 'string') {
    return {
      isValid: false,
      error: 'Display name is required',
    };
  }

  const trimmed = name.trim();

  if (trimmed.length < DISPLAY_NAME_MIN_LENGTH) {
    return {
      isValid: false,
      error: `Display name must be at least ${DISPLAY_NAME_MIN_LENGTH} characters`,
    };
  }

  if (trimmed.length > DISPLAY_NAME_MAX_LENGTH) {
    return {
      isValid: false,
      error: `Display name must be no more than ${DISPLAY_NAME_MAX_LENGTH} characters`,
    };
  }

  if (!DISPLAY_NAME_REGEX.test(trimmed)) {
    return {
      isValid: false,
      error: 'Display name can only contain letters, numbers, spaces, dashes, and underscores',
    };
  }

  // Check for profanity
  const lowerName = trimmed.toLowerCase();
  for (const word of PROFANITY_LIST) {
    if (lowerName.includes(word.toLowerCase())) {
      return {
        isValid: false,
        error: 'Display name contains inappropriate language',
      };
    }
  }

  return {
    isValid: true,
  };
}

// ============================================================================
// Display Name Uniqueness Check (requires DB query)
// ============================================================================

export async function isDisplayNameAvailable(
  name: string,
  supabaseClient: any
): Promise<boolean> {
  try {
    const { data, error } = await supabaseClient
      .from('profiles')
      .select('display_name')
      .eq('display_name', name.trim())
      .maybeSingle();

    if (error) {
      console.error('Error checking display name:', error);
      return false;
    }

    return !data; // Available if no match found
  } catch (error) {
    console.error('Error checking display name availability:', error);
    return false;
  }
}

// ============================================================================
// Content Sanitization
// ============================================================================

/**
 * Sanitize user-generated content to prevent XSS and other attacks
 */
export function sanitizeContent(content: string): ContentValidation {
  if (!content || typeof content !== 'string') {
    return {
      isValid: false,
      error: 'Content is required',
    };
  }

  let sanitized = content;

  // Remove HTML tags (basic protection)
  sanitized = sanitized.replace(/<[^>]*>/g, '');

  // Remove script-related content
  sanitized = sanitized.replace(/javascript:/gi, '');
  sanitized = sanitized.replace(/on\w+\s*=/gi, '');

  // Normalize whitespace
  sanitized = sanitized.replace(/\s+/g, ' ').trim();

  // Check length (max 5000 characters for posts)
  if (sanitized.length > 5000) {
    return {
      isValid: false,
      error: 'Content is too long (max 5000 characters)',
    };
  }

  if (sanitized.length === 0) {
    return {
      isValid: false,
      error: 'Content cannot be empty',
    };
  }

  return {
    isValid: true,
    sanitized,
  };
}

// ============================================================================
// URL Validation (for future use with links/resharing)
// ============================================================================

export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

// ============================================================================
// Content Type Validation
// ============================================================================

export function isValidContentType(type: string): boolean {
  return ['reflection', 'chat', 'practice'].includes(type);
}

export function isValidShareMethod(method: string | null): boolean {
  return method === null || ['excerpt', 'ai_summary'].includes(method);
}

export function isValidReportStatus(status: string): boolean {
  return ['pending', 'reviewed', 'dismissed', 'actioned'].includes(status);
}

// ============================================================================
// Metadata Validation
// ============================================================================

export function validateReflectionMetadata(metadata: any): boolean {
  if (!metadata || typeof metadata !== 'object') return false;

  const { reflection_type, fields_shared, include_virtue } = metadata;

  if (!['morning', 'midday', 'evening'].includes(reflection_type)) {
    return false;
  }

  if (!Array.isArray(fields_shared)) {
    return false;
  }

  if (typeof include_virtue !== 'boolean') {
    return false;
  }

  return true;
}

export function validateChatMetadata(metadata: any): boolean {
  if (!metadata || typeof metadata !== 'object') return false;

  const { conversation_id, share_method, coach_name } = metadata;

  if (!conversation_id || typeof conversation_id !== 'string') {
    return false;
  }

  if (!isValidShareMethod(share_method)) {
    return false;
  }

  if (!coach_name || typeof coach_name !== 'string') {
    return false;
  }

  // excerpt_messages and summary_prompt are optional
  // They can be included for richer context but aren't required

  return true;
}

export function validatePracticeMetadata(metadata: any): boolean {
  if (!metadata || typeof metadata !== 'object') return false;

  const { practice_id, practice_name, achievement_type } = metadata;

  if (!practice_id || typeof practice_id !== 'string') {
    return false;
  }

  if (!practice_name || typeof practice_name !== 'string') {
    return false;
  }

  if (!['milestone', 'streak', 'breakthrough'].includes(achievement_type)) {
    return false;
  }

  return true;
}

// ============================================================================
// Share Request Validation
// ============================================================================

export function validateShareRequest(request: any): { isValid: boolean; error?: string } {
  if (!request || typeof request !== 'object') {
    return { isValid: false, error: 'Invalid request' };
  }

  const { content_type, source_id, source_table, content_text, content_metadata } = request;

  if (!isValidContentType(content_type)) {
    return { isValid: false, error: 'Invalid content type' };
  }

  if (!source_id || typeof source_id !== 'string') {
    return { isValid: false, error: 'Source ID is required' };
  }

  if (!source_table || typeof source_table !== 'string') {
    return { isValid: false, error: 'Source table is required' };
  }

  const contentValidation = sanitizeContent(content_text);
  if (!contentValidation.isValid) {
    return { isValid: false, error: contentValidation.error };
  }

  // Validate metadata based on content type
  let metadataValid = false;
  switch (content_type) {
    case 'reflection':
      metadataValid = validateReflectionMetadata(content_metadata);
      break;
    case 'chat':
      metadataValid = validateChatMetadata(content_metadata);
      break;
    case 'practice':
      metadataValid = validatePracticeMetadata(content_metadata);
      break;
  }

  if (!metadataValid) {
    return { isValid: false, error: 'Invalid content metadata' };
  }

  return { isValid: true };
}
