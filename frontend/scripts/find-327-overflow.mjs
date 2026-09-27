import puppeteer from 'puppeteer-core';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE_URL = 'http://localhost:3000';

async function find327() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 320, height: 568, isMobile: true, hasTouch: true });
  await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 500));

  const result = await page.evaluate(() => {
    const docWidth = document.documentElement.clientWidth;
    const scrollWidth = document.documentElement.scrollWidth;
    const bodyScrollWidth = document.body.scrollWidth;

    const elementsWithRightPast320 = [];
    document.querySelectorAll('*').forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.right > docWidth) {
        elementsWithRightPast320.push({
          tag: el.tagName,
          class: el.className,
          id: el.id,
          right: rect.right,
          width: rect.width,
          scrollWidth: el.scrollWidth,
          text: el.textContent?.substring(0, 30),
        });
      }
    });

    return {
      docWidth,
      scrollWidth,
      bodyScrollWidth,
      elementsWithRightPast320,
    };
  });

  console.log('Result at 320px:', JSON.stringify(result, null, 2));

  await browser.close();
}

find327().catch(console.error);
