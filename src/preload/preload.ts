import { contextBridge, ipcRenderer } from 'electron';
import * as fs from 'fs';
import * as path from 'path';

contextBridge.exposeInMainWorld('electronAPI', {
  onBodyInit: (callback: (options: { width?: string; margin?: string }) => void) => {
    ipcRenderer.on('body-init', (_event, arg) => {
      callback(arg);
    });
  },

  onRenderLine: (callback: (data: { line: any; lineIndex: number }) => void) => {
    ipcRenderer.on('render-line', (_event, arg) => {
      callback(arg);
    });
  },

  sendBodyInitReply: (result: { status: boolean; error: string | null }) => {
    ipcRenderer.send('body-init-reply', result);
  },

  sendRenderLineReply: (result: { status: boolean; error: string | null }) => {
    ipcRenderer.send('render-line-reply', result);
  },

  readFileAsBase64: (filePath: string): { success: boolean; data?: string; error?: string } => {
    try {
      const data = fs.readFileSync(filePath);
      return { success: true, data: data.toString('base64') };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  },

  getFileExtension: (filePath: string): string => {
    return path.extname(filePath).slice(1);
  },
});
