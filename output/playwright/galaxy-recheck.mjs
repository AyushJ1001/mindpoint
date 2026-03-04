import { chromium, devices } from 'playwright';

const browser = await chromium.launch({ headless: true });
const device = devices['Galaxy S8'] ?? { viewport: { width: 360, height: 740 }, userAgent: 'Mozilla/5.0 (Linux; Android 8.0; SM-G955U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0 Mobile Safari/537.36' };
const context = await browser.newContext({ ...device });
const page = await context.newPage();

async function snap(path, fullPage = false) {
  await page.screenshot({ path, fullPage });
}

await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
await page.waitForTimeout(1200);
await snap('output/playwright/recheck-galaxy-home-top.png', false);
await snap('output/playwright/recheck-galaxy-home-full.png', true);

await page.goto('http://localhost:3000/courses', { waitUntil: 'networkidle' });
await page.waitForTimeout(1200);
await snap('output/playwright/recheck-galaxy-courses-top.png', false);
await snap('output/playwright/recheck-galaxy-courses-full.png', true);

const card = page.locator('.group.relative.h-full.cursor-pointer.overflow-hidden').first();
if (await card.count()) {
  await card.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await card.screenshot({ path: 'output/playwright/recheck-galaxy-course-card.png' });
}

const cartButton = page.getByRole('button', { name: /cart|shopping cart|open cart/i }).first();
if (await cartButton.isVisible().catch(() => false)) {
  await cartButton.click();
  await page.waitForTimeout(800);
  await snap('output/playwright/recheck-galaxy-cart-sheet.png', false);
}

await browser.close();
