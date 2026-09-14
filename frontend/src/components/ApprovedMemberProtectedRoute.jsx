import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  isAuthorizedAdmin, 
  isApprovedMember, 
  hasPrivilegedFeatureAccess, 
  requestMemberApproval 
} from "../utils/adminAuth";
import { ShieldAlert, Key, CheckCircle, Lock, ArrowLeft, Send } from "lucide-react";

/**
 * ApprovedMemberProtectedRoute
 * Restricts access to high-level tactical disaster features.
 * Only Administrators OR Members explicitly approved by an Administrator
 * can access these modules.
 */
export default function ApprovedMemberProtectedRoute({ children, featureName = "Tactical Disaster Intelligence" }) {
  const navigate = useNavigate();
  const [status, setStatus] = useState("checking"); // "checking" | "allowed" | "denied"
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [reqRole, setReqRole] = useState("Field Responder");
  const [reqSector, setReqSector] = useState("North East Regional Command");
  const [reqReason, setReqReason] = useState("");
  const [submittedNotice, setSubmittedNotice] = useState("");

  const evaluateAccess = () => {
    try {
      const rawSession = localStorage.getItem("user_session");
      const rawUser = localStorage.getItem("user");
      const rawProfile = localStorage.getItem("user_profile_data_v2");
      let email = "";
      let role = "";
      let name = "";

      if (rawUser) {
        try {
          const parsed = JSON.parse(rawUser);
          email = parsed?.email || "";
          role = parsed?.role || "";
          name = parsed?.name || "";
        } catch {}
      }
      if (!email && rawSession) {
        try {
          const parsed = JSON.parse(rawSession);
          email = parsed?.email || "";
          role = parsed?.role || "";
          name = parsed?.name || "";
        } catch {}
      }
      if (!email && rawProfile) {
        try {
          const parsed = JSON.parse(rawProfile);
          email = parsed?.email || "";
          name = parsed?.displayName || parsed?.name || "";
        } catch {}
      }

      setUserEmail(email);
      setUserName(name || (email ? email.split("@")[0] : ""));

      const allowed = hasPrivilegedFeatureAccess(email, role);
      setStatus(allowed ? "allowed" : "denied");
    } catch {
      setStatus("denied");
    }
  };

  useEffect(() => {
    evaluateAccess();

    const handleAuthUpdate = () => {
      evaluateAccess();
    };

    window.addEventListener("admin_auth_updated", handleAuthUpdate);
    window.addEventListener("storage", handleAuthUpdate);

    return () => {
      window.removeEventListener("admin_auth_updated", handleAuthUpdate);
      window.removeEventListener("storage", handleAuthUpdate);
    };
  }, []);

  const handleRequestSubmit = (e) => {
    e.preventDefault();
    if (!userEmail) {
      setSubmittedNotice("⚠️ Please enter a valid email address to submit a clearance request.");
      return;
    }

    const res = requestMemberApproval({
      email: userEmail,
      name: userName || userEmail.split("@")[0],
      requestedRole: reqRole,
      sector: reqSector,
      reason: reqReason || `Requested access clearance for ${featureName}`
    });

    if (res.success) {
      setSubmittedNotice(`✅ Clearance request successfully submitted to Head Administrator (Debasish N.). Access will unlock once approved.`);
    } else {
      setSubmittedNotice(`ℹ️ ${res.message}`);
    }
  };

  if (status === "checking") {
    return (
      <div
        style={{
          minHeight: "75vh",
          backgroundColor: "#020617",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#38bdf8",
          fontSize: "1rem",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "2.4rem", marginBottom: "12px", animation: "spin 2s linear infinite" }}>🔐</div>
          <div>Verifying Administrator & Approved Member Clearance…</div>
        </div>
      </div>
    );
  }

  if (status === "allowed") {
    return children;
  }

  // Denied Screen: Clear explanation + 1-click Request Approval Form
  return (
    <div
      style={{
        minHeight: "85vh",
        backgroundColor: "#030712",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
      }}
    >
      <div
        style={{
          maxWidth: "640px",
          width: "100%",
          backgroundColor: "#0b1329",
          border: "2px solid #ef4444",
          borderRadius: "18px",
          boxShadow: "0 10px 35px rgba(239, 68, 68, 0.25)",
          padding: "32px 28px",
          color: "#f8fafc",
          position: "relative",
          overflow: "hidden"
        }}
      >
        {/* Top Warning Banner */}
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "4px",
          background: "linear-gradient(90deg, #ef4444, #f59e0b, #ef4444)"
        }} />

        <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "16px" }}>
          <div style={{
            width: "52px",
            height: "52px",
            borderRadius: "14px",
            background: "rgba(239, 68, 68, 0.15)",
            border: "1px solid rgba(239, 68, 68, 0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0
          }}>
            <Lock size={28} color="#ef4444" />
          </div>
          <div>
            <div style={{ fontSize: "0.72rem", color: "#ef4444", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Restricted Operational Clearance
            </div>
            <h2 style={{ margin: "2px 0 0 0", fontSize: "1.35rem", color: "#f8fafc", fontWeight: "800" }}>
              Admin & Approved Member Access Only
            </h2>
          </div>
        </div>

        <p style={{ fontSize: "0.9rem", color: "#94a3b8", lineHeight: "1.6", margin: "0 0 18px 0" }}>
          Access to <strong style={{ color: "#38bdf8" }}>{featureName}</strong> is restricted under disaster defense protocols.
          Only verified <strong>Administrators</strong> or <strong>Members explicitly approved by an Administrator</strong> possess clearance to view or operate this system.
        </p>

        {submittedNotice ? (
          <div style={{
            padding: "16px",
            borderRadius: "12px",
            background: "rgba(34, 197, 94, 0.15)",
            border: "1px solid rgba(34, 197, 94, 0.4)",
            color: "#86efac",
            fontSize: "0.9rem",
            lineHeight: "1.5",
            marginBottom: "20px"
          }}>
            {submittedNotice}
          </div>
        ) : (
          <form onSubmit={handleRequestSubmit} style={{
            background: "rgba(15, 23, 42, 0.7)",
            border: "1px solid #1e293b",
            borderRadius: "14px",
            padding: "18px",
            marginBottom: "22px"
          }}>
            <div style={{ fontSize: "0.82rem", fontWeight: "700", color: "#fde68a", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
              <Key size={16} /> Request Operational Member Clearance
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.74rem", color: "#94a3b8", marginBottom: "4px" }}>
                  Your Email
                </label>
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="responder@disaster.gov.in"
                  required
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    borderRadius: "8px",
                    backgroundColor: "#090d16",
                    border: "1px solid #334155",
                    color: "#f8fafc",
                    fontSize: "0.85rem",
                    boxSizing: "border-box"
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.74rem", color: "#94a3b8", marginBottom: "4px" }}>
                  Your Name / Call-Sign
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Officer / Specialist Name"
                  required
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    borderRadius: "8px",
                    backgroundColor: "#090d16",
                    border: "1px solid #334155",
                    color: "#f8fafc",
                    fontSize: "0.85rem",
                    boxSizing: "border-box"
                  }}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.74rem", color: "#94a3b8", marginBottom: "4px" }}>
                  Requested Member Role
                </label>
                <select
                  value={reqRole}
                  onChange={(e) => setReqRole(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    borderRadius: "8px",
                    backgroundColor: "#090d16",
                    border: "1px solid #334155",
                    color: "#f8fafc",
                    fontSize: "0.85rem",
                    boxSizing: "border-box"
                  }}
                >
                  <option value="Field Responder">Field Responder</option>
                  <option value="Geotechnical Analyst">Geotechnical Analyst</option>
                  <option value="UAV Drone Pilot">UAV Drone Pilot</option>
                  <option value="Relief Logistics Officer">Relief Logistics Officer</option>
                  <option value="Community Volunteer Lead">Community Volunteer Lead</option>
                  <option value="Regional Administrator">Regional Administrator</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.74rem", color: "#94a3b8", marginBottom: "4px" }}>
                  Operational Sector
                </label>
                <input
                  type="text"
                  value={reqSector}
                  onChange={(e) => setReqSector(e.target.value)}
                  placeholder="e.g. Sikkim & Teesta Basin"
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    borderRadius: "8px",
                    backgroundColor: "#090d16",
                    border: "1px solid #334155",
                    color: "#f8fafc",
                    fontSize: "0.85rem",
                    boxSizing: "border-box"
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: "14px" }}>
              <label style={{ display: "block", fontSize: "0.74rem", color: "#94a3b8", marginBottom: "4px" }}>
                Operational Justification
              </label>
              <textarea
                rows={2}
                value={reqReason}
                onChange={(e) => setReqReason(e.target.value)}
                placeholder={`Specify why access to ${featureName} is needed for field duty.`}
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  borderRadius: "8px",
                  backgroundColor: "#090d16",
                  border: "1px solid #334155",
                  color: "#f8fafc",
                  fontSize: "0.85rem",
                  boxSizing: "border-box",
                  resize: "vertical"
                }}
              />
            </div>

            <button
              type="submit"
              style={{
                width: "100%",
                padding: "10px 16px",
                borderRadius: "8px",
                border: "none",
                background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                color: "#ffffff",
                fontWeight: "700",
                fontSize: "0.88rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                cursor: "pointer",
                boxShadow: "0 4px 14px rgba(37, 99, 235, 0.4)"
              }}
            >
              <Send size={16} /> Submit Clearance Request to Administrator
            </button>
          </form>
        )}

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button
            onClick={() => navigate("/")}
            style={{
              flex: 1,
              padding: "10px 14px",
              borderRadius: "8px",
              backgroundColor: "rgba(255, 255, 255, 0.06)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              color: "#cbd5e1",
              fontSize: "0.84rem",
              fontWeight: "600",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px"
            }}
          >
            <ArrowLeft size={16} /> Return to Public Dashboard
          </button>

          <button
            onClick={() => navigate("/login")}
            style={{
              flex: 1,
              padding: "10px 14px",
              borderRadius: "8px",
              backgroundColor: "rgba(245, 158, 11, 0.12)",
              border: "1px solid rgba(245, 158, 11, 0.35)",
              color: "#fde68a",
              fontSize: "0.84rem",
              fontWeight: "700",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px"
            }}
          >
            <Key size={16} /> Login as Administrator / Approved Member
          </button>
        </div>
      </div>
    </div>
  );
}
