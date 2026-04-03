"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const database_1 = require("./database");
let mainWindow = null;
function createWindow() {
    mainWindow = new electron_1.BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"), // 빌드된 preload.js 경로
            nodeIntegration: false,
            contextIsolation: true,
        },
    });
    // 개발 모드에서는 Vite/웹팩 서버 URL을 로드하고, 프로덕션에서는 빌드된 index.html 로드
    const startUrl = process.env.ELECTRON_START_URL ||
        `file://${path.join(__dirname, "../dist/index.html")}`;
    mainWindow.loadURL(startUrl);
    if (process.env.ELECTRON_START_URL) {
        mainWindow.webContents.openDevTools();
    }
    mainWindow.on("closed", () => {
        mainWindow = null;
    });
}
electron_1.app.whenReady().then(() => {
    if (process.platform === "win32") {
        electron_1.app.setAppUserModelId("com.writingai.app");
    }
    createWindow();
    // 전역 단축키 등록 (예: 컨트롤 + 시프트 + A)
    const ret = electron_1.globalShortcut.register("CommandOrControl+Shift+A", () => {
        console.log("AI 단축키 눌림!");
        if (mainWindow) {
            mainWindow.webContents.send("shortcut-pressed", "trigger-ai");
        }
    });
    if (!ret) {
        console.log("단축키 등록 실패 (다른 앱이 사용 중일 수 있음)");
    }
    electron_1.app.on("activate", () => {
        if (electron_1.BrowserWindow.getAllWindows().length === 0)
            createWindow();
    });
});
electron_1.app.on("window-all-closed", () => {
    if (process.platform !== "darwin")
        electron_1.app.quit();
});
// 앱 종료 시 단축키 해제 필수!
electron_1.app.on("will-quit", () => {
    electron_1.globalShortcut.unregisterAll();
});
// IPC 리스너 등록
electron_1.ipcMain.handle("export-file", async (event, format, content) => {
    if (!mainWindow)
        return { success: false };
    const { canceled, filePath } = await electron_1.dialog.showSaveDialog(mainWindow, {
        title: "문서 내보내기",
        defaultPath: `my_writing.${format}`,
        filters: [
            { name: format.toUpperCase(), extensions: [format] },
            { name: "All Files", extensions: ["*"] },
        ],
    });
    if (canceled || !filePath)
        return { success: false, canceled: true };
    try {
        if (format === "txt") {
            fs.writeFileSync(filePath, content, "utf-8");
        }
        else if (format === "pdf") {
            const pdfData = await mainWindow.webContents.printToPDF({});
            fs.writeFileSync(filePath, pdfData);
        }
        else {
            // 임시 저장
            fs.writeFileSync(filePath, content, "utf-8");
        }
        return { success: true, path: filePath };
    }
    catch (error) {
        console.error("파일 저장 실패:", error);
        return { success: false, error: String(error) };
    }
});
electron_1.ipcMain.on("show-notification", (event, title, body) => {
    if (electron_1.Notification.isSupported()) {
        const notification = new electron_1.Notification({ title, body });
        notification.on("click", () => {
            if (mainWindow) {
                if (mainWindow.isMinimized())
                    mainWindow.restore();
                mainWindow.focus();
            }
        });
        notification.show();
    }
});
electron_1.ipcMain.handle("save-doc", (event, docId, content) => {
    try {
        (0, database_1.saveDocument)(docId, content);
        console.log(`자동 저장 완료: ${docId}`);
        return { success: true };
    }
    catch (err) {
        console.error("자동 저장 실패:", err);
        return { success: false };
    }
});
