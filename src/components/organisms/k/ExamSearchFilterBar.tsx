import { SearchBar } from "@/components/molecules/SearchBar";
import {
  FilterSelect,
  FilterOption,
} from "@/components/molecules/FilterSelect";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal } from "lucide-react";

interface ExamSearchFilterBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  categoryFilter: string;
  statusOptions: FilterOption[];
  categoryOptions: FilterOption[];
  onStatusChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
}

export function ExamSearchFilterBar({
  searchQuery,
  onSearchChange,
  statusFilter,
  categoryFilter,
  statusOptions,
  categoryOptions,
  onStatusChange,
  onCategoryChange,
}: ExamSearchFilterBarProps) {
  return (
    <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between mb-6 p-4 bg-card rounded-lg border border-border">
      <SearchBar
        value={searchQuery}
        onChange={onSearchChange}
        placeholder="Tìm kiếm đề thi..."
      />
      <div className="flex items-center gap-2 w-full md:w-auto">
        <FilterSelect
          value={statusFilter}
          options={statusOptions}
          placeholder="Trạng thái"
          onValueChange={onStatusChange}
          className="w-[160px]"
        />
        <FilterSelect
          value={categoryFilter}
          options={categoryOptions}
          placeholder="Danh mục"
          onValueChange={onCategoryChange}
          className="w-[160px]"
        />
        <Button variant="outline" size="icon" className="shrink-0">
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
