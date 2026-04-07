import { contextBridge, ipcRenderer, IpcRendererEvent } from "electron";

// 브라우저의 window 객체에 'window.electron'으로 사용할 기능을 노출합니다.
contextBridge.exposeInMainWorld("electron", {
  // 1. 파일 내보내기 요청
  exportFile: (format: string, content: string) =>
    ipcRenderer.invoke("export-file", format, content),
  saveWordDocument: (filename: string, data: ArrayBuffer) =>
    ipcRenderer.invoke("save-word-document", filename, data),
  // 2. 문서 자동 저장 (DB)
  saveToDb: (docId: string, content: string) =>
    ipcRenderer.invoke("save-doc", docId, content),
  // 3. 네이티브 알림 표시
  showNotification: (title: string, body: string) =>
    ipcRenderer.send("show-notification", title, body),
  // 4. 단축키 눌림 감지 이벤트 구독
  onShortcutPressed: (callback: (action: string) => void) => {
    const handler = (_event: IpcRendererEvent, action: string) =>
      callback(action);
    ipcRenderer.on("shortcut-pressed", handler);
    return () => {
      ipcRenderer.removeListener("shortcut-pressed", handler);
    };
  },
});
