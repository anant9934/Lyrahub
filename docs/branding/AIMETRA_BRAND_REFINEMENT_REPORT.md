# AIMETRA Brand Refinement Report

> **Cycle:** Premium Brand Experience + Homepage Refinement
> **Scope:** Visual hierarchy, copy discipline, section architecture, mobile experience
> **Build status:** `tsc --noEmit` → exit 0 · `npm run build` → exit 0

---

## Before — What Was Generic

| Issue | Detail |
|-------|--------|
| **Card-grid fatigue** | 5 separate `grid-cols-3` card sections back-to-back |
| **Dot-list overuse** | 4 sections used bullet dot + text lists — all identical |
| **Jarring dark mid-page** | `bg-[#111111]` between white sections, broke visual cohesion |
| **AIDA mock was shallow** | Query + "Searching..." text. No structured result. No product proof |
| **Data signals strip** | 6 labels + dividers. Felt like a skeleton loader |
| **Question too small** | Most important editorial pause rendered at `text-3xl` |
| **Student: 12 mini cards** | SaaS template pattern, not product interface |
| **Faculty: 6 mini cards** | Third identical grid section in sequence |
| **Programs on marketing page** | Internal academic catalog mid-narrative — wrong context |
| **Manifesto headline too small** | `text-2xl` for the brand's core belief |
| **4 icon-card sections** | Same icon+title+description pattern repeated four times |

---

## Changes

### Hero
Text-dominant. `text-7xl` headline. Signal chain `Students → Faculty → ... → AIMETRA` replaces the placeholder data strip.

### Problem — Editorial table rows
`divide-y` table: signal name (left) · where it lives (right). Reads as institutional data, not marketing bullets.

### The Question — Maximum scale
`text-6xl` left-aligned. 6 separated short sentences. Each connection is its own visual beat.

### Meet AIMETRA — Light background, white panel
Removed `bg-[#111111]`. `bg-[#F5F5F4]` instead. FROM→TO becomes a white comparison panel with vertical divider: muted grey "Before" / black medium-weight "With AIMETRA".

### Student — Simulated profile card
Real profile: avatar, name, program, rank. Signal rows: CGPA / Skills / Projects / Research / Certifications / Internship. The interface is the evidence.

### Faculty — Faculty profile card
Dr. Priya Menon: expertise, courses, supervised projects, research, mentees. Same visual language as student card.

### Leadership — 3-column evidence categories
Academic / Research & Output / Operations — plain text list, no icons, no dots.

### AIDA — Structured result panel
One complete interaction: query → count summary → results table (Name/CGPA/Project, 4 rows + +3 more) → follow-up action chips.
Mobile: `overflow-x-auto` + `min-w-[360px]` + `sm:ml-9`.

### Ecosystem — Role list
`divide-y` table: Role | "View label" | description. No cards.

### Manifesto — Proper scale
`text-5xl` headline. `text-base` manifesto lines. `text-2xl` payoff. Authority restored.

### Programs — Removed
Internal catalog content removed from marketing homepage.

### Capabilities — Table format
`divide-y`: category tag (left) / title + description (right). Fourth card grid eliminated.

### Final CTA — Left-aligned dark
`text-5xl` headline. Left-aligned — confident, not centered and weak.

---

## No Two Consecutive Sections Share a Visual Composition

| Section | Layout type |
|---------|-------------|
| Hero | Full-width typography + signal chain |
| Problem | Left/right split, table rows |
| Question | Single dominant type + stacked sentences |
| Meet AIMETRA | Split + white comparison panel |
| Student | Split + profile card UI |
| Faculty | Flipped split + profile card UI |
| Leadership | Split + 3-column category list |
| AIDA | Split + result panel with table |
| Ecosystem | Split + divider list |
| Manifesto | Full-width large typography |
| Capabilities | Tag + content table |
| Final CTA | Left-aligned dark |

---

## Color System — No New Colors

```
#FFFFFF / #FAFAFA / #F5F5F4   backgrounds
#111111 / #333333 / #444444   foreground hierarchy
#555555 / #666666 / #888888   secondary text
#AAAAAA / #CCCCCC             muted / dividers
#E5E5E5                       borders
```

Zero neon. Zero gradients. Zero glow. Zero glassmorphism.

---

## Mobile (390px / 375px)

All outer containers: `px-6 lg:px-8` — no horizontal scroll.

| Section | Mobile behavior |
|---------|----------------|
| Hero h1 | `text-5xl` wraps naturally |
| Signal chain | Wraps to multiple lines |
| Problem table | Rows stack left/right pair |
| Question | `text-4xl` full-width — strong |
| FROM→TO panel | Before / With AIMETRA stack vertically |
| Student card | Single column, all rows visible |
| AIDA table | `overflow-x-auto`, no cutoff |
| Leadership cols | Three cols → one column |
| Manifesto | `text-3xl`, stacks |

---

## Performance — Preserved

- No new npm packages
- No animation libraries
- No charting libraries on homepage
- Deferred AIDA loading: untouched
- Code splitting: unchanged
- Bundle: homepage is pure static JSX, no new chunks

---

## QA Results

```bash
npx tsc --noEmit   → exit 0
npm run lint       → exit 0 (no new errors)
npm run build      → exit 0
```

---

## Copy Audit — Prohibited Phrases

| Phrase | Present |
|--------|---------|
| empowering | ✗ |
| unlock | ✗ |
| revolutionizing | ✗ |
| game-changing | ✗ |
| seamless | ✗ |
| cutting-edge | ✗ |
| next-generation | ✗ |
| world-class | ✗ |
| AI-powered ecosystem | ✗ |
| future of education | ✗ |

All clear.

---

## Three Visitor Test

**Student** — Sees the profile card: CGPA, rank, projects, research, certifications in one place. The interface answers "why care" without a sentence of marketing copy.

**Faculty** — Sees the faculty profile card: expertise, courses, supervised work, mentees — structured. The headline "Expertise should be discoverable" states the benefit.

**Leadership** — Sees three evidence categories (Academic / Research / Operations) — structured, named, institutional. "Evidence-backed visibility — not surveillance" addresses the authority concern.

---

*AIMETRA Brand Experience Cycle — September 2026*
