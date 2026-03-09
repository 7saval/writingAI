import { useEffect, useRef, useState } from "react";
import type { Paragraph } from "@/types/database";
import { useParams } from "react-router-dom";
import { useProjectParagraphsQuery } from "@/hooks/useParagraphs";
import { useWriteParagraphMutation } from "@/hooks/useWriting";
import ParagraphItem from "@/components/ParagraphItem";
import { showAlert } from "@/store/useDialogStore";
import { useWritingStore } from "@/store/useWritingStore";

function Editor() {
  const { projectId } = useParams(); // URL에서 projectId 가져오기
  const [paragraphs, setParagraphs] = useState<Paragraph[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { aiDirective, resetAiDirective } = useWritingStore();

  const { data: fetchedParagraphs } = useProjectParagraphsQuery(
    Number(projectId),
  );
  const { mutateAsync: writeParagraphAsync } = useWriteParagraphMutation();

  // 초기 데이터 로드 (로컬 state 업데이트 유지 원함)
  useEffect(() => {
    if (fetchedParagraphs) {
      setParagraphs(fetchedParagraphs);
    }
  }, [fetchedParagraphs]);

  // 단락이 추가될 때마다 스크롤을 최하단으로 이동
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop =
        scrollContainerRef.current.scrollHeight;
    }
  }, [paragraphs]);

  // 단락 제출 핸들러
  const handleSubmit = async () => {
    if (!input.trim() || !projectId) return;

    const userInput = input;
    const currentDirective = aiDirective;
    setInput(""); // 입력창 즉시 초기화
    resetAiDirective(); // 지시사항도 초기화

    // 임시 ID (서버 DB와 충돌하지 않도록 음수나 현재 시간 사용)
    const tempUserId = -Date.now();
    const tempAiId = -(Date.now() + 1);

    const tempUserParagraph: Paragraph = {
      id: tempUserId,
      project_id: Number(projectId),
      content: userInput,
      writtenBy: "user",
      orderIndex: paragraphs.length,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const tempAiParagraph: Paragraph = {
      id: tempAiId,
      project_id: Number(projectId),
      content: "",
      writtenBy: "ai",
      orderIndex: paragraphs.length + 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      isLoading: true, // 로딩 상태 플래그
    };

    // 낙관적 업데이트: 화면에 즉시 빈 AI 단락까지 렌더링
    setParagraphs((prev) => [...prev, tempUserParagraph, tempAiParagraph]);
    setIsLoading(true);

    try {
      // API 호출
      const res = await writeParagraphAsync({
        projectId: Number(projectId),
        content: userInput,
        prompt: currentDirective || undefined, // 지시사항 전달
      });

      // API 응답을 받으면 임시 단락들을 실제 단락으로 교체 (AI 단락의 isLoading은 false 또는 속성 없음으로 치환됨)
      setParagraphs((prev) =>
        prev.map((p) => {
          if (p.id === tempUserId) return res.userParagraph;
          if (p.id === tempAiId) return { ...res.aiParagraph, isTyping: true };
          return p;
        }),
      );
    } catch (error) {
      console.error("Failed to write paragraph:", error);
      // 에러 발생 시 원래 상태로 롤백 (임시 단락 삭제)
      setParagraphs((prev) =>
        prev.filter((p) => p.id !== tempUserId && p.id !== tempAiId),
      );
      setInput(userInput);
      // 에러 시 지시사항 복구 고민할 수 있으나 유저가 다시 쓰게 하는게 안전
      await showAlert("단락 작성에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!projectId) {
    return (
      <div className="flex h-full w-full items-center justify-center text-slate-400">
        <p>왼쪽 사이드바에서 프로젝트를 선택해주세요.</p>
      </div>
    );
  }

  // 단락 수정 핸들러
  const handleUpdate = (id: number, newContent: string) => {
    setParagraphs((prev) =>
      prev.map((p) => (p.id === id ? { ...p, content: newContent } : p)),
    );
  };

  // 단락 삭제 핸들러
  const handleDelete = (id: number) => {
    setParagraphs((prev) => prev.filter((p) => p.id !== id));
  };

  // AI 재생성 핸들러
  const handleRegenerate = (id: number, newContent: string) => {
    setParagraphs((prev) =>
      prev.map((p) => (p.id === id ? { ...p, content: newContent } : p)),
    );
  };

  return (
    // flex-1 to take up remaining space, h-full to fill parent
    <div className="flex h-full w-full flex-col">
      {/* 메인 글쓰기 영역 */}
      <section className="flex flex-1 flex-col overflow-hidden bg-white">
        <div
          ref={scrollContainerRef}
          className="flex-1 space-y-4 overflow-y-auto p-6 custom-scrollbar"
        >
          {paragraphs.map((p) => (
            <ParagraphItem
              key={p.id}
              paragraph={p}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
              onRegenerate={handleRegenerate}
            />
          ))}
        </div>
        {/* 입력 영역 */}
        <div className="shrink-0 border-t border-border p-6">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="이야기를 이어 써보세요"
            className="h-32 w-full rounded-xl border border-border bg-slate-50 p-4 text-base focus:border-primary focus:outline-none"
          />
          <button
            className="btn-primary mt-4 w-full"
            disabled={isLoading}
            onClick={handleSubmit}
          >
            {isLoading ? "AI 작성 중..." : "단락 제출"}
          </button>
        </div>
      </section>
    </div>
  );
}

export default Editor;
