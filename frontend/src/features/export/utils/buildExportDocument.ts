import type { Paragraph, Project } from "@/types/database";
import type { ExportDocumentModel } from "@/features/export/types";

interface BuildExportDocumentArgs {
  project: Pick<Project, "id" | "title">;
  paragraphs: Paragraph[];
  includeAuthorLabel: boolean;
}

export function buildExportDocument({
  project,
  paragraphs,
  includeAuthorLabel,
}: BuildExportDocumentArgs): ExportDocumentModel {
  const normalizedParagraphs = [...paragraphs]
    .filter((paragraph) => !paragraph.isLoading)
    .filter((paragraph) => paragraph.content.trim().length > 0)
    .sort((a, b) => a.orderIndex - b.orderIndex)
    .map((paragraph) => ({
      id: paragraph.id,
      content: paragraph.content.trim(),
      writtenBy: paragraph.writtenBy,
      orderIndex: paragraph.orderIndex,
    }));

  return {
    projectId: project.id,
    projectTitle: project.title.trim() || "Untitled Project",
    exportedAt: new Date().toISOString(),
    includeAuthorLabel,
    paragraphs: normalizedParagraphs,
  };
}
