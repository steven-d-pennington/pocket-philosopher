-- Row Level Security Policies for Community Features
-- Created: 2025-10-04

-- Enable RLS on all community tables
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_reports ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- COMMUNITY POSTS POLICIES
-- ============================================================================

-- Users can view visible community posts
CREATE POLICY "Users can view visible posts"
  ON community_posts
  FOR SELECT
  USING (is_visible = true);

-- Users can view their own posts (even if not visible)
CREATE POLICY "Users can view own posts"
  ON community_posts
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own posts
CREATE POLICY "Users can create posts"
  ON community_posts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own posts (mainly for visibility toggle)
CREATE POLICY "Users can update own posts"
  ON community_posts
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own posts
CREATE POLICY "Users can delete own posts"
  ON community_posts
  FOR DELETE
  USING (auth.uid() = user_id);

-- Admins can view all posts
CREATE POLICY "Admins can view all posts"
  ON community_posts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Admins can update any post (for moderation)
CREATE POLICY "Admins can update posts"
  ON community_posts
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Admins can delete any post (for moderation)
CREATE POLICY "Admins can delete posts"
  ON community_posts
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- ============================================================================
-- COMMUNITY REACTIONS POLICIES
-- ============================================================================

-- Users can view reactions on visible posts
CREATE POLICY "Users can view reactions"
  ON community_reactions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM community_posts
      WHERE community_posts.id = community_reactions.post_id
      AND community_posts.is_visible = true
    )
  );

-- Users can view their own reactions
CREATE POLICY "Users can view own reactions"
  ON community_reactions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can add reactions to visible posts
CREATE POLICY "Users can add reactions"
  ON community_reactions
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM community_posts
      WHERE community_posts.id = community_reactions.post_id
      AND community_posts.is_visible = true
    )
  );

-- Users can delete their own reactions
CREATE POLICY "Users can remove own reactions"
  ON community_reactions
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- COMMUNITY REPORTS POLICIES
-- ============================================================================

-- Users can view their own reports
CREATE POLICY "Users can view own reports"
  ON community_reports
  FOR SELECT
  USING (auth.uid() = reporter_user_id);

-- Users can report visible posts (but not their own)
CREATE POLICY "Users can report posts"
  ON community_reports
  FOR INSERT
  WITH CHECK (
    auth.uid() = reporter_user_id
    AND EXISTS (
      SELECT 1 FROM community_posts
      WHERE community_posts.id = community_reports.post_id
      AND community_posts.is_visible = true
      AND community_posts.user_id != auth.uid() -- Can't report own posts
    )
  );

-- Admins can view all reports
CREATE POLICY "Admins can view all reports"
  ON community_reports
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Admins can update reports (for moderation actions)
CREATE POLICY "Admins can update reports"
  ON community_reports
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Admins can delete reports if needed
CREATE POLICY "Admins can delete reports"
  ON community_reports
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Comments
COMMENT ON POLICY "Users can view visible posts" ON community_posts IS 'Anyone can view posts marked as visible';
COMMENT ON POLICY "Users can report posts" ON community_reports IS 'Users can report others posts but not their own';
