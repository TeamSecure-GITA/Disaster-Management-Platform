import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  HEAD_ADMIN_EMAIL,
  isHeadAdmin,
  isAuthorizedAdmin,
  getAuthorizedAdmins,
  grantAdminPermission,
  revokeAdminPermission,
  getLoginAuditLogs,
  getLoginAnalytics,
  getPermissionRequests,
  updatePermissionRequest
} from "../utils/adminAuth";
import { getOfflineSession } from "../utils/offlineStorage";

export default function AdministratorHub() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("analytics"); // "analytics" | "members" | "requests" | "audit"

  // Data states
  const [analytics, setAnalytics] = useState(getLoginAnalytics());
  const [authorizedAdmins, setAuthorizedAdmins] = useState(getAuthorizedAdmins());
  const [auditLogs, setAuditLogs] = useState(getLoginAuditLogs());
  const [requests, setRequests] = useState(getPermissionRequests());

  // Add member form state
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminRole, setNewAdminRole] = useState("Regional Administrator");
  const [actionNotice, setActionNotice] = useState("");

  useEffect(() => {
    async function checkAuth() {
      try {
        const session = await getOfflineSession();
        setCurrentUser(session);
      } catch (err) {
        console.error("Auth check failed:", err);
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, []);

  const refreshData = () => {
    setAnalytics(getLoginAnalytics());
    setAuthorizedAdmins(getAuthorizedAdmins());
    setAuditLogs(getLoginAuditLogs());
    setRequests(getPermissionRequests());
  };

  const handleGrantPermission = (e) => {
    e.preventDefault();
    if (!newAdminEmail || !newAdminEmail.includes("@")) {
      setActionNotice("⚠️ Please enter a valid member email address.");
      return;
    }

    const grantedByName = isHeadAdmin(currentUser?.email)
      ? "Debasish N. (Head Administrator)"
      : (currentUser?.name || "Authorized Admin");

    const res = grantAdminPermission(newAdminEmail.trim(), newAdminRole, grantedByName);
    if (res.success) {
      setActionNotice(`✅ Success: Granted ${newAdminRole} permissions to ${newAdminEmail}.`);
      setNewAdminEmail("");
      refreshData();
    } else {
      setActionNotice(`⚠️ ${res.message}`);
    }
  };

  const handleRevokePermission = (emailToRevoke) => {
    if (window.confirm(`Are you sure you want to revoke Administrator access for ${emailToRevoke}?`)) {
      const res = revokeAdminPermission(emailToRevoke);
      setActionNotice(res.message);
      refreshData();
    }
  };

  const handleApproveRequest = (reqId) => {
    const reviewerName = isHeadAdmin(currentUser?.email)
      ? "Debasish N. (Head Administrator)"
      : (currentUser?.name || "Administrator");

    updatePermissionRequest(reqId, "Approved", reviewerName);
    setActionNotice(`✅ Request ${reqId} approved and administrator access provisioned.`);
    refreshData();
  };

  const handleRejectRequest = (reqId) => {
    updatePermissionRequest(reqId, "Rejected", currentUser?.name || "Administrator");
    setActionNotice(`❌ Request ${reqId} rejected.`);
    refreshData();
  };

  if (loading) {
    return (
      <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#38bdf8" }}>
        Loading Administrator Clearance...
      </div>
    );
  }

  // Security Check: Only debasishn185@gmail.com, authorized admins, or admin role
  const userEmail = currentUser?.email || "";
  const hasAccess = isAuthorizedAdmin(userEmail) || currentUser?.role === "admin";

  if (!hasAccess) {
    return (
      <div style={{ padding: "40px 20px", maxWidth: "600px", margin: "60px auto", textAlign: "center", backgroundColor: "#1e1b4b", borderRadius: "16px", border: "2px solid #ef4444", color: "#fff" }}>
        <div style={{ fontSize: "3rem", marginBottom: "12px" }}>⛔</div>
        <h2 style={{ color: "#f87171", margin: "0 0 10px 0" }}>Restricted Area — Administrator Access Only</h2>
        <p style={{ color: "#cbd5e1", fontSize: "0.95rem", lineHeight: "1.5" }}>
          This page and its data are confidential and only accessible by <strong>Head Administrator Debasish N. (debasishn185@gmail.com)</strong> or members explicitly granted clearance.
        </p>
        <p style={{ color: "#94a3b8", fontSize: "0.85rem", marginTop: "8px" }}>
          Current user: <strong>{userEmail || "Anonymous / Unauthenticated"}</strong>
        </p>
        <div style={{ marginTop: "24px", display: "flex", gap: "12px", justifyContent: "center" }}>
          <button
            onClick={() => navigate("/")}
            style={{ padding: "10px 18px", backgroundColor: "#2563eb", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "700", cursor: "pointer" }}
          >
            ← Return to Dashboard
          </button>
          <button
            onClick={() => navigate("/login")}
            style={{ padding: "10px 18px", backgroundColor: "#334155", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer" }}
          >
            Sign in as Administrator →
          </button>
        </div>
      </div>
    );
  }

  const isHead = isHeadAdmin(userEmail);

  return (
    <div style={{ padding: "24px 28px", minHeight: "100vh", backgroundColor: "#020617", color: "#f8fafc" }}>
      
      {/* ── TOP HEADER BANNER ── */}
      <div style={{
        background: "linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)",
        border: "1.5px solid #6366f1",
        borderRadius: "16px",
        padding: "24px 28px",
        marginBottom: "24px",
        boxShadow: "0 10px 30px rgba(99, 102, 241, 0.2)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "16px"
      }}>
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: isHead ? "rgba(245, 158, 11, 0.2)" : "rgba(99, 102, 241, 0.2)", border: `1px solid ${isHead ? "#f59e0b" : "#6366f1"}`, padding: "4px 12px", borderRadius: "999px", fontSize: "0.8rem", color: isHead ? "#fde68a" : "#c7d2fe", fontWeight: "700", marginBottom: "8px" }}>
            {isHead ? "👑 HEAD ADMINISTRATOR / ROOT ACCESS" : "🛡️ AUTHORIZED DELEGATED ADMINISTRATOR"}
          </div>
          <h1 style={{ margin: "0 0 6px 0", fontSize: "1.75rem", fontWeight: "800", color: "#f1f5f9" }}>
            🛡️ Administrator Command & Permission Hub
          </h1>
          <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.9rem" }}>
            Logged in as: <strong style={{ color: "#38bdf8" }}>{currentUser?.name || "Debasish N."}</strong> ({userEmail}) · Full permission to manage roles, inspect real-time user logins, and approve access requests.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button
            onClick={refreshData}
            style={{
              padding: "8px 14px",
              backgroundColor: "rgba(56, 189, 248, 0.15)",
              color: "#38bdf8",
              border: "1px solid rgba(56, 189, 248, 0.4)",
              borderRadius: "8px",
              fontSize: "0.85rem",
              fontWeight: "600",
              cursor: "pointer"
            }}
          >
            🔄 Refresh Metrics
          </button>
          <Link
            to="/admin/tickets"
            style={{
              padding: "8px 14px",
              backgroundColor: "#2563eb",
              color: "#fff",
              borderRadius: "8px",
              fontSize: "0.85rem",
              fontWeight: "600",
              textDecoration: "none"
            }}
          >
            🎫 Support Tickets
          </Link>
        </div>
      </div>

      {/* Action Notification Alert */}
      {actionNotice && (
        <div style={{ backgroundColor: "#172554", border: "1px solid #3b82f6", color: "#bfdbfe", padding: "12px 18px", borderRadius: "10px", marginBottom: "20px", fontSize: "0.9rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>{actionNotice}</span>
          <button onClick={() => setActionNotice("")} style={{ background: "none", border: "none", color: "#93c5fd", cursor: "pointer", fontWeight: "bold" }}>✕</button>
        </div>
      )}

      {/* ── 4 KPI ANALYTICS METRICS CARDS ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: "16px", marginBottom: "24px" }}>
        <div style={{ backgroundColor: "rgba(15, 23, 42, 0.85)", padding: "18px", borderRadius: "12px", border: "1px solid #334155" }}>
          <span style={{ fontSize: "0.8rem", color: "#94a3b8", display: "block" }}>Total Registered Users</span>
          <h3 style={{ margin: "6px 0 0 0", fontSize: "1.8rem", fontWeight: "800", color: "#38bdf8" }}>
            {analytics.totalRegisteredUsers} Users
          </h3>
          <span style={{ fontSize: "0.72rem", color: "#64748b" }}>Citizens, Responders & Officers</span>
        </div>

        <div style={{ backgroundColor: "rgba(15, 23, 42, 0.85)", padding: "18px", borderRadius: "12px", border: "1px solid #334155" }}>
          <span style={{ fontSize: "0.8rem", color: "#94a3b8", display: "block" }}>Currently Logged In</span>
          <h3 style={{ margin: "6px 0 0 0", fontSize: "1.8rem", fontWeight: "800", color: "#4ade80" }}>
            {analytics.activeSessions} Active
          </h3>
          <span style={{ fontSize: "0.72rem", color: "#10b981" }}>🟢 Live Sessions Monitored</span>
        </div>

        <div style={{ backgroundColor: "rgba(15, 23, 42, 0.85)", padding: "18px", borderRadius: "12px", border: "1px solid #334155" }}>
          <span style={{ fontSize: "0.8rem", color: "#94a3b8", display: "block" }}>Logins Today</span>
          <h3 style={{ margin: "6px 0 0 0", fontSize: "1.8rem", fontWeight: "800", color: "#fbbf24" }}>
            {analytics.loginsToday} Sessions
          </h3>
          <span style={{ fontSize: "0.72rem", color: "#64748b" }}>Past 24 Hours</span>
        </div>

        <div style={{ backgroundColor: "rgba(15, 23, 42, 0.85)", padding: "18px", borderRadius: "12px", border: "1px solid #334155" }}>
          <span style={{ fontSize: "0.8rem", color: "#94a3b8", display: "block" }}>Authorized Administrators</span>
          <h3 style={{ margin: "6px 0 0 0", fontSize: "1.8rem", fontWeight: "800", color: "#a855f7" }}>
            {authorizedAdmins.length} Members
          </h3>
          <span style={{ fontSize: "0.72rem", color: "#c084fc" }}>Head: {HEAD_ADMIN_EMAIL}</span>
        </div>
      </div>

      {/* ── TABS NAVIGATION ── */}
      <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid #334155", paddingBottom: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
        {[
          { id: "analytics", label: "📊 Live Logins & Active Users", icon: "🟢" },
          { id: "members", label: "🔑 Access Delegation (Add Members)", icon: "👥" },
          { id: "requests", label: `📋 Permission Requests (${requests.filter(r => r.status === "Pending").length})`, icon: "⏳" },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "10px 18px",
              borderRadius: "8px",
              border: "none",
              backgroundColor: activeTab === tab.id ? "#2563eb" : "rgba(30, 41, 59, 0.7)",
              color: activeTab === tab.id ? "#ffffff" : "#94a3b8",
              fontWeight: activeTab === tab.id ? "700" : "500",
              fontSize: "0.9rem",
              cursor: "pointer"
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── TAB 1: LIVE USER LOGINS & SESSIONS ── */}
      {activeTab === "analytics" && (
        <div style={{ backgroundColor: "rgba(15, 23, 42, 0.85)", borderRadius: "14px", border: "1px solid #334155", padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: "700", color: "#f8fafc" }}>
                🔴 Real-Time User Logins & Device Sessions
              </h3>
              <p style={{ margin: "4px 0 0 0", color: "#94a3b8", fontSize: "0.82rem" }}>
                Tracking currently active sessions and login events across responders, volunteers, and citizens.
              </p>
            </div>
            <span style={{ fontSize: "0.8rem", color: "#4ade80", backgroundColor: "rgba(74, 222, 128, 0.15)", padding: "4px 10px", borderRadius: "6px", border: "1px solid rgba(74, 222, 128, 0.3)" }}>
              ● Live Stream Online
            </span>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.85rem" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #334155", color: "#94a3b8" }}>
                  <th style={{ padding: "10px" }}>User / Email</th>
                  <th style={{ padding: "10px" }}>Role Clearance</th>
                  <th style={{ padding: "10px" }}>Login Timestamp</th>
                  <th style={{ padding: "10px" }}>Device / Client</th>
                  <th style={{ padding: "10px" }}>Origin Location</th>
                  <th style={{ padding: "10px" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((log) => {
                  const isUserHead = isHeadAdmin(log.email);
                  return (
                    <tr key={log.id} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}>
                      <td style={{ padding: "12px 10px" }}>
                        <div style={{ fontWeight: "700", color: "#f8fafc" }}>
                          {log.name} {isUserHead && <span style={{ color: "#f59e0b" }}>👑</span>}
                        </div>
                        <span style={{ fontSize: "0.78rem", color: "#94a3b8" }}>{log.email}</span>
                      </td>
                      <td style={{ padding: "12px 10px" }}>
                        <span style={{
                          padding: "3px 8px",
                          borderRadius: "4px",
                          fontSize: "0.72rem",
                          fontWeight: "700",
                          backgroundColor: log.role === "admin" ? "rgba(168, 85, 247, 0.2)" : "rgba(56, 189, 248, 0.2)",
                          color: log.role === "admin" ? "#c084fc" : "#38bdf8",
                          border: `1px solid ${log.role === "admin" ? "rgba(168, 85, 247, 0.4)" : "rgba(56, 189, 248, 0.4)"}`
                        }}>
                          {log.roleTitle || log.role.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: "12px 10px", color: "#cbd5e1" }}>
                        {new Date(log.loginTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        <span style={{ fontSize: "0.72rem", color: "#64748b", display: "block" }}>
                          {new Date(log.loginTime).toLocaleDateString()}
                        </span>
                      </td>
                      <td style={{ padding: "12px 10px", color: "#cbd5e1" }}>
                        {log.device}
                      </td>
                      <td style={{ padding: "12px 10px", color: "#cbd5e1" }}>
                        {log.ip}
                      </td>
                      <td style={{ padding: "12px 10px" }}>
                        <span style={{
                          padding: "3px 8px",
                          borderRadius: "999px",
                          fontSize: "0.72rem",
                          fontWeight: "700",
                          backgroundColor: log.status === "Active Session" ? "rgba(34, 197, 94, 0.2)" : "rgba(148, 163, 184, 0.15)",
                          color: log.status === "Active Session" ? "#4ade80" : "#94a3b8",
                        }}>
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 2: ACCESS & PERMISSION DELEGATION ── */}
      {activeTab === "members" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px" }}>
          
          {/* Form: Add / Grant New Admin */}
          <div style={{ backgroundColor: "rgba(15, 23, 42, 0.85)", borderRadius: "14px", border: "1px solid #334155", padding: "20px" }}>
            <h3 style={{ margin: "0 0 8px 0", fontSize: "1.15rem", fontWeight: "700" }}>
              ➕ Grant Administrator Permission
            </h3>
            <p style={{ color: "#94a3b8", fontSize: "0.82rem", margin: "0 0 16px 0" }}>
              Only you ({HEAD_ADMIN_EMAIL}) or authorized admins can grant elevated permissions. Once added, this member will also see the Administrator menu.
            </p>

            <form onSubmit={handleGrantPermission}>
              <div style={{ marginBottom: "14px" }}>
                <label style={{ fontSize: "0.82rem", color: "#cbd5e1", display: "block", marginBottom: "4px" }}>Member Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. officer.assam@sdrf.gov.in"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  required
                  style={{ width: "100%", padding: "10px 12px", backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "8px", color: "#fff", fontSize: "0.9rem" }}
                />
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ fontSize: "0.82rem", color: "#cbd5e1", display: "block", marginBottom: "4px" }}>Permission / Role Level</label>
                <select
                  value={newAdminRole}
                  onChange={(e) => setNewAdminRole(e.target.value)}
                  style={{ width: "100%", padding: "10px 12px", backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "8px", color: "#fff", fontSize: "0.9rem" }}
                >
                  <option value="Regional Administrator">Regional Administrator (Level 2)</option>
                  <option value="Geotechnical Control Officer">Geotechnical Control Officer</option>
                  <option value="Incident Dispatch Lead">Incident Dispatch Lead</option>
                  <option value="System Security Manager">System Security Manager</option>
                </select>
              </div>

              <button
                type="submit"
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  backgroundColor: "#4f46e5",
                  color: "#fff",
                  fontWeight: "700",
                  fontSize: "0.9rem",
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(79, 70, 229, 0.4)"
                }}
              >
                Grant Administrator Access ➔
              </button>
            </form>
          </div>

          {/* List of Authorized Administrators */}
          <div style={{ backgroundColor: "rgba(15, 23, 42, 0.85)", borderRadius: "14px", border: "1px solid #334155", padding: "20px" }}>
            <h3 style={{ margin: "0 0 12px 0", fontSize: "1.15rem", fontWeight: "700" }}>
              👥 Current Authorized Administrators ({authorizedAdmins.length})
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {authorizedAdmins.map((admin) => {
                const isHead = admin.email.toLowerCase() === HEAD_ADMIN_EMAIL.toLowerCase();

                return (
                  <div
                    key={admin.email}
                    style={{
                      backgroundColor: "rgba(30, 41, 59, 0.6)",
                      border: `1px solid ${isHead ? "#f59e0b" : "#334155"}`,
                      borderRadius: "10px",
                      padding: "12px 14px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "10px"
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <strong style={{ color: "#f8fafc", fontSize: "0.95rem" }}>{admin.name || admin.email}</strong>
                        {isHead && (
                          <span style={{ backgroundColor: "rgba(245, 158, 11, 0.25)", color: "#fde68a", padding: "2px 6px", borderRadius: "4px", fontSize: "0.68rem", fontWeight: "800" }}>
                            HEAD ADMIN
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: "0.78rem", color: "#38bdf8", marginTop: "2px" }}>{admin.email}</div>
                      <div style={{ fontSize: "0.72rem", color: "#94a3b8", marginTop: "2px" }}>
                        Role: <strong>{admin.roleTitle}</strong> · Granted by: {admin.grantedBy || "System"}
                      </div>
                    </div>

                    {isHead ? (
                      <span style={{ fontSize: "0.75rem", color: "#f59e0b", fontStyle: "italic" }}>
                        Permanent Root
                      </span>
                    ) : (
                      <button
                        onClick={() => handleRevokePermission(admin.email)}
                        style={{
                          backgroundColor: "rgba(239, 68, 68, 0.2)",
                          color: "#fca5a5",
                          border: "1px solid rgba(239, 68, 68, 0.4)",
                          padding: "6px 10px",
                          borderRadius: "6px",
                          fontSize: "0.75rem",
                          fontWeight: "600",
                          cursor: "pointer"
                        }}
                      >
                        Revoke
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* ── TAB 3: PERMISSION REQUESTS QUEUE ── */}
      {activeTab === "requests" && (
        <div style={{ backgroundColor: "rgba(15, 23, 42, 0.85)", borderRadius: "14px", border: "1px solid #334155", padding: "20px" }}>
          <h3 style={{ margin: "0 0 6px 0", fontSize: "1.15rem", fontWeight: "700" }}>
            📋 Incoming Access & Role Clearance Requests
          </h3>
          <p style={{ color: "#94a3b8", fontSize: "0.82rem", margin: "0 0 16px 0" }}>
            Review role elevation requests submitted by field responders, volunteers, and geologists.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {requests.map((req) => (
              <div
                key={req.id}
                style={{
                  backgroundColor: "rgba(30, 41, 59, 0.6)",
                  border: "1px solid #334155",
                  borderRadius: "10px",
                  padding: "16px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  flexWrap: "wrap",
                  gap: "14px"
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                    <h4 style={{ margin: 0, fontSize: "1rem", color: "#f8fafc" }}>{req.name}</h4>
                    <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>({req.email})</span>
                    <span style={{
                      padding: "2px 8px",
                      borderRadius: "4px",
                      fontSize: "0.7rem",
                      fontWeight: "700",
                      backgroundColor: req.status === "Pending" ? "rgba(251, 191, 36, 0.2)" : req.status === "Approved" ? "rgba(34, 197, 94, 0.2)" : "rgba(239, 68, 68, 0.2)",
                      color: req.status === "Pending" ? "#fde68a" : req.status === "Approved" ? "#4ade80" : "#fca5a5"
                    }}>
                      {req.status}
                    </span>
                  </div>

                  <div style={{ fontSize: "0.82rem", color: "#cbd5e1", marginTop: "4px" }}>
                    Requested Role: <strong style={{ color: "#38bdf8" }}>{req.requestedRole}</strong> · Operational Sector: <strong style={{ color: "#fbbf24" }}>{req.sector}</strong>
                  </div>

                  <p style={{ margin: "6px 0 0 0", fontSize: "0.8rem", color: "#94a3b8", fontStyle: "italic" }}>
                    "{req.reason}"
                  </p>
                </div>

                {req.status === "Pending" && (
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      onClick={() => handleApproveRequest(req.id)}
                      style={{
                        backgroundColor: "#16a34a",
                        color: "#fff",
                        border: "none",
                        padding: "8px 14px",
                        borderRadius: "6px",
                        fontWeight: "700",
                        fontSize: "0.82rem",
                        cursor: "pointer"
                      }}
                    >
                      ✓ Approve
                    </button>
                    <button
                      onClick={() => handleRejectRequest(req.id)}
                      style={{
                        backgroundColor: "#dc2626",
                        color: "#fff",
                        border: "none",
                        padding: "8px 14px",
                        borderRadius: "6px",
                        fontWeight: "700",
                        fontSize: "0.82rem",
                        cursor: "pointer"
                      }}
                    >
                      ✕ Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
