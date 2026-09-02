import React, { useState } from 'react';
import { useNavigate, Link } from "react-router-dom";
import { saveOfflineSession } from "../utils/offlineStorage";
import { loginUser, resetPassword } from "../services/firebaseAuth";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [error, setError] = useState("");
  const [infoMsg, setInfoMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setInfoMsg("");
    setLoading(true);

    const enteredId = email.trim().toLowerCase();
    const enteredPassword = password.trim();

    try {
      // ── 1. Admin Demo Shortcut ────────────────────────────────────
      if (
        role === "admin" &&
        (enteredId === "admin" || enteredId === "admin@admin.com") &&
        enteredPassword === "admin123"
      ) {
        localStorage.setItem("token", "demo-admin-token");
        localStorage.setItem(
          "user",
          JSON.stringify({ name: "Admin", email: "admin@admin.com", role: "admin" })
        );
        await saveOfflineSession({
          name: "Admin",
          email: "admin@admin.com",
          role: "admin",
        });
        navigate("/admin/tickets");
        return;
      }

      // ── 2. User Demo Shortcut ─────────────────────────────────────
      if (
        role === "user" &&
        enteredId === "user" &&
        enteredPassword === "user123"
      ) {
        localStorage.setItem("token", "demo-user-token");
        localStorage.setItem(
          "user",
          JSON.stringify({ name: "Demo User", email: "user@demo.com", role: "user" })
        );
        await saveOfflineSession({
          name: "Demo User",
          email: "user@demo.com",
          role: "user",
        });
        navigate("/");
        return;
      }

      // ── 3. Firebase Authentication ────────────────────────────────
      if (enteredId.includes("@")) {
        const user = await loginUser(enteredId, enteredPassword);
        const token = await user.getIdToken();

        localStorage.setItem("token", token);
        localStorage.setItem(
          "user",
          JSON.stringify({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || enteredId.split("@")[0],
            role,
          })
        );

        await saveOfflineSession({
          uid: user.uid,
          name: user.displayName || enteredId.split("@")[0],
          email: user.email,
          role,
        });

        if (role === "admin") {
          navigate("/admin/tickets");
        } else {
          navigate("/");
        }
        return;
      }

      // ── 4. Fallback for offline or non-email inputs ────────────────
      if (enteredId && enteredPassword) {
        localStorage.setItem("token", `local-token-${Date.now()}`);
        localStorage.setItem(
          "user",
          JSON.stringify({ name: enteredId, email: enteredId, role })
        );
        await saveOfflineSession({
          name: enteredId,
          email: enteredId,
          role,
        });
        navigate(role === "admin" ? "/admin/tickets" : "/");
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
        message = "Too many failed attempts. Please try again later or reset password.";
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

  const handleForgotPassword = async () => {
    const enteredEmail = email.trim();
    if (!enteredEmail || !enteredEmail.includes("@")) {
      setError("Please enter your email above and click 'Forgot Password?' again.");
      return;
    }

    try {
      setResettingPassword(true);
      setError("");
      await resetPassword(enteredEmail);
      setInfoMsg(`Password reset email sent to ${enteredEmail}. Check your inbox!`);
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
          <div style={{ fontSize: "2.5rem", marginBottom: "8px" }}>🛡️</div>
          <h1 style={{ margin: 0, fontSize: "1.4rem", fontWeight: "800" }}>Disaster Management Portal</h1>
          <p style={{ margin: "6px 0 0 0", color: "rgba(255,255,255,0.8)", fontSize: "0.85rem" }}>Sign in with Firebase to access emergency services</p>
        </div>

        {/* Form */}
        <div style={{ padding: "28px 32px" }}>
          {error && (
            <div style={{ backgroundColor: "#450a0a", border: "1px solid #dc2626", color: "#fca5a5", padding: "10px 14px", borderRadius: "8px", marginBottom: "16px", fontSize: "0.875rem" }}>
              ⚠️ {error}
            </div>
          )}

          {infoMsg && (
            <div style={{ backgroundColor: "#064e3b", border: "1px solid #059669", color: "#6ee7b7", padding: "10px 14px", borderRadius: "8px", marginBottom: "16px", fontSize: "0.875rem" }}>
              ✅ {infoMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "0.82rem", fontWeight: "600", color: "#94a3b8" }}>Email / User ID</label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com or 'user'"
                required
                autoComplete="email"
                style={{ padding: "11px 14px", borderRadius: "8px", border: "1px solid #334155", backgroundColor: "#0f172a", color: "#fff", fontSize: "0.9rem", outline: "none", width: "100%", boxSizing: "border-box" }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label style={{ fontSize: "0.82rem", fontWeight: "600", color: "#94a3b8" }}>Password</label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={resettingPassword}
                  style={{ background: "none", border: "none", color: "#38bdf8", fontSize: "0.78rem", cursor: "pointer", padding: 0, textDecoration: "underline" }}
                >
                  {resettingPassword ? "Sending..." : "Forgot password?"}
                </button>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
                style={{ padding: "11px 14px", borderRadius: "8px", border: "1px solid #334155", backgroundColor: "#0f172a", color: "#fff", fontSize: "0.9rem", outline: "none", width: "100%", boxSizing: "border-box" }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "0.82rem", fontWeight: "600", color: "#94a3b8" }}>Access Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                style={{ padding: "11px 14px", borderRadius: "8px", border: "1px solid #334155", backgroundColor: "#0f172a", color: "#fff", fontSize: "0.9rem", outline: "none", width: "100%", boxSizing: "border-box" }}
              >
                <option value="user">👤 Citizen / Responder</option>
                <option value="admin">🛡️ Administrator</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ marginTop: "4px", padding: "13px", borderRadius: "8px", backgroundColor: "#2563eb", color: "#fff", fontWeight: "700", fontSize: "1rem", border: "none", cursor: loading ? "wait" : "pointer", opacity: loading ? 0.7 : 1, transition: "background 0.2s" }}
            >
              {loading ? "Signing in with Firebase..." : "Sign In →"}
            </button>

          </form>

          {/* Register Link */}
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