import { useEffect, useState } from "react";
import {
  useProjectContextsQuery,
  useUpdateContextMutation,
} from "@/hooks/useProjects";
import { showAlert, showConfirm } from "@/store/useDialogStore";

export const useSynopsis = (projectId: number) => {
  const { data: contexts, isLoading: isQueryLoading } =
    useProjectContextsQuery(projectId);
  const { mutateAsync: updateContextAsync } = useUpdateContextMutation();
  const [synopsis, setSynopsis] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isLoading = isQueryLoading;

  // 모달이 열릴 때 데이터 fetch (캐시 기반 렌더링)
  useEffect(() => {
    if (contexts) {
      setSynopsis(contexts.synopsis || "");
    }
  }, [contexts]);

  const saveContext = async () => {
    const isConfirmed = await showConfirm(
      "시놉시스를 저장하시겠습니까?",
      "시놉시스 저장",
    );
    if (!isConfirmed) return;

    try {
      setIsSubmitting(true);
      await updateContextAsync({ projectId, data: { synopsis } });
      await showAlert("저장되었습니다.");
    } catch (error) {
      console.error("Failed to save context", error);
      await showAlert("저장에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateSynopsis = (value: string) => {
    setSynopsis(value);
  };

  return {
    synopsis,
    isSubmitting,
    isLoading,
    saveContext,
    updateSynopsis,
  };
};
