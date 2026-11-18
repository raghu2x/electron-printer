import { addLog, api, checkedValue, el, state } from './dom.js';
import { SAMPLES } from './samples.js';

/** Parses the print data editor. Returns the data array, or null when it is invalid. */
function validatePayload() {
  let data = null;
  let message = '';

  try {
    const parsed = JSON.parse(el.payload.value);
    if (Array.isArray(parsed)) {
      data = parsed;
    } else {
      message = 'Print data must be a JSON array of print items.';
    }
  } catch (error) {
    message = `Print data is not valid JSON: ${error.message}`;
  }

  el.payloadError.textContent = message;
  el.payloadError.hidden = message === '';
  el.payload.setAttribute('aria-invalid', String(message !== ''));
  return data;
}

function loadSample() {
  const sample = SAMPLES.find((entry) => entry.id === el.sample.value) ?? SAMPLES[0];
  el.payload.value = JSON.stringify(sample.build(state.logoPath), null, 2);
  validatePayload();
}

function printOptions() {
  const toPrinter = checkedValue('output') === 'printer';
  const options = {
    preview: !toPrinter,
    margin: 'auto',
    copies: Math.max(1, Number.parseInt(el.copies.value, 10) || 1),
    timeOutPerLine: 1000,
    pageSize: el.pageSize.value,
  };

  if (toPrinter) {
    options.printerName = state.selectedPrinter;
    options.silent = el.silent.checked;
  }

  return options;
}

function print() {
  const data = validatePayload();
  if (!data) {
    el.payload.focus();
    return;
  }

  const options = printOptions();
  if (!options.preview && !options.printerName) {
    addLog('print', false, 'Select a printer first, or switch the output to Preview.');
    return;
  }

  el.printButton.disabled = true;
  api.sendTestPrint({ data, options });
}

function onPrintResult(result) {
  el.printButton.disabled = false;

  if (!result.success) {
    addLog('print', false, 'Print failed', result.error);
  } else if (result.preview) {
    addLog('print', true, 'Preview window opened');
  } else {
    addLog('print', true, `Sent to ${result.printerName}`);
  }
}

/** Shows where the next print job will go. */
export function renderPrintTarget() {
  const toPrinter = checkedValue('output') === 'printer';
  const name = state.selectedPrinter;

  el.silentRow.hidden = !toPrinter;
  el.printTarget.classList.toggle('missing', toPrinter && !name);

  if (!toPrinter) {
    el.printTarget.textContent = '→ preview window';
  } else if (name) {
    el.printTarget.textContent = `→ ${name}`;
  } else {
    el.printTarget.textContent = 'No printer selected';
  }
}

export function initReceipt() {
  for (const sample of SAMPLES) {
    el.sample.append(new Option(sample.label, sample.id));
  }

  el.sample.addEventListener('change', loadSample);
  el.resetPayload.addEventListener('click', loadSample);
  el.payload.addEventListener('input', validatePayload);
  el.printButton.addEventListener('click', print);
  for (const input of document.querySelectorAll('input[name="output"]')) {
    input.addEventListener('change', renderPrintTarget);
  }

  api.onPrintResult(onPrintResult);
  loadSample();
  renderPrintTarget();
}
