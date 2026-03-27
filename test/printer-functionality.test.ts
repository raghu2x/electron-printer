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
      args: ['./demo', '--no-sandbox', '--disable-setuid-sandbox'],
      env: { ...process.env, NODE_ENV: 'test' },
    });
    window = await electronApp.firstWindow({ timeout: 60000 });
    await window.waitForLoadState('networkidle');
  });

  test.afterAll(async () => {
    await electronApp.close();
  });

  test('should have printer available in main process', async () => {
    const checkResult = (await window.evaluate(async () => {
      const api = globalThis.window.electronDemoAPI;
      return await api.invoke('test-printer-available');
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

      return await api.invoke('test-printer-print', data, options);
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

      return await api.invoke('test-printer-print', data, options);
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

      return await api.invoke('test-printer-print', data, options);
    })) as PrintResult;

    expect(printResult.success).toBe(true);
    expect(printResult.error).toBeNull();
  });

  test('should handle 58mm page size', async () => {
    const printResult = (await window.evaluate(async () => {
      const api = globalThis.window.electronDemoAPI;
      const options = { preview: true, silent: true, copies: 1, pageSize: '58mm' };
      const data = [{ type: 'text', value: 'Test 58mm', style: { textAlign: 'center' } }];
      return await api.invoke('test-printer-print', data, options);
    })) as PrintResult;

    expect(printResult.success).toBe(true);
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

      return await api.invoke('test-printer-print', data, options);
    })) as PrintResult;

    expect(printResult.success).toBe(true);
    expect(printResult.error).toBeNull();
  });

  test('should handle multiple print items in sequence', async () => {
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
          value: 'RECEIPT',
          style: { fontWeight: 'bold', textAlign: 'center', fontSize: '24px' },
        },
        {
          type: 'text',
          value: '------------------------',
          style: { textAlign: 'center' },
        },
        {
          type: 'table',
          tableHeader: ['Item', 'Qty', 'Price'],
          tableBody: [
            ['Product A', '2', '$20.00'],
            ['Product B', '1', '$15.00'],
          ],
          tableFooter: ['Total', '', '$35.00'],
        },
        {
          type: 'qrCode',
          value: 'https://receipt.example.com/12345',
          width: '60',
          position: 'center',
        },
        {
          type: 'barCode',
          value: '9876543210',
          height: '30',
          width: '2',
          displayValue: true,
          position: 'center',
        },
      ];

      return await api.invoke('test-printer-print', data, options);
    })) as PrintResult;

    expect(printResult.success).toBe(true);
    expect(printResult.error).toBeNull();
  });

  test('should handle table with typed cells', async () => {
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
          tableHeader: ['Product', 'Details'],
          tableBody: [
            [
              { type: 'text', value: 'Item 1' },
              { type: 'text', value: '$10.00', style: { fontWeight: 'bold' } },
            ],
            [
              { type: 'text', value: 'Item 2' },
              { type: 'text', value: '$20.00', style: { fontWeight: 'bold' } },
            ],
          ],
        },
      ];

      return await api.invoke('test-printer-print', data, options);
    })) as PrintResult;

    expect(printResult.success).toBe(true);
    expect(printResult.error).toBeNull();
  });
});
