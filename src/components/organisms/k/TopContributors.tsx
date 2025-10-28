import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserAvatar } from "@/components/atoms/k/UserAvatar";
import { ContributorBadge } from "@/components/atoms/k/ContributorBadge";

export interface Contributor {
  id: string;
  name: string;
  avatar?: string;
  posts: number;
  rank: number;
}

interface TopContributorsProps {
  contributors: Contributor[];
}

export function TopContributors({ contributors }: TopContributorsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">
          Người đóng góp hàng đầu
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {contributors.map((contributor) => (
          <div
            key={contributor.id}
            className="flex items-center justify-between rounded-lg p-2 transition-colors hover:bg-muted">
            <div className="flex items-center gap-3">
              <div className="relative">
                <UserAvatar
                  src={contributor.avatar}
                  alt={contributor.name}
                  fallback={contributor.name.slice(0, 2).toUpperCase()}
                  size="sm"
                />
                <ContributorBadge
                  rank={contributor.rank}
                  className="absolute -right-1 -top-1"
                />
              </div>
              <div>
                <p className="font-medium text-foreground">
                  {contributor.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {contributor.posts} bài viết
                </p>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
