"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld("electron", {
    // 메인 창은 저장 요청만 보내고, 실제 파일 저장과 인쇄는 메인 프로세스가 담당합니다.
    exportFile: (format, content) => electron_1.ipcRenderer.invoke("export-file", format, content),
    saveWordDocument: (filename, data) => electron_1.ipcRenderer.invoke("save-word-document", filename, data),
    // PDF는 공통 문서 모델을 통째로 넘겨 hidden window에서 인쇄 전용 route를 렌더링합니다.
    savePdfDocument: (filename, document) => electron_1.ipcRenderer.invoke("save-pdf-document", filename, document),
    // export 전용 route가 자기 payload를 preload 브리지로 읽어 오도록 별도 API를 둡니다.
    getPdfExportPayload: () => electron_1.ipcRenderer.invoke("get-pdf-export-payload"),
    // 폰트와 레이아웃이 모두 준비됐다는 신호를 메인 프로세스에 보내는 용도입니다.
    notifyPdfExportReady: () => electron_1.ipcRenderer.send("pdf-export-ready"),
    saveToDb: (docId, content) => electron_1.ipcRenderer.invoke("save-doc", docId, content),
    showNotification: (title, body) => electron_1.ipcRenderer.send("show-notification", title, body),
    onShortcutPressed: (callback) => {
        const handler = (_event, action) => callback(action);
        // 구독 해제 함수를 같이 반환해 컴포넌트 unmount 시 listener 누수를 막습니다.
        electron_1.ipcRenderer.on("shortcut-pressed", handler);
        return () => {
            electron_1.ipcRenderer.removeListener("shortcut-pressed", handler);
        };
    },
});
