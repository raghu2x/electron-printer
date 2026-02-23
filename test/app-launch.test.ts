import { _electron as electron, type ElectronApplication, type Page } from 'playwright';
import { test, expect } from '@playwright/test';

test.describe('Application Launch Tests', () => {
  let electronApp: ElectronApplication;
  let window: Page;

  test.beforeAll(async () => {
    electronApp = await electron.launch({
      args: ['./demo'],
      env: { ...process.env, NODE_ENV: 'test' },
    });
    window = await electronApp.firstWindow({ timeout: 60000 });
  });

  test.afterAll(async () => {
    await electronApp.close();
  });

  test('app should launch successfully', () => {
    expect(electronApp).toBeDefined();
    expect(window).toBeDefined();
  });

  test('window should have correct title', async () => {
    const title = await window.title();
    expect(title).toBe('Electron Pos Printer Demo');
  });

  test('window should have correct size', async () => {
    const bounds = await window.evaluate(() => ({
      width: globalThis.window.innerWidth,
      height: globalThis.window.innerHeight,
    }));
    expect(bounds.width).toBeGreaterThan(0);
    expect(bounds.height).toBeGreaterThan(0);
  });

  test('should load demo HTML correctly', async () => {
    await window.waitForLoadState('networkidle');
    const content = await window.content();
    expect(content).toContain('Electron POS Printer Demo');
    expect(content).toContain('Print Test Receipt');
  });

  test('should have electron APIs available', async () => {
    const hasElectronAPI = await window.evaluate(() => {
      const win = globalThis.window;
      return (
        typeof win.electronDemoAPI === 'object' &&
        typeof win.electronDemoAPI?.sendTestPrint === 'function' &&
        typeof win.electronDemoAPI?.invoke === 'function'
      );
    });
    expect(hasElectronAPI).toBe(true);
  });
});
