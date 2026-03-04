import { chromium, devices } from 'playwright';

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ ...(devices['Galaxy S8'] || { viewport: { width: 360, height: 740 } }) });
const page = await context.newPage();

await page.goto('http://localhost:3000/courses/k5783bxf0az59mxta38adwmqex82784b', { waitUntil: 'networkidle' });
await page.waitForTimeout(1200);

const addBtn = page.getByRole('button', { name: /add to cart|added to cart|in cart/i }).first();
if (await addBtn.isVisible().catch(() => false)) {
  await addBtn.click();
  await page.waitForTimeout(600);
}

const navCart = page.getByRole('button', { name: /open cart/i }).first();
await navCart.click();
await page.waitForTimeout(700);

await page.screenshot({ path: 'output/playwright/repro-cart-sheet-open-before-checkout.png', fullPage: false });

const checkoutLink = page.getByRole('link', { name: /proceed to checkout/i }).first();
if (await checkoutLink.count()) {
  await checkoutLink.scrollIntoViewIfNeeded();
  await page.waitForTimeout(100);
  await checkoutLink.click();
  await page.waitForTimeout(1000);
}

const state = await page.evaluate(() => {
  const title = document.title;
  const path = window.location.pathname;
  const openSheetCount = document.querySelectorAll('[data-state="open"][data-slot="sheet-content"]').length;
  return { path, title, openSheetCount, viewport: { w: window.innerWidth, h: window.innerHeight } };
});

console.log(JSON.stringify(state, null, 2));
await page.screenshot({ path: 'output/playwright/repro-after-checkout-click.png', fullPage: false });

await browser.close();
