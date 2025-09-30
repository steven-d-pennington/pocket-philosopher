import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

interface StreamingIndicatorProps {
  isStreaming: boolean;
  tokens?: number;
}

export function StreamingIndicator({ isStreaming, tokens }: StreamingIndicatorProps) {
  const [dots, setDots] = useState("");

  useEffect(() => {
    if (!isStreaming) {
      setDots("");
      return;
    }

    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? "" : prev + ".");
    }, 500);

    return () => clearInterval(interval);
  }, [isStreaming]);

  if (!isStreaming) {
    return (
      <span className="text-xs text-muted-foreground">
        {tokens ? `${tokens} tokens used` : "Ready"}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2 text-xs text-primary">
      <div className="relative">
        <Sparkles className="size-3 animate-pulse text-primary" />
        <div className="absolute inset-0 animate-ping">
          <Sparkles className="size-3 text-primary/30" />
        </div>
      </div>
      <span className="font-medium">
        Thinking{dots}
      </span>
    </div>
  );
}