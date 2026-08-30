import React, { useState } from 'react';
import { saveOfflineSession } from "../utils/offlineStorage";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [role,     setRole]     = useState("user");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const enteredId       = email.trim().toLowerCase();
    const enteredPassword = password.trim();

    // Save session regardless so the app can load in offline mode
    await saveOfflineSession({
      name:  enteredId.split("@")[0],
      email: enteredId,
      role,
    });

    // ── Admin login ─────────────────────────────────────────────
    if (
      role === "admin" &&
      (enteredId === "admin" || enteredId === "admin@admin.com") &&
      enteredPassword === "admin123"
    ) {
      navigate("/admin/tickets");
      return;
    }

    // ── User login ──────────────────────────────────────────────
    if (
      role === "user" &&
      (enteredId === "user" || enteredId.includes("@")) &&
      enteredPassword === "user123"
    ) {
      navigate("/");          // Dashboard is at "/" not "/dashboard"
      return;
    }

    // ── Guest access (any credentials) ─────────────────────────
    if (enteredId && enteredPassword) {
      // Allow any valid-looking credential through as a guest session
      navigate("/");
      return;
    }

    setError("Invalid ID or password. Try: user / user123");
    setLoading(false);
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", width: "100vw", backgroundColor: "#0f172a", padding: "20px", boxSizing: "border-box" }}>
      <div style={{ width: "100%", maxWidth: "420px", backgroundColor: "#1e293b", borderRadius: "16px", boxShadow: "0 25px 50px rgba(0,0,0,0.6)", color: "#fff", overflow: "hidden" }}>

        {/* Header */}
        <div style={{ background: "linear-gradient(135deg, #1d4ed8, #7c3aed)", padding: "28px 32px", textAlign: "center" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "8px" }}>🛡️</div>
          <h1 style={{ margin: 0, fontSize: "1.4rem", fontWeight: "800" }}>Disaster Management Portal</h1>
          <p style={{ margin: "6px 0 0 0", color: "rgba(255,255,255,0.7)", fontSize: "0.85rem" }}>Sign in to access your emergency dashboard</p>
        </div>

        {/* Form */}
        <div style={{ padding: "28px 32px" }}>
          {error && (
            <div style={{ backgroundColor: "#450a0a", border: "1px solid #dc2626", color: "#fca5a5", padding: "10px 14px", borderRadius: "8px", marginBottom: "16px", fontSize: "0.875rem" }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "0.82rem", fontWeight: "600", color: "#94a3b8" }}>Email / Admin ID</label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com or 'user'"
                required
                style={{ padding: "11px 14px", borderRadius: "8px", border: "1px solid #334155", backgroundColor: "#0f172a", color: "#fff", fontSize: "0.9rem", outline: "none", width: "100%", boxSizing: "border-box" }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "0.82rem", fontWeight: "600", color: "#94a3b8" }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
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
              {loading ? "Signing in..." : "Sign In →"}
            </button>

          </form>

          {/* Demo hints */}
          <div style={{ marginTop: "20px", padding: "12px", backgroundColor: "#0f172a", borderRadius: "8px", fontSize: "0.78rem", color: "#64748b" }}>
            <strong style={{ color: "#475569" }}>Demo credentials:</strong><br />
            👤 User: <code style={{ color: "#38bdf8" }}>user</code> / <code style={{ color: "#38bdf8" }}>user123</code><br />
            🛡️ Admin: <code style={{ color: "#38bdf8" }}>admin</code> / <code style={{ color: "#38bdf8" }}>admin123</code>
          </div>
        </div>
      </div>
    </div>
  );
}