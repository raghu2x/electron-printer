import { contextBridge, ipcRenderer } from 'electron';
import * as fs from 'node:fs';
import * as path from 'node:path';
import type { IpcMsgReplyResult, PosPrintData } from '../main/models';

const electronAPI = {
  onBodyInit: (callback: (options: { width?: string; margin?: string }) => void): void => {
    ipcRenderer.on('body-init', (_event, arg) => {
      callback(arg);
    });
  },

  onRenderLine: (callback: (data: { line: PosPrintData; lineIndex: number }) => void): void => {
    ipcRenderer.on('render-line', (_event, arg) => {
      callback(arg);
    });
  },

  sendBodyInitReply: (result: IpcMsgReplyResult): void => {
    ipcRenderer.send('body-init-reply', result);
  },

  sendRenderLineReply: (result: IpcMsgReplyResult): void => {
    ipcRenderer.send('render-line-reply', result);
  },

  readFileAsBase64: (filePath: string): { success: boolean; data?: string; error?: string } => {
    try {
      // Validate and normalize the file path to prevent path traversal attacks
      const normalizedPath = path.resolve(filePath);
      const cwd = process.cwd();

      // Only allow paths within the current working directory
      if (!normalizedPath.startsWith(cwd + path.sep) && normalizedPath !== cwd) {
        return { success: false, error: 'Access denied: Path outside allowed directory' };
      }

      // Check that the file exists before reading
      if (!fs.existsSync(normalizedPath)) {
        return { success: false, error: 'File not found' };
      }

      const data = fs.readFileSync(normalizedPath);
      return { success: true, data: data.toString('base64') };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  },

  getFileExtension: (filePath: string): string => {
    return path.extname(filePath).slice(1);
  },
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);

declare global {
  interface Window {
    electronAPI: typeof electronAPI;
  }
}
