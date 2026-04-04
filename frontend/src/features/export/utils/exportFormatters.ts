import type { ExportDocumentModel, ExportParagraph } from "@/features/export/types";
import { sanitizeFilename } from "@/features/export/utils/sanitizeFilename";

export function formatAuthorLabel(writtenBy: ExportParagraph["writtenBy"]) {
  return writtenBy === "user" ? "USER" : "AI";
}

export function formatExportDate(isoString: string) {
  return isoString.slice(0, 10);
}

export function formatExportSubtitle(exportedAt: ExportDocumentModel["exportedAt"]) {
  return `Exported on ${formatExportDate(exportedAt)}`;
}

export function buildExportFilename(
  documentModel: ExportDocumentModel,
  extension: "docx" | "pdf",
) {
  const safeTitle = sanitizeFilename(documentModel.projectTitle);

  return `${safeTitle}-${formatExportDate(documentModel.exportedAt)}.${extension}`;
}
