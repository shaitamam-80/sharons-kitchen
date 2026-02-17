import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 420, height: 900 } });
await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
await page.waitForTimeout(2000);
// Take viewport-only screenshot (not full page) to see header + cards
await page.screenshot({ path: '/home/user/sharons-kitchen/ocean-breeze-preview.png' });
await browser.close();
console.log('Screenshot saved!');
