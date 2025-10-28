import { Hash } from "lucide-react";

export interface TrendingTopic {
  id: string;
  tag: string;
  count: number;
}

interface TrendingTopicItemProps {
  topic: TrendingTopic;
  onClick?: () => void;
}

export function TrendingTopicItem({ topic, onClick }: TrendingTopicItemProps) {
  return (
    <div
      onClick={onClick}
      className="flex cursor-pointer items-center justify-between rounded-lg p-2 transition-colors hover:bg-muted">
      <div className="flex items-center gap-2">
        <Hash className="h-4 w-4 text-primary" />
        <span className="font-medium text-foreground">{topic.tag}</span>
      </div>
      <span className="text-sm text-muted-foreground">
        {topic.count} bài viết
      </span>
    </div>
  );
}
