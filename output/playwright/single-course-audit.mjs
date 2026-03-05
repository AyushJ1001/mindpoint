import { chromium, devices } from 'playwright';

const url = 'http://localhost:3000/courses/k5783bxf0az59mxta38adwmqex82784b';
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ ...(devices['Galaxy S8'] || { viewport: { width: 360, height: 740 } }) });
const page = await context.newPage();

await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForTimeout(1800);

const report = await page.evaluate(() => {
  const width = window.innerWidth;
  const offenders = [];
  const describe = (el) => {
    const tag = el.tagName.toLowerCase();
    const id = el.id ? `#${el.id}` : '';
    const cls = typeof el.className === 'string'
      ? el.className.split(/\s+/).filter(Boolean).slice(0, 6).join('.')
      : '';
    return `${tag}${id}${cls ? '.' + cls : ''}`;
  };

  for (const el of Array.from(document.querySelectorAll('*'))) {
    const rect = el.getBoundingClientRect();
    if (!rect || rect.width <= 0 || rect.height <= 0) continue;
    if (rect.left < -1 || rect.right > width + 1) {
      offenders.push({
        desc: describe(el),
        left: Math.round(rect.left),
        right: Math.round(rect.right),
        width: Math.round(rect.width),
        text: (el.textContent || '').trim().slice(0, 100),
      });
    }
  }

  return {
    location: window.location.href,
    title: document.title,
    innerWidth: width,
    scrollWidth: document.documentElement.scrollWidth,
    bodyScrollWidth: document.body.scrollWidth,
    offenders: offenders.slice(0, 40),
  };
});

console.log(JSON.stringify(report, null, 2));

await page.screenshot({ path: 'output/playwright/single-course-galaxy-top.png', fullPage: false });
await page.screenshot({ path: 'output/playwright/single-course-galaxy-full.png', fullPage: true });

const cardShots = page.locator('.group.relative.h-full.cursor-pointer.overflow-hidden');
const count = await cardShots.count();
for (let i = 0; i < Math.min(count, 6); i++) {
  const card = cardShots.nth(i);
  await card.scrollIntoViewIfNeeded();
  await page.waitForTimeout(250);
  await card.screenshot({ path: `output/playwright/single-course-card-${i + 1}.png` });
}

await browser.close();
