/**
 * AI Model Types for ExamIO
 *
 * Available AI models that can be selected when generating content:
 * - gemini: Google Gemini AI with automatic key/model rotation to avoid rate limits
 * - fayedark: KMA AI using Ollama local LLM for on-premise processing
 */

export type AIModelType = "gemini" | "fayedark";

export interface AIModel {
  id: AIModelType;
  name: string;
  description: string;
  icon: string;
  badge?: string;
  disabled: boolean;
}

/**
 * Available AI models configuration
 */
export const AI_MODELS: AIModel[] = [
  {
    id: "fayedark",
    name: "KMA AI",
    description: "Ollama Local - Bảo mật cao",
    icon: "🌙",
    badge: "Recommended",
    disabled: false,
  },
  {
    id: "gemini",
    name: "Gemini AI",
    description: "Google Gemini - Nhanh và chính xác",
    icon: "✨",
    disabled: false,
  },
];

/**
 * Default AI model
 */
export const DEFAULT_AI_MODEL: AIModelType = "fayedark";
