import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchProjects,
  fetchProjectDetail,
  createProject,
  updateProject,
  deleteProject,
  fetchProjectContexts,
  updateContext,
} from "@/api/projects.api";
import type { Project } from "@/types/database";

// Query Keys
export const projectKeys = {
  all: ["projects"] as const,
  lists: () => [...projectKeys.all, "list"] as const,
  details: () => [...projectKeys.all, "detail"] as const,
  detail: (id: number) => [...projectKeys.details(), id] as const,
  contexts: () => [...projectKeys.all, "context"] as const,
  context: (id: number) => [...projectKeys.contexts(), id] as const,
};

/**
 * 전체 프로젝트 목록을 조회하는 Query 훅
 */
export const useProjectsQuery = () => {
  return useQuery({
    queryKey: projectKeys.lists(),
    queryFn: fetchProjects,
  });
};

/**
 * 특정 프로젝트의 상세 정보를 조회하는 Query 훅
 * @param projectId 프로젝트 ID
 */
export const useProjectDetailQuery = (projectId: number) => {
  return useQuery({
    queryKey: projectKeys.detail(projectId),
    queryFn: () => fetchProjectDetail(projectId),
    enabled: !!projectId, // projectId가 유효할 때만 실행
  });
};

/**
 * 특정 프로젝트의 컨텍스트(설정/배경 등)를 조회하는 Query 훅
 * @param projectId 프로젝트 ID
 */
export const useProjectContextsQuery = (projectId: number) => {
  return useQuery({
    queryKey: projectKeys.context(projectId),
    queryFn: () => fetchProjectContexts(projectId),
    enabled: !!projectId,
  });
};

/**
 * 새 프로젝트를 생성하는 Mutation 훅
 */
export const useCreateProjectMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Project) => createProject(data),
    onSuccess: () => {
      // 프로젝트 목록 조회 캐시 무효화 (데이터 리패치)
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
};

/**
 * 기존 프로젝트를 수정하는 Mutation 훅
 */
export const useUpdateProjectMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, data }: { projectId: number; data: Project }) =>
      updateProject(projectId, data),
    onSuccess: (_, variables) => {
      // 목록 및 특정 프로젝트 상세 캐시 무효화
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: projectKeys.detail(variables.projectId),
      });
    },
  });
};

/**
 * 프로젝트를 삭제하는 Mutation 훅
 */
export const useDeleteProjectMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectId: number) => deleteProject(projectId),
    onSuccess: (_, projectId) => {
      // 목록 및 삭제된 프로젝트 상세 캐시 무효화
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      queryClient.removeQueries({ queryKey: projectKeys.detail(projectId) });
      queryClient.removeQueries({ queryKey: projectKeys.context(projectId) });
    },
  });
};

/**
 * 프로젝트의 컨텍스트를 수정하는 Mutation 훅
 */
export const useUpdateContextMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      data,
    }: {
      projectId: number;
      data: Partial<Project>;
    }) => updateContext(projectId, data),
    onSuccess: (_, variables) => {
      // 컨텍스트 캐시 무효화
      queryClient.invalidateQueries({
        queryKey: projectKeys.context(variables.projectId),
      });
    },
  });
};
