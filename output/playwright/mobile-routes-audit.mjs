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
  '/cart',
];

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await context.newPage();

for (const route of routes) {
  const url = `http://localhost:3000${route}`;
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  const report = await page.evaluate(() => {
    const width = window.innerWidth;
    const bad = [];
    for (const el of Array.from(document.querySelectorAll('*'))) {
      const rect = el.getBoundingClientRect();
      if (!rect || rect.width === 0 || rect.height === 0) continue;
      if (rect.right > width + 1 || rect.left < -1) {
        bad.push({
          tag: el.tagName.toLowerCase(),
          cls: typeof el.className === 'string' ? el.className.split(/\s+/).slice(0, 2).join('.') : '',
          left: Math.round(rect.left),
          right: Math.round(rect.right),
        });
      }
    }

    return {
      innerWidth: width,
      scrollWidth: document.documentElement.scrollWidth,
      bodyScrollWidth: document.body.scrollWidth,
      offenders: bad.length,
      sample: bad.slice(0, 8),
      docHeight: document.documentElement.scrollHeight,
    };
  });

  const key = route.replace(/\//g, '_').replace(/^_/, 'root');
  await page.screenshot({ path: `output/playwright/route-${key}-top-before.png`, fullPage: false });

  const scrollY = Math.min(2200, Math.max(0, report.docHeight - 844));
  await page.evaluate((y) => window.scrollTo(0, y), scrollY);
  await page.waitForTimeout(250);
  await page.screenshot({ path: `output/playwright/route-${key}-mid-before.png`, fullPage: false });

  console.log(route, JSON.stringify(report));
}

await browser.close();
