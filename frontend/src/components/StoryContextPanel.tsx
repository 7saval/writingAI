import { useEffect, useState } from "react"
import type { LoreNote } from "../types/database";
import { fetchProjectContexts, updateContext } from "../api/projects.api";

export function StoryContextPanel({ projectId }: { projectId: number }) {
    const [synopsis, setSynopsis] = useState('');
    const [lorebook, setLorebook] = useState<LoreNote[]>([]);
    const [timer, setTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        fetchProjectContexts(projectId).then((contexts) => {
            setSynopsis(contexts.synopsis || '');
            setLorebook(contexts.lorebook || []);
        });
    }, [projectId]);

    // 자동 저장 (디바운싱 적용: 입력 멈춘 후 2초 뒤 저장)
    const debouncedSave = (payload: any) => {
        if (timer) clearTimeout(timer);
        const nextTimer = setTimeout(() => {
            updateContext(projectId, payload).then(() => {
                setTimer(null);
            });
        }, 2000);
        setTimer(nextTimer);
    };

    return (
        <aside className="flex h-full flex-col border-l border-border bg-white p-6">
            <header className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">시놉시스 & 설정집</h2>
                <span className="text-xs text-slate-500">자동 저장 (2초)</span>
            </header>
            {/* 스크롤 가능한 영역 (헤더 제외) */}
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {/* 시놉시스 입력 */}
                <section className="space-y-2">
                    <label className="text-sm font-medium text-slate-600">시놉시스</label>
                    <textarea
                        className="min-h-[160px] w-full rounded-xl border border-border bg-slate-50 p-3 text-sm focus:border-primary focus:outline-none"
                        value={synopsis}
                        onChange={(e) => {
                            setSynopsis(e.target.value);
                            debouncedSave({ synopsis: e.target.value, lorebook: lorebook });
                        }}
                    />
                </section>
                {/* 설정집 리스트 */}
                <section className="mt-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-slate-600">설정집</label>
                        <button
                            className="text-sm font-medium text-primary hover:text-indigo-500"
                            onClick={() => {
                                const next = [
                                    ...lorebook,
                                    { id: crypto.randomUUID(), category: 'character', title: '새 노트', content: '', tags: [] },
                                ];
                                setLorebook(next);
                                debouncedSave({ synopsis, lorebook: next });
                            }}
                        >
                            + 노트 추가
                        </button>
                    </div>
                    {lorebook.map((note, idx) => (
                        <div key={note.id} className="space-y-2 rounded-2xl border border-border bg-slate-50 p-4">
                            <input
                                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none"
                                value={note.title}
                                onChange={(e) => {
                                    const next = [...lorebook];
                                    next[idx] = { ...note, title: e.target.value };
                                    setLorebook(next);
                                    debouncedSave({ synopsis, lorebook: next });
                                }}
                            />
                            <textarea
                                className="min-h-[100px] w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none"
                                value={note.content}
                                onChange={(e) => {
                                    const next = [...lorebook];
                                    next[idx] = { ...note, content: e.target.value };
                                    setLorebook(next);
                                    debouncedSave({ synopsis, lorebook: next });
                                }}
                            />
                            <label className="flex items-center gap-2 text-xs text-slate-600">
                                <input
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                                    checked={note.includeInPrompt ?? true}
                                    onChange={(e) => {
                                        const next = [...lorebook];
                                        next[idx] = { ...note, includeInPrompt: e.target.checked };
                                        setLorebook(next);
                                        debouncedSave({ synopsis, lorebook: next });
                                    }}
                                />
                                AI 컨텍스트 포함
                            </label>
                        </div>
                    ))}
                </section>
            </div>
        </aside>
    )
}