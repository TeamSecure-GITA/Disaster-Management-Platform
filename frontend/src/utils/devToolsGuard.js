// ─────────────────────────────────────────────────────────────────────────────
// src/utils/devToolsGuard.js
//
// Prevents non-admin users from opening browser DevTools (Inspect Element).
// Head Administrators and authorized admins are fully exempt.
//
// Blocks: Right-click context menu, F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
// ─────────────────────────────────────────────────────────────────────────────
import { isAuthorizedAdmin, isHeadAdmin } from "./adminAuth";

/**
 * Check if the current session user is an admin (exempt from DevTools block).
 */
function isCurrentUserAdmin() {
  try {
    const sources = ["user", "user_session", "user_profile_data_v2"];
    for (const key of sources) {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        const email = parsed?.email || "";
        if (email && (isHeadAdmin(email) || isAuthorizedAdmin(email))) {
          return true;
        }
      }
    }
  } catch {
    // If anything fails, treat as non-admin
  }
  return false;
}

/**
 * Show a styled toast notification when DevTools access is blocked.
 */
function showBlockedToast() {
  // Prevent duplicate toasts
  if (document.getElementById("devtools-guard-toast")) return;

  const toast = document.createElement("div");
  toast.id = "devtools-guard-toast";
  Object.assign(toast.style, {
    position: "fixed",
    bottom: "24px",
    right: "24px",
    zIndex: "999999",
    backgroundColor: "#1e293b",
    color: "#f8fafc",
    border: "1.5px solid #ef4444",
    padding: "14px 22px",
    borderRadius: "12px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
    fontSize: "0.88rem",
    fontWeight: "700",
    fontFamily: "system-ui, -apple-system, sans-serif",
    maxWidth: "420px",
    lineHeight: "1.5",
  });

  toast.innerHTML = `
    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
      <span style="font-size: 1.1rem;">🔒</span>
      <span style="color: #f87171;">Developer Tools Access Restricted</span>
    </div>
    <div style="font-size: 0.8rem; color: #94a3b8; font-weight: 500;">
      Source code inspection is disabled for security purposes. Contact the Head Administrator at
      <strong style="color: #38bdf8;">teamsecure.project@gmail.com</strong> for developer access.
    </div>
  `;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.transition = "opacity 0.4s";
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 500);
  }, 4000);
}

/**
 * Initialize the DevTools guard. Call once on app mount.
 * Listens for keyboard shortcuts and context menu to block DevTools.
 */
export function initDevToolsGuard() {
  // Re-check admin status periodically (in case of login/logout)
  // but cache the result for performance during event handlers
  let cachedIsAdmin = isCurrentUserAdmin();

  // Re-evaluate admin status every 10 seconds
  const adminCheckInterval = setInterval(() => {
    cachedIsAdmin = isCurrentUserAdmin();
  }, 10000);

  // ── Block keyboard shortcuts ──────────────────────────────────────────
  function handleKeyDown(e) {
    if (cachedIsAdmin) return; // Admins get full access

    // F12
    if (e.key === "F12") {
      e.preventDefault();
      e.stopPropagation();
      showBlockedToast();
      return;
    }

    // Ctrl+Shift+I (Inspect), Ctrl+Shift+J (Console), Ctrl+Shift+C (Element picker)
    if (e.ctrlKey && e.shiftKey && ["I", "i", "J", "j", "C", "c"].includes(e.key)) {
      e.preventDefault();
      e.stopPropagation();
      showBlockedToast();
      return;
    }

    // Ctrl+U (View Source)
    if (e.ctrlKey && (e.key === "u" || e.key === "U")) {
      e.preventDefault();
      e.stopPropagation();
      showBlockedToast();
      return;
    }
  }

  // ── Block right-click context menu ────────────────────────────────────
  function handleContextMenu(e) {
    if (cachedIsAdmin) return; // Admins get full access

    e.preventDefault();
    showBlockedToast();
  }

  document.addEventListener("keydown", handleKeyDown, true);
  document.addEventListener("contextmenu", handleContextMenu, true);

  // Return a cleanup function
  return () => {
    clearInterval(adminCheckInterval);
    document.removeEventListener("keydown", handleKeyDown, true);
    document.removeEventListener("contextmenu", handleContextMenu, true);
  };
}
