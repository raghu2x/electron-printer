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
import type { PosPrintData } from '../main/models';

const body = document.querySelector('#main') as HTMLElement | null;
if (!body) {
  throw new Error('Main element (#main) not found in document');
}
const mainBody: HTMLElement = body;

/**
 * Initialize container in html view, by setting the width and margins specified in the PosPrinter options
 */
window.electronAPI.onBodyInit(function (arg) {
  mainBody.style.width = arg?.width || '100%';
  mainBody.style.margin = arg?.margin || '0';

  window.electronAPI.sendBodyInitReply({ status: true, error: null });
});
/**
 * Listen to render event form the main process,
 * Once the main process sends line data, render this data in the web page
 */
window.electronAPI.onRenderLine(renderDataToHTML);
/**
 * @function
 * @name generatePageText
 * @param arg {pass argument of type PosPrintData}
 * @description Render data as HTML to page
 * */
async function renderDataToHTML(arg: { line: PosPrintData; lineIndex: number }) {
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
        } else {
          container.style.display = 'flex';
          container.style.justifyContent = arg.line?.position || 'left';
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
          width: arg.line.width ? parseInt(arg.line.width, 10) : undefined,
        });

        window.electronAPI.sendRenderLineReply({ status: true, error: null });
      } catch (e) {
        window.electronAPI.sendRenderLineReply({ status: false, error: (e as Error).toString() });
      }
      return;
    case 'barCode':
      try {
        const barcodeWrapperEl = document.createElement('div');
        const barcodeEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        barcodeEl.setAttributeNS(null, 'id', `barCode-${arg.lineIndex}`);
        barcodeWrapperEl.append(barcodeEl);
        mainBody.append(barcodeWrapperEl);

        if (arg.line?.style) {
          applyElementStyles(barcodeWrapperEl, arg.line.style);
        } else {
          barcodeWrapperEl.style.display = 'flex';
          barcodeWrapperEl.style.justifyContent = arg.line?.position || 'left';
        }

        JsBarcode(`#barCode-${arg.lineIndex}`, arg.line.value || '', {
          // format: "",
          lineColor: '#000',
          textMargin: 0,
          fontOptions: 'bold',
          fontSize: arg.line.fontsize || 12,
          width: arg.line.width ? parseInt(arg.line.width, 10) : 4,
          height: arg.line.height ? parseInt(arg.line.height, 10) : 40,
          displayValue: !!arg.line.displayValue,
        });
        // send
        window.electronAPI.sendRenderLineReply({ status: true, error: null });
      } catch (e) {
        window.electronAPI.sendRenderLineReply({ status: false, error: (e as Error).toString() });
      }
      return;
    case 'table':
      // Creating table
      let tableContainer = document.createElement('div');
      tableContainer.setAttribute('id', `table-container-${arg.lineIndex}`);
      let table = document.createElement('table');
      table.setAttribute('id', `table${arg.lineIndex}`);
      table = applyElementStyles(table, { ...arg.line.style }) as HTMLTableElement;

      let tHeader = document.createElement('thead');
      tHeader = applyElementStyles(tHeader, arg.line.tableHeaderStyle) as HTMLTableSectionElement;

      let tBody = document.createElement('tbody');
      tBody = applyElementStyles(tBody, arg.line.tableBodyStyle) as HTMLTableSectionElement;

      let tFooter = document.createElement('tfoot');
      tFooter = applyElementStyles(tFooter, arg.line.tableFooterStyle) as HTMLTableSectionElement;
      // 1. Headers
      if (arg.line.tableHeader) {
        for (const headerArg of arg.line.tableHeader) {
          if (typeof headerArg === 'object') {
            switch (headerArg.type) {
              case 'image':
                try {
                  const img = renderImageToPage(headerArg);
                  const th = document.createElement(`th`);
                  th.append(img);
                  tHeader.append(th);
                } catch (e) {
                  window.electronAPI.sendRenderLineReply({
                    status: false,
                    error: (e as Error).toString(),
                  });
                }
                break;
              case 'text':
                tHeader.append(generateTableCell(headerArg, 'th'));
                break;
            }
          } else {
            const th = document.createElement(`th`);
            th.innerHTML = sanitizeHtml(String(headerArg));
            tHeader.append(th);
          }
        }
      }
      // 2. Body
      if (arg.line.tableBody) {
        for (const bodyRow of arg.line.tableBody) {
          const rowTr = document.createElement('tr');
          for (const colArg of bodyRow) {
            if (typeof colArg === 'object') {
              switch (colArg.type) {
                case 'image':
                  try {
                    const img = renderImageToPage(colArg);
                    const td = document.createElement(`td`);
                    td.append(img);
                    rowTr.append(td);
                  } catch (e) {
                    window.electronAPI.sendRenderLineReply({
                      status: false,
                      error: (e as Error).toString(),
                    });
                  }
                  break;
                case 'text':
                  rowTr.append(generateTableCell(colArg));
                  break;
              }
            } else {
              const td = document.createElement(`td`);
              td.innerHTML = sanitizeHtml(String(colArg));
              rowTr.append(td);
            }
          }
          tBody.append(rowTr);
        }
      }
      // 3. Footer
      if (arg.line.tableFooter) {
        for (const footerArg of arg.line.tableFooter) {
          if (typeof footerArg === 'object') {
            switch (footerArg.type) {
              case 'image':
                try {
                  const img = renderImageToPage(footerArg);
                  const footerTh = document.createElement(`th`);
                  footerTh.append(img);
                  tFooter.append(footerTh);
                } catch (e) {
                  window.electronAPI.sendRenderLineReply({
                    status: false,
                    error: (e as Error).toString(),
                  });
                }
                break;
              case 'text':
                tFooter.append(generateTableCell(footerArg, 'th'));
                break;
            }
          } else {
            const footerTh = document.createElement(`th`);
            footerTh.innerHTML = sanitizeHtml(String(footerArg));
            tFooter.append(footerTh);
          }
        }
      }
      // render table
      table.append(tHeader);
      table.append(tBody);
      table.append(tFooter);
      tableContainer.append(table);
      mainBody.append(tableContainer);
      // send
      window.electronAPI.sendRenderLineReply({ status: true, error: null });
  }
}
