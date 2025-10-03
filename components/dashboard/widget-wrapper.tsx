"use client";

import { EyeOff, Eye } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  useDashboardPreferences,
  selectDashboardActions,
  type WidgetKey,
} from "@/lib/stores/dashboard-preferences-store";

interface WidgetWrapperProps {
  widgetKey: WidgetKey;
  children: React.ReactNode;
}

export function WidgetWrapper({ widgetKey, children }: WidgetWrapperProps) {
  const actions = useDashboardPreferences(selectDashboardActions);
  const isVisible = useDashboardPreferences((state) => state.widgetVisibility[widgetKey]);

  const handleToggle = () => {
    actions.toggleWidget(widgetKey);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="relative group">
      <Button
        variant="ghost"
        size="icon"
        onClick={handleToggle}
        className="absolute top-2 right-2 z-10 size-8 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted/80"
        title="Hide this widget"
      >
        <EyeOff className="size-4" />
      </Button>
      {children}
    </div>
  );
}
