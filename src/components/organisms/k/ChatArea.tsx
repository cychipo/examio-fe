import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageBubble } from "@/components/atoms/k/MessageBubble";
import { TypingIndicator } from "@/components/atoms/k/TypingIndicator";
import { MessageInput } from "@/components/molecules/MessageInput";
import { ChatHeader } from "@/components/organisms/k/ChatHeader";

export interface Message {
  id: string;
  content: string;
  isOwn: boolean;
  timestamp: string;
  codeBlock?: {
    language: string;
    code: string;
  };
}

interface ChatAreaProps {
  userName: string;
  userStatus: string;
  userAvatar?: string;
  isOnline: boolean;
  messages: Message[];
  isTyping: boolean;
  onSendMessage: (message: string) => void;
  onShowInfo: () => void;
}

export function ChatArea({
  userName,
  userStatus,
  userAvatar,
  isOnline,
  messages,
  isTyping,
  onSendMessage,
  onShowInfo,
}: ChatAreaProps) {
  return (
    <Card className="h-full flex flex-col">
      <ChatHeader
        userName={userName}
        userStatus={userStatus}
        userAvatar={userAvatar}
        isOnline={isOnline}
        onShowInfo={onShowInfo}
      />

      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message.content}
                isOwn={message.isOwn}
                timestamp={message.timestamp}
                codeBlock={message.codeBlock}
              />
            ))}
            {isTyping && <TypingIndicator userName={userName} />}
          </div>
        </ScrollArea>
      </CardContent>

      <MessageInput
        onSendMessage={onSendMessage}
        placeholder="Nhập tin nhắn..."
      />
    </Card>
  );
}
