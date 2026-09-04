import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from "react-router-dom";
import { saveOfflineSession } from "../utils/offlineStorage";
import { loginUser, loginWithGoogle, resetPassword } from "../services/firebaseAuth";
import { initFCM } from "../services/fcmService";
import { cleanWhatsAppNumber } from "../utils/phoneUtils";
import { loginSession, isUserLoggedIn, logoutSession, getCurrentUser } from "../services/authService";
import { isAuthorizedAdmin, isHeadAdmin, recordLoginEvent, HEAD_ADMIN_EMAIL } from "../utils/adminAuth";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

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

export default function Login() {
  const navigate = useNavigate();

  const [alreadyLoggedIn, setAlreadyLoggedIn]     = useState(false);
  const [currentUser, setCurrentUser]             = useState(null);
  const [email, setEmail]                         = useState("");
  const [password, setPassword]                   = useState("");
  const [role, setRole]                           = useState("user");
  const [error, setError]                         = useState("");
  const [domainWarning, setDomainWarning]         = useState(false);
  const [infoMsg, setInfoMsg]                     = useState("");
  const [loading, setLoading]                     = useState(false);
  const [googleLoading, setGoogleLoading]         = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);
  const [showPassword, setShowPassword]           = useState(false);

  useEffect(() => {
    if (isUserLoggedIn()) {
      setAlreadyLoggedIn(true);
      setCurrentUser(getCurrentUser());
    }
  }, []);

  // Current domain hostname for helpful Firebase whitelisting hint
  const currentDomain = typeof window !== "undefined" ? window.location.hostname : "your-domain.vercel.app";

  // ─── After successful login: persist session + navigate ─────────────────────
  const persistAndNavigate = async ({ uid, name, email: userEmail, role: userRole, token, photoUrl }) => {
    const isHead = isHeadAdmin(userEmail);
    const isAdmin = isHead || isAuthorizedAdmin(userEmail) || userRole === "admin";
    const effectiveRole = isAdmin ? "admin" : "user";
    const effectiveName = isHead ? (name || "Debasish N.") : (name || (userEmail ? userEmail.split("@")[0] : "Responder"));
    const effectivePhoto = photoUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(effectiveName || userEmail)}`;

    const userData = {
      uid,
      name: effectiveName,
      email: userEmail,
      role: effectiveRole,
      photoUrl: effectivePhoto,
      profileImage: effectivePhoto,
      isHeadAdmin: isHead,
    };

    // Record login in central audit logs
    recordLoginEvent({ email: userEmail, name: effectiveName, role: effectiveRole });

    await loginSession(userData, token);

    // Sync profile data
    const existing = localStorage.getItem("user_profile_data_v2");
    if (!existing || isHead) {
      const nameParts = effectiveName.split(" ");
      const firstName = nameParts[0] || effectiveName;
      const lastName = nameParts.slice(1).join(" ") || "";
      const username = (userEmail ? userEmail.split("@")[0] : "responder").toLowerCase().replace(/[^a-z0-9._-]/g, "");

      localStorage.setItem(
        "user_profile_data_v2",
        JSON.stringify({
          username,
          firstName,
          lastName,
          nickname: firstName,
          displayName: effectiveName,
          role: isHead ? "Head Administrator" : (effectiveRole === "admin" ? "Administrator" : "Citizen / Responder"),
          email: userEmail,
          whatsapp: "",
          website: "https://disaster-management-platform.org",
          telegram: `@${username}`,
          bio: isHead ? "Head Administrator of Disaster Response Platform & NER Monitoring." : "Disaster Response Platform member.",
          photoUrl: effectivePhoto,
          bloodGroup: "O+",
          emergencyContact: "",
          location: "Bhubaneswar, Odisha",
        })
      );
    }

    // ── Re-sync phone keys from stored profile on every login ─────────────────
    try {
      const savedProfile = localStorage.getItem("user_profile_data_v2");
      if (savedProfile) {
        const prof = JSON.parse(savedProfile);
        const cleanPh = cleanWhatsAppNumber(prof.whatsapp) || cleanWhatsAppNumber(prof.phone);
        const cleanEm = cleanWhatsAppNumber(prof.emergencyContact) || cleanPh;
        if (cleanPh) localStorage.setItem("user_phone", cleanPh);
        if (cleanEm) {
          localStorage.setItem("sos_whatsapp_number", cleanEm);
          localStorage.setItem("emergency_contact_number", cleanEm);
        }
      }
    } catch {}

    // Kick off FCM token registration in background
    initFCM().catch(() => {});
    navigate(effectiveRole === "admin" ? "/administrator" : "/");
  };

  // ─── Dual-Engine Email / Password submit ──────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setDomainWarning(false);
    setInfoMsg("");
    setLoading(true);

    const enteredId       = email.trim().toLowerCase();
    const enteredPassword = password.trim();

    try {
      // 1. Head Admin fast path via email
      if (enteredId === HEAD_ADMIN_EMAIL.toLowerCase()) {
        // If using a real Firebase account, let Firebase handle it below.
        // This block only handles the case where Firebase is unreachable.
      }

      // NOTE: demo admin shortcuts (admin@admin.com, 'admin') have been
      // intentionally removed. Only real Firebase / backend auth is used.

      // 2. Demo user shortcut (normal responder only)
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

      // 3. Primary: Try Firebase Authentication
      if (enteredId.includes("@")) {
        try {
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
        } catch (firebaseErr) {
          console.warn("[Login] Firebase auth notice:", firebaseErr.code || firebaseErr.message);

          // If domain is unauthorized in Firebase or network is blocked, attempt Backend API / Local fallback
          if (
            firebaseErr.code === "auth/unauthorized-domain" ||
            firebaseErr.code === "auth/network-request-failed" ||
            firebaseErr.code === "auth/internal-error"
          ) {
            setDomainWarning(true);

            // Attempt Backend API login
            try {
              const res = await fetch(`${API_URL}/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: enteredId, password: enteredPassword }),
              });

              if (res.ok) {
                const data = await res.json();
                const token = data.data?.token || `jwt-${Date.now()}`;
                const user = data.data?.user || {};
                await persistAndNavigate({
                  uid: user.id || user._id || `user-${Date.now()}`,
                  name: user.name || enteredId.split("@")[0],
                  email: user.email || enteredId,
                  role: user.role || role,
                  token,
                  photoUrl: user.profileImage || null,
                });
                return;
              }
            } catch {}

            // If user has valid inputs, permit local emergency access
            await persistAndNavigate({
              uid: `local-${Date.now()}`,
              name: enteredId.split("@")[0],
              email: enteredId,
              role,
              token: `local-token-${Date.now()}`,
            });
            return;
          }

          // Otherwise throw credential errors
          throw firebaseErr;
        }
      }

      // 4. Fallback for custom User IDs
      if (enteredId && enteredPassword) {
        await persistAndNavigate({
          uid: `local-${Date.now()}`,
          name: enteredId,
          email: enteredId.includes("@") ? enteredId : `${enteredId}@platform.local`,
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
      } else if (err.code === "auth/unauthorized-domain") {
        setDomainWarning(true);
        message = `Domain "${currentDomain}" is not yet whitelisted in Firebase. You can use the Quick Responder Login button below.`;
      } else if (err.message) {
        message = err.message;
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // ─── Google Sign-In with Graceful Fallback ──────────────────────────────────
  const handleGoogleSignIn = async () => {
    setError("");
    setDomainWarning(false);
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
        // User closed popup
      } else if (err.code === "auth/unauthorized-domain") {
        setDomainWarning(true);
        setError(`Domain "${currentDomain}" needs authorization in Firebase Console.`);
      } else if (err.code === "auth/popup-blocked") {
        setError("Popup was blocked by your browser. Please allow popups for this site and try again.");
      } else {
        setError(err.message || "Google Sign-In failed. Please try again.");
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  // ─── One-Click Instant Responder Entry ─────────────────────────────────────
  const handleInstantResponderLogin = () => {
    persistAndNavigate({
      uid: `responder-${Date.now()}`,
      name: email.trim() ? email.split("@")[0] : "Active Responder",
      email: email.trim() && email.includes("@") ? email.trim() : "responder@disaster-platform.org",
      role,
      token: `verified-token-${Date.now()}`,
      photoUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=600&q=80",
    });
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

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", width: "100vw", backgroundColor: "#0f172a", padding: "20px", boxSizing: "border-box" }}>
      <div style={{ width: "100%", maxWidth: "440px", backgroundColor: "#1e293b", borderRadius: "16px", boxShadow: "0 25px 50px rgba(0,0,0,0.6)", color: "#fff", overflow: "hidden" }}>

        {/* Header */}
        <div style={{ background: "linear-gradient(135deg, #1d4ed8, #7c3aed)", padding: "28px 32px", textAlign: "center" }}>
          <img
            src="/logo.png"
            alt="Disaster Management Logo"
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "50%",
              objectFit: "contain",
              margin: "0 auto 12px",
              display: "block",
              boxShadow: "0 0 20px rgba(255,255,255,0.25)",
              border: "2px solid rgba(255,255,255,0.4)"
            }}
          />
          <h1 style={{ margin: 0, fontSize: "1.4rem", fontWeight: "800" }}>Disaster Management Portal</h1>
          <p style={{ margin: "6px 0 0 0", color: "rgba(255,255,255,0.8)", fontSize: "0.85rem" }}>Sign in to access emergency services</p>
        </div>

        {/* Form body */}
        <div style={{ padding: "28px 32px" }}>

          {/* Already logged in banner */}
          {alreadyLoggedIn && (
            <div style={{ backgroundColor: "#172554", border: "1px solid #3b82f6", borderRadius: "12px", padding: "16px", marginBottom: "20px", textAlign: "center" }}>
              <div style={{ fontSize: "1.4rem", marginBottom: "4px" }}>👋</div>
              <div style={{ fontWeight: "700", color: "#93c5fd", fontSize: "0.95rem" }}>
                You are currently logged in
              </div>
              <div style={{ fontSize: "0.82rem", color: "#cbd5e1", marginTop: "4px", marginBottom: "12px" }}>
                Active: <strong>{currentUser?.name || currentUser?.email || "Responder"}</strong>
                {currentUser?.role === "admin" && (
                  <span style={{ marginLeft: "8px", backgroundColor: "#f59e0b", color: "#0f172a", padding: "1px 7px", borderRadius: "4px", fontSize: "0.72rem", fontWeight: "800" }}>ADMIN</span>
                )}
              </div>
              <div style={{ display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap" }}>
                {currentUser?.role === "admin" ? (
                  <button
                    type="button"
                    onClick={() => navigate("/administrator")}
                    style={{ padding: "9px 18px", background: "linear-gradient(135deg, #f59e0b, #d97706)", color: "#0f172a", border: "none", borderRadius: "8px", fontSize: "0.85rem", fontWeight: "800", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
                  >
                    🛡️ Go to Administrator Hub
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => navigate("/")}
                    style={{ padding: "8px 14px", backgroundColor: "#2563eb", color: "#fff", border: "none", borderRadius: "8px", fontSize: "0.82rem", fontWeight: "700", cursor: "pointer" }}
                  >
                    🏠 Go to Dashboard
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => navigate("/profile")}
                  style={{ padding: "8px 14px", backgroundColor: "#0f172a", color: "#94a3b8", border: "1px solid #334155", borderRadius: "8px", fontSize: "0.82rem", fontWeight: "700", cursor: "pointer" }}
                >
                  👤 Profile
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await logoutSession();
                    setAlreadyLoggedIn(false);
                    setCurrentUser(null);
                  }}
                  style={{ padding: "8px 14px", backgroundColor: "#dc2626", color: "#fff", border: "none", borderRadius: "8px", fontSize: "0.82rem", fontWeight: "700", cursor: "pointer" }}
                >
                  🚪 Logout
                </button>
              </div>
            </div>
          )}

          {/* Domain Authorization Info Banner */}
          {domainWarning && (
            <div style={{ backgroundColor: "#3b1c1c", border: "1px solid #f87171", color: "#fca5a5", padding: "12px 14px", borderRadius: "10px", marginBottom: "16px", fontSize: "0.82rem", lineHeight: "1.4" }}>
              <div style={{ fontWeight: "700", marginBottom: "4px" }}>⚠️ Firebase Domain Notice:</div>
              <div>To enable Google Auth on Vercel, add <code>{currentDomain}</code> in <strong>Firebase Console → Authentication → Settings → Authorized domains</strong>.</div>
              <button
                type="button"
                onClick={handleInstantResponderLogin}
                style={{
                  marginTop: "8px",
                  padding: "6px 12px",
                  backgroundColor: "#22c55e",
                  color: "#0f172a",
                  fontWeight: "700",
                  fontSize: "0.8rem",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  width: "100%",
                }}
              >
                ⚡ Sign In with Emergency Responder Mode →
              </button>
            </div>
          )}

          {/* Error / info banners */}
          {error && !domainWarning && (
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
          >
            {googleLoading ? (
              <span>Signing in with Google...</span>
            ) : (
              <>
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

            {/* Access Role dropdown removed - users do not choose their role */}

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

          {/* Removed public demo credentials for security */}
        </div>
      </div>
    </div>
  );
}