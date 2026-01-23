import { Modal } from "../../components/common/Modal"
import { useSynopsis } from "../../hooks/useSynopsis";

interface SynopsisModalProps {
    projectId: number;
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function SynopsisModal({ projectId, open, onOpenChange }: SynopsisModalProps) {

    const { synopsis,
        isSubmitting,
        isLoading,
        saveContext,
        updateSynopsis } = useSynopsis(projectId);

    return (
        <Modal
            open={open}
            onOpenChange={onOpenChange}
            title="시놉시스"
            description="시놉시스를 입력하세요"
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
            <div className="space-y-2">
                <label htmlFor="synopsis" className="text-sm font-medium text-slate-700">시놉시스</label>
                {isLoading ? (
                    <div className="w-full h-[400px] flex items-center justify-center text-slate-500">
                        로딩 중...
                    </div>
                ) : (
                    <textarea
                        id="synopsis"
                        value={synopsis || ""}
                        onChange={(e) => updateSynopsis(e.target.value)}
                        placeholder="시놉시스를 입력하세요"
                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 min-h-[80px]"
                        rows={20}
                    />
                )}
            </div>
        </Modal>
    )
}
