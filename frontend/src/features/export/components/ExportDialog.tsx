import { useEffect, useState } from "react";
import type { ExportDialogValue, ExportFormat } from "@/features/export/types";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ExportDialogProps {
  open: boolean;
  isSubmitting?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (value: ExportDialogValue) => Promise<void> | void;
}

const INITIAL_VALUE: ExportDialogValue = {
  format: "word",
  includeAuthorLabel: false,
};

export function ExportDialog({
  open,
  isSubmitting = false,
  onOpenChange,
  onSubmit,
}: ExportDialogProps) {
  const [format, setFormat] = useState<ExportFormat>(INITIAL_VALUE.format);
  const [includeAuthorLabel, setIncludeAuthorLabel] = useState(
    INITIAL_VALUE.includeAuthorLabel,
  );

  useEffect(() => {
    if (!open) {
      setFormat(INITIAL_VALUE.format);
      setIncludeAuthorLabel(INITIAL_VALUE.includeAuthorLabel);
    }
  }, [open]);

  const handleSubmit = async () => {
    await onSubmit({
      format,
      includeAuthorLabel,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>문서 내보내기</DialogTitle>
          <DialogDescription>
            현재 프로젝트의 전체 문단을 선택한 형식으로 저장합니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <section className="space-y-3">
            <Label>파일 형식</Label>
            <div className="space-y-2">
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-slate-50 p-4">
                <input
                  checked={format === "word"}
                  className="mt-1"
                  disabled={isSubmitting}
                  name="export-format"
                  onChange={() => setFormat("word")}
                  type="radio"
                />
                <div>
                  <p className="font-medium text-slate-900">Word (.docx)</p>
                  <p className="text-sm text-slate-500">
                    프로젝트 제목과 전체 문단을 문서 파일로 저장합니다.
                  </p>
                </div>
              </label>

              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-slate-50 p-4">
                <input
                  checked={format === "pdf"}
                  className="mt-1"
                  disabled={isSubmitting}
                  name="export-format"
                  onChange={() => setFormat("pdf")}
                  type="radio"
                />
                <div>
                  <p className="font-medium text-slate-900">PDF</p>
                  <p className="text-sm text-slate-500">
                    읽기 전용 문서 형태로 저장합니다.
                  </p>
                </div>
              </label>
            </div>
          </section>

          <section className="space-y-3">
            <Label htmlFor="include-author-label">내보내기 옵션</Label>
            <label
              className="flex cursor-pointer items-center justify-between rounded-xl border border-border bg-white px-4 py-3"
              htmlFor="include-author-label"
            >
              <div>
                <p className="font-medium text-slate-900">작성자 라벨 포함</p>
                <p className="text-sm text-slate-500">
                  각 문단 앞에 AI 또는 USER 라벨을 함께 표시합니다.
                </p>
              </div>
              <input
                checked={includeAuthorLabel}
                className="h-4 w-4"
                disabled={isSubmitting}
                id="include-author-label"
                onChange={(event) =>
                  setIncludeAuthorLabel(event.target.checked)
                }
                type="checkbox"
              />
            </label>
          </section>
        </div>

        <DialogFooter>
          <button
            className="rounded-lg border border-border px-4 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting}
            onClick={() => onOpenChange(false)}
            type="button"
          >
            취소
          </button>
          <button
            className="rounded-lg bg-primary px-4 py-2 text-sm text-white transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting}
            onClick={handleSubmit}
            type="button"
          >
            {isSubmitting ? "내보내는 중..." : "내보내기"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
