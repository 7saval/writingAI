import { useState } from "react";
import type { Paragraph } from "../types/database";
import { deleteParagraph, regenerateAiParagraph, updateParagraph } from "../api/parapraphs.api";

interface ParagraphItemProps {
    paragraph: Paragraph;   // 단락
    onUpdate: (id: number, newContent: string) => void; // 수정 핸들러
    onDelete: (id: number) => void; // 삭제 핸들러
    onRegenerate: (id: number, newContent: string) => void; // 재생성 핸들러
}

function ParagraphItem({ paragraph, onUpdate, onDelete, onRegenerate }: ParagraphItemProps) {
    const [isEditing, setIsEditing] = useState(false);    // 수정 중 여부
    const [editContent, setEditContent] = useState(paragraph.content); // 수정 중인 내용
    const [isRegenerating, setIsRegenerating] = useState(false); // 재생성 중 여부

    // 수정 저장
    const handleSave = async () => {
        try {
            await updateParagraph(paragraph.id, { content: editContent });
            onUpdate(paragraph.id, editContent);
            setIsEditing(false);
        } catch (error) {
            console.error('Failed to update paragraph:', error);
            alert('단락 수정에 실패했습니다.');
        }
    }

    // 삭제
    const handleDelete = async () => {
        if (!confirm('이 단락을 정말로 삭제하시겠습니까?')) return;

        try {
            await deleteParagraph(paragraph.id);
            onDelete(paragraph.id);
        } catch (error) {
            console.error('Failed to delete paragraph:', error);
            alert('단락 삭제에 실패했습니다.');
        }
    }

    // AI 재생성
    const handleRegenerate = async () => {
        if (!confirm('AI 단락을 다시 생성하시겠습니까?')) return;

        setIsRegenerating(true);
        try {
            const res = await regenerateAiParagraph(paragraph.id);
            onRegenerate(paragraph.id, res.content);
        } catch (error) {
            console.error('Failed to regenerate paragraph:', error);
            alert('AI 재생성에 실패했습니다.');
        } finally {
            setIsRegenerating(false);
        }
    };

    return (
        <article
            className={`group relative rounded-xl border border-border px-4 py-3
            ${paragraph.writtenBy === 'user' ? 'bg-userBg' : 'bg-aiBg'}
            ${isRegenerating ? 'regenerating' : ''}`}
        >
            <div className="mb-2 flex items-center justify-between">
                {/* 작성자 표시 */}
                <strong className="text-sm text-slate-500 italic">
                    {paragraph.writtenBy === 'user' ? '나' : 'AI'}
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
                    {paragraph.writtenBy === 'ai' && !isEditing && (
                        <button
                            onClick={handleRegenerate}
                            disabled={isRegenerating}
                            className="text-xs text-slate-500 hover:text-secondary disabled:apacity-50"
                        >
                            {isRegenerating ? '재생성 중...' : '🔄 재생성'}
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
            {isEditing ? (
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
                <p className="whitespace-pre-line text-slate-900">{paragraph.content}</p>
            )}

        </article>
    )
}

export default ParagraphItem