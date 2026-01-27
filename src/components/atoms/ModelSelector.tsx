"use client";

import * as React from "react";
import { AIModelType, AI_MODELS, DEFAULT_AI_MODEL } from "@/types/ai";
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
import { Sparkles, Moon } from "lucide-react";

interface ModelSelectorProps {
  value?: AIModelType;
  onChange?: (value: AIModelType) => void;
  disabled?: boolean;
  className?: string;
  size?: "sm" | "default";
  /** Models to disable with custom tooltip messages */
  disabledModels?: Partial<Record<AIModelType, string>>;
}

const MODEL_ICONS = {
  gemini: Sparkles,
  fayedark: Moon,
};

const EMPTY_DISABLED_MODELS: Partial<Record<AIModelType, string>> = {};

/**
 * AI Model Selector Component
 *
 * Allows users to select between available AI models:
 * - Gemini AI: Fast and accurate cloud-based AI
 * - FayeDark AI: Local Ollama-based AI for privacy
 */
export function ModelSelector({
  value = DEFAULT_AI_MODEL,
  onChange,
  disabled = false,
  className,
  size = "default",
  disabledModels = EMPTY_DISABLED_MODELS,
}: ModelSelectorProps) {
  const selectedModel = AI_MODELS.find((m) => m.id === value) || AI_MODELS[0];
  const IconComponent = MODEL_ICONS[value] || Sparkles;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center">
            <Select
              value={value}
              onValueChange={(val) => onChange?.(val as AIModelType)}
              disabled={disabled}
            >
              <SelectTrigger
                size={size}
                className={cn(
                  "min-w-[160px] gap-2",
                  size === "sm" && "min-w-[140px] text-xs",
                )}
              >
                <SelectValue>
                  <div className="flex items-center gap-2">
                    <IconComponent
                      className={cn(
                        "size-4",
                        value === "gemini" && "text-blue-500",
                        value === "fayedark" && "text-purple-500",
                      )}
                    />
                    <span>{selectedModel.name}</span>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {AI_MODELS.map((model) => {
                  const Icon = MODEL_ICONS[model.id] || Sparkles;
                  const isModelDisabled = false;
                  const disabledTooltip = disabledModels[model.id];

                  const itemContent = (
                    <div className="flex items-center gap-3 py-1">
                      <Icon
                        className={cn(
                          "size-4",
                          model.id === "gemini" && "text-blue-500",
                          model.id === "fayedark" && "text-purple-500",
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
                              Coming soon
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
        <TooltipContent side="bottom" className="max-w-[250px]">
          <p className="text-xs">
            <strong>{selectedModel.name}</strong>: {selectedModel.description}
          </p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

export default ModelSelector;
