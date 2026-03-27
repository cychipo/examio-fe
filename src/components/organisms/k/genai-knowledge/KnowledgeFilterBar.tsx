import { Input } from "@/components/ui/input";

interface KnowledgeFilterBarProps {
  searchQuery: string;
  statusFilter: string;
  stageFilter: string;
  sortBy: string;
  sortOrder: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onStageChange: (value: string) => void;
  onSortByChange: (value: string) => void;
  onSortOrderChange: (value: string) => void;
}

export function KnowledgeFilterBar(props: KnowledgeFilterBarProps) {
  return (
    <div className="grid gap-3 rounded-3xl border border-border bg-black/[0.02] p-4 sm:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_180px_180px_160px_160px]">
      <Input
        value={props.searchQuery}
        onChange={event => props.onSearchChange(event.target.value)}
        placeholder="Tìm theo tên file hoặc mô tả..."
      />
      <select
        value={props.statusFilter}
        onChange={event => props.onStatusChange(event.target.value)}
        className="h-11 rounded-xl border border-border bg-black/5 px-4 text-sm"
      >
        <option value="ALL">Tất cả trạng thái</option>
        <option value="PENDING">PENDING</option>
        <option value="PROCESSING">PROCESSING</option>
        <option value="COMPLETED">COMPLETED</option>
        <option value="FAILED">FAILED</option>
      </select>
      <select
        value={props.stageFilter}
        onChange={event => props.onStageChange(event.target.value)}
        className="h-11 rounded-xl border border-border bg-black/5 px-4 text-sm"
      >
        <option value="ALL">Tất cả stage</option>
        <option value="queued">queued</option>
        <option value="downloading">downloading</option>
        <option value="extracting">extracting</option>
        <option value="chunking">chunking</option>
        <option value="embedding">embedding</option>
        <option value="completed">completed</option>
        <option value="failed">failed</option>
      </select>
      <select
        value={props.sortBy}
        onChange={event => props.onSortByChange(event.target.value)}
        className="h-11 rounded-xl border border-border bg-black/5 px-4 text-sm"
      >
        <option value="createdAt">Ngày tạo</option>
        <option value="filename">Tên file</option>
        <option value="status">Trạng thái</option>
        <option value="size">Kích thước</option>
      </select>
      <select
        value={props.sortOrder}
        onChange={event => props.onSortOrderChange(event.target.value)}
        className="h-11 rounded-xl border border-border bg-black/5 px-4 text-sm"
      >
        <option value="desc">Mới nhất</option>
        <option value="asc">Cũ nhất / A-Z</option>
      </select>
    </div>
  );
}
