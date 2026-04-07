import {
  AlignmentType,
  Document,
  Paragraph as DocxParagraph,
  TextRun,
} from "docx";
import type { ExportDocumentModel } from "@/features/export/types";
import {
  formatAuthorLabel,
  formatExportSubtitle,
} from "@/features/export/utils/exportFormatters";

export function buildWordDocument(documentModel: ExportDocumentModel) {
  return new Document({
    sections: [
      {
        properties: {},
        children: [
          new DocxParagraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 240 },
            children: [
              new TextRun({
                text: documentModel.projectTitle,
                bold: true,
                size: 32,
              }),
            ],
          }),
          new DocxParagraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 360 },
            children: [
              new TextRun({
                text: formatExportSubtitle(documentModel.exportedAt),
                italics: true,
                size: 20,
              }),
            ],
          }),
          ...documentModel.paragraphs.map((paragraph) => {
            const paragraphChildren = documentModel.includeAuthorLabel
              ? [
                  new TextRun({
                    text: formatAuthorLabel(paragraph.writtenBy),
                    bold: true,
                  }),
                  new TextRun({
                    text: paragraph.content,
                    break: 1,
                  }),
                ]
              : [new TextRun(paragraph.content)];

            return new DocxParagraph({
              spacing: { after: 240 },
              children: paragraphChildren,
            });
          }),
        ],
      },
    ],
  });
}
