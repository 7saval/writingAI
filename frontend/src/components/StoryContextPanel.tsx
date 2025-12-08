import { useState } from "react"
import { SynopsisModal } from "../pages/modal/SynopsisModal";
import { LorebookModal } from "../pages/modal/LorebookModal";

export function StoryContextPanel({ projectId }: { projectId: number }) {
    const [isSynopModalOpen, setIsSynopModalOpen] = useState(false);
    const [isLoreModalOpen, setIsLoreModalOpen] = useState(false);

    return (
        <>
            <aside className="flex h-full flex-col border-l border-border bg-white p-6">
                <header className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-slate-900">이야기 컨텍스트</h2>
                </header>
                {/* 스크롤 가능한 영역 (헤더 제외) */}
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    {/* 시놉시스 */}
                    <section className="space-y-2">
                        <button
                            className="w-full text-left text-base p-2 font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                            onClick={() => setIsSynopModalOpen(true)}
                        >
                            시놉시스
                        </button>
                        {/* 설정집 */}
                        <button
                            className="w-full text-left text-base p-2 font-medium text-slate-600  hover:bg-slate-100 hover:text-slate-900"
                            onClick={() => setIsLoreModalOpen(true)}
                        >
                            설정집
                        </button>
                    </section>
                </div>
            </aside>
            {isSynopModalOpen && (
                <SynopsisModal
                    projectId={projectId}
                    open={isSynopModalOpen}
                    onOpenChange={setIsSynopModalOpen}
                />
            )}
            {isLoreModalOpen && (
                <LorebookModal
                    projectId={projectId}
                    open={isLoreModalOpen}
                    onOpenChange={setIsLoreModalOpen}
                />
            )}
        </>
    )
}