"use client";

import { useState } from "react";
import { MessagesTemplate } from "@/templates/MessagesTemplate";
import type { Conversation } from "@/components/molecules/ConversationItem";
import type { Message } from "@/components/organisms/k/ChatArea";

// Mock conversations
const mockConversations: Conversation[] = [
  {
    id: "1",
    userName: "Alex Johnson",
    userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
    lastMessage:
      "Hey! I've been working on the socket implementation. Can you take a look at the connection handling?",
    timestamp: "5m",
    unreadCount: 2,
    isOnline: true,
  },
  {
    id: "2",
    userName: "Sarah Wilson",
    userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    lastMessage: "Can you explain the socket implementation?",
    timestamp: "10m",
    isOnline: true,
  },
  {
    id: "3",
    userName: "Dev Team",
    lastMessage: "Meeting at 3 PM today",
    timestamp: "1h",
    unreadCount: 5,
    isOnline: false,
  },
  {
    id: "4",
    userName: "Phòng Chung",
    lastMessage: "John đã đăng nhập vào hệ thống",
    timestamp: "2h",
    isOnline: true,
  },
  {
    id: "5",
    userName: "Mike Chen",
    userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike",
    lastMessage: "Thanks for your help!",
    timestamp: "1d",
    isOnline: false,
  },
];

// Mock messages for Alex Johnson
const mockMessages: Record<string, Message[]> = {
  "1": [
    {
      id: "1",
      content:
        "Hey! I've been working on the socket implementation. Can you take a look at the connection handling?",
      isOwn: false,
      timestamp: "10:20 AM",
    },
    {
      id: "2",
      content:
        "Sure! I'd review it right now. Are you handling reconnection gracefully?",
      isOwn: true,
      timestamp: "10:21 AM",
    },
    {
      id: "3",
      content:
        "Yes, I've implemented exponential backoff for reconnections. Here's the code:",
      isOwn: false,
      timestamp: "10:25 AM",
      codeBlock: {
        language: "javascript",
        code: `io.connect(url, {
  reconnection: true,
  reconnectionDelay: 500,
  reconnectionAttempts: 10
});`,
      },
    },
    {
      id: "4",
      content:
        "Perfect! That looks solid. What about message queuing for offline scenarios?",
      isOwn: true,
      timestamp: "10:27 AM",
    },
  ],
  "2": [
    {
      id: "1",
      content: "Can you explain the socket implementation?",
      isOwn: false,
      timestamp: "09:15 AM",
    },
    {
      id: "2",
      content:
        "Sure! We're using Socket.IO for real-time communication. It handles reconnection automatically and supports fallback to long-polling if WebSocket fails.",
      isOwn: true,
      timestamp: "09:16 AM",
    },
  ],
  "3": [
    {
      id: "1",
      content: "Meeting at 3 PM today",
      isOwn: false,
      timestamp: "08:00 AM",
    },
  ],
};

export default function MessagesPage() {
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >("1");
  const [showConnectionInfo, setShowConnectionInfo] = useState(true);
  const [conversations, setConversations] =
    useState<Conversation[]>(mockConversations);
  const [messagesByConversation, setMessagesByConversation] =
    useState<Record<string, Message[]>>(mockMessages);

  const activeConversation = conversations.find(
    (c) => c.id === activeConversationId
  );

  const currentChat = activeConversation
    ? {
        userName: activeConversation.userName,
        userStatus: activeConversation.isOnline ? "Trực tuyến" : "Ngoại tuyến",
        userAvatar: activeConversation.userAvatar,
        isOnline: activeConversation.isOnline,
        messages: messagesByConversation[activeConversationId!] || [],
        isTyping: activeConversationId === "1", // Alex is typing
      }
    : null;

  const handleSendMessage = (message: string) => {
    if (!activeConversationId) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: message,
      isOwn: true,
      timestamp: new Date().toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessagesByConversation((prev) => ({
      ...prev,
      [activeConversationId]: [
        ...(prev[activeConversationId] || []),
        newMessage,
      ],
    }));

    // Update conversation last message
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === activeConversationId
          ? { ...conv, lastMessage: message, timestamp: "Vừa xong" }
          : conv
      )
    );

    console.log("Message sent:", message);
  };

  const handleDisconnect = () => {
    console.log("Disconnecting...");
    // Implement disconnect logic
  };

  const connectionInfo = {
    status: "connected" as const,
    url: "wss://localhost:8000",
    protocol: "WebSocket",
    latency: "23ms",
  };

  const messageStats = {
    sent: 142,
    received: 168,
    queued: 0,
  };

  const eventLog = [
    { time: "10:07:32", event: "Kết nối đã được thiết lập" },
    { time: "10:15:22", event: "Tin nhắn đã gửi" },
    { time: "10:17:22", event: "Tin nhắn đã nhận" },
    { time: "10:21:22", event: "Kết nối lại thành công" },
  ];

  return (
    <MessagesTemplate
      conversations={conversations}
      activeConversationId={activeConversationId}
      onConversationSelect={setActiveConversationId}
      currentChat={currentChat}
      onSendMessage={handleSendMessage}
      showConnectionInfo={showConnectionInfo}
      onShowConnectionInfo={() => setShowConnectionInfo(true)}
      onHideConnectionInfo={() => setShowConnectionInfo(false)}
      connectionInfo={connectionInfo}
      messageStats={messageStats}
      eventLog={eventLog}
      onDisconnect={handleDisconnect}
    />
  );
}
