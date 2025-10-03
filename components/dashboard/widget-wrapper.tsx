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
  isEditMode?: boolean;
  isHidden?: boolean;
}

export function WidgetWrapper({ widgetKey, children, isEditMode = false, isHidden = false }: WidgetWrapperProps) {
  const actions = useDashboardPreferences(selectDashboardActions);
  const isVisible = useDashboardPreferences((state) => state.widgetVisibility[widgetKey]);

  const handleToggle = () => {
    actions.toggleWidget(widgetKey);
  };

  // In edit mode, show hidden widgets dimmed
  // In normal mode, don't render hidden widgets
  if (!isVisible && !isEditMode) {
    return null;
  }

  return (
    <div className={`relative group ${!isVisible && isEditMode ? "opacity-40" : ""}`}>
      {!isEditMode && (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleToggle}
          className="absolute top-2 right-2 z-10 size-8 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted/80"
          title="Hide this widget"
        >
          <EyeOff className="size-4" />
        </Button>
      )}
      {isEditMode && !isVisible && (
        <div className="absolute top-2 right-2 z-10 rounded-lg bg-muted/80 px-2 py-1 text-xs font-medium text-muted-foreground">
          Hidden
        </div>
      )}
      {isEditMode && (
        <div className="absolute inset-0 z-[5] cursor-default" onClick={(e) => e.preventDefault()} />
      )}
      {children}
    </div>
  );
}
