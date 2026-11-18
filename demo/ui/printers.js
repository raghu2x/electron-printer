import { addLog, api, el, selectedPrinterInfo, state } from './dom.js';

const DEFAULT_HINT = el.printersHint.textContent;

const STATUS_STATES = {
  IDLE: 'ok',
  PRINTING: 'busy',
  PROCESSING: 'busy',
  BUSY: 'busy',
  OFFLINE: 'bad',
  ERROR: 'bad',
  PAUSED: 'bad',
};

function printerMeta(printer) {
  const parts = [printer.status, printer.type];
  if (printer.ipAddress) {
    parts.push(printer.port ? `${printer.ipAddress}:${printer.port}` : printer.ipAddress);
  }
  if (printer.bluetoothAddress) {
    parts.push(printer.bluetoothAddress);
  }
  if (printer.default) {
    parts.push('default');
  }
  return parts.join(' · ');
}

function createPrinterButton(printer, onSelect) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'printer';
  button.setAttribute('aria-pressed', String(printer.name === state.selectedPrinter));

  const dot = document.createElement('span');
  dot.className = 'dot';
  dot.dataset.state = STATUS_STATES[printer.status] ?? 'unknown';

  const name = document.createElement('span');
  name.className = 'printer-name';
  name.textContent = printer.name;
  name.title = printer.name;

  const meta = document.createElement('span');
  meta.className = 'printer-meta';
  meta.textContent = printerMeta(printer);

  button.append(dot, name, meta);
  button.addEventListener('click', () => onSelect(printer.name));
  return button;
}

/**
 * Renders the printer list.
 * @param onChange - called after the selected printer changes
 */
export function renderPrinters(onChange) {
  const onSelect = (name) => {
    state.selectedPrinter = name;
    renderPrinters(onChange);
    onChange();
  };

  const items = state.printers.map((printer) => {
    const item = document.createElement('li');
    item.append(createPrinterButton(printer, onSelect));
    return item;
  });

  el.printerList.replaceChildren(...items);
}

function printersHint(response) {
  if (!response.success) {
    return 'Could not load printers. See Activity for details.';
  }
  if (response.printers.length === 0) {
    return 'No printers are installed on this system.';
  }
  return DEFAULT_HINT;
}

/**
 * Fetches the system printers and re-renders the list.
 * @param onChange - called after the selected printer changes
 */
export async function loadPrinters(onChange) {
  el.refreshPrinters.disabled = true;
  el.printersHint.textContent = 'Looking for printers…';

  const response = await api.getPrinters().catch((error) => ({ success: false, error: error.message }));

  el.refreshPrinters.disabled = false;
  el.printersHint.textContent = printersHint(response);

  if (response.success) {
    state.printers = response.printers;
  } else {
    state.printers = [];
    addLog('printers', false, 'Could not load printers', response.error);
  }

  // Keep the current selection if it still exists, otherwise fall back to the default printer.
  if (!selectedPrinterInfo()) {
    const fallback = state.printers.find((printer) => printer.default) ?? state.printers[0];
    state.selectedPrinter = fallback?.name ?? '';
  }

  renderPrinters(onChange);
  onChange();
}
