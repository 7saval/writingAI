export interface ElectronAPI {
  exportFile: (format: string, content: string) => Promise<{ success: boolean, path?: string, error?: string, canceled?: boolean }>;
  saveToDb: (docId: string, content: string) => Promise<{ success: boolean }>;
  showNotification: (title: string, body: string) => void;
  onShortcutPressed: (callback: (action: string) => void) => void;
}

declare global {
  interface Window {
    electron?: ElectronAPI;
  }
}
