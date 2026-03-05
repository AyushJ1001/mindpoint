import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await context.newPage();

async function overflowReport(url, prefix) {
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  const report = await page.evaluate(() => {
    const width = window.innerWidth;
    const offenders = [];
    const describe = (el) => {
      const tag = el.tagName.toLowerCase();
      const id = el.id ? `#${el.id}` : '';
      const classes =
        typeof el.className === 'string'
          ? el.className
              .split(/\s+/)
              .filter(Boolean)
              .slice(0, 4)
              .map((c) => `.${c}`)
              .join('')
          : '';
      return `${tag}${id}${classes}`;
    };
    for (const el of Array.from(document.querySelectorAll('*'))) {
      const rect = el.getBoundingClientRect();
      if (!rect || rect.width === 0 || rect.height === 0) continue;
      if (rect.right > width + 1 || rect.left < -1) {
        offenders.push({
          description: describe(el),
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          width: Math.round(rect.width),
        });
      }
    }
    return {
      innerWidth: width,
      scrollWidth: document.documentElement.scrollWidth,
      bodyScrollWidth: document.body.scrollWidth,
      offenderCount: offenders.length,
      offenders: offenders.slice(0, 25),
    };
  });

  await page.screenshot({ path: `output/playwright/${prefix}-viewport.png`, fullPage: false });
  await page.screenshot({ path: `output/playwright/${prefix}-full.png`, fullPage: true });

  return report;
}

const courses = await overflowReport('http://localhost:3000/courses', 'audit-courses-before');
console.log('COURSES', JSON.stringify(courses, null, 2));

const home = await overflowReport('http://localhost:3000', 'audit-home-before');
console.log('HOME', JSON.stringify(home, null, 2));

const cartBtn = page.getByRole('button', { name: /cart|shopping cart|open cart/i }).first();
if (await cartBtn.isVisible().catch(() => false)) {
  await cartBtn.click();
  await page.waitForTimeout(700);
  await page.screenshot({ path: 'output/playwright/audit-cart-sheet-before.png', fullPage: false });
}

await page.goto('http://localhost:3000/cart', { waitUntil: 'networkidle' });
await page.waitForTimeout(900);
await page.screenshot({ path: 'output/playwright/audit-cart-page-before.png', fullPage: false });

await browser.close();
