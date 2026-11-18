// oxlint-disable no-console
import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'node:path';
import { printer, PrinterErrorCodes } from '../dist/index.js';

const isTest = process.env.NODE_ENV === 'test';

/** Used when the renderer sends no payload (e.g. a bare `test-print` message). */
const FALLBACK_DATA = [
  {
    type: 'text',
    value: 'ELECTRON PRINTER',
    style: { fontWeight: '700', textAlign: 'center', fontSize: '20px' },
  },
  { type: 'text', value: 'Test receipt', style: { textAlign: 'center', fontSize: '12px' } },
  { type: 'barCode', value: '023456789010', height: 40, width: 2, displayValue: true, fontsize: 12 },
  { type: 'qrCode', value: 'https://github.com/raghu2x/electron-printer', width: 80, position: 'center' },
];

const FALLBACK_OPTIONS = { preview: true, margin: 'auto', copies: 1, timeOutPerLine: 1000, pageSize: '80mm' };

/** Maps a numeric cash drawer error code back to its enum name. */
function errorCodeName(code) {
  return Object.keys(PrinterErrorCodes).find((key) => PrinterErrorCodes[key] === code);
}

function toErrorMessage(error) {
  return error instanceof Error ? error.message : String(error);
}

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 720,
    minHeight: 520,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(import.meta.dirname, 'preload.cjs'),
    },
  });

  win.loadFile(path.join(import.meta.dirname, 'index.html'));

  if (!isTest) {
    win.maximize();
  }
};

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  app.quit();
});

// ---------------------------------------------------------------------------
// Demo IPC
// ---------------------------------------------------------------------------

ipcMain.handle('demo-info', () => ({
  platform: process.platform,
  versions: {
    electron: process.versions.electron,
    node: process.versions.node,
    chrome: process.versions.chrome,
  },
  // Print images loaded by `path` must live inside the working directory.
  logoPath: path.join(import.meta.dirname, 'assets', 'logo.svg'),
}));

ipcMain.handle('get-printers', async () => {
  try {
    const printers = await printer.getPrinters();
    return { success: true, printers };
  } catch (error) {
    console.error('Error getting printers:', error);
    return { success: false, error: toErrorMessage(error) };
  }
});

ipcMain.handle('open-cash-drawer', async (_event, printerName, options) => {
  try {
    console.log('Opening cash drawer on printer:', printerName, options);
    // Resolves with `success: false` on failure rather than rejecting.
    const result = await printer.openCashDrawer(printerName, options);
    console.log('Cash drawer result:', result);
    return { ...result, errorName: errorCodeName(result.errorCode) };
  } catch (error) {
    console.error('Error opening cash drawer:', error);
    return { success: false, errorMessage: toErrorMessage(error) };
  }
});

ipcMain.on('test-print', async (event, payload) => {
  const data = Array.isArray(payload?.data) ? payload.data : FALLBACK_DATA;
  const options = { ...FALLBACK_OPTIONS, ...payload?.options };

  let result;
  try {
    const { complete } = await printer.print(data, options);
    result = { success: complete, preview: Boolean(options.preview), printerName: options.printerName };
  } catch (error) {
    console.error('Print error:', error);
    result = { success: false, error: toErrorMessage(error) };
  }

  if (!event.sender.isDestroyed()) {
    event.sender.send('test-print-result', result);
  }
});

// ---------------------------------------------------------------------------
// IPC handlers used by the Playwright tests
// ---------------------------------------------------------------------------

ipcMain.handle('test-printer-available', () => {
  try {
    const available = typeof printer === 'object' && typeof printer.print === 'function';

    return {
      success: true,
      available,
      debug: {
        printerType: typeof printer,
        printMethodType: typeof printer.print,
        hasStaticPrint: typeof printer.print === 'function',
      },
    };
  } catch (error) {
    console.error('Error checking printer availability:', error);
    return { success: false, error: toErrorMessage(error) };
  }
});

ipcMain.handle('test-printer-print', async (_event, data, options) => {
  try {
    const result = await printer.print(data, options);
    return { success: true, error: null, result };
  } catch (error) {
    console.error('Print error:', error);
    return {
      success: false,
      error: toErrorMessage(error),
      errorType: error?.constructor?.name,
      stack: error?.stack,
    };
  }
});
