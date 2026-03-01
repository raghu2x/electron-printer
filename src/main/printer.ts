import type { PrintData, PrintOptions, PrintResult, SizeOptions } from './models';
import { BrowserWindow, type WebContentsPrintOptions } from 'electron';
import { join } from 'node:path';
import { createPrintTimeout, parsePaperSize, parsePaperSizeInMicrons, sendIpcMsg, validatePrintOptions } from './utils';
import { openCashDrawer, getAvailablePrinters } from '@devraghu/cashdrawer';

if (process.type === 'renderer') {
  throw new Error('electron-printer: this module must be used in the main process only');
}

/**
 * Builds print options for webContents.print()
 */
function buildPrintConfig(options: PrintOptions, pageSize: SizeOptions): WebContentsPrintOptions {
  return {
    silent: !!options.silent,
    printBackground: !!options.printBackground,
    deviceName: options.printerName,
    copies: options.copies ?? 1,
    pageSize,
    header: options.header,
    footer: options.footer,
    color: options.color,
    margins: options.margins,
    landscape: options.landscape,
    scaleFactor: options.scaleFactor,
    pagesPerSheet: options.pagesPerSheet,
    collate: options.collate,
    pageRanges: options.pageRanges,
    duplexMode: options.duplexMode,
    dpi: options.dpi,
  };
}

/**
 * Renders print data to the browser window
 */
async function renderPrintDocument(window: BrowserWindow, data: PrintData[]): Promise<void> {
  for (const [itemIndex, printItem] of data.entries()) {
    const result = await sendIpcMsg('render-line', window.webContents, { printItem, itemIndex });
    if (!result.status) {
      throw new Error(
        `Failed to render item ${itemIndex} (type: ${printItem.type}): ${result.error || 'Unknown error'}`,
      );
    }
  }
}

/**
 * Executes the print job
 */
function executePrint(window: BrowserWindow, printConfig: WebContentsPrintOptions): Promise<{ success: boolean }> {
  return new Promise((resolve, reject) => {
    window.webContents.print(printConfig, (success, failureReason) => {
      if (failureReason) {
        reject(new Error(failureReason));
      } else {
        resolve({ success });
      }
      window.close();
    });
  });
}

/**
 * Prints data to a printer or opens a preview window
 * @param data - array of print data to print
 * @param options - print configuration options
 */
async function print(data: PrintData[], options: PrintOptions): Promise<PrintResult> {
  validatePrintOptions(data, options);

  const window = new BrowserWindow({
    ...parsePaperSize(options.pageSize),
    show: !!options.preview,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      preload: join(import.meta.dirname, 'preload/preload.cjs'),
    },
  });

  const htmlPath = options.pathTemplate || join(import.meta.dirname, 'renderer/index.html');

  try {
    await window.loadFile(htmlPath);
    await sendIpcMsg('body-init', window.webContents, options);
    await renderPrintDocument(window, data);

    if (options.preview) {
      return { complete: true, data, options };
    }

    const pageSize = await parsePaperSizeInMicrons(window.webContents, options.pageSize);
    const printConfig = buildPrintConfig(options, pageSize);

    // Use timeout for non-silent printing to prevent hanging on disconnected printers
    const timeoutMs = (options.timeOutPerLine ?? 400) * data.length + 200;
    const printPromise = executePrint(window, printConfig);

    const { success } = options.silent
      ? await printPromise
      : await Promise.race([printPromise, createPrintTimeout(timeoutMs)]);

    return { complete: success, options };
  } catch (error) {
    window.close();
    throw error;
  }
}

export const printer = {
  print,
  openCashDrawer,
  getPrinters: getAvailablePrinters,
};
