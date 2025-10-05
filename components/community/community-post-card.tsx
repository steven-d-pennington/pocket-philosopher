'use client';

import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCommunityStore } from '@/lib/stores/community-store';
import { 
  CommunityPost, 
  ReflectionMetadataExtended, 
  ChatExcerptMetadata, 
  ChatSummaryMetadata, 
  PracticeAchievementMetadata 
} from '@/lib/community/types';
import { 
  Heart, 
  MessageCircle, 
  Flag, 
  MoreHorizontal,
  Sparkles,
  BookOpen,
  Target,
  Calendar
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';
import { getPersonaProfile } from '@/lib/ai/personas';

interface CommunityPostCardProps {
  post: CommunityPost;
  onReport?: (postId: string) => void;
  onUnshare?: (postId: string) => void;
  isOwner?: boolean;
  compact?: boolean;
}

export function CommunityPostCard({ 
  post, 
  onReport, 
  onUnshare,
  isOwner = false,
  compact = false
}: CommunityPostCardProps) {
  const { reactToPost, userReactions } = useCommunityStore();
  const [isReacting, setIsReacting] = useState(false);

  const hasReacted = userReactions[post.id] || false;
  const reactionCount = post.reaction_count || 0;

  const handleReact = async () => {
    if (isReacting) return;

    setIsReacting(true);
    try {
      await reactToPost(post.id, hasReacted ? 'remove' : 'add');
    } catch (error) {
      console.error('Failed to react:', error);
    } finally {
      setIsReacting(false);
    }
  };

  const renderContent = () => {
    const metadata = post.content_metadata || post.metadata || {};
    
    switch (post.content_type) {
      case 'reflection':
        return <ReflectionContent metadata={metadata as any as ReflectionMetadataExtended} />;
      case 'chat':
      case 'chat_excerpt':
        return <ChatExcerptContent metadata={metadata as any as ChatExcerptMetadata} />;
      case 'chat_summary':
        return <ChatSummaryContent metadata={metadata as any as ChatSummaryMetadata} />;
      case 'practice':
      case 'practice_achievement':
        return <PracticeAchievementContent metadata={metadata as any as PracticeAchievementMetadata} />;
      default:
        return <p className="text-sm">{post.content_text}</p>;
    }
  };

  const getContentIcon = () => {
    switch (post.content_type) {
      case 'reflection':
        return <BookOpen className="h-4 w-4" />;
      case 'chat_excerpt':
      case 'chat_summary':
        return <MessageCircle className="h-4 w-4" />;
      case 'practice_achievement':
        return <Target className="h-4 w-4" />;
      default:
        return <Sparkles className="h-4 w-4" />;
    }
  };

  return (
    <Card className={`${compact ? 'border-0 shadow-none' : ''}`}>
      <CardHeader className={`${compact ? 'p-4 pb-2' : 'pb-3'}`}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {/* Content Type Icon */}
            <div className="flex-shrink-0 text-muted-foreground">
              {getContentIcon()}
            </div>

            {/* Author & Timestamp */}
            <div className="min-w-0 flex-1">
              <p className="font-medium text-sm truncate">
                {post.display_name || 'Anonymous'}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
              </p>
            </div>

            {/* Virtue Badge */}
            {post.virtue && (
              <Badge variant="outline" className="flex-shrink-0 text-xs">
                {post.virtue}
              </Badge>
            )}
          </div>

          {/* Actions Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">More options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isOwner && onUnshare && (
                <DropdownMenuItem 
                  onClick={() => onUnshare(post.id)}
                  className="text-destructive"
                >
                  <Flag className="mr-2 h-4 w-4" />
                  Unshare
                </DropdownMenuItem>
              )}
              {!isOwner && onReport && (
                <DropdownMenuItem onClick={() => onReport(post.id)}>
                  <Flag className="mr-2 h-4 w-4" />
                  Report
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className={`${compact ? 'px-4 py-2' : ''}`}>
        {renderContent()}
      </CardContent>

      <CardFooter className={`${compact ? 'px-4 pt-2 pb-4' : 'pt-3'} border-t`}>
        <div className="flex items-center gap-4 w-full">
          {/* React Button */}
          <Button
            variant="ghost"
            size="sm"
            className={`gap-2 ${hasReacted ? 'text-red-500' : ''}`}
            onClick={handleReact}
            disabled={isReacting}
          >
            <Heart className={`h-4 w-4 ${hasReacted ? 'fill-current' : ''}`} />
            <span className="text-sm">{reactionCount}</span>
          </Button>

          {/* Persona Badge (if applicable) */}
          {post.persona_id && (
            <Badge variant="secondary" className="ml-auto text-xs">
              {getPersonaProfile(post.persona_id)?.name || post.persona_id}
            </Badge>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}

// Content Type Components

function ReflectionContent({ metadata }: { metadata: ReflectionMetadataExtended }) {
  if (!metadata) return null;
  
  return (
    <div className="space-y-3">
      {metadata.summary && (
        <p className="text-sm leading-relaxed">{metadata.summary}</p>
      )}
      
      {metadata.highlights && metadata.highlights.length > 0 && (
        <div className="space-y-2">
          {metadata.highlights.map((highlight, idx) => (
            <blockquote key={idx} className="border-l-2 border-primary pl-3 text-sm italic text-muted-foreground">
              {highlight}
            </blockquote>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Calendar className="h-3 w-3" />
        <span>{metadata.reflection_type || 'evening'} reflection</span>
        {metadata.mood && <span>• Mood: {metadata.mood}/10</span>}
      </div>
    </div>
  );
}

function ChatExcerptContent({ metadata }: { metadata: ChatExcerptMetadata }) {
  if (!metadata || !metadata.messages) return null;
  
  return (
    <div className="space-y-3">
      {metadata.context && (
        <p className="text-xs text-muted-foreground mb-3">{metadata.context}</p>
      )}

      <div className="space-y-3">
        {metadata.messages.map((msg, idx) => (
          <div key={idx} className={`${msg.role === 'user' ? 'ml-0' : 'ml-4'}`}>
            <p className="text-xs font-medium text-muted-foreground mb-1">
              {msg.role === 'user' ? 'You' : (metadata.persona_name || (metadata as any).coach_name || 'Coach')}
            </p>
            <div className={`rounded-lg p-3 text-sm ${
              msg.role === 'user' 
                ? 'bg-secondary' 
                : 'bg-primary/10 border border-primary/20'
            }`}>
              <p className="leading-relaxed">{msg.content}</p>
            </div>
          </div>
        ))}
      </div>

      {metadata.citations && metadata.citations.length > 0 && (
        <div className="mt-3 pt-3 border-t">
          <p className="text-xs font-medium text-muted-foreground mb-2">Sources:</p>
          <div className="space-y-1">
            {metadata.citations.map((citation, idx) => (
              <p key={idx} className="text-xs text-muted-foreground">
                • {citation.author} - {citation.work}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ChatSummaryContent({ metadata }: { metadata: ChatSummaryMetadata }) {
  return (
    <div className="space-y-3">
      {metadata.summary && (
        <p className="text-sm leading-relaxed">{metadata.summary}</p>
      )}

      {metadata.key_insights && metadata.key_insights.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Key Insights:</p>
          <ul className="space-y-1.5">
            {metadata.key_insights.map((insight, idx) => (
              <li key={idx} className="text-sm flex items-start gap-2">
                <Sparkles className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {metadata.topics && metadata.topics.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {metadata.topics.map((topic, idx) => (
            <Badge key={idx} variant="secondary" className="text-xs">
              {topic}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

function PracticeAchievementContent({ metadata }: { metadata: PracticeAchievementMetadata }) {
  if (!metadata) return null;
  
  const getMilestoneEmoji = (days: number) => {
    if (days >= 100) return '🏆';
    if (days >= 30) return '🌟';
    if (days >= 7) return '⭐';
    return '✨';
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="text-4xl">
          {getMilestoneEmoji(metadata.streak_days || 1)}
        </div>
        <div>
          <h3 className="font-semibold text-lg">{metadata.practice_name || 'Practice'}</h3>
          <p className="text-sm text-muted-foreground">
            {metadata.streak_days || 1}-day streak!
          </p>
        </div>
      </div>

      {metadata.achievement_message && (
        <p className="text-sm leading-relaxed">{metadata.achievement_message}</p>
      )}

      {metadata.user_note && (
        <blockquote className="border-l-2 border-primary pl-3 text-sm italic text-muted-foreground">
          {metadata.user_note}
        </blockquote>
      )}
    </div>
  );
}
