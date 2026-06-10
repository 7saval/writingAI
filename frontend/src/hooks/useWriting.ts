import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  writeParagraph,
  generateVariants,
  generateVariantsStream,
  selectVariant,
  type GenerateVariantsStreamCallbacks,
} from "@/api/writing.api";
import { paragraphKeys } from "@/hooks/useParagraphs";
import { useWritingStore } from "@/store/useWritingStore";

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
      queryClient.invalidateQueries({
        queryKey: paragraphKeys.list(variables.projectId),
      });
    },
  });
};

export const useGenerateVariantsMutation = () => {
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
    }) => generateVariants(projectId, content, prompt, currentStage),
  });
};

export const useGenerateVariantsStream = () => {
  const { currentStage } = useWritingStore();

  return useCallback(
    (
      projectId: number,
      content: string,
      callbacks: GenerateVariantsStreamCallbacks,
      prompt?: string,
    ) => generateVariantsStream(projectId, content, callbacks, prompt, currentStage),
    [currentStage],
  );
};

export const useSelectVariantMutation = () => {
  return useMutation({
    mutationFn: ({
      projectId,
      sessionId,
      variantId,
    }: {
      projectId: number;
      sessionId: string;
      variantId: string;
    }) => selectVariant(projectId, sessionId, variantId),
  });
};
