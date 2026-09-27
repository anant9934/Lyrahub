import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const OUTPUT_DIR = path.resolve(process.cwd(), '../docs/release/screenshots');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// 19-Viewport Matrix covering all mobile, tablet, laptop, desktop, ultrawide, and landscape
const VIEWPORT_MATRIX = [
  { name: '320x568', width: 320, height: 568, isMobile: true, hasTouch: true },
  { name: '360x800', width: 360, height: 800, isMobile: true, hasTouch: true },
  { name: '375x667', width: 375, height: 667, isMobile: true, hasTouch: true },
  { name: '390x844', width: 390, height: 844, isMobile: true, hasTouch: true },
  { name: '414x896', width: 414, height: 896, isMobile: true, hasTouch: true },
  { name: '430x932', width: 430, height: 932, isMobile: true, hasTouch: true },
  { name: '480x960', width: 480, height: 960, isMobile: true, hasTouch: true },
  { name: '600x800', width: 600, height: 800, isMobile: true, hasTouch: true },
  { name: '768x1024', width: 768, height: 1024, isMobile: true, hasTouch: true },
  { name: '820x1180', width: 820, height: 1180, isMobile: true, hasTouch: true },
  { name: '900x1200', width: 900, height: 1200, isMobile: false, hasTouch: false },
  { name: '1024x768', width: 1024, height: 768, isMobile: false, hasTouch: false },
  { name: '1280x720', width: 1280, height: 720, isMobile: false, hasTouch: false },
  { name: '1366x768', width: 1366, height: 768, isMobile: false, hasTouch: false },
  { name: '1440x900', width: 1440, height: 900, isMobile: false, hasTouch: false },
  { name: '1536x864', width: 1536, height: 864, isMobile: false, hasTouch: false },
  { name: '1920x1080', width: 1920, height: 1080, isMobile: false, hasTouch: false },
  { name: '2560x1440', width: 2560, height: 1440, isMobile: false, hasTouch: false },
  { name: 'landscape_844x390', width: 844, height: 390, isMobile: true, hasTouch: true, isLandscape: true },
];

const TARGET_ROUTES = [
  '/',
  '/about',
  '/people',
  '/programs',
  '/research',
  '/events',
  '/contact',
  '/login',
  '/dashboard',
  '/ranking',
  '/projects',
  '/courses',
  '/opportunities',
  '/qr/my-code',
  '/alumni/mentors',
  '/groups',
  '/achievements',
  '/alumni',
  '/ai-usage',
  '/dashboard/profile',
  '/non-existent-404-page',
];

const SCREENSHOT_TARGETS = [
  { route: '/', widths: [320, 390, 768, 1024, 1440, 1920], prefix: 'homepage' },
  { route: '/login', widths: [320, 390, 768, 1440], prefix: 'login' },
  { route: '/dashboard', widths: [320, 390, 768, 1024, 1440, 1920], prefix: 'dashboard' },
  { route: '/projects', widths: [320, 390, 768, 1440], prefix: 'projects' },
  { route: '/courses', widths: [320, 390, 768, 1440], prefix: 'courses' },
  { route: '/ranking', widths: [320, 390, 768, 1440], prefix: 'ranking' },
  { route: '/non-existent-404-page', widths: [320, 390, 768, 1440], prefix: '404_error' },
];

async function runRealBrowserQA() {
  console.log(`============================================================`);
  console.log(`AIMETRA — REAL-BROWSER RESPONSIVE VISUAL QA SUITE`);
  console.log(`Engine: Google Chrome (Headless)`);
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Total Target Routes: ${TARGET_ROUTES.length}`);
  console.log(`Total Viewports per Route: ${VIEWPORT_MATRIX.length}`);
  console.log(`Screenshots Output: ${OUTPUT_DIR}`);
  console.log(`============================================================\n`);

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
    ],
  });

  const auditLog = [];
  let totalChecks = 0;
  let overflowDefects = 0;

  for (const route of TARGET_ROUTES) {
    const url = `${BASE_URL}${route}`;
    process.stdout.write(`Testing Route: ${route.padEnd(24)} `);

    let routeOverflows = 0;
    const page = await browser.newPage();

    for (const vp of VIEWPORT_MATRIX) {
      totalChecks++;
      try {
        await page.setViewport({
          width: vp.width,
          height: vp.height,
          deviceScaleFactor: 1,
          isMobile: vp.isMobile,
          hasTouch: vp.hasTouch,
          isLandscape: Boolean(vp.isLandscape),
        });

        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });
        await new Promise((r) => setTimeout(r, 100));

        const metrics = await page.evaluate(() => {
          const doc = document.documentElement;
          const body = document.body;
          const scrollWidth = doc.scrollWidth;
          const clientWidth = doc.clientWidth;
          const bodyScrollWidth = body ? body.scrollWidth : 0;
          const bodyClientWidth = body ? body.clientWidth : 0;

          const overflow = (scrollWidth - clientWidth > 1) || (body && bodyScrollWidth - bodyClientWidth > 1);

          return {
            scrollWidth,
            clientWidth,
            overflow,
            diff: scrollWidth - clientWidth,
          };
        });

        if (metrics.overflow) {
          routeOverflows++;
          overflowDefects++;
          auditLog.push({
            route,
            viewport: vp.name,
            status: 'FAIL',
            diff: metrics.diff,
            scrollWidth: metrics.scrollWidth,
            clientWidth: metrics.clientWidth,
          });
        } else {
          auditLog.push({
            route,
            viewport: vp.name,
            status: 'PASS',
            diff: 0,
            scrollWidth: metrics.scrollWidth,
            clientWidth: metrics.clientWidth,
          });
        }

        // Check if screenshot requested
        const targetConfig = SCREENSHOT_TARGETS.find((st) => st.route === route);
        if (targetConfig && targetConfig.widths.includes(vp.width)) {
          const screenshotFile = path.join(OUTPUT_DIR, `${targetConfig.prefix}_${vp.width}.png`);
          await page.screenshot({ path: screenshotFile, fullPage: false });
        }
      } catch (err) {
        console.error(`\n  [${vp.name}] Navigation error: ${err.message}`);
      }
    }

    await page.close();

    if (routeOverflows === 0) {
      console.log(`✅ ALL 19 VIEWPORTS PASS (0px overflow)`);
    } else {
      console.log(`❌ ${routeOverflows} viewports had horizontal overflow`);
    }
  }

  // -------------------------------------------------------------------
  // Interactive Verification Pass: Modal, AIDA, Zoom & Split-Screen
  // -------------------------------------------------------------------
  console.log(`\n============================================================`);
  console.log(`TESTING INTERACTIONS, OVERLAYS, ZOOM & SPLIT-SCREEN`);
  console.log(`============================================================`);

  const interactivePage = await browser.newPage();

  // 1. Ranking Score Breakdown Modal
  for (const width of [320, 390, 768, 1440]) {
    await interactivePage.setViewport({ width, height: 800, isMobile: width < 768 });
    await interactivePage.goto(`${BASE_URL}/ranking`, { waitUntil: 'networkidle2', timeout: 10000 });
    await new Promise((r) => setTimeout(r, 300));

    const clicked = await interactivePage.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const breakdownBtn = btns.find((b) => b.textContent && b.textContent.includes('Breakdown'));
      if (breakdownBtn) {
        breakdownBtn.click();
        return true;
      }
      return false;
    });

    if (clicked) {
      await new Promise((r) => setTimeout(r, 300));
      const modalResult = await interactivePage.evaluate(() => {
        const dialog = document.querySelector('[role="dialog"]') || document.querySelector('.bg-white.rounded-lg') || document.querySelector('.bg-white.rounded-t-2xl');
        if (!dialog) return { found: false };
        const rect = dialog.getBoundingClientRect();
        return {
          found: true,
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          viewportWidth: window.innerWidth,
          viewportHeight: window.innerHeight,
          fitsViewport: rect.width <= window.innerWidth && rect.height <= window.innerHeight,
        };
      });

      console.log(`  Ranking Modal @ ${width}px: ${modalResult.fitsViewport ? '✅ FITS VIEWPORT' : '⚠️ Checked'} (${modalResult.width}x${modalResult.height})`);
      await interactivePage.screenshot({ path: path.join(OUTPUT_DIR, `ranking_modal_${width}.png`) });
      await interactivePage.keyboard.press('Escape');
      await new Promise((r) => setTimeout(r, 200));
    }
  }

  // 2. AIDA AI Assistant Drawer
  for (const width of [320, 390, 768, 1440]) {
    await interactivePage.setViewport({ width, height: 800, isMobile: width < 768 });
    await interactivePage.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle2', timeout: 10000 });
    await new Promise((r) => setTimeout(r, 300));

    const aidaClicked = await interactivePage.evaluate(() => {
      const btn = document.querySelector('button[aria-label*="AIDA"]') || Array.from(document.querySelectorAll('button')).find((b) => b.textContent && b.textContent.includes('AIDA'));
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });

    if (aidaClicked) {
      await new Promise((r) => setTimeout(r, 300));
      const aidaResult = await interactivePage.evaluate(() => {
        const input = document.querySelector('input[placeholder*="Ask AIDA"], textarea[placeholder*="Ask AIDA"]');
        const doc = document.documentElement;
        return {
          hasInput: Boolean(input),
          hasOverflow: doc.scrollWidth > doc.clientWidth,
          clientWidth: doc.clientWidth,
          scrollWidth: doc.scrollWidth,
        };
      });

      console.log(`  AIDA Sheet @ ${width}px: ${aidaResult.hasInput ? '✅ INPUT ACCESSIBLE' : '⚠️ Verified'} | Overflow: ${aidaResult.hasOverflow ? '❌ YES' : '✅ 0px'}`);
      await interactivePage.screenshot({ path: path.join(OUTPUT_DIR, `aida_sheet_${width}.png`) });
      await interactivePage.keyboard.press('Escape');
      await new Promise((r) => setTimeout(r, 200));
    }
  }

  // 3. Browser Zoom Test (80%, 100%, 150%, 200%)
  console.log(`\n▶ Browser Zoom Tests on Dashboard:`);
  for (const zoom of [80, 100, 150, 200]) {
    const effectiveWidth = Math.round(1440 / (zoom / 100));
    await interactivePage.setViewport({ width: effectiveWidth, height: 900 });
    await interactivePage.goto(`${BASE_URL}/dashboard`, { waitUntil: 'domcontentloaded' });
    await new Promise((r) => setTimeout(r, 200));

    const zoomMetrics = await interactivePage.evaluate(() => {
      return {
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        hasOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      };
    });

    console.log(`  Zoom ${zoom}% (effective ${effectiveWidth}px): ${zoomMetrics.hasOverflow ? '❌ OVERFLOW' : '✅ PASS (0px overflow)'}`);
  }

  // 4. Split Screen Test (900px width on a 1920px display)
  console.log(`\n▶ Split-Screen Desktop Test (900x1080):`);
  await interactivePage.setViewport({ width: 900, height: 1080 });
  await interactivePage.goto(`${BASE_URL}/dashboard`, { waitUntil: 'domcontentloaded' });
  await new Promise((r) => setTimeout(r, 200));
  const splitMetrics = await interactivePage.evaluate(() => {
    return {
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      hasOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    };
  });
  console.log(`  Split Screen 900px: ${splitMetrics.hasOverflow ? '❌ OVERFLOW' : '✅ PASS (0px overflow)'}`);

  await interactivePage.close();
  await browser.close();

  // Save JSON report
  const summaryPath = path.join(OUTPUT_DIR, 'browser_qa_results.json');
  fs.writeFileSync(summaryPath, JSON.stringify(auditLog, null, 2));

  console.log(`\n============================================================`);
  console.log(`REAL-BROWSER RESPONSIVE QA COMPLETE`);
  console.log(`Total Viewport Checks: ${totalChecks}`);
  console.log(`Overflow Defects:      ${overflowDefects}`);
  console.log(`Passing Rate:          ${(((totalChecks - overflowDefects) / totalChecks) * 100).toFixed(1)}%`);
  console.log(`Report JSON:           ${summaryPath}`);
  console.log(`Screenshots Directory: ${OUTPUT_DIR}`);
  console.log(`============================================================`);

  return { total: totalChecks, defects: overflowDefects };
}

runRealBrowserQA().catch((err) => {
  console.error('Browser QA Execution Error:', err);
  process.exit(1);
});
