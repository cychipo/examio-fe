import { ConversationList } from "@/components/organisms/k/ConversationList";
import { ChatArea, type Message } from "@/components/organisms/k/ChatArea";
import { ConnectionInfoPanel } from "@/components/molecules/ConnectionInfoPanel";
import type { Conversation } from "@/components/molecules/ConversationItem";

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

interface MessagesTemplateProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onConversationSelect: (id: string) => void;
  currentChat: {
    userName: string;
    userStatus: string;
    userAvatar?: string;
    isOnline: boolean;
    messages: Message[];
    isTyping: boolean;
  } | null;
  onSendMessage: (message: string) => void;
  showConnectionInfo: boolean;
  onShowConnectionInfo: () => void;
  onHideConnectionInfo: () => void;
  connectionInfo: ConnectionInfo;
  messageStats: MessageStats;
  eventLog: EventLogItem[];
  onDisconnect: () => void;
}

export function MessagesTemplate({
  conversations,
  activeConversationId,
  onConversationSelect,
  currentChat,
  onSendMessage,
  showConnectionInfo,
  onShowConnectionInfo,
  onHideConnectionInfo,
  connectionInfo,
  messageStats,
  eventLog,
  onDisconnect,
}: MessagesTemplateProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Tin nhắn</h1>
        <p className="text-muted-foreground mt-1">
          Trò chuyện trực tiếp với người dùng khác
        </p>
      </div>

      {/* Main Content */}
      <div className="grid h-[calc(100vh-180px)] gap-6 lg:grid-cols-[350px_1fr] xl:grid-cols-[350px_1fr_300px]">
        {/* Conversation List - Always visible on desktop, conditional on mobile */}
        <aside className={activeConversationId ? "hidden lg:block" : "block"}>
          <ConversationList
            conversations={conversations}
            activeConversationId={activeConversationId}
            onConversationSelect={onConversationSelect}
            connectionStatus={connectionInfo.status}
            socketUrl={connectionInfo.url}
          />
        </aside>

        {/* Chat Area */}
        <main
          className={
            activeConversationId
              ? "block"
              : "hidden lg:flex lg:items-center lg:justify-center"
          }>
          {currentChat ? (
            <ChatArea
              userName={currentChat.userName}
              userStatus={currentChat.userStatus}
              userAvatar={currentChat.userAvatar}
              isOnline={currentChat.isOnline}
              messages={currentChat.messages}
              isTyping={currentChat.isTyping}
              onSendMessage={onSendMessage}
              onShowInfo={onShowConnectionInfo}
            />
          ) : (
            <div className="text-center">
              <p className="text-muted-foreground">
                Chọn một cuộc trò chuyện để bắt đầu
              </p>
            </div>
          )}
        </main>

        {/* Connection Info Panel - Desktop only */}
        {showConnectionInfo && (
          <aside className="hidden xl:block">
            <ConnectionInfoPanel
              socketStatus={connectionInfo}
              messageStats={messageStats}
              eventLog={eventLog}
              onClose={onHideConnectionInfo}
              onDisconnect={onDisconnect}
            />
          </aside>
        )}
      </div>
    </div>
  );
}
