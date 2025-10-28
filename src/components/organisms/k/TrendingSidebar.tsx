import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TrendingTopicItem,
  type TrendingTopic,
} from "@/components/molecules/TrendingTopicItem";
import {
  UpcomingSessionCard,
  type StudySession,
} from "@/components/molecules/UpcomingSessionCard";
import { Button } from "@/components/ui/button";

interface TrendingSidebarProps {
  trendingTopics: TrendingTopic[];
  upcomingSessions: StudySession[];
  onTopicClick?: (topicId: string) => void;
  onSessionJoin?: (sessionId: string) => void;
}

export function TrendingSidebar({
  trendingTopics,
  upcomingSessions,
  onTopicClick,
  onSessionJoin,
}: TrendingSidebarProps) {
  return (
    <div className="space-y-6">
      {/* Trending Topics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">
            Chủ đề xu hướng
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {trendingTopics.map((topic) => (
            <TrendingTopicItem
              key={topic.id}
              topic={topic}
              onClick={() => onTopicClick?.(topic.id)}
            />
          ))}
        </CardContent>
      </Card>

      {/* Upcoming Study Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">
            Buổi học sắp tới
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {upcomingSessions.map((session) => (
            <UpcomingSessionCard
              key={session.id}
              session={session}
              onJoin={() => onSessionJoin?.(session.id)}
            />
          ))}
        </CardContent>
      </Card>

      {/* Premium Features */}
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
        <CardContent className="p-6 space-y-3">
          <h3 className="text-lg font-semibold text-foreground">
            Tính năng Premium
          </h3>
          <p className="text-sm text-muted-foreground">
            Mở khóa các công cụ học tập nâng cao và nội dung độc quyền
          </p>
          <Button className="w-full">Nâng cấp ngay</Button>
        </CardContent>
      </Card>
    </div>
  );
}
