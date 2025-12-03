import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ExamStatusBadge,
  ExamStatus,
} from "@/components/atoms/k/ExamStatusBadge";
import { Edit, Trash2, LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface ManagementTableData {
  id: string;
  icon: string;
  thumbnail?: string | null;
  name: string;
  description: string;
  questionCount: number;
  countLabel: string; // "câu hỏi" hoặc "thẻ"
  status: ExamStatus;
  createdDate: string;
  lastStudied: string | null; // Học gần nhất
  tags: string[];
}

interface ManagementTableProps {
  title: string;
  data: ManagementTableData[];
  primaryActionIcon: LucideIcon;
  primaryActionLabel: string;
  secondaryActionIcon?: LucideIcon;
  secondaryActionLabel?: string;
  countColumnLabel: string;
  onPrimaryAction: (id: string) => void;
  onSecondaryAction?: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  emptyMessage?: string;
}

export function ManagementTable({
  title,
  data,
  primaryActionIcon: PrimaryIcon,
  primaryActionLabel,
  secondaryActionIcon: SecondaryIcon,
  secondaryActionLabel,
  countColumnLabel,
  onPrimaryAction,
  onSecondaryAction,
  onEdit,
  onDelete,
  emptyMessage = "Không có dữ liệu",
}: ManagementTableProps) {
  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border">
              <TableHead className="text-muted-foreground font-medium">
                Tên
              </TableHead>
              <TableHead className="text-muted-foreground font-medium">
                {countColumnLabel}
              </TableHead>
              <TableHead className="text-muted-foreground font-medium">
                Trạng thái
              </TableHead>
              <TableHead className="text-muted-foreground font-medium">
                Ngày tạo
              </TableHead>
              <TableHead className="text-muted-foreground font-medium">
                Học gần nhất
              </TableHead>
              <TableHead className="text-muted-foreground font-medium text-right">
                Hành động
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow
                key={item.id}
                className="hover:bg-muted/50 border-border">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 shrink-0 overflow-hidden">
                      {item.thumbnail ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={item.thumbnail}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-lg">{item.icon}</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-foreground truncate">
                        {item.name}
                      </div>
                      <div className="text-sm text-muted-foreground truncate">
                        {item.description}
                      </div>
                      {item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {item.tags.slice(0, 2).map((tag) => (
                            <Badge
                              key={tag}
                              variant="outline"
                              className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {item.tags.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{item.tags.length - 2}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-foreground font-medium">
                    {item.questionCount} {item.countLabel}
                  </span>
                </TableCell>
                <TableCell>
                  <ExamStatusBadge status={item.status} />
                </TableCell>
                <TableCell>
                  <span className="text-foreground">{item.createdDate}</span>
                </TableCell>
                <TableCell>
                  <span className="text-muted-foreground">
                    {item.lastStudied || "Chưa làm"}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    {item.questionCount > 0 && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            onClick={() => onPrimaryAction(item.id)}>
                            <PrimaryIcon className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{primaryActionLabel}</p>
                        </TooltipContent>
                      </Tooltip>
                    )}

                    {SecondaryIcon && onSecondaryAction && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                            onClick={() => onSecondaryAction(item.id)}>
                            <SecondaryIcon className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{secondaryActionLabel}</p>
                        </TooltipContent>
                      </Tooltip>
                    )}

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                          onClick={() => onEdit(item.id)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Chỉnh sửa</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => onDelete(item.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Xóa</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {data.length === 0 && (
        <div className="p-12 text-center">
          <p className="text-muted-foreground">{emptyMessage}</p>
        </div>
      )}
    </div>
  );
}
