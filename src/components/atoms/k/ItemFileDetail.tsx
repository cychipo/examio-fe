import { FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";

interface ItemFileDetailProps {
  fileName: string;
  fileSize: number;
  onRemove: () => void;
}

export function ItemFileDetail({
  fileName,
  fileSize,
  onRemove,
}: ItemFileDetailProps) {
  const formatBytes = (bytes: number, decimals = 2): string => {
    if (!+bytes)
      return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${Number.parseFloat((bytes / k ** i).toFixed(dm))} ${sizes[i]}`;
  };

  return (
    <Item variant="outline" className="w-full">
      <ItemMedia>
        <FileText className="size-5 text-primary" />
      </ItemMedia>
      <ItemContent>
        <ItemTitle className="text-sm font-medium truncate">
          {fileName}
        </ItemTitle>
        <ItemDescription className="text-xs">
          {formatBytes(fileSize)}
        </ItemDescription>
      </ItemContent>
      <ItemActions>
        <Button
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
        >
          <X className="size-4" />
        </Button>
      </ItemActions>
    </Item>
  );
}
