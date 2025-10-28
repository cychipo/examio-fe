import { FileText, BookOpen, CheckCircle2, Clock, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface HistoryItemIconProps {
  type: "pdf" | "exam" | "flashcard";
  status?: "completed" | "processing" | "failed";
  className?: string;
}

export function HistoryItemIcon({
  type,
  status,
  className,
}: HistoryItemIconProps) {
  const getIcon = () => {
    if (status === "completed") {
      return <CheckCircle2 className="h-4 w-4" />;
    }
    if (status === "processing") {
      return <Clock className="h-4 w-4" />;
    }
    if (status === "failed") {
      return <XCircle className="h-4 w-4" />;
    }

    switch (type) {
      case "pdf":
        return <FileText className="h-4 w-4" />;
      case "exam":
        return <BookOpen className="h-4 w-4" />;
      case "flashcard":
        return <BookOpen className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getColorClass = () => {
    if (status === "completed")
      return "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400";
    if (status === "processing")
      return "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400";
    if (status === "failed")
      return "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400";

    return "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400";
  };

  return (
    <div
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-lg",
        getColorClass(),
        className
      )}>
      {getIcon()}
    </div>
  );
}
