import { ipcMain } from 'electron';
import { PaperSize, SizeOptions } from './models';

interface PaperSizeReturn {
  width: number;
  height: number;
}

/**
 * @description Sends messages to the render process to render the data specified in the PostPrintDate interface and receives a status of true
 *
 */
export function sendIpcMsg(channel: string, webContents: Electron.WebContents, arg: any) {
  return new Promise((resolve, reject) => {
    ipcMain.once(`${channel}-reply`, (_event, result) => {
      if (result.status) {
        resolve(result);
      } else {
        reject(result.error);
      }
    });
    webContents.send(channel, arg);
  });
}

export function parsePaperSize(pageSize?: PaperSize | SizeOptions): PaperSizeReturn {
  let height = 1200;
  let width = 219;
  if (typeof pageSize === 'string') {
    switch (pageSize) {
      case '44mm':
        width = 166;
        break;
      case '57mm':
        width = 215;
        break;
      case '58mm':
        width = 219;
        break;
      case '76mm':
        width = 287;
        break;
      case '78mm':
        width = 295;
        break;
      case '80mm':
        width = 302;
        break;
    }
  } else if (typeof pageSize === 'object') {
    width = pageSize.width;
    height = pageSize.height;
  }

  return {
    width,
    height,
  };
}

export function parsePaperSizeInMicrons(pageSize?: PaperSize | SizeOptions): PaperSizeReturn {
  // in microns
  let height = 10000;
  let width = 58000;
  if (typeof pageSize === 'string') {
    switch (pageSize) {
      case '44mm':
        width = Math.ceil(44 * 1000);
        break;
      case '57mm':
        width = Math.ceil(57 * 1000);
        break;
      case '58mm':
        width = Math.ceil(58 * 1000);
        break;
      case '76mm':
        width = Math.ceil(76 * 1000);
        break;
      case '78mm':
        width = Math.ceil(78 * 1000);
        break;
      case '80mm':
        width = Math.ceil(80 * 1000);
        break;
    }
  } else if (typeof pageSize === 'object') {
    width = convertPixelsToMicrons(pageSize.width);
    height = convertPixelsToMicrons(pageSize.height);
  }

  return {
    width,
    height,
  };
}

export function convertPixelsToMicrons(pixels: number): number {
  return Math.ceil(pixels * 264.5833);
}
