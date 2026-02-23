export interface ElectronAPI {
  onBodyInit: (callback: (options: { width?: string; margin?: string }) => void) => void;
  onRenderLine: (callback: (data: { line: any; lineIndex: number }) => void) => void;
  sendBodyInitReply: (result: { status: boolean; error: string | null }) => void;
  sendRenderLineReply: (result: { status: boolean; error: string | null }) => void;
  readFileAsBase64: (filePath: string) => { success: boolean; data?: string; error?: string };
  getFileExtension: (filePath: string) => string;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
