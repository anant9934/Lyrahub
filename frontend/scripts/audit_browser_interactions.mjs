import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const OUTPUT_FILE = path.resolve(process.cwd(), 'docs/optimization/browser_audit_measurements.json');

async function runBrowserAudit() {
  console.log('============================================================');
  console.log('AIMETRA — REAL-BROWSER PERFORMANCE & INTERACTION AUDIT');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Output: ${OUTPUT_FILE}`);
  console.log('============================================================\n');

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

  const auditData = {
    timestamp: new Date().toISOString(),
    startup: {},
    loginFlow: {},
    navigation: {},
    buttons: {},
    pageAudits: {},
    longTasks: [],
    networkWaterfalls: {},
    viewports: {},
  };

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    // Enable CDP performance and network domains
    const client = await page.target().createCDPSession();
    await client.send('Performance.enable');

    // ─────────────────────────────────────────────────────────────────────────
    // 1. BASELINE STARTUP AUDIT (HOMEPAGE)
    // ─────────────────────────────────────────────────────────────────────────
    console.log('--- 1. AUDITING BASELINE STARTUP (/) ---');
    const startNav = Date.now();
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle2', timeout: 30000 });
    const navEnd = Date.now();

    const perfMetrics = await page.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0] || {};
      const paint = performance.getEntriesByType('paint');
      const fcp = paint.find((p) => p.name === 'first-contentful-paint')?.startTime || 0;

      return new Promise((resolve) => {
        let lcp = 0;
        const po = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          if (entries.length > 0) {
            lcp = entries[entries.length - 1].startTime;
          }
        });
        try {
          po.observe({ type: 'largest-contentful-paint', buffered: true });
        } catch (e) {}

        setTimeout(() => {
          po.disconnect();
          resolve({
            dns_ms: Math.round(nav.domainLookupEnd - nav.domainLookupStart),
            tcp_ms: Math.round(nav.connectEnd - nav.connectStart),
            tls_ms: nav.secureConnectionStart ? Math.round(nav.connectEnd - nav.secureConnectionStart) : 0,
            ttfb_ms: Math.round(nav.responseStart - nav.requestStart),
            html_transfer_ms: Math.round(nav.responseEnd - nav.responseStart),
            dom_interactive_ms: Math.round(nav.domInteractive),
            dom_content_loaded_ms: Math.round(nav.domContentLoadedEventEnd),
            load_complete_ms: Math.round(nav.loadEventEnd),
            fcp_ms: Math.round(fcp),
            lcp_ms: Math.round(lcp || fcp),
            total_duration_ms: Math.round(nav.duration || 0),
          });
        }, 500);
      });
    });

    auditData.startup = perfMetrics;
    console.log('Startup Metrics:', JSON.stringify(perfMetrics, null, 2));

    // ─────────────────────────────────────────────────────────────────────────
    // 2. LOGIN DEEP AUDIT & COMPLETE CHAIN MEASUREMENT
    // ─────────────────────────────────────────────────────────────────────────
    console.log('\n--- 2. AUDITING LOGIN DEEP CHAIN & WATERFALL ---');
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle2' });

    // Track all network requests during login
    const loginRequests = [];
    const onReq = (req) => {
      loginRequests.push({
        url: req.url(),
        method: req.method(),
        startTime: Date.now(),
      });
    };
    const onRes = (res) => {
      const match = loginRequests.find((r) => r.url === res.url() && !r.endTime);
      if (match) {
        match.endTime = Date.now();
        match.status = res.status();
        match.duration_ms = match.endTime - match.startTime;
      }
    };
    page.on('request', onReq);
    page.on('response', onRes);

    // Set credentials
    await page.type('input[type="email"]', 'student@aiml.hub');
    await page.type('input[type="password"]', 'password123');

    // Instrument click and observe visual feedback + navigation
    const tClickStart = Date.now();
    await page.click('button[type="submit"]');

    // Wait 100ms and check visual button state
    await new Promise((r) => setTimeout(r, 100));
    const buttonStateAfter100ms = await page.evaluate(() => {
      const btn = document.querySelector('button[type="submit"]');
      return btn ? {
        text: btn.innerText.trim(),
        disabled: btn.disabled,
      } : null;
    });

    console.log('Button state after 100ms:', buttonStateAfter100ms);

    // Wait for navigation or dashboard route
    const tLoginStart = Date.now();
    try {
      await page.waitForFunction(
        () => window.location.pathname.includes('/dashboard'),
        { timeout: 35000 }
      );
    } catch (e) {
      console.log('Navigation to /dashboard timed out or delayed:', e.message);
    }
    const tDashboardRouteReached = Date.now();

    // Wait for dashboard content
    let tDashboardReady = Date.now();
    try {
      await page.waitForFunction(
        () => document.body.innerText.includes('Welcome') || document.body.innerText.includes('Overview') || document.body.innerText.includes('Academic Performance'),
        { timeout: 30000 }
      );
      tDashboardReady = Date.now();
    } catch (e) {
      console.log('Dashboard content load timed out:', e.message);
    }

    page.off('request', onReq);
    page.off('response', onRes);

    const loginPostReq = loginRequests.find((r) => r.url.includes('/auth/login'));
    const authMeReq = loginRequests.find((r) => r.url.includes('/auth/me'));
    const studentMeReq = loginRequests.find((r) => r.url.includes('/students/me'));

    // Count duplicate requests
    const reqCounts = {};
    loginRequests.forEach((r) => {
      const u = r.url.split('?')[0];
      reqCounts[u] = (reqCounts[u] || 0) + 1;
    });

    auditData.loginFlow = {
      button_state_after_100ms: buttonStateAfter100ms,
      visual_ack_immediate: buttonStateAfter100ms?.text === "Authenticating..." || buttonStateAfter100ms?.disabled === true,
      login_api_call: loginPostReq ? {
        duration_ms: loginPostReq.duration_ms,
        status: loginPostReq.status,
      } : null,
      auth_me_api_call: authMeReq ? {
        duration_ms: authMeReq.duration_ms,
        status: authMeReq.status,
      } : null,
      student_me_api_call: studentMeReq ? {
        duration_ms: studentMeReq.duration_ms,
        status: studentMeReq.status,
      } : null,
      login_click_to_dashboard_route_ms: tDashboardRouteReached - tLoginStart,
      login_click_to_dashboard_ready_ms: tDashboardReady - tLoginStart,
      duplicate_requests: Object.entries(reqCounts).filter(([_, count]) => count > 1),
      all_requests_during_login: loginRequests.map((r) => ({
        url: r.url,
        status: r.status,
        duration_ms: r.duration_ms,
      })),
    };
    console.log('Login Flow Summary:', JSON.stringify(auditData.loginFlow, null, 2));

    // ─────────────────────────────────────────────────────────────────────────
    // 3. NAVIGATION LATENCY AUDIT (SPA TRANSITIONS)
    // ─────────────────────────────────────────────────────────────────────────
    console.log('\n--- 3. AUDITING SPA NAVIGATION LATENCY ---');
    const navHops = [
      { from: '/dashboard', to: '/projects', name: 'Dashboard → Projects', selector: 'a[href="/projects"]' },
      { from: '/projects', to: '/courses', name: 'Projects → Courses', selector: 'a[href="/courses"]' },
      { from: '/courses', to: '/ranking', name: 'Courses → Ranking', selector: 'a[href="/ranking"]' },
      { from: '/ranking', to: '/programs', name: 'Ranking → Programs', selector: 'a[href="/programs"]' },
      { from: '/programs', to: '/events', name: 'Programs → Events', selector: 'a[href="/events"]' },
      { from: '/events', to: '/opportunities', name: 'Events → Opportunities', selector: 'a[href="/opportunities"]' },
      { from: '/opportunities', to: '/dashboard', name: 'Opportunities → Dashboard', selector: 'a[href="/dashboard"]' },
    ];

    for (const hop of navHops) {
      console.log(`Testing hop: ${hop.name}`);
      const hopReqs = [];
      const onHopReq = (req) => hopReqs.push({ url: req.url(), start: Date.now() });
      const onHopRes = (res) => {
        const m = hopReqs.find((r) => r.url === res.url() && !r.end);
        if (m) {
          m.end = Date.now();
          m.duration_ms = m.end - m.start;
          m.status = res.status();
        }
      };
      page.on('request', onHopReq);
      page.on('response', onHopRes);

      const navStart = Date.now();
      let clickFeedbackMs = 0;

      // Click link and track client state response
      try {
        const linkEl = await page.$(hop.selector);
        if (linkEl) {
          const t0 = Date.now();
          await linkEl.click();
          clickFeedbackMs = Date.now() - t0;
        } else {
          await page.goto(`${BASE_URL}${hop.to}`, { waitUntil: 'domcontentloaded' });
        }

        // Wait until url changes
        await page.waitForFunction((targetPath) => window.location.pathname.startsWith(targetPath), { timeout: 15000 }, hop.to);
        const routeReachedMs = Date.now() - navStart;

        // Wait until page settles
        await new Promise((r) => setTimeout(r, 1000));
        const readyMs = Date.now() - navStart;

        auditData.navigation[hop.name] = {
          from: hop.from,
          to: hop.to,
          click_feedback_ms: clickFeedbackMs,
          route_transition_ms: routeReachedMs,
          total_interactive_ms: readyMs,
          requests_triggered: hopReqs.length,
          api_requests: hopReqs.filter((r) => r.url.includes('/api/v1/')).map((r) => ({
            url: r.url,
            duration_ms: r.duration_ms,
            status: r.status,
          })),
        };
      } catch (e) {
        auditData.navigation[hop.name] = { error: e.message };
      }

      page.off('request', onHopReq);
      page.off('response', onHopRes);
    }
    console.log('Navigation Summary:', JSON.stringify(auditData.navigation, null, 2));

    // ─────────────────────────────────────────────────────────────────────────
    // 4. DEEP PAGE AUDITS: PROJECTS, COURSES, RANKING
    // ─────────────────────────────────────────────────────────────────────────
    console.log('\n--- 4. AUDITING PROJECTS, COURSES, RANKING (FALSE EMPTY STATES & LOADERS) ---');

    // Projects Audit
    console.log('Auditing /projects...');
    await page.goto(`${BASE_URL}/projects`, { waitUntil: 'domcontentloaded' });
    const projState = await page.evaluate(async () => {
      const t0 = performance.now();
      const hasInitialLoader = document.body.innerText.includes('Loading projects repository');
      const cardsBefore = document.querySelectorAll('[data-testid="project-card"], .rounded-xl, .border').length;
      return {
        initial_loader_visible: hasInitialLoader,
        initial_card_count: cardsBefore,
      };
    });
    // Wait for projects API
    const projT0 = Date.now();
    try {
      await page.waitForFunction(() => !document.body.innerText.includes('Loading projects repository'), { timeout: 25000 });
    } catch (e) {}
    const projT1 = Date.now();
    auditData.pageAudits.projects = {
      initial_loader_visible: projState.initial_loader_visible,
      loader_duration_ms: projT1 - projT0,
    };

    // Courses Audit
    console.log('Auditing /courses...');
    await page.goto(`${BASE_URL}/courses`, { waitUntil: 'domcontentloaded' });
    const courseState = await page.evaluate(() => {
      const text = document.body.innerText;
      return {
        has_false_empty: text.includes('0 of 0') || text.includes('0 courses'),
        has_loader: text.includes('Loading') || text.includes('Fetching'),
      };
    });
    const coursesT0 = Date.now();
    try {
      await page.waitForFunction(() => document.body.innerText.includes('Credits') || document.querySelectorAll('table tr').length > 2, { timeout: 25000 });
    } catch (e) {}
    const coursesT1 = Date.now();
    auditData.pageAudits.courses = {
      false_empty_state_rendered_on_load: courseState.has_false_empty,
      initial_loader_visible: courseState.has_loader,
      time_to_courses_loaded_ms: coursesT1 - coursesT0,
    };

    // Ranking Audit
    console.log('Auditing /ranking...');
    await page.goto(`${BASE_URL}/ranking`, { waitUntil: 'domcontentloaded' });
    const rankState = await page.evaluate(() => {
      const text = document.body.innerText;
      return {
        has_loader: text.includes('Loading') || text.includes('Calculating') || text.includes('Computing'),
      };
    });
    const rankT0 = Date.now();
    try {
      await page.waitForFunction(() => document.querySelectorAll('table tbody tr').length > 0 || document.body.innerText.includes('CGPA'), { timeout: 25000 });
    } catch (e) {}
    const rankT1 = Date.now();
    auditData.pageAudits.ranking = {
      initial_loader_visible: rankState.has_loader,
      time_to_ranking_loaded_ms: rankT1 - rankT0,
    };

    // ─────────────────────────────────────────────────────────────────────────
    // 5. BUTTON RESPONSE & CLICK LATENCY AUDIT
    // ─────────────────────────────────────────────────────────────────────────
    console.log('\n--- 5. AUDITING GLOBAL BUTTON RESPONSE & CLICK LATENCY ---');
    await page.goto(`${BASE_URL}/projects`, { waitUntil: 'networkidle2' });
    const buttonAudit = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const sample = btns.slice(0, 10).map((b) => ({
        text: b.innerText.trim() || b.getAttribute('aria-label') || 'Icon Button',
        hasOnClick: typeof b.onclick === 'function' || b.getAttribute('role') === 'button',
      }));
      return sample;
    });
    auditData.buttons = buttonAudit;

    // ─────────────────────────────────────────────────────────────────────────
    // 6. LONG TASK AUDIT (>50ms main-thread blocks)
    // ─────────────────────────────────────────────────────────────────────────
    console.log('\n--- 6. AUDITING LONG MAIN-THREAD TASKS ---');
    const longTasks = await page.evaluate(() => {
      return new Promise((resolve) => {
        const tasks = [];
        const po = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            tasks.push({
              name: entry.name,
              duration_ms: Math.round(entry.duration),
              startTime: Math.round(entry.startTime),
            });
          }
        });
        try {
          po.observe({ entryTypes: ['longtask'] });
        } catch (e) {}

        // Scroll and interact slightly
        window.scrollBy(0, 300);
        setTimeout(() => {
          po.disconnect();
          resolve(tasks);
        }, 1000);
      });
    });
    auditData.longTasks = longTasks;
    console.log(`Found ${longTasks.length} long tasks on /projects`);

    // ─────────────────────────────────────────────────────────────────────────
    // 7. RESPONSIVE VIEWPORT MATRIX LATENCY CHECK
    // ─────────────────────────────────────────────────────────────────────────
    console.log('\n--- 7. AUDITING VIEWPORT RENDERING LATENCY ---');
    const vps = [
      { name: 'Mobile_320', width: 320, height: 568 },
      { name: 'Mobile_375', width: 375, height: 667 },
      { name: 'Mobile_390', width: 390, height: 844 },
      { name: 'Tablet_768', width: 768, height: 1024 },
      { name: 'Desktop_1440', width: 1440, height: 900 },
    ];
    for (const vp of vps) {
      await page.setViewport(vp);
      const t0 = Date.now();
      await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'domcontentloaded' });
      const renderMs = Date.now() - t0;
      auditData.viewports[vp.name] = { render_ms: renderMs };
    }

    // Save final report JSON
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(auditData, null, 2));
    console.log(`\nBrowser audit complete! Saved to: ${OUTPUT_FILE}`);
  } catch (err) {
    console.error('Browser audit error:', err);
  } finally {
    await browser.close();
  }
}

runBrowserAudit();
