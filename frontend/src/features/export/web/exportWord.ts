import {
  AlignmentType,
  Document,
  Packer,
  Paragraph as DocxParagraph,
  TextRun,
} from "docx";
import type { ExportDocumentModel } from "@/features/export/types";
import {
  buildExportFilename,
  formatAuthorLabel,
  formatExportSubtitle,
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
  const doc = new Document({
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
          ...documentModel.paragraphs.flatMap((paragraph) => {
            const paragraphChildren = documentModel.includeAuthorLabel
              ? [
                  new TextRun({
                    text: `${formatAuthorLabel(paragraph.writtenBy)}\n`,
                    bold: true,
                  }),
                  new TextRun(paragraph.content),
                ]
              : [new TextRun(paragraph.content)];

            return [
              new DocxParagraph({
                spacing: { after: 240 },
                children: paragraphChildren,
              }),
            ];
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const filename = buildExportFilename(documentModel, "docx");

  triggerDownload(blob, filename);
}
