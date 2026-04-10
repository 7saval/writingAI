import type { ExportDocumentModel } from "@/features/export/types";

export interface ElectronAPI {
  exportFile: (
    format: string,
    content: string,
  ) => Promise<{
    success: boolean;
    path?: string;
    error?: string;
    canceled?: boolean;
  }>;
  saveWordDocument: (
    filename: string,
    data: ArrayBuffer,
  ) => Promise<{
    success: boolean;
    path?: string;
    error?: string;
    canceled?: boolean;
  }>;
  savePdfDocument: (
    filename: string,
    document: ExportDocumentModel,
  ) => Promise<{
    success: boolean;
    path?: string;
    error?: string;
    canceled?: boolean;
  }>;
  // hidden export route가 preload 브리지를 통해 자기 문서 payload를 가져올 때 사용합니다.
  getPdfExportPayload?: () => Promise<{
    document: ExportDocumentModel | null;
  }>;
  // 렌더 완료 후 printToPDF를 시작해도 된다는 신호를 메인 프로세스에 보냅니다.
  notifyPdfExportReady?: () => void;
  saveToDb: (docId: string, content: string) => Promise<{ success: boolean }>;
  showNotification: (title: string, body: string) => void;
  onShortcutPressed: (callback: (action: string) => void) => () => void;
}

declare global {
  interface Window {
    electron?: ElectronAPI;
  }
}
