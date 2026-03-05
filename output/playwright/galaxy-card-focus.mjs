import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 360, height: 740 } });
const page = await context.newPage();

await page.goto('http://localhost:3000/courses', { waitUntil: 'networkidle' });
await page.waitForTimeout(1200);

const card = page
  .locator('.group.relative.h-full.cursor-pointer.overflow-hidden')
  .filter({ hasText: 'OFF' })
  .first();

await card.scrollIntoViewIfNeeded();
await page.waitForTimeout(300);
await card.screenshot({ path: 'output/playwright/galaxy-offer-card-after.png' });

await browser.close();
