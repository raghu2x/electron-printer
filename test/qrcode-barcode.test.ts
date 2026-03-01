import { _electron as electron, type ElectronApplication, type Page } from 'playwright';
import { test, expect } from '@playwright/test';

interface PrintResult {
  success: boolean;
  error: string | null;
}

test.describe('QR Code and Barcode Tests', () => {
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

  test('should handle QR code with left position', async () => {
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
          type: 'qrCode',
          value: 'https://example.com',
          width: '55',
          position: 'left',
        },
      ];

      return await api.invoke('test-printer-print', data, options);
    })) as PrintResult;

    expect(printResult.success).toBe(true);
    expect(printResult.error).toBeNull();
  });

  test('should handle QR code with center position', async () => {
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
          type: 'qrCode',
          value: 'https://example.com',
          width: '55',
          position: 'center',
        },
      ];

      return await api.invoke('test-printer-print', data, options);
    })) as PrintResult;

    expect(printResult.success).toBe(true);
    expect(printResult.error).toBeNull();
  });

  test('should handle QR code with right position', async () => {
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
          type: 'qrCode',
          value: 'https://example.com',
          width: '55',
          position: 'right',
        },
      ];

      return await api.invoke('test-printer-print', data, options);
    })) as PrintResult;

    expect(printResult.success).toBe(true);
    expect(printResult.error).toBeNull();
  });

  test('should handle QR code with custom width', async () => {
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
          type: 'qrCode',
          value: 'Custom QR Code',
          width: '100',
          position: 'center',
        },
      ];

      return await api.invoke('test-printer-print', data, options);
    })) as PrintResult;

    expect(printResult.success).toBe(true);
    expect(printResult.error).toBeNull();
  });

  test('should handle QR code with style', async () => {
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
          type: 'qrCode',
          value: 'Styled QR Code',
          width: '80',
          position: 'center',
          style: { marginTop: '10px', marginBottom: '10px' },
        },
      ];

      return await api.invoke('test-printer-print', data, options);
    })) as PrintResult;

    expect(printResult.success).toBe(true);
    expect(printResult.error).toBeNull();
  });

  test('should handle barcode with left position', async () => {
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
          type: 'barCode',
          value: '1234567890',
          height: '40',
          width: '2',
          displayValue: true,
          position: 'left',
        },
      ];

      return await api.invoke('test-printer-print', data, options);
    })) as PrintResult;

    expect(printResult.success).toBe(true);
    expect(printResult.error).toBeNull();
  });

  test('should handle barcode with center position', async () => {
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
          type: 'barCode',
          value: '1234567890',
          height: '40',
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

  test('should handle barcode with right position', async () => {
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
          type: 'barCode',
          value: '1234567890',
          height: '40',
          width: '2',
          displayValue: true,
          position: 'right',
        },
      ];

      return await api.invoke('test-printer-print', data, options);
    })) as PrintResult;

    expect(printResult.success).toBe(true);
    expect(printResult.error).toBeNull();
  });

  test('should handle empty barcode value gracefully', async () => {
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
          type: 'barCode',
          value: '',
          height: 40,
          width: 2,
          displayValue: true,
        },
      ];

      return await api.invoke('test-printer-print', data, options);
    })) as PrintResult;

    expect(printResult.success).toBe(true);
  });
});
