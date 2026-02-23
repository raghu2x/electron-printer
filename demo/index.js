import { app, BrowserWindow, ipcMain, screen } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { posPrinter } from '../dist/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test IPC handlers for Playwright tests
ipcMain.handle('test-pos-printer-available', () => {
  try {
    console.log('Testing posPrinter availability...');
    console.log('posPrinter type:', typeof posPrinter);
    console.log('posPrinter.print type:', typeof posPrinter.print);

    const available = typeof posPrinter === 'object' && typeof posPrinter.print === 'function';

    return {
      success: true,
      available: available,
      debug: {
        posPrinterType: typeof posPrinter,
        printMethodType: typeof posPrinter.print,
        hasStaticPrint: typeof posPrinter.print === 'function',
      },
    };
  } catch (error) {
    console.error('Error checking posPrinter availability:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('test-pos-printer-print', async (event, data, options) => {
  try {
    console.log('Attempting to print with data:', data);
    console.log('Print options:', options);

    const result = await posPrinter.print(data, options);
    console.log('Print result:', result);

    return { success: true, error: null, result };
  } catch (error) {
    console.error('Print error:', error);
    return {
      success: false,
      error: error.message || error.toString(),
      errorType: error.constructor.name,
      stack: error.stack,
    };
  }
});

const createWindow = () => {
  const size = screen.getPrimaryDisplay().size;
  console.log(size);
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs'),
    },
  });

  win.loadFile('index.html');
  // open deve tools
  if (process.env.NODE_ENV !== 'test') {
    win.webContents.openDevTools();
  }
};

app.on('ready', () => {
  createWindow();
});

ipcMain.on('test-print', testPrint);

// Cash drawer IPC handlers
ipcMain.handle('get-printers', async () => {
  try {
    const printers = await posPrinter.getPrinters();
    return { success: true, printers };
  } catch (error) {
    console.error('Error getting printers:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('open-cash-drawer', async (event, printerName, options) => {
  try {
    console.log('Opening cash drawer on printer:', printerName);
    const result = await posPrinter.openCashDrawer(printerName, options);
    console.log('Cash drawer result:', result);
    return result;
  } catch (error) {
    console.error('Error opening cash drawer:', error);
    return { success: false, errorMessage: error.message };
  }
});

function testPrint() {
  const options = {
    //  width of content body
    preview: true,
    // margin of content body
    margin: 'auto',
    // Number of copies to print
    copies: 1,
    printerName: 'XP-80C',
    timeOutPerLine: 1000,
    pageSize: '80mm',
  };

  const data = [
    {
      type: 'table',
      // style the table
      style: { border: '1px solid #ddd' },
      // list of the columns to be rendered in the table header
      tableHeader: [
        { type: 'text', value: 'People' },
        {
          type: 'image',
          url: 'https://randomuser.me/api/portraits/men/13.jpg',
        },
      ],
      // multidimensional array depicting the rows and columns of the table body
      tableBody: [
        [
          { type: 'text', value: 'Marcus' },
          {
            type: 'image',
            url: 'https://randomuser.me/api/portraits/men/43.jpg',
          },
        ],
        [
          { type: 'text', value: 'Boris' },
          {
            type: 'image',
            url: 'https://randomuser.me/api/portraits/men/41.jpg',
          },
        ],
        [
          { type: 'text', value: 'Andrew' },
          {
            type: 'image',
            url: 'https://randomuser.me/api/portraits/men/23.jpg',
          },
        ],
        [
          { type: 'text', value: 'Tyresse' },
          {
            type: 'image',
            url: 'https://randomuser.me/api/portraits/men/53.jpg',
          },
        ],
      ],
      // list of columns to be rendered in the table footer
      tableFooter: [{ type: 'text', value: 'People' }, 'Image'],
      // custom style for the table header
      tableHeaderStyle: { backgroundColor: 'red', color: 'white' },
      // custom style for the table body
      tableBodyStyle: { border: '0.5px solid #ddd' },
      // custom style for the table footer
      tableFooterStyle: { backgroundColor: '#000', color: 'white' },
    },
    {
      type: 'image',
      url: 'https://randomuser.me/api/portraits/men/43.jpg',
      // position of image: 'left' | 'center' | 'right'
      position: 'center',
      // width of image in px; default: auto
      width: '60px',
      height: '60px',
    },
    {
      // 'text' | 'barCode' | 'qrCode' | 'image' | 'table
      type: 'text',
      value: 'SAMPLE HEADING',
      style: { fontWeight: '700', textAlign: 'center', fontSize: '24px' },
    },
    {
      // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
      type: 'text',
      value: 'Secondary text',
      style: { textDecoration: 'underline', fontSize: '10px', textAlign: 'center', color: 'red' },
    },
    {
      type: 'barCode',
      value: '023456789010',
      // height of barcode, applicable only to bar and QR codes
      height: 40,
      // width of barcode, applicable only to bar and QR codes
      width: 2,
      // Display value below barcode
      displayValue: true,
      fontsize: 12,
    },
    {
      type: 'qrCode',
      value: 'https://github.com/raghu2x/electron-printer',
      height: 55,
      width: 55,
      position: 'right',
    },
    {
      type: 'table',
      // style the table
      style: { border: '1px solid #ddd' },
      // list of the columns to be rendered in the table header
      tableHeader: ['Animal', 'Age'],
      // multidimensional array depicting the rows and columns of the table body
      tableBody: [
        ['Cat', 2],
        ['Dog', 4],
        ['Horse', 12],
        ['Pig', 4],
      ],
      // list of columns to be rendered in the table footer
      tableFooter: ['Animal', 'Age'],
      // custom style for the table header
      tableHeaderStyle: { backgroundColor: '#000', color: 'white' },
      // custom style for the table body
      tableBodyStyle: { border: '0.5px solid #ddd' },
      // custom style for the table footer
      tableFooterStyle: { backgroundColor: '#000', color: 'white' },
    },
  ];

  try {
    posPrinter
      .print(data, options)
      .then(() => console.log('done'))
      .catch((error) => {
        console.error(error);
      });
  } catch (e) {
    console.log(posPrinter);
    console.log(e);
  }
}
