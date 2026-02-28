// oxlint-disable-next-line import/no-unassigned-import
import './index.css';
import {
  applyElementStyles,
  generatePageText,
  generateQRCode,
  generateTableCell,
  renderImageToPage,
  sanitizeHtml,
} from './utils';
import JsBarcode from 'jsbarcode';
import type { PosPrintData, PosPrintBarCodeData, PosPrintTableData, PosPrintOptions } from '../main/models';

const body = document.querySelector('#main') as HTMLElement | null;
if (!body) {
  throw new Error('Main element (#main) not found in document');
}
const mainBody: HTMLElement = body;

/**
 * Renders a barcode element from PosPrintBarCodeData
 * @param line - print data containing barcode value and style
 * @param lineIndex - index for unique element IDs
 */
function renderBarCodeToPage(line: PosPrintBarCodeData, lineIndex: number): HTMLDivElement {
  const barcodeWrapperEl = document.createElement('div');
  const barcodeEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  barcodeEl.setAttributeNS(null, 'id', `barCode-${lineIndex}`);
  barcodeWrapperEl.append(barcodeEl);

  if (line.style) {
    applyElementStyles(barcodeWrapperEl, line.style);
  } else {
    barcodeWrapperEl.style.display = 'flex';
    barcodeWrapperEl.style.justifyContent = line.position ?? 'left';
  }

  // Skip rendering if barcode has no value (JsBarcode requires a non-empty string)
  if (!line.value) {
    return barcodeWrapperEl;
  }

  JsBarcode(barcodeEl, line.value, {
    lineColor: '#000',
    textMargin: 0,
    fontOptions: 'bold',
    fontSize: line.fontsize ?? 12,
    width: line.width ? Number.parseInt(line.width, 10) : 4,
    height: line.height ? Number.parseInt(line.height, 10) : 40,
    displayValue: line.displayValue,
  });

  return barcodeWrapperEl;
}

/**
 * Renders a table element from PosPrintTableData
 * @param line - print data containing table structure and styles
 * @param lineIndex - index for unique element IDs
 */
function renderTableToPage(line: PosPrintTableData, lineIndex: number): HTMLDivElement {
  const tableContainer = document.createElement('div');
  tableContainer.setAttribute('id', `table-container-${lineIndex}`);

  let table = document.createElement('table');
  table.setAttribute('id', `table${lineIndex}`);
  table = applyElementStyles(table, { ...line.style }) as HTMLTableElement;

  let tHeader = document.createElement('thead');
  tHeader = applyElementStyles(tHeader, line.tableHeaderStyle) as HTMLTableSectionElement;

  let tBody = document.createElement('tbody');
  tBody = applyElementStyles(tBody, line.tableBodyStyle) as HTMLTableSectionElement;

  let tFooter = document.createElement('tfoot');
  tFooter = applyElementStyles(tFooter, line.tableFooterStyle) as HTMLTableSectionElement;

  // 1. Headers
  if (line.tableHeader) {
    for (const headerArg of line.tableHeader) {
      if (typeof headerArg === 'object') {
        switch (headerArg.type) {
          case 'image': {
            const img = renderImageToPage(headerArg);
            const th = document.createElement('th');
            th.append(img);
            tHeader.append(th);
            break;
          }
          case 'text':
            tHeader.append(generateTableCell(headerArg, 'th'));
            break;
          default:
            break;
        }
      } else {
        const th = document.createElement('th');
        th.innerHTML = sanitizeHtml(String(headerArg));
        tHeader.append(th);
      }
    }
  }

  // 2. Body
  if (line.tableBody) {
    for (const bodyRow of line.tableBody) {
      const rowTr = document.createElement('tr');
      for (const colArg of bodyRow) {
        if (typeof colArg === 'object') {
          switch (colArg.type) {
            case 'image': {
              const img = renderImageToPage(colArg);
              const td = document.createElement('td');
              td.append(img);
              rowTr.append(td);
              break;
            }
            case 'text':
              rowTr.append(generateTableCell(colArg));
              break;
            default:
              break;
          }
        } else {
          const td = document.createElement('td');
          td.innerHTML = sanitizeHtml(String(colArg));
          rowTr.append(td);
        }
      }
      tBody.append(rowTr);
    }
  }

  // 3. Footer
  if (line.tableFooter) {
    for (const footerArg of line.tableFooter) {
      if (typeof footerArg === 'object') {
        switch (footerArg.type) {
          case 'image': {
            const img = renderImageToPage(footerArg);
            const footerTh = document.createElement('th');
            footerTh.append(img);
            tFooter.append(footerTh);
            break;
          }
          case 'text':
            tFooter.append(generateTableCell(footerArg, 'th'));
            break;
          default:
            break;
        }
      } else {
        const footerTh = document.createElement('th');
        footerTh.innerHTML = sanitizeHtml(String(footerArg));
        tFooter.append(footerTh);
      }
    }
  }

  // Assemble table
  table.append(tHeader);
  table.append(tBody);
  table.append(tFooter);
  tableContainer.append(table);

  return tableContainer;
}

/**
 * Render data as HTML to page
 * @param arg - contains the line data and its index
 */
async function renderDataToHTML(arg: { line: PosPrintData; lineIndex: number }): Promise<void> {
  switch (arg.line.type) {
    case 'text':
      try {
        mainBody.append(generatePageText(arg.line));
        // sending msg
        window.electronAPI.sendRenderLineReply({ status: true, error: null });
      } catch (e) {
        window.electronAPI.sendRenderLineReply({ status: false, error: (e as Error).toString() });
      }
      return;
    case 'image':
      try {
        const img = renderImageToPage(arg.line);
        mainBody.append(img);
        window.electronAPI.sendRenderLineReply({ status: true, error: null });
      } catch (e) {
        window.electronAPI.sendRenderLineReply({ status: false, error: (e as Error).toString() });
      }
      return;
    case 'qrCode':
      try {
        const container = document.createElement('div');
        container.style.display = 'flex';
        container.style.justifyContent = arg.line?.position || 'left';

        if (arg.line?.style) {
          applyElementStyles(container, arg.line.style);
        }

        const qrCode = document.createElement('canvas');
        qrCode.setAttribute('id', `qrCode${arg.lineIndex}`);
        applyElementStyles(qrCode, {
          textAlign: arg.line.position ? '-webkit-' + arg.line.position : '-webkit-left',
        });

        container.append(qrCode);
        mainBody.append(container);

        await generateQRCode(`qrCode${arg.lineIndex}`, {
          value: arg.line.value || '',
          width: arg.line.width ? Number.parseInt(arg.line.width, 10) : 55,
        });

        window.electronAPI.sendRenderLineReply({ status: true, error: null });
      } catch (e) {
        window.electronAPI.sendRenderLineReply({ status: false, error: (e as Error).toString() });
      }
      return;
    case 'barCode':
      try {
        const barcodeWrapper = renderBarCodeToPage(arg.line, arg.lineIndex);
        mainBody.append(barcodeWrapper);
        window.electronAPI.sendRenderLineReply({ status: true, error: null });
      } catch (e) {
        window.electronAPI.sendRenderLineReply({ status: false, error: (e as Error).toString() });
      }
      return;
    case 'table':
      try {
        const tableContainer = renderTableToPage(arg.line, arg.lineIndex);
        mainBody.append(tableContainer);
        window.electronAPI.sendRenderLineReply({ status: true, error: null });
      } catch (e) {
        window.electronAPI.sendRenderLineReply({ status: false, error: (e as Error).toString() });
      }
      return;
    default:
      window.electronAPI.sendRenderLineReply({
        status: false,
        error: `Unknown line type: ${(arg.line as { type: string }).type}`,
      });
  }
}

/**
 * Initialize container in html view, by setting the width and margins specified in the PosPrinter options
 */
window.electronAPI.onBodyInit(function (arg: Pick<PosPrintOptions, 'width' | 'margin'>) {
  mainBody.style.width = arg?.width || '100%';
  mainBody.style.margin = arg?.margin || '0';

  window.electronAPI.sendBodyInitReply({ status: true, error: null });
});
/**
 * Listen to render event form the main process,
 * Once the main process sends line data, render this data in the web page
 */
window.electronAPI.onRenderLine(renderDataToHTML);
