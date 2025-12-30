"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  Volume2,
  VolumeX,
  Sparkles,
  Bot,
  FileText,
  Loader2,
  AlertCircle,
  Square,
} from "lucide-react";
import { useAITeacherStore } from "@/stores/useAITeacherStore";
import { ChatInputBar } from "@/components/molecules/ChatInputBar";
import { ChatHistoryCard } from "@/components/molecules/ChatHistoryCard";
import { RecentFilesModal } from "@/components/organisms/RecentFilesModal";
import { RecentUpload } from "@/apis/aiApi";
import { AIChatMessage } from "@/apis/aiChatApi";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useAuthStore } from "@/stores/useAuthStore";
import { ModelSelector } from "@/components/atoms/ModelSelector";

// Check if speech recognition is supported
const isSpeechRecognitionSupported = () => {
  return (
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)
  );
};

export default function AITeacherPage() {
  const {
    // Chat list
    chats,
    isLoadingChats,
    selectedChatId,
    // Messages
    messages,
    isLoadingMessages,
    // Streaming
    streamingContent,
    isStreaming,
    // Input states
    isListening,
    isSpeaking,
    isProcessing,
    transcript,
    // File states
    // File states
    selectedUploads,
    uploadedImageUrl,
    isUploadingImage,
    isProcessingPdf,
    // Actions
    fetchChats,
    createChat,
    selectChat,
    updateChatTitle,
    deleteChat,
    sendMessage,
    checkAndLoadChatFromUrl,
    setIsListening,
    setTranscript,
    addSelectedUpload,
    removeSelectedUpload,
    setUploadedImageUrl,
    uploadImage,
    uploadPdf,
    speakResponse,
    stopSpeaking,
    abortStream,
    selectedModel,
    setSelectedModel,
  } = useAITeacherStore();

  const [speechSupported, setSpeechSupported] = useState(true);
  const [micPermission, setMicPermission] = useState<
    "granted" | "denied" | "prompt"
  >("prompt");
  const [recentFilesModalOpen, setRecentFilesModalOpen] = useState(false);
  const recognitionRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  // Initialize
  useEffect(() => {
    setSpeechSupported(isSpeechRecognitionSupported());
    fetchChats();
    checkAndLoadChatFromUrl();

    // Load voices for TTS
    if ("speechSynthesis" in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }, [fetchChats, checkAndLoadChatFromUrl]);

  // Auto-scroll on new messages or streaming content
  useEffect(() => {
    if (scrollRef.current) {
      // ScrollArea uses Radix UI, viewport is inside with data-slot="scroll-area-viewport"
      const viewport = scrollRef.current.querySelector(
        '[data-slot="scroll-area-viewport"]'
      );
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [messages, streamingContent, isProcessing, isProcessingPdf]);

  // Initialize speech recognition
  const initRecognition = useCallback(() => {
    if (!isSpeechRecognitionSupported()) return null;

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "vi-VN";

    recognition.onresult = (event: any) => {
      let finalTranscript = "";
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      setTranscript(finalTranscript || interimTranscript);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      if (event.error === "not-allowed") {
        setMicPermission("denied");
      }
      setIsListening(false);
    };

    return recognition;
  }, [setTranscript, setIsListening]);

  // Start listening
  const startListening = useCallback(async () => {
    if (!speechSupported) return;
    stopSpeaking();

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicPermission("granted");

      if (!recognitionRef.current) {
        recognitionRef.current = initRecognition();
      }

      if (recognitionRef.current) {
        recognitionRef.current.start();
        setIsListening(true);
        setTranscript("");
      }
    } catch (error) {
      console.error("Microphone permission denied:", error);
      setMicPermission("denied");
    }
  }, [
    speechSupported,
    stopSpeaking,
    initRecognition,
    setIsListening,
    setTranscript,
  ]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  }, [setIsListening]);

  // Handle send message
  const handleSendMessage = (message: string, fromMic = false) => {
    if (isListening) {
      stopListening();
      fromMic = true; // If was listening, it's from mic
    }
    sendMessage(message, fromMic);
  };

  // Handle file selection
  const handleSelectRecentFile = (file: RecentUpload) => {
    // Avoid duplicates
    if (!selectedUploads.some((u) => u.id === file.id)) {
      addSelectedUpload(file);
    }
  };

  // Handle image upload
  const handleUploadImage = async (file: File) => {
    await uploadImage(file);
  };

  // Handle PDF upload
  const handlePdfUpload = () => {
    pdfInputRef.current?.click();
  };

  // Replay message with TTS
  const replayMessage = (content: string) => {
    stopSpeaking();
    speakResponse(content);
  };

  if (!speechSupported) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md border-destructive/50">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center gap-4">
              <AlertCircle className="w-12 h-12 text-destructive" />
              <h2 className="text-xl font-semibold">
                Trình duyệt không hỗ trợ
              </h2>
              <p className="text-muted-foreground">
                Tính năng Giáo viên AI cần sử dụng Speech Recognition. Vui lòng
                sử dụng Google Chrome hoặc Microsoft Edge để có trải nghiệm tốt
                nhất.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden max-w-7xl mx-auto">
      {/* Hidden PDF Input */}
      <input
        ref={pdfInputRef}
        type="file"
        multiple
        accept=".pdf"
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          if (files.length > 0) {
            uploadPdf(files);
          }
          // Reset value to allow selecting same file again
          e.target.value = "";
        }}
      />

      {/* Header Section */}
      <section className="relative container mx-auto px-4 pt-8 pb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-purple-500/30 rounded-2xl blur-lg" />
              <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/20 border border-border flex items-center justify-center">
                <Bot className="w-7 h-7 text-primary" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text">
                Giáo viên AI
              </h1>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Trò chuyện thông minh với AI
              </p>
            </div>
          </div>
          {/* Model Selector */}
          <ModelSelector
            value={selectedModel}
            onChange={setSelectedModel}
            disabled={isProcessing || isStreaming}
          />
        </div>
      </section>

      {/* Main Content */}
      <section className="relative container mx-auto px-4 pb-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Chat History Sidebar - Desktop */}
          <aside className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-6">
              <ChatHistoryCard
                chats={chats}
                selectedChatId={selectedChatId}
                isLoading={isLoadingChats}
                onSelectChat={selectChat}
                onCreateChat={createChat}
                onRenameChat={updateChatTitle}
                onDeleteChat={deleteChat}
              />
            </div>
          </aside>

          {/* Chat Area */}
          <div className="flex-1 min-w-0">
            <Card className="border-border bg-white/[0.02] dark:bg-white/[0.02] backdrop-blur-xl">
              <CardContent className="p-0">
                {/* Messages Area */}
                <ScrollArea
                  className="h-[450px] md:h-[500px] p-4"
                  ref={scrollRef}>
                  {isLoadingMessages ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                      <Bot className="w-16 h-16 mb-4 opacity-50" />
                      <p className="text-lg font-medium">Xin chào!</p>
                      <p className="text-sm mt-2 max-w-md">
                        Tôi là giáo viên AI của bạn. Hãy nhập tin nhắn hoặc nhấn
                        mic để bắt đầu cuộc trò chuyện.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <MessageBubble
                          key={message.id}
                          message={message}
                          isSpeaking={isSpeaking}
                          onReplay={() => replayMessage(message.content)}
                        />
                      ))}
                      {/* Streaming Response Display */}
                      {isStreaming && streamingContent && (
                        <div className="flex gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                            <Bot className="w-4 h-4 text-primary" />
                          </div>
                          <div className="flex-1 bg-black/5 dark:bg-white/5 dark:bg-white/[0.03] border border-border rounded-2xl rounded-tl-sm px-4 py-3">
                            <p className="text-sm whitespace-pre-wrap">
                              {streamingContent}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Loader2 className="w-3 h-3 animate-spin" />
                                <span className="text-xs">Đang trả lời...</span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                onClick={() => abortStream?.()}>
                                <Square className="w-3 h-3 mr-1 fill-current" />
                                Dừng
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                      {/* Loading indicator when processing but no streaming content yet */}
                      {isProcessing && !streamingContent && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 text-muted-foreground">
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                              <Bot className="w-4 h-4 text-primary" />
                            </div>
                            <div className="flex items-center gap-2">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span className="text-sm">Đang suy nghĩ...</span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-3 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            onClick={() => abortStream?.()}>
                            <Square className="w-3 h-3 mr-1 fill-current" />
                            Dừng
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </ScrollArea>

                {/* Transcript Preview */}
                {isListening && transcript && (
                  <div className="px-4 py-2 border-t border-border bg-primary/5">
                    <p className="text-sm text-muted-foreground">
                      <span className="text-primary font-medium">
                        Đang nghe:{" "}
                      </span>
                      {transcript}
                    </p>
                  </div>
                )}

                {/* Input Area */}
                <div className="border-t border-border p-4">
                  {/* Selected File Preview - above input like images */}
                  {selectedUploads.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-2">
                      {selectedUploads.map((file) => (
                        <div
                          key={file.id}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-500/10 border border-blue-500/20 w-fit animate-in fade-in zoom-in duration-200">
                          <FileText className="w-4 h-4 text-blue-400" />
                          <span className="text-sm text-blue-300/90 max-w-[200px] truncate">
                            {file.filename}
                          </span>
                          {file.id.startsWith("processing-") ? (
                            <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-5 w-5 p-0 hover:bg-blue-500/20 text-blue-400"
                              onClick={() => removeSelectedUpload(file.id)}>
                              ×
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <ChatInputBar
                    onSendMessage={handleSendMessage}
                    onStartListening={startListening}
                    onStopListening={stopListening}
                    onUploadImage={handleUploadImage}
                    onUploadPdf={handlePdfUpload}
                    onSelectRecentFile={() => setRecentFilesModalOpen(true)}
                    isListening={isListening}
                    isProcessing={isProcessing}
                    isUploadingImage={isUploadingImage}
                    isUploadingPdf={isProcessingPdf}
                    transcript={transcript}
                    uploadedImageUrl={uploadedImageUrl}
                    onClearImage={() => setUploadedImageUrl(null)}
                    disabled={micPermission === "denied"}
                  />

                  {/* Status Text */}
                  <div className="text-center mt-3">
                    {micPermission === "denied" ? (
                      <p className="text-sm text-destructive">
                        Vui lòng cho phép truy cập microphone
                      </p>
                    ) : isListening ? (
                      <p className="text-sm text-primary animate-pulse">
                        Đang nghe... Nhấn lại mic hoặc Enter để gửi
                      </p>
                    ) : isProcessing ? (
                      <p className="text-sm text-muted-foreground">
                        Đang xử lý...
                      </p>
                    ) : isSpeaking ? (
                      <p className="text-sm text-orange-400 flex items-center justify-center gap-1">
                        <Volume2 className="w-4 h-4" />
                        Đang đọc...
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 ml-2"
                          onClick={stopSpeaking}>
                          <VolumeX className="w-4 h-4 mr-1" />
                          Dừng
                        </Button>
                      </p>
                    ) : null}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chat History - Mobile (bottom sheet style) */}
          <div className="lg:hidden">
            <ChatHistoryCard
              chats={chats}
              selectedChatId={selectedChatId}
              isLoading={isLoadingChats}
              onSelectChat={selectChat}
              onCreateChat={createChat}
              onRenameChat={updateChatTitle}
              onDeleteChat={deleteChat}
            />
          </div>
        </div>
      </section>

      {/* Recent Files Modal - excludes quiz/flashcard history for AI Teacher */}
      <RecentFilesModal
        open={recentFilesModalOpen}
        onOpenChange={setRecentFilesModalOpen}
        onSelectFile={handleSelectRecentFile}
        selectedFileId={undefined} // Don't highlight single file as we support multiple
        includeHistory={false}
      />
    </div>
  );
}

// Message Bubble Component
function MessageBubble({
  message,
  isSpeaking,
  onReplay,
}: {
  message: AIChatMessage;
  isSpeaking: boolean;
  onReplay: () => void;
}) {
  const isUser = message.role === "user";
  const { user } = useAuthStore();

  return (
    <div
      className={cn(
        "flex items-start gap-3 group",
        isUser && "flex-row-reverse"
      )}>
      <div
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
          isUser ? "bg-primary/20" : "bg-purple-500/20"
        )}>
        {isUser ? (
          <img
            src={user?.avatar || "/avt-default.webp"}
            alt="User"
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <Bot className="w-4 h-4 text-purple-400" />
        )}
      </div>
      <div
        className={cn(
          "flex-1 max-w-[80%]",
          isUser && "flex flex-col items-end"
        )}>
        {/* Image Preview */}
        {message.imageUrl && (
          <div className="mb-2">
            <img
              src={message.imageUrl}
              alt="Attached"
              className="max-w-[200px] rounded-lg border border-border"
            />
          </div>
        )}

        {/* Document Card */}
        {message.documentName && (
          <div className="mb-2">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-500/10 border border-blue-500/20 w-fit">
              <FileText className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-blue-300/80">
                {message.documentName}
              </span>
            </div>
          </div>
        )}

        {/* Content */}
        <div
          className={cn(
            "rounded-2xl px-4 py-2",
            isUser
              ? "bg-primary text-primary-foreground rounded-tr-sm"
              : "bg-black/5 dark:bg-white/5 dark:bg-white/[0.03] border border-border rounded-tl-sm"
          )}>
          <div className="text-sm prose dark:prose-invert max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
          </div>
        </div>

        {/* Actions - Only TTS for assistant messages */}
        {!isUser && (
          <div className="flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-muted-foreground hover:text-primary"
              onClick={onReplay}
              disabled={isSpeaking}>
              <Volume2 className="w-3 h-3 mr-1" />
              Đọc lại
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
