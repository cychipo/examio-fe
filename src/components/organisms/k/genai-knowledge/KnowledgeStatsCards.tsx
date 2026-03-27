import { Card, CardContent } from "@/components/ui/card";

import { formatBytes } from "./knowledge-constants";

interface KnowledgeStatsCardsProps {
  total: number;
  completed: number;
  processing: number;
  failed: number;
  totalVectors?: number;
  totalSize?: number;
}

export function KnowledgeStatsCards(props: KnowledgeStatsCardsProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <Card className="rounded-2xl border-border/70 bg-white/80"><CardContent className="p-4"><div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Trong folder</div><div className="mt-2 text-2xl font-semibold">{props.total}</div></CardContent></Card>
      <Card className="rounded-2xl border-border/70 bg-white/80"><CardContent className="p-4"><div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Completed</div><div className="mt-2 text-2xl font-semibold text-emerald-600">{props.completed}</div></CardContent></Card>
      <Card className="rounded-2xl border-border/70 bg-white/80"><CardContent className="p-4"><div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Processing</div><div className="mt-2 text-2xl font-semibold text-sky-600">{props.processing}</div></CardContent></Card>
      <Card className="rounded-2xl border-border/70 bg-white/80"><CardContent className="p-4"><div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Failed</div><div className="mt-2 text-2xl font-semibold text-rose-600">{props.failed}</div></CardContent></Card>
      <Card className="rounded-2xl border-border/70 bg-white/80"><CardContent className="p-4"><div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Vectors</div><div className="mt-2 text-2xl font-semibold">{props.totalVectors || 0}</div></CardContent></Card>
      <Card className="rounded-2xl border-border/70 bg-white/80"><CardContent className="p-4"><div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Storage</div><div className="mt-2 text-2xl font-semibold">{formatBytes(props.totalSize || 0)}</div></CardContent></Card>
    </div>
  );
}
