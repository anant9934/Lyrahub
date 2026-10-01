import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE_URL = 'http://localhost:3000';
const OUTPUT_FILE = path.resolve(process.cwd(), 'docs/optimization/feature_pages_measurements.json');

async function measureFeatures() {
  console.log('=== MEASURING FEATURE PAGES WITH AUTHENTICATED SESSION ===');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // 1. Obtain test student tokens
  const authResp = await fetch('http://localhost:8000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ username: 'student@aiml.hub', password: 'password123' })
  });
  const tokens = await authResp.json();

  // Set tokens in browser localStorage
  await page.goto(`${BASE_URL}/login`);
  await page.evaluate((t) => {
    localStorage.setItem('access_token', t.access_token);
    localStorage.setItem('refresh_token', t.refresh_token);
  }, tokens);

  const results = {};

  // ─────────────────────────────────────────────────────────────────────────
  // A. PROJECTS PAGE AUDIT
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\n--- Auditing /projects ---');
  const projReqs = [];
  page.on('request', r => {
    if (r.url().includes('api/v1')) projReqs.push({ url: r.url(), start: Date.now() });
  });
  page.on('response', res => {
    const m = projReqs.find(x => x.url === res.url() && !x.end);
    if (m) {
      m.end = Date.now();
      m.duration = m.end - m.start;
      m.status = res.status();
    }
  });

  const tProj0 = Date.now();
  await page.goto(`${BASE_URL}/projects`, { waitUntil: 'domcontentloaded' });
  const tProjDom = Date.now() - tProj0;

  // Check loader state
  const projLoaderCheck = await page.evaluate(() => {
    return {
      has_skeleton: Boolean(document.querySelector('.animate-pulse') || document.querySelector('[role="status"]')),
      has_loading_text: document.body.innerText.includes('Loading projects repository'),
    };
  });

  // Wait for projects cards to appear
  let tProjLoaded = Date.now();
  try {
    await page.waitForFunction(
      () => document.querySelectorAll('h3, .border').length > 5 && !document.body.innerText.includes('Loading projects repository'),
      { timeout: 35000 }
    );
    tProjLoaded = Date.now();
  } catch (e) {
    console.log('Projects load wait timeout:', e.message);
  }

  results.projects = {
    dom_loaded_ms: tProjDom,
    initial_loading_text_visible: projLoaderCheck.has_loading_text,
    initial_skeleton_visible: projLoaderCheck.has_skeleton,
    total_time_to_cards_ms: tProjLoaded - tProj0,
    api_calls: projReqs.map(r => ({ url: r.url, duration_ms: r.duration, status: r.status })),
  };
  console.log('Projects Result:', JSON.stringify(results.projects, null, 2));

  // ─────────────────────────────────────────────────────────────────────────
  // B. COURSES PAGE AUDIT (FALSE EMPTY STATE CHECK)
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\n--- Auditing /courses ---');
  const courseReqs = [];
  const tCourse0 = Date.now();
  await page.goto(`${BASE_URL}/courses`, { waitUntil: 'domcontentloaded' });
  const tCourseDom = Date.now() - tCourse0;

  // Immediately check if "0 of 0" or false empty state shows
  const courseInitialCheck = await page.evaluate(() => {
    const text = document.body.innerText;
    return {
      shows_zero_of_zero: text.includes('0 of 0') || text.includes('Showing 0 of 0'),
      shows_no_courses: text.includes('No courses found'),
      has_skeleton: Boolean(document.querySelector('.animate-pulse') || document.querySelector('[role="status"]')),
    };
  });

  let tCourseLoaded = Date.now();
  try {
    await page.waitForFunction(
      () => document.querySelectorAll('table tbody tr').length > 0 || document.body.innerText.includes('Credits'),
      { timeout: 35000 }
    );
    tCourseLoaded = Date.now();
  } catch (e) {
    console.log('Courses wait timeout:', e.message);
  }

  results.courses = {
    dom_loaded_ms: tCourseDom,
    initial_false_empty_state: courseInitialCheck.shows_zero_of_zero || courseInitialCheck.shows_no_courses,
    shows_zero_of_zero_text: courseInitialCheck.shows_zero_of_zero,
    total_time_to_courses_loaded_ms: tCourseLoaded - tCourse0,
  };
  console.log('Courses Result:', JSON.stringify(results.courses, null, 2));

  // ─────────────────────────────────────────────────────────────────────────
  // C. RANKING PAGE AUDIT
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\n--- Auditing /ranking ---');
  const tRank0 = Date.now();
  await page.goto(`${BASE_URL}/ranking`, { waitUntil: 'domcontentloaded' });
  const tRankDom = Date.now() - tRank0;

  let tRankLoaded = Date.now();
  try {
    await page.waitForFunction(
      () => document.querySelectorAll('table tbody tr').length > 0,
      { timeout: 35000 }
    );
    tRankLoaded = Date.now();
  } catch (e) {
    console.log('Ranking wait timeout:', e.message);
  }

  // Test Breakdown modal latency
  let modalLatencyMs = null;
  try {
    const breakdownBtn = await page.$('button[data-testid="breakdown-btn"], button:has-text("Breakdown")');
    if (breakdownBtn) {
      const tModal0 = Date.now();
      await breakdownBtn.click();
      await page.waitForSelector('[role="dialog"], .fixed', { timeout: 5000 });
      modalLatencyMs = Date.now() - tModal0;
    }
  } catch (e) {
    modalLatencyMs = 'Modal button not found or delayed';
  }

  results.ranking = {
    dom_loaded_ms: tRankDom,
    total_time_to_table_ms: tRankLoaded - tRank0,
    breakdown_modal_latency: modalLatencyMs,
  };
  console.log('Ranking Result:', JSON.stringify(results.ranking, null, 2));

  // ─────────────────────────────────────────────────────────────────────────
  // D. AIDA AUDIT
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\n--- Auditing AIDA Floating Panel ---');
  let aidaTriggerLatencyMs = null;
  let aidaResponseLatencyMs = null;
  try {
    // Look for AIDA floating launcher button
    const aidaLauncher = await page.$('button[aria-label="AIDA"], button:has-text("AIDA"), button:has-text("Ask AIDA")');
    if (aidaLauncher) {
      const tAida0 = Date.now();
      await aidaLauncher.click();
      await page.waitForSelector('textarea, input[placeholder*="Ask AIDA"], [role="dialog"]', { timeout: 5000 });
      aidaTriggerLatencyMs = Date.now() - tAida0;

      // Type and submit a query
      await page.type('textarea, input[placeholder*="Ask AIDA"]', 'What is AIMETRA?');
      const tSubmit0 = Date.now();
      await page.keyboard.press('Enter');
      await page.waitForFunction(
        () => document.body.innerText.includes('intelligence layer') || document.body.innerText.includes('AIMETRA'),
        { timeout: 25000 }
      );
      aidaResponseLatencyMs = Date.now() - tSubmit0;
    }
  } catch (e) {
    aidaResponseLatencyMs = e.message;
  }

  results.aida = {
    launcher_click_to_open_ms: aidaTriggerLatencyMs,
    query_to_rendered_response_ms: aidaResponseLatencyMs,
  };
  console.log('AIDA Result:', JSON.stringify(results.aida, null, 2));

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2));
  console.log('\nSaved feature measurements to:', OUTPUT_FILE);

  await browser.close();
}

measureFeatures();
