"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useModels } from "@/lib/hooks/use-models";
import { useProfile, useUpdateProfileMutation } from "@/lib/hooks/use-profile";
import { usePersonaTheme } from "@/lib/hooks/use-persona-theme";

interface AIModel {
  id: string;
  provider: string;
  provider_model_id: string;
  display_name: string;
  description: string | null;
  enabled: boolean;
  tier: 'free' | 'premium';
  price_cents: number | null;
  stripe_product_id: string | null;
  stripe_price_id: string | null;
  metadata: Record<string, any> | null;
  rate_limit_messages_per_day: number | null;
  trial_messages_allowed: number | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
  purchased?: boolean;
  usageToday?: {
    used: number;
    limit: number;
  };
  trialMessagesRemaining?: number;
}

interface ModelsData {
  free: AIModel[];
  premium: AIModel[];
  userPreferences: {
    defaultModelId: string;
    personaOverrides: Record<string, string>;
  };
}

interface ModelPreferencesFormValues {
  defaultModelId: string;
  personaOverrides: Record<string, string>;
}

const personaOptions = [
  { id: "marcus", name: "Marcus Aurelius", tradition: "Stoicism" },
  { id: "epictetus", name: "Epictetus", tradition: "Stoicism" },
  { id: "lao", name: "Laozi", tradition: "Taoism" },
  { id: "simone", name: "Simone de Beauvoir", tradition: "Existentialism" },
  { id: "aristotle", name: "Aristotle", tradition: "Virtue Ethics" },
  { id: "plato", name: "Plato", tradition: "Classical Philosophy" },
];

export function ModelPreferences() {
  const { data: models, isLoading: modelsLoading } = useModels();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const mutation = useUpdateProfileMutation();
  const { theme } = usePersonaTheme();

  const [personaOverrides, setPersonaOverrides] = useState<Record<string, string>>({});

  const form = useForm<ModelPreferencesFormValues>({
    defaultValues: {
      defaultModelId: "",
      personaOverrides: {},
    },
  });

  useEffect(() => {
    if (!profile) return;
    const defaults = {
      defaultModelId: profile.default_model_id || "",
      personaOverrides: profile.persona_model_overrides || {},
    };
    form.reset(defaults);
    setPersonaOverrides(defaults.personaOverrides);
  }, [profile, form]);

  const onSubmit = form.handleSubmit((values) => {
    mutation.mutate({
      default_model_id: values.defaultModelId,
      persona_model_overrides: values.personaOverrides,
    }, {
      onSuccess: () => toast.success("Model preferences saved"),
      onError: (error) => toast.error(error instanceof Error ? error.message : "Unable to save preferences"),
    });
  });

  const handlePersonaOverride = (personaId: string, modelId: string) => {
    const newOverrides = { ...personaOverrides };
    if (modelId === "default") {
      delete newOverrides[personaId];
    } else {
      newOverrides[personaId] = modelId;
    }
    setPersonaOverrides(newOverrides);
    form.setValue("personaOverrides", newOverrides);
  };

  if (modelsLoading || profileLoading) {
    return (
      <section className="persona-card p-6 shadow-philosophy">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-muted rounded w-1/4"></div>
          <div className="h-8 bg-muted rounded w-1/2"></div>
          <div className="h-32 bg-muted rounded"></div>
        </div>
      </section>
    );
  }

  const freeModels = models?.free || [];
  const premiumModels = models?.premium || [];
  const allModels = [...freeModels, ...premiumModels];

  return (
    <section className="persona-card p-6 shadow-philosophy">
      <header className="space-y-1">
        <p className="text-xs uppercase tracking-[0.32em] text-muted-foreground">AI Configuration</p>
        <h2 className="text-2xl font-semibold font-serif flex items-center gap-2">
          <span className="persona-accent text-lg">{theme.decorative.divider}</span>
          Model preferences
        </h2>
        <p className="text-sm text-muted-foreground">
          Choose your preferred AI models for coaching conversations. Free models are available to all users.
        </p>
      </header>

      <form className="mt-6 space-y-6" onSubmit={onSubmit}>
        {/* Default Model Selection */}
        <div className="space-y-3">
          <Label htmlFor="defaultModelId" className="text-base font-medium">
            Default AI Model
          </Label>
          <Select
            value={form.watch("defaultModelId")}
            onValueChange={(value) => form.setValue("defaultModelId", value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a default model" />
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
          <p className="text-xs text-muted-foreground">
            This model will be used for all coaching conversations unless overridden for specific philosophers.
          </p>
        </div>

        {/* Persona-Specific Overrides */}
        <div className="space-y-4">
          <div>
            <Label className="text-base font-medium">Persona-Specific Models</Label>
            <p className="text-sm text-muted-foreground mt-1">
              Override the default model for specific philosophical coaches.
            </p>
          </div>

          <div className="grid gap-4">
            {personaOptions.map((persona) => (
              <Card key={persona.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{persona.name}</h4>
                    <p className="text-sm text-muted-foreground">{persona.tradition}</p>
                  </div>
                  <div className="w-48">
                    <Select
                      value={personaOverrides[persona.id] || "default"}
                      onValueChange={(value) => handlePersonaOverride(persona.id, value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Use default" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Use default</SelectItem>
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
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Model Information */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Free Models</CardTitle>
              <CardDescription>Available to all users</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {freeModels.map((model) => (
                <div key={model.id} className="flex items-center justify-between text-sm">
                  <span>{model.display_name}</span>
                  <Badge variant="outline">Free</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Premium Models</CardTitle>
              <CardDescription>Enhanced capabilities</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {premiumModels.map((model) => (
                <div key={model.id} className="flex items-center justify-between text-sm">
                  <span>{model.display_name}</span>
                  <Badge variant={model.purchased ? "default" : "secondary"}>
                    {model.purchased ? 'Purchased' : 'Premium'}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Saving…" : "Save preferences"}
        </Button>
      </form>
    </section>
  );
}