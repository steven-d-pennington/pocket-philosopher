import { CoachCitation } from "@/lib/ai/types";
import { ExternalLink, BookOpen, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface CitationListProps {
  citations: CoachCitation[];
  compact?: boolean;
}

interface CitationListProps {
  citations: CoachCitation[];
  compact?: boolean;
}

export function CitationList({ citations, compact = false }: CitationListProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!citations || citations.length === 0) return null;

  const displayCount = isExpanded ? citations.length : Math.min(2, citations.length);
  const hasMore = citations.length > 2;

  return (
    <div className="mt-4 space-y-2">
      <button
        onClick={() => hasMore && setIsExpanded(!isExpanded)}
        className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground transition-colors hover:text-foreground ${
          hasMore ? 'cursor-pointer' : ''
        }`}
        disabled={!hasMore}
      >
        <BookOpen className="h-3.5 w-3.5" />
        Sources ({citations.length})
        {hasMore && (
          isExpanded ? (
            <ChevronUp className="h-3 w-3 ml-1" />
          ) : (
            <ChevronDown className="h-3 w-3 ml-1" />
          )
        )}
      </button>

      <div className="space-y-2">
        {citations.slice(0, displayCount).map((citation, index) => (
          <CitationItem
            key={citation.id}
            citation={citation}
            index={index + 1}
            compact={compact}
          />
        ))}
        {hasMore && !isExpanded && (
          <button
            onClick={() => setIsExpanded(true)}
            className="w-full rounded-lg border border-dashed border-border/50 bg-muted/20 p-3 text-center text-xs text-muted-foreground transition-colors hover:bg-muted/30 hover:text-foreground"
          >
            Show {citations.length - 2} more sources
          </button>
        )}
      </div>
    </div>
  );
}

interface CitationItemProps {
  citation: CoachCitation;
  index: number;
  compact: boolean;
}

function CitationItem({ citation, index, compact }: CitationItemProps) {
  const hasLink = citation.url && citation.url.trim() !== "";

  return (
    <div className="group relative rounded-lg border border-border/50 bg-card/30 p-3 transition-colors hover:bg-card/50 active:bg-card/70 touch-manipulation">
      {hasLink ? (
        <a
          href={citation.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-md"
          aria-label={`Read ${citation.title} - opens in new tab`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                  {index}
                </span>
                <h4 className="font-medium text-sm text-foreground line-clamp-2 sm:line-clamp-1">
                  {citation.title}
                </h4>
              </div>

              {citation.reference && (
                <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                  {citation.reference}
                </p>
              )}

              {!compact && citation.url && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <ExternalLink className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{citation.url}</span>
                </div>
              )}
            </div>

            <div className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
              <ExternalLink className="h-4 w-4" />
            </div>
          </div>
        </a>
      ) : (
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                {index}
              </span>
              <h4 className="font-medium text-sm text-foreground line-clamp-2 sm:line-clamp-1">
                {citation.title}
              </h4>
            </div>

            {citation.reference && (
              <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                {citation.reference}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}