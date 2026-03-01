import { ipcMain, WebContents } from 'electron';
import { IpcMsgReplyResult, PaperSize, PrintData, PrintOptions, SizeOptions } from './models';

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
export function parsePaperSize(pageSize?: PaperSize | SizeOptions): SizeOptions {
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
export async function parsePaperSizeInMicrons(
  webContents: WebContents,
  pageSize?: PaperSize | SizeOptions,
): Promise<SizeOptions> {
  const defaultHeight = 10000;
  const defaultWidth = 58000;

  if (typeof pageSize === 'string') {
    const clientHeight = await webContents.executeJavaScript('document.body.clientHeight');

    return {
      width: PAPER_WIDTHS_MICRONS[pageSize] ?? defaultWidth,
      height: convertPixelsToMicrons(clientHeight),
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

/**
 * Wraps a promise with an AbortSignal-based timeout.
 * Properly cleans up timeout when promise resolves/rejects or signal aborts.
 * @param promise - the promise to wrap
 * @param timeoutMs - timeout in milliseconds
 * @param signal - AbortSignal for cancellation
 */
export function withTimeout<T>(promise: Promise<T>, timeoutMs: number, signal: AbortSignal): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error('[TimedOutError] Make sure your printer is connected'));
    }, timeoutMs);

    const cleanup = (): void => clearTimeout(timeoutId);

    signal.addEventListener('abort', cleanup, { once: true });

    promise
      .then((result) => {
        cleanup();
        resolve(result);
      })
      .catch((error) => {
        cleanup();
        reject(error);
      });
  });
}

/**
 * Validates print options before printing
 * @throws Error if validation fails
 */
export function validatePrintOptions(data: PrintData[], options: PrintOptions): void {
  if (!options.preview && !options.printerName && !options.silent) {
    throw new Error("A printer name is required, if you don't want to specify a printer name, set silent to true");
  }

  if (typeof options.pageSize === 'object' && (!options.pageSize.height || !options.pageSize.width)) {
    throw new Error('height and width properties are required for options.pageSize');
  }

  for (const [index, item] of data.entries()) {
    if (item.type === 'image' && !item.path && !item.url) {
      throw new Error(`Print item ${index}: image requires a path or url`);
    }

    if (item.style && typeof item.style !== 'object') {
      throw new Error(`Print item ${index}: style must be an object. Example: {style: {fontSize: 12}}`);
    }
  }
}
