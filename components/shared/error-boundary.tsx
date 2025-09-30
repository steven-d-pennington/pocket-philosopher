"use client";

import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
}

export class CoachErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error to analytics if available
    const posthog = (window as Window & { posthog?: { capture: (event: string, data: Record<string, unknown>) => void } }).posthog;
    if (typeof window !== "undefined" && posthog) {
      posthog.capture("error_boundary_caught", {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: Date.now(),
      });
    }

    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("Error Boundary caught an error:", error, errorInfo);
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error!} resetError={this.resetError} />;
      }

      return <DefaultErrorFallback error={this.state.error!} resetError={this.resetError} />;
    }

    return this.props.children;
  }
}

function DefaultErrorFallback({ error, resetError }: { error: Error; resetError: () => void }) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-3xl border border-destructive/20 bg-destructive/5 p-8 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle className="h-6 w-6 text-destructive" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-foreground">Something went wrong</h3>
      <p className="mb-4 max-w-md text-sm text-muted-foreground">
        We encountered an unexpected error while processing your request. This has been logged and we&apos;ll look into it.
      </p>
      {process.env.NODE_ENV === "development" && (
        <details className="mb-4 max-w-md text-left">
          <summary className="cursor-pointer text-sm font-medium text-destructive">
            Error Details (Development)
          </summary>
          <pre className="mt-2 whitespace-pre-wrap text-xs text-muted-foreground">
            {error.message}
            {error.stack}
          </pre>
        </details>
      )}
      <Button onClick={resetError} variant="outline" className="gap-2">
        <RefreshCw className="h-4 w-4" />
        Try Again
      </Button>
    </div>
  );
}