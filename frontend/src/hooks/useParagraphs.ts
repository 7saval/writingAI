import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchProjectParagraphs,
  updateParagraph,
  deleteParagraph,
  regenerateAiParagraph,
} from "@/api/parapraphs.api";

// Query Keys
export const paragraphKeys = {
  all: ["paragraphs"] as const,
  lists: () => [...paragraphKeys.all, "list"] as const,
  list: (projectId: number) => [...paragraphKeys.lists(), projectId] as const,
};

/**
 * 특정 프로젝트의 모든 단락을 조회하는 Query 훅
 * @param projectId 프로젝트 ID
 */
export const useProjectParagraphsQuery = (projectId: number) => {
  return useQuery({
    queryKey: paragraphKeys.list(projectId),
    queryFn: () => fetchProjectParagraphs(projectId),
    enabled: !!projectId, // projectId가 유효할 때만 실행
  });
};

/**
 * 특정 단락의 내용을 수정하는 Mutation 훅
 */
export const useUpdateParagraphMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      paragraphId,
      data,
    }: {
      paragraphId: number;
      data: { content: string };
    }) => updateParagraph(paragraphId, data),
    onSuccess: () => {
      // 단락 목록 데이터를 갱신하기 위해 캐시 무효화
      // (어느 프로젝트의 단락인지 파악하기 어려울 수 있으므로 전체 단락 리스트 관련된 캐시를 무효화하거나,
      // onSuccess 콜백쪽에서 projectId를 같이 넘겨주도록 구조를 수정할 수도 있습니다.)
      queryClient.invalidateQueries({ queryKey: paragraphKeys.lists() });
    },
  });
};

/**
 * 특정 단락을 삭제하는 Mutation 훅
 */
export const useDeleteParagraphMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (paragraphId: number) => deleteParagraph(paragraphId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paragraphKeys.lists() });
    },
  });
};

/**
 * AI를 통해 특정 단락을 재생성(리라이팅)하는 Mutation 훅
 */
export const useRegenerateAiParagraphMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      paragraphId,
      options,
    }: {
      paragraphId: number;
      options?: { temperature: number; maxTokens: number };
    }) => regenerateAiParagraph(paragraphId, options),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paragraphKeys.lists() });
    },
  });
};
