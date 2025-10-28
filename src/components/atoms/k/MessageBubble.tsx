import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

interface MessageBubbleProps {
  message: string;
  isOwn: boolean;
  timestamp: string;
  codeBlock?: {
    language: string;
    code: string;
  };
}

export function MessageBubble({
  message,
  isOwn,
  timestamp,
  codeBlock,
}: MessageBubbleProps) {
  return (
    <div className={cn("flex w-full", isOwn ? "justify-end" : "justify-start")}>
      <div className={cn("max-w-[70%] space-y-1", isOwn && "items-end")}>
        <Card
          className={cn(
            "px-4 py-2",
            isOwn ? "bg-primary text-primary-foreground" : "bg-muted"
          )}>
          <p className="text-sm whitespace-pre-wrap break-words">{message}</p>
          {codeBlock && (
            <Card className="mt-2 bg-slate-900 p-3 text-sm">
              <pre className="overflow-x-auto">
                <code className="text-slate-100 font-mono text-xs">
                  {codeBlock.code}
                </code>
              </pre>
            </Card>
          )}
        </Card>
        <p className="px-2 text-xs text-muted-foreground">{timestamp}</p>
      </div>
    </div>
  );
}
