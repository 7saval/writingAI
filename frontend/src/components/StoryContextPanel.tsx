import { useState } from "react";
import { SynopsisModal } from "@/pages/modal/SynopsisModal";
import { LorebookModal } from "@/pages/modal/LorebookModal";
import { Button } from "@/components/ui/button";
import { useWritingStore } from "@/store/useWritingStore";
import { STAGES } from "@/constants/storyStages";

export function StoryContextPanel({ projectId }: { projectId: number }) {
  const [isSynopModalOpen, setIsSynopModalOpen] = useState(false);
  const [isLoreModalOpen, setIsLoreModalOpen] = useState(false);
  const { aiDirective, setAiDirective, currentStage, setCurrentStage } =
    useWritingStore();

  return (
    <>
      <div className="flex h-full flex-col bg-white p-6 justify-between overflow-y-auto custom-scrollbar">
        <div className="flex flex-col">
          <header className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 font-outfit">
              Story Context
            </h2>
          </header>
          {projectId ? (
            <div className="space-y-8">
              {/* 현재 집필 단계 선택 */}
              <div>
                <label className="mb-3 block text-sm font-semibold text-slate-700">
                  현재 집필 단계
                </label>
                <div className="flex flex-wrap gap-2">
                  {STAGES.map((stage) => (
                    <button
                      key={stage}
                      onClick={() => setCurrentStage(stage)}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all
                        ${
                          currentStage === stage
                            ? "bg-primary text-white shadow-sm ring-2 ring-primary ring-offset-1"
                            : "bg-slate-50 text-slate-600 border border-slate-200 hover:border-primary hover:text-primary"
                        }`}
                    >
                      {stage}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-[11px] text-slate-400">
                  * 선택한 단계의 시놉시스를 AI가 집중적으로 참고합니다.
                </p>
              </div>

              {/* 설정 버튼 */}
              <section className="space-y-3">
                <label className="block text-sm font-semibold text-slate-700">
                  스토리 설정
                </label>
                <Button
                  variant="outline"
                  className="w-full justify-start text-slate-700 hover:bg-slate-50 border-slate-200"
                  onClick={() => setIsSynopModalOpen(true)}
                >
                  <span className="mr-2">📝</span> 시놉시스 (5단계)
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-slate-700 hover:bg-slate-50 border-slate-200"
                  onClick={() => setIsLoreModalOpen(true)}
                >
                  <span className="mr-2">📚</span> 설정집 (Lorebook)
                </Button>
              </section>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400">
              <p className="text-sm">
                프로젝트를 선택하시면
                <br />
                스토리 설정을 관리할 수 있습니다.
              </p>
            </div>
          )}
        </div>

        {/* AI 지시사항 입력 필드 (하단 고정) */}
        {projectId ? (
          <div className="mt-8 border-t border-border pt-6">
            <label className="mb-3 block text-sm font-semibold text-slate-700">
              AI 지시사항 (선택)
            </label>
            <textarea
              value={aiDirective}
              onChange={(e) => setAiDirective(e.target.value)}
              placeholder="예: 더 어두운 분위기로, 액션 씬 위주로 써줘"
              className="min-h-[120px] w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 focus:border-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary transition-all shadow-inner"
            />
            <p className="mt-2 text-[11px] text-slate-400">
              * 다음 단락 생성 시 이 지침이 반영됩니다.
            </p>
          </div>
        ) : null}
      </div>
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
