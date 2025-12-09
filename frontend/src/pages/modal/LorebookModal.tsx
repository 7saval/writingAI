import { Modal } from "../../components/common/Modal";
import { CATEGORY_OPTIONS } from "../../constants/categoryOptions";
import { useStoryContext } from "../../hooks/useStoryContext";
import { useState } from "react";

interface LorebookModalProps {
    projectId: number;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function LorebookModal({ projectId, open, onOpenChange }: LorebookModalProps) {

    const { lorebook,
        isSubmitting,
        isLoading,
        tagInputs,
        saveContext,
        createNote,
        deleteNote,
        updateNote,
        updateTagInput,
        handleRemoveTag,
        handleTagKeyDown,
        getTagColor } = useStoryContext(projectId);

    return (
        <Modal
            open={open}
            onOpenChange={onOpenChange}
            title="설정집"
            description="설정집을 입력하세요"
            footer={
                <>
                    <button
                        onClick={() => onOpenChange(false)}
                        className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
                    >
                        취소
                    </button>
                    <button
                        onClick={saveContext}
                        disabled={isSubmitting || isLoading}
                        className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 disabled:opacity-50"
                    >
                        {isLoading ? '로딩 중...' : '저장'}
                    </button>
                </>
            }
        >
            <section className="mt-6 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
                {isLoading ? (
                    <div className="w-full h-[300px] flex items-center justify-center text-slate-500">
                        로딩 중...
                    </div>
                ) : (
                    <>
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-slate-600">설정집</label>
                            <button
                                className="text-sm font-medium text-primary hover:text-indigo-500"
                                onClick={createNote}
                            >
                                + 노트 추가
                            </button>
                        </div>
                        {lorebook.map((note, idx) => (
                            <div key={note.id} className="space-y-2 rounded-2xl border border-border bg-slate-50 p-4 relative">
                                <button
                                    onClick={() => deleteNote(idx)}
                                    className="absolute top-2 right-2 text-slate-400 hover:text-red-600 focus:outline-none"
                                    title="노트 삭제"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg"
                                        width="16" height="16" viewBox="0 0 24 24"
                                        fill="none" stroke="currentColor"
                                        strokeWidth="2" strokeLinecap="round"
                                        strokeLinejoin="round">
                                        <path d="M18 6 6 18" />
                                        <path d="m6 6 12 12" />
                                    </svg>
                                </button>
                                <select
                                    className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none"
                                    value={note.category}
                                    onChange={(e) => updateNote(idx, { category: e.target.value })}
                                >
                                    {CATEGORY_OPTIONS.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                                <input
                                    className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none"
                                    value={note.title}
                                    onChange={(e) => updateNote(idx, { title: e.target.value })}
                                    placeholder="노트 제목"
                                />
                                <textarea
                                    className="min-h-[100px] w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none"
                                    value={note.content}
                                    onChange={(e) => updateNote(idx, { content: e.target.value })}
                                    placeholder="노트 내용"
                                />
                                {/* 태그 섹션 */}
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-slate-600">태그</label>

                                    {/* 태그 목록 */}
                                    <div className="flex flex-wrap gap-2 min-h-[32px]">
                                        {(note.tags || []).map((tag, tagIdx) => (
                                            <span
                                                key={tagIdx}
                                                className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border ${getTagColor(tag)}`}
                                            >
                                                {tag}
                                                <button
                                                    onClick={() => handleRemoveTag(idx, tag)}
                                                    className="hover:opacity-70 focus:outline-none"
                                                    title="태그 삭제"
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        width="12"
                                                        height="12"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    >
                                                        <path d="M18 6 6 18" />
                                                        <path d="m6 6 12 12" />
                                                    </svg>
                                                </button>
                                            </span>
                                        ))}
                                    </div>

                                    {/* 태그 추가 입력 */}
                                    <input
                                        type="text"
                                        className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none"
                                        value={tagInputs[note.id] || ''}
                                        onChange={(e) => updateTagInput(note.id, e.target.value)}
                                        onKeyDown={(e) => handleTagKeyDown(e, idx, note.id)}
                                        placeholder="태그 입력 후 Enter"
                                    />
                                </div>

                                <label className="flex items-center gap-2 text-xs text-slate-600">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                                        checked={note.includeInPrompt ?? true}
                                        onChange={(e) => updateNote(idx, { includeInPrompt: e.target.checked })}
                                    />
                                    AI 컨텍스트 포함
                                </label>
                            </div>
                        ))}
                    </>
                )}
            </section>
        </Modal>
    )
}
