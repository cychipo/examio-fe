import { useMemo } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { GenAIKnowledgeDatasetCatalogItem, GenAIKnowledgeDatasetImportJob, GenAIKnowledgeDatasetState } from "@/types/genai-knowledge";

interface KnowledgeDatasetImportDialogProps {
  open: boolean;
  loading: boolean;
  importingKey?: string | null;
  catalog: GenAIKnowledgeDatasetCatalogItem[];
  jobs: GenAIKnowledgeDatasetImportJob[];
  states: GenAIKnowledgeDatasetState[];
  selectedFolderId?: string | null;
  onOpenChange: (open: boolean) => void;
  onImport: (datasetKey: string) => void;
  onCancel: (job: GenAIKnowledgeDatasetImportJob) => void;
  onClear: (datasetKey: string) => void;
}

function getStatusLabel(status: string | undefined) {
  switch (status) {
    case "queued":
      return "Đã xếp hàng";
    case "downloading":
      return "Đang tải";
    case "processing":
      return "Đang xử lý";
    case "completed":
      return "Hoàn tất";
    case "failed":
      return "Thất bại";
    case "cancelling":
      return "Đang hủy";
    case "cancelled":
      return "Đã hủy";
    default:
      return status || "Không rõ";
  }
}

function getStageLabel(stage: string | undefined) {
  switch (stage) {
    case "queued":
      return "Chờ chạy";
    case "downloading":
      return "Tải dataset";
    case "ingesting":
      return "Nạp dữ liệu";
    case "graphing":
      return "Dựng graph";
    case "completed":
      return "Hoàn tất";
    case "failed":
      return "Thất bại";
    case "cancelling":
      return "Đang hủy";
    case "cancelled":
      return "Đã hủy";
    default:
      return stage || "Không rõ";
  }
}

export function KnowledgeDatasetImportDialog(props: KnowledgeDatasetImportDialogProps) {
  const stateMap = useMemo(() => new Map(props.states.map(state => [state.datasetKey, state])), [props.states]);
  const jobMap = useMemo(() => {
    const priority = (job: GenAIKnowledgeDatasetImportJob) => {
      if (["queued", "downloading", "processing", "cancelling"].includes(job.status)) return 3;
      if (job.status === "completed") return 2;
      if (job.status === "failed") return 1;
      return 0;
    };

    const sorted = [...props.jobs].sort((a, b) => {
      const byPriority = priority(b) - priority(a);
      if (byPriority !== 0) return byPriority;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
    return new Map(sorted.map(job => [job.datasetKey, job]));
  }, [props.jobs]);

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Nạp Dataset</DialogTitle>
          <DialogDescription>
            Hệ thống sẽ tự tải dataset về server, nạp toàn bộ vào GraphRAG và bạn có thể theo dõi tiến độ trực tiếp.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 max-h-[70vh] overflow-auto pr-1">
          {props.catalog.map(item => {
            const state = stateMap.get(item.datasetKey);
            const job = state?.latestJob || jobMap.get(item.datasetKey);
            const isImporting = props.importingKey === item.datasetKey;
            const importedInCurrentFolder = Boolean(state?.imported && state.importedFolderId === props.selectedFolderId);
            const importedElsewhere = Boolean(state?.imported && state.importedFolderId && state.importedFolderId !== props.selectedFolderId);
            const hasActiveJob = Boolean(job && ["queued", "downloading", "processing", "cancelling"].includes(job.status));
            return (
              <div key={item.datasetKey} className="rounded-2xl border border-border bg-black/[0.02] p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-medium">{item.title}</h3>
                      <Badge variant="outline">{item.language || "mixed"}</Badge>
                      <Badge variant="outline">{item.source}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                    <p className="text-xs text-muted-foreground break-all">{item.repository}</p>
                    {importedInCurrentFolder && (
                      <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                        Dataset này đã được nạp vào folder hiện tại.
                      </div>
                    )}
                    {importedElsewhere && (
                      <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                        Dataset này đã được nạp ở folder khác ({state?.importedFolderName || state?.importedFolderId}).
                      </div>
                    )}
                    {(job || state?.lastSuccessfulJob) && (
                      <div className="space-y-2 pt-1">
                        {job && (
                          <>
                            <div className="flex flex-wrap items-center gap-2 text-xs">
                              <Badge variant="outline">{getStatusLabel(job.status)}</Badge>
                              <Badge variant="outline">{getStageLabel(job.stage)}</Badge>
                              <span className="text-muted-foreground">{job.progress}%</span>
                              <span className="text-muted-foreground">{job.processedFiles}/{job.totalFiles || job.downloadedFiles || 0} file</span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                              <div className="h-full rounded-full bg-sky-500 transition-all" style={{ width: `${Math.max(4, job.progress || 0)}%` }} />
                            </div>
                            {job.message && <p className="text-xs text-muted-foreground">{job.message}</p>}
                            {job.message?.includes("R2") && !job.errorMessage && (
                              <p className="text-xs font-medium text-sky-700">Job đang tái sử dụng artifact đã cache trên R2.</p>
                            )}
                            {job.errorMessage && !importedInCurrentFolder && <p className="text-xs text-destructive">{job.errorMessage}</p>}
                          </>
                        )}
                        {(job?.metadata?.result || state?.lastSuccessfulJob?.metadata?.result) && (
                          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            <Badge variant="outline">{(job?.metadata?.result || state?.lastSuccessfulJob?.metadata?.result)?.documents} docs</Badge>
                            <Badge variant="outline">{(job?.metadata?.result || state?.lastSuccessfulJob?.metadata?.result)?.chunks} chunks</Badge>
                            <Badge variant="outline">{(job?.metadata?.result || state?.lastSuccessfulJob?.metadata?.result)?.entities} entities</Badge>
                            <Badge variant="outline">{(job?.metadata?.result || state?.lastSuccessfulJob?.metadata?.result)?.relations} relations</Badge>
                          </div>
                        )}
                        {(job?.artifactUrl || state?.lastSuccessfulJob?.artifactUrl) && (
                          <p className="text-xs text-muted-foreground break-all">
                            Artifact R2: {job?.artifactKeyR2 || state?.lastSuccessfulJob?.artifactKeyR2}
                          </p>
                        )}
                        {job?.status === "cancelling" && (
                          <p className="text-xs font-medium text-amber-700">Đang hủy và dọn dữ liệu đã nạp...</p>
                        )}
                        {importedInCurrentFolder && !hasActiveJob && (
                          <Button variant="outline" size="sm" className="mt-2 text-destructive hover:text-destructive" onClick={() => props.onClear(item.datasetKey)}>
                            Xóa dataset
                          </Button>
                        )}
                        {job && ["queued", "downloading", "processing"].includes(job.status) && (
                          <Button variant="outline" size="sm" className="mt-2" onClick={() => props.onCancel(job)}>
                            Hủy nạp dataset
                          </Button>
                        )}
                      </div>
                    )}
                  </div>

                    <Button
                      className="min-w-[144px]"
                      disabled={props.loading || isImporting || importedInCurrentFolder || importedElsewhere || job?.status === "processing" || job?.status === "downloading" || job?.status === "cancelling"}
                      onClick={() => props.onImport(item.datasetKey)}
                    >
                      {importedInCurrentFolder ? "Đã nạp" : isImporting ? "Đang tạo job..." : "Nạp dataset"}
                    </Button>
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
