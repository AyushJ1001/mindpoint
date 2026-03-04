import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();

await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
await page.waitForTimeout(1000);
await page.screenshot({ path: 'output/playwright/desktop-home-overhaul.png', fullPage: false });

await page.goto('http://localhost:3000/courses', { waitUntil: 'networkidle' });
await page.waitForTimeout(1000);
await page.screenshot({ path: 'output/playwright/desktop-courses-overhaul.png', fullPage: false });

await page.goto('http://localhost:3000/courses/k5783bxf0az59mxta38adwmqex82784b', { waitUntil: 'networkidle' });
await page.waitForTimeout(1000);
await page.screenshot({ path: 'output/playwright/desktop-course-overhaul.png', fullPage: false });

await page.goto('http://localhost:3000/cart', { waitUntil: 'networkidle' });
await page.waitForTimeout(1000);
await page.screenshot({ path: 'output/playwright/desktop-cart-overhaul.png', fullPage: false });

await browser.close();
