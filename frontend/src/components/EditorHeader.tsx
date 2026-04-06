import { Bookmark, Download } from "lucide-react";

interface EditorHeaderProps {
  title: string;
  onExport: () => void;
}

export function EditorHeaderBookmark({
  title,
}: Pick<EditorHeaderProps, "title">) {
  return (
    <button
      aria-label={`${title} 프로젝트 내보내기 메뉴`}
      className="inline-flex h-10 max-w-full items-center gap-2 rounded-b-xl border border-slate-200 border-t-0 bg-white/95 px-3 py-2 text-left text-slate-700 shadow-sm backdrop-blur-sm"
      type="button"
    >
      <Bookmark className="h-3.5 w-3.5 shrink-0 text-primary" />
      <span className="max-w-[220px] truncate text-xs font-semibold">
        {title}
      </span>
      <Download className="h-3.5 w-3.5 shrink-0 text-slate-400" />
    </button>
  );
}

function EditorHeader({ onExport }: Pick<EditorHeaderProps, "onExport">) {
  return (
    <div className="rounded-b-xl border border-slate-200 border-t-0 bg-white/95 p-2 shadow-lg backdrop-blur-md">
      <button
        className="inline-flex h-8 w-full items-center justify-center gap-2 whitespace-nowrap rounded-md border border-border bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
        onClick={onExport}
        type="button"
      >
        내보내기
      </button>
    </div>
  );
}

export default EditorHeader;
