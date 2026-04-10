import { useEffect, useState } from "react";
import { ExportPdfDocument } from "@/features/export/components/ExportPdfDocument";
import type { ExportDocumentModel } from "@/features/export/types";

function ExportPdfPage() {
  const [documentModel, setDocumentModel] =
    useState<ExportDocumentModel | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadPayload() {
      if (!window.electron?.getPdfExportPayload) {
        setErrorMessage("PDF export payload API is unavailable.");
        return;
      }

      try {
        const payload = await window.electron.getPdfExportPayload();

        if (!active) {
          return;
        }

        if (!payload?.document) {
          setErrorMessage("PDF export payload is missing.");
          return;
        }

        // 여기서는 payload만 state에 올리고, 실제 렌더 완료 신호는 아래 별도 effect에서 보냅니다.
        setDocumentModel(payload.document);
      } catch (error) {
        console.error("Failed to prepare Electron PDF export page:", error);
        setErrorMessage("Failed to prepare PDF export page.");
      }
    }

    void loadPayload();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!documentModel || errorMessage) {
      return;
    }

    let active = true;

    async function notifyWhenRendered() {
      // 실제 문서 DOM이 올라온 뒤에만 printToPDF가 시작되도록 본문 노드 존재를 먼저 확인합니다.
      const renderedDocument = document.querySelector(".export-pdf-page");

      if (!renderedDocument) {
        return;
      }

      const renderedParagraphs = renderedDocument.querySelectorAll("section");

      if (renderedParagraphs.length !== documentModel.paragraphs.length) {
        return;
      }

      await document.fonts.ready;
      await new Promise<void>((resolve) =>
        window.requestAnimationFrame(() => resolve()),
      );
      await new Promise<void>((resolve) =>
        window.requestAnimationFrame(() => resolve()),
      );

      if (!active) {
        return;
      }

      // 메인 프로세스는 이 신호를 받은 뒤에만 printToPDF를 호출합니다.
      window.electron?.notifyPdfExportReady?.();
    }

    void notifyWhenRendered();

    return () => {
      active = false;
    };
  }, [documentModel, errorMessage]);

  if (errorMessage) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-6 text-sm text-slate-500">
        <p>{errorMessage}</p>
      </div>
    );
  }

  if (!documentModel) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-6 text-sm text-slate-500">
        <p>Preparing PDF export...</p>
      </div>
    );
  }

  return <ExportPdfDocument documentModel={documentModel} />;
}

export default ExportPdfPage;
