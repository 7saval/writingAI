import { apiClient } from "./client";
import type { Paragraph } from "@/types/database";
import { useAuthStore } from "@/store/authStore";

// 단락 작성
export const writeParagraph = async (
  projectId: number,
  content: string,
  prompt?: string,
  stage?: string,
) => {
  const response = await apiClient.post(`/writing/${projectId}/write`, {
    content,
    prompt,
    stage,
  });
  return response.data;
};

// SSE 스트리밍으로 단락 작성
interface StreamCallbacks {
  onUserParagraph?: (paragraph: Paragraph) => void;
  onAiStart?: (paragraph: Paragraph) => void;
  onChunk?: (content: string) => void;
  onDone?: (paragraph: Paragraph) => void;
  onError?: (error: string) => void;
}

export const writeParagraphStream = async (
  projectId: number,
  content: string,
  callbacks: StreamCallbacks,
  prompt?: string,
  stage?: string,
) => {
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const accessToken = useAuthStore.getState().accessToken;

  try {
    const response = await fetch(`${apiUrl}/writing/${projectId}/write/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify({
        content,
        prompt,
        stage,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("Response body is not readable");
    }

    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // SSE 이벤트 파싱 (라인 단위로 분할하여 안전하게 처리)
      const lines = buffer.split(/\r?\n/);

      // 마지막 불완전한 라인은 다음 반복을 위해 버퍼에 유지
      buffer = lines[lines.length - 1];

      // 완전한 이벤트들 처리
      for (let i = 0; i < lines.length - 1; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        if (line.startsWith("data: ")) {
          const jsonStr = line.substring(6); // "data: " 제거
          try {
            const event = JSON.parse(jsonStr);

            switch (event.type) {
              case "user":
                callbacks.onUserParagraph?.(event.paragraph);
                break;
              case "ai_start":
                callbacks.onAiStart?.(event.paragraph);
                break;
              case "chunk":
                callbacks.onChunk?.(event.content);
                break;
              case "done":
                callbacks.onDone?.(event.paragraph);
                break;
              case "error":
                callbacks.onError?.(event.message);
                break;
            }
          } catch (parseError) {
            console.error("Failed to parse SSE event:", line, parseError);
          }
        }
      }
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("writeParagraphStream error:", errorMessage);
    callbacks.onError?.(errorMessage);
  }
};
