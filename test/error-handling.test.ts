import { _electron as electron, type ElectronApplication, type Page } from 'playwright';
import { test, expect } from '@playwright/test';

interface PrintResult {
  success: boolean;
  error?: string;
}

test.describe('Error Handling Tests', () => {
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

  test('should handle invalid printer name gracefully', async () => {
    const printResult = (await window.evaluate(async () => {
      const api = globalThis.window.electronDemoAPI;

      const options = {
        preview: false,
        silent: true,
        margin: 'auto',
        copies: 1,
        printerName: 'NonExistentPrinter123',
        pageSize: '80mm',
      };

      const data = [
        {
          type: 'text',
          value: 'Test with invalid printer',
          style: { fontSize: '14px' },
        },
      ];

      return await api.invoke('test-printer-print', data, options);
    })) as PrintResult;

    if (printResult.success) {
      expect(printResult.success).toBe(true);
    } else {
      expect(typeof printResult.error).toBe('string');
      expect(printResult.error?.length).toBeGreaterThan(0);
    }
  });

  test('should reject invalid page size string', async () => {
    const printResult = (await window.evaluate(async () => {
      const api = globalThis.window.electronDemoAPI;

      const options = {
        preview: true,
        silent: true,
        margin: 'auto',
        copies: 1,
        pageSize: 'invalid-size',
      };

      const data = [
        {
          type: 'text',
          value: 'Test with invalid page size',
          style: { fontSize: '14px' },
        },
      ];

      return await api.invoke('test-printer-print', data, options);
    })) as PrintResult;

    expect(printResult.success).toBe(false);
    expect(printResult.error).toContain('Invalid pageSize');
    expect(printResult.error).toContain('Valid sizes are');
  });

  test('should handle empty data array', async () => {
    const printResult = (await window.evaluate(async () => {
      const api = globalThis.window.electronDemoAPI;

      const options = {
        preview: true,
        silent: true,
        margin: 'auto',
        copies: 1,
        pageSize: '80mm',
      };

      const data: unknown[] = [];

      return await api.invoke('test-printer-print', data, options);
    })) as PrintResult;

    expect(printResult.success).toBe(true);
  });

  test('should handle invalid image URL', async () => {
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
          url: 'https://invalid-url-that-does-not-exist.com/image.jpg',
          position: 'center',
          width: '60px',
          height: '60px',
        },
      ];

      return await api.invoke('test-printer-print', data, options);
    })) as PrintResult;

    if (!printResult.success) {
      expect(printResult.error).toBeDefined();
    }
  });

  test('should handle malformed table data', async () => {
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
          type: 'table',
          style: { border: '1px solid #ddd' },
          tableHeader: ['Item', 'Price'],
          tableBody: [['Product 1'], ['Product 2', '$15.00', 'Extra column'], []],
          tableFooter: ['Total', '$15.00'],
        },
      ];

      return await api.invoke('test-printer-print', data, options);
    })) as PrintResult;

    expect(printResult.success).toBe(true);
  });

  test('should handle missing value properties', async () => {
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
        },
        {
          type: 'barCode',
        },
      ];

      return await api.invoke('test-printer-print', data, options);
    })) as PrintResult;

    expect(printResult.success).toBe(true);
  });

  test('should handle extremely large content', async () => {
    const printResult = (await window.evaluate(async () => {
      const api = globalThis.window.electronDemoAPI;

      const options = {
        preview: true,
        silent: true,
        margin: 'auto',
        copies: 1,
        pageSize: '80mm',
      };

      const largeText = 'A'.repeat(10000);
      const data = [
        {
          type: 'text',
          value: largeText,
          style: { fontSize: '14px' },
        },
      ];

      return await api.invoke('test-printer-print', data, options);
    })) as PrintResult;

    expect(printResult.success).toBe(true);
  });

  test('should reject zero copies', async () => {
    const printResult = (await window.evaluate(async () => {
      const api = globalThis.window.electronDemoAPI;

      const options = {
        preview: true,
        silent: true,
        margin: 'auto',
        copies: 0,
        pageSize: '80mm',
      };

      const data = [
        {
          type: 'text',
          value: 'Test with zero copies',
          style: { fontSize: '14px' },
        },
      ];

      return await api.invoke('test-printer-print', data, options);
    })) as PrintResult;

    expect(printResult.success).toBe(false);
    expect(printResult.error).toContain('Invalid copies');
  });

  test('should reject negative copies', async () => {
    const printResult = (await window.evaluate(async () => {
      const api = globalThis.window.electronDemoAPI;

      const options = {
        preview: true,
        silent: true,
        margin: 'auto',
        copies: -5,
        pageSize: '80mm',
      };

      const data = [
        {
          type: 'text',
          value: 'Test with negative copies',
          style: { fontSize: '14px' },
        },
      ];

      return await api.invoke('test-printer-print', data, options);
    })) as PrintResult;

    expect(printResult.success).toBe(false);
    expect(printResult.error).toContain('Invalid copies');
  });
});
