'use client';

import { useState, useCallback, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCommunityStore } from '@/lib/stores/community-store';
import { validateDisplayName } from '@/lib/community/validators';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { debounce } from '@/lib/utils';

interface CommunityOnboardingModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function CommunityOnboardingModal(props: CommunityOnboardingModalProps = {}) {
  const { isOpen: controlledIsOpen, onClose: controlledOnClose } = props;
  const { enableCommunity, isEnabled } = useCommunityStore();
  
  // Internal state for uncontrolled usage
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  
  // Use controlled state if provided, otherwise use internal state
  const isOpen = controlledIsOpen ?? internalIsOpen;
  const onClose = controlledOnClose ?? (() => setInternalIsOpen(false));
  
  const [displayName, setDisplayName] = useState('');
  const [validation, setValidation] = useState<{
    valid: boolean;
    message?: string;
    checking?: boolean;
  }>({ valid: false });
  const [isEnabling, setIsEnabling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Validate display name format
  const validateFormat = (name: string): { valid: boolean; message?: string } => {
    if (!name.trim()) {
      return { valid: false, message: 'Display name is required' };
    }
    
    const validation = validateDisplayName(name);
    if (!validation.isValid) {
      return { valid: false, message: validation.error };
    }
    
    return { valid: true };
  };

  // Check if display name is unique (debounced)
  const checkUniqueness = useCallback(
    debounce(async (name: string) => {
      if (!name.trim()) {
        return;
      }

      const formatValidation = validateFormat(name);
      if (!formatValidation.valid) {
        setValidation({ valid: false, message: formatValidation.message });
        return;
      }

      setValidation({ valid: false, checking: true });

      try {
        const response = await fetch(`/api/community/opt-in?check=${encodeURIComponent(name)}`);
        const data = await response.json();

        if (data.available) {
          setValidation({ valid: true, message: 'Display name available!' });
        } else {
          setValidation({ valid: false, message: 'Display name already taken' });
        }
      } catch (err) {
        console.error('Failed to check display name:', err);
        setValidation({ valid: false, message: 'Failed to verify availability' });
      }
    }, 500),
    []
  );

  // Handle display name change
  const handleDisplayNameChange = (value: string) => {
    setDisplayName(value);
    setError(null);
    
    if (!value.trim()) {
      setValidation({ valid: false });
      return;
    }

    checkUniqueness(value);
  };

  // Handle enabling community
  const handleEnableCommunity = async () => {
    if (!validation.valid || isEnabling) {
      return;
    }

    setIsEnabling(true);
    setError(null);

    try {
      await enableCommunity(displayName.trim());
      onClose();
    } catch (err) {
      console.error('Failed to enable community:', err);
      setError(err instanceof Error ? err.message : 'Failed to enable community. Please try again.');
    } finally {
      setIsEnabling(false);
    }
  };

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setDisplayName('');
      setValidation({ valid: false });
      setError(null);
      setIsEnabling(false);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Join the Pocket Philosopher Community</DialogTitle>
          <DialogDescription>
            Share your journey and discover wisdom from fellow practitioners
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Guidelines Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Community Guidelines</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>
                  <strong className="text-foreground">Pseudonymous Identity:</strong> Choose a display name that represents you without revealing personal information
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>
                  <strong className="text-foreground">What You Can Share:</strong> Reflections, coach conversations, and practice achievements
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>
                  <strong className="text-foreground">Privacy First:</strong> You control what you share. Nothing is shared automatically.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>
                  <strong className="text-foreground">Respectful Discourse:</strong> Engage with compassion and philosophical curiosity
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>
                  <strong className="text-foreground">Report Concerns:</strong> Help keep the community safe by reporting inappropriate content
                </span>
              </li>
            </ul>
          </div>

          {/* Display Name Input */}
          <div className="space-y-2">
            <Label htmlFor="display-name">Choose Your Display Name</Label>
            <div className="relative">
              <Input
                id="display-name"
                type="text"
                placeholder="e.g., WiseWanderer, StoicSeeker..."
                value={displayName}
                onChange={(e) => handleDisplayNameChange(e.target.value)}
                className="pr-10"
                aria-describedby="display-name-help"
                aria-invalid={validation.valid === false && displayName.length > 0}
                disabled={isEnabling}
                maxLength={50}
              />
              
              {/* Validation Icon */}
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {validation.checking && (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                )}
                {!validation.checking && validation.valid && (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                )}
                {!validation.checking && validation.message && !validation.valid && (
                  <AlertCircle className="h-4 w-4 text-destructive" />
                )}
              </div>
            </div>

            {/* Validation Message */}
            {validation.message && (
              <p
                id="display-name-help"
                className={`text-sm ${
                  validation.valid ? 'text-green-600' : 'text-destructive'
                }`}
              >
                {validation.message}
              </p>
            )}
            
            {/* Character Count */}
            <p className="text-xs text-muted-foreground">
              {displayName.length}/50 characters • 3 minimum
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isEnabling}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEnableCommunity}
              disabled={!validation.valid || isEnabling}
            >
              {isEnabling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enabling...
                </>
              ) : (
                'Join Community'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
