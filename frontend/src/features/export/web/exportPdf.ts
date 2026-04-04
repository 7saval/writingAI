import type { ExportDocumentModel, ExportParagraph } from "@/features/export/types";
import {
  buildExportFilename,
  formatAuthorLabel,
  formatExportSubtitle,
} from "@/features/export/utils/exportFormatters";

function createTextElement<K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  text: string,
  className?: string,
) {
  const element = document.createElement(tagName);
  element.textContent = text;

  if (className) {
    element.className = className;
  }

  return element;
}

function createParagraphElement(
  paragraph: ExportParagraph,
  includeAuthorLabel: boolean,
) {
  const article = document.createElement("article");
  article.className = "export-pdf-paragraph";

  if (includeAuthorLabel) {
    article.append(
      createTextElement(
        "p",
        formatAuthorLabel(paragraph.writtenBy),
        "export-pdf-author",
      ),
    );
  }

  article.append(
    createTextElement("p", paragraph.content, "export-pdf-content"),
  );

  return article;
}

function buildPdfContainer(documentModel: ExportDocumentModel) {
  const container = document.createElement("div");
  container.setAttribute("aria-hidden", "true");
  container.className = "export-pdf-root";

  const style = document.createElement("style");
  style.textContent = `
    .export-pdf-root {
      width: 794px;
      background: #ffffff;
      color: #111827;
      font-family: "Malgun Gothic", "Apple SD Gothic Neo", "Noto Sans KR", sans-serif;
      box-sizing: border-box;
      padding: 56px 52px 64px;
    }

    .export-pdf-title {
      margin: 0;
      font-size: 28px;
      font-weight: 700;
      line-height: 1.35;
      text-align: center;
    }

    .export-pdf-date {
      margin: 12px 0 36px;
      font-size: 13px;
      line-height: 1.5;
      color: #6b7280;
      text-align: center;
    }

    .export-pdf-paragraph {
      margin: 0 0 24px;
    }

    .export-pdf-author {
      margin: 0 0 8px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.08em;
      color: #475569;
    }

    .export-pdf-content {
      margin: 0;
      font-size: 14px;
      line-height: 1.8;
      white-space: pre-wrap;
      word-break: break-word;
      overflow-wrap: anywhere;
    }
  `;

  const title = createTextElement(
    "h1",
    documentModel.projectTitle,
    "export-pdf-title",
  );
  const date = createTextElement(
    "p",
    formatExportSubtitle(documentModel.exportedAt),
    "export-pdf-date",
  );

  container.append(style, title, date);

  documentModel.paragraphs.forEach((paragraph) => {
    container.append(
      createParagraphElement(paragraph, documentModel.includeAuthorLabel),
    );
  });

  return container;
}

function createHiddenMountNode() {
  const mountNode = document.createElement("div");

  mountNode.setAttribute("aria-hidden", "true");
  mountNode.style.position = "fixed";
  mountNode.style.left = "-10000px";
  mountNode.style.top = "0";
  mountNode.style.width = "0";
  mountNode.style.height = "0";
  mountNode.style.overflow = "hidden";
  mountNode.style.pointerEvents = "none";
  mountNode.style.zIndex = "-1";

  return mountNode;
}

async function waitForPdfRender() {
  if ("fonts" in document) {
    await document.fonts.ready;
  }

  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    });
  });
}

export async function exportPdfDocument(documentModel: ExportDocumentModel) {
  const { default: html2pdf } = await import("html2pdf.js");
  const container = buildPdfContainer(documentModel);
  const mountNode = createHiddenMountNode();
  const filename = buildExportFilename(documentModel, "pdf");

  mountNode.append(container);
  document.body.append(mountNode);

  try {
    await waitForPdfRender();

    await html2pdf()
      .set({
        margin: [12, 12, 12, 12],
        filename,
        image: {
          type: "jpeg",
          quality: 0.98,
        },
        html2canvas: {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
        },
        jsPDF: {
          unit: "mm",
          format: "a4",
          orientation: "portrait",
        },
      })
      .from(container)
      .save();
  } finally {
    mountNode.remove();
  }
}
