"use client";

import { useState } from "react";
import { Settings, ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useModels } from "@/lib/hooks/use-models";
import { useProfile } from "@/lib/hooks/use-profile";

interface ModelSelectorProps {
  personaId: string;
  currentModelId?: string;
  onModelChange?: (modelId: string) => void;
  compact?: boolean;
}

export function ModelSelector({ personaId, currentModelId, onModelChange, compact = false }: ModelSelectorProps) {
  const { data: models, isLoading } = useModels();
  const { data: profile } = useProfile();
  const [isOpen, setIsOpen] = useState(false);

  if (isLoading || !models) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-muted rounded w-32"></div>
      </div>
    );
  }

  // Determine the effective model for this persona
  const personaOverride = profile?.persona_model_overrides?.[personaId];
  const effectiveModelId = personaOverride || profile?.default_model_id || currentModelId || 'gpt-4o-mini';

  // Find the current model
  const allModels = [...models.free, ...models.premium];
  const currentModel = allModels.find(m => m.id === effectiveModelId) || allModels[0];

  const handleModelChange = (modelId: string) => {
    onModelChange?.(modelId);
    setIsOpen(false);
  };

  if (compact) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-2 text-xs">
            <Settings className="h-3 w-3" />
            {currentModel?.display_name || 'Select Model'}
            <ChevronDown className="h-3 w-3" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>AI Model Selection</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Choose AI Model</Label>
              <p className="text-xs text-muted-foreground mt-1">
                Select the AI model for this conversation
              </p>
            </div>
            <Select value={effectiveModelId} onValueChange={handleModelChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {allModels.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    <div className="flex items-center gap-2">
                      <span>{model.display_name}</span>
                      {model.tier === 'premium' && (
                        <Badge variant="secondary" className="text-xs">
                          {model.purchased ? 'Purchased' : 'Premium'}
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {currentModel && (
              <div className="text-xs text-muted-foreground space-y-1">
                <div className="flex justify-between">
                  <span>Provider:</span>
                  <span>{currentModel.provider}</span>
                </div>
                {currentModel.description && (
                  <div className="flex justify-between">
                    <span>Description:</span>
                    <span className="text-right">{currentModel.description}</span>
                  </div>
                )}
                {currentModel.tier === 'premium' && (
                  <div className="flex justify-between">
                    <span>Access:</span>
                    <span>{currentModel.purchased ? 'Purchased' : 'Trial Available'}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="model-select" className="text-sm font-medium">
        AI Model
      </Label>
      <Select value={effectiveModelId} onValueChange={handleModelChange}>
        <SelectTrigger id="model-select" className="w-full">
          <SelectValue placeholder="Select a model" />
        </SelectTrigger>
        <SelectContent>
          {allModels.map((model) => (
            <SelectItem key={model.id} value={model.id}>
              <div className="flex items-center gap-2">
                <span>{model.display_name}</span>
                {model.tier === 'premium' && (
                  <Badge variant="secondary" className="text-xs">
                    {model.purchased ? 'Purchased' : 'Premium'}
                  </Badge>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {personaOverride && (
        <p className="text-xs text-muted-foreground">
          Using persona-specific model override
        </p>
      )}
    </div>
  );
}