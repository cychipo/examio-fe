import { memo } from "react";
import { SearchBar } from "@/components/molecules/SearchBar";
import {
  FilterSelect,
  FilterOption,
} from "@/components/molecules/FilterSelect";

interface ExamSearchFilterBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  statusOptions: FilterOption[];
  onStatusChange: (value: string) => void;
}

const ExamSearchFilterBarComponent = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  statusOptions,
  onStatusChange,
}: ExamSearchFilterBarProps) => {
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
      </div>
    </div>
  );
};

ExamSearchFilterBarComponent.displayName = "ExamSearchFilterBar";

export const ExamSearchFilterBar = memo(ExamSearchFilterBarComponent);
