"use client";

import * as React from "react";
import { AIModel, AIModelType, DEFAULT_AI_MODEL } from "@/types/ai";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Brain, Cloud, Cpu, Sparkles } from "lucide-react";
import { useAIModelCatalogStore } from "@/stores/useAIModelCatalogStore";

interface ModelSelectorProps {
  value?: AIModelType;
  onChange?: (value: AIModelType) => void;
  disabled?: boolean;
  className?: string;
  size?: "sm" | "default";
  /** Models to disable with custom tooltip messages */
  disabledModels?: Partial<Record<AIModelType, string>>;
  models?: AIModel[];
}

const MODEL_ICONS: Record<string, typeof Sparkles> = {
  qwen3_8b: Cpu,
  qwen3_32b: Brain,
  gemini: Sparkles,
  glm4_9b: Cpu,
  gemma2_9b: Cpu,
};

const PROVIDER_LABELS: Record<string, string> = {
  gemini: "Google",
  ollama: "Ollama",
};

const EMPTY_DISABLED_MODELS: Partial<Record<AIModelType, string>> = {};

/**
 * AI Model Selector Component
 *
 * Allows users to select between available AI models:
 * - Gemini AI: Fast and accurate cloud-based AI
 * - KMA AI: Local Ollama-based AI for privacy
 */
export function ModelSelector({
  value = DEFAULT_AI_MODEL,
  onChange,
  disabled = false,
  className,
  size = "default",
  disabledModels = EMPTY_DISABLED_MODELS,
  models,
}: ModelSelectorProps) {
  const generationModels = useAIModelCatalogStore((state) => state.generationModels);
  const fetchModels = useAIModelCatalogStore((state) => state.fetchModels);
  const availableModels = React.useMemo(
    () => (models && models.length > 0 ? models : generationModels),
    [generationModels, models],
  );

  React.useEffect(() => {
    if (availableModels.length === 0) {
      void fetchModels();
    }
  }, [availableModels.length, fetchModels]);

  const selectedModel =
    availableModels.find((m) => m.id === value)
    || availableModels.find((m) => m.isDefault)
    || availableModels[0];
  const IconComponent = MODEL_ICONS[value || "gemini"] || (selectedModel?.provider === "gemini" ? Cloud : Cpu);

  if (!selectedModel) {
    return null;
  }

  return (
    <div className={cn("flex min-w-0 items-center gap-2", className)}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex min-w-0 items-center">
            <Select
              value={value}
              onValueChange={(val) => onChange?.(val as AIModelType)}
              disabled={disabled}
            >
              <SelectTrigger
                size={size}
                className={cn(
                  "min-w-[200px] gap-2",
                  size === "sm" && "min-w-[140px] text-xs",
                )}
              >
                <SelectValue>
                  <div className="flex min-w-0 items-center gap-2">
                    <IconComponent
                      className={cn(
                        "size-4",
                        selectedModel.provider === "gemini" && "text-primary",
                        selectedModel.provider === "ollama" && "text-secondary",
                      )}
                    />
                    <div className="flex min-w-0 flex-col items-start leading-tight">
                      <span className="truncate font-medium">{selectedModel.name}</span>
                      <span className="truncate text-[11px] text-muted-foreground">
                        {PROVIDER_LABELS[selectedModel.provider] || selectedModel.provider}
                        {selectedModel.specs?.[0]?.value ? ` • ${selectedModel.specs[0].value}` : ""}
                      </span>
                    </div>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {availableModels.map((model) => {
                  const Icon = MODEL_ICONS[model.id] || Sparkles;
                  const isModelDisabled = model.disabled;
                  const disabledTooltip =
                    disabledModels[model.id]
                    || model.availabilityReason
                    || (model.available === false
                      ? "Model hiện tại không khả dụng, thử model khác."
                      : undefined);

                  const itemContent = (
                    <div className="flex items-center gap-3 py-1">
                      <Icon
                        className={cn(
                          "size-4",
                          model.provider === "gemini" && "text-primary",
                          model.provider === "ollama" && "text-secondary",
                          isModelDisabled && "opacity-50",
                        )}
                      />
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "font-medium",
                              isModelDisabled && "opacity-50",
                            )}
                          >
                            {model.name}
                          </span>
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            {PROVIDER_LABELS[model.provider] || model.provider}
                          </Badge>
                          {model.badge && !isModelDisabled && (
                            <Badge
                              variant="secondary"
                              className="text-[10px] px-1.5 py-0"
                            >
                              {model.badge}
                            </Badge>
                          )}
                          {isModelDisabled && (
                            <Badge
                              variant="outline"
                              className="text-[10px] px-1.5 py-0 opacity-60"
                            >
                              Khong kha dung
                            </Badge>
                          )}
                        </div>
                        <span
                          className={cn(
                            "text-xs text-muted-foreground",
                            isModelDisabled && "opacity-50",
                          )}
                        >
                          {model.description}
                        </span>
                        {model.specs?.length > 0 && (
                          <span className="text-[11px] text-muted-foreground">
                            {model.specs.map((spec) => spec.value).join(" • ")}
                          </span>
                        )}
                      </div>
                    </div>
                  );

                  if (isModelDisabled && disabledTooltip) {
                    return (
                      <Tooltip key={model.id}>
                        <TooltipTrigger asChild>
                          <div>
                            <SelectItem
                              value={model.id}
                              disabled={true}
                              className="cursor-not-allowed"
                            >
                              {itemContent}
                            </SelectItem>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          <p className="text-xs">{disabledTooltip}</p>
                        </TooltipContent>
                      </Tooltip>
                    );
                  }

                  return (
                    <SelectItem
                      key={model.id}
                      value={model.id}
                      disabled={isModelDisabled}
                    >
                      {itemContent}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-[280px]">
          <div className="space-y-1 text-xs">
            <p>
              <strong>{selectedModel.name}</strong>: {selectedModel.description}
            </p>
            <p className="text-muted-foreground">
              Provider: {PROVIDER_LABELS[selectedModel.provider] || selectedModel.provider}
            </p>
            {selectedModel.specs?.length > 0 && (
              <p className="text-muted-foreground">
                {selectedModel.specs.map((spec) => `${spec.label}: ${spec.value}`).join(" • ")}
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

export default ModelSelector;
