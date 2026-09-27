"use client";

import React, { useEffect, useState, useRef } from "react";

/**
 * AntiInspectGuard
 *
 * Site-wide anti-inspect deterrent layer for AIMETRA.
 *
 * NOTE: This is a client-side deterrence layer, NOT a security boundary.
 * Genuine security boundaries (authentication, authorization, data isolation,
 * API security, secrets) remain strictly enforced on the server.
 */
export function AntiInspectGuard() {
  const [notification, setNotification] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastTriggerRef = useRef<number>(0);

  useEffect(() => {
    // Check if anti-inspect is disabled via configuration
    if (process.env.NEXT_PUBLIC_ANTI_INSPECT === "false") {
      return;
    }

    // 1. Console Warning (executed once on client initialization)
    try {
      console.log(
        "%c AIMETRA %c The intelligence layer for the AI & ML department.",
        "background: #111111; color: #FFFFFF; font-size: 13px; font-weight: 700; padding: 4px 8px; border-radius: 4px;",
        "background: #F5F5F5; color: #333333; font-size: 12px; padding: 4px 8px;"
      );
      console.log(
        "%cSTOP!%c This browser console is intended for institutional application diagnostics.\n" +
          "Do not paste code, scripts, or credentials you do not understand.\n" +
          "Unauthorized manipulation of client requests does not bypass server-side authentication or authorization.",
        "color: #DC2626; font-size: 14px; font-weight: bold;",
        "color: #555555; font-size: 12px;"
      );
    } catch {
      // Ignore console logging errors in constrained environments
    }

    const showNotification = (msg: string) => {
      const now = Date.now();
      // Debounce notification triggers within 1.5 seconds to avoid spam
      if (now - lastTriggerRef.current < 1500) {
        return;
      }
      lastTriggerRef.current = now;

      setNotification(msg);
      setVisible(true);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        setVisible(false);
        timeoutRef.current = setTimeout(() => {
          setNotification(null);
        }, 200);
      }, 2000);
    };

    // 2. Right-Click / Context Menu Deterrent
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      showNotification("This action is restricted on AIMETRA.");
    };

    // 3. DevTools and View-Source Keyboard Shortcut Deterrent
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInput =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable ||
          target.getAttribute?.("role") === "textbox");

      const key = e.key ? e.key.toLowerCase() : "";
      const isCtrlOrMeta = e.ctrlKey || e.metaKey;
      const isShift = e.shiftKey;
      const isAlt = e.altKey;

      // F12 or keyCode 123
      if (e.key === "F12" || e.keyCode === 123) {
        e.preventDefault();
        e.stopPropagation();
        showNotification("Developer inspection shortcuts are restricted.");
        return;
      }

      // DevTools Inspection: Ctrl+Shift+I, Cmd+Option+I, Ctrl+Shift+J, Cmd+Option+J, Ctrl+Shift+C, Cmd+Option+C, Ctrl+Shift+K, Cmd+Option+K
      const isInspectKey =
        key === "i" || key === "j" || key === "c" || key === "k";

      if (isInspectKey) {
        if ((isCtrlOrMeta && isShift) || (e.metaKey && isAlt)) {
          e.preventDefault();
          e.stopPropagation();
          showNotification("Developer inspection shortcuts are restricted.");
          return;
        }
      }

      // View Source: Ctrl+U or Cmd+U (only when not editing text)
      if (key === "u" && isCtrlOrMeta && !isShift && !isAlt && !isInput) {
        e.preventDefault();
        e.stopPropagation();
        showNotification("Source inspection is restricted on AIMETRA.");
        return;
      }

      // Normal browser controls (Save, Print, Copy, Paste, Find, Tab navigation) remain completely unhindered
    };

    // 4. Image Dragging Deterrent (UI icons, branding logos, decorative imagery)
    const handleDragStart = (e: DragEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const isImage =
        target.tagName === "IMG" ||
        target.tagName === "SVG" ||
        target.closest("img") ||
        target.closest("svg");

      if (isImage) {
        // Allow drag if explicitly permitted (e.g., downloadable resources)
        const isAllowed =
          target.getAttribute?.("data-allow-drag") === "true" ||
          target.getAttribute?.("draggable") === "true";

        if (!isAllowed) {
          e.preventDefault();
        }
      }
    };

    // Attach listeners at window level with capture for keydown to intercept before browser defaults
    window.addEventListener("contextmenu", handleContextMenu, { capture: true });
    window.addEventListener("keydown", handleKeyDown, { capture: true });
    window.addEventListener("dragstart", handleDragStart, { capture: true });

    // Proper React lifecycle cleanup
    return () => {
      window.removeEventListener("contextmenu", handleContextMenu, { capture: true });
      window.removeEventListener("keydown", handleKeyDown, { capture: true });
      window.removeEventListener("dragstart", handleDragStart, { capture: true });

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  if (!notification) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none transition-all duration-200 ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      }`}
    >
      <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#111111] text-white shadow-2xl border border-neutral-800 text-xs font-medium tracking-normal select-none">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
        <span>{notification}</span>
      </div>
    </div>
  );
}

export default AntiInspectGuard;
