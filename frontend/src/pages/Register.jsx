import React, { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser, loginWithGoogle } from "../services/firebaseAuth";
import { initFCM } from "../services/fcmService";
import { cleanWhatsAppNumber } from "../utils/phoneUtils";

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

// ─────────────────────────────────────────────────────────────────────────────
// Upload avatar to backend (Cloudinary) and return the public URL
// ─────────────────────────────────────────────────────────────────────────────
async function uploadAvatarToCloudinary(file, authToken) {
  const formData = new FormData();
  formData.append("avatar", file);

  const res = await fetch(`${API_URL}/api/users/upload-avatar`, {
    method: "POST",
    headers: { Authorization: `Bearer ${authToken}` },
    body: formData,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || "Avatar upload failed");
  }

  const json = await res.json();
  return json.data?.url || null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
function Register() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [name, setName]                     = useState("");
  const [email, setEmail]                   = useState("");
  const [phone, setPhone]                   = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [password, setPassword]             = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [avatarFile, setAvatarFile]         = useState(null);
  const [avatarPreview, setAvatarPreview]   = useState(null);
  const [loading, setLoading]               = useState(false);
  const [googleLoading, setGoogleLoading]   = useState(false);
  const [error, setError]                   = useState("");
  const [showPassword, setShowPassword]     = useState(false);

  // ─── Avatar picker ──────────────────────────────────────────────────────────
  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("Avatar image must be smaller than 5 MB.");
      return;
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setError("");
  };

  // ─── Email/Password registration ────────────────────────────────────────────
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);

      let token = `token-${Date.now()}`;
      let uid = `user-${Date.now()}`;
      let photoUrl = null;

      // 1. Try Firebase Auth account creation
      try {
        const user = await registerUser(email.trim(), password, name.trim());
        token = await user.getIdToken();
        uid = user.uid;
        photoUrl = user.photoURL || null;
      } catch (firebaseErr) {
        console.warn("[Register] Firebase auth notice:", firebaseErr.code || firebaseErr.message);

        if (
          firebaseErr.code === "auth/unauthorized-domain" ||
          firebaseErr.code === "auth/network-request-failed" ||
          firebaseErr.code === "auth/internal-error"
        ) {
          // Attempt Backend API registration
          try {
            const res = await fetch(`${API_URL}/api/auth/register`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ name: name.trim(), email: email.trim(), password }),
            });
            if (res.ok) {
              const data = await res.json();
              token = data.data?.token || token;
              uid = data.data?.user?.id || data.data?.user?._id || uid;
            }
          } catch {}
        } else {
          throw firebaseErr;
        }
      }

      // 2. If avatar was chosen — upload to Cloudinary
      if (avatarFile) {
        try {
          const uploaded = await uploadAvatarToCloudinary(avatarFile, token);
          if (uploaded) photoUrl = uploaded;
        } catch (uploadErr) {
          console.warn("[Register] Avatar upload failed (non-fatal):", uploadErr);
        }
      }

      const nameParts = name.trim().split(" ");
      const firstName = nameParts[0] || name.trim();
      const lastName = nameParts.slice(1).join(" ") || "";
      const username = email.trim().split("@")[0].toLowerCase().replace(/[^a-z0-9._-]/g, "");

      const formattedPhone = cleanWhatsAppNumber(phone) || phone.trim();
      const formattedEmergency = cleanWhatsAppNumber(emergencyContact) || formattedPhone;

      const userData = {
        uid,
        name: name.trim(),
        email: email.trim(),
        phone: formattedPhone,
        emergencyContact: formattedEmergency,
        role: "user",
        photoUrl: photoUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name.trim())}`,
        profileImage: photoUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name.trim())}`,
      };

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));
      if (formattedPhone) {
        localStorage.setItem("user_phone", formattedPhone);
      }
      if (formattedEmergency) {
        localStorage.setItem("sos_whatsapp_number", formattedEmergency);
        localStorage.setItem("emergency_contact_number", formattedEmergency);
      }

      // Populate user_profile_data_v2 for immediate profile page hydration
      localStorage.setItem(
        "user_profile_data_v2",
        JSON.stringify({
          username,
          firstName,
          lastName,
          nickname: firstName,
          displayName: name.trim(),
          role: "Citizen / Responder",
          email: email.trim(),
          phone: formattedPhone,
          whatsapp: formattedPhone,
          emergencyContact: formattedEmergency,
          website: "https://disaster-management-platform.org",
          telegram: `@${username}`,
          bio: "Registered Disaster Response Platform member.",
          photoUrl: userData.photoUrl,
          bloodGroup: "O+",
          location: "Bhubaneswar, Odisha",
        })
      );

      // 3. Init FCM
      initFCM().catch(() => {});

      navigate("/profile");
    } catch (err) {
      console.error("[Register] Auth error:", err);
      let msg = "Failed to register account.";
      if (err.code === "auth/email-already-in-use") {
        msg = "This email is already in use. Please sign in instead.";
      } else if (err.code === "auth/invalid-email") {
        msg = "Please enter a valid email address.";
      } else if (err.code === "auth/weak-password") {
        msg = "Password is too weak. Use at least 6 characters.";
      } else if (err.message) {
        msg = err.message;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // ─── Google Sign-Up ─────────────────────────────────────────────────────────
  const handleGoogleSignUp = async () => {
    setError("");
    setGoogleLoading(true);
    try {
      const user  = await loginWithGoogle();
      const token = await user.getIdToken();
      const fullName = user.displayName || user.email.split("@")[0];
      const nameParts = fullName.split(" ");
      const firstName = nameParts[0] || fullName;
      const lastName = nameParts.slice(1).join(" ") || "";
      const username = user.email.split("@")[0].toLowerCase().replace(/[^a-z0-9._-]/g, "");

      const userData = {
        uid: user.uid,
        name: fullName,
        email: user.email,
        role: "user",
        photoUrl: user.photoURL || null,
        profileImage: user.photoURL || null,
      };

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));

      localStorage.setItem(
        "user_profile_data_v2",
        JSON.stringify({
          username,
          firstName,
          lastName,
          nickname: firstName,
          displayName: fullName,
          role: "Citizen / Responder",
          email: user.email,
          whatsapp: "",
          website: "https://disaster-management-platform.org",
          telegram: `@${username}`,
          bio: "Registered Disaster Response Platform member via Google.",
          photoUrl: user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName)}`,
          bloodGroup: "O+",
          emergencyContact: "",
          location: "Bhubaneswar, Odisha",
        })
      );

      initFCM().catch(() => {});
      navigate("/profile");
    } catch (err) {
      console.error("[Register] Google Sign-Up error:", err);
      if (err.code === "auth/popup-closed-by-user" || err.code === "auth/cancelled-popup-request") {
        // Dismissed by user — not an error
      } else if (err.code === "auth/popup-blocked") {
        setError("Popup was blocked. Please allow popups for this site and try again.");
      } else {
        setError(err.message || "Google Sign-Up failed. Please try again.");
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", backgroundColor: "#0f172a", padding: "20px", boxSizing: "border-box" }}>
      <div style={{ width: "100%", maxWidth: "480px", backgroundColor: "#1e293b", borderRadius: "16px", boxShadow: "0 25px 50px rgba(0,0,0,0.6)", color: "#fff", overflow: "hidden" }}>

        {/* Header */}
        <div style={{ background: "linear-gradient(135deg, #1d4ed8, #7c3aed)", padding: "28px 32px", textAlign: "center" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "8px" }}>🛡️</div>
          <h1 style={{ margin: 0, fontSize: "1.4rem", fontWeight: "800" }}>Create Account</h1>
          <p style={{ margin: "6px 0 0 0", color: "rgba(255,255,255,0.8)", fontSize: "0.85rem" }}>Join Disaster Management Platform</p>
        </div>

        <div style={{ padding: "28px 32px" }}>

          {/* Error banner */}
          {error && (
            <div id="register-error-banner" style={{ backgroundColor: "#450a0a", border: "1px solid #dc2626", color: "#fca5a5", padding: "10px 14px", borderRadius: "8px", marginBottom: "16px", fontSize: "0.875rem" }}>
              ⚠️ {error}
            </div>
          )}

          {/* ── Google Sign-Up ─────────────────────────────────────────── */}
          <button
            id="google-register-btn"
            type="button"
            onClick={handleGoogleSignUp}
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
              <span>Registering with Google...</span>
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
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
            <div style={{ flex: 1, height: "1px", backgroundColor: "#334155" }} />
            <span style={{ color: "#64748b", fontSize: "0.8rem" }}>or register with email</span>
            <div style={{ flex: 1, height: "1px", backgroundColor: "#334155" }} />
          </div>

          {/* ── Avatar picker ───────────────────────────────────────────── */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "20px" }}>
            <div
              id="avatar-picker"
              onClick={() => fileInputRef.current?.click()}
              style={{
                width: "88px",
                height: "88px",
                borderRadius: "50%",
                backgroundColor: "#0f172a",
                border: "2px dashed #334155",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                overflow: "hidden",
                position: "relative",
                transition: "border-color 0.2s",
              }}
              title="Click to upload profile photo"
            >
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <span style={{ fontSize: "2rem" }}>📷</span>
              )}
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "rgba(0,0,0,0.5)", textAlign: "center", fontSize: "0.6rem", color: "#fff", padding: "3px" }}>
                Upload
              </div>
            </div>
            <input
              ref={fileInputRef}
              id="avatar-file-input"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleAvatarChange}
              style={{ display: "none" }}
            />
            <p style={{ marginTop: "6px", fontSize: "0.75rem", color: "#64748b" }}>
              {avatarFile ? avatarFile.name : "Optional profile photo (max 5 MB)"}
            </p>
          </div>

          {/* ── Registration form ───────────────────────────────────────── */}
          <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label htmlFor="reg-name" style={{ fontSize: "0.82rem", fontWeight: "600", color: "#94a3b8" }}>Full Name</label>
              <input
                id="reg-name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={inputStyle}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label htmlFor="reg-email" style={{ fontSize: "0.82rem", fontWeight: "600", color: "#94a3b8" }}>Email Address</label>
              <input
                id="reg-email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                style={inputStyle}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label htmlFor="reg-phone" style={{ fontSize: "0.82rem", fontWeight: "600", color: "#38bdf8" }}>
                📱 Mobile / WhatsApp Number (Required for WhatsApp SOS Alerts)
              </label>
              <input
                id="reg-phone"
                type="tel"
                placeholder="e.g. +91 98765 43210 or 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                style={{ ...inputStyle, borderColor: "#3b82f6" }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label htmlFor="reg-emergency" style={{ fontSize: "0.82rem", fontWeight: "600", color: "#94a3b8" }}>
                🆘 Emergency Contact / Guardian Mobile (Optional)
              </label>
              <input
                id="reg-emergency"
                type="tel"
                placeholder="e.g. Parent or Guardian Mobile Number"
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
                style={inputStyle}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label htmlFor="reg-password" style={{ fontSize: "0.82rem", fontWeight: "600", color: "#94a3b8" }}>Password</label>
              <div style={{ position: "relative" }}>
                <input
                  id="reg-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create password (min 6 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
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
              <label htmlFor="reg-confirm-password" style={{ fontSize: "0.82rem", fontWeight: "600", color: "#94a3b8" }}>Confirm Password</label>
              <input
                id="reg-confirm-password"
                type={showPassword ? "text" : "password"}
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
                style={inputStyle}
              />
            </div>

            {/* Password strength indicator */}
            {password.length > 0 && (
              <div style={{ fontSize: "0.75rem", marginTop: "-6px" }}>
                {password.length < 6 ? (
                  <span style={{ color: "#ef4444" }}>⚠️ Password too short</span>
                ) : password.length < 10 ? (
                  <span style={{ color: "#f59e0b" }}>⚡ Fair — consider adding more characters</span>
                ) : (
                  <span style={{ color: "#22c55e" }}>✅ Strong password</span>
                )}
              </div>
            )}

            <button
              id="register-submit-btn"
              type="submit"
              disabled={loading || googleLoading}
              style={{ marginTop: "6px", padding: "13px", borderRadius: "8px", backgroundColor: "#7c3aed", color: "#fff", fontWeight: "700", fontSize: "1rem", border: "none", cursor: loading ? "wait" : "pointer", opacity: loading ? 0.7 : 1, transition: "background 0.2s" }}
            >
              {loading ? "Creating Account..." : "📝 Create Account"}
            </button>

          </form>

          <div style={{ marginTop: "16px", textAlign: "center", fontSize: "0.85rem", color: "#94a3b8" }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "#38bdf8", fontWeight: "600", textDecoration: "none" }}>Sign in</Link>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Register;