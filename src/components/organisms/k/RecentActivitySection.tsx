import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  RecentActivityItem,
  type RecentActivityItemData,
} from "@/components/molecules/RecentActivityItem";

interface RecentActivitySectionProps {
  activities: RecentActivityItemData[];
  maxItems?: number;
}

export function RecentActivitySection({
  activities,
  maxItems = 5,
}: RecentActivitySectionProps) {
  const displayActivities = activities.slice(0, maxItems);

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <div>
          <CardTitle className="text-lg font-semibold text-foreground">
            Hoạt động gần đây
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-0.5">
            Các hoạt động và thành tích học tập mới nhất
          </p>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="divide-y divide-border/50">
          {displayActivities.length > 0 ? (
            displayActivities.map((activity) => (
              <RecentActivityItem key={activity.id} item={activity} />
            ))
          ) : (
            <div className="py-8 text-center">
              <p className="text-muted-foreground text-sm">
                Chưa có hoạt động nào
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
