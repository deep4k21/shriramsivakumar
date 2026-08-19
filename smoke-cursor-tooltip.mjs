import { chromium } from 'playwright';
const shotDir = 'C:\\Users\\DEEPAK~1\\AppData\\Local\\Temp\\claude\\c--Own-Projects-ShriramSivakumar-Portfolio\\77d720b9-a1ff-4fbd-80d1-529058470eec\\scratchpad';

const browser = await chromium.launch({ args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });

await page.goto('http://localhost:5174', { waitUntil: 'networkidle' });
await page.waitForSelector('text=Shriram Sivakumar');
await page.evaluate(() => document.fonts.ready);

await page.evaluate(() => document.getElementById('about')?.scrollIntoView({ block: 'end' }));
await page.waitForTimeout(800);

const icon = page.locator('img[alt="Photoshop"]').first();
await icon.hover();
await page.waitForTimeout(100);
await icon.hover({ position: { x: 5, y: 30 } });
await page.waitForTimeout(300);
await page.screenshot({ path: `${shotDir}/ct-1-tooltip.png` });

const debug = await page.evaluate(() => {
  const img = document.querySelector('img[alt="Photoshop"]');
  const wrapper = img.parentElement;
  const tooltip = wrapper.querySelector('span');
  return {
    wrapperHTML: wrapper.outerHTML.slice(0, 300),
    tooltipFound: !!tooltip,
  };
});
console.log(JSON.stringify(debug, null, 2));

console.log('ERRORS:', JSON.stringify(errors));
await browser.close();
