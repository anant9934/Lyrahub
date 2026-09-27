# AIMETRA — Comprehensive Responsive Design Audit

**Audit Date:** 2026-09-27  
**Scope:** Complete AIMETRA frontend (`src/app/`, `src/components/`, `src/lib/`, `src/styles/`)  
**Target Viewport Matrix:** 320px mobile through 2560px+ ultrawide displays  
**Platform Architecture:** Next.js 14 App Router (SSR safe), Tailwind CSS, Unidale Design System  

---

## Executive Summary

A comprehensive visual and structural audit of the AIMETRA application was conducted across viewports spanning 320px mobile (iPhone SE), 375px/390px/430px modern smartphones, 768px/820px tablets, 1024px/1280px laptops, 1440px/1920px desktops, and 2560px+ ultrawide monitors.

The audit identified 15 primary areas requiring responsive remediation to achieve the "One Adaptive Application" standard:
1. Hardcoded min-heights and 100vh units in hero viewports causing mobile browser jump and landscape clipping.
2. Rigid multi-column layouts on narrow screens (e.g. 2-column KPI cards and comparison blocks on 320px screens).
3. Desktop-only persistent sidebar assumptions (256px fixed width on tablet consuming >33% screen).
4. Absence of a thumb-accessible mobile bottom navigation bar in authenticated areas.
5. Search bar in TopBar completely hidden on mobile rather than accessible via compact trigger.
6. AIDA Assistant drawer lacking mobile backdrop, 100dvh safe-area support, and horizontal table scrolling.
7. Ranking modal lacking mobile bottom-sheet adaptation, internal scroll bounds, and Escape key handling.
8. Course cards truncating titles (`line-clamp-1`) and non-wrapping top badges.
9. Absence of centralized container queries and fluid sizing tokens (`clamp()`).
10. Skeletons reflecting outdated desktop-only column assumptions.
11. Login and Error pages using excessive padding (`p-8` on 320px) and non-collapsing 2-column action grids.
12. Table components lacking controlled responsive representations for ultra-compact viewports.
13. Hover-only dropdown menus in Navbar breaking on touch devices (`hover: none`, `pointer: coarse`).
14. Missing dev-only responsive debug instrumentation.
15. Absence of a centralized capability-aware and SSR-safe responsive state layer.

---

## Detailed Audit Matrix

### 1. Global Layout & Tokens
* **Component:** `src/app/globals.css`, `tailwind.config.ts`, `src/app/layout.tsx`
* **Problem:** Lack of fluid design tokens, container query support, safe-area variables, and max-width bounds on ultrawide displays.
* **Affected Width:** 320px – 480px (mobile) and > 1920px (ultrawide)
* **Affected Orientation:** Portrait & Landscape
* **Root Cause:** Standard Tailwind pixel/rem scales without CSS variables for `--page-padding`, `--section-gap`, `--card-padding`, and `--content-max-width`.
* **Fix:** Add fluid clamp tokens to `:root`, safe area inset variables, container query definitions, and page container utilities (`width: min(100% - 32px, 1600px)`).
* **Verification:** Test at 320px (padding drops to 12px) and 2560px (content stays bounded at 1600px centered).

---

### 2. Public Navigation & Header
* **Component:** `src/components/layout/PublicNav.tsx`, `src/components/layout/Navbar.tsx`
* **Problem:** Horizontal collision between navigation links, search, and CTA button at 768px – 960px. Hover dropdown menus fail on touch devices.
* **Affected Width:** 768px – 1024px (tablet/laptop) and mobile touch screens
* **Affected Orientation:** Portrait & Landscape
* **Root Cause:** Hardcoded `space-x-7` on nav items; mouse-only `onMouseEnter`/`onMouseLeave` state triggers in `Navbar.tsx`.
* **Fix:** Implement condensed navigation at intermediate widths; use click/tap toggles with outside-click and Escape listeners; add touch capability checks via `@media (hover: hover)`.
* **Verification:** Test touch simulation in Chrome DevTools; verify menu opens on click and does not get stuck.

---

### 3. Dashboard Shell & Sidebar
* **Component:** `src/components/layout/DashboardShell.tsx`, `src/components/layout/DashboardSidebar.tsx`
* **Problem:** 
  1. Desktop sidebar is fixed at 256px (`w-64`) for all `md:` screens (768px+), consuming 33% of a 768px tablet screen.
  2. Mobile screens (`< md`) lack quick one-handed bottom navigation.
  3. No collapsible rail mode for tablet or laptop viewports.
* **Affected Width:** 320px – 1024px
* **Affected Orientation:** Portrait & Landscape
* **Root Cause:** Binary `hidden md:block` sidebar implementation without tablet intermediate state or bottom navigation bar.
* **Fix:** 
  1. Create a responsive collapsible sidebar (rail mode with icons and tooltips when collapsed, full drawer on mobile).
  2. Implement a persistent authenticated mobile bottom navigation bar (`< md`) for key destinations (Dashboard, Ranking, Projects, AIDA, Profile).
  3. Ensure main content reflows without horizontal overflow.
* **Verification:** Resize from 1280px down to 768px down to 375px; verify rail collapses smoothly and bottom nav appears on mobile.

---

### 4. TopBar Navigation
* **Component:** `src/components/layout/TopBar.tsx`
* **Problem:** Search bar is completely hidden (`hidden sm:block`) on mobile, leaving no way for mobile users to search students/projects. Notification dropdown `w-72` can overflow on 320px screens.
* **Affected Width:** 320px – 640px
* **Affected Orientation:** Portrait
* **Root Cause:** Responsive hiding without mobile fallback trigger; static dropdown width without viewport clamping (`w-72` = 288px on a 320px screen leaves only 32px total margin).
* **Fix:** Add a compact search icon trigger that opens an expandable search bar/modal on mobile; clamp notification popover width (`w-[calc(100vw-32px)] sm:w-72`).
* **Verification:** Verify search trigger is operational at 320px, 375px, and 390px.

---

### 5. Hero Section & Landing Page
* **Component:** `src/app/page.tsx`
* **Problem:** 
  1. `style={{ height: "calc(100vh - 64px)", minHeight: "560px", maxHeight: "820px" }}` causes viewport jump on mobile browsers and severe clipping in landscape mobile (e.g. 568x320 landscape).
  2. Absolute bottom-right department label collides with hero CTA buttons on narrow mobile viewports.
  3. "Before / With AIMETRA" section uses rigid `grid-cols-2 divide-x` with `p-8`, severely compressing content on 320px screens.
  4. Student evidence card row has fixed label widths (`w-28 shrink-0`, `w-24 shrink-0`) that clip.
* **Affected Width:** 320px – 640px; landscape mobile (height < 500px)
* **Affected Orientation:** Landscape & Portrait
* **Root Cause:** `100vh` instead of `100dvh`; fixed min-height values; rigid multi-column grids; hardcoded shrink-0 pixel widths.
* **Fix:** 
  1. Use `min-h-[min(560px,calc(100dvh-64px))]` with dynamic padding.
  2. Hide bottom-right hero label on small screens or move below CTA.
  3. Change "Before / With AIMETRA" to `grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x` with `p-4 sm:p-8`.
  4. Replace fixed label widths with fluid flex layouts (`min-w-0 flex-1`).
* **Verification:** Test at 320x568 portrait, 568x320 landscape, and 390x844.

---

### 6. Dashboard KPI Cards & Widgets
* **Component:** `src/app/dashboard/page.tsx`, `src/components/ui/stat-card.tsx`
* **Problem:** KPI cards use `grid-cols-2 lg:grid-cols-4`. On 320px screen, 2 columns cause numbers and labels to wrap awkwardly or clip. Quick actions grid uses `grid-cols-2 sm:grid-cols-3 lg:grid-cols-6`.
* **Affected Width:** 320px – 480px
* **Affected Orientation:** Portrait
* **Root Cause:** Desktop-centric grid breakpoints without single-column phone accommodation.
* **Fix:** 
  1. Update KPI grid to `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`.
  2. StatCard typography with fluid clamp sizes (`text-xl sm:text-2xl lg:text-3xl`).
  3. Use container queries (`@container`) on dashboard widget containers.
* **Verification:** Confirm 1 column on 320px/375px, 2 columns on 640px/768px, 4 columns on 1024px+.

---

### 7. AIDA Assistant Drawer
* **Component:** `src/components/features/ai/AIDAAssistant.tsx`
* **Problem:** 
  1. Fixed width `sm:w-[500px]`, lacks full backdrop on mobile.
  2. Doesn't support `100dvh` and virtual keyboard viewport resize (`visualViewport`).
  3. Tabular response data view has `overflow-y-auto` but lacks `overflow-x-auto`, overflowing on narrow mobile devices.
  4. Table indentation `ml-8` consumes excessive horizontal space on 320px screens.
* **Affected Width:** 320px – 480px
* **Affected Orientation:** Portrait & Landscape
* **Root Cause:** Desktop side-drawer assumptions; missing backdrop; missing horizontal scroll on table wrapper.
* **Fix:** 
  1. Provide full-width drawer with backdrop on mobile (`w-full sm:w-[500px]`).
  2. Implement `h-[100dvh]` and safe-area inset padding (`pb-[env(safe-area-inset-bottom)]`).
  3. Add `overflow-x-auto` to AIDA table containers.
  4. Reduce margin `ml-0 sm:ml-8` on mobile.
* **Verification:** Open AIDA on 320px viewport; ask a question that returns a table; verify table scrolls cleanly inside bubble and does not blow out viewport.

---

### 8. Ranking Page & Ranking Modal
* **Component:** `src/app/(dashboard)/ranking/page.tsx`, `src/components/features/ranking/RankingTable.tsx`
* **Problem:** 
  1. Ranking table has 8 columns. On 320px screens, user must scroll extensively to view actions.
  2. Breakdown modal is centered `max-w-md` without mobile bottom-sheet styling, lacking safe area padding, and lacking Escape key handler.
* **Affected Width:** 320px – 640px
* **Affected Orientation:** Portrait
* **Root Cause:** Desktop modal and desktop table assumptions.
* **Fix:** 
  1. Table retains horizontal scroll with sticky rank/name column or responsive card toggle on mobile.
  2. Transform breakdown modal to a near full-screen bottom sheet on mobile (`rounded-t-2xl sm:rounded-xl bottom-0 sm:bottom-auto fixed`) with safe area insets, internal scroll (`max-h-[85dvh] overflow-y-auto`), and Escape key listener.
* **Verification:** Open breakdown modal on 320px mobile viewport; verify clean bottom-sheet layout, full internal scrollability, and close via swipe/backdrop/Escape.

---

### 9. Projects & Courses Cards
* **Component:** `src/components/features/projects/ProjectCard.tsx`, `src/components/features/courses/CourseCard.tsx`
* **Problem:** 
  1. `CourseCard` title has `line-clamp-1` which truncates essential curriculum titles.
  2. Badges in `CourseCard` header are in `flex items-center justify-between` without `flex-wrap`, causing overflow on narrow card containers.
  3. `ProjectCard` mentor name and action button collide in narrow container contexts.
* **Affected Width:** 320px – 400px, or narrow container columns
* **Affected Orientation:** Portrait
* **Root Cause:** Hardcoded truncate classes and non-wrapping badge containers.
* **Fix:** 
  1. Remove `line-clamp-1` from Course title to allow natural wrapping.
  2. Add `flex-wrap` and gap utilities to badge containers.
  3. Use container queries to adjust padding and typography based on actual card container width.
* **Verification:** Render cards in 280px narrow column container; verify badges wrap cleanly and no text clips.

---

### 10. Authentication Pages
* **Component:** `src/app/login/page.tsx`, `src/app/signup/page.tsx`
* **Problem:** 
  1. Login left panel uses `p-8 sm:p-12 lg:p-16`, which leaves only 256px on 320px screens.
  2. SSO buttons in 2-column grid (`grid grid-cols-2 gap-3`) compress button text.
  3. Missing mobile safe area consideration.
* **Affected Width:** 320px – 390px
* **Affected Orientation:** Portrait & Landscape
* **Root Cause:** Rigid padding and fixed 2-column grid without mobile collapse.
* **Fix:** 
  1. Adjust padding to `p-4 sm:p-8 lg:p-16`.
  2. Allow SSO buttons to wrap or flex cleanly.
  3. Ensure right photography panel cleanly collapses on tablet/mobile (`hidden lg:block`).
* **Verification:** Test login at 320px, 360px, 375px, 414px; verify zero horizontal scroll.

---

### 11. Error & System Pages
* **Component:** `src/components/system/BrandedErrorPage.tsx`, `src/app/global-error.tsx`
* **Problem:** 404 suggested links grid is hardcoded `grid-cols-2`, creating squashed multi-line links on 320px screens.
* **Affected Width:** 320px – 480px
* **Affected Orientation:** Portrait
* **Root Cause:** Static 2-column layout.
* **Fix:** Change suggested links to `grid-cols-1 sm:grid-cols-2 gap-2.5`.
* **Verification:** Visit `/non-existent-page` at 320px; verify clean vertical stacking of suggested links without overflow.

---

### 12. Skeletons
* **Component:** `src/components/ui/skeletons.tsx`
* **Problem:** `DashboardPageSkeleton` uses `grid-cols-2 lg:grid-cols-4` matching old dashboard grid, creating a layout flash when page loads on mobile.
* **Affected Width:** 320px – 480px
* **Affected Orientation:** Portrait
* **Root Cause:** Outdated skeleton column configuration.
* **Fix:** Align `DashboardPageSkeleton` to `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`.
* **Verification:** Verify skeleton structure mirrors final loaded layout at all breakpoints.

---

### 13. Centralized Responsive Layer
* **Component:** Missing `src/responsive/` and `src/components/responsive/`
* **Problem:** No unified hook or provider for capability signals (touch, pointer, orientation, reduced motion, connection speed, visual viewport). No reusable responsive primitives.
* **Affected Width:** All
* **Affected Orientation:** All
* **Root Cause:** Decentralized ad-hoc responsive logic.
* **Fix:** 
  1. Create `ResponsiveProvider.tsx`, `useResponsive.ts`, `deviceCapabilities.ts`, `responsive.css`.
  2. Create `ResponsiveContainer.tsx`, `ResponsiveGrid.tsx`, `ResponsiveSidebar.tsx`, `ResponsiveTable.tsx`, `ResponsiveModal.tsx`.
  3. Create development-only `ResponsiveDebug.tsx` overlay.
* **Verification:** Verify all signals expose accurately without triggering SSR hydration mismatches.

---

## Action Plan

1. **Architecture & Foundation:**
   - Create `src/responsive/deviceCapabilities.ts` (SSR safe).
   - Create `src/responsive/useResponsive.ts` (centralized hook).
   - Create `src/responsive/ResponsiveProvider.tsx` (centralized context).
   - Create `src/responsive/responsive.css` (tokens, container query definitions, fluid typography).
   - Integrate into `src/app/globals.css` and `src/app/layout.tsx`.
   - Create dev-only `ResponsiveDebug.tsx`.

2. **Responsive Primitives (`src/components/responsive/`):**
   - `ResponsiveContainer.tsx` (bounded page container).
   - `ResponsiveGrid.tsx` (fluid auto-fit grid).
   - `ResponsiveSidebar.tsx` (desktop persistent, tablet collapsible, mobile drawer).
   - `ResponsiveTable.tsx` (controlled horizontal scroll with shadow cues).
   - `ResponsiveModal.tsx` (desktop modal, mobile bottom sheet).

3. **Core Shell & Navigation Refactor:**
   - Enhance `DashboardShell.tsx` with collapsible tablet sidebar + mobile bottom navigation bar.
   - Enhance `TopBar.tsx` with mobile search trigger and clamped popover.
   - Enhance `PublicNav.tsx` with condensed nav at intermediate widths.

4. **Component & Page Enhancements:**
   - Fix hero, before/after grid, and student card in `src/app/page.tsx`.
   - Update KPI card grids in `src/app/dashboard/page.tsx` and `DashboardPageSkeleton`.
   - Update `AIDAAssistant.tsx` (100dvh, backdrop, table scroll, mobile input reachability).
   - Enhance `RankingPage` breakdown modal with mobile bottom-sheet behavior.
   - Remove title truncation in `CourseCard.tsx` and enable badge wrapping.
   - Refactor `login/page.tsx` padding and SSO buttons.
   - Fix 404 navigation grid in `BrandedErrorPage.tsx`.

5. **Automated Verification:**
   - Create Vitest / RTL viewport test suite covering 320px, 375px, 390px, 430px, 768px, 1024px, 1280px, 1440px, 1920px.
   - Run typecheck, lint, build, and test suite.
   - Document results in `docs/release/RESPONSIVE_VERIFICATION.md`.
