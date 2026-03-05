import { useEffect, useState } from "react";
import type { Paragraph } from "@/types/database";
import {
  deleteParagraph,
  regenerateAiParagraph,
  updateParagraph,
} from "@/api/parapraphs.api";
import { showAlert, showConfirm } from "@/store/useDialogStore";

interface ParagraphItemProps {
  paragraph: Paragraph; // 단락
  onUpdate: (id: number, newContent: string) => void; // 수정 핸들러
  onDelete: (id: number) => void; // 삭제 핸들러
  onRegenerate: (id: number, newContent: string) => void; // 재생성 핸들러
}

function ParagraphItem({
  paragraph,
  onUpdate,
  onDelete,
  onRegenerate,
}: ParagraphItemProps) {
  const [isEditing, setIsEditing] = useState(false); // 수정 중 여부
  const [editContent, setEditContent] = useState(paragraph.content); // 수정 중인 내용
  const [isRegenerating, setIsRegenerating] = useState(false); // 재생성 중 여부

  // 타이핑 애니메이션 관련 상태
  const [displayedContent, setDisplayedContent] = useState(
    paragraph.isTyping ? "" : paragraph.content,
  );
  const [isTyping, setIsTyping] = useState(paragraph.isTyping || false);

  useEffect(() => {
    if (isTyping && paragraph.content) {
      let i = 0;
      setDisplayedContent("");
      const interval = setInterval(() => {
        setDisplayedContent(paragraph.content.slice(0, i + 1));
        i++;
        if (i >= paragraph.content.length) {
          clearInterval(interval);
          setIsTyping(false);
        }
      }, 30); // 글자당 30ms

      return () => clearInterval(interval);
    } else if (!isTyping) {
      setDisplayedContent(paragraph.content);
    }
  }, [isTyping, paragraph.content]);

  // 수정 저장
  const handleSave = async () => {
    try {
      await updateParagraph(paragraph.id, { content: editContent });
      onUpdate(paragraph.id, editContent);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update paragraph:", error);
      await showAlert("단락 수정에 실패했습니다.");
    }
  };

  // 삭제
  const handleDelete = async () => {
    const isConfirmed = await showConfirm(
      "이 단락을 정말로 삭제하시겠습니까?",
      "단락 삭제",
    );
    if (!isConfirmed) return;

    try {
      await deleteParagraph(paragraph.id);
      onDelete(paragraph.id);
    } catch (error) {
      console.error("Failed to delete paragraph:", error);
      await showAlert("단락 삭제에 실패했습니다.");
    }
  };

  // AI 재생성
  const handleRegenerate = async () => {
    const isConfirmed = await showConfirm(
      "AI 단락을 다시 생성하시겠습니까?",
      "AI 단락 재생성",
    );
    if (!isConfirmed) return;

    setIsRegenerating(true);
    try {
      const res = await regenerateAiParagraph(paragraph.id);
      onRegenerate(paragraph.id, res.content);
    } catch (error) {
      console.error("Failed to regenerate paragraph:", error);
      await showAlert("AI 재생성에 실패했습니다.");
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <article
      className={`group relative rounded-xl border border-border px-4 py-3
            ${paragraph.writtenBy === "user" ? "bg-userBg" : "bg-aiBg"}
            ${isRegenerating ? "regenerating" : ""}`}
    >
      <div className="mb-2 flex items-center justify-between">
        {/* 작성자 표시 */}
        <strong className="text-sm text-slate-500 italic">
          {paragraph.writtenBy === "user" ? "나" : "AI"}
        </strong>
        {/* 액션 버튼들 (호버 시 표시) */}
        <div className="flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
          {/* 수정 버튼 */}
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="text-xs text-slate-500 hover:text-primary"
            >
              수정
            </button>
          )}

          {/* AI 재생성 버튼 (AI 단락만) */}
          {paragraph.writtenBy === "ai" && !isEditing && (
            <button
              onClick={handleRegenerate}
              disabled={isRegenerating}
              className="text-xs text-slate-500 hover:text-secondary disabled:apacity-50"
            >
              {isRegenerating ? "재생성 중..." : "🔄 재생성"}
            </button>
          )}
          {/* 삭제 버튼 */}
          <button
            onClick={handleDelete}
            className="text-xs text-slate-500 hover:text-red-500"
          >
            삭제
          </button>
        </div>
      </div>

      {/* 내용 표시/수정 */}
      {paragraph.isLoading ? (
        <div className="flex items-center space-x-2 py-2">
          <div className="flex space-x-1">
            <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]"></span>
            <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]"></span>
            <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400"></span>
          </div>
          <span className="text-sm text-slate-500">
            AI가 이야기를 잇고 있습니다...
          </span>
        </div>
      ) : isEditing ? (
        <div className="space-y-2">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full rounded-lg border border-border bg-white p-2 text-xs 
                                    focus:border-primary focus:outline-none"
            rows={4}
          />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="rounded-lg bg-primary px-3 py-1 text-xs text-white hover:bg-indigo-500"
            >
              저장
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setEditContent(paragraph.content);
              }}
              className="rounded-lg bg-slate-200 px-3 py-1 text-xs text-slate-700 
                                        hover:bg-slate-300"
            >
              취소
            </button>
          </div>
        </div>
      ) : (
        <p className="whitespace-pre-line text-slate-900">
          {displayedContent}
          {isTyping && (
            <span className="ml-1 inline-block h-4 w-2 animate-pulse bg-slate-400 align-middle"></span>
          )}
        </p>
      )}
    </article>
  );
}

export default ParagraphItem;
