/**
 * AI Model Types for ExamIO
 *
 * Available AI models that can be selected when generating content:
 * - gemini: Google Gemini AI with automatic key/model rotation to avoid rate limits
 * - fayedark: FayeDark AI using Ollama local LLM for on-premise processing
 */

export type AIModelType = "gemini" | "fayedark";

export interface AIModel {
  id: AIModelType;
  name: string;
  description: string;
  icon: string;
  badge?: string;
  disabled?: boolean;
}

/**
 * Available AI models configuration
 */
export const AI_MODELS: AIModel[] = [
  {
    id: "gemini",
    name: "Gemini AI",
    description: "Google Gemini - Nhanh và chính xác",
    icon: "✨",
    badge: "Recommended",
  },
  {
    id: "fayedark",
    name: "FayeDark AI",
    description: "Ollama Local - Bảo mật cao",
    icon: "🌙",
  },
];

/**
 * Default AI model
 */
export const DEFAULT_AI_MODEL: AIModelType = "gemini";
