-- Community Features Migration
-- Created: 2025-10-04
-- Description: Creates tables for community posts, reactions, and reports

-- Add community-related columns to profiles table
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS display_name VARCHAR(50) UNIQUE,
  ADD COLUMN IF NOT EXISTS community_enabled BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS community_onboarded_at TIMESTAMPTZ;

-- Create index on display_name for uniqueness checks
CREATE INDEX IF NOT EXISTS idx_profiles_display_name ON profiles(display_name) WHERE display_name IS NOT NULL;

-- Community posts table
CREATE TABLE IF NOT EXISTS community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Author info
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name VARCHAR(50) NOT NULL, -- Denormalized for performance
  
  -- Content
  content_type VARCHAR(20) NOT NULL CHECK (content_type IN ('reflection', 'chat', 'practice')),
  content_text TEXT NOT NULL,
  content_metadata JSONB NOT NULL DEFAULT '{}',
  
  -- Source references
  source_id UUID, -- ID of original reflection/message/practice
  source_table VARCHAR(50), -- 'reflections', 'marcus_messages', 'habit_logs'
  
  -- Context
  virtue VARCHAR(50), -- User's virtue focus at time of share
  persona_id VARCHAR(50), -- Active persona if relevant
  
  -- Sharing method (for chats)
  share_method VARCHAR(20) CHECK (share_method IN ('excerpt', 'ai_summary') OR share_method IS NULL),
  
  -- Visibility
  is_visible BOOLEAN DEFAULT true,
  
  -- Engagement
  reaction_count INT DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  original_date DATE, -- Date of original content
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Indexes for community_posts
CREATE INDEX IF NOT EXISTS idx_community_posts_user ON community_posts (user_id, is_visible) WHERE is_visible = true;
CREATE INDEX IF NOT EXISTS idx_community_posts_virtue ON community_posts (virtue, created_at DESC) WHERE is_visible = true;
CREATE INDEX IF NOT EXISTS idx_community_posts_persona ON community_posts (persona_id, created_at DESC) WHERE is_visible = true;
CREATE INDEX IF NOT EXISTS idx_community_posts_type ON community_posts (content_type, created_at DESC) WHERE is_visible = true;
CREATE INDEX IF NOT EXISTS idx_community_posts_feed ON community_posts (is_visible, created_at DESC) WHERE is_visible = true;
CREATE INDEX IF NOT EXISTS idx_community_posts_search ON community_posts USING gin(to_tsvector('english', content_text)) WHERE is_visible = true;

-- Community reactions table
CREATE TABLE IF NOT EXISTS community_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  
  UNIQUE(post_id, user_id) -- One reaction per user per post
);

-- Indexes for community_reactions
CREATE INDEX IF NOT EXISTS idx_community_reactions_post ON community_reactions (post_id);
CREATE INDEX IF NOT EXISTS idx_community_reactions_user ON community_reactions (user_id);

-- Community reports table
CREATE TABLE IF NOT EXISTS community_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  reporter_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed', 'actioned')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id)
);

-- Indexes for community_reports
CREATE INDEX IF NOT EXISTS idx_community_reports_status ON community_reports (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_reports_post ON community_reports (post_id);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_community_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_community_posts_updated_at
  BEFORE UPDATE ON community_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_community_posts_updated_at();

-- Trigger to denormalize reaction count
CREATE OR REPLACE FUNCTION update_post_reaction_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE community_posts SET reaction_count = reaction_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE community_posts SET reaction_count = reaction_count - 1 WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_post_reaction_count
  AFTER INSERT OR DELETE ON community_reactions
  FOR EACH ROW
  EXECUTE FUNCTION update_post_reaction_count();

-- Comments
COMMENT ON TABLE community_posts IS 'User-shared content from reflections, coach chats, and practice achievements';
COMMENT ON TABLE community_reactions IS 'Heart reactions on community posts';
COMMENT ON TABLE community_reports IS 'User-reported content for moderation';
