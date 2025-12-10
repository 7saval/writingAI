import { useState } from "react"
import { SynopsisModal } from "../pages/modal/SynopsisModal";
import { LorebookModal } from "../pages/modal/LorebookModal";
import { Button } from "./ui/button";

export function StoryContextPanel({ projectId }: { projectId: number }) {
    const [isSynopModalOpen, setIsSynopModalOpen] = useState(false);
    const [isLoreModalOpen, setIsLoreModalOpen] = useState(false);

    return (
        <>
            <aside className="flex h-full flex-col border-l border-border bg-white p-6">
                <header className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-slate-900">이야기 컨텍스트</h2>
                </header>
                {
                    projectId ? (
                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                            {/* 스크롤 가능한 영역 (헤더 제외) */}
                            {/* 시놉시스 */}
                            <section className="space-y-2">
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => setIsSynopModalOpen(true)}
                                >
                                    시놉시스
                                </Button>
                                {/* 설정집 */}
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => setIsLoreModalOpen(true)}
                                >
                                    설정집
                                </Button>
                            </section>
                        </div>
                    ) : (
                        <div></div>
                    )
                }

            </aside >
            {isSynopModalOpen && (
                <SynopsisModal
                    projectId={projectId}
                    open={isSynopModalOpen}
                    onOpenChange={setIsSynopModalOpen}
                />
            )
            }
            {
                isLoreModalOpen && (
                    <LorebookModal
                        projectId={projectId}
                        open={isLoreModalOpen}
                        onOpenChange={setIsLoreModalOpen}
                    />
                )
            }
        </>
    )
}