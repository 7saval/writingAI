export type ExportFormat = "word" | "pdf";

export interface ExportParagraph {
  id: number;
  content: string;
  writtenBy: "user" | "ai";
  orderIndex: number;
}

export interface ExportDocumentModel {
  projectId: number;
  projectTitle: string;
  exportedAt: string;
  includeAuthorLabel: boolean;
  paragraphs: ExportParagraph[];
}

export interface ExportDialogValue {
  format: ExportFormat;
  includeAuthorLabel: boolean;
}
