import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../services/firebaseAuth";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
      await registerUser(email.trim(), password, name.trim());

      localStorage.setItem(
        "registeredUser",
        JSON.stringify({
          name: name.trim(),
          email: email.trim(),
        })
      );

      navigate("/login");
    } catch (err) {
      console.error("[Register] Firebase error:", err);
      let msg = "Failed to register account.";
      if (err.code === "auth/email-already-in-use") {
        msg = "This email is already in use. Please sign in instead.";
      } else if (err.code === "auth/invalid-email") {
        msg = "Please enter a valid email address.";
      } else if (err.code === "auth/weak-password") {
        msg = "Password is too weak. Please use at least 6 characters.";
      } else if (err.message) {
        msg = err.message;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">🛡️</div>

        <h1>Create Account</h1>
        <p>Join Disaster Management Platform</p>

        {error && (
          <div style={{ backgroundColor: "#450a0a", border: "1px solid #dc2626", color: "#fca5a5", padding: "10px 14px", borderRadius: "8px", marginBottom: "16px", fontSize: "0.875rem" }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleRegister}>
          <label>Full Name</label>
          <input
            type="text"
            placeholder="Enter your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <label>Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Create password (min 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
          />

          <label>Confirm Password</label>
          <input
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
          />

          <button className="login-button" type="submit" disabled={loading} style={{ opacity: loading ? 0.7 : 1, cursor: loading ? "wait" : "pointer" }}>
            {loading ? "Creating Account..." : "📝 Register"}
          </button>
        </form>

        <p className="register-link">
          Already registered?{" "}
          <button type="button" onClick={() => navigate("/login")}>
            Login
          </button>
        </p>
      </div>
    </div>
  );
}

export default Register;