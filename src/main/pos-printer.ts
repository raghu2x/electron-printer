import type { PosPrintData, PosPrintOptions, PrintResult } from './models';
import { BrowserWindow } from 'electron';
import { join } from 'path';
import { convertPixelsToMicrons, parsePaperSize, parsePaperSizeInMicrons, sendIpcMsg } from './utils';
import { openCashDrawer, getAvailablePrinters } from '@devraghu/cashdrawer';

if (process.type === 'renderer') {
  throw new Error('electron-pos-printer: this module must be used in the main process only');
}

const renderPrintDocument = async (window: BrowserWindow, data: PosPrintData[]): Promise<{ message: string }> => {
  for (const [lineIndex, line] of data.entries()) {
    // ========== VALIDATION =========
    /**
     * Throw an error if image is set without path or url.
     */
    if (line.type === 'image' && !line.path && !line.url) {
      window.close();
      throw new Error('An Image url/path is required for type image');
    }
    /**
     * line.style is no longer a string but an object, throw and error if a use still sets a string
     *
     */
    if (!!line.style && typeof line.style !== 'object') {
      window.close();
      throw new Error('`options.styles` at "' + line.style + '" should be an object. Example: {style: {fontSize: 12}}');
    }

    const result = (await sendIpcMsg('render-line', window.webContents, { line, lineIndex })) as {
      status: boolean;
      error?: string;
    };
    if (!result.status) {
      window.close();
      throw new Error(`Failed to render line ${lineIndex} (type: ${line.type}): ${result.error || 'Unknown error'}`);
    }
  }
  // when the render process is done rendering the page, resolve
  return { message: 'page-rendered' };
};

const print = (data: PosPrintData[], options: PosPrintOptions): Promise<PrintResult> => {
  return new Promise((resolve, reject) => {
    /**
     * Validation
     */
    // 1. Reject if printer name is not set in live mode
    if (!options.preview && !options.printerName && !options.silent) {
      reject(new Error("A printer name is required, if you don't want to specify a printer name, set silent to true"));
    }
    // 2. Reject if pageSize is object and pageSize.height or pageSize.width is not set
    if (typeof options.pageSize === 'object' && (!options.pageSize.height || !options.pageSize.width)) {
      reject(new Error('height and width properties are required for options.pageSize'));
    }
    // If the job has been printed or not
    let printedState = false;
    // The error returned if the printing fails
    let windowPrintError: Error | null = null;
    const timeOut = options.timeOutPerLine ? options.timeOutPerLine * data.length + 200 : 400 * data.length + 200;

    /**
     * If in live mode i.e. `options.preview` is false & if `options.silent` is false
     * Check after a timeOut if the print data has been rendered and printed,
     * If the data is rendered & printer, printerState will be set to true.
     *
     * This is done because we don't want the printing process to hang, so after a specific time, we check if the
     * printing was completed and resolve/reject the promise.
     *
     * The printing process can hang (i.e. the print promise never gets resolved) if the process is trying to
     * send a print job to a printer that is not connected.
     *
     */
    if (!options.preview && !options.silent) {
      setTimeout(() => {
        if (!printedState) {
          const errorMsg = windowPrintError || new Error('[TimedOutError] Make sure your printer is connected');
          reject(errorMsg);
          printedState = true;
        }
      }, timeOut);
    }
    /**
     * Create Browser window
     * This window is the preview window, and it loads the data to be printer (in html)
     * The width and height of this window can be customized by the user
     *
     */

    let mainWindow: BrowserWindow | null = new BrowserWindow({
      ...parsePaperSize(options.pageSize),
      show: !!options.preview,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: false,
        preload: join(__dirname, 'preload/preload.cjs'),
      },
    });

    // Clean up when the mainWindow is closed
    mainWindow.on('closed', () => {
      mainWindow = null;
    });

    mainWindow.loadFile(options.pathTemplate || join(__dirname, 'renderer/index.html'));

    mainWindow.webContents.on('did-finish-load', async () => {
      if (!mainWindow) {
        reject(new Error('Window was closed before loading completed'));
        return;
      }

      await sendIpcMsg('body-init', mainWindow.webContents, options);
      /**
       * Render print data as html in the mainWindow render process
       *
       */
      return renderPrintDocument(mainWindow, data)
        .then(async () => {
          if (!mainWindow) {
            reject(new Error('Window was closed during rendering'));
            return;
          }

          let { width, height } = parsePaperSizeInMicrons(options.pageSize);
          // Get the height of content window, if the pageSize is a string
          if (typeof options.pageSize === 'string') {
            const clientHeight = await mainWindow.webContents.executeJavaScript('document.body.clientHeight');
            height = convertPixelsToMicrons(clientHeight);
          }

          if (options.preview) {
            resolve({ complete: true, data, options });
            return;
          }

          mainWindow.webContents.print(
            {
              silent: !!options.silent,
              printBackground: !!options.printBackground,
              deviceName: options.printerName,
              copies: options?.copies || 1,
              /**
               * Fix of Issue #81
               * Custom width & height properties have to be converted to microns for webContents.print else they would fail...
               *
               * The minimum micron size Chromium accepts is that where:
               * Per printing/units.h:
               *  * kMicronsPerInch - Length of an inch in 0.001mm unit.
               *  * kPointsPerInch - Length of an inch in CSS's 1pt unit.
               *
               * Formula: (kPointsPerInch / kMicronsPerInch) * size >= 1
               *
               * Practically, this means microns need to be > 352 microns.
               * We therefore need to verify this or it will silently fail.
               *
               * 1px = 264.5833 microns
               */

              pageSize: { width, height },
              ...(options.header && { header: options.header }),
              ...(options.footer && { footer: options.footer }),
              ...(options.color && { color: options.color }),
              ...(options.printBackground && { printBackground: options.printBackground }),
              ...(options.margins && { margins: options.margins }),
              ...(options.landscape && { landscape: options.landscape }),
              ...(options.scaleFactor && { scaleFactor: options.scaleFactor }),
              ...(options.pagesPerSheet && { pagesPerSheet: options.pagesPerSheet }),
              ...(options.collate && { collate: options.collate }),
              ...(options.pageRanges && { pageRanges: options.pageRanges }),
              ...(options.duplexMode && { duplexMode: options.duplexMode }),
              ...(options.dpi && { dpi: options.dpi }),
            },
            (success, failureReason) => {
              if (failureReason) {
                windowPrintError = new Error(failureReason);
                reject(windowPrintError);
              }
              if (!printedState) {
                resolve({ complete: success, options });
                printedState = true;
              }
              mainWindow?.close();
            },
          );
        })
        .catch((err) => reject(err));
    });
  });
};

export const posPrinter = {
  print,
  openCashDrawer,
  getPrinters: getAvailablePrinters,
};
