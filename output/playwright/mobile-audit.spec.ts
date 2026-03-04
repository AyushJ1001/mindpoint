import { test } from 'playwright/test';

function describeElement(el: Element): string {
  const tag = el.tagName.toLowerCase();
  const id = el.id ? `#${el.id}` : '';
  const className =
    typeof (el as HTMLElement).className === 'string'
      ? (el as HTMLElement).className
          .split(/\s+/)
          .filter(Boolean)
          .slice(0, 3)
          .map((c) => `.${c}`)
          .join('')
      : '';
  return `${tag}${id}${className}`;
}

test('mobile audit', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });

  await page.goto('http://localhost:3000/courses', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);

  const overflow = await page.evaluate(() => {
    const width = window.innerWidth;
    const offenders: Array<{ description: string; left: number; right: number; width: number }> = [];
    const all = Array.from(document.querySelectorAll('*'));

    const describe = (el: Element) => {
      const tag = el.tagName.toLowerCase();
      const id = el.id ? `#${el.id}` : '';
      const className =
        typeof (el as HTMLElement).className === 'string'
          ? (el as HTMLElement).className
              .split(/\s+/)
              .filter(Boolean)
              .slice(0, 3)
              .map((c) => `.${c}`)
              .join('')
          : '';
      return `${tag}${id}${className}`;
    };

    for (const el of all) {
      const rect = (el as HTMLElement).getBoundingClientRect();
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
      offenders: offenders.slice(0, 20),
      offenderCount: offenders.length,
    };
  });

  console.log('COURSES_OVERFLOW', JSON.stringify(overflow, null, 2));

  await page.screenshot({ path: 'output/playwright/mobile-courses-viewport-before.png', fullPage: false });
  await page.screenshot({ path: 'output/playwright/mobile-courses-full-before.png', fullPage: true });

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'output/playwright/mobile-home-viewport-before.png', fullPage: false });

  const cartButton = page.getByRole('button', { name: /open cart|shopping cart|cart/i }).first();
  if (await cartButton.isVisible().catch(() => false)) {
    await cartButton.click();
    await page.waitForTimeout(700);
    await page.screenshot({ path: 'output/playwright/mobile-cart-sheet-before.png', fullPage: false });
  }
});
