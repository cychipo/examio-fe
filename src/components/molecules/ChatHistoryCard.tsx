"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  MessageSquare,
  MoreVertical,
  Pencil,
  Trash2,
  Check,
  X,
  Plus,
  Loader2,
  History,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AIChat } from "@/apis/aiChatApi";

interface ChatHistoryCardProps {
  chats: AIChat[];
  selectedChatId: string | null;
  isLoading: boolean;
  onSelectChat: (chatId: string | null) => void;
  onCreateChat: () => void;
  onRenameChat: (chatId: string, title: string) => void;
  onDeleteChat: (chatId: string) => void;
}

export function ChatHistoryCard({
  chats,
  selectedChatId,
  isLoading,
  onSelectChat,
  onCreateChat,
  onRenameChat,
  onDeleteChat,
}: ChatHistoryCardProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [chatToDelete, setChatToDelete] = useState<AIChat | null>(null);

  const startEditing = (chat: AIChat) => {
    setEditingId(chat.id);
    setEditValue(chat.title || "Chat mới");
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditValue("");
  };

  const saveEditing = () => {
    if (editingId && editValue.trim()) {
      onRenameChat(editingId, editValue.trim());
    }
    cancelEditing();
  };

  const confirmDelete = (chat: AIChat) => {
    setChatToDelete(chat);
    setDeleteConfirmOpen(true);
  };

  const handleDelete = () => {
    if (chatToDelete) {
      onDeleteChat(chatToDelete.id);
      setDeleteConfirmOpen(false);
      setChatToDelete(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return "Hôm nay";
    } else if (days === 1) {
      return "Hôm qua";
    } else if (days < 7) {
      return `${days} ngày trước`;
    } else {
      return date.toLocaleDateString("vi-VN");
    }
  };

  return (
    <>
      <Card className="border-white/10 bg-white/[0.02] dark:bg-white/[0.02] backdrop-blur-xl">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <History className="w-4 h-4 text-primary" />
              Lịch sử chat
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-primary hover:bg-primary/10"
              onClick={onCreateChat}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="-mt-8">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : chats.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Chưa có cuộc trò chuyện</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={onCreateChat}>
                <Plus className="w-4 h-4 mr-1" />
                Bắt đầu chat
              </Button>
            </div>
          ) : (
            <ScrollArea className="h-[350px] pr-1">
              <div className="space-y-1">
                {chats.map((chat) => (
                  <div
                    key={chat.id}
                    className={cn(
                      "group flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all",
                      "hover:bg-white/10 dark:hover:bg-white/5 max-w-66",
                      selectedChatId === chat.id &&
                        "bg-primary/10 border border-primary/20"
                    )}
                    onClick={() =>
                      editingId !== chat.id && onSelectChat(chat.id)
                    }>
                    <MessageSquare
                      className={cn(
                        "w-4 h-4 flex-shrink-0",
                        selectedChatId === chat.id
                          ? "text-primary"
                          : "text-muted-foreground"
                      )}
                    />

                    {editingId === chat.id ? (
                      <div className="flex-1 flex items-center gap-1">
                        <Input
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="h-7 text-sm bg-white/10 border-white/20"
                          onClick={(e) => e.stopPropagation()}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") saveEditing();
                            if (e.key === "Escape") cancelEditing();
                          }}
                          autoFocus
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            saveEditing();
                          }}>
                          <Check className="w-3 h-3 text-green-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            cancelEditing();
                          }}>
                          <X className="w-3 h-3 text-red-500" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate line-clamp-2">
                            {chat.title || "Chat mới"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(chat.updatedAt)}
                          </p>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => e.stopPropagation()}>
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="bg-background/95 backdrop-blur-xl">
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                startEditing(chat);
                              }}>
                              <Pencil className="w-4 h-4 mr-2" />
                              Đổi tên
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-500"
                              onClick={(e) => {
                                e.stopPropagation();
                                confirmDelete(chat);
                              }}>
                              <Trash2 className="w-4 h-4 mr-2" />
                              Xóa
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent className="bg-background/95 backdrop-blur-xl border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa cuộc trò chuyện?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa &quot;{chatToDelete?.title || "Chat mới"}
              &quot;? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/5 border-white/10 hover:bg-white/10">
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30">
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
