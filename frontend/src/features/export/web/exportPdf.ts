import type { jsPDF as JsPdfDocument } from "jspdf";
import type { ExportDocumentModel } from "@/features/export/types";
import {
  buildExportFilename,
  formatAuthorLabel,
  formatExportSubtitle,
} from "@/features/export/utils/exportFormatters";
import { ensurePdfFonts, pdfFontFamily } from "@/features/export/web/pdfFonts";
import {
  PAGE_WIDTH_MM,
  PAGE_HEIGHT_MM,
  PAGE_MARGIN_X_MM,
  PAGE_MARGIN_TOP_MM,
  PAGE_MARGIN_BOTTOM_MM,
  CONTENT_WIDTH_MM,
  TITLE_FONT_SIZE,
  SUBTITLE_FONT_SIZE,
  AUTHOR_FONT_SIZE,
  BODY_FONT_SIZE,
  TITLE_LINE_HEIGHT,
  SUBTITLE_LINE_HEIGHT,
  AUTHOR_LINE_HEIGHT,
  BODY_LINE_HEIGHT,
  TITLE_BOTTOM_SPACING_MM,
  SUBTITLE_BOTTOM_SPACING_MM,
  AUTHOR_BOTTOM_SPACING_MM,
  PARAGRAPH_BOTTOM_SPACING_MM,
} from "@/features/export/constants/pdf";

// 브라우저에서 생성된 PDF Blob을 즉시 다운로드합니다.
function triggerDownload(blob: Blob, filename: string) {
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = objectUrl;
  anchor.download = filename;
  anchor.click();

  URL.revokeObjectURL(objectUrl);
}

// jsPDF 글꼴 크기(pt)를 페이지 배치 계산용 mm 단위로 변환합니다.
function pointsToMillimeters(points: number) {
  return points * 0.352778;
}

// 폰트 크기와 줄간격 배수를 바탕으로 실제 한 줄 높이를 계산합니다.
function getTextLineHeight(fontSize: number, lineHeight: number) {
  return pointsToMillimeters(fontSize) * lineHeight;
}

// jsPDF text()의 Y 좌표는 baseline 기준이므로, 줄 top 좌표를 baseline 좌표로 변환합니다.
function getTextBaselineOffset(fontSize: number) {
  return pointsToMillimeters(fontSize);
}

// 수동 개행을 유지하면서, 각 문단을 페이지 폭에 맞는 줄 목록으로 나눕니다.
function splitParagraphLines(
  doc: JsPdfDocument,
  text: string,
  maxWidth: number,
) {
  return text.split(/\r?\n/).flatMap((segment) => {
    if (segment.length === 0) {
      return [""];
    }

    return doc.splitTextToSize(segment, maxWidth);
  });
}

// 현재 페이지에 남은 공간이 부족하면 새 페이지로 넘기고, 새 시작 Y 좌표를 돌려줍니다.
function ensurePageSpace(
  doc: JsPdfDocument,
  yPosition: number,
  requiredHeight: number,
) {
  if (yPosition + requiredHeight <= PAGE_HEIGHT_MM - PAGE_MARGIN_BOTTOM_MM) {
    return yPosition;
  }

  doc.addPage();

  return PAGE_MARGIN_TOP_MM;
}

export async function exportPdfDocument(documentModel: ExportDocumentModel) {
  // PDF 기능을 실제 사용할 때만 jsPDF를 불러와 초기 번들 부담을 줄입니다.
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({
    unit: "mm",
    format: "a4",
    orientation: "portrait",
    compress: true,
  });
  const filename = buildExportFilename(documentModel, "pdf");

  // 한글이 깨지지 않도록 Noto Sans KR 폰트를 문서에 등록합니다.
  await ensurePdfFonts(pdf);

  // 문서 첫 영역에는 프로젝트 제목을 가운데 정렬로 배치합니다.
  pdf.setFont(pdfFontFamily, "bold");
  pdf.setFontSize(TITLE_FONT_SIZE);
  pdf.setTextColor(17, 24, 39);
  pdf.text(
    documentModel.projectTitle,
    PAGE_WIDTH_MM / 2,
    PAGE_MARGIN_TOP_MM + getTextBaselineOffset(TITLE_FONT_SIZE),
    {
      align: "center",
    },
  );

  let cursorY =
    PAGE_MARGIN_TOP_MM +
    getTextLineHeight(TITLE_FONT_SIZE, TITLE_LINE_HEIGHT) +
    TITLE_BOTTOM_SPACING_MM;

  // 제목 아래에는 export 날짜를 보조 정보로 배치합니다.
  pdf.setFont(pdfFontFamily, "normal");
  pdf.setFontSize(SUBTITLE_FONT_SIZE);
  pdf.setTextColor(100, 116, 139);
  pdf.text(
    formatExportSubtitle(documentModel.exportedAt),
    PAGE_WIDTH_MM / 2,
    cursorY + getTextBaselineOffset(SUBTITLE_FONT_SIZE),
    { align: "center" },
  );

  cursorY +=
    getTextLineHeight(SUBTITLE_FONT_SIZE, SUBTITLE_LINE_HEIGHT) +
    SUBTITLE_BOTTOM_SPACING_MM;

  const bodyLineHeight = getTextLineHeight(BODY_FONT_SIZE, BODY_LINE_HEIGHT);
  const authorLineHeight = getTextLineHeight(
    AUTHOR_FONT_SIZE,
    AUTHOR_LINE_HEIGHT,
  );

  // 각 문단을 순서대로 그리면서, 페이지 경계는 직접 계산해 넘깁니다.
  documentModel.paragraphs.forEach((paragraph) => {
    const bodyLines = splitParagraphLines(
      pdf,
      paragraph.content,
      CONTENT_WIDTH_MM,
    );
    const minimumBlockHeight =
      bodyLineHeight +
      (documentModel.includeAuthorLabel
        ? authorLineHeight + AUTHOR_BOTTOM_SPACING_MM
        : 0);

    cursorY = ensurePageSpace(pdf, cursorY, minimumBlockHeight);

    // 작성자 라벨 옵션이 켜진 경우 문단 머리말로 먼저 출력합니다.
    if (documentModel.includeAuthorLabel) {
      pdf.setFont(pdfFontFamily, "bold");
      pdf.setFontSize(AUTHOR_FONT_SIZE);
      pdf.setTextColor(71, 85, 105);
      pdf.text(
        formatAuthorLabel(paragraph.writtenBy),
        PAGE_MARGIN_X_MM,
        cursorY + getTextBaselineOffset(AUTHOR_FONT_SIZE),
      );
      cursorY += authorLineHeight + AUTHOR_BOTTOM_SPACING_MM;
    }

    pdf.setFont(pdfFontFamily, "normal");
    pdf.setFontSize(BODY_FONT_SIZE);
    pdf.setTextColor(17, 24, 39);

    // 본문은 줄 단위로 배치해서 긴 문단도 페이지를 자연스럽게 넘깁니다.
    bodyLines.forEach((line) => {
      cursorY = ensurePageSpace(pdf, cursorY, bodyLineHeight);
      pdf.text(
        line.length === 0 ? " " : line,
        PAGE_MARGIN_X_MM,
        cursorY + getTextBaselineOffset(BODY_FONT_SIZE),
      );
      cursorY += bodyLineHeight;
    });

    cursorY += PARAGRAPH_BOTTOM_SPACING_MM;
  });

  const blob = pdf.output("blob");

  // 최종 PDF를 파일명 규칙에 맞춰 저장합니다.
  triggerDownload(blob, filename);
}
