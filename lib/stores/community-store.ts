/**
 * Community Store - Zustand State Management
 * Created: 2025-10-04
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  CommunityState,
  CommunityPostWithReaction,
  FeedMode,
  FeedFilters,
  SearchFilters,
  SharePostRequest,
  CommunityPost,
  ShareModalData,
  FormattedPost,
} from '@/lib/community/types';

interface CommunityStoreState extends CommunityState {}

export const useCommunityStore = create<CommunityStoreState>()(
  persist(
    (set, get) => ({
      // User preferences
      isEnabled: false,
      displayName: null,

      // Feed state
      feedPosts: [],
      feedMode: 'for_you',
      feedFilters: {},
      feedLoading: false,
      feedHasMore: false,
      feedOffset: 0,

      // Widget state
      widgetPosts: [],
      widgetLoading: false,

      // Search state
      searchQuery: '',
      searchFilters: {},
      searchResults: [],
      searchLoading: false,
      searchHasMore: false,
      searchOffset: 0,

      // Reactions tracking
      userReactions: {},

      // UI state
      shareModalOpen: false,
      shareModalData: null,

      // Actions
      enableCommunity: async (displayName: string) => {
        try {
          const response = await fetch('/api/community/opt-in', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              display_name: displayName,
              accept_guidelines: true,
            }),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'Failed to enable community');
          }

          const data = await response.json();
          set({
            isEnabled: true,
            displayName: data.display_name,
          });
        } catch (error) {
          console.error('Error enabling community:', error);
          throw error;
        }
      },

      disableCommunity: async () => {
        // TODO: Implement disable API endpoint if needed
        set({
          isEnabled: false,
          displayName: null,
        });
      },

      fetchFeed: async (options = {}) => {
        const { reset = false } = options;
        const state = get();

        if (reset) {
          set({ feedOffset: 0, feedPosts: [] });
        }

        set({ feedLoading: true });

        try {
          const offset = reset ? 0 : state.feedOffset;
          const params = new URLSearchParams({
            mode: state.feedMode,
            limit: '20',
            offset: offset.toString(),
          });

          if (state.feedFilters.virtue) params.append('virtue', state.feedFilters.virtue);
          if (state.feedFilters.persona) params.append('persona', state.feedFilters.persona);
          if (state.feedFilters.content_type) params.append('content_type', state.feedFilters.content_type);

          const response = await fetch(`/api/community/feed?${params}`);
          if (!response.ok) throw new Error('Failed to fetch feed');

          const data = await response.json();

          set({
            feedPosts: reset ? data.posts : [...state.feedPosts, ...data.posts],
            feedHasMore: data.has_more,
            feedOffset: offset + data.posts.length,
            feedLoading: false,
          });
        } catch (error) {
          console.error('Error fetching feed:', error);
          set({ feedLoading: false });
        }
      },

      setFeedMode: (mode: FeedMode) => {
        set({ feedMode: mode });
        get().fetchFeed({ reset: true });
      },

      setFeedFilters: (filters: Partial<FeedFilters>) => {
        set({ feedFilters: { ...get().feedFilters, ...filters } });
        get().fetchFeed({ reset: true });
      },

      clearFeedFilters: () => {
        set({ feedFilters: {} });
        get().fetchFeed({ reset: true });
      },

      fetchWidget: async () => {
        set({ widgetLoading: true });

        try {
          const response = await fetch('/api/community/widget');
          if (!response.ok) throw new Error('Failed to fetch widget posts');

          const data = await response.json();

          set({
            widgetPosts: data.posts,
            widgetLoading: false,
          });
        } catch (error) {
          console.error('Error fetching widget:', error);
          set({ widgetLoading: false });
        }
      },

      search: async (query: string, filters = {}) => {
        set({
          searchQuery: query,
          searchFilters: filters,
          searchLoading: true,
          searchOffset: 0,
        });

        try {
          const params = new URLSearchParams({
            q: query,
            limit: '20',
            offset: '0',
          });

          if (filters.virtue) params.append('virtue', filters.virtue);
          if (filters.persona) params.append('persona', filters.persona);
          if (filters.content_type) params.append('content_type', filters.content_type);
          if (filters.date_from) params.append('date_from', filters.date_from);
          if (filters.date_to) params.append('date_to', filters.date_to);

          const response = await fetch(`/api/community/search?${params}`);
          if (!response.ok) throw new Error('Search failed');

          const data = await response.json();

          set({
            searchResults: data.posts,
            searchHasMore: data.has_more,
            searchOffset: data.posts.length,
            searchLoading: false,
          });
        } catch (error) {
          console.error('Error searching:', error);
          set({ searchLoading: false });
        }
      },

      setSearchFilters: (filters: Partial<SearchFilters>) => {
        const state = get();
        get().search(state.searchQuery, { ...state.searchFilters, ...filters });
      },

      clearSearch: () => {
        set({
          searchQuery: '',
          searchFilters: {},
          searchResults: [],
          searchOffset: 0,
        });
      },

      sharePost: async (data: SharePostRequest): Promise<CommunityPost> => {
        const response = await fetch('/api/community/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error?.message || 'Failed to share post');
        }

        const result = await response.json();
        
        // Refresh feed to show new post
        get().fetchFeed({ reset: true });
        
        return result.post;
      },

      unsharePost: async (postId: string) => {
        const response = await fetch(`/api/community/posts/${postId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to unshare post');
        }

        // Remove from local state
        set({
          feedPosts: get().feedPosts.filter((p) => p.id !== postId),
          widgetPosts: get().widgetPosts.filter((p) => p.id !== postId),
        });
      },

      reactToPost: async (postId: string, action: 'add' | 'remove') => {
        // Optimistic update
        const updatePosts = (posts: CommunityPostWithReaction[]) =>
          posts.map((post) => {
            if (post.id === postId) {
              return {
                ...post,
                user_has_reacted: action === 'add',
                reaction_count: post.reaction_count + (action === 'add' ? 1 : -1),
              };
            }
            return post;
          });

        // Update userReactions map
        const newReactions = { ...get().userReactions };
        newReactions[postId] = action === 'add';

        set({
          feedPosts: updatePosts(get().feedPosts),
          widgetPosts: updatePosts(get().widgetPosts),
          userReactions: newReactions,
        });

        try {
          const response = await fetch(`/api/community/posts/${postId}/react`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action }),
          });

          if (!response.ok) {
            // Revert on error
            set({
              feedPosts: updatePosts(get().feedPosts), // Will reverse the change
              widgetPosts: updatePosts(get().widgetPosts),
            });
            throw new Error('Failed to react to post');
          }

          const data = await response.json();

          // Update with server response
          const serverUpdatePosts = (posts: CommunityPostWithReaction[]) =>
            posts.map((post) => {
              if (post.id === postId) {
                return {
                  ...post,
                  user_has_reacted: data.user_has_reacted,
                  reaction_count: data.reaction_count,
                };
              }
              return post;
            });

          set({
            feedPosts: serverUpdatePosts(get().feedPosts),
            widgetPosts: serverUpdatePosts(get().widgetPosts),
          });
        } catch (error) {
          console.error('Error reacting to post:', error);
          throw error;
        }
      },

      reportPost: async (postId: string, reason?: string) => {
        const response = await fetch(`/api/community/posts/${postId}/report`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error?.message || 'Failed to report post');
        }
      },

      openShareModal: (data: ShareModalData) => {
        set({
          shareModalOpen: true,
          shareModalData: data,
        });
      },

      closeShareModal: () => {
        set({
          shareModalOpen: false,
          shareModalData: null,
        });
      },
    }),
    {
      name: 'community-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist user preferences
        isEnabled: state.isEnabled,
        displayName: state.displayName,
        feedMode: state.feedMode,
      }),
    }
  )
);
