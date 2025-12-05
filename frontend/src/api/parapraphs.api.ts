import type { Paragraph } from "../types/database";
import { apiClient } from "./client";

// 프로젝트 단락 조회
export const fetchProjectParagraphs = async (projectId: number) => {
    const response = await apiClient.get<Paragraph[]>(`/projects/${projectId}/paragraphs`);
    return response.data;
}