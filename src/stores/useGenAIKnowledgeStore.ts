import { create } from "zustand";

import { GenAIKnowledgeFile, GenAIKnowledgeFolder, GenAIKnowledgeFolderIcon } from "@/types/genai-knowledge";

const STORAGE_KEY = "genai-tutor-knowledge-manager";

interface GenAIKnowledgeState {
  folders: GenAIKnowledgeFolder[];
  files: GenAIKnowledgeFile[];
  hydrated: boolean;
  hydrate: () => void;
  setFolders: (folders: GenAIKnowledgeFolder[]) => void;
  setFiles: (files: GenAIKnowledgeFile[]) => void;
  createFolder: (input: {
    name: string;
    description?: string;
    icon: GenAIKnowledgeFolderIcon;
  }) => GenAIKnowledgeFolder;
  updateFolder: (folderId: string, input: {
    name: string;
    description?: string;
    icon: GenAIKnowledgeFolderIcon;
  }) => void;
  deleteFolder: (folderId: string) => void;
  addFile: (input: Omit<GenAIKnowledgeFile, "id" | "uploadedAt">) => GenAIKnowledgeFile;
  updateFile: (fileId: string, input: Partial<GenAIKnowledgeFile>) => void;
  removeFile: (fileId: string) => void;
}

function createId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function persistState(folders: GenAIKnowledgeFolder[], files: GenAIKnowledgeFile[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ folders, files }));
}

export const useGenAIKnowledgeStore = create<GenAIKnowledgeState>((set, get) => ({
  folders: [],
  files: [],
  hydrated: false,

  hydrate: () => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        set({ hydrated: true });
        return;
      }

      const parsed = JSON.parse(raw) as {
        folders?: GenAIKnowledgeFolder[];
        files?: GenAIKnowledgeFile[];
      };

      set({
        folders: parsed.folders || [],
        files: parsed.files || [],
        hydrated: true,
      });
    }
    catch {
      set({ hydrated: true });
    }
  },

  setFolders: (folders) => {
    persistState(folders, get().files);
    set({ folders, hydrated: true });
  },

  setFiles: (files) => {
    persistState(get().folders, files);
    set({ files, hydrated: true });
  },

  createFolder: ({ name, description, icon }) => {
    const now = new Date().toISOString();
    const folder: GenAIKnowledgeFolder = {
      id: createId("folder"),
      name,
      description,
      icon,
      createdAt: now,
      updatedAt: now,
    };

    const folders = [folder, ...get().folders];
    persistState(folders, get().files);
    set({ folders });
    return folder;
  },

  updateFolder: (folderId, input) => {
    const folders = get().folders.map(folder =>
      folder.id === folderId
        ? {
            ...folder,
            ...input,
            updatedAt: new Date().toISOString(),
          }
        : folder,
    );

    persistState(folders, get().files);
    set({ folders });
  },

  deleteFolder: (folderId) => {
    const folders = get().folders.filter(folder => folder.id !== folderId);
    const files = get().files.filter(file => file.folderId !== folderId);
    persistState(folders, files);
    set({ folders, files });
  },

  addFile: (input) => {
    const file: GenAIKnowledgeFile = {
      ...input,
      id: createId("file"),
      uploadedAt: new Date().toISOString(),
    };

    const files = [file, ...get().files];
    persistState(get().folders, files);
    set({ files });
    return file;
  },

  updateFile: (fileId, input) => {
    const files = get().files.map(file =>
      file.id === fileId
        ? {
            ...file,
            ...input,
          }
        : file,
    );

    persistState(get().folders, files);
    set({ files });
  },

  removeFile: (fileId) => {
    const files = get().files.filter(file => file.id !== fileId);
    persistState(get().folders, files);
    set({ files });
  },
}));
