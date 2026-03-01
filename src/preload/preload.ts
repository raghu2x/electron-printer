import { contextBridge, ipcRenderer } from 'electron';
import * as fs from 'node:fs';
import * as path from 'node:path';
import type { IpcMsgReplyResult, PrintData, PrintOptions } from '../main/models';

const electronAPI = {
  /**
   * Registers callback for body initialization event
   * @param callback - handler for width and margin options
   */
  onBodyInit: (callback: (options: Pick<PrintOptions, 'width' | 'margin'>) => void): void => {
    ipcRenderer.on('body-init', (_event, arg) => {
      callback(arg);
    });
  },

  /**
   * Registers callback for render line event
   * @param callback - handler for print item data and index
   */
  onRenderLine: (callback: (data: { printItem: PrintData; itemIndex: number }) => void): void => {
    ipcRenderer.on('render-line', (_event, arg) => {
      callback(arg);
    });
  },

  /**
   * Sends body initialization reply to main process
   * @param result - status and error info
   */
  sendBodyInitReply: (result: IpcMsgReplyResult): void => {
    ipcRenderer.send('body-init-reply', result);
  },

  /**
   * Sends render line reply to main process
   * @param result - status and error info
   */
  sendRenderLineReply: (result: IpcMsgReplyResult): void => {
    ipcRenderer.send('render-line-reply', result);
  },

  /**
   * Reads a file and returns its contents as base64
   * @param filePath - path to the file to read
   */
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

  /**
   * Gets the file extension from a file path
   * @param filePath - path to extract extension from
   */
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
