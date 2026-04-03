"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
// 브라우저의 window 객체에 'window.electron'으로 사용할 기능을 노출합니다.
electron_1.contextBridge.exposeInMainWorld("electron", {
    // 1. 파일 내보내기 요청
    exportFile: (format, content) => electron_1.ipcRenderer.invoke("export-file", format, content),
    // 2. 문서 자동 저장 (DB)
    saveToDb: (docId, content) => electron_1.ipcRenderer.invoke("save-doc", docId, content),
    // 3. 네이티브 알림 표시
    showNotification: (title, body) => electron_1.ipcRenderer.send("show-notification", title, body),
    // 4. 단축키 눌림 감지 이벤트 구독
    onShortcutPressed: (callback) => {
        const handler = (_event, action) => callback(action);
        electron_1.ipcRenderer.on("shortcut-pressed", handler);
        return () => {
            electron_1.ipcRenderer.removeListener("shortcut-pressed", handler);
        };
    },
});
