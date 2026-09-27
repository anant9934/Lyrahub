/**
 * Centralized Device & Viewport Capabilities
 * SSR-safe detection for viewport, pointer, network, accessibility, and environment signals.
 * Never accesses restricted private hardware, Wi-Fi, MAC address, or router details.
 */

export interface DeviceCapabilities {
  // Viewport & Screen Dimensions
  viewportWidth: number;
  viewportHeight: number;
  visualViewportWidth: number;
  visualViewportHeight: number;
  screenWidth: number;
  screenHeight: number;
  devicePixelRatio: number;
  orientation: "portrait" | "landscape";

  // Touch & Pointer Capabilities
  touchSupport: boolean;
  maxTouchPoints: number;
  pointerCapability: "fine" | "coarse" | "none";
  hoverCapability: "hover" | "none";

  // Hardware Hints (non-invasive, where supported)
  hardwareConcurrency?: number;
  deviceMemory?: number;

  // Network & Performance Hints
  effectiveType?: "slow-2g" | "2g" | "3g" | "4g";
  downlink?: number;
  rtt?: number;
  saveData: boolean;
  online: boolean;

  // Accessibility & Environment Preferences
  prefersReducedMotion: boolean;
  prefersContrast: "no-preference" | "more" | "less" | "custom";
  forcedColors: boolean;
  colorScheme: "light" | "dark";

  // Display Mode / PWA state
  isStandalone: boolean;

  // Hydration sync indicator
  isMounted: boolean;
}

export const DEFAULT_CAPABILITIES: DeviceCapabilities = {
  viewportWidth: 1280,
  viewportHeight: 800,
  visualViewportWidth: 1280,
  visualViewportHeight: 800,
  screenWidth: 1280,
  screenHeight: 800,
  devicePixelRatio: 1,
  orientation: "landscape",

  touchSupport: false,
  maxTouchPoints: 0,
  pointerCapability: "fine",
  hoverCapability: "hover",

  hardwareConcurrency: 4,
  deviceMemory: 8,

  effectiveType: "4g",
  downlink: 10,
  rtt: 50,
  saveData: false,
  online: true,

  prefersReducedMotion: false,
  prefersContrast: "no-preference",
  forcedColors: false,
  colorScheme: "light",

  isStandalone: false,
  isMounted: false,
};

/**
 * Safely inspects the browser environment and returns live capabilities.
 * Safe to call in browser only.
 */
export function getLiveCapabilities(): DeviceCapabilities {
  if (typeof window === "undefined") {
    return DEFAULT_CAPABILITIES;
  }

  // Viewport
  const vw = window.innerWidth || document.documentElement.clientWidth || 1280;
  const vh = window.innerHeight || document.documentElement.clientHeight || 800;
  const vv = window.visualViewport;
  const visualVw = vv ? vv.width : vw;
  const visualVh = vv ? vv.height : vh;

  // Screen
  const sw = window.screen?.width || vw;
  const sh = window.screen?.height || vh;
  const dpr = window.devicePixelRatio || 1;
  const orientation: "portrait" | "landscape" =
    vh > vw ? "portrait" : "landscape";

  // Safe media query evaluator that won't throw when matchMedia is missing or restricted
  const safeMatch = (query: string): boolean => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return false
    }
    try {
      return window.matchMedia(query).matches
    } catch {
      return false
    }
  }

  // Touch & Pointer
  const maxTouchPoints = navigator.maxTouchPoints || 0;
  const touchSupport =
    "ontouchstart" in window ||
    maxTouchPoints > 0 ||
    safeMatch("(pointer: coarse)");

  const pointerCapability = safeMatch("(pointer: coarse)")
    ? "coarse"
    : safeMatch("(pointer: fine)")
    ? "fine"
    : "none";

  const hoverCapability = safeMatch("(hover: hover)")
    ? "hover"
    : "none";

  // Network info (Network Information API)
  const nav = navigator as Navigator & {
    connection?: {
      effectiveType?: "slow-2g" | "2g" | "3g" | "4g";
      downlink?: number;
      rtt?: number;
      saveData?: boolean;
    };
    deviceMemory?: number;
  };

  const connection = nav.connection;
  const effectiveType = connection?.effectiveType || "4g";
  const downlink = connection?.downlink;
  const rtt = connection?.rtt;
  const saveData = Boolean(connection?.saveData);
  const online = typeof navigator.onLine === "boolean" ? navigator.onLine : true;

  // Hardware hints
  const hardwareConcurrency = navigator.hardwareConcurrency;
  const deviceMemory = nav.deviceMemory;

  // Accessibility
  const prefersReducedMotion = safeMatch("(prefers-reduced-motion: reduce)");

  let prefersContrast: DeviceCapabilities["prefersContrast"] = "no-preference";
  if (safeMatch("(prefers-contrast: more)")) {
    prefersContrast = "more";
  } else if (safeMatch("(prefers-contrast: less)")) {
    prefersContrast = "less";
  } else if (safeMatch("(prefers-contrast: custom)")) {
    prefersContrast = "custom";
  }

  const forcedColors = safeMatch("(forced-colors: active)");
  const colorScheme = safeMatch("(prefers-color-scheme: dark)")
    ? "dark"
    : "light";

  // PWA Standalone check
  const isStandalone =
    safeMatch("(display-mode: standalone)") ||
    (navigator as unknown as { standalone?: boolean }).standalone === true;

  return {
    viewportWidth: vw,
    viewportHeight: vh,
    visualViewportWidth: visualVw,
    visualViewportHeight: visualVh,
    screenWidth: sw,
    screenHeight: sh,
    devicePixelRatio: dpr,
    orientation,

    touchSupport,
    maxTouchPoints,
    pointerCapability,
    hoverCapability,

    hardwareConcurrency,
    deviceMemory,

    effectiveType,
    downlink,
    rtt,
    saveData,
    online,

    prefersReducedMotion,
    prefersContrast,
    forcedColors,
    colorScheme,

    isStandalone,
    isMounted: true,
  };
}
