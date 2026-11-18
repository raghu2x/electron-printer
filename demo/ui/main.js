import { api, clearLog, el, state } from './dom.js';
import { initDrawer, renderDrawer } from './drawer.js';
import { loadPrinters } from './printers.js';
import { initReceipt, renderPrintTarget } from './receipt.js';

function renderEnvironment(info) {
  const entries = [
    ['electron', info.versions.electron],
    ['node', info.versions.node],
    ['chrome', info.versions.chrome],
    ['platform', info.platform],
  ];

  for (const [label, value] of entries) {
    const row = document.createElement('div');
    const term = document.createElement('dt');
    term.textContent = label;
    const description = document.createElement('dd');
    description.textContent = value;
    row.append(term, description);
    el.env.append(row);
  }
}

/** Runs whenever the selected printer changes. */
function onPrinterChange() {
  renderPrintTarget();
  renderDrawer();
}

const info = await api.getDemoInfo();
state.logoPath = info.logoPath;
renderEnvironment(info);

initReceipt();
initDrawer();

el.clearLog.addEventListener('click', clearLog);
el.refreshPrinters.addEventListener('click', () => loadPrinters(onPrinterChange));

await loadPrinters(onPrinterChange);
