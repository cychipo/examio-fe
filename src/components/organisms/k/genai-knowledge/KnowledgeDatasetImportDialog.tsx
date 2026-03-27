import { useMemo } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { GenAIKnowledgeDatasetCatalogItem, GenAIKnowledgeDatasetImportJob } from "@/types/genai-knowledge";

interface KnowledgeDatasetImportDialogProps {
  open: boolean;
  loading: boolean;
  importingKey?: string | null;
  catalog: GenAIKnowledgeDatasetCatalogItem[];
  jobs: GenAIKnowledgeDatasetImportJob[];
  onOpenChange: (open: boolean) => void;
  onImport: (datasetKey: string) => void;
  onCancel: (job: GenAIKnowledgeDatasetImportJob) => void;
}

export function KnowledgeDatasetImportDialog(props: KnowledgeDatasetImportDialogProps) {
  const jobMap = useMemo(() => {
    const sorted = [...props.jobs].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
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
            const job = jobMap.get(item.datasetKey);
            const isImporting = props.importingKey === item.datasetKey;
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
                    {job && (
                      <div className="space-y-2 pt-1">
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <Badge variant="outline">{job.status}</Badge>
                          <Badge variant="outline">{job.stage}</Badge>
                          <span className="text-muted-foreground">{job.progress}%</span>
                          <span className="text-muted-foreground">{job.processedFiles}/{job.totalFiles || job.downloadedFiles || 0} file</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                          <div className="h-full rounded-full bg-sky-500 transition-all" style={{ width: `${Math.max(4, job.progress || 0)}%` }} />
                        </div>
                        {job.message && <p className="text-xs text-muted-foreground">{job.message}</p>}
                        {job.errorMessage && <p className="text-xs text-destructive">{job.errorMessage}</p>}
                        {job.metadata?.result && (
                          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            <Badge variant="outline">{job.metadata.result.documents} docs</Badge>
                            <Badge variant="outline">{job.metadata.result.chunks} chunks</Badge>
                            <Badge variant="outline">{job.metadata.result.entities} entities</Badge>
                            <Badge variant="outline">{job.metadata.result.relations} relations</Badge>
                          </div>
                        )}
                        {job.status === "cancelling" && (
                          <p className="text-xs font-medium text-amber-700">Đang hủy và dọn dữ liệu đã nạp...</p>
                        )}
                        {["queued", "downloading", "processing"].includes(job.status) && (
                          <Button variant="outline" size="sm" className="mt-2" onClick={() => props.onCancel(job)}>
                            Hủy nạp dataset
                          </Button>
                        )}
                      </div>
                    )}
                  </div>

                  <Button
                    className="min-w-[144px]"
                    disabled={props.loading || isImporting || job?.status === "processing" || job?.status === "downloading" || job?.status === "cancelling"}
                    onClick={() => props.onImport(item.datasetKey)}
                  >
                    {isImporting ? "Đang tạo job..." : "Nạp dataset"}
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
