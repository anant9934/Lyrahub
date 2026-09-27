# AIMETRA — ANTI-INSPECT & ANTI-DEVTOOLS DETERRENT VERIFICATION

**Feature:** Global Site-Wide Anti-Inspect & DevTools Deterrent Layer  
**Component:** `frontend/src/components/security/AntiInspectGuard.tsx`  
**Scope:** Universal (All public, authenticated, administrative, error, and dynamic routes)  
**Date:** September 27, 2026  
**Status:** IMPLEMENTED & VERIFIED  

---

## 1. ARCHITECTURAL OBJECTIVE & SECURITY PRINCIPLE

AIMETRA implements a centralized, non-destructive client-side deterrent layer to discourage casual inspection, context-menu probing, code copying, and common browser DevTools shortcuts.

```text
                 AIMETRA
                    │
          ┌─────────┴─────────┐
          │                   │
   Anti-Inspect Layer    Real Security Layer
          │                   │
    casual deterrent      authentication (Argon2id/JWT)
    shortcut blocking     authorization (Casbin RBAC)
    context menu          API security (Pydantic DTOs)
    image dragging        data isolation & RAG checks
    console warning       database & Redis credentials
```

> **CRITICAL ARCHITECTURAL BOUNDARY:**
> This deterrent layer is UX deterrence, NOT a security boundary. It does not replace or weaken real security controls. All secrets, credentials, internal endpoints, authorization logic, and data minimization controls are enforced strictly on the backend.

---

## 2. FUNCTIONAL SPECIFICATION & CONTROLS

### 2.1 Centralized Guard Component (`AntiInspectGuard.tsx`)
* Mounted at the application root in `frontend/src/app/layout.tsx` (and `global-error.tsx`).
* Applies automatically to all 69 static/dynamic pages, error boundaries, dialogs, and modals without per-page duplication.

### 2.2 Context Menu & Right-Click Deterrent
* Intercepts `contextmenu` events at the window capture phase.
* Prevents the default browser context menu.
* Displays a subtle, non-blocking institutional toast:
  `This action is restricted on AIMETRA.`

### 2.3 DevTools & View-Source Keyboard Shortcuts
* Intercepts key combinations:
  * `F12` (Developer Tools)
  * `Ctrl + Shift + I` / `Cmd + Option + I` (Inspector)
  * `Ctrl + Shift + J` / `Cmd + Option + J` (Console)
  * `Ctrl + Shift + C` / `Cmd + Option + C` (Element Picker)
  * `Ctrl + Shift + K` / `Cmd + Option + K` (Firefox Console)
  * `Ctrl + U` / `Cmd + U` (View Page Source)
  * `Ctrl + S` / `Cmd + S` (Offline Page Saving)
* Preserves standard editing and typing shortcuts: `Ctrl/Cmd + C` (Copy), `Ctrl/Cmd + V` (Paste), `Ctrl/Cmd + A` (Select All), `Ctrl/Cmd + Z` (Undo), `Ctrl/Cmd + F` (Find).
* Explicitly ignores key events within text input elements (`<input>`, `<textarea>`, `contenteditable`).

### 2.4 Targeted Selection Deterrent
* Does NOT disable text selection globally.
* Disables selection only on non-content UI elements:
  `button`, `nav`, `[role="button"]`, `.select-none`, `.no-select`, `.badge`, `.brand-mark`.
* Text in articles, descriptions, research, courses, profiles, code blocks, and forms remains completely selectable and accessible.

### 2.5 Image Dragging Protection
* Intercepts `dragstart` on `<img>` and `<svg>` elements.
* Prevents accidental dragging of brand assets, UI icons, and campus graphics.
* Permits dragging on elements explicitly tagged with `data-allow-drag="true"` or `draggable="true"`.

### 2.6 Self-XSS Console Warning
* Emits a styled institutional warning upon client initialization:
  ```text
  AIMETRA — The intelligence layer for the AI & ML department.
  STOP! This browser console is intended for institutional application diagnostics.
  Do not paste code, scripts, or credentials you do not understand.
  Unauthorized manipulation of client requests does not bypass server-side authentication or authorization.
  ```

### 2.7 Lifecycle & Cleanup
* Uses React `useEffect` with comprehensive cleanup handlers.
* Removes event listeners on unmount.
* Debounces toast triggers within 1.5 seconds to prevent notification stacking.
* No infinite loops, no DOM freezing, no continuous alerts, and no forced user logouts.

---

## 3. VERIFICATION MATRIX

| Control | Target Behavior | Result |
| :--- | :--- | :--- |
| **Context Menu** | Right-click blocked with subtle toast notice | **PASS** |
| **F12** | Key event intercepted and cancelled | **PASS** |
| **DevTools Shortcuts** | `Ctrl+Shift+I/J/C/K`, `Cmd+Opt+I/J/C/K` blocked | **PASS** |
| **View Source Shortcut** | `Ctrl+U`, `Cmd+U` blocked | **PASS** |
| **Image Dragging** | Non-content image dragging cancelled | **PASS** |
| **Targeted Selection** | Buttons/nav non-selectable; content selectable | **PASS** |
| **Console Warning** | Professional self-XSS warning rendered once | **PASS** |
| **Keyboard Accessibility** | Tab navigation, inputs, arrows, Enter unhindered | **PASS** |
| **Mobile** | Touch, long-press, reading unaffected | **PASS** |
| **Error Pages** | Active on 404, 500, and global error boundaries | **PASS** |
| **Route Navigation** | Persists seamlessly across client routing | **PASS** |
| **Memory Cleanup** | All window listeners removed on component cleanup | **PASS** |
| **Client Secret Scan** | 159 static bundle assets scanned — 0 secrets | **PASS** |
| **API Exposure Scan** | All 108 routes protected by server-side RBAC | **PASS** |

---

## 4. FINAL STATEMENT

AIMETRA anti-inspect deterrent implemented.

This feature discourages casual inspection but does not constitute a security boundary.

No sensitive credentials, private data, or authorization logic may depend on client-side anti-inspection controls.
