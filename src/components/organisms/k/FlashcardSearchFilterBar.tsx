import { SearchBar } from "@/components/molecules/SearchBar";
import {
  FilterSelect,
  FilterOption,
} from "@/components/molecules/FilterSelect";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal } from "lucide-react";

interface FlashcardSearchFilterBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  sortBy: string;
  statusFilter: string;
  sortOptions: FilterOption[];
  statusOptions: FilterOption[];
  onSortChange: (value: string) => void;
  onStatusChange: (value: string) => void;
}

export function FlashcardSearchFilterBar({
  searchQuery,
  onSearchChange,
  sortBy,
  statusFilter,
  sortOptions,
  statusOptions,
  onSortChange,
  onStatusChange,
}: FlashcardSearchFilterBarProps) {
  return (
    <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between mb-6 p-4 bg-card rounded-lg border border-border">
      <SearchBar
        value={searchQuery}
        onChange={onSearchChange}
        placeholder="Tìm kiếm flashcard..."
      />
      <div className="flex items-center gap-2 w-full md:w-auto">
        <FilterSelect
          value={sortBy}
          options={sortOptions}
          placeholder="Sắp xếp"
          onValueChange={onSortChange}
          className="w-[140px]"
        />
        <FilterSelect
          value={statusFilter}
          options={statusOptions}
          placeholder="Trạng thái"
          onValueChange={onStatusChange}
          className="w-[140px]"
        />
        <Button variant="outline" size="icon" className="shrink-0">
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
