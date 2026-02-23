import { _electron as electron, type ElectronApplication, type Page } from 'playwright';
import { test, expect } from '@playwright/test';

declare global {
  interface Window {
    electronDemoAPI: {
      invoke: (...args: unknown[]) => Promise<unknown>;
      send: (...args: unknown[]) => Promise<unknown>;
      sendTestPrint: () => Promise<unknown>;
    };
  }
}

interface PrintResult {
  success: boolean;
  error: string | null;
  pageSize?: string;
}

interface AvailabilityResult {
  success: boolean;
  available: boolean;
}

test.describe('Printer Functionality Tests', () => {
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

  test('should have posPrinter available in main process', async () => {
    const checkResult = (await window.evaluate(async () => {
      const api = globalThis.window.electronDemoAPI;
      return await api.invoke('test-pos-printer-available');
    })) as AvailabilityResult;

    expect(checkResult.success).toBe(true);
    expect(checkResult.available).toBe(true);
  });

  test('should handle basic text printing', async () => {
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
          value: 'Test Receipt',
          style: { fontWeight: 'bold', textAlign: 'center', fontSize: '18px' },
        },
      ];

      return await api.invoke('test-pos-printer-print', data, options);
    })) as PrintResult;

    expect(printResult.success).toBe(true);
    expect(printResult.error).toBeNull();
  });

  test('should handle different content types', async () => {
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
          value: 'RECEIPT HEADER',
          style: { fontWeight: 'bold', textAlign: 'center', fontSize: '20px' },
        },
        {
          type: 'text',
          value: 'Item 1: $10.00',
          style: { fontSize: '14px' },
        },
        {
          type: 'barCode',
          value: '123456789012',
          height: 40,
          width: 2,
          displayValue: true,
          fontsize: 12,
        },
        {
          type: 'qrCode',
          value: 'https://example.com',
          height: 55,
          width: 55,
          position: 'center',
        },
      ];

      return await api.invoke('test-pos-printer-print', data, options);
    })) as PrintResult;

    expect(printResult.success).toBe(true);
    expect(printResult.error).toBeNull();
  });

  test('should handle table content', async () => {
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
          tableBody: [
            ['Product 1', '$10.00'],
            ['Product 2', '$15.00'],
            ['Product 3', '$20.00'],
          ],
          tableFooter: ['Total', '$45.00'],
          tableHeaderStyle: { backgroundColor: '#000', color: 'white' },
          tableBodyStyle: { border: '0.5px solid #ddd' },
          tableFooterStyle: { backgroundColor: '#000', color: 'white' },
        },
      ];

      return await api.invoke('test-pos-printer-print', data, options);
    })) as PrintResult;

    expect(printResult.success).toBe(true);
    expect(printResult.error).toBeNull();
  });

  test('should handle different page sizes', async () => {
    const pageSizes = ['80mm', '78mm', '76mm', '58mm', '57mm', '44mm'];

    for (const pageSize of pageSizes) {
      const printResult = (await window.evaluate(async (size) => {
        const api = globalThis.window.electronDemoAPI;

        const options = {
          preview: true,
          silent: true,
          margin: 'auto',
          copies: 1,
          pageSize: size,
        };

        const data = [
          {
            type: 'text',
            value: `Test print for ${size}`,
            style: { fontWeight: 'bold', textAlign: 'center' },
          },
        ];

        try {
          const result = await api.invoke('test-pos-printer-print', data, options);
          return { ...(result as object), pageSize: size };
        } catch (error) {
          return { success: false, error: (error as Error).message, pageSize: size };
        }
      }, pageSize)) as PrintResult;

      expect(printResult.success).toBe(true);
      expect(printResult.error).toBeNull();
    }
  });

  test('should handle custom page size object', async () => {
    const printResult = (await window.evaluate(async () => {
      const api = globalThis.window.electronDemoAPI;

      const options = {
        preview: true,
        silent: true,
        margin: 'auto',
        copies: 1,
        pageSize: { width: 300, height: 400 },
      };

      const data = [
        {
          type: 'text',
          value: 'Custom page size test',
          style: { fontWeight: 'bold', textAlign: 'center' },
        },
      ];

      return await api.invoke('test-pos-printer-print', data, options);
    })) as PrintResult;

    expect(printResult.success).toBe(true);
    expect(printResult.error).toBeNull();
  });
});
