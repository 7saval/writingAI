import { apiClient } from "./client";
import type { Paragraph, VariantResult } from "@/types/database";
import { fetchSsePost } from "@/lib/sseClient";

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

// 변형 SSE 스트리밍 콜백 타입
export interface GenerateVariantsStreamCallbacks {
  onUserParagraph?: (paragraph: Paragraph) => void;
  onChunk?: (variantId: string, content: string) => void;
  onVariantDone?: (variantId: string) => void;
  onEvaluating?: () => void;
  onDone?: (sessionId: string, variants: VariantResult[]) => void;
  onError?: (error: string) => void;
}

// 변형 SSE 스트리밍 생성
export const generateVariantsStream = async (
  projectId: number,
  content: string,
  callbacks: GenerateVariantsStreamCallbacks,
  prompt?: string,
  stage?: string,
) => {
  try {
    await fetchSsePost(
      `/writing/${projectId}/write/variants/stream`,
      { content, prompt, stage },
      (event) => {
        switch (event.type) {
          case "user_paragraph": callbacks.onUserParagraph?.(event.paragraph); break;
          case "chunk":          callbacks.onChunk?.(event.variantId, event.content); break;
          case "variant_done":   callbacks.onVariantDone?.(event.variantId); break;
          case "evaluating":     callbacks.onEvaluating?.(); break;
          case "done":           callbacks.onDone?.(event.sessionId, event.variants); break;
          case "error":          callbacks.onError?.(event.message); break;
        }
      },
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("generateVariantsStream error:", msg);
    callbacks.onError?.(msg);
  }
};

// 변형 생성 요청 (non-streaming fallback)
export const generateVariants = async (
  projectId: number,
  content: string,
  prompt?: string,
  stage?: string,
): Promise<{ sessionId: string; variants: VariantResult[]; userParagraph: Paragraph }> => {
  const response = await apiClient.post(`/writing/${projectId}/write/variants`, {
    content,
    prompt,
    stage,
  });
  return response.data;
};

// 선택한 변형 저장
export const selectVariant = async (
  projectId: number,
  sessionId: string,
  variantId: string,
): Promise<{ aiParagraph: Paragraph }> => {
  const response = await apiClient.post(`/writing/${projectId}/write/select`, {
    sessionId,
    variantId,
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
  try {
    await fetchSsePost(
      `/writing/${projectId}/write/stream`,
      { content, prompt, stage },
      (event) => {
        switch (event.type) {
          case "user":     callbacks.onUserParagraph?.(event.paragraph); break;
          case "ai_start": callbacks.onAiStart?.(event.paragraph); break;
          case "chunk":    callbacks.onChunk?.(event.content); break;
          case "done":     callbacks.onDone?.(event.paragraph); break;
          case "error":    callbacks.onError?.(event.message); break;
        }
      },
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("writeParagraphStream error:", msg);
    callbacks.onError?.(msg);
  }
};
