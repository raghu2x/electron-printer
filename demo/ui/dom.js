export const api = globalThis.electronDemoAPI;

const byId = (id) => document.querySelector(`#${id}`);

export const el = {
  env: byId('env'),
  printerList: byId('printerList'),
  printersHint: byId('printersHint'),
  refreshPrinters: byId('refreshPrinters'),
  printTarget: byId('printTarget'),
  sample: byId('sample'),
  pageSize: byId('pageSize'),
  copies: byId('copies'),
  silent: byId('silent'),
  silentRow: byId('silentRow'),
  payload: byId('payload'),
  payloadError: byId('payloadError'),
  resetPayload: byId('resetPayload'),
  printButton: byId('printButton'),
  drawerTarget: byId('drawerTarget'),
  commandSetHint: byId('commandSetHint'),
  pulseOn: byId('pulseOn'),
  pulseOff: byId('pulseOff'),
  pulseOnMs: byId('pulseOnMs'),
  pulseOffMs: byId('pulseOffMs'),
  errorOnVirtual: byId('errorOnVirtual'),
  drawerSnippet: byId('drawerSnippet'),
  drawerButton: byId('drawerButton'),
  log: byId('log'),
  logEmpty: byId('logEmpty'),
  clearLog: byId('clearLog'),
};

/** Shared demo state. The selected printer drives both printing and the cash drawer. */
export const state = {
  printers: [],
  selectedPrinter: '',
  logoPath: '',
};

export function checkedValue(name) {
  return document.querySelector(`input[name="${name}"]:checked`).value;
}

export function selectedPrinterInfo() {
  return state.printers.find((printer) => printer.name === state.selectedPrinter);
}

/** Adds an entry to the top of the activity log. */
export function addLog(kind, ok, message, detail = '') {
  const item = document.createElement('li');
  item.dataset.state = ok ? 'ok' : 'bad';

  const time = document.createElement('time');
  time.textContent = new Date().toLocaleTimeString([], { hour12: false });

  const tag = document.createElement('span');
  tag.className = 'tag';
  tag.textContent = `${kind} ${ok ? 'ok' : 'failed'}`;

  const text = document.createElement('span');
  text.className = 'message';
  text.textContent = message;

  item.append(time, tag, text);

  if (detail) {
    const extra = document.createElement('span');
    extra.className = 'detail';
    extra.textContent = detail;
    item.append(extra);
  }

  el.log.prepend(item);
  el.logEmpty.hidden = true;
}

export function clearLog() {
  el.log.replaceChildren();
  el.logEmpty.hidden = false;
}
