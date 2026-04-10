import type { CSSProperties } from "react";
import regularFontUrl from "@/assets/fonts/NotoSansKR-Regular.ttf?url";
import boldFontUrl from "@/assets/fonts/NotoSansKR-Bold.ttf?url";
import {
  AUTHOR_BOTTOM_SPACING_MM,
  AUTHOR_FONT_SIZE,
  BODY_FONT_SIZE,
  BODY_LINE_HEIGHT,
  PAGE_MARGIN_BOTTOM_MM,
  PAGE_MARGIN_TOP_MM,
  PAGE_MARGIN_X_MM,
  PARAGRAPH_BOTTOM_SPACING_MM,
  SUBTITLE_BOTTOM_SPACING_MM,
  SUBTITLE_FONT_SIZE,
  TITLE_BOTTOM_SPACING_MM,
  TITLE_FONT_SIZE,
} from "@/features/export/constants/pdf";
import type { ExportDocumentModel } from "@/features/export/types";
import {
  formatAuthorLabel,
  formatExportSubtitle,
} from "@/features/export/utils/exportFormatters";

interface ExportPdfDocumentProps {
  documentModel: ExportDocumentModel;
}

const containerStyle: CSSProperties = {
  minHeight: "100vh",
  backgroundColor: "#e2e8f0",
  padding: "24px",
};

const pageStyle: CSSProperties = {
  // 화면에서는 실제 종이처럼 보이게 하고, 인쇄 시에는 @media print에서 군더더기를 걷어냅니다.
  width: "210mm",
  minHeight: "297mm",
  margin: "0 auto",
  backgroundColor: "#ffffff",
  color: "#111827",
  boxSizing: "border-box",
  padding: `${PAGE_MARGIN_TOP_MM}mm ${PAGE_MARGIN_X_MM}mm ${PAGE_MARGIN_BOTTOM_MM}mm`,
  boxShadow: "0 20px 45px rgba(15, 23, 42, 0.12)",
};

const titleStyle: CSSProperties = {
  fontSize: `${TITLE_FONT_SIZE}pt`,
  fontWeight: 700,
  lineHeight: 1.35,
  textAlign: "center",
  margin: 0,
  marginBottom: `${TITLE_BOTTOM_SPACING_MM}mm`,
};

const subtitleStyle: CSSProperties = {
  fontSize: `${SUBTITLE_FONT_SIZE}pt`,
  lineHeight: 1.5,
  color: "#64748b",
  textAlign: "center",
  margin: 0,
  marginBottom: `${SUBTITLE_BOTTOM_SPACING_MM}mm`,
};

const paragraphBlockStyle: CSSProperties = {
  marginBottom: `${PARAGRAPH_BOTTOM_SPACING_MM}mm`,
  // Electron printToPDF에서는 문단 블록 전체를 강제로 묶으면 페이지 하단 공백이 크게 생길 수 있어
  // 본문은 자연스럽게 다음 페이지로 이어지도록 둡니다.
  breakInside: "auto",
};

const authorStyle: CSSProperties = {
  fontSize: `${AUTHOR_FONT_SIZE}pt`,
  fontWeight: 700,
  lineHeight: 1.3,
  color: "#475569",
  margin: 0,
  marginBottom: `${AUTHOR_BOTTOM_SPACING_MM}mm`,
  textTransform: "uppercase",
  // 라벨이 페이지 하단에 혼자 남지 않도록, 다음 본문 시작과 붙어 있게 유도합니다.
  breakAfter: "avoid",
  pageBreakAfter: "avoid",
};

const bodyStyle: CSSProperties = {
  fontSize: `${BODY_FONT_SIZE}pt`,
  lineHeight: BODY_LINE_HEIGHT,
  color: "#111827",
  margin: 0,
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
  // 문단은 페이지를 넘길 수 있게 두되 첫 줄/마지막 줄이 너무 과하게 잘리지 않게 완화합니다.
  orphans: 3,
  widows: 3,
};

export function ExportPdfDocument({
  documentModel,
}: ExportPdfDocumentProps) {
  return (
    <>
      <style>
        {`
          /* printToPDF가 새 창 안에서도 같은 한글 폰트를 쓰도록 문서 내부에서 직접 선언합니다. */
          @font-face {
            font-family: "Noto Sans KR";
            src: url("${regularFontUrl}") format("truetype");
            font-weight: 400;
            font-style: normal;
          }

          @font-face {
            font-family: "Noto Sans KR";
            src: url("${boldFontUrl}") format("truetype");
            font-weight: 700;
            font-style: normal;
          }

          html, body, #root {
            margin: 0;
            padding: 0;
            min-height: 100%;
            background: #e2e8f0;
            font-family: "Noto Sans KR", sans-serif;
          }

          @page {
            /* 본문 페이지 크기와 여백은 Chromium 인쇄 엔진 기준으로 고정합니다. */
            size: A4;
            margin: 18mm 14mm 18mm;
          }

          @media print {
            /* 화면용 배경과 그림자를 제거해 실제 PDF에는 종이 본문만 남깁니다. */
            html, body, #root {
              background: #ffffff;
            }

            .export-pdf-shell {
              padding: 0 !important;
              background: #ffffff !important;
            }

            .export-pdf-page {
              width: auto !important;
              min-height: auto !important;
              box-shadow: none !important;
              margin: 0 !important;
            }

            .export-pdf-page section {
              break-inside: auto;
              page-break-inside: auto;
            }

            .export-pdf-page section > p:first-child {
              break-after: avoid;
              page-break-after: avoid;
            }

            .export-pdf-page section > p:last-child {
              orphans: 3;
              widows: 3;
            }
          }
        `}
      </style>

      <div className="export-pdf-shell" style={containerStyle}>
        <article className="export-pdf-page" style={pageStyle}>
          {/* 웹 jsPDF와 같은 정보 구조를 유지해 플랫폼이 달라도 결과 톤이 크게 달라지지 않게 합니다. */}
          <h1 style={titleStyle}>{documentModel.projectTitle}</h1>
          <p style={subtitleStyle}>
            {formatExportSubtitle(documentModel.exportedAt)}
          </p>

          {documentModel.paragraphs.map((paragraph) => (
            <section key={paragraph.id} style={paragraphBlockStyle}>
              {documentModel.includeAuthorLabel ? (
                <p style={authorStyle}>
                  {formatAuthorLabel(paragraph.writtenBy)}
                </p>
              ) : null}
              <p style={bodyStyle}>{paragraph.content}</p>
            </section>
          ))}
        </article>
      </div>
    </>
  );
}
