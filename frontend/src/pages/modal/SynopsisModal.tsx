import { Modal } from "@/components/common/Modal";
import { useSynopsis } from "@/hooks/useSynopsis";
import type { SynopsisState } from "@/types/database";

interface SynopsisModalProps {
  projectId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const STAGES: {
  key: keyof SynopsisState;
  label: string;
  placeholder: string;
}[] = [
  {
    key: "introduction",
    label: "발단 (Introduction)",
    placeholder: "이야기의 시작, 배경, 인물 소개...",
  },
  {
    key: "development",
    label: "전개 (Development)",
    placeholder: "사건의 본격적인 시작과 갈등의 심화...",
  },
  {
    key: "crisis",
    label: "위기 (Crisis)",
    placeholder: "갈등이 고조되어 위기가 닥치는 단계...",
  },
  {
    key: "climax",
    label: "절정 (Climax)",
    placeholder: "이야기의 가장 긴박한 순간과 갈등의 폭발...",
  },
  {
    key: "conclusion",
    label: "결말 (Conclusion)",
    placeholder: "사건의 해결 및 여운이 남는 마무리...",
  },
];

export function SynopsisModal({
  projectId,
  open,
  onOpenChange,
}: SynopsisModalProps) {
  const { synopsis, isSubmitting, isLoading, saveContext, updateSynopsisPart } =
    useSynopsis(projectId);

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="시놉시스 설정 (5단계)"
      description="소설의 구성을 5단계로 체계화하여 작성하세요."
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
            {isLoading ? "로딩 중..." : "저장"}
          </button>
        </>
      }
    >
      <div className="max-h-[70vh] space-y-6 overflow-y-auto pr-2 custom-scrollbar">
        {isLoading ? (
          <div className="flex h-[400px] items-center justify-center text-slate-500">
            로딩 중...
          </div>
        ) : (
          STAGES.map((stage) => (
            <div key={stage.key} className="space-y-2">
              <label
                htmlFor={stage.key}
                className="text-sm font-bold text-slate-800"
              >
                {stage.label}
              </label>
              <textarea
                id={stage.key}
                value={synopsis[stage.key] || ""}
                onChange={(e) => updateSynopsisPart(stage.key, e.target.value)}
                placeholder={stage.placeholder}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary min-h-[120px] bg-slate-50 transition-colors focus:bg-white"
                rows={5}
              />
            </div>
          ))
        )}
      </div>
    </Modal>
  );
}
