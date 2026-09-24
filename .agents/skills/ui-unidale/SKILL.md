---
name: ui-unidale
description: Defines the Unidale design system — colors, typography,
  spacing, components, and patterns. Use for EVERY UI element in the hub.
---

# Unidale Design System

## When to use this skill
- Building ANY UI element — pages, components, forms, tables, charts.
- Choosing colors, fonts, spacing, or shadows.
- Designing new features.

## Core Palette (5 colors)

| Token   | Hex       | Usage                       |
|---------|-----------|-----------------------------|
| canvas  | #F2F2F1   | Page background             |
| surface | #FFFFFF   | Cards, modals               |
| ink     | #1E1E1E   | Primary text, primary CTA   |
| sage    | #94B0B8   | Soft accent, active states  |
| amber   | #EEBE1E   | Highlight (1x per screen)   |
| border  | #D6D6D6   | Card borders, dividers      |

## Extended Palette (Status)

| Token   | Hex       | Background |
|---------|-----------|------------|
| success | #7A9A7E   | #EEF3EE    |
| warning | #D9A441   | #FAF3E2    |
| danger  | #B85C5C   | #F5EAEA    |
| info    | #6B8FA3   | #EAF0F3    |

## Neutrals

| Token    | Hex     |
|----------|---------|
| ink-900  | #1E1E1E |
| ink-700  | #3A3A3A |
| ink-500  | #5C5C5C |
| ink-400  | #7A7A7A |
| ink-300  | #9A9A9A |

## Typography

- Font: **Geist** (sans), **Geist Mono** (code)
- Headings: 24–48px, weight 600–700
- Body: 14–16px, weight 400–500
- Captions: 12px, weight 400
- Code: 13–14px, weight 400

## Spacing Scale
4, 8, 12, 16, 24, 32, 48, 64 px

## Border Radius
- Buttons/inputs: 8px
- Cards: 12px
- Modals: 16px
- Badges: 9999px

## Shadows
- card: 0 1px 2px rgba(30,30,30,0.04)
- dropdown: 0 4px 12px rgba(30,30,30,0.08)
- modal: 0 12px 32px rgba(30,30,30,0.12)

## Buttons

| Variant   | Bg          | Text      | Border    |
|-----------|-------------|-----------|-----------|
| Primary   | ink         | surface   | none      |
| Secondary | surface     | ink       | border    |
| Ghost     | transparent | ink-500   | none      |
| Accent    | amber       | ink       | none      |
| Sage      | sage        | ink       | none      |
| Danger    | danger      | surface   | none      |

**Only ONE primary button per screen.**

## Component Patterns

### Card
- Bg: surface
- Border: 1px solid border
- Radius: 12px
- Padding: 16-24px
- Shadow: card
- Resting on canvas

### Table
- Header bg: canvas-alt (#EAEAE8)
- Header text: ink-700
- Row border: border-soft (#E5E5E4)
- Row hover: canvas
- Rank 1 highlight: amber left border (4px)

### Badge
- Success: bg #EEF3EE, text #7A9A7E
- Warning: bg #FAF3E2, text #D9A441
- Danger: bg #F5EAEA, text #B85C5C
- Info: bg #EAF0F3, text #6B8FA3

### Input
- Bg: surface
- Border: border (default), ink (focus), danger (error)
- Radius: 8px
- Placeholder: ink-300

## Rules

1. **Canvas is king**: 80% of screen is canvas or surface.
2. **Ink anchors**: dark charcoal for text and primary CTAs only.
3. **Sage is soft**: badges, active states, section bgs — never large text.
4. **Amber is precious**: once per screen, on the single most important accent.
5. **Borders are structural**: #D6D6D6 everywhere, no heavy shadows.
6. **Status colors are muted**: no saturated reds/greens.
7. **Charts use 4 colors max**: ink, sage, amber, one status.
8. **One primary button per screen.**
9. **Dark mode mirrors light**: same hierarchy, inverted values.
10. **Contrast over decoration**: if it fails WCAG, it's wrong.

## Accessibility

- Text on canvas: 15.8:1 (AAA)
- Text on surface: 16.5:1 (AAA)
- ink-500 on surface: 7.2:1 (AAA)
- ink-400 on surface: 5.1:1 (AA)
- **amber on white: 1.9:1 ❌** — never use as text
- **sage on white: 2.9:1 ⚠️** — only for large text or decorative

## Anti-Patterns (NEVER do these)
- ❌ Saturated reds/greens
- ❌ Amber as text on white
- ❌ More than 4 chart colors
- ❌ Multiple primary buttons
- ❌ Pure black (#000) — use ink
- ❌ Heavy drop shadows
- ❌ Gradients (except subtle hero)
- ❌ Custom fonts — use Geist only

## Dark Mode Tokens

| Token   | Light     | Dark      |
|---------|-----------|-----------|
| canvas  | #F2F2F1   | #161615   |
| surface | #FFFFFF   | #1E1E1D   |
| ink     | #1E1E1E   | #F2F2F1   |
| border  | #D6D6D6   | #2E2E2C   |
| sage    | #94B0B8   | #7A9AA3   |
| amber   | #EEBE1E   | #D9A441   |

---
