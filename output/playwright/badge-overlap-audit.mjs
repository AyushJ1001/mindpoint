import { chromium } from 'playwright';

const routes = [
  '/courses',
  '/courses/certificate',
  '/courses/diploma',
  '/courses/internship',
  '/courses/masterclass',
  '/courses/pre-recorded',
  '/courses/therapy',
  '/courses/supervised',
  '/courses/worksheet',
  '/courses/resume-studio',
];

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 360, height: 740 } });
const page = await context.newPage();

for (const route of routes) {
  const url = `http://localhost:3000${route}`;
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);

  const result = await page.evaluate(() => {
    const cards = Array.from(
      document.querySelectorAll(
        '.group.relative.h-full.cursor-pointer.overflow-hidden',
      ),
    );

    const overlaps = [];
    cards.forEach((card, index) => {
      const left = card.querySelector(':scope > div.absolute.top-3.left-3');
      const right = card.querySelector(':scope > div.absolute.top-3.right-3');
      if (!left || !right) return;
      const l = left.getBoundingClientRect();
      const r = right.getBoundingClientRect();
      const intersects = r.left < l.right + 4 && r.right > l.left && r.bottom > l.top;
      if (intersects) {
        overlaps.push({
          card: index,
          left: Math.round(l.left),
          leftRight: Math.round(l.right),
          rightLeft: Math.round(r.left),
          rightRight: Math.round(r.right),
          leftText: left.textContent?.trim()?.slice(0, 50) || '',
          rightText: right.textContent?.trim()?.slice(0, 60) || '',
        });
      }
    });

    return {
      cards: cards.length,
      overlaps,
      overlapCount: overlaps.length,
      width: window.innerWidth,
    };
  });

  console.log(route, JSON.stringify(result));
}

await browser.close();
