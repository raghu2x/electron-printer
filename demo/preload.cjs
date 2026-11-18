const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronDemoAPI', {
  // Environment details and demo asset paths
  getDemoInfo: () => ipcRenderer.invoke('demo-info'),

  // Receipt printing: fire the job, then listen for its outcome
  sendTestPrint: (payload = {}) => {
    ipcRenderer.send('test-print', payload);
  },
  onPrintResult: (callback) => {
    ipcRenderer.on('test-print-result', (_event, result) => callback(result));
  },

  // Printers and cash drawer
  getPrinters: () => ipcRenderer.invoke('get-printers'),
  openCashDrawer: (printerName, options) => ipcRenderer.invoke('open-cash-drawer', printerName, options),

  // Generic channels used by the Playwright tests
  invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args),
  send: (channel, ...args) => ipcRenderer.send(channel, ...args),
});
