"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  BrainCircuit,
  Database,
  FilePlus2,
  Folder,
  FolderOpen,
  Library,
  Lock,
  Menu,
  Plus,
  ShieldCheck,
  Trash2,
  UploadCloud,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { canAccessGenAIKnowledgeManager, isGenAIKnowledgeRestrictedByEmail } from "@/lib/genai-knowledge-access";
import { useDebounce } from "@/hooks/useDebounce";
import { useAuthStore } from "@/stores/useAuthStore";
import { useGenAIKnowledgeStore } from "@/stores/useGenAIKnowledgeStore";
import { genaiTutorKnowledgeApi } from "@/apis/genaiTutorKnowledgeApi";
import { GenAIKnowledgeFolderIcon, GenAIKnowledgeGraphSnapshot, PendingKnowledgeUpload } from "@/types/genai-knowledge";
import { formatBytes, getIconAccent, iconMap } from "@/components/organisms/k/genai-knowledge/knowledge-constants";
import { KnowledgeFolderList } from "@/components/organisms/k/genai-knowledge/KnowledgeFolderList";
import { KnowledgePendingUploadList } from "@/components/organisms/k/genai-knowledge/KnowledgePendingUploadList";
import { KnowledgeFileGrid } from "@/components/organisms/k/genai-knowledge/KnowledgeFileGrid";
import { KnowledgeFilterBar } from "@/components/organisms/k/genai-knowledge/KnowledgeFilterBar";
import { KnowledgeStatsCards } from "@/components/organisms/k/genai-knowledge/KnowledgeStatsCards";
import { KnowledgeUploadZone } from "@/components/organisms/k/genai-knowledge/KnowledgeUploadZone";
import { KnowledgeFolderDialog } from "@/components/organisms/k/genai-knowledge/KnowledgeFolderDialog";
import { KnowledgeGraphDialog } from "@/components/organisms/k/genai-knowledge/KnowledgeGraphDialog";
import { KnowledgeDatasetImportDialog } from "@/components/organisms/k/genai-knowledge/KnowledgeDatasetImportDialog";
export default function GenAIKnowledgePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, initializing, getUser } = useAuthStore();
  const {
    folders,
    files,
    hydrated,
    hydrate,
    setFolders,
    setFiles,
    updateFolder,
    deleteFolder,
    addFile,
    updateFile,
    removeFile,
  } = useGenAIKnowledgeStore();

  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(searchParams.get("folder") || null);
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);
  const [folderSheetOpen, setFolderSheetOpen] = useState(false);
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [folderName, setFolderName] = useState("");
  const [folderDescription, setFolderDescription] = useState("");
  const [folderIcon, setFolderIcon] = useState<GenAIKnowledgeFolderIcon>("Folder");
  const [uploading, setUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED">((searchParams.get("status") as any) || "ALL");
  const [stageFilter, setStageFilter] = useState<"ALL" | "queued" | "downloading" | "extracting" | "chunking" | "embedding" | "graphing" | "completed" | "failed">((searchParams.get("stage") as any) || "ALL");
  const [sortBy, setSortBy] = useState<"createdAt" | "filename" | "status" | "size">((searchParams.get("sortBy") as any) || "createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">((searchParams.get("sortOrder") as any) || "desc");
  const [page, setPage] = useState(Number(searchParams.get("page") || 1));
  const [totalFiles, setTotalFiles] = useState(0);
  const [stats, setStats] = useState({ total: 0, completed: 0, processing: 0, failed: 0, totalSize: 0, totalVectors: 0 });
  const [pendingUploads, setPendingUploads] = useState<PendingKnowledgeUpload[]>([]);
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);
  const [virtualLimit, setVirtualLimit] = useState(24);
  const [confirmBulkDeleteOpen, setConfirmBulkDeleteOpen] = useState(false);
  const [confirmBulkReprocessOpen, setConfirmBulkReprocessOpen] = useState(false);
  const [confirmDeleteFolderOpen, setConfirmDeleteFolderOpen] = useState(false);
  const [datasetDialogOpen, setDatasetDialogOpen] = useState(false);
  const [datasetCatalog, setDatasetCatalog] = useState<any[]>([]);
  const [datasetJobs, setDatasetJobs] = useState<any[]>([]);
  const [datasetStates, setDatasetStates] = useState<any[]>([]);
  const [importingDatasetKey, setImportingDatasetKey] = useState<string | null>(null);
  const [datasetJobToCancel, setDatasetJobToCancel] = useState<any | null>(null);
  const [datasetKeyToClear, setDatasetKeyToClear] = useState<string | null>(null);
  const [fileToDelete, setFileToDelete] = useState<null | { id: string; name: string; uploadId?: string }>(null);
  const [graphDialogOpen, setGraphDialogOpen] = useState(false);
  const [graphLoading, setGraphLoading] = useState(false);
  const [graphError, setGraphError] = useState<string | null>(null);
  const [graphSnapshot, setGraphSnapshot] = useState<GenAIKnowledgeGraphSnapshot | null>(null);
  const [graphFileName, setGraphFileName] = useState<string | undefined>(undefined);
  const [confirmActionLoading, setConfirmActionLoading] = useState<null | "bulk-delete" | "bulk-reprocess" | "folder-delete" | "file-delete">(null);
  const debouncedSearchQuery = useDebounce(searchQuery, 350);

  useEffect(() => {
    getUser();
  }, [getUser]);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const loadKnowledgeData = useCallback(async () => {
    if (!user || user.role !== "teacher") {
      return;
    }

    try {
      const folderRows = await genaiTutorKnowledgeApi.listFolders();

      setFolders(folderRows.map(folder => ({
        id: folder.folderId,
        name: folder.name,
        description: folder.description,
        icon: folder.icon as GenAIKnowledgeFolderIcon,
        fileCount: folder.fileCount,
        completedCount: folder.completedCount,
        processingCount: folder.processingCount,
        failedCount: folder.failedCount,
        totalSize: folder.totalSize,
        totalVectors: folder.totalVectors,
        createdAt: folder.createdAt,
        updatedAt: folder.updatedAt,
      })));

      const fileResult = selectedFolderId
        ? await genaiTutorKnowledgeApi.getFolderContents(selectedFolderId, { page, pageSize: 12 })
        : await genaiTutorKnowledgeApi.searchKnowledgeFiles({
            status: statusFilter === "ALL" ? undefined : statusFilter,
            search: debouncedSearchQuery || undefined,
            sortBy,
            sortOrder,
            page,
            pageSize: 12,
          });

      const normalizedFiles = ("data" in fileResult ? fileResult.data : fileResult.files.data).map(file => ({
          id: file.fileId,
          folderId: file.folderId || "unassigned",
          name: file.filename,
          description: file.description,
          mimeType: file.mimeType,
          size: file.size,
          url: file.url,
          uploadId: file.fileId,
          processingStatus: file.status as "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED",
          processingProgress: file.progress,
          processingStage: file.metadata?.stage,
          processingMessage: file.metadata?.message,
          chunkCount: file.chunkCount,
          vectorCount: file.vectorCount,
          graphDocumentId: file.graphDocumentId,
          errorMessage: file.errorMessage || undefined,
          uploadedAt: file.createdAt,
        }));

      setFiles(normalizedFiles);
      setTotalFiles(("pagination" in fileResult ? fileResult.pagination.total : fileResult.files.pagination.total) || 0);
      const statsResult = await genaiTutorKnowledgeApi.getKnowledgeStats({ folderId: selectedFolderId || undefined });
      setStats(statsResult);
    }
    catch (error) {
      console.error("Failed to load knowledge data", error);
    }
  }, [user, setFolders, setFiles, selectedFolderId, statusFilter, debouncedSearchQuery, sortBy, sortOrder, page]);

  useEffect(() => {
    loadKnowledgeData();
  }, [loadKnowledgeData]);

  const loadDatasetImports = useCallback(async () => {
    if (!user || user.role !== "teacher") {
      return;
    }

    try {
      const [catalog, jobs, states] = await Promise.all([
        genaiTutorKnowledgeApi.listDatasetCatalog(),
        genaiTutorKnowledgeApi.listDatasetImports(),
        genaiTutorKnowledgeApi.listDatasetStates(),
      ]);
      const folderNameById = new Map(folders.map(folder => [folder.id, folder.name]));
      setDatasetCatalog(catalog);
      setDatasetJobs(jobs);
      setDatasetStates(states.map(state => ({
        ...state,
        importedFolderName: state.importedFolderId ? folderNameById.get(state.importedFolderId) : undefined,
      })));
    }
    catch (error) {
      console.error("Failed to load dataset imports", error);
    }
  }, [folders, user]);

  useEffect(() => {
    loadDatasetImports();
  }, [loadDatasetImports]);

  useEffect(() => {
    const activeJobs = datasetJobs.filter(job => ["queued", "downloading", "processing", "cancelling"].includes(job.status));
    if (activeJobs.length === 0) {
      return;
    }

    const timer = window.setInterval(async () => {
      try {
        const refreshed = await Promise.all(
          activeJobs.map(job => genaiTutorKnowledgeApi.getDatasetImportJob(job.jobId)),
        );
        setDatasetJobs(current => {
          const map = new Map(current.map(job => [job.jobId, job]));
          refreshed.forEach(job => map.set(job.jobId, job));
          return Array.from(map.values()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        });
        const states = await genaiTutorKnowledgeApi.listDatasetStates();
        const folderNameById = new Map(folders.map(folder => [folder.id, folder.name]));
        setDatasetStates(states.map(state => ({
          ...state,
          importedFolderName: state.importedFolderId ? folderNameById.get(state.importedFolderId) : undefined,
        })));

        if (refreshed.some(job => ["completed", "cancelled"].includes(job.status))) {
          loadKnowledgeData();
        }
      }
      catch (error) {
        console.error("Failed to refresh dataset import jobs", error);
      }
    }, 3000);

    return () => window.clearInterval(timer);
  }, [datasetJobs, folders, loadKnowledgeData]);

  useEffect(() => {
    setPage(1);
  }, [selectedFolderId, statusFilter, stageFilter, debouncedSearchQuery, sortBy, sortOrder]);

  useEffect(() => {
    setVirtualLimit(24);
  }, [selectedFolderId, statusFilter, stageFilter, debouncedSearchQuery, sortBy, sortOrder, page]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedFolderId) params.set("folder", selectedFolderId);
    if (searchQuery) params.set("search", searchQuery);
    if (statusFilter !== "ALL") params.set("status", statusFilter);
    if (stageFilter !== "ALL") params.set("stage", stageFilter);
    if (sortBy !== "createdAt") params.set("sortBy", sortBy);
    if (sortOrder !== "desc") params.set("sortOrder", sortOrder);
    if (page > 1) params.set("page", String(page));

    const query = params.toString();
    router.replace(query ? `/k/genai-knowledge?${query}` : "/k/genai-knowledge");
  }, [router, selectedFolderId, searchQuery, statusFilter, stageFilter, sortBy, sortOrder, page]);

  const canAccess = canAccessGenAIKnowledgeManager(user);
  const accessRestrictedByEmail = isGenAIKnowledgeRestrictedByEmail();

  useEffect(() => {
    if (!initializing && user && user.role !== "teacher") {
      router.replace("/k");
    }
  }, [initializing, router, user]);

  useEffect(() => {
    if (!selectedFolderId && folders.length > 0) {
      setSelectedFolderId(folders[0].id);
    }
  }, [folders, selectedFolderId]);

  const selectedFolder = useMemo(
    () => folders.find(folder => folder.id === selectedFolderId) || null,
    [folders, selectedFolderId],
  );

  const filesByFolderId = useMemo(() => {
    const map = new Map<string, typeof files>();
    for (const file of files) {
      const existing = map.get(file.folderId) || [];
      existing.push(file);
      map.set(file.folderId, existing);
    }
    return map;
  }, [files]);

  const fileCountByFolderId = useMemo(() => {
    const map = new Map<string, number>();
    for (const file of files) {
      map.set(file.folderId, (map.get(file.folderId) || 0) + 1);
    }
    return map;
  }, [files]);

  const folderFiles = useMemo(() => {
    const scoped = selectedFolderId ? filesByFolderId.get(selectedFolderId) || [] : [];
    if (stageFilter === "ALL") {
      return scoped;
    }
    return scoped.filter(file => file.processingStage === stageFilter);
  }, [filesByFolderId, selectedFolderId, stageFilter]);

  const visibleFolderFiles = useMemo(
    () => folderFiles.slice(0, virtualLimit),
    [folderFiles, virtualLimit],
  );

  const selectedFilesPreview = useMemo(
    () => visibleFolderFiles.filter(file => selectedFileIds.includes(file.id)).slice(0, 5),
    [visibleFolderFiles, selectedFileIds],
  );

  const totalStorage = useMemo(
    () => files.reduce((sum, file) => sum + file.size, 0),
    [files],
  );

  const hasActiveProcessing = useMemo(
    () => files.some(file => file.processingStatus === "PROCESSING" || file.processingStatus === "PENDING"),
    [files],
  );

  useEffect(() => {
    if (!hasActiveProcessing) {
      return;
    }

    const timer = window.setInterval(() => {
      loadKnowledgeData();
    }, 4000);

    return () => {
      window.clearInterval(timer);
    };
  }, [hasActiveProcessing, loadKnowledgeData]);

  const openCreateFolderDialog = () => {
    setEditingFolderId(null);
    setFolderName("");
    setFolderDescription("");
    setFolderIcon("Folder");
    setFolderDialogOpen(true);
  };

  const handleSelectFolder = (folderId: string) => {
    setSelectedFolderId(folderId);
    setFolderSheetOpen(false);
  };

  const handleLoadMoreVisibleFiles = () => {
    setVirtualLimit(current => current + 24);
  };

  const handleImportDataset = async (datasetKey: string) => {
    if (!selectedFolder) {
      toast.warning("Hãy chọn folder trước khi nạp dataset");
      return;
    }

    setImportingDatasetKey(datasetKey);
    try {
      const job = await genaiTutorKnowledgeApi.createDatasetImport({
        folderId: selectedFolder.id,
        datasetKey,
      });
      toast.success("Đã tạo job nạp dataset. Hệ thống sẽ tải và ingest dưới nền.");
      const fullJob = await genaiTutorKnowledgeApi.getDatasetImportJob(job.jobId);
      setDatasetJobs(current => [
        fullJob,
        ...current.filter(item => item.jobId !== fullJob.jobId && item.datasetKey !== fullJob.datasetKey),
      ]);
    }
    catch (error) {
      toast.error((error as Error).message || "Không thể tạo job nạp dataset");
    }
    finally {
      setImportingDatasetKey(null);
    }
  };

  const handleCancelDatasetImport = async () => {
    if (!datasetJobToCancel) {
      return;
    }
    try {
      const job = await genaiTutorKnowledgeApi.cancelDatasetImportJob(datasetJobToCancel.jobId);
      setDatasetJobs(current => current.map(item => item.jobId === job.jobId ? job : item));
      toast.success("Job đang được hủy và dọn dữ liệu...");
      loadKnowledgeData();
    }
    catch (error) {
      toast.error((error as Error).message || "Không thể hủy job nạp dataset");
    }
    finally {
      setDatasetJobToCancel(null);
    }
  };

  const handleClearDataset = async () => {
    if (!datasetKeyToClear) {
      return;
    }
    try {
      const result = await genaiTutorKnowledgeApi.clearDataset(datasetKeyToClear);
      toast.success(result.message);
      await loadDatasetImports();
      await loadKnowledgeData();
    }
    catch (error) {
      toast.error((error as Error).message || "Không thể clear dataset");
    }
    finally {
      setDatasetKeyToClear(null);
    }
  };

  const handleOpenGraph = async (file: typeof files[number]) => {
    if (!file.uploadId) {
      toast.warning("File này chưa có graph để xem");
      return;
    }

    setGraphDialogOpen(true);
    setGraphLoading(true);
    setGraphError(null);
    setGraphSnapshot(null);
    setGraphFileName(file.name);

    try {
      const snapshot = await genaiTutorKnowledgeApi.getKnowledgeFileGraph(file.uploadId);
      setGraphSnapshot(snapshot);
    }
    catch (error) {
      setGraphError((error as Error).message || "Không thể tải knowledge graph");
    }
    finally {
      setGraphLoading(false);
    }
  };

  const openEditFolderDialog = () => {
    if (!selectedFolder) {
      return;
    }

    setEditingFolderId(selectedFolder.id);
    setFolderName(selectedFolder.name);
    setFolderDescription(selectedFolder.description || "");
    setFolderIcon(selectedFolder.icon);
    setFolderDialogOpen(true);
  };

  const handleSaveFolder = async () => {
    if (!folderName.trim()) {
      toast.warning("Vui lòng nhập tên folder");
      return;
    }

    try {
      if (editingFolderId) {
        const updated = await genaiTutorKnowledgeApi.updateFolder(editingFolderId, {
          name: folderName.trim(),
          description: folderDescription.trim() || undefined,
          icon: folderIcon,
        });
        updateFolder(editingFolderId, {
          name: updated.name,
          description: updated.description,
          icon: updated.icon as GenAIKnowledgeFolderIcon,
        });
        toast.success("Đã cập nhật folder");
      }
      else {
        const created = await genaiTutorKnowledgeApi.createFolder({
          name: folderName.trim(),
          description: folderDescription.trim() || undefined,
          icon: folderIcon,
        });
        setSelectedFolderId(created.folderId);
        setFolders([
          {
            id: created.folderId,
            name: created.name,
            description: created.description,
            icon: created.icon as GenAIKnowledgeFolderIcon,
            createdAt: created.createdAt,
            updatedAt: created.updatedAt,
          },
          ...folders.filter(item => item.id !== created.folderId),
        ]);
        toast.success("Đã tạo folder mới");
      }

      setFolderDialogOpen(false);
    }
    catch (error) {
      toast.error((error as Error).message || "Không thể lưu folder");
    }
  };

  const handleDeleteFolder = async () => {
    if (!selectedFolder) {
      return;
    }

    try {
      await genaiTutorKnowledgeApi.deleteFolder(selectedFolder.id);
      deleteFolder(selectedFolder.id);
      setSelectedFolderId(null);
      toast.success("Đã xóa folder và toàn bộ file bên trong");
    }
    catch (error) {
      toast.error((error as Error).message || "Không thể xóa folder");
    }
  };

  const handleSelectFiles = () => {
    if (!selectedFolderId) {
      toast.warning("Hãy chọn hoặc tạo một folder trước khi tải file lên");
      return;
    }

    fileInputRef.current?.click();
  };

  const queueSelectedFiles = (filesToQueue: File[]) => {
    const supportedFiles = filesToQueue.filter((file) => {
      const lowered = file.name.toLowerCase();
      return lowered.endsWith(".pdf") || lowered.endsWith(".json");
    });

    if (supportedFiles.length !== filesToQueue.length) {
      toast.warning("Chỉ nhận file PDF hoặc JSON trong kho tri thức này");
    }

    if (supportedFiles.length === 0) {
      return;
    }

    setPendingUploads(current => [
      ...current,
      ...supportedFiles.map(file => ({
        id: `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        file,
        description: "",
      })),
    ]);
  };

  function pollKnowledgeFileStatus(localFileId: string, backendFileId: string) {
    const poll = async () => {
      try {
        const status = await genaiTutorKnowledgeApi.getKnowledgeFileStatus(backendFileId);
        updateFile(localFileId, {
          uploadId: backendFileId,
          processingStatus: status.status as "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED",
          processingProgress: status.progress,
          processingStage: status.metadata?.stage,
          processingMessage: status.metadata?.message,
          chunkCount: status.chunkCount,
          vectorCount: status.vectorCount,
          errorMessage: status.errorMessage || undefined,
          url: status.url,
        });

        if (status.status === "COMPLETED") {
          const sourceType = status.metadata?.sourceType;
          toast.success(
            sourceType === "json"
              ? `Dataset ${status.filename} đã parse, embedding và nối graph xong`
              : `File ${status.filename} đã OCR/extract, embedding và nối graph xong`,
          );
          loadKnowledgeData();
          return;
        }

        if (status.status === "FAILED") {
          toast.error(status.errorMessage || `Xử lý file ${status.filename} thất bại`);
          loadKnowledgeData();
          return;
        }

        window.setTimeout(poll, 2500);
      }
      catch (error) {
        console.error("Failed to poll tutor knowledge file status", error);
      }
    };

    window.setTimeout(poll, 1500);
  }

  const uploadSelectedFiles = async (queueItems: PendingKnowledgeUpload[]) => {
    if (!selectedFolderId || queueItems.length === 0) {
      return;
    }

    setUploading(true);

    try {
      for (const item of queueItems) {
        const file = item.file;
        const uploaded = await genaiTutorKnowledgeApi.uploadFileToKnowledgeBase(file, {
          folderId: selectedFolderId,
          folderName: selectedFolder?.name,
          folderDescription: selectedFolder?.description,
          description: item.description?.trim() || undefined,
        });

        const localFile = addFile({
          folderId: selectedFolderId,
          name: file.name,
          description: item.description?.trim() || undefined,
          mimeType: file.type || "application/octet-stream",
          size: file.size,
          url: uploaded.url,
          uploadId: uploaded.fileId,
          processingStatus: uploaded.status as "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED",
          processingProgress: uploaded.progress,
          processingStage: uploaded.metadata?.stage,
          processingMessage: uploaded.metadata?.message,
          chunkCount: uploaded.chunkCount,
          vectorCount: uploaded.vectorCount,
          errorMessage: uploaded.errorMessage || undefined,
        });

        pollKnowledgeFileStatus(localFile.id, uploaded.fileId);
      }

      toast.success("Đã tải file lên kho tri thức");
      setPendingUploads([]);
    }
    catch (error) {
      toast.error((error as Error).message || "Không thể tải file lên");
    }
    finally {
      setUploading(false);
      setIsDragOver(false);
    }
  };

  const handleUploadFiles = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    queueSelectedFiles(selectedFiles);
    event.target.value = "";
  };

  const handleDropFiles = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);

    if (!selectedFolderId) {
      toast.warning("Hãy chọn folder trước khi kéo thả file");
      return;
    }

    const droppedFiles = Array.from(event.dataTransfer.files || []);
    queueSelectedFiles(droppedFiles);
  };

  const toggleFileSelection = (fileId: string) => {
    setSelectedFileIds(current =>
      current.includes(fileId)
        ? current.filter(id => id !== fileId)
        : [...current, fileId],
    );
  };

  const handleBulkReprocess = async () => {
    if (selectedFileIds.length === 0) {
      toast.warning("Hãy chọn ít nhất một file");
      return;
    }

    try {
      toast.info(`Đang đưa ${selectedFileIds.length} file vào hàng chờ xử lý lại...`);
      await genaiTutorKnowledgeApi.bulkReprocessKnowledgeFiles(selectedFileIds);
      toast.success("Đã đưa các file vào hàng chờ xử lý lại");
      setSelectedFileIds([]);
      loadKnowledgeData();
    }
    catch (error) {
      toast.error((error as Error).message || "Không thể xử lý lại file hàng loạt");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedFileIds.length === 0) {
      toast.warning("Hãy chọn ít nhất một file");
      return;
    }

    try {
      toast.info(`Đang xóa ${selectedFileIds.length} file...`);
      await genaiTutorKnowledgeApi.bulkDeleteKnowledgeFiles(selectedFileIds);
      setSelectedFileIds([]);
      toast.success("Đã xóa các file đã chọn");
      loadKnowledgeData();
    }
    catch (error) {
      toast.error((error as Error).message || "Không thể xóa file hàng loạt");
    }
  };

  const handleSelectAllCurrentPage = () => {
    setSelectedFileIds(folderFiles.map(file => file.id));
  };

  const handleClearSelection = () => {
    setSelectedFileIds([]);
  };

  if (initializing || !hydrated) {
    return (
      <div className="mx-auto max-w-7xl space-y-6 px-3 py-6 sm:px-4 sm:py-8">
        <Skeleton className="h-10 w-56 sm:w-72" />
        <Skeleton className="h-40 w-full rounded-3xl sm:h-28" />
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <Skeleton className="h-[480px] w-full rounded-3xl" />
          <Skeleton className="h-[480px] w-full rounded-3xl" />
        </div>
      </div>
    );
  }

  if (!user || user.role !== "teacher") {
    return null;
  }

  if (!canAccess) {
    return (
      <div className="mx-auto max-w-4xl px-3 py-6 sm:px-4 sm:py-10">
        <Card className="border-border bg-[radial-gradient(circle_at_top_left,_rgba(190,24,93,0.08),_transparent_35%),linear-gradient(135deg,rgba(15,23,42,0.03),rgba(15,23,42,0.01))] backdrop-blur-xl rounded-[28px]">
          <CardContent className="p-6 md:p-10">
            <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
              <div className="space-y-4">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-600">
                  <Lock className="h-7 w-7" />
                </div>
                <div className="space-y-2">
                  <h1 className="text-2xl font-semibold tracking-tight">Khu vực quản trị kho tri thức GenAI</h1>
                  <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                    Trang này hiện chỉ mở cho một nhóm giảng viên được chỉ định. FE đã được chuẩn bị sẵn cơ chế allowlist theo email để sau này chỉ cần cấu hình thêm là giới hạn được người truy cập.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="px-3 py-1 text-xs">Teacher only</Badge>
                  {accessRestrictedByEmail && (
                    <Badge variant="secondary" className="px-3 py-1 text-xs">
                      Email allowlist enabled
                    </Badge>
                  )}
                </div>
              </div>
              <Button onClick={() => router.push("/k")}>Quay lại workspace</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-3 py-6 sm:px-4 sm:py-8">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.json,application/pdf,application/json,text/json"
          className="hidden"
          onChange={handleUploadFiles}
        />

      <section className="mb-6 overflow-hidden rounded-[28px] border border-border bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.10),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.10),_transparent_24%),linear-gradient(135deg,rgba(255,255,255,0.85),rgba(248,250,252,0.70))] p-4 shadow-sm backdrop-blur-xl sm:mb-8 sm:rounded-[32px] sm:p-6 md:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-700 sm:text-xs">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span className="truncate">Teacher workspace · GenAI Tutor Knowledge Base</span>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <div className="relative mx-auto shrink-0 sm:mx-0">
                <div className="absolute inset-0 rounded-[28px] bg-[radial-gradient(circle_at_30%_30%,rgba(99,102,241,0.22),transparent_55%),radial-gradient(circle_at_70%_70%,rgba(16,185,129,0.18),transparent_50%)] blur-xl" />
                <div className="relative flex h-18 w-18 items-center justify-center rounded-[24px] border border-white/70 bg-white/75 shadow-[0_18px_45px_rgba(15,23,42,0.10)] ring-1 ring-slate-900/5 backdrop-blur-xl sm:h-20 sm:w-20 sm:rounded-[28px]">
                  <div className="absolute -right-1 -top-1 flex h-8 w-8 items-center justify-center rounded-2xl bg-sky-500/12 text-sky-700 ring-1 ring-sky-500/15">
                    <FolderOpen className="h-4 w-4" />
                  </div>
                  <div className="absolute -bottom-1 -left-1 flex h-8 w-8 items-center justify-center rounded-2xl bg-fuchsia-500/12 text-fuchsia-700 ring-1 ring-fuchsia-500/15">
                    <BrainCircuit className="h-4 w-4" />
                  </div>
                  <Library className="h-9 w-9 text-slate-800" />
                </div>
              </div>
              <div className="space-y-2 text-center sm:text-left">
                <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl">Kho tri thức cho GenAI lập trình</h1>
                <p className="max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
                  Tạo folder học liệu, đặt mô tả, chọn icon nhận diện nhanh và tải file lên R2. Metadata folder/file hiện được giữ ở frontend để bạn có thể vận hành giao diện ngay, trong khi backend quản trị kho tri thức được hoàn thiện tiếp theo.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:min-w-[320px]">
            <Card className="rounded-2xl border-border/70 bg-white/75">
              <CardContent className="p-3 sm:p-4">
                <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground sm:text-xs">Folders</div>
                <div className="mt-2 text-xl font-semibold sm:text-2xl">{folders.length}</div>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-border/70 bg-white/75">
              <CardContent className="p-3 sm:p-4">
                <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground sm:text-xs">Files</div>
                <div className="mt-2 text-xl font-semibold sm:text-2xl">{files.length}</div>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-border/70 bg-white/75 col-span-2 sm:col-span-1">
              <CardContent className="p-3 sm:p-4">
                <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground sm:text-xs">Storage</div>
                <div className="mt-2 text-xl font-semibold sm:text-2xl">{formatBytes(totalStorage)}</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="grid items-start gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <div className="lg:hidden">
          <Sheet open={folderSheetOpen} onOpenChange={setFolderSheetOpen}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <SheetTrigger asChild>
                <Button variant="outline" className="w-full justify-between rounded-2xl bg-white/75">
                  <span className="flex min-w-0 items-center gap-2">
                    <Menu className="h-4 w-4 shrink-0" />
                    <span className="truncate">{selectedFolder?.name || "Chọn folder"}</span>
                  </span>
                  <Badge variant="outline">{folders.length}</Badge>
                </Button>
              </SheetTrigger>
              <Button size="sm" onClick={openCreateFolderDialog} className="min-w-[92px] w-full shrink-0 rounded-2xl px-4 whitespace-nowrap sm:w-auto">
                <Plus className="mr-1 h-4 w-4" />
                Tạo
              </Button>
            </div>
            <SheetContent side="left" className="w-[88vw] max-w-none rounded-r-[28px] border-border bg-white/95 p-4 backdrop-blur-xl">
              <SheetHeader className="mb-4 pr-8 text-left">
                <SheetTitle>Folders tri thức</SheetTitle>
                <SheetDescription>
                  Chọn folder để xem file, hoặc tạo folder mới cho từng nhóm học liệu.
                </SheetDescription>
              </SheetHeader>
              <KnowledgeFolderList
                folders={folders}
                selectedFolderId={selectedFolderId}
                fileCountByFolderId={fileCountByFolderId}
                onSelectFolder={handleSelectFolder}
              />
            </SheetContent>
          </Sheet>
        </div>

        <Card className="hidden self-start rounded-[24px] border-border bg-white/[0.75] shadow-sm backdrop-blur-xl sm:rounded-[28px] lg:sticky lg:top-6 lg:block lg:max-h-[calc(100vh-2.5rem)] lg:overflow-hidden">
          <CardHeader className="space-y-4 pb-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <CardTitle className="text-lg">Folders</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">Nhóm tài liệu theo chủ đề, môn học hoặc lộ trình.</p>
              </div>
              <Button size="sm" onClick={openCreateFolderDialog} className="w-full sm:w-auto">
                <Plus className="mr-1 h-4 w-4" />
                Tạo mới
              </Button>
            </div>
          </CardHeader>
          <CardContent className="overflow-y-auto pb-6">
            <KnowledgeFolderList
              folders={folders}
              selectedFolderId={selectedFolderId}
              fileCountByFolderId={fileCountByFolderId}
              onSelectFolder={handleSelectFolder}
            />
          </CardContent>
        </Card>

        <Card className="min-w-0 rounded-[24px] border-border bg-white/[0.78] shadow-sm backdrop-blur-xl sm:rounded-[28px]">
          <CardHeader className="space-y-4 pb-4">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div className="min-w-0">
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "relative mt-0.5 flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] ring-1 shadow-sm sm:h-14 sm:w-14 sm:rounded-[20px]",
                    selectedFolder ? getIconAccent(selectedFolder.icon) : "bg-sky-500/12 text-sky-700 ring-sky-500/15",
                  )}>
                    {selectedFolder ? (() => {
                      const SelectedIcon = iconMap[selectedFolder.icon] || Folder;
                      return <SelectedIcon className="h-6 w-6" strokeWidth={2.1} />;
                    })() : <Folder className="h-6 w-6" strokeWidth={2.1} />}
                    <div className="absolute inset-[4px] rounded-[16px] border border-white/40" />
                  </div>
                  <div className="min-w-0">
                    <CardTitle className="text-lg sm:text-xl">
                      {selectedFolder?.name || "Chọn một folder để quản lý file"}
                    </CardTitle>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {selectedFolder?.description || "Bạn có thể tạo nhiều folder để quản lý từng nhóm tài liệu tri thức cho GenAI Tutor."}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:flex xl:flex-wrap xl:justify-end xl:self-start">
                <Button variant="outline" onClick={openEditFolderDialog} disabled={!selectedFolder} className="min-w-[132px] w-full shrink-0 whitespace-nowrap xl:w-auto">
                  <Menu className="mr-2 h-4 w-4" />
                  Sửa folder
                </Button>
                <Button onClick={handleSelectFiles} disabled={!selectedFolder || uploading} className="min-w-[148px] w-full shrink-0 whitespace-nowrap xl:w-auto">
                  {uploading ? (
                    <>
                      <UploadCloud className="mr-2 h-4 w-4 animate-pulse" />
                      Đang tải...
                    </>
                  ) : (
                    <>
                      <FilePlus2 className="mr-2 h-4 w-4" />
                      Tải file lên
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-5">
            <KnowledgeUploadZone
              selectedFolderId={selectedFolderId}
              selectedFolderName={selectedFolder?.name}
              isDragOver={isDragOver}
              uploading={uploading}
              onSelectFiles={handleSelectFiles}
              onDragEnter={(event) => {
                event.preventDefault();
                if (selectedFolderId) setIsDragOver(true);
              }}
              onDragOver={(event) => {
                event.preventDefault();
                if (selectedFolderId) setIsDragOver(true);
              }}
              onDragLeave={(event) => {
                event.preventDefault();
                const nextTarget = event.relatedTarget as Node | null;
                if (!event.currentTarget.contains(nextTarget)) setIsDragOver(false);
              }}
              onDrop={handleDropFiles}
            />

            <KnowledgeFilterBar
              searchQuery={searchQuery}
              statusFilter={statusFilter}
              stageFilter={stageFilter}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSearchChange={setSearchQuery}
              onStatusChange={(value) => setStatusFilter(value as typeof statusFilter)}
              onStageChange={(value) => setStageFilter(value as typeof stageFilter)}
              onSortByChange={(value) => setSortBy(value as typeof sortBy)}
              onSortOrderChange={(value) => setSortOrder(value as typeof sortOrder)}
            />

            <div className="rounded-3xl border border-dashed border-sky-300/60 bg-sky-50/70 p-4 sm:p-5">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="min-w-0 space-y-1">
                  <p className="font-medium text-slate-900">Cơ chế phân quyền cho tương lai đã được chuẩn bị</p>
                  <p className="text-sm text-muted-foreground">
                    Hiện tại trang dành cho teacher. Khi muốn chỉ cho một vài email truy cập, chỉ cần cấu hình biến môi trường `NEXT_PUBLIC_GENAI_TUTOR_ALLOWED_EMAILS`.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">Role: teacher</Badge>
                  <Badge variant="outline">Allowlist-ready</Badge>
                  <Badge variant="outline">Icon source: Lucide</Badge>
                </div>
              </div>
            </div>

            {selectedFolder && (
              <KnowledgeStatsCards
                total={stats.total}
                completed={stats.completed}
                processing={stats.processing}
                failed={stats.failed}
                totalVectors={stats.totalVectors}
                totalSize={stats.totalSize}
              />
            )}

            {selectedFolder && (
              <KnowledgePendingUploadList
                pendingUploads={pendingUploads}
                uploading={uploading}
                onUploadAll={() => uploadSelectedFiles(pendingUploads)}
                onRemove={(id) => setPendingUploads(current => current.filter(queueItem => queueItem.id !== id))}
                onChangeDescription={(id, description) => {
                  setPendingUploads(current => current.map(queueItem => (
                    queueItem.id === id ? { ...queueItem, description } : queueItem
                  )));
                }}
              />
            )}

            {!selectedFolder ? (
              <div className="rounded-3xl border border-dashed border-border bg-black/[0.03] px-4 py-14 text-center sm:px-6 sm:py-16">
                <FolderOpen className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
                <p className="text-lg font-medium">Chưa chọn folder nào</p>
                <p className="mt-2 text-sm text-muted-foreground">Hãy tạo hoặc chọn một folder ở panel bên trái để quản lý file tri thức.</p>
              </div>
            ) : folderFiles.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-border bg-black/[0.03] px-4 py-14 text-center sm:px-6 sm:py-16">
                <UploadCloud className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
                <p className="text-lg font-medium">Folder này chưa có file</p>
                <p className="mt-2 text-sm text-muted-foreground">Hãy tải lên PDF, JSON hoặc dùng nút nạp dataset để đưa các benchmark lớn vào kho tri thức GraphRAG.</p>
                <Button className="mt-5 min-w-[148px] w-full shrink-0 whitespace-nowrap sm:w-auto" onClick={handleSelectFiles}>
                  <UploadCloud className="mr-2 h-4 w-4" />
                  Tải file đầu tiên
                </Button>
                <Button variant="outline" className="mt-3 min-w-[148px] w-full shrink-0 whitespace-nowrap sm:mt-5 sm:w-auto" onClick={() => setDatasetDialogOpen(true)}>
                  <Database className="mr-2 h-4 w-4" />
                  Nạp dataset
                </Button>
              </div>
            ) : (
              <>
                <KnowledgeFileGrid
                  files={visibleFolderFiles}
                  selectedFileIds={selectedFileIds}
                  onToggleSelection={toggleFileSelection}
                   onReprocess={async (file) => {
                    try {
                      if (file.uploadId) {
                        await genaiTutorKnowledgeApi.reprocessKnowledgeFile(file.uploadId);
                        toast.success("Đã đưa file vào hàng chờ xử lý lại");
                        loadKnowledgeData();
                      }
                    }
                    catch (error) {
                      toast.error((error as Error).message || "Không thể xử lý lại file");
                    }
                   }}
                   onOpenGraph={handleOpenGraph}
                   onDelete={(file) => setFileToDelete({ id: file.id, name: file.name, uploadId: file.uploadId })}
                 />
                {folderFiles.length > visibleFolderFiles.length && (
                  <div className="flex justify-center pt-2">
                    <Button variant="outline" onClick={handleLoadMoreVisibleFiles}>
                      Tải thêm {Math.min(24, folderFiles.length - visibleFolderFiles.length)} file
                    </Button>
                  </div>
                )}
              </>
            )}

            <KnowledgeGraphDialog
              open={graphDialogOpen}
              loading={graphLoading}
              snapshot={graphSnapshot}
              fileName={graphFileName}
              error={graphError}
              onOpenChange={setGraphDialogOpen}
            />

            <KnowledgeDatasetImportDialog
              open={datasetDialogOpen}
              loading={false}
              importingKey={importingDatasetKey}
              catalog={datasetCatalog}
              jobs={datasetJobs}
              states={datasetStates}
              selectedFolderId={selectedFolderId}
              onOpenChange={setDatasetDialogOpen}
              onImport={handleImportDataset}
              onCancel={(job) => setDatasetJobToCancel(job)}
              onClear={(datasetKey) => setDatasetKeyToClear(datasetKey)}
            />

            {totalFiles > 12 && (
              <div className="flex flex-col gap-3 border-t border-border/70 pt-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
                  Trang {page} · Tổng {totalFiles} file
                </p>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto"
                    disabled={page <= 1}
                    onClick={() => setPage(current => Math.max(1, current - 1))}
                  >
                    Trang trước
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto"
                    disabled={page * 12 >= totalFiles}
                    onClick={() => setPage(current => current + 1)}
                  >
                    Trang sau
                  </Button>
                </div>
              </div>
            )}

            {selectedFolder && (
              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
                <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                  <Button variant="outline" onClick={() => setDatasetDialogOpen(true)} disabled={!selectedFolder}>
                    <Database className="mr-2 h-4 w-4" />
                    Nạp dataset
                  </Button>
                  <Button variant="outline" onClick={handleSelectAllCurrentPage} disabled={folderFiles.length === 0}>
                    Chọn tất cả trang này
                  </Button>
                  <Button variant="outline" onClick={handleClearSelection} disabled={selectedFileIds.length === 0}>
                    Bỏ chọn
                  </Button>
                  <Button variant="outline" onClick={() => setConfirmBulkReprocessOpen(true)} disabled={selectedFileIds.length === 0}>
                    Xử lý lại file đã chọn
                  </Button>
                  <Button variant="outline" onClick={() => setConfirmBulkDeleteOpen(true)} disabled={selectedFileIds.length === 0}>
                    Xóa file đã chọn
                  </Button>
                </div>
                <Button
                  variant="outline"
                  className="min-w-[156px] w-full shrink-0 whitespace-nowrap text-destructive hover:text-destructive sm:w-auto"
                  onClick={() => setConfirmDeleteFolderOpen(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Xóa folder này
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <AlertDialog open={confirmBulkDeleteOpen} onOpenChange={setConfirmBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa {selectedFileIds.length} file đã chọn?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này sẽ xóa {selectedFileIds.length} file khỏi hệ thống, đồng thời xóa vector và object liên quan trên R2. Không thể hoàn tác.
            </AlertDialogDescription>
            {selectedFilesPreview.length > 0 && (
              <div className="mt-3 rounded-2xl border border-border bg-black/[0.03] p-3 text-left text-xs text-muted-foreground">
                <div className="mb-2 font-medium text-foreground">Một số file sẽ bị xóa:</div>
                <div className="space-y-1">
                  {selectedFilesPreview.map(file => (
                    <div key={file.id}>- {file.name}</div>
                  ))}
                  {selectedFileIds.length > selectedFilesPreview.length && (
                    <div>... và {selectedFileIds.length - selectedFilesPreview.length} file khác</div>
                  )}
                </div>
              </div>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={confirmActionLoading === "bulk-delete"}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                setConfirmActionLoading("bulk-delete");
                await handleBulkDelete();
                setConfirmActionLoading(null);
                setConfirmBulkDeleteOpen(false);
              }}
              className={confirmActionLoading === "bulk-delete" ? "pointer-events-none opacity-60" : ""}
            >
              {confirmActionLoading === "bulk-delete" ? "Đang xóa..." : "Xóa file"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmBulkReprocessOpen} onOpenChange={setConfirmBulkReprocessOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xử lý lại {selectedFileIds.length} file đã chọn?</AlertDialogTitle>
            <AlertDialogDescription>
              Hệ thống sẽ đưa {selectedFileIds.length} file vào hàng chờ OCR, chunking, embedding và lưu vector lại từ đầu. Nên dùng thao tác này khi file thất bại hoặc khi bạn muốn tái xử lý tri thức.
            </AlertDialogDescription>
            {selectedFilesPreview.length > 0 && (
              <div className="mt-3 rounded-2xl border border-border bg-black/[0.03] p-3 text-left text-xs text-muted-foreground">
                <div className="mb-2 font-medium text-foreground">Một số file sẽ được xử lý lại:</div>
                <div className="space-y-1">
                  {selectedFilesPreview.map(file => (
                    <div key={file.id}>- {file.name}</div>
                  ))}
                  {selectedFileIds.length > selectedFilesPreview.length && (
                    <div>... và {selectedFileIds.length - selectedFilesPreview.length} file khác</div>
                  )}
                </div>
              </div>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={confirmActionLoading === "bulk-reprocess"}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                setConfirmActionLoading("bulk-reprocess");
                await handleBulkReprocess();
                setConfirmActionLoading(null);
                setConfirmBulkReprocessOpen(false);
              }}
              className={confirmActionLoading === "bulk-reprocess" ? "pointer-events-none opacity-60" : ""}
            >
              {confirmActionLoading === "bulk-reprocess" ? "Đang đưa vào queue..." : "Xử lý lại file"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmDeleteFolderOpen} onOpenChange={setConfirmDeleteFolderOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa toàn bộ folder này và {stats.total} file bên trong?</AlertDialogTitle>
            <AlertDialogDescription>
              Folder sẽ bị xóa cùng {stats.total} file, toàn bộ vector embeddings và object trên R2 bên trong. Đây là deep delete và không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={confirmActionLoading === "folder-delete"}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                setConfirmActionLoading("folder-delete");
                await handleDeleteFolder();
                setConfirmActionLoading(null);
                setConfirmDeleteFolderOpen(false);
              }}
              className={confirmActionLoading === "folder-delete" ? "pointer-events-none opacity-60" : ""}
            >
              {confirmActionLoading === "folder-delete" ? "Đang xóa folder..." : "Xóa folder"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={Boolean(fileToDelete)} onOpenChange={(open) => { if (!open) setFileToDelete(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa file "{fileToDelete?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              File này sẽ bị xóa khỏi hệ thống, đồng thời xóa vector và object tương ứng trên R2. Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={confirmActionLoading === "file-delete"}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!fileToDelete) return;
                setConfirmActionLoading("file-delete");
                try {
                  if (fileToDelete.uploadId) {
                    await genaiTutorKnowledgeApi.deleteKnowledgeFile(fileToDelete.uploadId);
                  }
                  removeFile(fileToDelete.id);
                  toast.success("Đã xóa file khỏi hệ thống");
                }
                catch (error) {
                  toast.error((error as Error).message || "Không thể xóa file");
                }
                finally {
                  setConfirmActionLoading(null);
                  setFileToDelete(null);
                }
              }}
              className={confirmActionLoading === "file-delete" ? "pointer-events-none opacity-60" : ""}
            >
              {confirmActionLoading === "file-delete" ? "Đang xóa file..." : "Xóa file"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={Boolean(datasetJobToCancel)} onOpenChange={(open) => { if (!open) setDatasetJobToCancel(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hủy job nạp dataset "{datasetJobToCancel?.title}"?</AlertDialogTitle>
            <AlertDialogDescription>
              Nếu bạn hủy, hệ thống sẽ xóa toàn bộ dữ liệu dataset đã nạp một phần hoặc hoàn tất bởi job này trong folder hiện tại. Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Quay lại</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelDatasetImport}>
              Xác nhận hủy và xóa dữ liệu
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={Boolean(datasetKeyToClear)} onOpenChange={(open) => { if (!open) setDatasetKeyToClear(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear dataset "{datasetKeyToClear}"?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này sẽ xóa toàn bộ dữ liệu đã nạp của dataset, bao gồm cache nguồn tải về, lịch sử import và toàn bộ document/chunk/graph đã lưu trong DB. Không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Quay lại</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearDataset}>
              Xóa toàn bộ dataset
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <KnowledgeFolderDialog
        open={folderDialogOpen}
        editingFolderId={editingFolderId}
        folderName={folderName}
        folderDescription={folderDescription}
        folderIcon={folderIcon}
        onOpenChange={setFolderDialogOpen}
        onFolderNameChange={setFolderName}
        onFolderDescriptionChange={setFolderDescription}
        onFolderIconChange={setFolderIcon}
        onSave={handleSaveFolder}
      />
    </div>
  );
}
