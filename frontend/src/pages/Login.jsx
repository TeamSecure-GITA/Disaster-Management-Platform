import React, { useState } from 'react';
import { useNavigate, Link } from "react-router-dom";
import { saveOfflineSession } from "../utils/offlineStorage";
import { loginUser, loginWithGoogle, resetPassword } from "../services/firebaseAuth";
import { initFCM } from "../services/fcmService";

// ─── Reusable helpers ─────────────────────────────────────────────────────────

const inputStyle = {
  padding: "11px 14px",
  borderRadius: "8px",
  border: "1px solid #334155",
  backgroundColor: "#0f172a",
  color: "#fff",
  fontSize: "0.9rem",
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
  transition: "border-color 0.2s",
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail]                     = useState("");
  const [password, setPassword]               = useState("");
  const [role, setRole]                       = useState("user");
  const [error, setError]                     = useState("");
  const [infoMsg, setInfoMsg]                 = useState("");
  const [loading, setLoading]                 = useState(false);
  const [googleLoading, setGoogleLoading]     = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);
  const [showPassword, setShowPassword]       = useState(false);

  // ─── After successful login: persist session + navigate ─────────────────────

  const persistAndNavigate = async ({ uid, name, email: userEmail, role: userRole, token, photoUrl }) => {
    const effectivePhoto = photoUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || userEmail)}`;
    const userData = {
      uid,
      name,
      email: userEmail,
      role: userRole,
      photoUrl: effectivePhoto,
      profileImage: effectivePhoto,
    };

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    await saveOfflineSession(userData);

    // Sync profile data if not already set or update with current session
    const existing = localStorage.getItem("user_profile_data_v2");
    if (!existing) {
      const nameParts = (name || userEmail.split("@")[0]).split(" ");
      const firstName = nameParts[0] || name;
      const lastName = nameParts.slice(1).join(" ") || "";
      const username = userEmail.split("@")[0].toLowerCase().replace(/[^a-z0-9._-]/g, "");

      localStorage.setItem(
        "user_profile_data_v2",
        JSON.stringify({
          username,
          firstName,
          lastName,
          nickname: firstName,
          displayName: name || userEmail.split("@")[0],
          role: userRole === "admin" ? "Administrator" : "Citizen / Responder",
          email: userEmail,
          whatsapp: "",
          website: "https://disaster-management-platform.org",
          telegram: `@${username}`,
          bio: "Disaster Response Platform member.",
          photoUrl: effectivePhoto,
          bloodGroup: "O+",
          emergencyContact: "",
          location: "Bhubaneswar, Odisha",
        })
      );
    }

    // Kick off FCM token registration in background
    initFCM().catch(() => {});
    navigate(userRole === "admin" ? "/admin/tickets" : "/");
  };

  // ─── Email / password submit ─────────────────────────────────────────────────

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setInfoMsg("");
    setLoading(true);

    const enteredId       = email.trim().toLowerCase();
    const enteredPassword = password.trim();

    try {
      // 1. Admin demo shortcut
      if (role === "admin" && (enteredId === "admin" || enteredId === "admin@admin.com") && enteredPassword === "admin123") {
        await persistAndNavigate({
          uid: "admin",
          name: "Admin Commander",
          email: "admin@admin.com",
          role: "admin",
          token: "demo-admin-token",
          photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
        });
        return;
      }

      // 2. User demo shortcut
      if (role === "user" && enteredId === "user" && enteredPassword === "user123") {
        await persistAndNavigate({
          uid: "demo",
          name: "Demo Responder",
          email: "user@demo.com",
          role: "user",
          token: "demo-user-token",
          photoUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=600&q=80",
        });
        return;
      }

      // 3. Firebase email/password
      if (enteredId.includes("@")) {
        const user  = await loginUser(enteredId, enteredPassword);
        const token = await user.getIdToken();
        await persistAndNavigate({
          uid: user.uid,
          name: user.displayName || enteredId.split("@")[0],
          email: user.email,
          role,
          token,
          photoUrl: user.photoURL || null,
        });
        return;
      }

      // 4. Offline fallback
      if (enteredId && enteredPassword) {
        await persistAndNavigate({
          uid: `local-${Date.now()}`,
          name: enteredId,
          email: enteredId,
          role,
          token: `local-token-${Date.now()}`,
        });
        return;
      }

      setError("Please provide a valid email and password.");
    } catch (err) {
      console.error("[Login] Auth Error:", err);
      let message = "Authentication failed. Please check your credentials.";
      if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password" || err.code === "auth/user-not-found") {
        message = "Invalid email or password. Please try again or create an account.";
      } else if (err.code === "auth/invalid-email") {
        message = "Please enter a valid email address.";
      } else if (err.code === "auth/too-many-requests") {
        message = "Too many failed attempts. Please try again later or reset your password.";
      } else if (err.code === "auth/network-request-failed") {
        message = "Network error. Please check your internet connection.";
      } else if (err.message) {
        message = err.message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // ─── Google Sign-In ──────────────────────────────────────────────────────────

  const handleGoogleSignIn = async () => {
    setError("");
    setInfoMsg("");
    setGoogleLoading(true);
    try {
      const user  = await loginWithGoogle();
      const token = await user.getIdToken();
      await persistAndNavigate({
        uid: user.uid,
        name: user.displayName || user.email.split("@")[0],
        email: user.email,
        role,
        token,
        photoUrl: user.photoURL || null,
      });
    } catch (err) {
      console.error("[Login] Google Sign-In error:", err);
      if (err.code === "auth/popup-closed-by-user" || err.code === "auth/cancelled-popup-request") {
        // User dismissed — not an error
      } else if (err.code === "auth/popup-blocked") {
        setError("Popup was blocked. Please allow popups for this site and try again.");
      } else {
        setError(err.message || "Google Sign-In failed. Please try again.");
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  // ─── Forgot password ─────────────────────────────────────────────────────────

  const handleForgotPassword = async () => {
    const enteredEmail = email.trim();
    if (!enteredEmail || !enteredEmail.includes("@")) {
      setError("Please enter your email above, then click 'Forgot password?' again.");
      return;
    }
    try {
      setResettingPassword(true);
      setError("");
      await resetPassword(enteredEmail);
      setInfoMsg(`✅ Password reset email sent to ${enteredEmail}. Check your inbox!`);
    } catch (err) {
      console.error("[Login] Reset error:", err);
      setError(err.message || "Failed to send password reset email.");
    } finally {
      setResettingPassword(false);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", width: "100vw", backgroundColor: "#0f172a", padding: "20px", boxSizing: "border-box" }}>
      <div style={{ width: "100%", maxWidth: "440px", backgroundColor: "#1e293b", borderRadius: "16px", boxShadow: "0 25px 50px rgba(0,0,0,0.6)", color: "#fff", overflow: "hidden" }}>

        {/* Header */}
        <div style={{ background: "linear-gradient(135deg, #1d4ed8, #7c3aed)", padding: "28px 32px", textAlign: "center" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "8px" }}>🛡️</div>
          <h1 style={{ margin: 0, fontSize: "1.4rem", fontWeight: "800" }}>Disaster Management Portal</h1>
          <p style={{ margin: "6px 0 0 0", color: "rgba(255,255,255,0.8)", fontSize: "0.85rem" }}>Sign in to access emergency services</p>
        </div>

        {/* Form body */}
        <div style={{ padding: "28px 32px" }}>

          {/* Error / info banners */}
          {error && (
            <div id="login-error-banner" style={{ backgroundColor: "#450a0a", border: "1px solid #dc2626", color: "#fca5a5", padding: "10px 14px", borderRadius: "8px", marginBottom: "16px", fontSize: "0.875rem" }}>
              ⚠️ {error}
            </div>
          )}
          {infoMsg && (
            <div id="login-info-banner" style={{ backgroundColor: "#064e3b", border: "1px solid #059669", color: "#6ee7b7", padding: "10px 14px", borderRadius: "8px", marginBottom: "16px", fontSize: "0.875rem" }}>
              {infoMsg}
            </div>
          )}

          {/* ── Google Sign-In ─────────────────────────────────────────── */}
          <button
            id="google-signin-btn"
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading || loading}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              backgroundColor: "#fff",
              color: "#1e293b",
              fontWeight: "700",
              fontSize: "0.95rem",
              border: "none",
              cursor: googleLoading || loading ? "wait" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              marginBottom: "16px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
              opacity: googleLoading || loading ? 0.7 : 1,
              transition: "opacity 0.2s, transform 0.1s",
            }}
            onMouseEnter={(e) => { if (!googleLoading && !loading) e.currentTarget.style.transform = "scale(1.01)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
          >
            {googleLoading ? (
              <span>Signing in with Google...</span>
            ) : (
              <>
                {/* Google "G" logo */}
                <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
                Continue with Google
              </>
            )}
          </button>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
            <div style={{ flex: 1, height: "1px", backgroundColor: "#334155" }} />
            <span style={{ color: "#64748b", fontSize: "0.8rem" }}>or sign in with email</span>
            <div style={{ flex: 1, height: "1px", backgroundColor: "#334155" }} />
          </div>

          {/* ── Email/Password form ────────────────────────────────────── */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label htmlFor="login-email" style={{ fontSize: "0.82rem", fontWeight: "600", color: "#94a3b8" }}>Email / User ID</label>
              <input
                id="login-email"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com or 'user'"
                required
                autoComplete="email"
                style={inputStyle}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label htmlFor="login-password" style={{ fontSize: "0.82rem", fontWeight: "600", color: "#94a3b8" }}>Password</label>
                <button
                  type="button"
                  id="forgot-password-btn"
                  onClick={handleForgotPassword}
                  disabled={resettingPassword}
                  style={{ background: "none", border: "none", color: "#38bdf8", fontSize: "0.78rem", cursor: "pointer", padding: 0, textDecoration: "underline" }}
                >
                  {resettingPassword ? "Sending..." : "Forgot password?"}
                </button>
              </div>
              <div style={{ position: "relative" }}>
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                  style={{ ...inputStyle, paddingRight: "44px" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: "1rem", padding: 0 }}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label htmlFor="login-role" style={{ fontSize: "0.82rem", fontWeight: "600", color: "#94a3b8" }}>Access Role</label>
              <select
                id="login-role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                style={{ ...inputStyle }}
              >
                <option value="user">👤 Citizen / Responder</option>
                <option value="admin">🛡️ Administrator</option>
              </select>
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              disabled={loading || googleLoading}
              style={{ marginTop: "4px", padding: "13px", borderRadius: "8px", backgroundColor: "#2563eb", color: "#fff", fontWeight: "700", fontSize: "1rem", border: "none", cursor: loading ? "wait" : "pointer", opacity: loading ? 0.7 : 1, transition: "background 0.2s" }}
            >
              {loading ? "Signing in..." : "Sign In →"}
            </button>

          </form>

          {/* Register link */}
          <div style={{ marginTop: "16px", textAlign: "center", fontSize: "0.85rem", color: "#94a3b8" }}>
            Don't have an account?{" "}
            <Link to="/register" style={{ color: "#38bdf8", fontWeight: "600", textDecoration: "none" }}>
              Create an account
            </Link>
          </div>

          {/* Demo hints */}
          <div style={{ marginTop: "20px", padding: "12px", backgroundColor: "#0f172a", borderRadius: "8px", fontSize: "0.78rem", color: "#64748b" }}>
            <strong style={{ color: "#475569" }}>Demo shortcut credentials:</strong><br />
            👤 User: <code style={{ color: "#38bdf8" }}>user</code> / <code style={{ color: "#38bdf8" }}>user123</code><br />
            🛡️ Admin: <code style={{ color: "#38bdf8" }}>admin</code> / <code style={{ color: "#38bdf8" }}>admin123</code>
          </div>
        </div>
      </div>
    </div>
  );
}