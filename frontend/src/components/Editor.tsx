import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import EditorHeader, { EditorHeaderBookmark } from "@/components/EditorHeader";
import ParagraphItem from "@/components/ParagraphItem";
import { ExportDialog } from "@/features/export/components/ExportDialog";
import type { ExportDialogValue } from "@/features/export/types";
import { buildExportDocument } from "@/features/export/utils/buildExportDocument";
import { buildExportFilename } from "@/features/export/utils/exportFormatters";
import { exportPdfDocument } from "@/features/export/web/exportPdf";
import { exportWordDocument } from "@/features/export/web/exportWord";
import { buildWordArrayBuffer } from "@/features/export/word/buildWordBuffer";
import { useProjectDetailQuery } from "@/hooks/useProjects";
import { useProjectParagraphsQuery } from "@/hooks/useParagraphs";
import { useToast } from "@/hooks/useToast";
import { useWriteParagraphMutation } from "@/hooks/useWriting";
import { showAlert } from "@/store/useDialogStore";
import { useWritingStore } from "@/store/useWritingStore";
import type { Paragraph } from "@/types/database";

function Editor() {
  const { projectId } = useParams();
  const [paragraphs, setParagraphs] = useState<Paragraph[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { toast } = useToast();
  const { aiDirective, resetAiDirective } = useWritingStore();

  const numericProjectId = Number(projectId);
  const { data: fetchedParagraphs } =
    useProjectParagraphsQuery(numericProjectId);
  const { data: projectDetail } = useProjectDetailQuery(numericProjectId);
  const { mutateAsync: writeParagraphAsync } = useWriteParagraphMutation();

  useEffect(() => {
    if (fetchedParagraphs) {
      setParagraphs(fetchedParagraphs);
    }
  }, [fetchedParagraphs]);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop =
        scrollContainerRef.current.scrollHeight;
    }
  }, [paragraphs]);

  const handleSubmit = async () => {
    if (!input.trim() || !projectId) {
      return;
    }

    const userInput = input;
    const currentDirective = aiDirective;

    setInput("");
    resetAiDirective();

    const tempUserId = -Date.now();
    const tempAiId = -(Date.now() + 1);

    const tempUserParagraph: Paragraph = {
      id: tempUserId,
      project_id: numericProjectId,
      content: userInput,
      writtenBy: "user",
      orderIndex: paragraphs.length,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const tempAiParagraph: Paragraph = {
      id: tempAiId,
      project_id: numericProjectId,
      content: "",
      writtenBy: "ai",
      orderIndex: paragraphs.length + 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      isLoading: true,
    };

    setParagraphs((prev) => [...prev, tempUserParagraph, tempAiParagraph]);
    setIsLoading(true);

    try {
      const response = await writeParagraphAsync({
        projectId: numericProjectId,
        content: userInput,
        prompt: currentDirective || undefined,
      });

      setParagraphs((prev) =>
        prev.map((paragraph) => {
          if (paragraph.id === tempUserId) {
            return response.userParagraph;
          }

          if (paragraph.id === tempAiId) {
            return { ...response.aiParagraph, isTyping: true };
          }

          return paragraph;
        }),
      );
    } catch (error) {
      console.error("Failed to write paragraph:", error);
      setParagraphs((prev) =>
        prev.filter((paragraph) => {
          return paragraph.id !== tempUserId && paragraph.id !== tempAiId;
        }),
      );
      setInput(userInput);
      await showAlert("문단 생성에 실패했습니다. 다시 시도해 주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = (id: number, newContent: string) => {
    setParagraphs((prev) =>
      prev.map((paragraph) =>
        paragraph.id === id ? { ...paragraph, content: newContent } : paragraph,
      ),
    );
  };

  const handleDelete = (id: number) => {
    setParagraphs((prev) => prev.filter((paragraph) => paragraph.id !== id));
  };

  const handleRegenerate = (id: number, newContent: string) => {
    setParagraphs((prev) =>
      prev.map((paragraph) =>
        paragraph.id === id ? { ...paragraph, content: newContent } : paragraph,
      ),
    );
  };

  const handleExport = async ({
    format,
    includeAuthorLabel,
  }: ExportDialogValue) => {
    if (!projectId || !projectDetail) {
      await showAlert(
        "프로젝트 정보를 불러오지 못했습니다. 다시 시도해 주세요.",
      );
      return;
    }

    const exportDocument = buildExportDocument({
      project: {
        id: projectDetail.id,
        title: projectDetail.title,
      },
      paragraphs,
      includeAuthorLabel,
    });

    if (exportDocument.paragraphs.length === 0) {
      await showAlert("내보낼 문단이 없습니다.");
      return;
    }

    setIsExporting(true);

    try {
      if (format === "word") {
        if (window.electron) {
          const buffer = await buildWordArrayBuffer(exportDocument);
          const filename = buildExportFilename(exportDocument, "docx");
          const result = await window.electron.saveWordDocument(
            filename,
            buffer,
          );

          if (!result.success) {
            if (result.canceled) {
              return;
            }

            throw new Error(result.error ?? "Word document save failed");
          }
        } else {
          await exportWordDocument(exportDocument);
        }
      } else if (window.electron) {
        // Electron PDF는 브라우저 다운로드 대신 메인 프로세스의 hidden window print 흐름으로 보냅니다.
        const filename = buildExportFilename(exportDocument, "pdf");
        const result = await window.electron.savePdfDocument(
          filename,
          exportDocument,
        );

        if (!result.success) {
          if (result.canceled) {
            return;
          }

          throw new Error(result.error ?? "PDF document save failed");
        }
      } else {
        await exportPdfDocument(exportDocument);
      }

      // 같은 export 액션이라도 웹은 다운로드, Electron은 저장 다이얼로그 기반이라 안내 문구를 나눕니다.
      const isElectron = Boolean(window.electron);

      toast({
        title: format === "word" ? "Word 내보내기 완료" : "PDF 내보내기 완료",
        description: isElectron
          ? format === "word"
            ? "Word 문서가 저장되었습니다."
            : "PDF 문서가 저장되었습니다."
          : format === "word"
            ? "Word 문서 다운로드가 시작되었습니다."
            : "PDF 문서 다운로드가 시작되었습니다.",
      });
      setIsExportDialogOpen(false);
    } catch (error) {
      console.error("Failed to export document:", error);
      await showAlert("문서 내보내기에 실패했습니다. 다시 시도해 주세요.");
    } finally {
      setIsExporting(false);
    }
  };

  if (!projectId) {
    return (
      <div className="flex h-full w-full items-center justify-center text-slate-400">
        <p>왼쪽 사이드바에서 프로젝트를 선택해 주세요.</p>
      </div>
    );
  }

  const projectTitle = projectDetail?.title ?? "";

  return (
    <div className="relative flex h-full w-full flex-col">
      <div className="absolute inset-x-0 top-0 z-50 flex justify-end px-6">
        <div className="group relative w-fit max-w-[280px]">
          <EditorHeaderBookmark title={projectTitle} />
          <div className="pointer-events-none absolute right-0 top-full w-full opacity-0 transition-all duration-200 ease-out group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100">
            <div className="-translate-y-2 transition-transform duration-200 ease-out group-hover:translate-y-0 group-focus-within:translate-y-0">
              <EditorHeader onExport={() => setIsExportDialogOpen(true)} />
            </div>
          </div>
        </div>
      </div>

      <section className="flex flex-1 flex-col overflow-hidden bg-white">
        <div
          ref={scrollContainerRef}
          className="custom-scrollbar relative z-0 flex-1 space-y-4 overflow-y-auto p-6 pt-12"
        >
          {paragraphs.map((paragraph) => (
            <ParagraphItem
              key={paragraph.id}
              onDelete={handleDelete}
              onRegenerate={handleRegenerate}
              onUpdate={handleUpdate}
              paragraph={paragraph}
            />
          ))}
        </div>

        <div className="shrink-0 border-t border-border p-6">
          <textarea
            className="h-32 w-full rounded-xl border border-border bg-slate-50 p-4 text-base focus:border-primary focus:outline-none"
            onChange={(event) => setInput(event.target.value)}
            placeholder="이야기를 이어 써보세요"
            value={input}
          />
          <button
            className="btn-primary mt-4 w-full"
            disabled={isLoading}
            onClick={handleSubmit}
            type="button"
          >
            {isLoading ? "AI 작성 중.." : "문단 전송"}
          </button>
        </div>
      </section>

      <ExportDialog
        isSubmitting={isExporting}
        onOpenChange={setIsExportDialogOpen}
        onSubmit={handleExport}
        open={isExportDialogOpen}
      />
    </div>
  );
}

export default Editor;
