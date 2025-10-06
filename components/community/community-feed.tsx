'use client';

import { useEffect, useState } from 'react';
import { useCommunityStore } from '@/lib/stores/community-store';
import { CommunityPostCard } from './community-post-card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Loader2, 
  RefreshCw, 
  Filter, 
  Search,
  Sparkles,
  Clock
} from 'lucide-react';

const VIRTUES = ['wisdom', 'courage', 'temperance', 'justice'];
const CONTENT_TYPES = [
  { value: 'reflection', label: 'Reflections' },
  { value: 'chat', label: 'Conversations' },
  { value: 'practice', label: 'Achievements' },
];

export function CommunityFeed() {
  const {
    feedPosts,
    feedMode,
    feedFilters,
    feedLoading,
    feedHasMore,
    setFeedMode,
    setFeedFilters,
    fetchFeed,
    // search state
    search,
    clearSearch,
    searchResults,
    searchLoading,
    searchHasMore,
    searchQuery: globalSearchQuery,
    searchMore,
  } = useCommunityStore();

  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState(globalSearchQuery || '');

  // Load feed on mount
  useEffect(() => {
    fetchFeed({ reset: true });
  }, [fetchFeed]);

  const handleRefresh = () => {
    fetchFeed({ reset: true });
  };

  const handleModeChange = (mode: 'for_you' | 'recent') => {
    setFeedMode(mode);
    fetchFeed({ reset: true });
  };

  const handleFilterChange = (key: string, value: string | undefined) => {
    const next = { ...feedFilters, [key]: value } as any;
    setFeedFilters(next);
    if (globalSearchQuery) {
      search(searchQuery.trim() || globalSearchQuery, next);
    } else {
      fetchFeed({ reset: true });
    }
  };

  const handleClearFilters = () => {
    setFeedFilters({});
    fetchFeed({ reset: true });
  };

  const handleSearch = () => {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      clearSearch();
      return;
    }
    search(trimmed, feedFilters as any);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    clearSearch();
  };

  const activeFilterCount = Object.keys(feedFilters).filter(
    (key) => feedFilters[key as keyof typeof feedFilters]
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Community</h1>
          <p className="text-muted-foreground">
            Discover wisdom from fellow practitioners
          </p>
        </div>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleRefresh}
          disabled={feedLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${feedLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Mode Tabs */}
      <Tabs value={feedMode} onValueChange={handleModeChange as any}>
        <TabsList className="grid w-full max-w-[400px] grid-cols-2">
          <TabsTrigger value="for_you" className="gap-2">
            <Sparkles className="h-4 w-4" />
            For You
          </TabsTrigger>
          <TabsTrigger value="recent" className="gap-2">
            <Clock className="h-4 w-4" />
            Recent
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Filters Bar */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1">
                {activeFilterCount}
              </Badge>
            )}
          </Button>

          {activeFilterCount > 0 && (
            <Button variant="ghost" size="sm" onClick={handleClearFilters}>
              Clear all
            </Button>
          )}
          {/* Search controls */}
          <div className="ml-auto flex items-center gap-2 max-w-md w-full">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSearch();
                }}
                className="pl-9"
              />
            </div>
            <Button variant="outline" size="sm" onClick={handleSearch} disabled={searchLoading}>
              {searchLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Search'
              )}
            </Button>
            {globalSearchQuery && (
              <Button variant="ghost" size="sm" onClick={handleClearSearch}>
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Filter Controls */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg bg-muted/50">
            {/* Virtue Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Virtue</label>
              <Select
                value={feedFilters.virtue || 'all'}
                onValueChange={(value) => 
                  handleFilterChange('virtue', value === 'all' ? undefined : value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All virtues" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All virtues</SelectItem>
                  {VIRTUES.map((virtue) => (
                    <SelectItem key={virtue} value={virtue}>
                      {virtue.charAt(0).toUpperCase() + virtue.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Content Type Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Content Type</label>
              <Select
                value={feedFilters.content_type || 'all'}
                onValueChange={(value) => 
                  handleFilterChange('content_type', value === 'all' ? undefined : value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  {CONTENT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* (Search input moved to header controls) */}
          </div>
        )}
      </div>

      {/* Feed/Search Content */}
      <div className="space-y-6">
        {/* Loading states */}
        {(globalSearchQuery ? searchLoading : feedLoading) && (globalSearchQuery ? searchResults.length === 0 : feedPosts.length === 0) ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (globalSearchQuery ? searchResults.length === 0 : feedPosts.length === 0) ? (
          <div className="text-center py-12">
            {globalSearchQuery ? (
              <>
                <p className="text-muted-foreground mb-4">No results found for “{globalSearchQuery}”.</p>
                <p className="text-sm text-muted-foreground">Try a different query or clear search to return to the feed.</p>
              </>
            ) : (
              <>
                <p className="text-muted-foreground mb-4">No posts yet. Be the first to share!</p>
                <p className="text-sm text-muted-foreground">Share your reflections, coach conversations, or practice achievements to inspire others.</p>
              </>
            )}
          </div>
        ) : (
          <>
            {/* Posts List */}
            <div className="space-y-6">
              {(globalSearchQuery ? searchResults : feedPosts).map((post) => (
                <CommunityPostCard key={post.id} post={post} />
              ))}
            </div>

            {/* Load More */}
            {(!globalSearchQuery && feedHasMore) && (
              <div className="flex justify-center pt-4">
                <Button
                  variant="outline"
                  onClick={() => fetchFeed({ reset: false })}
                  disabled={feedLoading}
                >
                  {feedLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Load More'
                  )}
                </Button>
              </div>
            )}

            {(globalSearchQuery && searchHasMore) && (
              <div className="flex justify-center pt-4">
                <Button
                  variant="outline"
                  onClick={() => searchMore()}
                  disabled={searchLoading}
                >
                  {searchLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Load More'
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
