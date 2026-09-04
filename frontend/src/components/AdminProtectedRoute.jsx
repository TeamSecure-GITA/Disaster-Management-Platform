import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { isAuthorizedAdmin } from "../utils/adminAuth";

/**
 * AdminProtectedRoute
 * Wraps any route that requires administrator access.
 * Only debasishn185@gmail.com (Head Admin) and those explicitly
 * granted permission by the Head Admin can pass through.
 * Everyone else is silently redirected to the home page.
 */
export default function AdminProtectedRoute({ children }) {
  const [status, setStatus] = useState("checking"); // "checking" | "allowed" | "denied"

  useEffect(() => {
    try {
      const rawSession = localStorage.getItem("user_session");
      const rawUser = localStorage.getItem("user");
      let email = "";
      let role = "";

      if (rawUser) {
        try {
          const parsed = JSON.parse(rawUser);
          email = parsed?.email || "";
          role = parsed?.role || "";
        } catch {}
      }
      if (!email && rawSession) {
        try {
          const parsed = JSON.parse(rawSession);
          email = parsed?.email || "";
          role = parsed?.role || "";
        } catch {}
      }

      const allowed =
        (email && isAuthorizedAdmin(email)) || role === "admin";

      setStatus(allowed ? "allowed" : "denied");
    } catch {
      setStatus("denied");
    }
  }, []);

  if (status === "checking") {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#020617",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#38bdf8",
          fontSize: "1rem",
        }}
      >
        <span>🔐 Verifying administrator credentials…</span>
      </div>
    );
  }

  if (status === "denied") {
    return <Navigate to="/" replace />;
  }

  return children;
}
