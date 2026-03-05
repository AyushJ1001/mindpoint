import { chromium, devices } from 'playwright';

const routes = [
  '/',
  '/about',
  '/contact',
  '/privacy',
  '/refund',
  '/toc',
  '/careers',
  '/server',
  '/courses',
  '/courses/certificate',
  '/courses/diploma',
  '/courses/internship',
  '/courses/masterclass',
  '/courses/pre-recorded',
  '/courses/therapy',
  '/courses/supervised',
  '/courses/resume-studio',
  '/courses/worksheet',
  '/courses/k5783bxf0az59mxta38adwmqex82784b',
  '/cart',
  '/account',
];

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ ...(devices['Galaxy S8'] || { viewport: { width: 360, height: 740 } }) });
const page = await context.newPage();

for (const route of routes) {
  const url = `http://localhost:3000${route}`;
  try {
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(900);

    const report = await page.evaluate(() => {
      const width = window.innerWidth;
      const offenders = [];

      const isDecorative = (el) => {
        const cn = typeof el.className === 'string' ? el.className : '';
        return /blur|absolute|pointer-events-none/.test(cn);
      };

      const describe = (el) => {
        const tag = el.tagName.toLowerCase();
        const cls = typeof el.className === 'string'
          ? el.className.split(/\s+/).filter(Boolean).slice(0, 5).join('.')
          : '';
        return `${tag}${cls ? '.' + cls : ''}`;
      };

      for (const el of Array.from(document.querySelectorAll('*'))) {
        const rect = el.getBoundingClientRect();
        if (!rect || rect.width <= 0 || rect.height <= 0) continue;
        if (isDecorative(el)) continue;
        if (rect.left < -1 || rect.right > width + 1) {
          offenders.push({
            desc: describe(el),
            left: Math.round(rect.left),
            right: Math.round(rect.right),
            width: Math.round(rect.width),
            text: (el.textContent || '').trim().slice(0, 70),
          });
        }
      }

      return {
        path: window.location.pathname,
        title: document.title,
        innerWidth: width,
        scrollWidth: document.documentElement.scrollWidth,
        bodyScrollWidth: document.body.scrollWidth,
        offenders: offenders.slice(0, 8),
        offenderCount: offenders.length,
      };
    });

    console.log(JSON.stringify(report));
    await page.screenshot({ path: `output/playwright/audit-${route.replace(/\//g, '_') || 'home'}-top.png`, fullPage: false });
  } catch (error) {
    console.log(JSON.stringify({ route, error: String(error) }));
  }
}

await browser.close();
