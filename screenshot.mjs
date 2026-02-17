import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 1800 } });
await page.goto('http://localhost:5173/design-preview.html', { waitUntil: 'networkidle' });
await page.waitForTimeout(2000);
await page.screenshot({ path: '/home/user/sharons-kitchen/design-preview.png', fullPage: true });
await browser.close();
console.log('Screenshot saved!');
