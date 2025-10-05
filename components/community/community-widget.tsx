'use client';

import { useEffect } from 'react';
import { useCommunityStore } from '@/lib/stores/community-store';
import { CommunityPostCard } from './community-post-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Users, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function CommunityWidget() {
  const { widgetPosts, widgetLoading, fetchWidget } = useCommunityStore();

  useEffect(() => {
    fetchWidget();
  }, [fetchWidget]);

  if (!widgetPosts || widgetPosts.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Community Insights</CardTitle>
          </div>
          <Link href="/community">
            <Button variant="ghost" size="sm" className="gap-2">
              View All
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Wisdom from fellow practitioners
        </p>
      </CardHeader>

      <CardContent>
        {widgetLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4">
            {widgetPosts.slice(0, 3).map((post) => (
              <CommunityPostCard
                key={post.id}
                post={post}
                compact={true}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
