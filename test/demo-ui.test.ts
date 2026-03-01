import { _electron as electron, type ElectronApplication, type Page } from 'playwright';
import { test, expect } from '@playwright/test';

test.describe('Demo UI Tests', () => {
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

  test('should display demo title', async () => {
    const title = await window.locator('h1.title').textContent();
    expect(title).toBe('Electron Printer Demo');
  });

  test('should have print test button', async () => {
    const button = window.locator('button.btn').first();
    await expect(button).toBeVisible();

    const buttonText = await button.textContent();
    expect(buttonText).toBe('Print Test Receipt');
  });

  test('button should have correct styling', async () => {
    const button = window.locator('button.btn').first();
    const styles = await button.evaluate((el) => {
      const computed = globalThis.window.getComputedStyle(el);
      return {
        backgroundColor: computed.backgroundColor,
        color: computed.color,
        fontSize: computed.fontSize,
        padding: computed.padding,
        borderRadius: computed.borderRadius,
      };
    });

    expect(styles.backgroundColor).toBe('rgb(60, 175, 80)');
    expect(styles.color).toBe('rgb(255, 255, 255)');
    expect(styles.fontSize).toBe('14px');
  });

  test('should be able to click print button', async () => {
    const button = window.locator('button.btn').first();

    // Listen for the IPC message
    electronApp
      .evaluate(({ ipcMain }) => {
        return new Promise((resolve) => {
          ipcMain.once('test-print', () => {
            resolve('test-print-received');
          });
          setTimeout(() => resolve('timeout'), 5000);
        });
      })
      .then(() => {
        // IPC message processed
      });

    await button.click();

    // Wait a bit for IPC message to be processed
    await window.waitForTimeout(1000);

    // The click should trigger the sendTestPrint function
    // We'll verify this in the IPC communication tests
  });

  test('should have working JavaScript functions', async () => {
    const hasSendTestPrint = await window.evaluate(() => {
      return typeof globalThis.window.electronDemoAPI?.sendTestPrint === 'function';
    });
    expect(hasSendTestPrint).toBe(true);
  });
});
