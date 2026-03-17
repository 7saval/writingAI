import {
  app,
  BrowserWindow,
  ipcMain,
  dialog,
  Notification,
  globalShortcut,
} from "electron";
import * as path from "path";
import * as fs from "fs";
import { saveDocument } from "./database";

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"), // 빌드된 preload.js 경로
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // 개발 모드에서는 Vite/웹팩 서버 URL을 로드하고, 프로덕션에서는 빌드된 index.html 로드
  const startUrl =
    process.env.ELECTRON_START_URL ||
    `file://${path.join(__dirname, "../dist/index.html")}`;
  mainWindow.loadURL(startUrl);

  if (process.env.ELECTRON_START_URL) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  if (process.platform === "win32") {
    app.setAppUserModelId("com.writingai.app");
  }
  createWindow();

  // 전역 단축키 등록 (예: 컨트롤 + 시프트 + A)
  const ret = globalShortcut.register("CommandOrControl+Shift+A", () => {
    console.log("AI 단축키 눌림!");
    if (mainWindow) {
      mainWindow.webContents.send("shortcut-pressed", "trigger-ai");
    }
  });

  if (!ret) {
    console.log("단축키 등록 실패 (다른 앱이 사용 중일 수 있음)");
  }

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// 앱 종료 시 단축키 해제 필수!
app.on("will-quit", () => {
  globalShortcut.unregisterAll();
});

// IPC 리스너 등록
ipcMain.handle("export-file", async (event, format, content) => {
  if (!mainWindow) return { success: false };

  const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
    title: "문서 내보내기",
    defaultPath: `my_writing.${format}`,
    filters: [
      { name: format.toUpperCase(), extensions: [format] },
      { name: "All Files", extensions: ["*"] },
    ],
  });

  if (canceled || !filePath) return { success: false, canceled: true };

  try {
    if (format === "txt") {
      fs.writeFileSync(filePath, content, "utf-8");
    } else if (format === "pdf") {
      const pdfData = await mainWindow.webContents.printToPDF({});
      fs.writeFileSync(filePath, pdfData);
    } else {
      // 임시 저장
      fs.writeFileSync(filePath, content, "utf-8");
    }

    return { success: true, path: filePath };
  } catch (error) {
    console.error("파일 저장 실패:", error);
    return { success: false, error: String(error) };
  }
});

ipcMain.on("show-notification", (event, title, body) => {
  if (Notification.isSupported()) {
    const notification = new Notification({ title, body });
    notification.on("click", () => {
      if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore();
        mainWindow.focus();
      }
    });
    notification.show();
  }
});

ipcMain.handle("save-doc", (event, docId, content) => {
  try {
    saveDocument(docId, content);
    console.log(`자동 저장 완료: ${docId}`);
    return { success: true };
  } catch (err) {
    console.error("자동 저장 실패:", err);
    return { success: false };
  }
});
