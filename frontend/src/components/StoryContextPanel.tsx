import { useState } from "react";
import { SynopsisModal } from "@/pages/modal/SynopsisModal";
import { LorebookModal } from "@/pages/modal/LorebookModal";
import { Button } from "@/components/ui/button";
import { useWritingStore } from "@/store/useWritingStore";

export function StoryContextPanel({ projectId }: { projectId: number }) {
  const [isSynopModalOpen, setIsSynopModalOpen] = useState(false);
  const [isLoreModalOpen, setIsLoreModalOpen] = useState(false);
  const { aiDirective, setAiDirective } = useWritingStore();

  return (
    <>
      <aside className="flex h-full flex-col border-l border-border bg-white p-6 justify-between">
        <div className="flex flex-col overflow-hidden">
          <header className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">
              이야기 컨텍스트
            </h2>
          </header>
          {projectId ? (
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {/* 시놉시스 */}
              <section className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full text-slate-700 hover:bg-slate-50"
                  onClick={() => setIsSynopModalOpen(true)}
                >
                  시놉시스
                </Button>
                {/* 설정집 */}
                <Button
                  variant="outline"
                  className="w-full text-slate-700 hover:bg-slate-50"
                  onClick={() => setIsLoreModalOpen(true)}
                >
                  설정집
                </Button>
              </section>
            </div>
          ) : (
            <div></div>
          )}
        </div>

        {/* AI 지시사항 입력 필드 (하단 고정) */}
        {projectId && (
          <div className="mt-6 border-t border-border pt-6">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              AI 지시사항 (선택)
            </label>
            <textarea
              value={aiDirective}
              onChange={(e) => setAiDirective(e.target.value)}
              placeholder="예: 더 어두운 분위기로, 액션 씬 위주로 써줘"
              className="min-h-[120px] w-full resize-none rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3 text-sm text-slate-600 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <p className="mt-1 text-[11px] text-slate-400">
              * 다음 단락 생성 시 이 지침이 반영됩니다.
            </p>
          </div>
        )}
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
  );
}
