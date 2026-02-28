import { ipcMain, WebContents } from 'electron';
import { IpcMsgReplyResult, PaperSize, SizeOptions } from './models';

interface PaperSizeReturn {
  width: number;
  height: number;
}

/** Paper width in pixels for window sizing */
const PAPER_WIDTHS_PX: Record<PaperSize, number> = {
  '44mm': 166,
  '57mm': 215,
  '58mm': 219,
  '76mm': 287,
  '78mm': 295,
  '80mm': 302,
};

/** Paper width in microns for print API */
const PAPER_WIDTHS_MICRONS: Record<PaperSize, number> = {
  '44mm': 44000,
  '57mm': 57000,
  '58mm': 58000,
  '76mm': 76000,
  '78mm': 78000,
  '80mm': 80000,
};

/**
 * Sends messages to the render process and receives a status reply
 * @param channel - IPC channel name
 * @param webContents - the web contents to send message to
 * @param arg - data to send
 */
export function sendIpcMsg(channel: string, webContents: WebContents, arg: unknown): Promise<IpcMsgReplyResult> {
  return new Promise((resolve, reject) => {
    ipcMain.once(`${channel}-reply`, (_event, result: IpcMsgReplyResult) => {
      if (result.status) {
        resolve(result);
      } else {
        reject(result.error);
      }
    });
    webContents.send(channel, arg);
  });
}

/**
 * Parses paper size to pixel dimensions for window sizing
 * @param pageSize - paper size string or custom dimensions
 */
export function parsePaperSize(pageSize?: PaperSize | SizeOptions): PaperSizeReturn {
  const defaultHeight = 1200;
  const defaultWidth = 219;

  if (typeof pageSize === 'string') {
    return {
      width: PAPER_WIDTHS_PX[pageSize] ?? defaultWidth,
      height: defaultHeight,
    };
  }

  if (typeof pageSize === 'object') {
    return {
      width: pageSize.width,
      height: pageSize.height,
    };
  }

  return { width: defaultWidth, height: defaultHeight };
}

/**
 * Converts pixels to microns for Chromium print API
 * @param pixels - pixel value to convert
 */
export function convertPixelsToMicrons(pixels: number): number {
  return Math.ceil(pixels * 264.5833);
}

/**
 * Parses paper size to micron dimensions for print API
 * @param pageSize - paper size string or custom dimensions
 */
export function parsePaperSizeInMicrons(pageSize?: PaperSize | SizeOptions): PaperSizeReturn {
  const defaultHeight = 10000;
  const defaultWidth = 58000;

  if (typeof pageSize === 'string') {
    return {
      width: PAPER_WIDTHS_MICRONS[pageSize] ?? defaultWidth,
      height: defaultHeight,
    };
  }

  if (typeof pageSize === 'object') {
    return {
      width: convertPixelsToMicrons(pageSize.width),
      height: convertPixelsToMicrons(pageSize.height),
    };
  }

  return { width: defaultWidth, height: defaultHeight };
}
