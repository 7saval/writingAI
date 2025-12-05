import type { Project } from "../types/database";
import { apiClient } from "./client";

// 전체 프로젝트 조회
export const fetchProjects = async () => {
    const response = await apiClient.get<Project[]>(`/projects`);
    return response.data;
}

// 프로젝트 상세 조회
export const fetchProjectDetail = async (projectId: number) => {
    const response = await apiClient.get<Project>(`/projects/${projectId}`);
    return response.data;
}