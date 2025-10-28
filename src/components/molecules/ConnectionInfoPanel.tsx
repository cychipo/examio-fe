import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConnectionStatus } from "@/components/atoms/k/ConnectionStatus";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface ConnectionInfo {
  status: "connected" | "connecting" | "disconnected";
  url: string;
  protocol: string;
  latency: string;
}

interface EventLogItem {
  time: string;
  event: string;
}

interface MessageStats {
  sent: number;
  received: number;
  queued: number;
}

interface ConnectionInfoPanelProps {
  socketStatus: ConnectionInfo;
  messageStats: MessageStats;
  eventLog: EventLogItem[];
  onClose: () => void;
  onDisconnect: () => void;
}

export function ConnectionInfoPanel({
  socketStatus,
  messageStats,
  eventLog,
  onClose,
  onDisconnect,
}: ConnectionInfoPanelProps) {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">
          Thông tin kết nối
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Socket Status */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">
            Trạng thái Socket
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Trạng thái:</span>
              <ConnectionStatus status={socketStatus.status} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">URL:</span>
              <code className="text-xs bg-muted px-2 py-1 rounded">
                {socketStatus.url}
              </code>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Giao thức:</span>
              <span className="font-medium">{socketStatus.protocol}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Độ trễ:</span>
              <span className="font-medium">{socketStatus.latency}</span>
            </div>
          </div>
        </div>

        {/* Message Stats */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">
            Thống kê tin nhắn
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Đã gửi:</span>
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                {messageStats.sent}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Đã nhận:</span>
              <span className="font-semibold text-green-600 dark:text-green-400">
                {messageStats.received}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Đang chờ:</span>
              <span className="font-semibold text-orange-600 dark:text-orange-400">
                {messageStats.queued}
              </span>
            </div>
          </div>
        </div>

        {/* Event Log */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">
            Nhật ký sự kiện
          </h3>
          <div className="max-h-48 space-y-1 overflow-y-auto text-xs">
            {eventLog.map((log, index) => (
              <div
                key={index}
                className="flex items-start gap-2 rounded bg-muted p-2">
                <span className="text-muted-foreground shrink-0">
                  {log.time}
                </span>
                <span className="text-foreground">- {log.event}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Disconnect Button */}
        <Button variant="destructive" onClick={onDisconnect} className="w-full">
          Ngắt kết nối
        </Button>
      </CardContent>
    </Card>
  );
}
