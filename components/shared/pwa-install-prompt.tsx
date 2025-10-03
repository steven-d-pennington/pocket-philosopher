"use client";

import { useEffect, useState } from "react";
import { X, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/**
 * PWA Install Prompt Component
 *
 * Shows a banner prompting users to install the app when:
 * - The app is installable (beforeinstallprompt event fires)
 * - User hasn't dismissed it in this session
 * - App is not already installed (standalone mode)
 */
export function PWAInstallPrompt() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Check if already installed
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
    if (isStandalone) {
      return;
    }

    // Check if user previously dismissed
    const dismissed = sessionStorage.getItem("pwa-install-dismissed");
    if (dismissed) {
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;

    try {
      await installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;

      if (outcome === "accepted") {
        console.log("PWA installed");
      } else {
        console.log("PWA installation dismissed");
      }

      setShowPrompt(false);
      setInstallPrompt(null);
    } catch (error) {
      console.error("Error installing PWA:", error);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    sessionStorage.setItem("pwa-install-dismissed", "true");
  };

  if (!showPrompt || !installPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-2xl backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
        
        <div className="relative p-4">
          <button
            onClick={handleDismiss}
            className="absolute right-2 top-2 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Dismiss install prompt"
          >
            <X className="size-4" />
          </button>

          <div className="pr-8">
            <div className="mb-2 flex items-center gap-2">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                <Download className="size-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Install Pocket Philosopher</h3>
              </div>
            </div>

            <p className="mb-4 text-sm text-muted-foreground">
              Get quick access to your daily practices, reflections, and philosophical coaching. Works offline!
            </p>

            <div className="flex gap-2">
              <Button onClick={handleInstall} size="sm" className="flex-1 touch-manipulation">
                Install App
              </Button>
              <Button onClick={handleDismiss} variant="ghost" size="sm" className="touch-manipulation">
                Not now
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
