import { addLog, api, checkedValue, el, selectedPrinterInfo, state } from './dom.js';

const COMMAND_SET_HINTS = {
  auto: 'Star commands when the printer name, driver or model identifies a Star Micronics printer, ESC/POS otherwise.',
  escpos: 'ESC p. For Epson and compatible printers, or a Star printer switched to ESC/POS emulation.',
  star: 'BEL / SUB. For Star Line Mode, StarPRNT and Star Graphic. Use this when a renamed Star printer is not detected.',
};

function clampByte(input) {
  const value = Number.parseInt(input.value, 10);
  if (Number.isNaN(value)) {
    return 0;
  }
  return Math.min(255, Math.max(0, value));
}

function drawerOptions() {
  const options = {
    commandSet: checkedValue('commandSet'),
    pin: Number(checkedValue('pin')),
    pulseOnTime: clampByte(el.pulseOn),
    pulseOffTime: clampByte(el.pulseOff),
  };

  if (el.errorOnVirtual.checked) {
    options.errorOnVirtualPrinter = true;
  }

  return options;
}

function renderTarget() {
  const name = state.selectedPrinter;
  el.drawerTarget.classList.toggle('missing', !name);

  if (!name) {
    el.drawerTarget.textContent = 'No printer selected';
  } else if (selectedPrinterInfo()?.type === 'VIRTUAL') {
    el.drawerTarget.textContent = `→ ${name} (virtual)`;
  } else {
    el.drawerTarget.textContent = `→ ${name}`;
  }
}

/** Refreshes the drawer panel: target, hints and the equivalent code snippet. */
export function renderDrawer() {
  const options = drawerOptions();
  renderTarget();

  el.commandSetHint.textContent = COMMAND_SET_HINTS[options.commandSet];
  el.pulseOnMs.textContent = `≈ ${options.pulseOnTime * 2} ms`;
  el.pulseOffMs.textContent = `≈ ${options.pulseOffTime * 2} ms`;

  const lines = Object.entries(options).map(([key, value]) => `  ${key}: ${JSON.stringify(value)},`);
  const name = JSON.stringify(state.selectedPrinter || 'printer-name');
  el.drawerSnippet.textContent = `await printer.openCashDrawer(${name}, {\n${lines.join('\n')}\n});`;
}

async function openDrawer() {
  if (!state.selectedPrinter) {
    addLog('drawer', false, 'Select a printer first.');
    return;
  }

  const options = drawerOptions();
  el.drawerButton.disabled = true;

  const result = await api
    .openCashDrawer(state.selectedPrinter, options)
    .catch((error) => ({ success: false, errorMessage: error.message }));

  el.drawerButton.disabled = false;

  if (result.success) {
    addLog('drawer', true, `Kick sent to ${state.selectedPrinter}`, `commandSet: ${options.commandSet}`);
  } else {
    const code = typeof result.errorCode === 'number' ? `${result.errorName ?? 'error'} (${result.errorCode})` : '';
    addLog('drawer', false, result.errorMessage || 'The drawer command failed', code);
  }
}

export function initDrawer() {
  el.drawerButton.addEventListener('click', openDrawer);
  for (const input of document.querySelectorAll('.drawer input')) {
    input.addEventListener('input', renderDrawer);
  }
  renderDrawer();
}
