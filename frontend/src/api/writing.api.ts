import { apiClient } from "./client";

// 단락 작성
export const writeParagraph = async (projectId: number, content: string) => {
    const response = await apiClient.post(`/writing/${projectId}/write`, { content });
    return response.data;
}