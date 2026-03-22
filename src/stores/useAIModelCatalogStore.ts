import { create } from "zustand";
import { aiApi } from "@/apis/aiApi";
import {
  AIModel,
  AIModelCatalog,
  AIModelType,
  DEFAULT_AI_MODEL,
} from "@/types/ai";

interface AIModelCatalogState {
  catalog: AIModelCatalog | null;
  generationModels: AIModel[];
  defaultModel: AIModelType;
  isLoading: boolean;
  fetchModels: (forceRefresh?: boolean) => Promise<AIModelCatalog>;
  getModelById: (modelId?: string | null) => AIModel | undefined;
}

let catalogPromise: Promise<AIModelCatalog> | null = null;

export const useAIModelCatalogStore = create<AIModelCatalogState>((set, get) => ({
  catalog: null,
  generationModels: [],
  defaultModel: DEFAULT_AI_MODEL,
  isLoading: false,

  fetchModels: async (forceRefresh = false) => {
    const currentCatalog = get().catalog;
    if (currentCatalog && !forceRefresh) {
      return currentCatalog;
    }

    if (!catalogPromise || forceRefresh) {
      set({ isLoading: true });
      catalogPromise = aiApi.getModels().finally(() => {
        set({ isLoading: false });
      });
    }

    const catalog = await catalogPromise;
    set({
      catalog,
      generationModels: catalog.generationModels,
      defaultModel: catalog.defaultGenerationModel || DEFAULT_AI_MODEL,
    });
    return catalog;
  },

  getModelById: (modelId) => {
    if (!modelId) {
      return get().generationModels.find((model) => model.id === get().defaultModel);
    }
    return get().generationModels.find((model) => model.id === modelId);
  },
}));
