import type { VariantResult } from "@/types/database";

interface VariantSelectorProps {
  variants: VariantResult[];
  streamingIds?: Set<string>;  // 아직 스트리밍 중인 변형 ID
  isEvaluating?: boolean;       // 품질 평가 진행 중
  onSelect: (variantId: string) => void;
  isSelecting?: boolean;        // 선택 저장 중
}

export function VariantSelectorSkeleton() {
  return (
    <div className="space-y-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4">
      <div className="animate-pulse h-4 w-56 rounded bg-slate-200" />
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="animate-pulse rounded-xl border border-slate-200 bg-white p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-4 w-16 rounded-full bg-slate-200" />
              <div className="h-4 w-12 rounded bg-slate-200" />
            </div>
            <div className="space-y-2">
              <div className="h-3 w-full rounded bg-slate-200" />
              <div className="h-3 w-full rounded bg-slate-200" />
              <div className="h-3 w-3/4 rounded bg-slate-200" />
              <div className="h-3 w-full rounded bg-slate-200" />
              <div className="h-3 w-5/6 rounded bg-slate-200" />
            </div>
            <div className="h-8 w-full rounded-lg bg-slate-200" />
          </div>
        ))}
      </div>
    </div>
  );
}

const LABEL_STYLES: Record<string, string> = {
  정석형: "bg-blue-50 text-blue-600 border-blue-100",
  균형형: "bg-violet-50 text-violet-600 border-violet-100",
  창의형: "bg-amber-50 text-amber-600 border-amber-100",
};

interface VariantCardProps {
  variant: VariantResult;
  isStreaming: boolean;
  onSelect: (id: string) => void;
  disabled: boolean;
}

function VariantCard({ variant, isStreaming, onSelect, disabled }: VariantCardProps) {
  const labelStyle = LABEL_STYLES[variant.label] ?? "bg-slate-50 text-slate-600 border-slate-100";
  const canSelect = !disabled && !isStreaming;

  return (
    <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-4 space-y-3 hover:border-primary hover:shadow-sm transition-all duration-150">
      <div className="flex items-center justify-between">
        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${labelStyle}`}>
          {variant.label}
        </span>
        {variant.qualityScore !== undefined && (
          <span className="text-xs text-slate-400">품질 {variant.qualityScore}/10</span>
        )}
      </div>

      {variant.loreWarning && (
        <div className="rounded-lg bg-amber-50 border border-amber-100 px-3 py-2 text-xs text-amber-700">
          ⚠ 설정 주의: {variant.loreWarning}
        </div>
      )}

      <div className="flex-1 text-sm leading-relaxed text-slate-700 whitespace-pre-wrap min-h-[4rem]">
        {variant.content}
        {isStreaming && (
          <span className="inline-block w-0.5 h-4 ml-0.5 bg-slate-500 align-text-bottom animate-[blink_0.8s_step-end_infinite]" />
        )}
        {!isStreaming && !variant.content && (
          <span className="text-slate-300 italic text-xs">생성 대기 중...</span>
        )}
      </div>

      <button
        onClick={() => onSelect(variant.id)}
        disabled={!canSelect}
        className="w-full rounded-lg bg-primary py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {isStreaming ? "작성 중..." : "이 버전 선택"}
      </button>
    </div>
  );
}

export function VariantSelector({
  variants,
  streamingIds = new Set(),
  isEvaluating = false,
  onSelect,
  isSelecting = false,
}: VariantSelectorProps) {
  const allStreamed = streamingIds.size === 0;
  const canSelect = allStreamed && !isEvaluating && !isSelecting;

  return (
    <div className="space-y-3 rounded-xl border border-dashed border-primary/30 bg-primary/5 p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-600">
          AI가 {variants.length}가지 버전을 작성했습니다.
          {canSelect && " 마음에 드는 버전을 선택해 주세요."}
        </p>
        {isEvaluating && (
          <span className="text-xs text-slate-400 animate-pulse">품질 평가 중...</span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {variants.map((variant) => (
          <VariantCard
            key={variant.id}
            variant={variant}
            isStreaming={streamingIds.has(variant.id)}
            onSelect={onSelect}
            disabled={!canSelect}
          />
        ))}
      </div>
    </div>
  );
}
