// oxlint-disable-next-line import/no-unassigned-import
import './index.css';
import { applyElementStyles, createTextElement, createTableCell, createImageElement, sanitizeHtml } from './utils';
import JsBarcode from 'jsbarcode';
import QRCode from 'qrcode';
import type {
  PrintData,
  PrintBarCodeData,
  PrintQRCodeData,
  PrintTableData,
  PrintOptions,
  PrintTableField,
} from '../main/models';

const body = document.querySelector('#main') as HTMLElement | null;
if (!body) {
  throw new Error('Main element (#main) not found in document');
}
const mainBody: HTMLElement = body;

/**
 * Sends render result back to main process
 * @param success - whether the render was successful
 * @param error - error message if failed
 */
function sendRenderResult(success: boolean, error: string | null = null): void {
  window.electronAPI.sendRenderLineReply({ status: success, error });
}

/**
 * Renders a barcode element from PrintBarCodeData
 * @param barcodeData - print data containing barcode value and style
 * @param itemIndex - index for unique element IDs
 */
function renderBarCode(barcodeData: PrintBarCodeData, itemIndex: number): HTMLDivElement {
  const barcodeWrapperEl = document.createElement('div');
  const barcodeEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  barcodeEl.setAttributeNS(null, 'id', `barCode-${itemIndex}`);
  barcodeWrapperEl.append(barcodeEl);

  if (barcodeData.style) {
    applyElementStyles(barcodeWrapperEl, barcodeData.style);
  } else {
    barcodeWrapperEl.style.display = 'flex';
    barcodeWrapperEl.style.justifyContent = barcodeData.position ?? 'left';
  }

  // Skip rendering if barcode has no value (JsBarcode requires a non-empty string)
  if (!barcodeData.value) {
    return barcodeWrapperEl;
  }

  JsBarcode(barcodeEl, barcodeData.value, {
    lineColor: '#000',
    textMargin: 0,
    fontOptions: 'bold',
    fontSize: barcodeData.fontsize ?? 12,
    width: barcodeData.width ? Number.parseInt(barcodeData.width, 10) : 4,
    height: barcodeData.height ? Number.parseInt(barcodeData.height, 10) : 40,
    displayValue: barcodeData.displayValue,
  });

  return barcodeWrapperEl;
}

/**
 * Renders a QR code element from PrintQRCodeData
 * @param qrCodeData - print data containing QR code value and style
 * @param itemIndex - index for unique element IDs
 */
async function renderQRCode(qrCodeData: PrintQRCodeData, itemIndex: number): Promise<HTMLDivElement> {
  const container = document.createElement('div');
  container.style.display = 'flex';
  container.style.justifyContent = qrCodeData.position || 'left';

  if (qrCodeData.style) {
    applyElementStyles(container, qrCodeData.style);
  }

  const qrCodeCanvas = document.createElement('canvas');
  qrCodeCanvas.setAttribute('id', `qrCode-${itemIndex}`);
  applyElementStyles(qrCodeCanvas, {
    textAlign: qrCodeData.position ? '-webkit-' + qrCodeData.position : '-webkit-left',
  });

  container.append(qrCodeCanvas);

  await QRCode.toCanvas(qrCodeCanvas, qrCodeData.value || '', {
    width: qrCodeData.width ? Number.parseInt(qrCodeData.width, 10) : 55,
    errorCorrectionLevel: 'H',
    color: {
      dark: '#000',
      light: '#fff',
    },
  });

  return container;
}

/**
 * Renders table section cells (header, body row, or footer)
 * @param cells - array of cell data
 * @param container - parent element to append cells to
 * @param cellTag - 'th' or 'td' for cell type
 */
function renderTableSection(cells: PrintTableField[] | string[], container: HTMLElement, cellTag: 'th' | 'td'): void {
  for (const cellData of cells) {
    if (typeof cellData === 'object') {
      switch (cellData.type) {
        case 'image': {
          const img = createImageElement(cellData);
          const cell = document.createElement(cellTag);
          cell.append(img);
          container.append(cell);
          break;
        }
        case 'text':
          container.append(createTableCell(cellData, cellTag));
          break;
        default:
          break;
      }
    } else {
      const cell = document.createElement(cellTag);
      cell.innerHTML = sanitizeHtml(String(cellData));
      container.append(cell);
    }
  }
}

/**
 * Renders a table element from PrintTableData
 * @param tableData - print data containing table structure and styles
 * @param itemIndex - index for unique element IDs
 */
function renderTable(tableData: PrintTableData, itemIndex: number): HTMLDivElement {
  const tableContainer = document.createElement('div');
  tableContainer.setAttribute('id', `table-container-${itemIndex}`);

  const table = applyElementStyles(document.createElement('table'), { ...tableData.style });
  table.setAttribute('id', `table${itemIndex}`);

  const tHeader = applyElementStyles(document.createElement('thead'), tableData.tableHeaderStyle);
  const tBody = applyElementStyles(document.createElement('tbody'), tableData.tableBodyStyle);
  const tFooter = applyElementStyles(document.createElement('tfoot'), tableData.tableFooterStyle);

  // 1. Headers
  if (tableData.tableHeader) {
    renderTableSection(tableData.tableHeader, tHeader, 'th');
  }

  // 2. Body
  if (tableData.tableBody) {
    for (const bodyRow of tableData.tableBody) {
      const rowTr = document.createElement('tr');
      renderTableSection(bodyRow, rowTr, 'td');
      tBody.append(rowTr);
    }
  }

  // 3. Footer
  if (tableData.tableFooter) {
    renderTableSection(tableData.tableFooter, tFooter, 'th');
  }

  // Assemble table
  table.append(tHeader);
  table.append(tBody);
  table.append(tFooter);
  tableContainer.append(table);

  return tableContainer;
}

interface RenderContext {
  printItem: PrintData;
  itemIndex: number;
}

/**
 * Render data as HTML to page
 * @param renderContext - contains the print item data and its index
 */
async function renderDataToHTML(renderContext: RenderContext): Promise<void> {
  const { printItem, itemIndex } = renderContext;

  switch (printItem.type) {
    case 'text':
      try {
        mainBody.append(createTextElement(printItem));
        sendRenderResult(true);
      } catch (e) {
        sendRenderResult(false, (e as Error).toString());
      }
      return;

    case 'image':
      try {
        mainBody.append(createImageElement(printItem));
        sendRenderResult(true);
      } catch (e) {
        sendRenderResult(false, (e as Error).toString());
      }
      return;

    case 'qrCode':
      try {
        const qrCodeElement = await renderQRCode(printItem, itemIndex);
        mainBody.append(qrCodeElement);
        sendRenderResult(true);
      } catch (e) {
        sendRenderResult(false, (e as Error).toString());
      }
      return;

    case 'barCode':
      try {
        mainBody.append(renderBarCode(printItem, itemIndex));
        sendRenderResult(true);
      } catch (e) {
        sendRenderResult(false, (e as Error).toString());
      }
      return;

    case 'table':
      try {
        mainBody.append(renderTable(printItem, itemIndex));
        sendRenderResult(true);
      } catch (e) {
        sendRenderResult(false, (e as Error).toString());
      }
      return;

    default:
      sendRenderResult(false, `Unknown print item type: ${(printItem as { type: string }).type}`);
  }
}

/**
 * Initialize container in html view, by setting the width and margins specified in the PrintOptions
 */
window.electronAPI.onBodyInit(function (options: Pick<PrintOptions, 'width' | 'margin'>) {
  mainBody.style.width = options?.width || '100%';
  mainBody.style.margin = options?.margin || '0';

  window.electronAPI.sendBodyInitReply({ status: true, error: null });
});

/**
 * Listen to render event from the main process,
 * Once the main process sends print item data, render this data in the web page
 */
window.electronAPI.onRenderLine(renderDataToHTML);
