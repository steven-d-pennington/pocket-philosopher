"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useCommunityStore } from "@/lib/stores/community-store";
import { CommunityOnboardingModal } from "@/components/community";
import { usePersonaTheme } from "@/lib/hooks/use-persona-theme";
import { Users, CheckCircle2, AlertCircle } from "lucide-react";

export function CommunitySettings() {
  const { isEnabled, displayName } = useCommunityStore();
  const { theme } = usePersonaTheme();
  const [showOnboarding, setShowOnboarding] = useState(false);

  return (
    <>
      <section className="persona-card p-6 shadow-philosophy">
        <header className="space-y-1">
          <p className="text-xs uppercase tracking-[0.32em] text-muted-foreground">Community</p>
          <h2 className="text-2xl font-semibold font-serif flex items-center gap-2">
            <span className="persona-accent text-lg">{theme.decorative.divider}</span>
            Community features
          </h2>
        </header>

        <div className="mt-6 space-y-6">
          {/* Status */}
          <div className="flex items-start gap-4 rounded-2xl border persona-card bg-muted/20 p-4">
            <div className="flex-shrink-0 mt-0.5">
              {isEnabled ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Label className="font-serif text-base">Community Status</Label>
                <Badge variant={isEnabled ? "default" : "secondary"}>
                  {isEnabled ? "Enabled" : "Disabled"}
                </Badge>
              </div>
              {isEnabled && displayName && (
                <p className="text-sm text-muted-foreground mb-2">
                  Display name: <span className="font-medium text-foreground">{displayName}</span>
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                {isEnabled
                  ? "You can share your reflections, coach conversations, and practice achievements with the community."
                  : "Enable community features to share wisdom and discover insights from fellow practitioners."}
              </p>
            </div>
          </div>

          {/* Features Overview */}
          <div className="space-y-3">
            <Label className="font-serif">What you can do with Community:</Label>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <Users className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                <span>
                  <strong className="text-foreground">Share selectively:</strong> Choose what reflections,
                  conversations, or achievements to share
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Users className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                <span>
                  <strong className="text-foreground">Discover wisdom:</strong> Browse insights from practitioners
                  aligned with your virtue focus
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Users className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                <span>
                  <strong className="text-foreground">Pseudonymous identity:</strong> Share under a display name to
                  protect your privacy
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Users className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                <span>
                  <strong className="text-foreground">React and engage:</strong> Show appreciation for posts that
                  resonate with you
                </span>
              </li>
            </ul>
          </div>

          {/* Action Button */}
          <div className="pt-2">
            {!isEnabled ? (
              <Button onClick={() => setShowOnboarding(true)} className="gap-2">
                <Users className="h-4 w-4" />
                Enable Community
              </Button>
            ) : (
              <div className="flex gap-3">
                <Button variant="outline" asChild>
                  <a href="/community">View Community Feed</a>
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    // TODO: Implement disable community
                    console.log("Disable community");
                  }}
                  className="text-muted-foreground"
                >
                  Disable Community
                </Button>
              </div>
            )}
          </div>

          {/* Privacy Notice */}
          <div className="text-xs text-muted-foreground border-l-2 border-primary pl-3 py-1">
            <p className="font-medium mb-1">Privacy & Safety:</p>
            <p>
              Nothing is shared automatically. You control what you post. All shared content is pseudonymous and you
              can unshare posts at any time. We have moderation tools to keep the community safe and respectful.
            </p>
          </div>
        </div>
      </section>

      {/* Onboarding Modal */}
      <CommunityOnboardingModal isOpen={showOnboarding} onClose={() => setShowOnboarding(false)} />
    </>
  );
}
