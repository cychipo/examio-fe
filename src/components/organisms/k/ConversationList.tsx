import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ConversationItem,
  type Conversation,
} from "@/components/molecules/ConversationItem";
import { Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConnectionStatus } from "@/components/atoms/k/ConnectionStatus";
import { useState } from "react";

interface ConversationListProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onConversationSelect: (id: string) => void;
  connectionStatus: "connected" | "connecting" | "disconnected";
  socketUrl: string;
}

export function ConversationList({
  conversations,
  activeConversationId,
  onConversationSelect,
  connectionStatus,
  socketUrl,
}: ConversationListProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredConversations = conversations.filter((conv) =>
    conv.userName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="space-y-4 pb-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">Trò chuyện</h2>
          <Button size="icon" variant="ghost">
            <Plus className="h-5 w-5" />
          </Button>
        </div>

        {/* Connection Status */}
        <div className="space-y-2">
          <ConnectionStatus status={connectionStatus} />
          <p className="text-xs text-muted-foreground font-mono truncate">
            {socketUrl}
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Tìm kiếm cuộc trò chuyện..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full px-4 pb-4">
          <div className="space-y-2">
            {filteredConversations.length > 0 ? (
              filteredConversations.map((conversation) => (
                <ConversationItem
                  key={conversation.id}
                  conversation={conversation}
                  isActive={conversation.id === activeConversationId}
                  onClick={() => onConversationSelect(conversation.id)}
                />
              ))
            ) : (
              <div className="py-12 text-center">
                <p className="text-muted-foreground">
                  Không tìm thấy cuộc trò chuyện
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
