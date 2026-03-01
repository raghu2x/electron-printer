import { _electron as electron, type ElectronApplication, type Page } from 'playwright';
import { test, expect } from '@playwright/test';

interface PrintResult {
  success: boolean;
  error?: string;
}

test.describe('Validation Tests', () => {
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

  test('should reject when printerName is missing and not preview/silent', async () => {
    const printResult = (await window.evaluate(async () => {
      const api = globalThis.window.electronDemoAPI;

      const options = {
        preview: false,
        silent: false,
        margin: 'auto',
        copies: 1,
        pageSize: '80mm',
      };

      const data = [
        {
          type: 'text',
          value: 'Test without printer name',
          style: { fontSize: '14px' },
        },
      ];

      return await api.invoke('test-printer-print', data, options);
    })) as PrintResult;

    expect(printResult.success).toBe(false);
    expect(printResult.error).toContain('printer name is required');
  });

  test('should reject when pageSize object is missing width', async () => {
    const printResult = (await window.evaluate(async () => {
      const api = globalThis.window.electronDemoAPI;

      const options = {
        preview: true,
        silent: true,
        margin: 'auto',
        copies: 1,
        pageSize: { height: 400 },
      };

      const data = [
        {
          type: 'text',
          value: 'Test with invalid pageSize',
          style: { fontSize: '14px' },
        },
      ];

      return await api.invoke('test-printer-print', data, options);
    })) as PrintResult;

    expect(printResult.success).toBe(false);
    expect(printResult.error).toContain('height and width');
  });

  test('should reject when pageSize object is missing height', async () => {
    const printResult = (await window.evaluate(async () => {
      const api = globalThis.window.electronDemoAPI;

      const options = {
        preview: true,
        silent: true,
        margin: 'auto',
        copies: 1,
        pageSize: { width: 300 },
      };

      const data = [
        {
          type: 'text',
          value: 'Test with invalid pageSize',
          style: { fontSize: '14px' },
        },
      ];

      return await api.invoke('test-printer-print', data, options);
    })) as PrintResult;

    expect(printResult.success).toBe(false);
    expect(printResult.error).toContain('height and width');
  });

  test('should reject image without path or url', async () => {
    const printResult = (await window.evaluate(async () => {
      const api = globalThis.window.electronDemoAPI;

      const options = {
        preview: true,
        silent: true,
        margin: 'auto',
        copies: 1,
        pageSize: '80mm',
      };

      const data = [
        {
          type: 'image',
          position: 'center',
          width: '60px',
          height: '60px',
        },
      ];

      return await api.invoke('test-printer-print', data, options);
    })) as PrintResult;

    expect(printResult.success).toBe(false);
    expect(printResult.error).toContain('image requires a path or url');
  });

  test('should reject when style is not an object', async () => {
    const printResult = (await window.evaluate(async () => {
      const api = globalThis.window.electronDemoAPI;

      const options = {
        preview: true,
        silent: true,
        margin: 'auto',
        copies: 1,
        pageSize: '80mm',
      };

      const data = [
        {
          type: 'text',
          value: 'Test with invalid style',
          style: 'font-size: 14px',
        },
      ];

      return await api.invoke('test-printer-print', data, options);
    })) as PrintResult;

    expect(printResult.success).toBe(false);
    expect(printResult.error).toContain('style must be an object');
  });
});
