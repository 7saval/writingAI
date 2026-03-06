import { useMutation, useQueryClient } from "@tanstack/react-query";
import { writeParagraph } from "@/api/writing.api";
import { paragraphKeys } from "./useParagraphs";

/**
 * 새로운 단락을 AI 등을 통해 작성(추가)하는 Mutation 훅
 */
export const useWriteParagraphMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      content,
    }: {
      projectId: number;
      content: string;
    }) => writeParagraph(projectId, content),
    onSuccess: (_, variables) => {
      // 단락이 새로 작성되었으므로 해당 프로젝트의 단락 목록 캐시 무효화
      queryClient.invalidateQueries({
        queryKey: paragraphKeys.list(variables.projectId),
      });
    },
  });
};
