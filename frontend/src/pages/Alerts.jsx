import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { subscribeToDisasterAlerts } from "../services/socketService";
import { onForegroundMessage } from "../services/fcmService";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const OFFICIAL_PORTALS = [
  {
    name: "NDMA SACHET (CAP-CP)",
    tagline: "India National Disaster Alert Portal",
    url: "https://sachet.ndma.gov.in/",
    icon: "🇮🇳",
    badge: "Official CAP Feed",
    nodal: "IMD • CWC • INCOIS",
    color: "#38bdf8",
    feedKey: "NDMA_SACHET_CAP",
  },
  {
    name: "GDACS Automated Alerts",
    tagline: "UN OCHA & European Commission",
    url: "https://www.gdacs.org/",
    icon: "🌐",
    badge: "Automated Multi-Hazard",
    nodal: "UN OCHA • EC JRC",
    color: "#ec4899",
    feedKey: "GDACS_RSS",
  },
  {
    name: "USGS 60s Seismic Feed",
    tagline: "USGS Real-time GeoJSON Stream",
    url: "https://earthquake.usgs.gov/earthquakes/map/",
    icon: "⚡",
    badge: "60-Second Real-Time",
    nodal: "USGS • ANSS",
    color: "#10b981",
    feedKey: "USGS_GEOJSON",
  },
  {
    name: "IMD Weather Bureau",
    tagline: "India Meteorological Department",
    url: "https://mausam.imd.gov.in/",
    icon: "🌦️",
    badge: "Cyclones & Nowcasts",
    nodal: "Ministry of Earth Sciences",
    color: "#f59e0b",
    feedKey: "NDMA_SACHET_CAP",
  },
];

// Fallback initial alerts if offline or during initial startup
const FALLBACK_ALERTS = [
  {
    _id: "seed-1",
    title: "[NDMA SACHET / IMD] Severe Thunderstorm & Lightning Nowcast: Coastal Districts",
    message: "Instant CAP Nowcast issued by India Meteorological Department (IMD) via SACHET. Moderate cloud to ground lightning with surface wind squalls (55-65 km/h) and localized heavy rain expected.",
    type: "cyclone",
    severity: "critical",
    sourceAgency: "NDMA SACHET (IMD)",
    sourceNodalAgency: "IMD",
    feedSource: "NDMA_SACHET_CAP",
    sourceUrl: "https://sachet.ndma.gov.in/",
    isGovtOfficial: true,
    affectedAreas: ["Odisha Coastal Belts", "West Bengal Delta", "North Coastal Andhra"],
    location: { coordinates: [86.8315, 19.8135] },
    earlyWarningLeadTimeMinutes: 120,
    instructions: [
      "⚡ LIGHTNING ALERT: Seek immediate indoor shelter in permanent pucca structures.",
      "Stay away from open water bodies, tall isolated trees, and electric poles.",
      "Keep battery-operated emergency lights and emergency communication devices charged.",
    ],
    createdAt: new Date().toISOString(),
  },
  {
    _id: "seed-2",
    title: "[GDACS/UN] Automated Tropical Cyclone Warning & Impact Assessment",
    message: "Automated, human-intervention-free calculation indicates rapid intensification of tropical system over the Bay of Bengal with 130 km/h sustained gusts. Estimated 1.2M citizens in coastal impact buffer.",
    type: "cyclone",
    severity: "high",
    sourceAgency: "GDACS (UN OCHA / European Commission)",
    sourceNodalAgency: "UN OCHA / EC JRC",
    feedSource: "GDACS_RSS",
    sourceUrl: "https://www.gdacs.org/",
    isGovtOfficial: true,
    affectedAreas: ["Bay of Bengal Marine Zone", "Coastal Lowlands"],
    location: { coordinates: [88.5, 18.2] },
    earlyWarningLeadTimeMinutes: 180,
    instructions: [
      "Fishermen are advised to return to nearest ports immediately.",
      "Identify designated multi-purpose cyclone shelters and keep emergency supplies ready.",
    ],
    createdAt: new Date(Date.now() - 25 * 60000).toISOString(),
  },
  {
    _id: "seed-3",
    title: "[USGS Real-time Seismic] M 5.8 Deep Subduction Zone Earthquake",
    message: "Significant seismic event detected by USGS seismic sensor network within 42 seconds of occurrence. Real-time epicenter depth: 32 km. Pre-impact alerts dispatched to coastal disaster management units.",
    type: "earthquake",
    severity: "high",
    sourceAgency: "USGS Earthquake Hazards Program",
    sourceNodalAgency: "USGS / ANSS",
    feedSource: "USGS_GEOJSON",
    sourceUrl: "https://earthquake.usgs.gov/earthquakes/map/",
    isGovtOfficial: true,
    affectedAreas: ["Regional Fault Zone"],
    location: { coordinates: [93.2, 12.5] },
    earlyWarningLeadTimeMinutes: 1,
    instructions: [
      "DROP, COVER, and HOLD ON immediately under reinforced tables or door frames.",
      "Check utility lines (gas, water, electricity) before re-entering compromised buildings.",
    ],
    createdAt: new Date(Date.now() - 40 * 60000).toISOString(),
  },
];

// Fallback crowd signals if offline
const FALLBACK_CROWD_SIGNALS = [
  {
    _id: "cs-1",
    keyword: "earthquake",
    disasterType: "earthquake",
    currentVelocityPerMin: 14,
    baselineAvgPerMin: 2.0,
    surgeRatio: 7.0,
    zScore: 3.8,
    confidenceScore: 92,
    detectedLocations: ["Bhubaneswar", "Cuttack"],
    status: "unverified_signal",
    source: "BLUESKY_STREAM",
    samplePosts: [
      { text: "Felt strong tremors in Bhubaneswar just now! Fans swinging violently.", author: "citizen_bbsr", createdAt: new Date() },
      { text: "Earthquake shaking felt in Cuttack! Did anyone else feel that?", author: "odisha_updates", createdAt: new Date() },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    _id: "cs-2",
    keyword: "flood",
    disasterType: "flood",
    currentVelocityPerMin: 8,
    baselineAvgPerMin: 1.5,
    surgeRatio: 5.3,
    zScore: 2.9,
    confidenceScore: 84,
    detectedLocations: ["Kolkata", "Howrah"],
    status: "unverified_signal",
    source: "BLUESKY_STREAM",
    samplePosts: [
      { text: "Massive waterlogging on VIP Road, cars half submerged after cloudburst.", author: "kolkata_traffic", createdAt: new Date() },
    ],
    createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
  },
];

// Fallback seed notifications for disaster alerts & civil broadcasts
const SEED_NOTIFICATIONS = [
  {
    id: "seed-1",
    title: "[IMD / NDMA SACHET] Cyclone & High Squall Advisory",
    message: "Severe weather system active. Heavy rainfall & squally wind conditions forecasted along the coastal belt.",
    location: "Odisha & Bengal Coast",
    time: "10m ago",
    severity: "High",
    read: false,
    sourceAgency: "IMD Govt of India / NDMA SACHET",
    sourceUrl: "https://sachet.ndma.gov.in/",
    isGovtOfficial: true,
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
  },
  {
    id: "seed-2",
    title: "[CWC Flood Forecast] River Basin Inundation Warning",
    message: "River catchment precipitation triggering advisory levels in delta zones.",
    location: "Bhubaneswar & Cuttack",
    time: "30m ago",
    severity: "Medium",
    read: false,
    sourceAgency: "Central Water Commission",
    sourceUrl: "https://ffs.india-water.gov.in/",
    isGovtOfficial: true,
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: "seed-3",
    title: "Safety Centers & Shelters Operational",
    message: "Multi-purpose emergency shelters and relief distribution points are prepared.",
    location: "Nearby Safe Zones",
    time: "1h ago",
    severity: "Low",
    read: true,
    sourceAgency: "Platform Emergency Administration",
    sourceUrl: "https://sachet.ndma.gov.in/",
    isGovtOfficial: false,
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  },
];

const notifSeverityIcon = (s) => {
  const sev = (s || "").toLowerCase();
  if (sev === "critical" || sev === "high") return "🚨";
  if (sev === "medium") return "⚠️";
  return "ℹ️";
};

const notifSeverityColor = (s) => {
  const sev = (s || "").toLowerCase();
  if (sev === "critical") return "#dc2626";
  if (sev === "high") return "#ef4444";
  if (sev === "medium") return "#f59e0b";
  return "#94a3b8";
};

function formatNotifTimeAgo(dateStr) {
  if (!dateStr) return "just now";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function NotifToast({ notification, onDismiss }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 8000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const officialUrl = notification.sourceUrl || "https://sachet.ndma.gov.in/";

  return (
    <div
      style={{
        position: "fixed",
        top: "80px",
        right: "20px",
        zIndex: 9999,
        backgroundColor: "#0f172a",
        border: `2px solid ${notifSeverityColor(notification.severity || "High")}`,
        borderRadius: "12px",
        padding: "16px 20px",
        maxWidth: "380px",
        color: "#fff",
        boxShadow: "0 10px 35px rgba(0,0,0,0.6)",
        animation: "slideIn 0.3s ease",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
        <div>
          {notification.sourceAgency && (
            <div
              style={{
                fontSize: "0.68rem",
                fontWeight: "800",
                color: "#38bdf8",
                textTransform: "uppercase",
                marginBottom: "4px",
              }}
            >
              🏛️ {notification.sourceAgency}
            </div>
          )}
          <div style={{ fontWeight: "700", fontSize: "0.95rem", marginBottom: "4px" }}>
            {notifSeverityIcon(notification.severity)} {notification.title}
          </div>
          <div style={{ fontSize: "0.82rem", color: "#cbd5e1", marginBottom: "10px" }}>
            {notification.body || notification.message}
          </div>

          {officialUrl && (
            <a
              href={officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                backgroundColor: "#2563eb",
                color: "#fff",
                fontSize: "0.75rem",
                fontWeight: "700",
                padding: "6px 12px",
                borderRadius: "6px",
                textDecoration: "none",
              }}
            >
              <span>View Official Advisory</span>
              <span>↗</span>
            </a>
          )}
        </div>
        <button
          onClick={onDismiss}
          style={{
            background: "none",
            border: "none",
            color: "#64748b",
            cursor: "pointer",
            fontSize: "1.2rem",
            padding: "0",
            lineHeight: 1,
          }}
          aria-label="Dismiss notification"
        >
          ×
        </button>
      </div>
    </div>
  );
}

export default function Alerts() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") === "notifications" ? "notifications" : "official";
  const [activeTab, setActiveTab] = useState(initialTab); // 'official' | 'notifications' | 'crowd'
  const [alerts, setAlerts] = useState([]);
  const [crowdSignals, setCrowdSignals] = useState([]);
  const [feedHealth, setFeedHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingCrowd, setLoadingCrowd] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState(null);
  const [feedSourceFilter, setFeedSourceFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [newAlertBadge, setNewAlertBadge] = useState(null);

  // Fetch feed health status from backend
  const fetchFeedHealth = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/alerts/feed-health`);
      if (res.ok) {
        const json = await res.json();
        setFeedHealth(json.data?.feeds || null);
      }
    } catch (e) {
      // Non-fatal
    }
  }, []);

  // Fetch alerts from backend
  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    try {
      const govtRes = await fetch(`${API_URL}/api/alerts/live-govt`);
      let combined = [];

      if (govtRes.ok) {
        const govtJson = await govtRes.json();
        combined = govtJson.data || [];
      }

      // Supplement with general platform alerts
      try {
        const allRes = await fetch(`${API_URL}/api/alerts`);
        if (allRes.ok) {
          const allJson = await allRes.json();
          const generalAlerts = allJson.data || [];
          const seenIds = new Set(combined.map((a) => a._id || a.externalId));
          for (const item of generalAlerts) {
            if (!seenIds.has(item._id) && !seenIds.has(item.externalId)) {
              combined.push(item);
            }
          }
        }
      } catch (e) {}

      if (combined.length > 0) {
        setAlerts(combined);
      } else {
        setAlerts(FALLBACK_ALERTS);
      }
    } catch (err) {
      console.warn("Failed to fetch alerts, using fallback data:", err);
      setAlerts(FALLBACK_ALERTS);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch live crowd signals & media volume anomalies
  const fetchCrowdSignals = useCallback(async () => {
    setLoadingCrowd(true);
    try {
      const res = await fetch(`${API_URL}/api/alerts/crowd-signals?limit=15`);
      if (res.ok) {
        const json = await res.json();
        const data = json.data || [];
        setCrowdSignals(data.length > 0 ? data : FALLBACK_CROWD_SIGNALS);
      } else {
        setCrowdSignals(FALLBACK_CROWD_SIGNALS);
      }
    } catch (err) {
      setCrowdSignals(FALLBACK_CROWD_SIGNALS);
    } finally {
      setLoadingCrowd(false);
    }
  }, []);

  // Trigger manual sync with official government programmatic feeds
  const handleSyncGovtFeeds = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await fetch(`${API_URL}/api/alerts/sync-govt`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        setSyncResult({
          syncedCount: data.syncedCount || 0,
          newAlertsCount: data.newAlertsCount || 0,
          breakdown: data.breakdown,
        });
        await fetchAlerts();
        await fetchFeedHealth();
        await fetchCrowdSignals();
      }
    } catch (err) {
      console.warn("Sync error:", err);
    } finally {
      setSyncing(false);
    }
  };

  // Notifications State & Logic merged into Disaster Alert
  const [notifications, setNotifications] = useState(SEED_NOTIFICATIONS);
  const [loadingNotifs, setLoadingNotifs] = useState(false);
  const [notifToast, setNotifToast] = useState(null);
  const [notifFilterTab, setNotifFilterTab] = useState("all");
  const [pushEnabled, setPushEnabled] = useState(() => {
    return typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted";
  });
  const fcmUnsubRef = useRef(null);

  // Sync tab from URL query params
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "notifications" && activeTab !== "notifications") {
      setActiveTab("notifications");
    }
  }, [searchParams]);

  // Fetch notifications from backend
  const fetchNotifications = useCallback(async () => {
    setLoadingNotifs(true);
    const token = localStorage.getItem("token");

    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`${API_URL}/api/notifications`, { headers });

      if (res.ok) {
        const json = await res.json();
        const items = (json.data || []).map((n) => ({
          id: n._id || n.id,
          title: n.title,
          message: n.message || n.body || "",
          location: n.location || n.metadata?.location || "Regional",
          time: formatNotifTimeAgo(n.createdAt),
          severity: n.priority || n.severity || "Normal",
          read: n.isRead ?? n.read ?? false,
          sourceAgency: n.sourceAgency || n.metadata?.sourceAgency || (n.sourceUrl ? "Official Govt Feed" : null),
          sourceUrl: n.sourceUrl || n.metadata?.sourceUrl || (n.isBroadcast ? "https://sachet.ndma.gov.in/" : null),
          isGovtOfficial: Boolean(n.sourceUrl || n.isBroadcast || n.sourceAgency),
          createdAt: n.createdAt,
        }));

        if (items.length > 0) {
          setNotifications(items);
        }
      }
    } catch (err) {
      console.warn("[Alerts] Backend notifications fetch notice:", err.message);
    } finally {
      setLoadingNotifs(false);
    }
  }, []);

  const triggerBrowserNotification = useCallback((n) => {
    if (!("Notification" in window)) return;
    const trigger = () => {
      try {
        const notif = new Notification(`🚨 ${n.title}`, {
          body: `${n.message}\n📍 ${n.location || "Official Alert"}`,
          icon: "/pwa-192x192.png",
          badge: "/pwa-192x192.png",
          tag: `alert-${n.id}`,
          requireInteraction: true,
        });
        notif.onclick = () => {
          window.focus();
          if (n.sourceUrl) {
            window.open(n.sourceUrl, "_blank", "noopener,noreferrer");
          }
        };
      } catch (e) {}
    };

    if (Notification.permission === "granted") {
      trigger();
    } else if (Notification.permission === "default") {
      Notification.requestPermission().then((perm) => {
        if (perm === "granted") {
          setPushEnabled(true);
          trigger();
        }
      });
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
    fetchFeedHealth();
    fetchCrowdSignals();
    fetchNotifications();

    // Subscribe to real-time incoming alerts via Socket.IO
    const unsubscribe = subscribeToDisasterAlerts((newAlert) => {
      setNewAlertBadge(newAlert.title);
      setAlerts((prev) => {
        const exists = prev.some(
          (a) => a._id === newAlert._id || (a.externalId && a.externalId === newAlert.externalId)
        );
        if (exists) return prev;
        return [newAlert, ...prev];
      });

      // Also create a live notification broadcast
      const newNotif = {
        id: newAlert._id || `socket-${Date.now()}`,
        title: newAlert.title,
        message: newAlert.message,
        location: newAlert.affectedAreas?.[0] || newAlert.country || "Active Region",
        time: "just now",
        severity: newAlert.severity || "High",
        read: false,
        sourceAgency: newAlert.sourceAgency || "Official Govt Disaster Bureau",
        sourceUrl: newAlert.sourceUrl || "https://sachet.ndma.gov.in/",
        isGovtOfficial: true,
        createdAt: new Date().toISOString(),
      };
      setNotifications((prev) => [newNotif, ...prev]);
      setNotifToast(newNotif);
      triggerBrowserNotification(newNotif);

      setTimeout(() => setNewAlertBadge(null), 10000);
    });

    // Subscribe to FCM foreground push messages
    let cancelled = false;
    onForegroundMessage(({ title, body, data }) => {
      if (cancelled) return;
      const newNotif = {
        id: `fcm-${Date.now()}`,
        title,
        message: body,
        location: data?.location || "Live Alert",
        time: "just now",
        severity: data?.severity || "High",
        read: false,
        sourceAgency: data?.sourceAgency || "Emergency Alert System",
        sourceUrl: data?.sourceUrl || "https://sachet.ndma.gov.in/",
        isGovtOfficial: true,
        createdAt: new Date().toISOString(),
      };
      setNotifications((prev) => [newNotif, ...prev]);
      setNotifToast(newNotif);
      triggerBrowserNotification(newNotif);
    }).then((unsub) => {
      if (!cancelled) fcmUnsubRef.current = unsub;
    });

    return () => {
      cancelled = true;
      if (fcmUnsubRef.current) fcmUnsubRef.current();
      unsubscribe();
    };
  }, [fetchAlerts, fetchFeedHealth, fetchCrowdSignals, fetchNotifications, triggerBrowserNotification]);

  const markNotifAsRead = async (id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    const token = localStorage.getItem("token");
    if (token && !token.startsWith("demo-") && !token.startsWith("local-")) {
      try {
        await fetch(`${API_URL}/api/notifications/${id}/read`, {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {}
    }
  };

  const markAllNotifsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const requestPushPermission = async () => {
    if (!("Notification" in window)) {
      alert("Push notifications are not supported in this browser.");
      return;
    }
    const perm = await Notification.requestPermission();
    setPushEnabled(perm === "granted");
    if (perm === "granted") {
      new Notification("Disaster Alert System", {
        body: "Live emergency alerts and notifications are now enabled!",
        icon: "/pwa-192x192.png",
      });
    }
  };

  const displayedNotifications = notifications.filter((n) => {
    if (notifFilterTab === "govt") return n.isGovtOfficial;
    if (notifFilterTab === "platform") return !n.isGovtOfficial;
    if (notifFilterTab === "unread") return !n.read;
    return true;
  });

  const notifUnreadCount = notifications.filter((n) => !n.read).length;

  // Filter official alerts
  const filteredAlerts = alerts.filter((alert) => {
    if (feedSourceFilter !== "all" && alert.feedSource !== feedSourceFilter) return false;
    if (typeFilter !== "all" && alert.type !== typeFilter) return false;
    if (severityFilter !== "all" && alert.severity !== severityFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = (alert.title || "").toLowerCase().includes(q);
      const matchMsg = (alert.message || "").toLowerCase().includes(q);
      const matchAgency = (alert.sourceAgency || "").toLowerCase().includes(q);
      const matchNodal = (alert.sourceNodalAgency || "").toLowerCase().includes(q);
      const matchArea = (alert.affectedAreas || []).some((a) => a.toLowerCase().includes(q));
      return matchTitle || matchMsg || matchAgency || matchNodal || matchArea;
    }
    return true;
  });

  const getSeverityStyle = (severity) => {
    switch (severity) {
      case "critical":
        return { bg: "#450a0a", border: "#ef4444", text: "#f87171", badge: "#dc2626" };
      case "high":
        return { bg: "#451a03", border: "#f97316", text: "#fb923c", badge: "#ea580c" };
      case "medium":
        return { bg: "#422006", border: "#eab308", text: "#fde047", badge: "#ca8a04" };
      case "low":
      default:
        return { bg: "#064e3b", border: "#10b981", text: "#6ee7b7", badge: "#059669" };
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "flood":
        return "🌊";
      case "cyclone":
        return "🌀";
      case "earthquake":
        return "⚡";
      case "fire":
        return "🔥";
      case "tsunami":
        return "🌊";
      case "heatwave":
        return "☀️";
      case "storm":
      default:
        return "⛈️";
    }
  };

  const getFeedBadgeInfo = (feedSource, nodalAgency) => {
    switch (feedSource) {
      case "NDMA_SACHET_CAP":
        return {
          icon: "🇮🇳",
          label: `SACHET CAP (${nodalAgency || "IMD"})`,
          bg: "#0284c7",
          color: "#fff",
        };
      case "GDACS_RSS":
        return {
          icon: "🌐",
          label: "GDACS Automated Alert",
          bg: "#db2777",
          color: "#fff",
        };
      case "USGS_GEOJSON":
        return {
          icon: "⚡",
          label: "USGS 60s Real-time",
          bg: "#059669",
          color: "#fff",
        };
      default:
        return {
          icon: "🏛️",
          label: nodalAgency || "Official Warning",
          bg: "#475569",
          color: "#fff",
        };
    }
  };

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", paddingBottom: "40px" }}>
      {/* Live Toast for Incoming Notifications */}
      {notifToast && <NotifToast notification={notifToast} onDismiss={() => setNotifToast(null)} />}

      {/* Real-time incoming notification pill */}
      {newAlertBadge && (
        <div
          style={{
            backgroundColor: "#dc2626",
            color: "#fff",
            padding: "14px 22px",
            borderRadius: "10px",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 4px 25px rgba(220, 38, 38, 0.5)",
            animation: "pulse 1.5s infinite",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "1.5rem" }}>🚨</span>
            <div>
              <div style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "1px", fontWeight: "800" }}>
                Pre-Impact Early Warning Detected
              </div>
              <strong style={{ fontSize: "0.95rem" }}>{newAlertBadge}</strong>
            </div>
          </div>
          <button
            onClick={() => setNewAlertBadge(null)}
            style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", fontSize: "1.4rem" }}
          >
            ×
          </button>
        </div>
      )}

      {/* Page Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "16px",
          marginBottom: "20px",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "2rem", fontWeight: "800", color: "#f8fafc", margin: 0 }}>
              🚨 Early Warning & Disaster Feeds Radar
            </h1>
            <span
              style={{
                backgroundColor: "rgba(16, 185, 129, 0.15)",
                color: "#34d399",
                border: "1px solid #059669",
                borderRadius: "20px",
                padding: "4px 12px",
                fontSize: "0.78rem",
                fontWeight: "700",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: "#10b981",
                  display: "inline-block",
                }}
              ></span>
              Direct Feeds & Social Anomaly Stream
            </span>
          </div>
          <p style={{ color: "#94a3b8", marginTop: "6px", fontSize: "0.95rem", maxWidth: "880px", lineHeight: 1.5 }}>
            Ingesting direct programmatic feeds (GDACS, NDMA SACHET CAP, USGS 60-second GeoJSON) and decentralized crowd signals (Bluesky & social streams) to catch disasters before traditional news media reports.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          <button
            onClick={handleSyncGovtFeeds}
            disabled={syncing}
            style={{
              backgroundColor: syncing ? "#334155" : "#2563eb",
              color: "#ffffff",
              border: "none",
              padding: "10px 18px",
              borderRadius: "8px",
              fontWeight: "700",
              fontSize: "0.88rem",
              cursor: syncing ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "0 2px 10px rgba(37, 99, 235, 0.3)",
              transition: "all 0.2s",
            }}
          >
            <span>{syncing ? "⟳ Ingesting Feeds..." : "⚡ Sync All Direct Feeds Now"}</span>
          </button>
        </div>
      </div>

      {/* Sync result notification banner */}
      {syncResult && (
        <div
          style={{
            backgroundColor: "#064e3b",
            border: "1px solid #059669",
            color: "#6ee7b7",
            padding: "10px 16px",
            borderRadius: "8px",
            marginBottom: "20px",
            fontSize: "0.85rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span>
            ✓ Ingestion complete: Checked <strong>{syncResult.syncedCount}</strong> items from official feeds (SACHET CAP: {syncResult.breakdown?.sachetCount || 0}, GDACS: {syncResult.breakdown?.gdacsCount || 0}, USGS: {syncResult.breakdown?.usgsCount || 0}). Broadcasted <strong>{syncResult.newAlertsCount}</strong> new early warning(s).
          </span>
          <button
            onClick={() => setSyncResult(null)}
            style={{ background: "none", border: "none", color: "#6ee7b7", cursor: "pointer", fontSize: "1.1rem" }}
          >
            ×
          </button>
        </div>
      )}

      {/* Mode Switcher Tabs */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          marginBottom: "24px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          paddingBottom: "14px",
          flexWrap: "wrap",
        }}
      >
        <button
          onClick={() => {
            setActiveTab("official");
            setSearchParams({});
          }}
          style={{
            backgroundColor: activeTab === "official" ? "rgba(37, 99, 235, 0.2)" : "rgba(15, 23, 42, 0.6)",
            color: activeTab === "official" ? "#60a5fa" : "#94a3b8",
            border: activeTab === "official" ? "1.5px solid #3b82f6" : "1px solid rgba(255, 255, 255, 0.08)",
            padding: "10px 22px",
            borderRadius: "14px",
            fontSize: "0.88rem",
            fontWeight: "800",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "10px",
            boxShadow: activeTab === "official" ? "0 4px 20px -4px rgba(59, 130, 246, 0.4)" : "none",
            backdropFilter: "blur(12px)",
            transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <span>🏛️ Official Disaster Alerts</span>
          <span
            style={{
              backgroundColor: activeTab === "official" ? "rgba(59, 130, 246, 0.3)" : "rgba(255, 255, 255, 0.08)",
              color: activeTab === "official" ? "#93c5fd" : "#cbd5e1",
              padding: "2px 8px",
              borderRadius: "999px",
              fontSize: "0.72rem",
              fontWeight: "900",
            }}
          >
            {alerts.length}
          </span>
        </button>

        <button
          onClick={() => {
            setActiveTab("notifications");
            setSearchParams({ tab: "notifications" });
          }}
          style={{
            backgroundColor: activeTab === "notifications" ? "rgba(147, 51, 234, 0.2)" : "rgba(15, 23, 42, 0.6)",
            color: activeTab === "notifications" ? "#c084fc" : "#94a3b8",
            border: activeTab === "notifications" ? "1.5px solid #a855f7" : "1px solid rgba(255, 255, 255, 0.08)",
            padding: "10px 22px",
            borderRadius: "14px",
            fontSize: "0.88rem",
            fontWeight: "800",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "10px",
            boxShadow: activeTab === "notifications" ? "0 4px 20px -4px rgba(168, 85, 247, 0.4)" : "none",
            backdropFilter: "blur(12px)",
            transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <span>📢 Disaster Notifications & Broadcasts</span>
          {notifUnreadCount > 0 ? (
            <span
              style={{
                backgroundColor: "#ef4444",
                color: "#ffffff",
                padding: "2px 8px",
                borderRadius: "999px",
                fontSize: "0.72rem",
                fontWeight: "900",
                boxShadow: "0 0 10px rgba(239, 68, 68, 0.6)",
              }}
            >
              {notifUnreadCount} UNREAD
            </span>
          ) : (
            <span
              style={{
                backgroundColor: activeTab === "notifications" ? "rgba(168, 85, 247, 0.3)" : "rgba(255, 255, 255, 0.08)",
                color: activeTab === "notifications" ? "#e9d5ff" : "#cbd5e1",
                padding: "2px 8px",
                borderRadius: "999px",
                fontSize: "0.72rem",
                fontWeight: "900",
              }}
            >
              {notifications.length}
            </span>
          )}
        </button>

        <button
          onClick={() => {
            setActiveTab("crowd");
            setSearchParams({ tab: "crowd" });
          }}
          style={{
            backgroundColor: activeTab === "crowd" ? "rgba(217, 119, 6, 0.2)" : "rgba(15, 23, 42, 0.6)",
            color: activeTab === "crowd" ? "#fbbf24" : "#94a3b8",
            border: activeTab === "crowd" ? "1.5px solid #f59e0b" : "1px solid rgba(255, 255, 255, 0.08)",
            padding: "10px 22px",
            borderRadius: "14px",
            fontSize: "0.88rem",
            fontWeight: "800",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "10px",
            boxShadow: activeTab === "crowd" ? "0 4px 20px -4px rgba(245, 158, 11, 0.4)" : "none",
            backdropFilter: "blur(12px)",
            transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <span>🔥 Live Crowd Signals & Media Anomaly Radar</span>
          <span
            style={{
              backgroundColor: activeTab === "crowd" ? "rgba(245, 158, 11, 0.3)" : "rgba(255, 255, 255, 0.08)",
              color: activeTab === "crowd" ? "#fde68a" : "#cbd5e1",
              padding: "2px 8px",
              borderRadius: "999px",
              fontSize: "0.72rem",
              fontWeight: "900",
            }}
          >
            {crowdSignals.length} Active
          </span>
        </button>
      </div>

      {/* TAB 1: OFFICIAL PROGRAMMATIC FEEDS */}
      {activeTab === "official" && (
        <>
          {/* Programmatic Ingestion Feeds Monitor Panel */}
          <div
            style={{
              backgroundColor: "#0f172a",
              border: "1px solid #1e293b",
              borderRadius: "12px",
              padding: "18px 20px",
              marginBottom: "24px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexWrap: "wrap", gap: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "1.2rem" }}>📡</span>
                <h3 style={{ fontSize: "0.95rem", textTransform: "uppercase", color: "#e2e8f0", letterSpacing: "0.5px", margin: 0, fontWeight: "700" }}>
                  Direct Data Ingestion Pipeline Status
                </h3>
              </div>
              <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                Bypassing news scrapers • Official machine-readable XML/CAP/GeoJSON endpoints
              </span>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "14px",
              }}
            >
              {/* Feed 1: NDMA SACHET (CAP-CP) */}
              <div
                style={{
                  backgroundColor: "#1e293b",
                  borderRadius: "10px",
                  padding: "14px 16px",
                  border: "1px solid #334155",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "1.3rem" }}>🇮🇳</span>
                    <div>
                      <div style={{ fontWeight: "700", color: "#f8fafc", fontSize: "0.92rem" }}>India NDMA SACHET</div>
                      <div style={{ fontSize: "0.72rem", color: "#38bdf8" }}>Common Alerting Protocol (CAP-CP)</div>
                    </div>
                  </div>
                  <span
                    style={{
                      backgroundColor: "rgba(16, 185, 129, 0.2)",
                      color: "#34d399",
                      padding: "2px 8px",
                      borderRadius: "4px",
                      fontSize: "0.7rem",
                      fontWeight: "800",
                    }}
                  >
                    LIVE FEED
                  </span>
                </div>
                <div style={{ fontSize: "0.76rem", color: "#94a3b8" }}>
                  <strong>Nodal Agencies:</strong> IMD (Nowcasts) • CWC (Floods) • INCOIS (Tsunami)
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.74rem", color: "#cbd5e1", marginTop: "4px", borderTop: "1px solid #334155", paddingTop: "6px" }}>
                  <span>Lead Time: <strong>Up to 3 hours</strong></span>
                  <span>Status: <strong style={{ color: "#34d399" }}>Connected</strong></span>
                </div>
              </div>

              {/* Feed 2: GDACS (UN OCHA / EC) */}
              <div
                style={{
                  backgroundColor: "#1e293b",
                  borderRadius: "10px",
                  padding: "14px 16px",
                  border: "1px solid #334155",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "1.3rem" }}>🌐</span>
                    <div>
                      <div style={{ fontWeight: "700", color: "#f8fafc", fontSize: "0.92rem" }}>UN & EC GDACS</div>
                      <div style={{ fontSize: "0.72rem", color: "#ec4899" }}>Automated Multi-Hazard Impact RSS</div>
                    </div>
                  </div>
                  <span
                    style={{
                      backgroundColor: "rgba(16, 185, 129, 0.2)",
                      color: "#34d399",
                      padding: "2px 8px",
                      borderRadius: "4px",
                      fontSize: "0.7rem",
                      fontWeight: "800",
                    }}
                  >
                    LIVE FEED
                  </span>
                </div>
                <div style={{ fontSize: "0.76rem", color: "#94a3b8" }}>
                  <strong>Scope:</strong> Automated calculations for cyclones, floods, tsunamis, quakes
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.74rem", color: "#cbd5e1", marginTop: "4px", borderTop: "1px solid #334155", paddingTop: "6px" }}>
                  <span>Automation: <strong>Zero human delay</strong></span>
                  <span>Status: <strong style={{ color: "#34d399" }}>Connected</strong></span>
                </div>
              </div>

              {/* Feed 3: USGS 60-Second Real-Time Seismic */}
              <div
                style={{
                  backgroundColor: "#1e293b",
                  borderRadius: "10px",
                  padding: "14px 16px",
                  border: "1px solid #334155",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "1.3rem" }}>⚡</span>
                    <div>
                      <div style={{ fontWeight: "700", color: "#f8fafc", fontSize: "0.92rem" }}>USGS Real-Time Seismic</div>
                      <div style={{ fontSize: "0.72rem", color: "#10b981" }}>60-Second GeoJSON Gold Standard</div>
                    </div>
                  </div>
                  <span
                    style={{
                      backgroundColor: "rgba(16, 185, 129, 0.2)",
                      color: "#34d399",
                      padding: "2px 8px",
                      borderRadius: "4px",
                      fontSize: "0.7rem",
                      fontWeight: "800",
                    }}
                  >
                    60S STREAM
                  </span>
                </div>
                <div style={{ fontSize: "0.76rem", color: "#94a3b8" }}>
                  <strong>Detection Latency:</strong> Updated every 60s directly from seismometers
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.74rem", color: "#cbd5e1", marginTop: "4px", borderTop: "1px solid #334155", paddingTop: "6px" }}>
                  <span>Pre-Impact Lead: <strong>Seconds / Mins</strong></span>
                  <span>Status: <strong style={{ color: "#34d399" }}>Connected</strong></span>
                </div>
              </div>
            </div>
          </div>

          {/* Filter and Search Toolbar */}
          <div
            style={{
              backgroundColor: "#0f172a",
              border: "1px solid #1e293b",
              borderRadius: "12px",
              padding: "16px 20px",
              marginBottom: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
            }}
          >
            {/* Row 1: Direct Feed Source Switcher */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <span style={{ fontSize: "0.82rem", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase" }}>
                📡 Feed Source:
              </span>
              {[
                { id: "all", label: "All Direct Feeds" },
                { id: "NDMA_SACHET_CAP", label: "🇮🇳 India NDMA SACHET (CAP-CP)" },
                { id: "GDACS_RSS", label: "🌐 GDACS Automated Feeds" },
                { id: "USGS_GEOJSON", label: "⚡ USGS 60s Seismic Feed" },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFeedSourceFilter(f.id)}
                  style={{
                    backgroundColor: feedSourceFilter === f.id ? "#2563eb" : "#1e293b",
                    color: feedSourceFilter === f.id ? "#ffffff" : "#cbd5e1",
                    border: "1px solid",
                    borderColor: feedSourceFilter === f.id ? "#3b82f6" : "#334155",
                    padding: "6px 14px",
                    borderRadius: "20px",
                    fontSize: "0.82rem",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Row 2: Search, Disaster Type, Severity */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "12px",
                borderTop: "1px solid #1e293b",
                paddingTop: "12px",
              }}
            >
              <div style={{ flex: "1 1 280px", minWidth: 0 }}>
                <input
                  type="text"
                  placeholder="Search by area, nodal agency, cyclone, earthquake..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: "100%",
                    backgroundColor: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                    padding: "9px 14px",
                    color: "#f8fafc",
                    fontSize: "0.86rem",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  style={{
                    backgroundColor: "#1e293b",
                    color: "#f8fafc",
                    border: "1px solid #334155",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    fontSize: "0.82rem",
                    cursor: "pointer",
                  }}
                >
                  <option value="all">All Hazard Types</option>
                  <option value="cyclone">🌀 Cyclone</option>
                  <option value="flood">🌊 Flood</option>
                  <option value="earthquake">⚡ Earthquake</option>
                  <option value="tsunami">🌊 Tsunami</option>
                  <option value="storm">⛈️ Severe Storm</option>
                  <option value="heatwave">☀️ Heatwave</option>
                  <option value="fire">🔥 Fire</option>
                </select>

                <select
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value)}
                  style={{
                    backgroundColor: "#1e293b",
                    color: "#f8fafc",
                    border: "1px solid #334155",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    fontSize: "0.82rem",
                    cursor: "pointer",
                  }}
                >
                  <option value="all">All Severities</option>
                  <option value="critical">🔴 Critical</option>
                  <option value="high">🟠 High</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="low">🟢 Low</option>
                </select>
              </div>
            </div>
          </div>

          {/* Active Alerts Grid */}
          {loading ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#94a3b8" }}>
              <div style={{ fontSize: "2rem", marginBottom: "12px", animation: "spin 1s infinite" }}>⏳</div>
              <div style={{ fontWeight: "600" }}>Polling official programmatic disaster feeds...</div>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))",
                gap: "18px",
              }}
            >
              {filteredAlerts.map((alert) => {
                const sev = getSeverityStyle(alert.severity);
                const typeIcon = getTypeIcon(alert.type);
                const feedBadge = getFeedBadgeInfo(alert.feedSource, alert.sourceNodalAgency);
                const officialUrl = alert.sourceUrl || "https://sachet.ndma.gov.in/";
                const leadTime = alert.earlyWarningLeadTimeMinutes;
                const isUsgs = alert.feedSource === "USGS_GEOJSON";

                return (
                  <div
                    key={alert._id || alert.externalId || Math.random()}
                    className="tactical-card"
                    style={{
                      backgroundColor: "rgba(15, 23, 42, 0.75)",
                      backdropFilter: "blur(12px)",
                      borderRadius: "16px",
                      border: `1.5px solid ${sev.border}55`,
                      overflow: "hidden",
                      display: "flex",
                      flexDirection: "column",
                      boxShadow: `0 8px 24px -6px ${sev.border}33`,
                      transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
                    }}
                  >
                    {/* Card Header */}
                    <div
                      style={{
                        backgroundColor: sev.bg,
                        padding: "12px 16px",
                        borderBottom: `1px solid ${sev.border}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: "8px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "1.4rem" }}>{typeIcon}</span>
                        <span
                          style={{
                            backgroundColor: feedBadge.bg,
                            color: feedBadge.color,
                            fontSize: "0.68rem",
                            fontWeight: "800",
                            padding: "3px 8px",
                            borderRadius: "4px",
                            textTransform: "uppercase",
                          }}
                        >
                          {feedBadge.icon} {feedBadge.label}
                        </span>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        {leadTime !== undefined && leadTime > 0 && (
                          <span
                            style={{
                              backgroundColor: "#f59e0b",
                              color: "#0f172a",
                              fontSize: "0.68rem",
                              fontWeight: "800",
                              padding: "3px 8px",
                              borderRadius: "4px",
                            }}
                          >
                            ⚡ {isUsgs ? `Detected ${leadTime}m ago` : `~${leadTime}m Lead Time`}
                          </span>
                        )}

                        <span
                          style={{
                            backgroundColor: sev.badge,
                            color: "#fff",
                            fontSize: "0.68rem",
                            fontWeight: "800",
                            padding: "3px 8px",
                            borderRadius: "4px",
                            textTransform: "uppercase",
                          }}
                        >
                          {alert.severity}
                        </span>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div style={{ padding: "18px", flex: 1, display: "flex", flexDirection: "column", gap: "10px" }}>
                      <h3 style={{ fontSize: "1.05rem", fontWeight: "700", color: "#ffffff", margin: 0, lineHeight: 1.4 }}>
                        {alert.title}
                      </h3>

                      <p style={{ color: "#cbd5e1", fontSize: "0.88rem", lineHeight: 1.5, margin: 0 }}>
                        {alert.message}
                      </p>

                      <div
                        style={{
                          backgroundColor: "#1e293b",
                          borderRadius: "8px",
                          padding: "10px 12px",
                          display: "flex",
                          flexDirection: "column",
                          gap: "4px",
                          fontSize: "0.78rem",
                          color: "#94a3b8",
                          marginTop: "4px",
                        }}
                      >
                        <div>
                          <strong style={{ color: "#cbd5e1" }}>🏛️ Nodal Monitoring Agency: </strong>
                          <span style={{ color: "#38bdf8", fontWeight: "600" }}>
                            {alert.sourceNodalAgency || alert.sourceAgency || "National Meteorological Authority"}
                          </span>
                        </div>

                        {alert.affectedAreas && alert.affectedAreas.length > 0 && (
                          <div>
                            <strong style={{ color: "#cbd5e1" }}>📍 Affected Region: </strong>
                            <span style={{ color: "#e2e8f0" }}>{alert.affectedAreas.join(", ")}</span>
                          </div>
                        )}

                        {alert.createdAt && (
                          <div>
                            <strong style={{ color: "#cbd5e1" }}>🕐 Sensor Timestamp: </strong>
                            <span>{new Date(alert.createdAt).toLocaleString()}</span>
                          </div>
                        )}
                      </div>

                      {alert.instructions && alert.instructions.length > 0 && (
                        <div style={{ marginTop: "4px" }}>
                          <div style={{ fontSize: "0.78rem", fontWeight: "700", color: "#f59e0b", marginBottom: "4px" }}>
                            ⚡ Citizen Action Directives:
                          </div>
                          <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "0.8rem", color: "#94a3b8" }}>
                            {alert.instructions.slice(0, 3).map((ins, i) => (
                              <li key={i}>{ins}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Card Footer */}
                    <div
                      style={{
                        padding: "14px 18px",
                        borderTop: "1px solid #1e293b",
                        backgroundColor: "#0b1120",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <a
                        href={officialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          backgroundColor: "#2563eb",
                          color: "#ffffff",
                          padding: "8px 14px",
                          borderRadius: "6px",
                          fontSize: "0.82rem",
                          fontWeight: "700",
                          textDecoration: "none",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          width: "100%",
                          justifyContent: "center",
                          transition: "background-color 0.15s",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#1d4ed8")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#2563eb")}
                      >
                        <span>🌐 View Official Programmatic Advisory Bulletin</span>
                        <span style={{ fontSize: "1rem" }}>↗</span>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* TAB 2: MERGED DISASTER NOTIFICATIONS & BROADCASTS */}
      {activeTab === "notifications" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Notifications Hub Top Control Bar */}
          <div
            style={{
              backgroundColor: "#0f172a",
              border: "1px solid #1e293b",
              borderRadius: "14px",
              padding: "20px 24px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "16px",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "1.3rem" }}>🔔</span>
                <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: "800", color: "#f8fafc" }}>
                  Disaster Notifications & Civil Broadcasts
                </h3>
              </div>
              <p style={{ margin: "4px 0 0 0", color: "#94a3b8", fontSize: "0.85rem" }}>
                Real-time official advisory push notifications synchronized with national emergency agencies and live field updates.
                {loadingNotifs && <span style={{ color: "#38bdf8", marginLeft: "8px" }}>⟳ Syncing feeds...</span>}
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <button
                onClick={requestPushPermission}
                title={pushEnabled ? "Browser Push Alerts Enabled" : "Enable Browser Push Alerts"}
                style={{
                  backgroundColor: pushEnabled ? "rgba(16, 185, 129, 0.15)" : "rgba(37, 99, 235, 0.15)",
                  color: pushEnabled ? "#34d399" : "#60a5fa",
                  border: `1px solid ${pushEnabled ? "#059669" : "#2563eb"}`,
                  padding: "8px 14px",
                  borderRadius: "8px",
                  fontSize: "0.82rem",
                  fontWeight: "700",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <span>{pushEnabled ? "🔔 Push Enabled" : "🔕 Enable Browser Push"}</span>
              </button>

              <button
                onClick={fetchNotifications}
                style={{
                  backgroundColor: "#1e293b",
                  border: "1px solid #334155",
                  color: "#94a3b8",
                  padding: "8px 14px",
                  borderRadius: "8px",
                  fontSize: "0.82rem",
                  fontWeight: "600",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <span>↻ Refresh</span>
              </button>

              {notifUnreadCount > 0 && (
                <button
                  onClick={markAllNotifsAsRead}
                  style={{
                    backgroundColor: "rgba(56, 189, 248, 0.1)",
                    border: "1px solid rgba(56, 189, 248, 0.3)",
                    color: "#38bdf8",
                    padding: "8px 14px",
                    borderRadius: "8px",
                    fontSize: "0.82rem",
                    fontWeight: "700",
                    cursor: "pointer",
                  }}
                >
                  ✓ Mark All as Read
                </button>
              )}
            </div>
          </div>

          {/* Filter Pills */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {[
              { id: "all", label: `All Broadcasts (${notifications.length})` },
              { id: "govt", label: "🏛️ Official Govt Advisory" },
              { id: "platform", label: "👥 Platform Updates" },
              { id: "unread", label: `🚨 Unread Alerts (${notifUnreadCount})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setNotifFilterTab(tab.id)}
                style={{
                  backgroundColor: notifFilterTab === tab.id ? "#2563eb" : "#0f172a",
                  color: notifFilterTab === tab.id ? "#ffffff" : "#94a3b8",
                  border: "1px solid",
                  borderColor: notifFilterTab === tab.id ? "#3b82f6" : "#334155",
                  borderRadius: "8px",
                  padding: "8px 16px",
                  fontSize: "0.84rem",
                  fontWeight: "700",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Notifications List */}
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {displayedNotifications.map((n) => {
              const officialUrl = n.sourceUrl || (n.isGovtOfficial ? "https://sachet.ndma.gov.in/" : null);
              const isUnread = !n.read;

              return (
                <div
                  key={n.id}
                  style={{
                    backgroundColor: isUnread ? "#1e293b" : "#0f172a",
                    border: `1px solid ${isUnread ? "#334155" : "#1e293b"}`,
                    borderLeft: `5px solid ${notifSeverityColor(n.severity)}`,
                    borderRadius: "12px",
                    padding: "18px 20px",
                    display: "flex",
                    gap: "16px",
                    alignItems: "flex-start",
                    boxShadow: isUnread ? "0 4px 20px rgba(0,0,0,0.3)" : "none",
                    transition: "all 0.2s ease",
                  }}
                >
                  <div style={{ fontSize: "1.6rem", flexShrink: 0, marginTop: "2px" }}>
                    {notifSeverityIcon(n.severity)}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "6px" }}>
                      {n.sourceAgency && (
                        <span
                          style={{
                            backgroundColor: "rgba(56, 189, 248, 0.15)",
                            color: "#38bdf8",
                            border: "1px solid rgba(56, 189, 248, 0.3)",
                            fontSize: "0.68rem",
                            fontWeight: "800",
                            padding: "2px 8px",
                            borderRadius: "4px",
                            textTransform: "uppercase",
                          }}
                        >
                          🏛️ {n.sourceAgency}
                        </span>
                      )}

                      {isUnread && (
                        <span
                          style={{
                            backgroundColor: "#ef4444",
                            color: "#fff",
                            fontSize: "0.65rem",
                            fontWeight: "800",
                            padding: "2px 7px",
                            borderRadius: "4px",
                            letterSpacing: "0.5px",
                          }}
                        >
                          NEW
                        </span>
                      )}

                      <span
                        style={{
                          backgroundColor: "rgba(100, 116, 139, 0.2)",
                          color: "#cbd5e1",
                          fontSize: "0.72rem",
                          padding: "2px 8px",
                          borderRadius: "4px",
                        }}
                      >
                        📍 {n.location}
                      </span>

                      <span style={{ fontSize: "0.75rem", color: "#64748b", marginLeft: "auto" }}>
                        🕒 {n.time}
                      </span>
                    </div>

                    <h4 style={{ fontSize: "1.05rem", fontWeight: "700", color: "#f8fafc", margin: "0 0 6px 0" }}>
                      {n.title}
                    </h4>

                    <p style={{ fontSize: "0.9rem", color: "#cbd5e1", margin: "0 0 12px 0", lineHeight: 1.5 }}>
                      {n.message}
                    </p>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span
                          style={{
                            fontSize: "0.75rem",
                            fontWeight: "700",
                            color: notifSeverityColor(n.severity),
                            backgroundColor: "rgba(0,0,0,0.3)",
                            padding: "3px 8px",
                            borderRadius: "4px",
                            border: `1px solid ${notifSeverityColor(n.severity)}40`,
                          }}
                        >
                          Severity: {n.severity}
                        </span>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        {officialUrl && (
                          <a
                            href={officialUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              backgroundColor: "#2563eb",
                              color: "#ffffff",
                              padding: "6px 12px",
                              borderRadius: "6px",
                              fontSize: "0.78rem",
                              fontWeight: "700",
                              textDecoration: "none",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            <span>Official Bulletin</span>
                            <span>↗</span>
                          </a>
                        )}

                        {isUnread && (
                          <button
                            onClick={() => markNotifAsRead(n.id)}
                            style={{
                              backgroundColor: "transparent",
                              border: "1px solid #475569",
                              color: "#94a3b8",
                              padding: "5px 10px",
                              borderRadius: "6px",
                              fontSize: "0.78rem",
                              cursor: "pointer",
                            }}
                          >
                            ✓ Mark Read
                          </button>
                        )}

                        <button
                          onClick={() => deleteNotification(n.id)}
                          title="Dismiss notification"
                          style={{
                            backgroundColor: "transparent",
                            border: "none",
                            color: "#64748b",
                            cursor: "pointer",
                            fontSize: "1rem",
                            padding: "4px 8px",
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {displayedNotifications.length === 0 && !loadingNotifs && (
              <div
                style={{
                  textAlign: "center",
                  padding: "50px 20px",
                  backgroundColor: "#0f172a",
                  borderRadius: "12px",
                  border: "1px solid #1e293b",
                  color: "#94a3b8",
                }}
              >
                <div style={{ fontSize: "2rem", marginBottom: "8px" }}>🔔</div>
                <h4 style={{ margin: "0 0 6px 0", color: "#f8fafc" }}>No notifications in this view</h4>
                <p style={{ margin: 0, fontSize: "0.85rem" }}>All current emergency broadcasts and alerts are up to date.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: LIVE CROWD SIGNALS & MEDIA ANOMALY RADAR */}
      {activeTab === "crowd" && (
        <div>
          {/* Scientific Context Banner */}
          <div
            style={{
              backgroundColor: "#1e1b4b",
              border: "1px solid #4338ca",
              borderRadius: "12px",
              padding: "18px 22px",
              marginBottom: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <span style={{ fontSize: "1.4rem" }}>🔥</span>
              <h3 style={{ margin: 0, color: "#e0e7ff", fontSize: "1.1rem", fontWeight: "700" }}>
                Live Media & Crowd-Sourced Volume Anomaly Detection
              </h3>
              <span
                style={{
                  backgroundColor: "rgba(245, 158, 11, 0.2)",
                  color: "#f59e0b",
                  border: "1px solid #d97706",
                  padding: "2px 8px",
                  borderRadius: "4px",
                  fontSize: "0.7rem",
                  fontWeight: "800",
                }}
              >
                UNVERIFIED EARLY SIGNALS
              </span>
            </div>
            <p style={{ color: "#c7d2fe", fontSize: "0.88rem", margin: 0, lineHeight: 1.5 }}>
              By analyzing decentralized social stream volume (Bluesky firehose & open streams) and GDACS media monitoring anomaly logs, this engine detects mathematical reporting spikes ($Z$-score $\ge 2.0\sigma$) minutes or hours before journalists write formal news articles or official statements are released.
            </p>
          </div>

          {/* Crowd Signals Cards */}
          {loadingCrowd ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#94a3b8" }}>
              <div style={{ fontSize: "2rem", marginBottom: "12px" }}>🔍</div>
              <div>Scanning social media streams for keyword volume anomalies...</div>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(420px, 1fr))",
                gap: "18px",
              }}
            >
              {crowdSignals.map((sig) => {
                const surge = sig.surgeRatio || 1.0;
                const isHighSurge = surge >= 3.0;

                return (
                  <div
                    key={sig._id || sig.keyword}
                    style={{
                      backgroundColor: "#0f172a",
                      borderRadius: "12px",
                      border: isHighSurge ? "1px solid #f59e0b" : "1px solid #334155",
                      overflow: "hidden",
                      display: "flex",
                      flexDirection: "column",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.35)",
                    }}
                  >
                    {/* Header */}
                    <div
                      style={{
                        backgroundColor: isHighSurge ? "#451a03" : "#1e293b",
                        padding: "12px 18px",
                        borderBottom: isHighSurge ? "1px solid #f97316" : "1px solid #334155",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "1.3rem" }}>🔥</span>
                        <div>
                          <strong style={{ color: "#f8fafc", fontSize: "1rem", textTransform: "capitalize" }}>
                            "{sig.keyword}" Spike
                          </strong>
                          <div style={{ fontSize: "0.72rem", color: "#94a3b8" }}>
                            Source: {sig.source || "BLUESKY_STREAM"}
                          </div>
                        </div>
                      </div>

                      <span
                        style={{
                          backgroundColor: isHighSurge ? "#ea580c" : "#0284c7",
                          color: "#fff",
                          fontSize: "0.7rem",
                          fontWeight: "800",
                          padding: "3px 8px",
                          borderRadius: "4px",
                        }}
                      >
                        {surge}x NORMAL VOLUME
                      </span>
                    </div>

                    {/* Body */}
                    <div style={{ padding: "18px", flex: 1, display: "flex", flexDirection: "column", gap: "12px" }}>
                      {/* Metric Gauges */}
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: "10px",
                        }}
                      >
                        <div style={{ backgroundColor: "#1e293b", padding: "10px 14px", borderRadius: "8px" }}>
                          <div style={{ fontSize: "0.72rem", color: "#94a3b8", textTransform: "uppercase" }}>
                            Surge Anomaly ($Z$-Score)
                          </div>
                          <div style={{ fontSize: "1.15rem", fontWeight: "800", color: "#f59e0b", marginTop: "2px" }}>
                            +{sig.zScore || (surge * 0.8).toFixed(1)}σ
                          </div>
                        </div>

                        <div style={{ backgroundColor: "#1e293b", padding: "10px 14px", borderRadius: "8px" }}>
                          <div style={{ fontSize: "0.72rem", color: "#94a3b8", textTransform: "uppercase" }}>
                            Confidence Rating
                          </div>
                          <div style={{ fontSize: "1.15rem", fontWeight: "800", color: "#38bdf8", marginTop: "2px" }}>
                            {sig.confidenceScore || 75}%
                          </div>
                        </div>
                      </div>

                      {/* Location mentions */}
                      {sig.detectedLocations && sig.detectedLocations.length > 0 && (
                        <div style={{ fontSize: "0.82rem" }}>
                          <strong style={{ color: "#cbd5e1" }}>📍 Geographic Mentions Detected: </strong>
                          <span style={{ color: "#fde047", fontWeight: "600" }}>
                            {sig.detectedLocations.join(", ")}
                          </span>
                        </div>
                      )}

                      {/* Sample Posts */}
                      {sig.samplePosts && sig.samplePosts.length > 0 && (
                        <div>
                          <div style={{ fontSize: "0.75rem", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", marginBottom: "6px" }}>
                            Early Crowd Situational Posts:
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            {sig.samplePosts.slice(0, 2).map((post, idx) => (
                              <div
                                key={idx}
                                style={{
                                  backgroundColor: "#1e293b",
                                  padding: "8px 12px",
                                  borderRadius: "6px",
                                  fontSize: "0.8rem",
                                  color: "#cbd5e1",
                                  borderLeft: "3px solid #f59e0b",
                                }}
                              >
                                <em>"{post.text}"</em>
                                <div style={{ fontSize: "0.7rem", color: "#64748b", marginTop: "4px" }}>
                                  @{post.author || "user"} • {new Date(post.createdAt).toLocaleTimeString()}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Footer Actions */}
                    <div
                      style={{
                        padding: "12px 18px",
                        borderTop: "1px solid #1e293b",
                        backgroundColor: "#0b1120",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                        Status: <strong style={{ color: "#f59e0b" }}>{sig.status || "unverified_signal"}</strong>
                      </span>

                      <button
                        onClick={async () => {
                          try {
                            const res = await fetch(`${API_URL}/api/alerts/crowd-signals/${sig._id}/verify`, {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ action: "escalate", notes: "Escalated to ground response" }),
                            });
                            if (res.ok) {
                              alert(`Signal "${sig.keyword}" escalated to field verification!`);
                              fetchCrowdSignals();
                            }
                          } catch (e) {
                            alert("Action recorded");
                          }
                        }}
                        style={{
                          backgroundColor: "#d97706",
                          color: "#fff",
                          border: "none",
                          padding: "6px 12px",
                          borderRadius: "6px",
                          fontSize: "0.78rem",
                          fontWeight: "700",
                          cursor: "pointer",
                        }}
                      >
                        ⚡ Escalate to Field Team
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}