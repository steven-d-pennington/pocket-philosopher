/**
 * Community Features - TypeScript Type Definitions
 * Created: 2025-10-04
 */

// ============================================================================
// Database Types
// ============================================================================

export type ContentType = 'reflection' | 'chat' | 'practice' | 'chat_excerpt' | 'chat_summary' | 'practice_achievement';
export type ShareMethod = 'excerpt' | 'ai_summary' | null;
export type ReportStatus = 'pending' | 'reviewed' | 'dismissed' | 'actioned';
export type FeedMode = 'for_you' | 'recent';

// ============================================================================
// Community Post
// ============================================================================

export interface CommunityPost {
  id: string;
  user_id: string;
  display_name: string;
  content_type: ContentType;
  content_text: string;
  content_metadata: ReflectionMetadata | ChatMetadata | PracticeMetadata;
  metadata?: ReflectionMetadataExtended | ChatExcerptMetadata | ChatSummaryMetadata | PracticeAchievementMetadata; // Extended metadata for UI
  source_id: string | null;
  source_table: string | null;
  virtue: string | null;
  persona_id: string | null;
  share_method: ShareMethod;
  is_visible: boolean;
  reaction_count: number;
  created_at: string;
  original_date: string | null;
  updated_at: string;
}

// ============================================================================
// Content Metadata Types
// ============================================================================

export interface ReflectionMetadata {
  reflection_type: 'morning' | 'midday' | 'evening';
  fields_shared: string[]; // e.g., ['intention', 'gratitude']
  include_virtue: boolean;
}

export interface ChatMetadata {
  conversation_id: string;
  share_method: 'excerpt' | 'ai_summary';
  excerpt_messages?: string[]; // Message IDs if excerpt
  summary_prompt?: string; // If AI summary
  coach_name: string;
  persona_id?: string; // Persona ID for filtering/display
}

export interface PracticeMetadata {
  practice_id: string;
  practice_name: string;
  achievement_type: 'milestone' | 'streak' | 'breakthrough';
  streak_days?: number; // If applicable
  user_note?: string; // Optional personal reflection
}

// ============================================================================
// Extended Metadata for UI Display (formatted by formatters)
// ============================================================================

export interface ReflectionMetadataExtended extends ReflectionMetadata {
  summary?: string;
  highlights?: string[];
  mood?: number;
}

export interface ChatExcerptMetadata {
  conversation_id: string;
  share_method: 'excerpt';
  persona_name: string;
  context?: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  citations?: Array<{
    author: string;
    work: string;
  }>;
}

export interface ChatSummaryMetadata {
  conversation_id: string;
  share_method: 'ai_summary';
  persona_name: string;
  summary: string;
  key_insights?: string[];
  topics?: string[];
}

export interface PracticeAchievementMetadata extends PracticeMetadata {
  achievement_message?: string;
  reflection?: string;
}

// ============================================================================
// Community Reaction
// ============================================================================

export interface CommunityReaction {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
}

// ============================================================================
// Community Report
// ============================================================================

export interface CommunityReport {
  id: string;
  post_id: string;
  reporter_user_id: string;
  status: ReportStatus;
  admin_notes: string | null;
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
}

// ============================================================================
// API Request/Response Types
// ============================================================================

export interface OptInRequest {
  display_name: string;
  accept_guidelines: boolean;
}

export interface OptInResponse {
  success: boolean;
  display_name: string;
  community_enabled: boolean;
}

export interface FeedRequest {
  mode?: FeedMode;
  virtue?: string;
  persona?: string;
  content_type?: ContentType;
  limit?: number;
  offset?: number;
}

export interface FeedResponse {
  posts: CommunityPostWithReaction[];
  has_more: boolean;
  total?: number;
}

export interface SearchRequest {
  q: string;
  virtue?: string;
  persona?: string;
  content_type?: ContentType;
  date_from?: string; // ISO date
  date_to?: string; // ISO date
  limit?: number;
  offset?: number;
}

export interface SearchResponse {
  posts: CommunityPostWithReaction[];
  has_more: boolean;
  total?: number;
}

export interface SharePostRequest {
  content_type: ContentType;
  source_id: string;
  source_table: string;
  content_text: string;
  content_metadata: ReflectionMetadata | ChatMetadata | PracticeMetadata;
  share_method?: ShareMethod;
}

export interface SharePostResponse {
  success: boolean;
  post: CommunityPost;
}

export interface ReactRequest {
  action: 'add' | 'remove';
}

export interface ReactResponse {
  success: boolean;
  reaction_count: number;
  user_has_reacted: boolean;
}

export interface ReportRequest {
  reason?: string; // Optional reason for future use
}

export interface ReportResponse {
  success: boolean;
  message: string;
}

export interface WidgetResponse {
  posts: CommunityPostWithReaction[];
}

// ============================================================================
// Admin Types
// ============================================================================

export interface AdminReportsRequest {
  status?: ReportStatus;
  limit?: number;
  offset?: number;
}

export interface AdminReportsResponse {
  reports: CommunityReportWithPost[];
  has_more: boolean;
  total?: number;
}

export interface AdminActionRequest {
  action: 'delete' | 'hide' | 'dismiss';
  admin_notes?: string;
}

export interface AdminActionResponse {
  success: boolean;
  action_taken: string;
  post_id: string;
}

// ============================================================================
// Extended Types (with joins/computed fields)
// ============================================================================

export interface CommunityPostWithReaction extends CommunityPost {
  user_has_reacted: boolean;
}

export interface CommunityReportWithPost extends CommunityReport {
  post: CommunityPost;
}

// ============================================================================
// Filter & Search Types
// ============================================================================

export interface FeedFilters {
  virtue?: string;
  persona?: string;
  content_type?: ContentType;
}

export interface SearchFilters extends FeedFilters {
  date_from?: string;
  date_to?: string;
}

// ============================================================================
// Formatting Types
// ============================================================================

export interface FormatReflectionInput {
  reflection_id: string;
  reflection_type: 'morning' | 'midday' | 'evening';
  content: any; // JSONB content
  virtue_focus?: string;
  user_display_name: string;
  user_id: string;
  fields_to_share: string[];
  include_virtue: boolean;
}

export interface FormatChatExcerptInput {
  conversation_id: string;
  message_ids: string[];
  messages: any[]; // Array of message objects
  persona_id: string;
  persona_name: string;
  user_display_name: string;
  user_id: string;
  virtue?: string;
}

export interface FormatChatSummaryInput {
  conversation_id: string;
  summary: string;
  persona_id: string;
  persona_name: string;
  user_display_name: string;
  user_id: string;
  virtue?: string;
  original_message_count: number;
}

export interface FormatPracticeInput {
  practice_id: string;
  practice_name: string;
  achievement_type: 'milestone' | 'streak' | 'breakthrough';
  streak_days?: number;
  user_note?: string;
  user_display_name: string;
  user_id: string;
  virtue?: string;
}

export interface FormattedPost {
  content_type: ContentType;
  content_text: string;
  content_metadata: ReflectionMetadata | ChatMetadata | PracticeMetadata;
  source_id: string;
  source_table: string;
  virtue?: string;
  persona_id?: string;
  share_method?: ShareMethod;
  original_date?: string;
}

// ============================================================================
// Validation Types
// ============================================================================

export interface DisplayNameValidation {
  isValid: boolean;
  error?: string;
}

export interface ContentValidation {
  isValid: boolean;
  sanitized?: string;
  error?: string;
}

// ============================================================================
// Scoring Types
// ============================================================================

export interface PostScore {
  post_id: string;
  score: number;
  breakdown?: {
    virtue_match: number;
    persona_match: number;
    freshness: number;
  };
}

export interface UserContext {
  user_id: string;
  preferred_virtue?: string;
  preferred_persona?: string;
  recent_virtues?: string[]; // Last 7 days
  recent_personas?: string[]; // Last 7 days
}

// ============================================================================
// AI Summary Types
// ============================================================================

export interface SummaryRequest {
  conversation_id: string;
  user_id: string;
  persona_id: string;
  max_tokens?: number;
}

export interface SummaryResponse {
  summary: string;
  persona: string;
  token_count: number;
  error?: string;
}

// ============================================================================
// Store Types
// ============================================================================

export interface CommunityState {
  // User preferences
  isEnabled: boolean;
  displayName: string | null;
  
  // Feed state
  feedPosts: CommunityPostWithReaction[];
  feedMode: FeedMode;
  feedFilters: FeedFilters;
  feedLoading: boolean;
  feedHasMore: boolean;
  feedOffset: number;
  
  // Widget state
  widgetPosts: CommunityPostWithReaction[];
  widgetLoading: boolean;
  
  // Search state
  searchQuery: string;
  searchFilters: SearchFilters;
  searchResults: CommunityPostWithReaction[];
  searchLoading: boolean;
  searchHasMore: boolean;
  searchOffset: number;
  
  // Reactions tracking (post_id -> hasReacted)
  userReactions: Record<string, boolean>;
  
  // UI state
  shareModalOpen: boolean;
  shareModalData: ShareModalData | null;
  
  // Actions
  enableCommunity: (displayName: string) => Promise<void>;
  disableCommunity: () => Promise<void>;
  
  fetchFeed: (options?: { reset?: boolean }) => Promise<void>;
  setFeedMode: (mode: FeedMode) => void;
  setFeedFilters: (filters: Partial<FeedFilters>) => void;
  clearFeedFilters: () => void;
  
  fetchWidget: () => Promise<void>;
  
  search: (query: string, filters?: SearchFilters) => Promise<void>;
  setSearchFilters: (filters: Partial<SearchFilters>) => void;
  clearSearch: () => void;
  
  sharePost: (data: SharePostRequest) => Promise<CommunityPost>;
  unsharePost: (postId: string) => Promise<void>;
  reactToPost: (postId: string, action: 'add' | 'remove') => Promise<void>;
  reportPost: (postId: string, reason?: string) => Promise<void>;
  
  openShareModal: (data: ShareModalData) => void;
  closeShareModal: () => void;
}

export interface ShareModalData {
  type: ContentType;
  sourceId: string;
  sourceData: any; // Type-specific source data
  previewData?: FormattedPost;
}

// ============================================================================
// Component Props Types
// ============================================================================

export interface CommunityPostCardProps {
  post: CommunityPostWithReaction;
  onReact?: (postId: string, action: 'add' | 'remove') => void;
  onReport?: (postId: string) => void;
  onDelete?: (postId: string) => void;
  showActions?: boolean;
  compact?: boolean;
}

export interface CommunityFeedProps {
  mode?: FeedMode;
  filters?: FeedFilters;
  onModeChange?: (mode: FeedMode) => void;
  onFilterChange?: (filters: FeedFilters) => void;
}

export interface SharePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ShareModalData;
  onConfirm: (formattedPost: FormattedPost) => Promise<void>;
}

export interface CommunitySearchBarProps {
  onSearch: (query: string, filters?: SearchFilters) => void;
  initialQuery?: string;
  initialFilters?: SearchFilters;
}

export interface CommunityWidgetCarouselProps {
  posts: CommunityPostWithReaction[];
  loading?: boolean;
  onViewAll?: () => void;
}

export interface AdminReportsQueueProps {
  reports: CommunityReportWithPost[];
  onAction: (reportId: string, action: AdminActionRequest) => Promise<void>;
  loading?: boolean;
}
