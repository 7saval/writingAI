import { useEffect, useState } from "react";
import {
  useProjectContextsQuery,
  useUpdateContextMutation,
} from "@/hooks/useProjects";
import { showAlert, showConfirm } from "@/store/useDialogStore";
import type { SynopsisState } from "@/types/database";

const initialSynopsisState: SynopsisState = {
  introduction: "",
  development: "",
  crisis: "",
  climax: "",
  conclusion: "",
};

export const useSynopsis = (projectId: number) => {
  const { data: contexts, isLoading: isQueryLoading } =
    useProjectContextsQuery(projectId);
  const { mutateAsync: updateContextAsync } = useUpdateContextMutation();
  const [synopsis, setSynopsis] = useState<SynopsisState>(initialSynopsisState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isLoading = isQueryLoading;

  // 모달이 열릴 때 데이터 fetch (캐시 기반 렌더링)
  useEffect(() => {
    if (contexts && contexts.synopsis) {
      try {
        // JSON 파싱 시도
        const parsed = JSON.parse(contexts.synopsis);
        if (typeof parsed === "object" && parsed !== null) {
          setSynopsis({
            ...initialSynopsisState,
            ...parsed,
          });
        }
      } catch (e) {
        // JSON이 아닐 경우(기존 데이터) '발단'에 몰아넣기
        setSynopsis({
          ...initialSynopsisState,
          introduction: contexts.synopsis,
        });
      }
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
      // 객체를 JSON 문자열로 변환하여 저장
      await updateContextAsync({
        projectId,
        data: { synopsis: JSON.stringify(synopsis) },
      });
      await showAlert("저장되었습니다.");
    } catch (error) {
      console.error("Failed to save context", error);
      await showAlert("저장에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateSynopsisPart = (part: keyof SynopsisState, value: string) => {
    setSynopsis((prev) => ({
      ...prev,
      [part]: value,
    }));
  };

  return {
    synopsis,
    isSubmitting,
    isLoading,
    saveContext,
    updateSynopsisPart,
  };
};
