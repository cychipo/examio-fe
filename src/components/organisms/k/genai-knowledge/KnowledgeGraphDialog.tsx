import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GenAIKnowledgeGraphSnapshot } from "@/types/genai-knowledge";

interface KnowledgeGraphDialogProps {
  open: boolean;
  loading: boolean;
  snapshot: GenAIKnowledgeGraphSnapshot | null;
  fileName?: string;
  error?: string | null;
  onOpenChange: (open: boolean) => void;
}

export function KnowledgeGraphDialog(props: KnowledgeGraphDialogProps) {
  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Knowledge Graph Preview</DialogTitle>
          <DialogDescription>
            {props.fileName ? `Đồ thị tri thức được sinh từ file ${props.fileName}` : "Xem entity và relation đã được GraphRAG tạo ra"}
          </DialogDescription>
        </DialogHeader>

        {props.loading ? (
          <div className="py-10 text-sm text-muted-foreground">Đang tải graph snapshot...</div>
        ) : props.error ? (
          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
            {props.error}
          </div>
        ) : !props.snapshot ? (
          <div className="py-10 text-sm text-muted-foreground">Chưa có graph cho file này.</div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div className="rounded-2xl border border-border bg-black/[0.02] p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="font-medium">Entities</h3>
                <Badge variant="outline">{props.snapshot.entities.length}</Badge>
              </div>
              <div className="max-h-[420px] space-y-2 overflow-auto pr-1">
                {props.snapshot.entities.map(entity => (
                  <div key={entity.id} className="rounded-xl border border-border/70 bg-white/70 p-3 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{entity.name}</span>
                      {entity.entityType && <Badge variant="outline">{entity.entityType}</Badge>}
                    </div>
                    {entity.canonicalName && (
                      <p className="mt-1 text-xs text-muted-foreground">{entity.canonicalName}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-black/[0.02] p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="font-medium">Relations</h3>
                <Badge variant="outline">{props.snapshot.relations.length}</Badge>
              </div>
              <div className="max-h-[420px] space-y-2 overflow-auto pr-1">
                {props.snapshot.relations.map(relation => (
                  <div key={relation.id} className="rounded-xl border border-border/70 bg-white/70 p-3 text-sm">
                    <p className="font-medium">{relation.from_name} → {relation.to_name}</p>
                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline">{relation.relationType}</Badge>
                      <span>w={relation.weight.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-2 flex justify-end">
              <Button variant="outline" onClick={() => props.onOpenChange(false)}>
                Đóng
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
