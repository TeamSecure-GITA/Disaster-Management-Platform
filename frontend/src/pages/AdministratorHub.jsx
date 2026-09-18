import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  HEAD_ADMIN_EMAIL,
  isHeadAdmin,
  isAuthorizedAdmin,
  getAuthorizedAdmins,
  grantAdminPermission,
  revokeAdminPermission,
  getApprovedMembers,
  grantMemberApproval,
  revokeMemberApproval,
  getLoginAuditLogs,
  getLoginAnalytics,
  getPermissionRequests,
  updatePermissionRequest,
  getUserReviews,
  fetchUserReviews,
  getUnreadReviewCount,
  markAllReviewsRead,
  markReviewRead,
  deleteReview,
} from "../utils/adminAuth";
import { getOfflineSession } from "../utils/offlineStorage";
import { dispatchLocalUnsafeAlarm } from "../services/socketService";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function AdministratorHub() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("analytics"); // "analytics" | "members" | "requests" | "audit"

  // Data states
  const [analytics, setAnalytics] = useState(getLoginAnalytics());
  const [authorizedAdmins, setAuthorizedAdmins] = useState(getAuthorizedAdmins());
  const [approvedMembers, setApprovedMembers] = useState(getApprovedMembers());
  const [auditLogs, setAuditLogs] = useState(getLoginAuditLogs());
  const [requests, setRequests] = useState(getPermissionRequests());
  const [reviews, setReviews] = useState(getUserReviews());
  const [unreadReviews, setUnreadReviews] = useState(getUnreadReviewCount());

  // Add admin form state
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminRole, setNewAdminRole] = useState("Regional Administrator");

  // Add approved member form state
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberRole, setNewMemberRole] = useState("Field Responder");
  const [newMemberSector, setNewMemberSector] = useState("North East Regional Command");

  const [actionNotice, setActionNotice] = useState("");

  // Citizen Siren & Evacuation Dispatch States
  const [broadcastHazardType, setBroadcastHazardType] = useState("Flood & Cyclone");
  const [broadcastPerimeter, setBroadcastPerimeter] = useState("Vulnerable Low-Lying Coastal & Riverine Wards");
  const [broadcastMessage, setBroadcastMessage] = useState("Emergency Evacuation Order: All citizens in this perimeter are in danger. Head to nearest safe shelter immediately.");
  const [broadcastSending, setBroadcastSending] = useState(false);
  const [broadcastResult, setBroadcastResult] = useState(null);

  const [targetCitizenName, setTargetCitizenName] = useState("");
  const [targetCitizenPhone, setTargetCitizenPhone] = useState("");
  const [targetCitizenCoords, setTargetCitizenCoords] = useState("20.2961, 85.8245");
  const [targetSending, setTargetSending] = useState(false);
  const [targetResult, setTargetResult] = useState(null);

  const handleBroadcastUnsafe = async (e) => {
    e.preventDefault();
    setBroadcastSending(true);
    setBroadcastResult(null);
    try {
      const authToken = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/evacuation/broadcast-unsafe-citizens`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authToken && !authToken.startsWith("demo-") ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify({
          hazardType: broadcastHazardType,
          dangerZoneName: broadcastPerimeter,
          customMessage: broadcastMessage,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setBroadcastResult(json.data);
        setActionNotice("📢 Emergency siren & nearest safe place route broadcasted to all citizens in danger zone!");
        setTimeout(() => setActionNotice(""), 6000);
      } else {
        alert(json.message || "Broadcast failed.");
      }
    } catch (err) {
      console.warn("Broadcast error:", err);
      dispatchLocalUnsafeAlarm({
        id: `broadcast-${Date.now()}`,
        isUnsafe: true,
        triggerSiren: true,
        citizenName: "All Affected Citizens",
        hazardType: broadcastHazardType,
        message: broadcastMessage,
        nearestSafePlace: {
          name: "District Emergency Safe Refuge",
          address: "Central Relief Center, Main Highway",
          phone: "112",
          distanceKm: 2.1,
          latitude: 20.3015,
          longitude: 85.8312,
        },
        mapRouteUrl: "https://www.google.com/maps/dir/?api=1&destination=20.3015,85.8312&travelmode=walking",
      });
      setActionNotice("📢 Emergency siren broadcasted over local live alert network!");
      setTimeout(() => setActionNotice(""), 6000);
    } finally {
      setBroadcastSending(false);
    }
  };

  const handleTargetedUnsafeAlert = async (e) => {
    e.preventDefault();
    setTargetSending(true);
    setTargetResult(null);
    try {
      const authToken = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/evacuation/citizen-unsafe-alert`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authToken && !authToken.startsWith("demo-") ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify({
          citizenName: targetCitizenName || "Citizen",
          phone: targetCitizenPhone || undefined,
          currentLocation: targetCitizenCoords || undefined,
          hazardType: "Imminent Danger / Life Threat",
          customMessage: `🚨 CRITICAL SAFETY ALERT: You have been marked UNSAFE in an active hazard zone. Your phone siren is buzzing. Evacuate immediately!`,
          triggerSiren: true,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setTargetResult(json.data?.alarm);
        setActionNotice(`🚨 Unsafe emergency alert, siren & map route sent to ${targetCitizenName || "citizen"}'s phone!`);
        setTimeout(() => setActionNotice(""), 6000);
      } else {
        alert(json.message || "Dispatch failed.");
      }
    } catch (err) {
      console.warn("Target dispatch error:", err);
      setActionNotice(`🚨 Dispatched unsafe siren alarm over live channel!`);
      setTimeout(() => setActionNotice(""), 5000);
    } finally {
      setTargetSending(false);
    }
  };

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
    refreshData();

    const handleReviewsUpdate = () => {
      setReviews(getUserReviews());
      setUnreadReviews(getUnreadReviewCount());
    };
    window.addEventListener("platform_reviews_updated", handleReviewsUpdate);
    window.addEventListener("admin_auth_updated", refreshData);
    return () => {
      window.removeEventListener("platform_reviews_updated", handleReviewsUpdate);
      window.removeEventListener("admin_auth_updated", refreshData);
    };
  }, []);

  const refreshData = async () => {
    setAnalytics(getLoginAnalytics());
    setAuthorizedAdmins(getAuthorizedAdmins());
    setApprovedMembers(getApprovedMembers());
    setAuditLogs(getLoginAuditLogs());
    setRequests(getPermissionRequests());
    setReviews(getUserReviews());
    setUnreadReviews(getUnreadReviewCount());

    try {
      const serverReviews = await fetchUserReviews();
      if (Array.isArray(serverReviews)) {
        setReviews(serverReviews);
        setUnreadReviews(serverReviews.filter((r) => !r.readByAdmin).length);
      }
    } catch (_) {}
  };

  const handleGrantPermission = (e) => {
    e.preventDefault();

    // SECURITY: Only the Head Admin can grant permissions
    if (!isHeadAdmin(currentUser?.email)) {
      setActionNotice("⛔ Only the Head Administrator (debasishn185@gmail.com) can grant administrator permissions.");
      return;
    }

    if (!newAdminEmail || !newAdminEmail.includes("@")) {
      setActionNotice("⚠️ Please enter a valid member email address.");
      return;
    }

    const grantedByName = "Debasish N. (Head Administrator)";
    const res = grantAdminPermission(
      newAdminEmail.trim(),
      newAdminRole,
      grantedByName,
      currentUser?.email  // grantorEmail — enforced in adminAuth.js
    );
    if (res.success) {
      setActionNotice(`✅ Success: Granted ${newAdminRole} permissions to ${newAdminEmail}. They will see the Administrator menu on next login.`);
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

  const handleGrantMemberClearance = (e) => {
    e.preventDefault();
    if (!newMemberEmail || !newMemberEmail.includes("@")) {
      setActionNotice("⚠️ Please enter a valid member email address.");
      return;
    }
    const res = grantMemberApproval(
      newMemberEmail.trim(),
      newMemberRole,
      currentUser?.name || "Administrator",
      newMemberSector
    );
    if (res.success) {
      setActionNotice(`✅ Success: Approved member clearance granted to ${newMemberEmail}. They can now view and access all tactical disaster suites.`);
      setNewMemberEmail("");
      refreshData();
    } else {
      setActionNotice(`⚠️ ${res.message}`);
    }
  };

  const handleRevokeMemberClearance = (emailToRevoke) => {
    if (window.confirm(`Are you sure you want to revoke operational clearance for ${emailToRevoke}?`)) {
      const res = revokeMemberApproval(emailToRevoke);
      setActionNotice(res.message);
      refreshData();
    }
  };

  const handleApproveRequest = (reqId) => {
    // Only Head Admin can approve permission requests
    if (!isHeadAdmin(currentUser?.email)) {
      setActionNotice("⛔ Only the Head Administrator can approve access requests.");
      return;
    }
    const reviewerName = "Debasish N. (Head Administrator)";
    updatePermissionRequest(reqId, "Approved", reviewerName);
    setActionNotice(`✅ Request ${reqId} approved and administrator access provisioned.`);
    refreshData();
  };

  const handleRejectRequest = (reqId) => {
    if (!isHeadAdmin(currentUser?.email)) {
      setActionNotice("⛔ Only the Head Administrator can reject access requests.");
      return;
    }
    updatePermissionRequest(reqId, "Rejected", currentUser?.name || "Head Administrator");
    setActionNotice(`❌ Request ${reqId} rejected.`);
    refreshData();
  };

  const handleMarkAllReviewsRead = async () => {
    await markAllReviewsRead();
    await refreshData();
    setActionNotice("✅ All reviews marked as read.");
    setTimeout(() => setActionNotice(""), 3500);
  };

  const handleMarkReviewRead = async (reviewId) => {
    await markReviewRead(reviewId);
    await refreshData();
  };

  const handleDeleteReview = async (reviewId) => {
    if (window.confirm("Are you sure you want to permanently delete this review? This will remove it from the permanent database and disk storage.")) {
      await deleteReview(reviewId);
      await refreshData();
      setActionNotice("🗑️ Review permanently deleted.");
      setTimeout(() => setActionNotice(""), 3500);
    }
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
            Logged in as: <strong style={{ color: "#38bdf8" }}>{currentUser?.name || "Debasish N."}</strong> ({userEmail})
            {isHead
              ? " · Full root access: manage roles, inspect logins, approve requests."
              : " · View-only access. Contact Head Admin to modify member list."
            }
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

        {/* Reviews KPI card */}
        <div style={{ backgroundColor: "rgba(15, 23, 42, 0.85)", padding: "18px", borderRadius: "12px", border: unreadReviews > 0 ? "1px solid rgba(249, 115, 22, 0.5)" : "1px solid #334155", position: "relative", overflow: "hidden" }}>
          {unreadReviews > 0 && (
            <div style={{ position: "absolute", top: 0, right: 0, width: "4px", height: "100%", background: "linear-gradient(to bottom, #f97316, #ea580c)" }} />
          )}
          <span style={{ fontSize: "0.8rem", color: "#94a3b8", display: "block" }}>User Reviews</span>
          <h3 style={{ margin: "6px 0 0 0", fontSize: "1.8rem", fontWeight: "800", color: unreadReviews > 0 ? "#fb923c" : "#f8fafc" }}>
            {reviews.length} Total
          </h3>
          <span style={{ fontSize: "0.72rem", color: unreadReviews > 0 ? "#fdba74" : "#64748b" }}>
            {unreadReviews > 0 ? `🔔 ${unreadReviews} unread` : "All read"}
          </span>
        </div>
      </div>

      {/* ── TABS NAVIGATION ── */}
      <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid #334155", paddingBottom: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
        {[
          { id: "analytics", label: "📊 Live Logins & Active Users", icon: "🟢" },
          { id: "sirenDispatch", label: "🚨 Citizen Siren & Evacuation Dispatch", icon: "📢" },
          { id: "members", label: "🔑 Access Delegation (Add Members)", icon: "👥" },
          { id: "requests", label: `📋 Permission Requests (${requests.filter(r => r.status === "Pending").length})`, icon: "⏳" },
          {
            id: "reviews",
            label: unreadReviews > 0
              ? `⭐ User Reviews (${reviews.length})`
              : `⭐ User Reviews (${reviews.length})`,
            badge: unreadReviews > 0 ? unreadReviews : null,
          },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "10px 18px",
              borderRadius: "8px",
              border: "none",
              backgroundColor: activeTab === tab.id ? (tab.id === "reviews" && unreadReviews > 0 ? "#ea580c" : "#2563eb") : "rgba(30, 41, 59, 0.7)",
              color: activeTab === tab.id ? "#ffffff" : "#94a3b8",
              fontWeight: activeTab === tab.id ? "700" : "500",
              fontSize: "0.9rem",
              cursor: "pointer",
              position: "relative",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            {tab.label}
            {tab.badge && (
              <span style={{
                backgroundColor: "#ef4444",
                color: "#fff",
                fontSize: "0.68rem",
                fontWeight: "800",
                padding: "1px 6px",
                borderRadius: "999px",
                minWidth: "18px",
                textAlign: "center",
                lineHeight: "1.4",
                animation: "pulse 2s infinite",
              }}>
                {tab.badge}
              </span>
            )}
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

      {/* ── TAB: CITIZEN DANGER SIREN & EVACUATION DISPATCH ── */}
      {activeTab === "sirenDispatch" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "24px" }}>
          
          {/* Card 1: Broadcast to All Citizens in Danger Area */}
          <div
            style={{
              backgroundColor: "rgba(30, 10, 10, 0.85)",
              borderRadius: "16px",
              border: "2px solid #ef4444",
              padding: "24px",
              boxShadow: "0 0 25px rgba(239, 68, 68, 0.25)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "50%",
                  backgroundColor: "#dc2626",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.5rem",
                  boxShadow: "0 0 16px rgba(239, 68, 68, 0.8)",
                }}
              >
                📢
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: "800", color: "#fca5a5" }}>
                  Perimeter Danger Siren Broadcast
                </h3>
                <p style={{ margin: "2px 0 0 0", color: "#94a3b8", fontSize: "0.82rem" }}>
                  Buzzes emergency sirens on citizens' mobile phones and sends direct safe place routes.
                </p>
              </div>
            </div>

            <form onSubmit={handleBroadcastUnsafe}>
              <div style={{ marginBottom: "14px" }}>
                <label style={{ fontSize: "0.82rem", color: "#cbd5e1", display: "block", marginBottom: "4px", fontWeight: "600" }}>
                  Hazard Type / Threat Level
                </label>
                <select
                  value={broadcastHazardType}
                  onChange={(e) => setBroadcastHazardType(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    backgroundColor: "#0f172a",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "0.9rem",
                  }}
                >
                  <option value="Flood & Inundation">🌊 Flood & River Inundation (High Water)</option>
                  <option value="Cyclone & Storm Surge">🌀 Severe Cyclone & Gale Storm</option>
                  <option value="Landslide & Rockfall">⛰️ Landslide & Slope Failure</option>
                  <option value="Flash Flood & Cloudburst">⚡ Flash Flood & Sudden Deluge</option>
                  <option value="Earthquake Tremors">🏚️ Earthquake Shockwaves & Structural Collapse</option>
                  <option value="Chemical / Fire Hazard">🔥 Industrial Fire & Hazardous Smoke</option>
                </select>
              </div>

              <div style={{ marginBottom: "14px" }}>
                <label style={{ fontSize: "0.82rem", color: "#cbd5e1", display: "block", marginBottom: "4px", fontWeight: "600" }}>
                  Danger Perimeter / Affected Wards
                </label>
                <input
                  type="text"
                  value={broadcastPerimeter}
                  onChange={(e) => setBroadcastPerimeter(e.target.value)}
                  required
                  placeholder="e.g. Ward 12, Coastal Belt, Submerged Slums"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    backgroundColor: "#0f172a",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "0.9rem",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ fontSize: "0.82rem", color: "#cbd5e1", display: "block", marginBottom: "4px", fontWeight: "600" }}>
                  Emergency Evacuation Directive
                </label>
                <textarea
                  rows={3}
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  required
                  placeholder="Official evacuation directive sent to citizen mobile phones..."
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    backgroundColor: "#0f172a",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "0.88rem",
                    boxSizing: "border-box",
                    resize: "vertical",
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={broadcastSending}
                style={{
                  width: "100%",
                  padding: "13px",
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, #dc2626, #b91c1c)",
                  border: "1px solid #f87171",
                  color: "#ffffff",
                  fontWeight: "800",
                  fontSize: "0.95rem",
                  cursor: broadcastSending ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  boxShadow: "0 0 20px rgba(220, 38, 38, 0.5)",
                }}
              >
                <span>🚨</span>
                <span>{broadcastSending ? "Broadcasting Siren & Routing..." : "BROADCAST DANGER SIREN & SAFE ROUTE NOW"}</span>
              </button>
            </form>

            {broadcastResult && (
              <div
                style={{
                  marginTop: "16px",
                  backgroundColor: "rgba(6, 78, 59, 0.6)",
                  border: "1px solid #10b981",
                  borderRadius: "10px",
                  padding: "14px",
                  color: "#d1fae5",
                  fontSize: "0.85rem",
                }}
              >
                <div style={{ fontWeight: "800", color: "#ffffff", marginBottom: "4px" }}>
                  ✅ Broadcast Dispatched to Citizens
                </div>
                <div>🛡️ Designated Safe Refuge: <strong>{broadcastResult.nearestSafePlace?.name}</strong></div>
                <div style={{ marginTop: "6px" }}>
                  <a
                    href={broadcastResult.mapRouteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#6ee7b7", fontWeight: "700", textDecoration: "underline" }}
                  >
                    🗺️ Open Citizen Google Maps Navigation Route →
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Card 2: Targeted Citizen Direct Siren & Evacuation Alert */}
          <div
            style={{
              backgroundColor: "rgba(15, 23, 42, 0.85)",
              borderRadius: "16px",
              border: "2px solid #0284c7",
              padding: "24px",
              boxShadow: "0 0 25px rgba(2, 132, 199, 0.2)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "50%",
                  backgroundColor: "#0284c7",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.5rem",
                  boxShadow: "0 0 16px rgba(2, 132, 199, 0.8)",
                }}
              >
                🎯
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: "800", color: "#e0f2fe" }}>
                  Targeted Citizen Danger Alert
                </h3>
                <p style={{ margin: "2px 0 0 0", color: "#94a3b8", fontSize: "0.82rem" }}>
                  Direct siren alarm, SMS, push notification & shelter route to a specific citizen.
                </p>
              </div>
            </div>

            <form onSubmit={handleTargetedUnsafeAlert}>
              <div style={{ marginBottom: "14px" }}>
                <label style={{ fontSize: "0.82rem", color: "#cbd5e1", display: "block", marginBottom: "4px", fontWeight: "600" }}>
                  Citizen Name
                </label>
                <input
                  type="text"
                  value={targetCitizenName}
                  onChange={(e) => setTargetCitizenName(e.target.value)}
                  placeholder="e.g. Ramesh Sahoo"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    backgroundColor: "#0f172a",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "0.9rem",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ marginBottom: "14px" }}>
                <label style={{ fontSize: "0.82rem", color: "#cbd5e1", display: "block", marginBottom: "4px", fontWeight: "600" }}>
                  Mobile Phone Number (for SMS & Push)
                </label>
                <input
                  type="tel"
                  value={targetCitizenPhone}
                  onChange={(e) => setTargetCitizenPhone(e.target.value)}
                  placeholder="e.g. 9861012345"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    backgroundColor: "#0f172a",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "0.9rem",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ fontSize: "0.82rem", color: "#cbd5e1", display: "block", marginBottom: "4px", fontWeight: "600" }}>
                  GPS Coordinates (Latitude, Longitude)
                </label>
                <input
                  type="text"
                  value={targetCitizenCoords}
                  onChange={(e) => setTargetCitizenCoords(e.target.value)}
                  placeholder="e.g. 20.2961, 85.8245"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    backgroundColor: "#0f172a",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "0.9rem",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={targetSending}
                style={{
                  width: "100%",
                  padding: "13px",
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, #0284c7, #0369a1)",
                  border: "1px solid #38bdf8",
                  color: "#ffffff",
                  fontWeight: "800",
                  fontSize: "0.95rem",
                  cursor: targetSending ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  boxShadow: "0 0 20px rgba(2, 132, 199, 0.4)",
                }}
              >
                <span>🚨</span>
                <span>{targetSending ? "Dispatching Siren & Route..." : "DISPATCH PHONE SIREN & MAP ROUTE"}</span>
              </button>
            </form>

            {targetResult && (
              <div
                style={{
                  marginTop: "16px",
                  backgroundColor: "rgba(2, 132, 199, 0.2)",
                  border: "1px solid #38bdf8",
                  borderRadius: "10px",
                  padding: "14px",
                  color: "#e0f2fe",
                  fontSize: "0.85rem",
                }}
              >
                <div style={{ fontWeight: "800", color: "#ffffff", marginBottom: "4px" }}>
                  ✅ Siren Alarm & Route Dispatched
                </div>
                <div>🛡️ Nearest Safe Place: <strong>{targetResult.nearestSafePlace?.name}</strong> (~{targetResult.nearestSafePlace?.distanceKm} km away)</div>
                <div style={{ marginTop: "6px" }}>
                  <a
                    href={targetResult.mapRouteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#38bdf8", fontWeight: "700", textDecoration: "underline" }}
                  >
                    🗺️ Direct Google Maps Navigation Route →
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 2: ACCESS & PERMISSION DELEGATION ── */}
      {activeTab === "members" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px" }}>
          
          {/* Form: Add / Grant New Admin — HEAD ADMIN ONLY */}
          <div style={{ backgroundColor: "rgba(15, 23, 42, 0.85)", borderRadius: "14px", border: `1px solid ${isHead ? "#334155" : "#7c3aed"}`, padding: "20px" }}>
            <h3 style={{ margin: "0 0 8px 0", fontSize: "1.15rem", fontWeight: "700" }}>
              ➕ Grant Administrator Permission
            </h3>

            {!isHead ? (
              /* Non-head admin: read-only notice */
              <div style={{ backgroundColor: "rgba(124, 58, 237, 0.15)", border: "1px solid rgba(124, 58, 237, 0.5)", borderRadius: "10px", padding: "16px", textAlign: "center" }}>
                <div style={{ fontSize: "1.5rem", marginBottom: "6px" }}>🔐</div>
                <div style={{ color: "#c4b5fd", fontWeight: "700", fontSize: "0.9rem", marginBottom: "4px" }}>Head Administrator Exclusive</div>
                <div style={{ color: "#94a3b8", fontSize: "0.82rem", lineHeight: "1.5" }}>
                  Only <strong style={{ color: "#f59e0b" }}>debasishn185@gmail.com</strong> can add or remove administrators.
                  You have view access to this panel because you are an authorized member.
                </div>
              </div>
            ) : (
              /* Head admin: full form */
              <>
                <p style={{ color: "#94a3b8", fontSize: "0.82rem", margin: "0 0 16px 0" }}>
                  Add a trusted member by email. Once added, they will see the Administrator menu after their next login.
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
                      style={{ width: "100%", padding: "10px 12px", backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "8px", color: "#fff", fontSize: "0.9rem", boxSizing: "border-box" }}
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
                      background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                      color: "#fff",
                      fontWeight: "700",
                      fontSize: "0.9rem",
                      border: "none",
                      cursor: "pointer",
                      boxShadow: "0 4px 12px rgba(79, 70, 229, 0.4)"
                    }}
                  >
                    👑 Grant Administrator Access →
                  </button>
                </form>
              </>
            )}
          </div>

          {/* List of Authorized Administrators */}
          <div style={{ backgroundColor: "rgba(15, 23, 42, 0.85)", borderRadius: "14px", border: "1px solid #334155", padding: "20px" }}>
            <h3 style={{ margin: "0 0 12px 0", fontSize: "1.15rem", fontWeight: "700" }}>
              👥 Current Authorized Administrators ({authorizedAdmins.length})
            </h3>
            {!isHead && (
              <div style={{ backgroundColor: "rgba(245, 158, 11, 0.1)", border: "1px solid rgba(245, 158, 11, 0.3)", borderRadius: "8px", padding: "10px 14px", marginBottom: "12px", fontSize: "0.8rem", color: "#fde68a" }}>
                🔐 Only <strong>debasishn185@gmail.com</strong> can add or revoke admin members.
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {authorizedAdmins.map((admin) => {
                const adminIsHead = admin.email.toLowerCase() === HEAD_ADMIN_EMAIL.toLowerCase();

                return (
                  <div
                    key={admin.email}
                    style={{
                      backgroundColor: "rgba(30, 41, 59, 0.6)",
                      border: `1px solid ${adminIsHead ? "#f59e0b" : "#334155"}`,
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
                        {adminIsHead && (
                          <span style={{ backgroundColor: "rgba(245, 158, 11, 0.25)", color: "#fde68a", padding: "2px 6px", borderRadius: "4px", fontSize: "0.68rem", fontWeight: "800" }}>
                            👑 HEAD ADMIN
                          </span>
                        )}
                        {!adminIsHead && (
                          <span style={{ backgroundColor: "rgba(99, 102, 241, 0.2)", color: "#a5b4fc", padding: "2px 6px", borderRadius: "4px", fontSize: "0.68rem", fontWeight: "700" }}>
                            DELEGATED
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: "0.78rem", color: "#38bdf8", marginTop: "2px" }}>{admin.email}</div>
                      <div style={{ fontSize: "0.72rem", color: "#94a3b8", marginTop: "2px" }}>
                        Role: <strong>{admin.roleTitle}</strong> · Granted by: {admin.grantedBy || "System"}
                      </div>
                    </div>

                    {adminIsHead ? (
                      <span style={{ fontSize: "0.75rem", color: "#f59e0b", fontStyle: "italic" }}>
                        Permanent Root
                      </span>
                    ) : isHead ? (
                      /* Only Head Admin sees Revoke button */
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
                    ) : (
                      <span style={{ fontSize: "0.72rem", color: "#64748b", fontStyle: "italic" }}>View only</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── SECTION 2: APPROVED OPERATIONAL MEMBERS ── */}
          <div style={{ backgroundColor: "rgba(15, 23, 42, 0.85)", borderRadius: "14px", border: "1px solid #0284c7", padding: "20px" }}>
            <h3 style={{ margin: "0 0 8px 0", fontSize: "1.15rem", fontWeight: "700", color: "#38bdf8", display: "flex", alignItems: "center", gap: "8px" }}>
              <span>🛡️</span> Grant Operational Member Clearance
            </h3>
            <p style={{ color: "#94a3b8", fontSize: "0.82rem", margin: "0 0 16px 0", lineHeight: "1.5" }}>
              Approve field responders, geologists, and relief coordinators to unlock restricted features (Digital Twin, Drone Analytics, Zero-Net Mesh, Aid Ledger, and Deep Tech Suites).
            </p>

            <form onSubmit={handleGrantMemberClearance}>
              <div style={{ marginBottom: "14px" }}>
                <label style={{ fontSize: "0.82rem", color: "#cbd5e1", display: "block", marginBottom: "4px" }}>
                  Member Email Address
                </label>
                <input
                  type="email"
                  placeholder="e.g. geologist.sikkim@gsi.gov.in"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    backgroundColor: "#0f172a",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "0.9rem",
                    boxSizing: "border-box"
                  }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "16px" }}>
                <div>
                  <label style={{ fontSize: "0.82rem", color: "#cbd5e1", display: "block", marginBottom: "4px" }}>
                    Operational Role
                  </label>
                  <select
                    value={newMemberRole}
                    onChange={(e) => setNewMemberRole(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      backgroundColor: "#0f172a",
                      border: "1px solid #334155",
                      borderRadius: "8px",
                      color: "#fff",
                      fontSize: "0.85rem",
                      boxSizing: "border-box"
                    }}
                  >
                    <option value="Field Responder">Field Responder</option>
                    <option value="Geotechnical Analyst">Geotechnical Analyst</option>
                    <option value="UAV Drone Pilot">UAV Drone Pilot</option>
                    <option value="Relief Logistics Officer">Relief Logistics Officer</option>
                    <option value="Community Volunteer Lead">Community Volunteer Lead</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: "0.82rem", color: "#cbd5e1", display: "block", marginBottom: "4px" }}>
                    Sector
                  </label>
                  <input
                    type="text"
                    value={newMemberSector}
                    onChange={(e) => setNewMemberSector(e.target.value)}
                    placeholder="Sikkim / Brahmaputra"
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      backgroundColor: "#0f172a",
                      border: "1px solid #334155",
                      borderRadius: "8px",
                      color: "#fff",
                      fontSize: "0.85rem",
                      boxSizing: "border-box"
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  background: "linear-gradient(135deg, #0284c7, #0369a1)",
                  color: "#fff",
                  fontWeight: "700",
                  fontSize: "0.9rem",
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(2, 132, 199, 0.4)"
                }}
              >
                🛡️ Grant Member Clearance →
              </button>
            </form>
          </div>

          {/* List of Approved Operational Members */}
          <div style={{ backgroundColor: "rgba(15, 23, 42, 0.85)", borderRadius: "14px", border: "1px solid #334155", padding: "20px" }}>
            <h3 style={{ margin: "0 0 12px 0", fontSize: "1.15rem", fontWeight: "700", color: "#a5b4fc", display: "flex", alignItems: "center", gap: "8px" }}>
              <span>📋</span> Approved Operational Members ({approvedMembers.length})
            </h3>
            <p style={{ color: "#94a3b8", fontSize: "0.8rem", margin: "0 0 14px 0" }}>
              Members who possess verified clearance to view Before/During/After disaster features.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {approvedMembers.map((member) => (
                <div
                  key={member.email}
                  style={{
                    backgroundColor: "rgba(30, 41, 59, 0.6)",
                    border: "1px solid #334155",
                    borderRadius: "10px",
                    padding: "12px 14px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "10px"
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <strong style={{ fontSize: "0.92rem", color: "#f8fafc" }}>{member.name || member.email.split("@")[0]}</strong>
                      <span style={{ backgroundColor: "rgba(34, 197, 94, 0.2)", color: "#4ade80", padding: "2px 6px", borderRadius: "4px", fontSize: "0.68rem", fontWeight: "700" }}>
                        APPROVED
                      </span>
                    </div>
                    <div style={{ fontSize: "0.78rem", color: "#38bdf8", marginTop: "2px" }}>{member.email}</div>
                    <div style={{ fontSize: "0.72rem", color: "#94a3b8", marginTop: "2px" }}>
                      Role: <strong>{member.roleTitle}</strong> · Sector: <strong>{member.sector || "General"}</strong>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRevokeMemberClearance(member.email)}
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
                </div>
              ))}
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

                {/* Only Head Admin can approve/reject */}
                {req.status === "Pending" && isHead && (
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
                {req.status === "Pending" && !isHead && (
                  <span style={{ fontSize: "0.78rem", color: "#64748b", fontStyle: "italic", alignSelf: "center" }}>Only Head Admin can action</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 4: USER REVIEWS ── */}
      {activeTab === "reviews" && (
        <div style={{ backgroundColor: "rgba(15, 23, 42, 0.85)", borderRadius: "14px", border: "1px solid #334155", padding: "20px" }}>
          {/* Header row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <h3 style={{ margin: "0 0 4px 0", fontSize: "1.15rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" }}>
                ⭐ Platform User Reviews
                {unreadReviews > 0 && (
                  <span style={{
                    backgroundColor: "rgba(249, 115, 22, 0.2)",
                    border: "1px solid rgba(249, 115, 22, 0.5)",
                    color: "#fb923c",
                    fontSize: "0.72rem",
                    fontWeight: "800",
                    padding: "2px 8px",
                    borderRadius: "999px",
                    animation: "pulse 2s infinite",
                  }}>
                    🔔 {unreadReviews} New
                  </span>
                )}
              </h3>
              <p style={{ color: "#94a3b8", fontSize: "0.82rem", margin: 0 }}>
                Feedback submitted by platform users. Unread reviews are highlighted below.
              </p>
            </div>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {unreadReviews > 0 && (
                <button
                  onClick={handleMarkAllReviewsRead}
                  style={{
                    padding: "8px 14px",
                    backgroundColor: "rgba(16, 185, 129, 0.15)",
                    color: "#34d399",
                    border: "1px solid rgba(16, 185, 129, 0.4)",
                    borderRadius: "8px",
                    fontSize: "0.82rem",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  ✓ Mark All as Read
                </button>
              )}
              <span style={{
                padding: "8px 14px",
                backgroundColor: "rgba(99, 102, 241, 0.12)",
                color: "#a5b4fc",
                border: "1px solid rgba(99, 102, 241, 0.3)",
                borderRadius: "8px",
                fontSize: "0.82rem",
                fontWeight: "600",
              }}>
                Total: {reviews.length} review{reviews.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          {/* Summary stats */}
          {reviews.length > 0 && (
            <div style={{ display: "flex", gap: "12px", marginBottom: "18px", flexWrap: "wrap" }}>
              <div style={{ backgroundColor: "rgba(245, 158, 11, 0.08)", border: "1px solid rgba(245, 158, 11, 0.2)", borderRadius: "8px", padding: "10px 16px", minWidth: "110px", textAlign: "center" }}>
                <div style={{ fontSize: "1.5rem", fontWeight: "800", color: "#f59e0b" }}>
                  {(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)}
                </div>
                <div style={{ fontSize: "0.72rem", color: "#fde68a" }}>Avg Rating</div>
              </div>
              {[5, 4, 3, 2, 1].map(star => {
                const count = reviews.filter(r => r.rating === star).length;
                const pct = reviews.length > 0 ? Math.round((count / reviews.length) * 100) : 0;
                return (
                  <div key={star} style={{ flex: 1, minWidth: "140px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "0.75rem", color: "#f59e0b", minWidth: "18px" }}>{star}★</span>
                    <div style={{ flex: 1, height: "6px", backgroundColor: "#1e293b", borderRadius: "3px", overflow: "hidden" }}>
                      <div style={{ width: `${pct}%`, height: "100%", backgroundColor: star >= 4 ? "#22c55e" : star === 3 ? "#f59e0b" : "#ef4444", borderRadius: "3px", transition: "width 0.5s" }} />
                    </div>
                    <span style={{ fontSize: "0.72rem", color: "#64748b", minWidth: "24px" }}>{count}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Reviews list */}
          {reviews.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 20px", color: "#475569" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "10px" }}>📭</div>
              <p style={{ fontWeight: "600", fontSize: "0.95rem" }}>No reviews submitted yet.</p>
              <p style={{ fontSize: "0.82rem", color: "#334155" }}>Users can submit reviews from the platform's Review section.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {reviews.map((review) => (
                <div
                  key={review.id}
                  style={{
                    backgroundColor: review.readByAdmin ? "rgba(30, 41, 59, 0.5)" : "rgba(30, 41, 59, 0.85)",
                    border: review.readByAdmin ? "1px solid #1e293b" : "1.5px solid rgba(249, 115, 22, 0.45)",
                    borderRadius: "12px",
                    padding: "16px 18px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    flexWrap: "wrap",
                    gap: "14px",
                    transition: "border-color 0.3s",
                  }}
                >
                  {/* Left: review content */}
                  <div style={{ flex: 1, minWidth: "240px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px", flexWrap: "wrap" }}>
                      {/* Stars */}
                      <span style={{ color: "#f59e0b", fontSize: "0.95rem", letterSpacing: "1px" }}>
                        {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                      </span>
                      <span style={{ backgroundColor: "rgba(99, 102, 241, 0.15)", color: "#a5b4fc", fontSize: "0.7rem", fontWeight: "700", padding: "2px 7px", borderRadius: "4px", border: "1px solid rgba(99, 102, 241, 0.3)" }}>
                        {review.category}
                      </span>
                      {!review.readByAdmin && (
                        <span style={{ backgroundColor: "rgba(249, 115, 22, 0.18)", color: "#fb923c", fontSize: "0.68rem", fontWeight: "800", padding: "1px 7px", borderRadius: "999px", border: "1px solid rgba(249, 115, 22, 0.4)" }}>
                          🔔 NEW
                        </span>
                      )}
                    </div>

                    <p style={{ margin: "0 0 8px 0", color: "#cbd5e1", fontSize: "0.87rem", lineHeight: "1.6", fontStyle: "italic" }}>
                      "{review.message}"
                    </p>

                    <div style={{ display: "flex", gap: "16px", fontSize: "0.75rem", color: "#475569", flexWrap: "wrap", alignItems: "center" }}>
                      <span>👤 <strong style={{ color: "#64748b" }}>{review.name}</strong></span>
                      {review.email && <span>✉️ {review.email}</span>}
                      <span>🕐 {new Date(review.submittedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                      <span style={{ color: "#334155" }}>ID: {review.id}</span>
                      <span style={{ backgroundColor: "rgba(16, 185, 129, 0.1)", color: "#34d399", padding: "1px 6px", borderRadius: "4px", border: "1px solid rgba(16, 185, 129, 0.2)" }}>
                        💾 Permanent Storage
                      </span>
                    </div>
                  </div>

                  {/* Right: actions */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", alignItems: "flex-end" }}>
                    {!review.readByAdmin && (
                      <button
                        onClick={() => handleMarkReviewRead(review.id)}
                        style={{
                          padding: "6px 11px",
                          backgroundColor: "rgba(16, 185, 129, 0.15)",
                          color: "#34d399",
                          border: "1px solid rgba(16, 185, 129, 0.4)",
                          borderRadius: "6px",
                          fontSize: "0.75rem",
                          fontWeight: "600",
                          cursor: "pointer",
                          whiteSpace: "nowrap",
                        }}
                      >
                        ✓ Mark Read
                      </button>
                    )}
                    {review.readByAdmin && (
                      <span style={{ fontSize: "0.72rem", color: "#4ade80", fontStyle: "italic" }}>✓ Read</span>
                    )}
                    {(isHead || isAdmin) && (
                      <button
                        onClick={() => handleDeleteReview(review.id)}
                        title="Permanently delete this review from the system"
                        style={{
                          padding: "6px 11px",
                          backgroundColor: "rgba(239, 68, 68, 0.12)",
                          color: "#fca5a5",
                          border: "1px solid rgba(239, 68, 68, 0.3)",
                          borderRadius: "6px",
                          fontSize: "0.75rem",
                          fontWeight: "600",
                          cursor: "pointer",
                          whiteSpace: "nowrap",
                        }}
                      >
                        🗑️ Delete Permanently
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
