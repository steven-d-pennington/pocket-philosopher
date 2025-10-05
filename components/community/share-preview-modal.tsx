'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useCommunityStore } from '@/lib/stores/community-store';
import { Loader2, Check } from 'lucide-react';

export function SharePreviewModal() {
  const { 
    shareModalOpen, 
    shareModalData, 
    closeShareModal, 
    sharePost 
  } = useCommunityStore();

  const [isSharing, setIsSharing] = useState(false);
  const [customMessage, setCustomMessage] = useState('');
  const [shared, setShared] = useState(false);

  if (!shareModalData) return null;

  const handleShare = async () => {
    if (isSharing || !shareModalData) return;

    setIsSharing(true);
    try {
      // Get formatted content from source data
      const formatted = shareModalData.previewData;
      if (!formatted) {
        throw new Error('No preview data available');
      }

      await sharePost({
        content_type: formatted.content_type,
        source_id: formatted.source_id,
        source_table: formatted.source_table,
        content_text: formatted.content_text,
        content_metadata: formatted.content_metadata,
        share_method: formatted.share_method,
      });
      
      setShared(true);
      
      // Auto-close after success
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (error) {
      console.error('Failed to share:', error);
    } finally {
      setIsSharing(false);
    }
  };

  const getContentTypeLabel = (type: string): string => {
    switch (type) {
      case 'reflection':
        return 'Reflection';
      case 'chat':
      case 'chat_excerpt':
      case 'chat_summary':
        return 'Conversation';
      case 'practice':
      case 'practice_achievement':
        return 'Achievement';
      default:
        return 'Post';
    }
  };

  const handleClose = () => {
    setCustomMessage('');
    setShared(false);
    closeShareModal();
  };

  return (
    <Dialog open={shareModalOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Share to Community</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Content Type Badge */}
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {getContentTypeLabel(shareModalData.type)}
            </Badge>
            {shareModalData.previewData?.virtue && (
              <Badge variant="outline">{shareModalData.previewData.virtue}</Badge>
            )}
          </div>

          {/* Preview */}
          <div className="border rounded-lg p-4 bg-muted/50">
            <p className="text-sm whitespace-pre-wrap">
              {shareModalData.previewData?.content_text || 'No preview available'}
            </p>
          </div>

          {/* Custom Message */}
          <div className="space-y-2">
            <label htmlFor="custom-message" className="text-sm font-medium">
              Add a personal note (optional)
            </label>
            <Textarea
              id="custom-message"
              placeholder="Share your thoughts about this..."
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              rows={3}
              maxLength={500}
              disabled={isSharing || shared}
            />
            <p className="text-xs text-muted-foreground text-right">
              {customMessage.length}/500
            </p>
          </div>

          {/* Privacy Notice */}
          <div className="text-xs text-muted-foreground border-l-2 border-primary pl-3">
            <p className="font-medium mb-1">Privacy Notice:</p>
            <p>
              Your post will be shared pseudonymously.
              Personal details are never included.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSharing || shared}
          >
            Cancel
          </Button>
          <Button
            onClick={handleShare}
            disabled={isSharing || shared}
          >
            {shared ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Shared!
              </>
            ) : isSharing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sharing...
              </>
            ) : (
              'Share to Community'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
