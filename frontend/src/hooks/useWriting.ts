import { useMutation, useQueryClient } from "@tanstack/react-query";
import { writeParagraph } from "@/api/writing.api";
import { paragraphKeys } from "@/hooks/useParagraphs";
import { useWritingStore } from "@/store/useWritingStore";

/**
 * 새로운 단락을 AI 등을 통해 작성(추가)하는 Mutation 훅
 */
export const useWriteParagraphMutation = () => {
  const queryClient = useQueryClient();
  const { currentStage } = useWritingStore();

  return useMutation({
    mutationFn: ({
      projectId,
      content,
      prompt,
    }: {
      projectId: number;
      content: string;
      prompt?: string;
    }) => writeParagraph(projectId, content, prompt, currentStage),
    onSuccess: (_, variables) => {
      // 단락이 새로 작성되었으므로 해당 프로젝트의 단락 목록 캐시 무효화
      queryClient.invalidateQueries({
        queryKey: paragraphKeys.list(variables.projectId),
      });
    },
  });
};
