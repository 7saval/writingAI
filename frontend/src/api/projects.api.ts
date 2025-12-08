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

// 프로젝트 생성
export const createProject = async (data: Project) => {
    const response = await apiClient.post(`/projects`, data);
    return response.data;
}

// 프로젝트 수정
export const updateProject = async (projectId: number, data: Project) => {
    const response = await apiClient.put(`/projects/${projectId}`, data);
    return response.data;
}

// 프로젝트 삭제
export const deleteProject = async (projectId: number) => {
    const response = await apiClient.delete(`/projects/${projectId}`);
    return response.data;
}

// 컨텍스트 조회
export const fetchProjectContexts = async (projectId: number) => {
    const response = await apiClient.get<Project>(`/projects/${projectId}/context`);
    return response.data;
}

// 컨텍스트 수정
export const updateContext = async (projectId: number, data: Partial<Project>) => {
    const response = await apiClient.put(`/projects/${projectId}/context`, data);
    return response.data;
}