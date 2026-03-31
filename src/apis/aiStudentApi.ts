import { api } from "@/apis/api";

export interface AIStudentMessage {
  role: "assistant" | "user";
  content: string;
}

export interface AIStudentQueryRequest {
  query: string;
  history?: AIStudentMessage[];
  language?: "python" | "cpp" | string;
  topic?: string;
  difficulty?: "basic" | "intermediate" | "advanced";
  topK?: number;
  modelType?: string;
  fastMode?: boolean;
}

export interface AIStudentQueryResponse {
  answer: string;
  sources: Array<{
    chunkId: string;
    documentId: string;
    sourcePath: string;
    title: string;
    chunkIndex: number;
    similarityScore: number;
    language?: string;
    topic?: string;
    difficulty?: string;
  }>;
  modelUsed: string;
  confidence: number;
  retrievalCount: number;
}

export interface AIStudentStreamDonePayload {
  assistantMessage?: {
    role: "assistant" | "user";
    content: string;
  };
  sources?: AIStudentQueryResponse["sources"];
  modelUsed?: string;
  confidence?: number;
  retrievalCount?: number;
}

export interface AIStudentSession {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  lastMessage?: string;
  messageCount?: number;
}

export interface AIStudentEvaluationResult {
  id?: string;
  score: number;
  status: string;
  language: "python" | "cpp" | string;
  rationale: string;
  passed: number;
  total: number;
  executionTimeMs: number;
  stderr?: string;
  stdout?: string;
  testCode?: string;
  benchmark?: {
    datasetName?: string;
    sampleId?: string;
    entryPoint?: string | null;
    source?: string;
    candidateCount?: number;
    signals?: {
      function_name?: string | null;
      task_id?: string | null;
    };
  } | null;
  modelUsed?: string;
}

export const aiStudentApi = {
  listSessions: async () => {
    const response = await api.get("/ai/tutor/student-programming/sessions");
    return response.data as AIStudentSession[];
  },

  createSession: async (title?: string) => {
    const response = await api.post("/ai/tutor/student-programming/sessions", { title });
    return response.data as AIStudentSession;
  },

  updateSession: async (sessionId: string, title: string) => {
    const response = await api.patch(`/ai/tutor/student-programming/sessions/${sessionId}`, { title });
    return response.data as AIStudentSession;
  },

  deleteSession: async (sessionId: string) => {
    const response = await api.delete(`/ai/tutor/student-programming/sessions/${sessionId}`);
    return response.data as { success: boolean; sessionId: string };
  },

  listMessages: async (sessionId: string) => {
    const response = await api.get(`/ai/tutor/student-programming/sessions/${sessionId}/messages`);
    return response.data as Array<{
      id: string;
      sessionId: string;
      role: "assistant" | "user";
      content: string;
      createdAt: string;
      sources?: AIStudentQueryResponse["sources"];
      confidence?: number;
      modelUsed?: string;
      evaluation?: AIStudentEvaluationResult;
      evaluationJob?: {
        id: string;
        status: string;
        score?: number;
      };
    }>;
  },

  createMessage: async (
    sessionId: string,
    payload: {
      content: string;
      role: "assistant" | "user";
      sources?: AIStudentQueryResponse["sources"];
      confidence?: number;
      modelUsed?: string;
    },
  ) => {
    const response = await api.post(`/ai/tutor/student-programming/sessions/${sessionId}/messages`, payload);
    return response.data;
  },

  askProgrammingTutor: async (payload: AIStudentQueryRequest) => {
    const response = await api.post("/ai/tutor/query", payload);
    return response.data as AIStudentQueryResponse;
  },

  evaluateProgrammingAnswer: async (payload: {
    sessionId: string;
    messageId: string;
    question: string;
    answer: string;
    modelType?: string;
    language?: string;
  }) => {
    const response = await api.post("/ai/tutor/student-programming/evaluate", payload);
    return response.data as { id: string; status: string; messageId: string; sessionId: string };
  },

  getEvaluationJob: async (jobId: string) => {
    const response = await api.get(`/ai/tutor/student-programming/evaluate/${jobId}`);
    return response.data as AIStudentEvaluationResult & {
      id: string;
      messageId: string;
      sessionId: string;
      errorMessage?: string;
      metadata?: {
        stage?: string;
      };
    };
  },

  streamProgrammingTutor: (
    payload: AIStudentQueryRequest,
    onChunk: (chunk: string) => void,
    onComplete: (payload?: AIStudentStreamDonePayload) => void,
    onError: (error: string) => void,
  ) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
    const controller = new AbortController();

    fetch(`${baseUrl}/ai/tutor/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      credentials: "include",
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          onError(errorData.message || errorData.detail || "Không thể stream phản hồi AI");
          return;
        }

        const reader = response.body?.getReader();
        if (!reader) {
          onError("Không thể đọc response stream");
          return;
        }

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) {
              continue;
            }
            try {
              const event = JSON.parse(line.slice(6));
              if (event.type === "chunk") {
                onChunk(event.data || "");
              }
              else if (event.type === "done") {
                onComplete(event.data || undefined);
              }
              else if (event.type === "error") {
                onError(event.data || "Lỗi stream tutor");
              }
            }
            catch {
              // Ignore malformed SSE events
            }
          }
        }
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          onError(error.message || "Lỗi kết nối stream");
        }
      });

    return () => controller.abort();
  },
};
