import { api } from "@/apis/api";
import { getCachedValue, invalidateCachedKeys, invalidateCachedValue, setCachedValue } from "@/lib/genai-knowledge-cache";
import { GenAIKnowledgeDatasetCatalogItem, GenAIKnowledgeDatasetImportJob, GenAIKnowledgeGraphSnapshot } from "@/types/genai-knowledge";

const KNOWLEDGE_FOLDER_CACHE_KEY = "knowledge:folders";

function invalidateKnowledgeEntityCaches(folderId?: string) {
  invalidateCachedKeys([
    KNOWLEDGE_FOLDER_CACHE_KEY,
    `knowledge:stats:${folderId || "all"}`,
  ]);
  invalidateCachedValue("knowledge:folder-contents:");
}

export const genaiTutorKnowledgeApi = {
  createFolder: async (payload: {
    folderId?: string;
    name: string;
    description?: string;
    icon: string;
  }) => {
    const response = await api.post("/ai/tutor/knowledge-folders", payload);
    invalidateKnowledgeEntityCaches();
    return response.data as {
      folderId: string;
      name: string;
      description?: string;
      icon: string;
      createdAt: string;
      updatedAt: string;
    };
  },

  updateFolder: async (folderId: string, payload: {
    name: string;
    description?: string;
    icon: string;
  }) => {
    const response = await api.put(`/ai/tutor/knowledge-folders/${folderId}`, payload);
    invalidateKnowledgeEntityCaches(folderId);
    return response.data as {
      folderId: string;
      name: string;
      description?: string;
      icon: string;
      createdAt: string;
      updatedAt: string;
    };
  },

  deleteFolder: async (folderId: string) => {
    const response = await api.delete(`/ai/tutor/knowledge-folders/${folderId}`);
    invalidateKnowledgeEntityCaches(folderId);
    return response.data as { success: boolean };
  },

  listFolders: async () => {
    const cacheKey = KNOWLEDGE_FOLDER_CACHE_KEY;
    const cached = getCachedValue<Array<{
      folderId: string;
      name: string;
      description?: string;
      icon: string;
      fileCount?: number;
      completedCount?: number;
      processingCount?: number;
      failedCount?: number;
      totalSize?: number;
      totalVectors?: number;
      createdAt: string;
      updatedAt: string;
    }>>(cacheKey);
    if (cached) return cached;

    const response = await api.get("/ai/tutor/knowledge-folders");
    const data = response.data as Array<{
      folderId: string;
      name: string;
      description?: string;
      icon: string;
      fileCount?: number;
      completedCount?: number;
      processingCount?: number;
      failedCount?: number;
      totalSize?: number;
      totalVectors?: number;
      createdAt: string;
      updatedAt: string;
    }>;
    setCachedValue(cacheKey, data);
    return data;
  },

  getFolderContents: async (folderId: string, params?: { page?: number; pageSize?: number }) => {
    const cacheKey = `knowledge:folder-contents:${folderId}:${params?.page || 1}:${params?.pageSize || 12}`;
    const cached = getCachedValue<{
      folder: {
        folderId: string;
        name: string;
        description?: string;
        icon: string;
        createdAt: string;
        updatedAt: string;
      };
      files: {
        data: Array<{
          fileId: string;
          filename: string;
          description?: string;
          url: string;
          mimeType: string;
          size: number;
          status: string;
          progress: number;
          metadata?: { stage?: string; message?: string };
          folderId?: string;
          chunkCount?: number;
          vectorCount?: number;
          graphDocumentId?: string;
          errorMessage?: string | null;
          createdAt: string;
        }>;
        pagination: {
          page: number;
          pageSize: number;
          total: number;
        };
      };
    }>(cacheKey);
    if (cached) return cached;

    const response = await api.get(`/ai/tutor/knowledge-folders/${folderId}/contents`, { params });
    const data = response.data as {
      folder: {
        folderId: string;
        name: string;
        description?: string;
        icon: string;
        createdAt: string;
        updatedAt: string;
      };
      files: {
        data: Array<{
          fileId: string;
          filename: string;
          description?: string;
          url: string;
          mimeType: string;
          size: number;
          status: string;
          progress: number;
          metadata?: { stage?: string; message?: string };
          folderId?: string;
          chunkCount?: number;
          vectorCount?: number;
          graphDocumentId?: string;
          errorMessage?: string | null;
          createdAt: string;
        }>;
        pagination: {
          page: number;
          pageSize: number;
          total: number;
        };
      };
    };
    setCachedValue(cacheKey, data, 5000);
    return data;
  },

  getKnowledgeStats: async (params?: { folderId?: string }) => {
    const cacheKey = `knowledge:stats:${params?.folderId || "all"}`;
    const cached = getCachedValue<{
      total: number;
      completed: number;
      processing: number;
      failed: number;
      totalSize: number;
      totalVectors: number;
    }>(cacheKey);
    if (cached) return cached;

    const response = await api.get("/ai/tutor/knowledge-stats", { params });
    const data = response.data as {
      total: number;
      completed: number;
      processing: number;
      failed: number;
      totalSize: number;
      totalVectors: number;
    };
    setCachedValue(cacheKey, data, 5000);
    return data;
  },

  uploadFileToKnowledgeBase: async (
    file: File,
    payload?: {
      folderId?: string;
      folderName?: string;
      folderDescription?: string;
      description?: string;
      courseCode?: string;
      language?: string;
      topic?: string;
      difficulty?: string;
    },
  ) => {
    const formData = new FormData();
    formData.append("file", file);

    if (payload?.folderId) formData.append("folderId", payload.folderId);
    if (payload?.folderName) formData.append("folderName", payload.folderName);
    if (payload?.folderDescription) formData.append("folderDescription", payload.folderDescription);
    if (payload?.description) formData.append("description", payload.description);
    if (payload?.courseCode) formData.append("courseCode", payload.courseCode);
    if (payload?.language) formData.append("language", payload.language);
    if (payload?.topic) formData.append("topic", payload.topic);
    if (payload?.difficulty) formData.append("difficulty", payload.difficulty);

    const response = await api.post("/ai/tutor/knowledge-files", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    invalidateKnowledgeEntityCaches(payload?.folderId);

    return response.data as {
      fileId: string;
      status: string;
      progress: number;
      metadata?: { stage?: string; message?: string };
      chunkCount: number;
      vectorCount: number;
      graphDocumentId?: string;
      errorMessage?: string | null;
      url: string;
      filename: string;
      mimeType: string;
      size: number;
    };
  },

  getKnowledgeFileStatus: async (fileId: string) => {
    const response = await api.get(`/ai/tutor/knowledge-files/${fileId}`);
    return response.data as {
      fileId: string;
      status: string;
      progress: number;
      metadata?: { stage?: string; message?: string };
      chunkCount: number;
      vectorCount: number;
      graphDocumentId?: string;
      errorMessage?: string | null;
      url: string;
      filename: string;
      mimeType: string;
      size: number;
      completedAt?: string | null;
    };
  },

  listKnowledgeFiles: async () => {
    const response = await api.get("/ai/tutor/knowledge-files");
    return response.data as Array<{
      fileId: string;
      filename: string;
      description?: string;
      url: string;
      mimeType: string;
      size: number;
      status: string;
      progress: number;
      folderId?: string;
      folderName?: string;
      folderDescription?: string;
      chunkCount?: number;
      vectorCount?: number;
      graphDocumentId?: string;
      errorMessage?: string | null;
      createdAt: string;
      completedAt?: string | null;
    }>;
  },

  searchKnowledgeFiles: async (params?: {
    folderId?: string;
    status?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
    page?: number;
    pageSize?: number;
  }) => {
    const response = await api.get("/ai/tutor/knowledge-files/search", { params });
    return response.data as {
      data: Array<{
        fileId: string;
        filename: string;
        description?: string;
        url: string;
        mimeType: string;
        size: number;
        status: string;
        progress: number;
        metadata?: { stage?: string; message?: string };
        folderId?: string;
        chunkCount?: number;
        vectorCount?: number;
        graphDocumentId?: string;
        errorMessage?: string | null;
        createdAt: string;
      }>;
      pagination: {
        page: number;
        pageSize: number;
        total: number;
      };
    };
  },

  deleteKnowledgeFile: async (fileId: string) => {
    const response = await api.delete(`/ai/tutor/knowledge-files/${fileId}`);
    invalidateKnowledgeEntityCaches();
    return response.data as { success: boolean };
  },

  reprocessKnowledgeFile: async (fileId: string) => {
    const response = await api.post(`/ai/tutor/knowledge-files/${fileId}/reprocess`, {});
    invalidateKnowledgeEntityCaches();
    return response.data as { success: boolean; fileId: string; status: string };
  },

  getKnowledgeFileGraph: async (fileId: string) => {
    const response = await api.get(`/ai/tutor/knowledge-files/${fileId}/graph`);
    return response.data as GenAIKnowledgeGraphSnapshot;
  },

  listDatasetCatalog: async () => {
    const response = await api.get("/ai/tutor/dataset-imports/catalog");
    return response.data as GenAIKnowledgeDatasetCatalogItem[];
  },

  createDatasetImport: async (payload: { folderId?: string; datasetKey: string }) => {
    const response = await api.post("/ai/tutor/dataset-imports", payload);
    invalidateKnowledgeEntityCaches(payload.folderId);
    return response.data as Pick<GenAIKnowledgeDatasetImportJob, "jobId" | "datasetKey" | "status" | "progress" | "stage" | "message">;
  },

  listDatasetImports: async () => {
    const response = await api.get("/ai/tutor/dataset-imports");
    return response.data as GenAIKnowledgeDatasetImportJob[];
  },

  getDatasetImportJob: async (jobId: string) => {
    const response = await api.get(`/ai/tutor/dataset-imports/${jobId}`);
    return response.data as GenAIKnowledgeDatasetImportJob;
  },

  cancelDatasetImportJob: async (jobId: string) => {
    const response = await api.post(`/ai/tutor/dataset-imports/${jobId}/cancel`);
    return response.data as GenAIKnowledgeDatasetImportJob;
  },

  bulkDeleteKnowledgeFiles: async (fileIds: string[]) => {
    const response = await api.post("/ai/tutor/knowledge-files/bulk-delete", { fileIds });
    invalidateKnowledgeEntityCaches();
    return response.data as { success: boolean; deletedFiles?: Array<{ fileId: string }> };
  },

  bulkReprocessKnowledgeFiles: async (fileIds: string[]) => {
    const response = await api.post("/ai/tutor/knowledge-files/bulk-reprocess", { fileIds });
    invalidateKnowledgeEntityCaches();
    return response.data as { success: boolean; queuedFileIds?: string[] };
  },
};
