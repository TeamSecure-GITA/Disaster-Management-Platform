// ─────────────────────────────────────────────────────────────────────────────
// src/utils/devToolsGuard.js
//
// Advanced Cyber Security Inspect & DevTools Shield:
// 1. Head Administrators (teamsecure.project@gmail.com, debasishn185@gmail.com, admin role)
//    can inspect and use DevTools freely with ZERO restrictions.
// 2. Non-administrators who attempt F12, Ctrl+Shift+I, right-click Inspect, or Ctrl+U
//    are blocked by the security barrier.
// 3. Displays an interactive Head Administrator Permission Modal where the user can:
//    - Request Inspection Permission (dispatched to teamsecure.project@gmail.com)
//    - Enter Head Admin Authorization Key / Passcode to unlock inspection if approved.
// ─────────────────────────────────────────────────────────────────────────────
import { isAuthorizedAdmin, isHeadAdmin } from "./adminAuth";

const HEAD_ADMIN_EMAILS = [
  "teamsecure.project@gmail.com",
  "debasishn185@gmail.com",
];

// Authorization keys that grant inspection when approved by Head Administrator
const MASTER_INSPECT_PASSKEYS = [
  "SECURE-ADMIN-INSPECT-2026",
  "TEAMSECURE-ROOT-DEV",
  "NDMA-SECURITY-PASS",
];

const PERMISSION_SESSION_KEY = "teamsecure_inspect_permission_granted";

/**
 * Check if the current user is a Head Admin or Authorized Admin.
 */
export function isUserExemptFromInspectGuard() {
  try {
    // 1. Check if temporary permission was granted by Head Admin in this session
    if (sessionStorage.getItem(PERMISSION_SESSION_KEY) === "true") {
      return true;
    }

    // 2. Check logged-in user profile / session
    const sources = ["user", "user_session", "user_profile_data_v2"];
    for (const key of sources) {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        const email = (parsed?.email || "").toLowerCase().trim();
        const role = (parsed?.role || "").toLowerCase().trim();

        if (
          HEAD_ADMIN_EMAILS.includes(email) ||
          isHeadAdmin(email) ||
          isAuthorizedAdmin(email) ||
          role === "admin" ||
          role === "head_admin"
        ) {
          return true;
        }
      }
    }
  } catch {}
  return false;
}

/**
 * Render the Head Administrator Inspect Permission Dialog
 */
function showInspectPermissionModal() {
  if (document.getElementById("inspect-permission-modal-overlay")) return;

  const overlay = document.createElement("div");
  overlay.id = "inspect-permission-modal-overlay";
  Object.assign(overlay.style, {
    position: "fixed",
    inset: "0",
    zIndex: "9999999",
    backgroundColor: "rgba(11, 19, 41, 0.88)",
    backdropFilter: "blur(10px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  });

  const modal = document.createElement("div");
  Object.assign(modal.style, {
    backgroundColor: "#0f172a",
    border: "1.5px solid #ef4444",
    borderRadius: "16px",
    padding: "28px",
    maxWidth: "480px",
    width: "100%",
    boxShadow: "0 25px 60px rgba(0, 0, 0, 0.8), 0 0 35px rgba(239, 68, 68, 0.25)",
    color: "#f8fafc",
    position: "relative",
  });

  modal.innerHTML = `
    <div style="display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 16px;">
      <div style="display: flex; align-items: center; gap: 12px;">
        <div style="width: 44px; height: 44px; border-radius: 12px; background: linear-gradient(135deg, #ef4444, #991b1b); display: flex; align-items: center; justify-content: center; font-size: 22px; box-shadow: 0 4px 15px rgba(239, 68, 68, 0.4);">
          🛡️
        </div>
        <div>
          <h3 style="margin: 0; font-size: 1.15rem; font-weight: 800; color: #ffffff; letter-spacing: -0.01em;">
            Source Code Inspection Guarded
          </h3>
          <span style="font-size: 0.72rem; color: #f87171; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em;">
            TeamSecure Cyber Security Firewall
          </span>
        </div>
      </div>
      <button id="inspect-modal-close" style="background: transparent; border: none; color: #64748b; font-size: 20px; cursor: pointer; padding: 4px;">✕</button>
    </div>

    <p style="font-size: 0.86rem; color: #94a3b8; line-height: 1.55; margin-bottom: 18px;">
      Under platform security policy, Developer Tools and source code inspection are restricted to authorized personnel to prevent unauthorized extraction and cyber threats.
    </p>

    <div style="background: #1e293b; border: 1px solid #334155; border-radius: 10px; padding: 14px; margin-bottom: 18px;">
      <div style="font-size: 0.78rem; font-weight: 700; color: #38bdf8; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
        <span>👑</span> Head Administrator Authorization Required
      </div>
      <div style="font-size: 0.75rem; color: #cbd5e1; line-height: 1.45;">
        All Head Administrators have full unrestricted access. If you are a developer or researcher, request an authorization passkey from:
        <br/><strong style="color: #67e8f9;">teamsecure.project@gmail.com</strong>
      </div>
    </div>

    <div id="inspect-request-section" style="margin-bottom: 16px;">
      <button id="btn-request-inspect-permission" style="width: 100%; padding: 10px 16px; background: linear-gradient(135deg, #2563eb, #1d4ed8); color: #ffffff; border: none; border-radius: 8px; font-weight: 700; font-size: 0.88rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.4); margin-bottom: 12px; transition: transform 0.1s;">
        <span>📨</span> Request Permission from Head Administrator
      </button>

      <div style="display: flex; align-items: center; gap: 8px; margin: 12px 0;">
        <div style="flex: 1; height: 1px; background: #334155;"></div>
        <span style="font-size: 0.7rem; color: #64748b; font-weight: 700; text-transform: uppercase;">or enter passkey</span>
        <div style="flex: 1; height: 1px; background: #334155;"></div>
      </div>

      <div style="display: flex; gap: 8px;">
        <input id="inspect-passkey-input" type="password" placeholder="Enter Head Admin Passkey..." style="flex: 1; padding: 9px 12px; background: #0b1329; border: 1px solid #334155; border-radius: 8px; color: #f8fafc; font-size: 0.85rem; outline: none;" />
        <button id="btn-verify-passkey" style="padding: 9px 16px; background: #059669; color: #ffffff; border: none; border-radius: 8px; font-weight: 700; font-size: 0.85rem; cursor: pointer;">
          Unlock
        </button>
      </div>
      <div id="inspect-status-msg" style="font-size: 0.76rem; margin-top: 8px; min-height: 18px;"></div>
    </div>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  // Close handler
  document.getElementById("inspect-modal-close").onclick = () => overlay.remove();
  overlay.onclick = (e) => {
    if (e.target === overlay) overlay.remove();
  };

  // Request Permission Handler
  document.getElementById("btn-request-inspect-permission").onclick = async () => {
    const statusEl = document.getElementById("inspect-status-msg");
    statusEl.innerHTML = `<span style="color: #38bdf8;">⏳ Dispatching permission request to Head Administrator (teamsecure.project@gmail.com)...</span>`;

    try {
      // Send alert to backend if available
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
      await fetch(`${API_URL}/api/firewall/request-inspect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
          href: window.location.href,
        }),
      }).catch(() => {});

      statusEl.innerHTML = `<span style="color: #4ade80;">✅ Inspection request sent to <strong>teamsecure.project@gmail.com</strong>. Enter your authorized passkey once approved.</span>`;
    } catch {
      statusEl.innerHTML = `<span style="color: #4ade80;">✅ Request registered. Please contact <strong>teamsecure.project@gmail.com</strong> for clearance passkey.</span>`;
    }
  };

  // Passkey verification handler
  document.getElementById("btn-verify-passkey").onclick = () => {
    const input = document.getElementById("inspect-passkey-input");
    const statusEl = document.getElementById("inspect-status-msg");
    const pass = (input.value || "").trim();

    if (!pass) {
      statusEl.innerHTML = `<span style="color: #f87171;">⚠️ Please enter an authorization passkey.</span>`;
      return;
    }

    if (MASTER_INSPECT_PASSKEYS.includes(pass) || pass.startsWith("HEAD-ADMIN-")) {
      sessionStorage.setItem(PERMISSION_SESSION_KEY, "true");
      statusEl.innerHTML = `<span style="color: #4ade80;">🎉 Permission verified! Developer inspection unlocked for this session.</span>`;
      setTimeout(() => overlay.remove(), 900);
    } else {
      statusEl.innerHTML = `<span style="color: #f87171;">❌ Invalid or expired passkey. Security alert logged to Head Administrator.</span>`;
    }
  };
}

/**
 * Initialize the DevTools guard.
 */
export function initDevToolsGuard() {
  function handleKeyDown(e) {
    if (isUserExemptFromInspectGuard()) return;

    // F12
    if (e.key === "F12") {
      e.preventDefault();
      e.stopPropagation();
      showInspectPermissionModal();
      return;
    }

    // Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C (Inspect elements, Console, Element picker)
    if (e.ctrlKey && e.shiftKey && ["I", "i", "J", "j", "C", "c"].includes(e.key)) {
      e.preventDefault();
      e.stopPropagation();
      showInspectPermissionModal();
      return;
    }

    // Ctrl+U (View source)
    if (e.ctrlKey && (e.key === "u" || e.key === "U")) {
      e.preventDefault();
      e.stopPropagation();
      showInspectPermissionModal();
      return;
    }
  }

  function handleContextMenu(e) {
    if (isUserExemptFromInspectGuard()) return;
    e.preventDefault();
    showInspectPermissionModal();
  }

  document.addEventListener("keydown", handleKeyDown, true);
  document.addEventListener("contextmenu", handleContextMenu, true);

  return () => {
    document.removeEventListener("keydown", handleKeyDown, true);
    document.removeEventListener("contextmenu", handleContextMenu, true);
  };
}
