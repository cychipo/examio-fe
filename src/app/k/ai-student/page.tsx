"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bot,
  Code2,
  Copy,
  Database,
  Gauge,
  Loader2,
  MessageSquarePlus,
  Pencil,
  SendHorizonal,
  Sparkles,
  Square,
  Trash2,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { ModelSelector } from "@/components/atoms/ModelSelector";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/stores/useAuthStore";
import { useAIStudentStore } from "@/stores/useAIStudentStore";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/toast";

const quickPromptGroups = [
  {
    title: "Giải thích",
    prompts: [
      "Giải thích cho mình thuật toán binary search bằng Python thật dễ hiểu.",
      "So sánh vòng lặp for và while trong C++ và Python khi nào nên dùng.",
    ],
  },
  {
    title: "Debug",
    prompts: [
      "Tìm lỗi trong đoạn code C++ bị segmentation fault khi duyệt mảng.",
      "Giải thích vì sao chương trình Python này bị lỗi IndexError và cách sửa.",
    ],
  },
  {
    title: "Lời giải",
    prompts: [
      "Viết lời giải Python cho bài đọc N số và in ra số lớn nhất, kèm giải thích độ phức tạp.",
      "Hướng dẫn từng bước cách giải bài kiểm tra số nguyên tố bằng C++ mà chưa đưa full code ngay.",
    ],
  },
];


function formatProgrammingLanguage(language?: string) {
  if (!language) return "Không rõ";
  if (language.toLowerCase() === "cpp") return "C++";
  if (language.toLowerCase() === "python") return "Python";
  return language.toUpperCase();
}

function formatBenchmarkDatasetName(datasetName?: string) {
  if (!datasetName) return "Benchmark";
  if (datasetName === "multipl_e_humaneval_cpp") return "MultiPL-E HumanEval C++";
  if (datasetName === "multipl_e_mbpp_cpp") return "MultiPL-E MBPP C++";
  if (datasetName === "humaneval") return "HumanEval Python";
  if (datasetName === "mbpp") return "MBPP Python";
  if (datasetName === "rule_based_fallback") return "Rule-based fallback";
  return datasetName;
}

function getEvaluationSummary(evaluation?: {
  status?: string;
  scorePhase?: string;
  isFinal?: boolean;
  benchmark?: {
    datasetName?: string;
    synthetic?: boolean;
  } | null;
}) {
  if (!evaluation) {
    return "Đang chờ đánh giá tự động.";
  }
  if (evaluation.scorePhase === "quick" || evaluation.isFinal === false) {
    return "Điểm tạm thời dựa trên khả năng trích code, testability và tín hiệu match benchmark.";
  }
  if (evaluation.status === "unavailable") {
    return "Chưa có benchmark hoặc rule phù hợp để chấm tự động.";
  }
  if (evaluation.benchmark?.datasetName === "rule_based_fallback" || evaluation.benchmark?.synthetic) {
    return "Chấm bằng rule-based fallback phase 1 cho các bài pure-function đơn giản.";
  }
  return "Chấm bằng benchmark đối chiếu và sandbox thực thi.";
}

function getSourceBadgeLabel(sourcePath: string) {
  const normalized = sourcePath.toLowerCase();
  if (normalized.includes("humaneval")) return "HumanEval";
  if (normalized.includes("mbpp")) return "MBPP";
  if (normalized.includes("codenet")) return "CodeNet";
  return "Knowledge";
}

function getShortSourceName(sourcePath: string, fallbackTitle: string) {
  const segments = sourcePath.split("/").filter(Boolean);
  return segments[segments.length - 1] || fallbackTitle;
}

export default function AIStudentPage() {
  const { user, initializing } = useAuthStore();
  const {
    sessions,
    selectedSessionId,
    messages,
    selectedModel,
    isSending,
    streamingContent,
    initialize,
    setSelectedModel,
    createSession,
    selectSession,
    renameSession,
    deleteSession,
    sendMessage,
    clearMessages,
    evaluateMessage,
    stopStreaming,
  } = useAIStudentStore();
  const [input, setInput] = useState("");
  const [visibleMessageCount, setVisibleMessageCount] = useState(20);
  const [sessionToDelete, setSessionToDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [renameDialog, setRenameDialog] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [isRenaming, setIsRenaming] = useState(false);

  const canAccess = useMemo(
    () => !initializing && user?.role === "student",
    [initializing, user],
  );
  const visibleMessages = useMemo(
    () => messages.slice(-visibleMessageCount),
    [messages, visibleMessageCount],
  );

  useEffect(() => {
    void initialize();
  }, [initialize]);

  useEffect(() => {
    setVisibleMessageCount(20);
  }, [selectedSessionId]);

  const handleSubmit = async () => {
    if (!input.trim() || isSending) {
      return;
    }
    const content = input;
    setInput("");
    await sendMessage(content);
  };

  const handleCopy = async (content: string) => {
    await navigator.clipboard.writeText(content);
    toast.success("Đã copy nội dung");
  };

  const handleRenameSession = async (
    sessionId: string,
    currentTitle: string,
  ) => {
    setRenameDialog({ id: sessionId, title: currentTitle });
    setRenameValue(currentTitle);
  };

  const handleConfirmRename = async () => {
    if (!renameDialog || !renameValue.trim()) {
      return;
    }

    setIsRenaming(true);
    try {
      await renameSession(renameDialog.id, renameValue.trim());
      toast.success("Đã cập nhật tên phiên chat");
      setRenameDialog(null);
      setRenameValue("");
    } finally {
      setIsRenaming(false);
    }
  };

  const markdownComponents = {
    code: ({ className, children, ...props }: any) => {
      const isInline = !className;
      if (isInline) {
        return (
          <code
            className="rounded-md bg-[#f3efe7] px-1.5 py-0.5 font-mono text-[0.92em] text-[#9a3412]"
            {...props}
          >
            {children}
          </code>
        );
      }

      return (
        <code
          className="font-mono text-[13px] leading-6 text-[#f8fafc]"
          {...props}
        >
          {children}
        </code>
      );
    },
    pre: ({ children }: any) => (
      <div className="relative my-4 overflow-hidden rounded-3xl border border-[#2b3445] bg-[#0b1220] shadow-[0_18px_60px_rgba(15,23,42,0.18)]">
        <div className="flex items-center justify-between border-b border-white/10 bg-[linear-gradient(90deg,rgba(30,41,59,0.96),rgba(15,23,42,0.88))] px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#fb7185]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#fbbf24]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#4ade80]" />
            </div>
            <div className="rounded-full bg-white/8 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#cbd5e1]">
              {children?.props?.className?.replace("language-", "") || "code"}
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 rounded-full border border-white/10 bg-white/5 px-3 text-[#e2e8f0] hover:bg-white/10 hover:text-white"
            onClick={() => {
              const codeContent =
                typeof children?.props?.children === "string"
                  ? children.props.children
                  : Array.isArray(children?.props?.children)
                    ? children.props.children.join("")
                    : "";
              void handleCopy(codeContent);
            }}
          >
            <Copy className="h-4 w-4" />
            Copy code
          </Button>
        </div>
        <div className="overflow-x-auto px-4 py-4">
          <pre className="m-0 overflow-x-auto bg-transparent p-0 font-mono text-[13px] leading-6 text-[#f8fafc]">
            {children}
          </pre>
        </div>
      </div>
    ),
  };

  if (initializing) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        Đang kiểm tra quyền truy cập...
      </div>
    );
  }

  if (!canAccess) {
    return (
      <div className="p-6 text-sm text-destructive">
        Trang này chỉ dành cho học sinh.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(227,24,55,0.08),_transparent_28%),linear-gradient(180deg,_rgba(15,23,42,0.02),_transparent)] p-3 md:p-6">
      <div className="flex w-full flex-col gap-5">
        <Card className="border-border/70 bg-white/80 py-0 backdrop-blur-sm">
          <CardContent className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between md:p-5">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Bot className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl font-semibold text-foreground md:text-2xl">
                  AI Hỏi Lập Trình
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Chat tập trung cho C++, Python, thuật toán và debug.
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Button
                variant="outline"
                className="h-11 cursor-pointer rounded-2xl"
                onClick={clearMessages}
              >
                <Trash2 className="h-4 w-4" />
                Làm mới
              </Button>
              <Button
                className="h-11 cursor-pointer rounded-2xl"
                onClick={() => createSession()}
              >
                <MessageSquarePlus className="h-4 w-4" />
                Phiên chat mới
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          <aside className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]">
            <Card className="border-border/70 bg-white/80 py-0 backdrop-blur-sm">
              <CardHeader className="border-b border-border/60 p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-base text-foreground">
                      Phiên trò chuyện
                    </CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Chọn hoặc đổi tên phiên đang học.
                    </p>
                  </div>
                  <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary">
                    {sessions.length}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex gap-2 overflow-x-auto p-4">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className={cn(
                      "group flex min-w-[240px] items-center gap-2 rounded-2xl border p-2 transition duration-200",
                      selectedSessionId === session.id
                        ? "border-primary/30 bg-primary/5 shadow-sm"
                        : "border-border/70 bg-black/[0.03] hover:border-primary/20 hover:bg-white",
                    )}
                  >
                    <button
                      type="button"
                      className="min-h-11 min-w-0 flex-1 cursor-pointer rounded-xl px-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      onClick={() => selectSession(session.id)}
                    >
                      <p className="truncate text-sm font-semibold text-foreground">
                        {session.title}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {new Date(session.updatedAt).toLocaleString()}
                      </p>
                    </button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Đổi tên phiên ${session.title}`}
                      className="h-10 w-10 cursor-pointer rounded-xl text-muted-foreground hover:bg-primary/10 hover:text-primary"
                      onClick={() => handleRenameSession(session.id, session.title)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    {sessions.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Xóa phiên ${session.title}`}
                        className="h-10 w-10 cursor-pointer rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        onClick={() =>
                          setSessionToDelete({
                            id: session.id,
                            title: session.title,
                          })
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-border/70 bg-white/80 py-0 backdrop-blur-sm">
              <CardHeader className="border-b border-border/60 p-5">
                <CardTitle className="text-base text-foreground">
                  Prompt mẫu
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Bấm để điền nhanh câu hỏi thường gặp.
                </p>
              </CardHeader>
              <CardContent className="grid gap-3 p-4 md:grid-cols-3">
                {quickPromptGroups.map((group) => (
                  <div key={group.title} className="space-y-2">
                    <p className="px-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      {group.title}
                    </p>
                    {group.prompts.map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        onClick={() => setInput(prompt)}
                        className="min-h-11 w-full cursor-pointer rounded-2xl border border-border/70 bg-black/[0.03] px-3 py-3 text-left text-sm leading-6 text-muted-foreground transition duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-primary/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                ))}
              </CardContent>
            </Card>
          </aside>

          <Card className="min-w-0 overflow-hidden border-border/70 bg-white/80 py-0 backdrop-blur-sm">
            <CardHeader className="border-b border-border/60 bg-white/70 p-4 md:p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Code2 className="h-6 w-6" />
                  </div>
                  <div className="min-w-0">
                    <CardTitle className="text-xl text-foreground md:text-2xl">
                      Hỏi đáp lập trình
                    </CardTitle>
                    <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">
                      Tập trung vào cách tư duy giải bài, debug lỗi và hiểu thuật
                      toán thay vì chỉ copy đáp án.
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary">
                    <Database className="h-3.5 w-3.5" />
                    Hybrid retrieval
                  </Badge>
                  <Badge variant="outline" className="border-border bg-black/[0.03] text-muted-foreground">
                    <Sparkles className="h-3.5 w-3.5" />
                    {selectedModel}
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex min-h-[78dvh] min-w-0 flex-col p-0">
              <ScrollArea className="flex-1 bg-[linear-gradient(180deg,rgba(15,23,42,0.02),transparent)] px-3 py-4 md:px-5">
                <div className="mx-auto w-full max-w-none space-y-4">
                  {messages.length > visibleMessages.length && (
                    <div className="flex justify-center">
                      <Button
                        variant="outline"
                        size="sm"
                        className="cursor-pointer rounded-full border-border/70 bg-white"
                        onClick={() =>
                          setVisibleMessageCount((current) => current + 20)
                        }
                      >
                        Xem thêm tin nhắn cũ
                      </Button>
                    </div>
                  )}

                  {visibleMessages.length === 0 && !isSending && (
                    <div className="flex min-h-[42vh] items-center justify-center py-10">
                      <div className="max-w-2xl rounded-[32px] border border-dashed border-primary/30 bg-white p-6 text-center shadow-[0_18px_60px_rgba(227,24,55,0.08)] md:p-8">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-primary text-white shadow-lg shadow-primary/25">
                          <Bot className="h-8 w-8" />
                        </div>
                        <h2 className="mt-5 text-2xl font-bold text-foreground">
                          Bạn muốn luyện phần nào hôm nay?
                        </h2>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                          Chọn prompt mẫu bên dưới hoặc nhập câu hỏi của bạn. Nếu
                          có code lỗi, hãy dán cả input, output mong đợi và thông
                          báo lỗi để AI hỗ trợ chính xác hơn.
                        </p>
                        <div className="mt-5 grid gap-2 text-left md:grid-cols-3">
                          {quickPromptGroups.map((group) => (
                            <button
                              key={group.title}
                              type="button"
                              onClick={() => setInput(group.prompts[0])}
                              className="cursor-pointer rounded-2xl border border-border/70 bg-black/[0.03] p-4 transition duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                            >
                              <p className="font-semibold text-foreground">
                                {group.title}
                              </p>
                              <p className="mt-1 line-clamp-3 text-xs leading-5 text-muted-foreground">
                                {group.prompts[0]}
                              </p>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {visibleMessages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex",
                        message.role === "user" ? "justify-end" : "justify-start",
                      )}
                    >
                      <div
                        className={cn(
                          "min-w-0 w-full max-w-[98%] overflow-hidden rounded-[24px] px-4 py-4 text-sm shadow-sm lg:max-w-[92%] xl:max-w-[88%]",
                          message.role === "user"
                            ? "bg-primary text-primary-foreground shadow-[0_14px_40px_rgba(227,24,55,0.18)]"
                            : "border border-border/70 bg-white text-foreground shadow-[0_16px_45px_rgba(15,23,42,0.08)]",
                        )}
                      >
                        {message.role === "assistant" ? (
                          <div className="prose prose-sm max-w-none text-foreground prose-p:leading-7 prose-headings:text-foreground prose-strong:text-foreground prose-code:before:hidden prose-code:after:hidden">
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              components={markdownComponents}
                            >
                              {message.content}
                            </ReactMarkdown>
                          </div>
                        ) : (
                          <p className="whitespace-pre-wrap leading-7">{message.content}</p>
                        )}

                        {message.role === "assistant" && (
                          <div className="mt-3 flex flex-wrap justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="cursor-pointer rounded-full text-muted-foreground hover:bg-black/10"
                              onClick={() => handleCopy(message.content)}
                            >
                              <Copy className="h-4 w-4" />
                              Copy
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => evaluateMessage(message.id)}
                              disabled={message.isEvaluating}
                              className="cursor-pointer rounded-full border border-border bg-black/[0.03] text-muted-foreground hover:bg-primary/5 hover:text-primary"
                            >
                              {message.isEvaluating ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Gauge className="h-4 w-4" />
                              )}
                              {message.isEvaluating ? "Đang chấm..." : "Tính tín nhiệm"}
                            </Button>
                          </div>
                        )}

                        {message.role === "assistant" && message.isEvaluating && (
                          <div className="mt-4 rounded-[24px] border border-border/70 bg-black/[0.03] px-4 py-4 shadow-[0_14px_35px_rgba(15,23,42,0.08)]">
                            <div className="flex items-center gap-3 text-sm text-foreground">
                              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-sm">
                                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                              </div>
                              <div>
                                <p className="font-semibold text-foreground">
                                  Đang chấm độ tín nhiệm câu trả lời
                                </p>
                                <p className="text-xs leading-5 text-muted-foreground">
                                  Hệ thống đang tính điểm tạm trước, rồi tiếp tục chạy benchmark và sandbox ở backend.
                                </p>
                                {message.evaluationJob?.status && (
                                  <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-primary">
                                    {message.evaluationJob.status}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {message.role === "assistant" && message.evaluation && (
                          <div className="mt-4 overflow-hidden rounded-[24px] border border-border/70 bg-black/[0.03] shadow-[0_14px_35px_rgba(15,23,42,0.08)]">
                            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 bg-white/70 px-4 py-3">
                              <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                                  {message.evaluation?.scorePhase === "quick" || message.evaluation?.isFinal === false
                                    ? "Điểm tín nhiệm tạm thời"
                                    : "Đánh giá độ tín nhiệm"}
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                  {getEvaluationSummary(message.evaluation)}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                {(message.evaluation?.scorePhase === "quick" || message.evaluation?.isFinal === false) && (
                                  <Badge variant="outline" className="border-border/70 bg-white text-primary">
                                    Tạm thời
                                  </Badge>
                                )}
                                <div className="rounded-full bg-black/[0.03]0 px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(227,24,55,0.20)]">
                                  {message.evaluation.score}/100
                                </div>
                              </div>
                            </div>

                            <div className="grid gap-3 px-4 py-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
                              <div className="space-y-3">
                                {message.evaluation.status === "unavailable" && (
                                  <div className="rounded-2xl border border-dashed border-border/70 bg-white px-4 py-3 text-sm text-foreground">
                                    <p className="font-semibold text-foreground">
                                      Chưa có benchmark hoặc rule phù hợp để đánh giá tự động
                                    </p>
                                    <p className="mt-1 text-xs leading-6 text-muted-foreground">
                                      {message.evaluation.rationale}
                                    </p>
                                    {(message.evaluation.benchmark?.candidateCount || message.evaluation.benchmark?.signals?.function_name || message.evaluation.benchmark?.signals?.task_id) && (
                                      <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                                        {typeof message.evaluation.benchmark?.candidateCount === "number" && (
                                          <Badge variant="outline" className="border-border/70 bg-white text-primary">
                                            {message.evaluation.benchmark.candidateCount} benchmark
                                          </Badge>
                                        )}
                                        {message.evaluation.benchmark?.signals?.function_name && (
                                          <Badge variant="outline" className="border-border/70 bg-white text-primary">
                                            function: {message.evaluation.benchmark.signals.function_name}
                                          </Badge>
                                        )}
                                        {message.evaluation.benchmark?.signals?.task_id && (
                                          <Badge variant="outline" className="border-border/70 bg-white text-primary">
                                            task: {message.evaluation.benchmark.signals.task_id}
                                          </Badge>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                )}

                                <div className="grid gap-2 sm:grid-cols-3">
                                  <div className="rounded-2xl border border-border/70 bg-white px-3 py-3">
                                    <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                                      Kết quả
                                    </p>
                                    <p className="mt-1 text-sm font-semibold text-foreground">
                                      {message.evaluation.total > 0
                                        ? `${message.evaluation.passed}/${message.evaluation.total} test`
                                        : "Chưa chấm được"}
                                    </p>
                                  </div>
                                  <div className="rounded-2xl border border-border/70 bg-white px-3 py-3">
                                    <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                                      Ngôn ngữ
                                    </p>
                                    <p className="mt-1 text-sm font-semibold text-foreground">
                                      {formatProgrammingLanguage(message.evaluation.language)}
                                    </p>
                                  </div>
                                  <div className="rounded-2xl border border-border/70 bg-white px-3 py-3">
                                    <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                                      Thời gian
                                    </p>
                                    <p className="mt-1 text-sm font-semibold text-foreground">
                                      {Math.round(message.evaluation.executionTimeMs)} ms
                                    </p>
                                  </div>
                                </div>

                                <div className="rounded-2xl border border-border/70 bg-white px-4 py-3 text-sm text-foreground">
                                  <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                    Nhận định
                                  </p>
                                  <p>{message.evaluation.rationale}</p>
                                </div>

                                {message.evaluation.benchmark?.datasetName && message.evaluation.benchmark?.sampleId && (
                                  <div className="rounded-2xl border border-border/70 bg-white px-4 py-3 text-sm text-foreground">
                                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                      {message.evaluation.benchmark?.datasetName === "rule_based_fallback"
                                        ? "Fallback đối chiếu"
                                        : "Benchmark đối chiếu"}
                                    </p>
                                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                                      <Badge variant="outline" className="border-border/70 bg-white text-foreground">
                                        {formatBenchmarkDatasetName(message.evaluation.benchmark.datasetName)}
                                      </Badge>
                                      <Badge variant="outline" className="border-border/70 bg-white text-foreground">
                                        {message.evaluation.benchmark.sampleId}
                                      </Badge>
                                      {message.evaluation.benchmark.entryPoint && (
                                        <Badge variant="outline" className="border-border/70 bg-white text-foreground">
                                          {message.evaluation.benchmark.entryPoint}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>

                              <div className="rounded-2xl border border-border/70 bg-white px-4 py-3">
                                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                  Trạng thái thực thi
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  <Badge variant="outline" className="border-border/70 bg-black/[0.03] text-foreground">
                                    {message.evaluation.status}
                                  </Badge>
                                  {message.evaluation.modelUsed && (
                                    <Badge variant="outline" className="border-border/70 bg-black/[0.03] text-foreground">
                                      {message.evaluation.modelUsed}
                                    </Badge>
                                  )}
                                </div>
                                {message.evaluation.stderr && (
                                  <div className="mt-3 rounded-2xl bg-black px-3 py-3 font-mono text-xs leading-5 text-white">
                                    {message.evaluation.stderr}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {message.role === "assistant" &&
                          message.sources &&
                          message.sources.length > 0 && (
                            <div className="mt-4 space-y-3 border-t border-border/60 pt-4">
                              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                {typeof message.confidence === "number" && (
                                  <Badge
                                    variant="outline"
                                    className="border-primary/20 bg-primary/5 text-primary"
                                  >
                                    Confidence {Math.round(message.confidence * 100)}%
                                  </Badge>
                                )}
                                {message.modelUsed && (
                                  <Badge
                                    variant="outline"
                                    className="border-border/70 bg-black/[0.03] text-foreground"
                                  >
                                    {message.modelUsed}
                                  </Badge>
                                )}
                              </div>
                              <div className="grid gap-2 md:grid-cols-2 2xl:grid-cols-3">
                                {message.sources.slice(0, 3).map((source) => (
                                  <div
                                    key={source.chunkId}
                                    className="min-w-0 rounded-2xl border border-border/70 bg-black/[0.03] px-3 py-3 text-xs text-muted-foreground"
                                  >
                                    <div className="mb-2 flex items-center justify-between gap-2">
                                      <p className="truncate font-medium text-foreground">
                                        {getShortSourceName(source.sourcePath, source.title)}
                                      </p>
                                      <Badge
                                        variant="outline"
                                        className="border-border/70 bg-white text-foreground"
                                      >
                                        {getSourceBadgeLabel(source.sourcePath)}
                                      </Badge>
                                    </div>
                                    <p className="line-clamp-2 text-[11px] leading-5 text-muted-foreground">
                                      {source.title}
                                    </p>
                                    <p className="mt-2">
                                      score: {source.similarityScore.toFixed(3)}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                      </div>
                    </div>
                  ))}

                  {isSending && (
                    <div className="flex justify-start">
                      <div className="inline-flex min-w-0 w-full max-w-[96%] overflow-hidden rounded-[28px] border border-primary/20 bg-white px-4 py-4 text-sm text-muted-foreground shadow-[0_16px_45px_rgba(15,23,42,0.08)] lg:max-w-[88%] xl:max-w-[80%]">
                        <div className="w-full space-y-3">
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                            {streamingContent
                              ? "AI đang trả lời..."
                              : "Đang kết nối tới AI..."}
                          </div>
                          {streamingContent && (
                            <div className="prose prose-sm max-w-none text-foreground prose-p:leading-7 prose-headings:text-foreground prose-strong:text-foreground prose-code:before:hidden prose-code:after:hidden">
                              <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={markdownComponents}
                              >
                                {streamingContent}
                              </ReactMarkdown>
                            </div>
                          )}
                          <div className="flex">
                            <Button
                              variant="outline"
                              size="sm"
                              className="cursor-pointer rounded-full border-border/70 bg-white"
                              onClick={stopStreaming}
                            >
                              <Square className="h-4 w-4" />
                              Dừng
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              <div className="border-t border-border/60 bg-white/80 px-3 py-3 md:px-5">
                <div className="mx-auto max-w-none rounded-[28px] border border-border/70 bg-white p-3 shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
                  <div className="mb-3 flex flex-col gap-3 border-b border-border/60 px-2 pb-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        Mô hình AI
                      </p>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        Chọn mô hình phù hợp trước khi gửi câu hỏi.
                      </p>
                    </div>
                    <ModelSelector
                      value={selectedModel}
                      onChange={setSelectedModel}
                      disabled={isSending}
                      size="sm"
                      className="w-full lg:w-auto"
                    />
                  </div>
                  <Textarea
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    placeholder="Hỏi về code, lỗi lập trình, thuật toán hoặc dán đoạn code cần giải thích..."
                    className="min-h-[132px] resize-none rounded-[24px] border-border/70 bg-black/[0.03] p-4 leading-7 shadow-none focus-visible:ring-2 focus-visible:ring-primary"
                  />
                  <div className="mt-3 flex flex-col gap-3 px-2 md:flex-row md:items-center md:justify-between">
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <Badge
                        variant="outline"
                        className="border-primary/20 bg-primary/5 text-primary"
                      >
                        <Database className="mr-1 h-3.5 w-3.5" />
                        GraphRAG
                      </Badge>
                      <Badge
                        variant="outline"
                        className="border-border bg-black/[0.03] text-muted-foreground"
                      >
                        <Sparkles className="mr-1 h-3.5 w-3.5" />
                        {selectedModel}
                      </Badge>
                    </div>
                    <Button
                      onClick={handleSubmit}
                      disabled={isSending || !input.trim()}
                      className="h-12 cursor-pointer rounded-2xl px-6"
                    >
                      {isSending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <SendHorizonal className="h-4 w-4" />
                      )}
                      Gửi câu hỏi
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog
        open={Boolean(sessionToDelete)}
        onOpenChange={(open) => {
          if (!open) setSessionToDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Xóa phiên chat "{sessionToDelete?.title}"?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này sẽ xóa toàn bộ lịch sử tin nhắn của phiên chat trên
              hệ thống và không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Quay lại</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!sessionToDelete) return;
                await deleteSession(sessionToDelete.id);
                toast.success("Đã xóa phiên chat");
                setSessionToDelete(null);
              }}
            >
              Xóa phiên chat
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={Boolean(renameDialog)}
        onOpenChange={(open) => {
          if (!open) {
            setRenameDialog(null);
            setRenameValue("");
          }
        }}
      >
        <DialogContent className="border-[#eddcc6] bg-[linear-gradient(180deg,#fffaf4,#fff6eb)] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Đổi tên phiên chat</DialogTitle>
            <DialogDescription>
              Đặt lại tên để bạn dễ tìm lại cuộc trò chuyện này sau.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="rounded-2xl border border-[#ecdcc8] bg-white/80 p-3 text-xs text-muted-foreground">
              Tên mặc định của phiên mới sẽ là `Đoạn chat mới`. Sau câu hỏi đầu
              tiên, hệ thống tự lấy 5 từ đầu để đặt tiêu đề.
            </div>
            <div className="space-y-2">
              <label
                className="text-sm font-medium text-foreground"
                htmlFor="rename-session-input"
              >
                Tên phiên chat
              </label>
              <Input
                id="rename-session-input"
                value={renameValue}
                onChange={(event) => setRenameValue(event.target.value)}
                placeholder="Ví dụ: Debug binary search Python"
                maxLength={80}
                className="border-[#ead8c2] bg-white"
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    void handleConfirmRename();
                  }
                }}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRenameDialog(null);
                setRenameValue("");
              }}
            >
              Hủy
            </Button>
            <Button
              onClick={handleConfirmRename}
              disabled={isRenaming || !renameValue.trim()}
              className=""
            >
              {isRenaming ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Lưu tên mới
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
