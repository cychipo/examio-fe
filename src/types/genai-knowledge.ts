export type GenAIKnowledgeFolderIcon =
  | "Folder"
  | "FolderOpen"
  | "Code2"
  | "FileCode2"
  | "BrainCircuit"
  | "BookOpen"
  | "Library"
  | "Bot"
  | "Database"
  | "Blocks"
  | "GraduationCap"
  | "FlaskConical";

export interface GenAIKnowledgeFile {
  id: string;
  folderId: string;
  name: string;
  description?: string;
  mimeType: string;
  size: number;
  url: string;
  uploadId?: string;
  processingStatus?: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  processingProgress?: number;
  processingStage?: string;
  processingMessage?: string;
  chunkCount?: number;
  vectorCount?: number;
  graphDocumentId?: string;
  errorMessage?: string;
  uploadedAt: string;
}

export interface GenAIKnowledgeGraphSnapshot {
  document: {
    id: string;
    title: string;
    sourcePath: string;
    jobId?: string;
  };
  entities: Array<{
    id: string;
    name: string;
    canonicalName?: string;
    entityType?: string;
    language?: string;
    properties?: Record<string, unknown>;
  }>;
  relations: Array<{
    id: string;
    relationType: string;
    from_name: string;
    to_name: string;
    weight: number;
    evidenceChunkId?: string;
  }>;
}

export interface GenAIKnowledgeDatasetCatalogItem {
  datasetKey: string;
  title: string;
  description: string;
  source: string;
  repository: string;
  courseCode: string;
  language?: string;
  topic?: string;
  difficulty?: string;
}

export interface GenAIKnowledgeDatasetImportJob {
  jobId: string;
  userId: string;
  folderId?: string;
  datasetKey: string;
  title: string;
  status: string;
  progress: number;
  stage: string;
  message?: string;
  sourcePath?: string;
  ingestJobId?: string;
  artifactUrl?: string;
  artifactKeyR2?: string;
  downloadedFiles: number;
  processedFiles: number;
  totalFiles: number;
  metadata?: {
    result?: {
      documents: number;
      chunks: number;
      entities: number;
      relations: number;
    };
    [key: string]: unknown;
  };
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface GenAIKnowledgeDatasetState {
  datasetKey: string;
  imported: boolean;
  importedFolderId?: string;
  importedFolderName?: string;
  importedAt?: string;
  latestJob?: GenAIKnowledgeDatasetImportJob;
  lastSuccessfulJob?: GenAIKnowledgeDatasetImportJob;
}

export interface GenAIKnowledgeFolder {
  id: string;
  name: string;
  description?: string;
  icon: GenAIKnowledgeFolderIcon;
  fileCount?: number;
  completedCount?: number;
  processingCount?: number;
  failedCount?: number;
  totalSize?: number;
  totalVectors?: number;
  createdAt: string;
  updatedAt: string;
}

export interface PendingKnowledgeUpload {
  id: string;
  file: File;
  description?: string;
}
