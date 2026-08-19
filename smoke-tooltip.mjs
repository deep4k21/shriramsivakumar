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
await page.screenshot({ path: `${shotDir}/tt-1-resized.png` });

// hover the first toolkit icon to trigger tooltip
const firstIcon = page.locator('img[alt="Figma"]').first();
await firstIcon.hover();
await page.waitForTimeout(300);
await page.screenshot({ path: `${shotDir}/tt-2-tooltip.png` });

console.log('ERRORS:', JSON.stringify(errors));
await browser.close();
