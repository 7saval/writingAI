import {
  app,
  BrowserWindow,
  dialog,
  globalShortcut,
  ipcMain,
  Notification,
  WebContents,
  shell,
} from "electron";
import * as fs from "fs";
import * as path from "path";
import { saveDocument } from "./database";

let mainWindow: BrowserWindow | null = null;

// 개발 중에는 Vite 서버를, 빌드 후에는 정적 index.html을 같은 진입점으로 다룹니다.
const rendererEntryUrl =
  process.env.ELECTRON_START_URL ||
  `file://${path.join(__dirname, "../frontend/dist/index.html")}`;

interface ExportParagraphPayload {
  id: number;
  content: string;
  writtenBy: "user" | "ai";
  orderIndex: number;
}

interface ExportDocumentPayload {
  projectId: number;
  projectTitle: string;
  exportedAt: string;
  includeAuthorLabel: boolean;
  paragraphs: ExportParagraphPayload[];
}

interface PdfExportPayload {
  document: ExportDocumentPayload;
}

// hidden export window마다 자기 문서 payload를 찾아갈 수 있도록 webContents.id를 키로 보관합니다.
const pdfExportPayloads = new Map<number, PdfExportPayload>();

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    // 아이콘 설정 추가 (개발 환경과 빌드 환경 모두 고려)
    icon: path.join(__dirname, "../build/icon.ico"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  void mainWindow.loadURL(rendererEntryUrl);

  if (process.env.ELECTRON_START_URL) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

function createPdfExportWindow() {
  // PDF export는 현재 편집 화면이 아니라 인쇄 전용 route만 렌더링해야 해서 숨김 창을 따로 씁니다.
  return new BrowserWindow({
    show: false,
    width: 1280,
    height: 1810,
    backgroundColor: "#ffffff",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });
}

function escapeHtml(value: string) {
  // header/footer 템플릿은 HTML 문자열을 직접 넘기므로 기본 이스케이프를 해 둡니다.
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function buildPdfHeaderTemplate(document: ExportDocumentPayload) {
  // Chromium print header는 스타일 제약이 커서, 프로젝트 제목만 간단히 유지합니다.
  return `
    <div style="width: 100%; padding: 0 18px; font-family: 'Noto Sans KR', sans-serif; font-size: 8px; color: #475569; display: flex; align-items: center; justify-content: space-between;">
      <span>${escapeHtml(document.projectTitle)}</span>
      <span></span>
    </div>
  `;
}

function buildPdfFooterTemplate(document: ExportDocumentPayload) {
  // 1차 범위인 export 날짜와 페이지 번호를 footer 템플릿에서 같이 제공합니다.
  return `
    <div style="width: 100%; padding: 0 18px; font-family: 'Noto Sans KR', sans-serif; font-size: 8px; color: #64748b; display: flex; align-items: center; justify-content: space-between;">
      <span>${escapeHtml(`Exported on ${document.exportedAt.slice(0, 10)}`)}</span>
      <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
    </div>
  `;
}

async function loadPdfExportRoute(exportWindow: BrowserWindow) {
  if (process.env.ELECTRON_START_URL) {
    // 개발 환경은 dev server에 직접 export route를 붙여서 로드합니다.
    await exportWindow.loadURL(`${rendererEntryUrl}#/export/pdf`);
    return;
  }

  // file:// 환경에서는 새 창에서 직접 route 진입이 불안정할 수 있어 먼저 앱을 띄운 뒤 주소만 교체합니다.
  await exportWindow.loadURL(`${rendererEntryUrl}#/export/pdf`);
}

function waitForPdfExportReady(webContents: WebContents, timeoutMs = 15000) {
  return new Promise<void>((resolve, reject) => {
    // 렌더 완료 신호 없이 printToPDF를 호출하면 폰트/레이아웃이 덜 준비된 PDF가 나올 수 있습니다.
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error("Timed out waiting for PDF export page to be ready."));
    }, timeoutMs);

    const handleReady = (event: Electron.IpcMainEvent) => {
      // 여러 창이 동시에 떠 있을 수 있으니, 현재 export window에서 온 ready만 받습니다.
      if (event.sender.id !== webContents.id) {
        return;
      }

      cleanup();
      resolve();
    };

    const cleanup = () => {
      clearTimeout(timer);
      ipcMain.removeListener("pdf-export-ready", handleReady);
    };

    ipcMain.on("pdf-export-ready", handleReady);
  });
}

app.whenReady().then(() => {
  if (process.platform === "win32") {
    app.setAppUserModelId("com.writingai.app");
  }

  createWindow();

  const registered = globalShortcut.register("CommandOrControl+Shift+A", () => {
    if (mainWindow) {
      mainWindow.webContents.send("shortcut-pressed", "trigger-ai");
    }
  });

  if (!registered) {
    console.log("Global shortcut registration failed.");
  }

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("will-quit", () => {
  globalShortcut.unregisterAll();
});

ipcMain.handle("export-file", async (_event, format, content) => {
  if (!mainWindow) {
    return { success: false };
  }

  const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
    title: "문서 내보내기",
    defaultPath: `my_writing.${format}`,
    filters: [
      { name: format.toUpperCase(), extensions: [format] },
      { name: "All Files", extensions: ["*"] },
    ],
  });

  if (canceled || !filePath) {
    return { success: false, canceled: true };
  }

  try {
    if (format === "txt") {
      fs.writeFileSync(filePath, content, "utf-8");
    } else if (format === "pdf") {
      const pdfData = await mainWindow.webContents.printToPDF({});
      fs.writeFileSync(filePath, pdfData);
    } else {
      fs.writeFileSync(filePath, content, "utf-8");
    }

    return { success: true, path: filePath };
  } catch (error) {
    console.error("Failed to export file:", error);
    return { success: false, error: String(error) };
  }
});

ipcMain.handle(
  "save-word-document",
  async (_event, filename: string, data: ArrayBuffer) => {
    if (!mainWindow) {
      return { success: false };
    }

    const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
      title: "문서 내보내기",
      defaultPath: filename,
      filters: [
        { name: "Word", extensions: ["docx"] },
        { name: "All Files", extensions: ["*"] },
      ],
    });

    if (canceled || !filePath) {
      return { success: false, canceled: true };
    }

    try {
      const buffer = Buffer.from(new Uint8Array(data));
      await fs.promises.writeFile(filePath, buffer);

      return { success: true, path: filePath };
    } catch (error) {
      console.error("Failed to save Word document:", error);
      return { success: false, error: String(error) };
    }
  },
);

ipcMain.handle(
  "save-pdf-document",
  async (_event, filename: string, document: ExportDocumentPayload) => {
    if (!mainWindow) {
      return { success: false };
    }

    const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
      title: "PDF 내보내기",
      defaultPath: filename,
      filters: [
        { name: "PDF", extensions: ["pdf"] },
        { name: "All Files", extensions: ["*"] },
      ],
    });

    if (canceled || !filePath) {
      return { success: false, canceled: true };
    }

    const exportWindow = createPdfExportWindow();

    try {
      // export route는 preload 브리지를 통해 payload를 읽으므로, 창이 뜨기 전에 먼저 저장해 둡니다.
      pdfExportPayloads.set(exportWindow.webContents.id, { document });

      // ready listener를 먼저 걸어 두어, route가 아주 빨리 준비돼도 신호를 놓치지 않게 합니다.
      const readyPromise = waitForPdfExportReady(exportWindow.webContents);

      await loadPdfExportRoute(exportWindow);
      await readyPromise;

      // 본문은 print CSS를 따르고, header/footer는 Chromium 인쇄 템플릿으로 채웁니다.
      const pdfBuffer = await exportWindow.webContents.printToPDF({
        printBackground: true,
        landscape: false,
        pageSize: "A4",
        preferCSSPageSize: true,
        displayHeaderFooter: true,
        headerTemplate: buildPdfHeaderTemplate(document),
        footerTemplate: buildPdfFooterTemplate(document),
        margins: {
          top: 0.6,
          bottom: 0.6,
          left: 0.35,
          right: 0.35,
        },
      });

      await fs.promises.writeFile(filePath, pdfBuffer);

      return { success: true, path: filePath };
    } catch (error) {
      console.error("Failed to save PDF document:", error);
      return { success: false, error: String(error) };
    } finally {
      // 다음 export 요청에 이전 문서가 섞이지 않도록 payload와 창을 항상 정리합니다.
      pdfExportPayloads.delete(exportWindow.webContents.id);

      if (!exportWindow.isDestroyed()) {
        exportWindow.close();
      }
    }
  },
);

ipcMain.handle("get-pdf-export-payload", (event) => {
  // hidden export route가 자기 창 id로 문서 payload를 조회합니다.
  return pdfExportPayloads.get(event.sender.id) ?? { document: null };
});

ipcMain.on("show-notification", (_event, title, body) => {
  if (Notification.isSupported()) {
    const notification = new Notification({ title, body });

    notification.on("click", () => {
      if (mainWindow) {
        if (mainWindow.isMinimized()) {
          mainWindow.restore();
        }

        mainWindow.focus();
      }
    });

    notification.show();
  }
});

ipcMain.handle("save-doc", (_event, docId, content) => {
  try {
    saveDocument(docId, content);
    return { success: true };
  } catch (error) {
    console.error("Failed to save document to database:", error);
    return { success: false };
  }
});

ipcMain.handle("open-external-url", async (_event, url: string) => {
  await shell.openExternal(url);
});
