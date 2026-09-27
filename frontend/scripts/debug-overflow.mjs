import puppeteer from 'puppeteer-core';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE_URL = 'http://localhost:3000';

async function debugOverflow() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  // Test 1: Dashboard at 320px
  console.log('\n--- Checking /dashboard at 320px ---');
  await page.setViewport({ width: 320, height: 568 });
  await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'domcontentloaded' });
  await new Promise((r) => setTimeout(r, 400));

  const dashboardOverflowElements = await page.evaluate(() => {
    const docWidth = document.documentElement.clientWidth;
    const overflowing = [];
    const all = document.querySelectorAll('*');
    for (const el of all) {
      const rect = el.getBoundingClientRect();
      if (rect.right > docWidth + 1 || el.scrollWidth > docWidth + 1) {
        // Exclude html and body
        if (el !== document.documentElement && el !== document.body) {
          overflowing.push({
            tag: el.tagName,
            className: el.className ? String(el.className).substring(0, 100) : '',
            id: el.id,
            rectRight: Math.round(rect.right),
            scrollWidth: el.scrollWidth,
            clientWidth: el.clientWidth,
          });
        }
      }
    }
    return overflowing.slice(0, 10);
  });

  console.log('Dashboard overflowing elements at 320px:', dashboardOverflowElements);

  // Test 2: Programs at 768px
  console.log('\n--- Checking /programs at 768px ---');
  await page.setViewport({ width: 768, height: 1024 });
  await page.goto(`${BASE_URL}/programs`, { waitUntil: 'domcontentloaded' });
  await new Promise((r) => setTimeout(r, 400));

  const programsOverflowElements = await page.evaluate(() => {
    const docWidth = document.documentElement.clientWidth;
    const overflowing = [];
    const all = document.querySelectorAll('*');
    for (const el of all) {
      const rect = el.getBoundingClientRect();
      if (rect.right > docWidth + 1 || el.scrollWidth > docWidth + 1) {
        if (el !== document.documentElement && el !== document.body) {
          overflowing.push({
            tag: el.tagName,
            className: el.className ? String(el.className).substring(0, 100) : '',
            id: el.id,
            rectRight: Math.round(rect.right),
            scrollWidth: el.scrollWidth,
            clientWidth: el.clientWidth,
          });
        }
      }
    }
    return overflowing.slice(0, 10);
  });

  console.log('Programs overflowing elements at 768px:', programsOverflowElements);

  await browser.close();
}

debugOverflow().catch(console.error);
