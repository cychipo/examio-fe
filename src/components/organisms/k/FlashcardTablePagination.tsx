import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface FlashcardTablePaginationProps {
  currentPage: number;
  totalPages: number;
  totalResults: number;
  onPageChange: (page: number) => void;
}

export function FlashcardTablePagination({
  currentPage,
  totalPages,
  totalResults,
  onPageChange,
}: FlashcardTablePaginationProps) {
  const startResult = (currentPage - 1) * 10 + 1;
  const endResult = Math.min(currentPage * 10, totalResults);

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisible = 3;

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 2) {
        pages.push(1, 2, 3);
      } else if (currentPage >= totalPages - 1) {
        pages.push(totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(currentPage - 1, currentPage, currentPage + 1);
      }
    }

    return pages;
  };

  return (
    <div className="flex items-center justify-between px-4 py-4 border-t border-border bg-card rounded-b-lg">
      <div className="text-sm text-muted-foreground">
        Hiển thị {startResult} - {endResult} trong tổng số {totalResults} kết
        quả
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="h-8">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Trước
        </Button>
        {renderPageNumbers().map((page) => (
          <Button
            key={page}
            variant={currentPage === page ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(page)}
            className={`h-8 w-8 p-0 ${
              currentPage === page
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : ""
            }`}>
            {page}
          </Button>
        ))}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="h-8">
          Sau
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
