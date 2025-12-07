import type { Paragraph } from "../types/database";
import { apiClient } from "./client";

// 프로젝트 단락 조회
export const fetchProjectParagraphs = async (projectId: number) => {
    const response = await apiClient.get<Paragraph[]>(`/projects/${projectId}/paragraphs`);
    return response.data;
}

// 프로젝트 단락 수정
export const updateParagraph = async (paragraphId: number, data: { content: string }) => {
    const response = await apiClient.put(`/paragraphs/${paragraphId}`, data);
    return response.data;
}

// 프로젝트 단락 삭제
export const deleteParagraph = async (paragraphId: number) => {
    const response = await apiClient.delete(`/paragraphs/${paragraphId}`);
    return response.data;
}

// AI 단락 재생성
export const regenerateAiParagraph = async (paragraphId: number, options?: { temperature: number, maxTokens: number }) => {
    const response = await apiClient.post(`/paragraphs/${paragraphId}/regenerate`, options);
    return response.data;
}