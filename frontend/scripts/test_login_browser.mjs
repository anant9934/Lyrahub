import puppeteer from 'puppeteer-core';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

async function test() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
  page.on('request', req => {
    if (req.url().includes('api/v1') || req.url().includes('login') || req.url().includes('auth')) {
      console.log('API REQ:', req.method(), req.url());
    }
  });
  page.on('response', res => {
    if (res.url().includes('api/v1') || res.url().includes('login') || res.url().includes('auth')) {
      console.log('API RES:', res.status(), res.url());
    }
  });

  console.log('Navigating to /login...');
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle2' });

  console.log('Typing credentials into form...');
  await page.focus('#email');
  await page.type('#email', 'student@aiml.hub');
  await page.focus('#password');
  await page.type('#password', 'student123');

  const creds = await page.evaluate(() => {
    return {
      email: document.querySelector('#email')?.value,
      pwd: document.querySelector('#password')?.value
    };
  });
  console.log('Filled credentials:', creds.email, creds.pwd ? '***' : 'EMPTY');

  console.log('Submitting login form...');
  const t0 = Date.now();
  await page.click('button[type="submit"]');

  console.log('Waiting for URL change or response...');
  try {
    await page.waitForFunction(() => window.location.pathname.includes('/dashboard'), { timeout: 25000 });
    console.log(`Successfully reached /dashboard in ${Date.now() - t0}ms! Current URL:`, page.url());
  } catch (e) {
    console.log('Wait failed:', e.message, 'Current URL:', page.url());
    const errText = await page.evaluate(() => document.body.innerText.slice(0, 500));
    console.log('Page body snippet:', errText);
  }

  await browser.close();
}

test();
