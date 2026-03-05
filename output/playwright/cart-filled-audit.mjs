import { chromium, devices } from 'playwright';

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ ...(devices['Galaxy S8'] || { viewport: { width: 360, height: 740 } }) });
const page = await context.newPage();

await page.goto('http://localhost:3000/courses/k5783bxf0az59mxta38adwmqex82784b', { waitUntil: 'networkidle' });
await page.waitForTimeout(1000);
const addBtn = page.getByRole('button', { name: /add to cart|added to cart|in cart/i }).first();
if (await addBtn.isVisible().catch(() => false)) {
  await addBtn.click();
  await page.waitForTimeout(600);
}

await page.goto('http://localhost:3000/cart', { waitUntil: 'networkidle' });
await page.waitForTimeout(1200);
await page.screenshot({ path: 'output/playwright/cart-filled-top-before-fix.png', fullPage: false });
await page.screenshot({ path: 'output/playwright/cart-filled-full-before-fix.png', fullPage: true });

await page.mouse.wheel(0, 650);
await page.waitForTimeout(400);
await page.screenshot({ path: 'output/playwright/cart-filled-mid-before-fix.png', fullPage: false });

const report = await page.evaluate(() => {
  const width = window.innerWidth;
  const offenders = [];
  for (const el of Array.from(document.querySelectorAll('*'))) {
    const rect = el.getBoundingClientRect();
    if (!rect || rect.width <= 0 || rect.height <= 0) continue;
    if (rect.left < -1 || rect.right > width + 1) {
      offenders.push({ tag: el.tagName.toLowerCase(), cls: typeof el.className === 'string' ? el.className.split(/\s+/).slice(0,4).join('.') : '', left: Math.round(rect.left), right: Math.round(rect.right), width: Math.round(rect.width) });
    }
  }
  return { innerWidth: width, scrollWidth: document.documentElement.scrollWidth, bodyScrollWidth: document.body.scrollWidth, offenderCount: offenders.length, offenders: offenders.slice(0, 10) };
});

console.log(JSON.stringify(report, null, 2));
await browser.close();
