const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronDemoAPI', {
  sendTestPrint: () => {
    ipcRenderer.send('test-print', {});
  },
  // Cash drawer APIs
  getPrinters: () => ipcRenderer.invoke('get-printers'),
  openCashDrawer: (printerName, options) => ipcRenderer.invoke('open-cash-drawer', printerName, options),
  // Test APIs for Playwright tests
  invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args),
  send: (channel, ...args) => ipcRenderer.send(channel, ...args),
});
