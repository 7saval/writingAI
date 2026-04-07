import { Packer } from "docx";
import type { ExportDocumentModel } from "@/features/export/types";
import { buildWordDocument } from "@/features/export/word/buildWordDocument";

export async function buildWordArrayBuffer(
  documentModel: ExportDocumentModel,
) {
  const doc = buildWordDocument(documentModel);

  return Packer.toArrayBuffer(doc);
}
