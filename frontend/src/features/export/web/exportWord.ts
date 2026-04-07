import type { ExportDocumentModel } from "@/features/export/types";
import { buildWordArrayBuffer } from "@/features/export/word/buildWordBuffer";
import {
  buildExportFilename,
} from "@/features/export/utils/exportFormatters";

function triggerDownload(blob: Blob, filename: string) {
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = objectUrl;
  anchor.download = filename;
  anchor.click();

  URL.revokeObjectURL(objectUrl);
}

export async function exportWordDocument(documentModel: ExportDocumentModel) {
  const buffer = await buildWordArrayBuffer(documentModel);
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });
  const filename = buildExportFilename(documentModel, "docx");

  triggerDownload(blob, filename);
}
