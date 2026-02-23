import { _electron as electron, type ElectronApplication, type Page } from 'playwright';
import { test, expect } from '@playwright/test';

interface IpcResult {
  received: boolean;
  data: unknown;
}

test.describe('IPC Communication Tests', () => {
  let electronApp: ElectronApplication;
  let window: Page;

  test.beforeAll(async () => {
    electronApp = await electron.launch({
      args: ['./demo'],
      env: { ...process.env, NODE_ENV: 'test' },
    });
    window = await electronApp.firstWindow({ timeout: 60000 });
    await window.waitForLoadState('networkidle');
  });

  test.afterAll(async () => {
    await electronApp.close();
  });

  test('should send test-print IPC message when button clicked', async () => {
    const messagePromise = electronApp.evaluate(({ ipcMain }) => {
      return new Promise((resolve) => {
        const handler = (_event: unknown, data: unknown) => {
          ipcMain.removeListener('test-print', handler);
          resolve({ received: true, data });
        };
        ipcMain.on('test-print', handler);

        setTimeout(() => {
          ipcMain.removeListener('test-print', handler);
          resolve({ received: false, data: null });
        }, 5000);
      });
    }) as Promise<IpcResult>;

    const button = window.locator('button.btn').first();
    await button.click();

    const result = await messagePromise;

    expect(result.received).toBe(true);
    expect(result.data).toEqual({});
  });

  test('should have electronAPI available in renderer process', async () => {
    const hasElectronAPI = await window.evaluate(() => {
      const api = globalThis.window.electronDemoAPI;
      return typeof api === 'object' && typeof api?.invoke === 'function' && typeof api?.send === 'function';
    });
    expect(hasElectronAPI).toBe(true);
  });

  test('should be able to send custom IPC messages', async () => {
    const messagePromise = electronApp.evaluate(({ ipcMain }) => {
      return new Promise((resolve) => {
        const handler = (_event: unknown, data: unknown) => {
          ipcMain.removeListener('test-custom-message', handler);
          resolve({ received: true, data });
        };
        ipcMain.on('test-custom-message', handler);

        setTimeout(() => {
          ipcMain.removeListener('test-custom-message', handler);
          resolve({ received: false, data: null });
        }, 5000);
      });
    }) as Promise<IpcResult>;

    await window.evaluate(() => {
      const api = globalThis.window.electronDemoAPI;
      api.send('test-custom-message', { test: 'data', timestamp: Date.now() });
    });

    const result = await messagePromise;

    expect(result.received).toBe(true);
    expect(result.data).toHaveProperty('test', 'data');
    expect(result.data).toHaveProperty('timestamp');
  });
});
