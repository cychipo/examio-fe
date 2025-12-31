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
}

const MODEL_ICONS = {
  gemini: Sparkles,
  fayedark: Moon,
};

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
              disabled={disabled}>
              <SelectTrigger
                size={size}
                className={cn(
                  "min-w-[160px] gap-2",
                  size === "sm" && "min-w-[140px] text-xs"
                )}>
                <SelectValue>
                  <div className="flex items-center gap-2">
                    <IconComponent
                      className={cn(
                        "size-4",
                        value === "gemini" && "text-blue-500",
                        value === "fayedark" && "text-purple-500"
                      )}
                    />
                    <span>{selectedModel.name}</span>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {AI_MODELS.map((model) => {
                  const Icon = MODEL_ICONS[model.id] || Sparkles;
                  return (
                    <SelectItem
                      key={model.id}
                      value={model.id}
                      disabled={model.disabled}>
                      <div className="flex items-center gap-3 py-1">
                        <Icon
                          className={cn(
                            "size-4",
                            model.id === "gemini" && "text-blue-500",
                            model.id === "fayedark" && "text-purple-500"
                          )}
                        />
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{model.name}</span>
                            {model.badge && (
                              <Badge
                                variant="secondary"
                                className="text-[10px] px-1.5 py-0">
                                {model.badge}
                              </Badge>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {model.description}
                          </span>
                        </div>
                      </div>
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
