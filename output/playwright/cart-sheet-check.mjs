import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await context.newPage();

await page.goto('http://localhost:3000/courses/worksheet', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(1200);

const addButtons = page.getByRole('button', { name: /add to cart/i });
const count = await addButtons.count();
if (count > 0) {
  await addButtons.first().click();
  await page.waitForTimeout(600);
}

await page.keyboard.press('Escape').catch(() => {});
await page.waitForTimeout(200);

const cartBtn = page.getByLabel('Open cart');
await cartBtn.click({ force: true });
await page.waitForTimeout(800);

const sheetStats = await page.evaluate(() => {
  const dialog = document.querySelector('[data-slot="sheet-content"]');
  if (!dialog) return null;
  const rect = dialog.getBoundingClientRect();
  return {
    left: Math.round(rect.left),
    right: Math.round(rect.right),
    width: Math.round(rect.width),
    viewport: window.innerWidth,
  };
});

console.log('SHEET', JSON.stringify(sheetStats));
await page.screenshot({ path: 'output/playwright/cart-sheet-with-item-before.png', fullPage: false });
await browser.close();
