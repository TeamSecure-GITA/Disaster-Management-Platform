// ─────────────────────────────────────────────────────────────────────────────
// frontend/src/utils/browserMode.js
//
// Utility to detect if the browser is running in Desktop Mode:
// 1. Mobile phone browser with "Desktop site" / "Request Desktop Website" enabled.
// 2. Regular desktop / laptop computer.
// 3. Normal mobile phone mode (where sidebar should remain as a drawer).
// ─────────────────────────────────────────────────────────────────────────────

export function detectDesktopMode() {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return true; // Default to true in non-browser environments
  }

  const width = window.innerWidth;
  const ua = navigator.userAgent || "";
  const maxTouch = navigator.maxTouchPoints || 0;
  const hasTouch = maxTouch > 0 || "ontouchstart" in window;

  // Check for mobile user agents in NORMAL phone mode
  // Normal Android: contains "Android" AND "Mobile"
  // Normal iPhone: contains "iPhone" AND "Mobile"
  const isNormalMobileUA =
    /Mobile/i.test(ua) &&
    (/Android/i.test(ua) || /iPhone/i.test(ua) || /iPod/i.test(ua) || /Windows Phone/i.test(ua));

  // 1. iOS Safari "Request Desktop Website":
  // Apple changes the userAgent to "Macintosh; Intel Mac OS X ...", removing "iPhone" & "Mobile".
  // However, touch points remain > 1 (real desktop Macs have 0 touch points).
  const isIosPhoneDesktopMode = /Macintosh/i.test(ua) && maxTouch > 1;

  // 2. Android Chrome / Firefox / Edge / Samsung Internet "Desktop site":
  // Android browsers strip "Mobile" from userAgent when Desktop Site is toggled.
  // And the layout viewport expands to >= 980px (or innerWidth > screen.width).
  const isAndroidPhoneDesktopMode =
    hasTouch &&
    !isNormalMobileUA &&
    (width >= 768 || (window.screen && window.screen.width < 768 && width >= 768));

  // 3. Mobile browser Desktop Viewport (universal standard for mobile browsers in desktop mode is >= 980px)
  const isDesktopViewport = width >= 980;

  // 4. Regular Desktop / Laptop PC (no mobile UA and screen width >= 768px)
  const isRegularDesktop = !isNormalMobileUA && width >= 768;

  // If any of the desktop conditions match, return true
  if (isIosPhoneDesktopMode || isAndroidPhoneDesktopMode || isDesktopViewport || isRegularDesktop) {
    return true;
  }

  // Otherwise, user is in normal phone mode (e.g., viewport <= 768px with mobile UA)
  return false;
}
