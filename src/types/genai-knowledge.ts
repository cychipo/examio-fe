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
  errorMessage?: string;
  uploadedAt: string;
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
