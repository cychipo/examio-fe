"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  Volume2,
  VolumeX,
  FileText,
  Loader2,
  AlertCircle,
  Square,
  ArrowLeft,
  GraduationCap,
  Trash2,
  Calculator,
  Microscope,
  BookOpen,
  MonitorSpeaker,
  Languages,
  Settings,
  TrendingUp,
  Scale,
  Palette,
  Activity,
  UserCheck,
  Plus,
  Divide,
  Sigma,
  FunctionSquare,
  Atom,
  FlaskConical,
  Dna,
  Leaf,
  Book,
  Clock,
  Map,
  Shield,
  DollarSign,
  Monitor,
  HardDrive,
  Globe,
  Bot,
  Zap,
  Wrench,
  Radio,
  BarChart3,
  Building2,
  Receipt,
  Megaphone,
  Scroll,
  Briefcase,
  Users,
  Building,
  Presentation,
  Laptop,
  Music,
  Theater,
  Brain,
  Dumbbell,
  Heart,
  TestTube,
  Sparkles,
  Lightbulb,
  Flag,
} from "lucide-react";
import { useAITeacherStore } from "@/stores/useAITeacherStore";
import { ChatInputBar } from "@/components/molecules/ChatInputBar";
import { ChatHistoryCard } from "@/components/molecules/ChatHistoryCard";
import { RecentFilesModal } from "@/components/organisms/RecentFilesModal";
import { SubjectSelector } from "@/components/organisms/SubjectSelector";
import { ConfirmDialog } from "@/components/organisms/ConfirmDialog";
import { RecentUpload } from "@/apis/aiApi";
import { AIChatMessage } from "@/apis/aiChatApi";
import { Subject } from "@/apis/subjectApi";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { useAuthStore } from "@/stores/useAuthStore";
import { ModelSelector } from "@/components/atoms/ModelSelector";
import { Badge } from "@/components/ui/badge";

// Check if speech recognition is supported
const isSpeechRecognitionSupported = () => {
  return (
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)
  );
};

// Icon mapping for dynamic rendering (same as SubjectSelector)
const iconMap = {
  // Categories
  Calculator,
  Microscope,
  BookOpen,
  MonitorSpeaker,
  Languages,
  Settings,
  TrendingUp,
  Scale,
  Palette,
  Activity,
  UserCheck,

  // Subjects
  Plus,
  Divide,
  Sigma,
  FunctionSquare,
  Atom,
  FlaskConical,
  Dna,
  Leaf,
  Book,
  Clock,
  Map,
  Shield,
  DollarSign,
  Monitor,
  HardDrive,
  Globe,
  Bot,
  Flag,
  Zap,
  Wrench,
  Radio,
  BarChart3,
  Building2,
  Receipt,
  Megaphone,
  Scroll,
  Briefcase,
  Users,
  Building,
  Presentation,
  Laptop,
  Music,
  Theater,
  Brain,
  Dumbbell,
  Heart,
  TestTube,
  Sparkles,
  Lightbulb,
} as const;

// Helper function to render icon by name
function renderIcon(iconName: string | null | undefined, className?: string) {
  if (!iconName) return null;

  const IconComponent = iconMap[iconName as keyof typeof iconMap];
  if (!IconComponent) return null;

  return <IconComponent className={className} />;
}

export default function AITeacherPage() {
  const {
    // Subject
    categories,
    isLoadingCategories,
    selectedSubject,
    fetchCategories,
    selectSubject,
    startChatWithSubject,
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
    clearChatWithFiles,
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
  const [showSubjectSelector, setShowSubjectSelector] = useState(false);
  const [clearChatDialogOpen, setClearChatDialogOpen] = useState(false);
  const recognitionRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  // Initialize
  useEffect(() => {
    setSpeechSupported(isSpeechRecognitionSupported());
    fetchChats();
    fetchCategories();
    checkAndLoadChatFromUrl();

    // Load voices for TTS
    if ("speechSynthesis" in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }, [fetchChats, fetchCategories, checkAndLoadChatFromUrl]);

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

  // Page reload guard - warn user if streaming is in progress
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isStreaming || isProcessing) {
        e.preventDefault();
        e.returnValue = "Đang trả lời. Bạn có chắc muốn rời đi?";
        return "Đang trả lời. Bạn có chắc muốn rời đi?";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isStreaming, isProcessing]);

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

  // Handle subject selection
  const handleSelectSubject = (subject: Subject) => {
    startChatWithSubject(subject);
    setShowSubjectSelector(false);
  };

  // Handle create new chat with subject selection
  const handleCreateNewChat = () => {
    setShowSubjectSelector(true);
    selectChat(null);
  };

  // Handle back to chat from subject selector
  const handleBackToChat = () => {
    setShowSubjectSelector(false);
  };

  // Handle clear chat
  const handleClearChat = () => {
    if (selectedChatId) {
      const hasFiles = selectedUploads.length > 0;
      if (hasFiles) {
        setClearChatDialogOpen(true);
      } else {
        clearChatWithFiles(selectedChatId, false);
      }
    }
  };

  // Handle confirm clear chat with files
  const handleConfirmClearWithFiles = () => {
    if (selectedChatId) {
      clearChatWithFiles(selectedChatId, true);
      setClearChatDialogOpen(false);
    }
  };

  // Handle confirm clear chat without files
  const handleConfirmClearWithoutFiles = () => {
    if (selectedChatId) {
      clearChatWithFiles(selectedChatId, false);
      setClearChatDialogOpen(false);
    }
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

  // Show subject selector screen
  if (showSubjectSelector || (!selectedChatId && !selectedSubject)) {
    return (
      <div className="min-h-screen relative overflow-hidden max-w-7xl mx-auto">
        {/* Header Section */}
        <section className="relative container mx-auto px-4 pt-8 pb-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              {selectedChatId && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBackToChat}
                  className="mr-2"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Quay lại
                </Button>
              )}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-purple-500/30 rounded-2xl blur-lg" />
                <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/20 border border-border flex items-center justify-center">
                  <GraduationCap className="w-7 h-7 text-primary" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text">
                  Chọn Giáo viên AI
                </h1>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  Mỗi giáo viên chuyên về một môn học
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Subject Selector */}
        <section className="relative container mx-auto px-4 pb-8">
          <Card className="border-border bg-white/[0.02] dark:bg-white/[0.02] backdrop-blur-xl">
            <CardContent className="p-6">
              <SubjectSelector
                onSelectSubject={handleSelectSubject}
                selectedSubjectId={selectedSubject?.id}
              />
            </CardContent>
          </Card>
        </section>
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
                <div
                  className="relative w-14 h-14 rounded-2xl border border-border flex items-center justify-center"
                  style={{
                    backgroundColor: selectedSubject?.color
                      ? `${selectedSubject.color}20`
                      : "rgba(var(--primary), 0.1)",
                  }}
                >
                  {renderIcon(selectedSubject?.icon, "w-7 h-7 text-primary") || <Bot className="w-7 h-7 text-primary" />}
                </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text">
                  {selectedSubject?.name || "Giáo viên AI"}
                </h1>
                {selectedSubject && (
                  <Badge
                    variant="secondary"
                    className="cursor-pointer hover:bg-secondary/80"
                    onClick={handleCreateNewChat}
                  >
                    Đổi môn
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                {selectedSubject
                  ? "Chỉ trả lời trong phạm vi môn này"
                  : "Trò chuyện thông minh với AI"}
              </p>
            </div>
          </div>
          {/* Model Selector & Clear Chat */}
          <div className="flex items-center gap-2">
            {selectedChatId && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearChat}
                disabled={isProcessing || isStreaming}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Xóa chat
              </Button>
            )}
            <ModelSelector
              value={selectedModel}
              onChange={setSelectedModel}
              disabled={isProcessing || isStreaming}
            />
          </div>
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
                onSelectChat={(chatId) => selectChat(chatId, true, true)} // Force refresh
                onCreateChat={handleCreateNewChat}
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
                      <div
                        className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4"
                        style={{
                          backgroundColor: selectedSubject?.color
                            ? `${selectedSubject.color}20`
                            : "rgba(var(--primary), 0.1)",
                        }}
                      >
                        {renderIcon(selectedSubject?.icon, "w-10 h-10 opacity-50") || <Bot className="w-10 h-10 opacity-50" />}
                      </div>
                      <p className="text-lg font-medium">
                        Xin chào! Tôi là giáo viên{" "}
                        {selectedSubject?.name || "AI"}
                      </p>
                      <p className="text-sm mt-2 max-w-md">
                        {selectedSubject
                          ? `Hãy đặt câu hỏi về ${selectedSubject.name} và tôi sẽ giúp bạn!`
                          : "Hãy nhập tin nhắn hoặc nhấn mic để bắt đầu cuộc trò chuyện."}
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
                          subjectIcon={selectedSubject?.icon}
                          subjectColor={selectedSubject?.color}
                        />
                      ))}
                      {/* Streaming Response Display */}
                      {isStreaming && streamingContent && (
                        <div className="flex gap-3">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                            style={{
                              backgroundColor: selectedSubject?.color
                                ? `${selectedSubject.color}20`
                                : "rgba(var(--primary), 0.2)",
                            }}
                          >
                            {renderIcon(selectedSubject?.icon, "w-4 h-4 text-primary") || (
                              <Bot className="w-4 h-4 text-primary" />
                            )}
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
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center"
                              style={{
                                backgroundColor: selectedSubject?.color
                                  ? `${selectedSubject.color}20`
                                  : "rgba(var(--primary), 0.2)",
                              }}
                            >
                              {renderIcon(selectedSubject?.icon, "w-4 h-4 text-primary") || (
                                <Bot className="w-4 h-4 text-primary" />
                              )}
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
              onSelectChat={(chatId) => selectChat(chatId, true, true)} // Force refresh
              onCreateChat={handleCreateNewChat}
              onRenameChat={updateChatTitle}
              onDeleteChat={deleteChat}
            />
          </div>
        </div>
      </section>

      {/* Clear Chat Confirm Dialog */}
      <ConfirmDialog
        open={clearChatDialogOpen}
        onOpenChange={setClearChatDialogOpen}
        title="Xóa cuộc trò chuyện"
        description={
          selectedUploads.length > 0
            ? `Cuộc trò chuyện này có ${selectedUploads.length} file PDF. Bạn có muốn xóa luôn các file này không?`
            : "Bạn có chắc muốn xóa cuộc trò chuyện này không?"
        }
        confirmText={selectedUploads.length > 0 ? "Xóa chat và files" : "Xóa chat"}
        cancelText={selectedUploads.length > 0 ? "Chỉ xóa chat" : "Hủy"}
        onConfirm={
          selectedUploads.length > 0 ? handleConfirmClearWithFiles : handleConfirmClearWithoutFiles
        }
        onCancel={
          selectedUploads.length > 0 ? handleConfirmClearWithoutFiles : () => setClearChatDialogOpen(false)
        }
        variant={selectedUploads.length > 0 ? "destructive" : "default"}
      />

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
  subjectIcon,
  subjectColor,
}: {
  message: AIChatMessage;
  isSpeaking: boolean;
  onReplay: () => void;
  subjectIcon?: string | null;
  subjectColor?: string | null;
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
          "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
        )}
        style={{
          backgroundColor: isUser
            ? "rgba(var(--primary), 0.2)"
            : subjectColor
            ? `${subjectColor}20`
            : "rgba(168, 85, 247, 0.2)",
        }}
      >
        {isUser ? (
          <img
            src={user?.avatar || "/avt-default.webp"}
            alt="User"
            className="w-8 h-8 rounded-full"
          />
        ) : renderIcon(subjectIcon, "w-4 h-4 text-purple-400") || (
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
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={[rehypeKatex]}>
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
