import { chromium } from 'playwright';

const url = 'http://localhost:3000/courses/k5783bxf0az59mxta38adwmqex82784b';
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 360, height: 740 } });
const page = await context.newPage();

await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForTimeout(1200);

const result = await page.evaluate(() => {
  const cards = Array.from(document.querySelectorAll('[class*="cursor-pointer"][class*="overflow-hidden"]'));
  const rows = [];

  for (const [index, card] of cards.entries()) {
    const row = card.querySelector(':scope > div[class*="absolute"][class*="inset-x-3"][class*="top-3"]');
    if (!row) continue;

    const badges = Array.from(row.querySelectorAll('[data-slot="badge"], .badge, span, div')).filter((el) => {
      const rect = el.getBoundingClientRect();
      return rect.width > 24 && rect.height > 10;
    });

    const rects = badges.map((el) => {
      const r = el.getBoundingClientRect();
      return {
        left: Math.round(r.left),
        right: Math.round(r.right),
        top: Math.round(r.top),
        bottom: Math.round(r.bottom),
        text: (el.textContent || '').trim().slice(0, 40),
      };
    });

    let overlaps = 0;
    for (let i = 0; i < rects.length; i++) {
      for (let j = i + 1; j < rects.length; j++) {
        const a = rects[i];
        const b = rects[j];
        const intersects = a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
        if (intersects) overlaps++;
      }
    }

    rows.push({ index, badgeCount: rects.length, overlaps, rects });
  }

  return {
    width: window.innerWidth,
    route: window.location.pathname,
    checkedRows: rows.length,
    rows,
  };
});

console.log(JSON.stringify(result, null, 2));

// capture screenshots around likely recommendation cards
await page.screenshot({ path: 'output/playwright/single-course-after-top-v2.png', fullPage: false });
const sections = ['Upcoming Courses', 'Related', 'More'];
for (const name of sections) {
  const heading = page.getByText(name, { exact: false }).first();
  if (await heading.isVisible().catch(() => false)) {
    await heading.scrollIntoViewIfNeeded();
    await page.waitForTimeout(250);
    await page.screenshot({ path: `output/playwright/single-course-after-${name.replace(/\s+/g, '-').toLowerCase()}.png`, fullPage: false });
  }
}

await browser.close();
