import { chromium } from 'playwright';

const browser = await chromium.launch({ args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

await page.goto('http://localhost:5174', { waitUntil: 'networkidle' });
await page.waitForSelector('text=Shriram Sivakumar');

await page.evaluate(() => document.getElementById('portfolio')?.scrollIntoView());
await page.waitForTimeout(1000);
await page.mouse.wheel(0, 500);
await page.waitForTimeout(800);

const connectBtn = page.locator('aside button', { hasText: "Let" }).first();
await connectBtn.click({ force: true });
await page.waitForTimeout(500);

const info = await page.evaluate(() => {
  const overlay = document.querySelector('[class*="z-70"]');
  const panel = overlay ? overlay.firstElementChild : null;
  if (!panel) return { found: false, overlayFound: !!overlay };
  const cs = getComputedStyle(panel);
  return {
    found: true,
    tag: panel.tagName,
    className: panel.className,
    backdropFilter: cs.backdropFilter,
    webkitBackdropFilter: cs.webkitBackdropFilter,
    backgroundImage: cs.backgroundImage,
    backgroundColor: cs.backgroundColor,
  };
});
console.log(JSON.stringify(info, null, 2));

// Also check via browser engine/version, since backdrop-filter support varies
const ua = await page.evaluate(() => navigator.userAgent);
console.log('UA:', ua);

await page.screenshot({ path: 'C:\\Users\\DEEPAK~1\\AppData\\Local\\Temp\\claude\\c--Own-Projects-ShriramSivakumar-Portfolio\\77d720b9-a1ff-4fbd-80d1-529058470eec\\scratchpad\\diagnose-connect.png' });

await browser.close();
