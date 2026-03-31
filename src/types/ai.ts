export type AIModelType = string;

export interface AIModelSpec {
  label: string;
  value: string;
}

export interface AIModel {
  id: AIModelType;
  name: string;
  description: string;
  provider: string;
  runtimeModelName: string;
  badge?: string | null;
  disabled: boolean;
  available?: boolean;
  availabilityReason?: string | null;
  isDefault: boolean;
  supportsStructuredOutput?: boolean;
  specs: AIModelSpec[];
}

export interface AIModelCatalog {
  embeddingModel: AIModel;
  generationModels: AIModel[];
  defaultGenerationModel: AIModelType;
}

export const DEFAULT_AI_MODEL: AIModelType = "qwen3_8b";

export const MODEL_UNAVAILABLE_MESSAGE =
  "Model hiện tại không khả dụng, thử model khác.";
