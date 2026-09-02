import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { sendDataToBackend, flushOfflineSOSQueue } from "../utils/sosService";
import { getWhatsAppUrl } from "../utils/phoneUtils";

// ─── Emergency contact list ───────────────────────────────────────────────────
const CONTACTS = [
  { name: "Emergency Services", number: "112", icon: "🚨" },
  { name: "Ambulance",          number: "108", icon: "🚑" },
  { name: "Fire & Rescue",      number: "101", icon: "🚒" },
  { name: "Police",             number: "100", icon: "👮" },
];

// ─── Component ────────────────────────────────────────────────────────────────
function SOSCenter() {
  const navigate = useNavigate();

  const [phase, setPhase]             = useState("idle"); // idle | locating | sending | sent | error
  const [sosLocation, setSosLocation] = useState(null);
  const [errorMsg, setErrorMsg]       = useState("");
  const [rateLimited, setRateLimited] = useState(false);
  const [sosQueued, setSosQueued]     = useState(false); // true when saved offline rather than confirmed by server

  // ── Flush any queued offline SOS reports on mount ─────────────────────────
  useEffect(() => {
    const handleOnline = () => {
      flushOfflineSOSQueue().catch((err) =>
        console.warn("[SOSCenter] Flush offline SOS error:", err)
      );
    };
    window.addEventListener("online", handleOnline);

    // Also flush on first load if already online
    if (typeof navigator !== "undefined" && navigator.onLine) {
      flushOfflineSOSQueue().catch((err) =>
        console.warn("[SOSCenter] Flush offline SOS error:", err)
      );
    }

    return () => window.removeEventListener("online", handleOnline);
  }, []);

  // ── GPS helper ────────────────────────────────────────────────────────────
  const getCurrentPosition = () =>
    new Promise((resolve) => {
      if (typeof navigator === "undefined" || !navigator.geolocation) {
        return resolve({ lat: null, lng: null });
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (pos && pos.coords) {
            resolve({
              lat: pos.coords.latitude != null ? pos.coords.latitude.toFixed(5) : null,
              lng: pos.coords.longitude != null ? pos.coords.longitude.toFixed(5) : null,
            });
          } else {
            resolve({ lat: null, lng: null });
          }
        },
        (err) => {
          console.warn("[SOSCenter] Geolocation error:", err);
          resolve({ lat: null, lng: null });
        },
        { timeout: 8000, maximumAge: 30000 }
      );
    });

  // ── Browser notification helper ───────────────────────────────────────────
  const showBrowserNotification = (lat, lng) => {
    try {
      if (typeof window !== "undefined" && "Notification" in window) {
        if (Notification.permission === "granted") {
          if ("serviceWorker" in navigator && navigator.serviceWorker.ready) {
            navigator.serviceWorker.ready
              .then((reg) => {
                reg.showNotification("🚨 SOS ACTIVATED", {
                  body: lat
                    ? `GPS (${lat}, ${lng}) shared with emergency services.`
                    : "SOS dispatched — enable GPS for precise tracking.",
                  icon: "/pwa-192x192.png",
                  vibrate: [300, 100, 300, 100, 300],
                  requireInteraction: true,
                });
              })
              .catch((err) => console.warn("[SOSCenter] ServiceWorker notification error:", err));
          }
        } else if (Notification.permission !== "denied") {
          Notification.requestPermission().catch(() => {});
        }
      }
    } catch (err) {
      console.warn("[SOSCenter] Notification error:", err);
    }
  };

  // ── WhatsApp fallback alert ────────────────────────────────────────────────
  const sendWhatsAppAlert = (lat, lng) => {
    try {
      const rawText = lat
        ? `🚨 EMERGENCY SOS — I need immediate help!\nGPS: https://maps.google.com/?q=${lat},${lng}`
        : "🚨 EMERGENCY SOS — I need immediate help! Location unavailable.";

      const targetUrl = getWhatsAppUrl(rawText);
      window.open(targetUrl, "_blank");
    } catch (err) {
      console.warn("[SOSCenter] WhatsApp alert failed:", err);
    }
  };

  // ── Main SOS dispatch ─────────────────────────────────────────────────────
  const sendSOS = async () => {
    if (["locating", "sending"].includes(phase)) return; // prevent double-tap
    setPhase("locating");
    setErrorMsg("");
    setRateLimited(false);
    setSosQueued(false);

    // 1. Get GPS
    const { lat, lng } = await getCurrentPosition();
    const hasGPS = Boolean(lat && lng);
    setSosLocation(hasGPS ? { lat, lng } : null);

    // 2. Build payload — only include coordinates when GPS is available.
    //    BUG FIX: previously always sent latitude:0, longitude:0 when GPS
    //    was unavailable, recording a bogus "off coast of Africa" location.
    const payload = {
      emergencyType: "other",
      message: hasGPS
        ? `SOS from GPS (${lat}, ${lng})`
        : "SOS dispatched — GPS unavailable.",
      ...(hasGPS && {
        latitude:  Number(lat),
        longitude: Number(lng),
      }),
    };

    // 3. Send to backend via Firebase-authenticated sosService
    setPhase("sending");
    const result = await sendDataToBackend(payload);

    // 4. Handle result
    if (result.success) {
      showBrowserNotification(lat, lng);
      sendWhatsAppAlert(lat, lng);
      setSosQueued(false);
      setPhase("sent");
    } else if (result.offline) {
      // SOS queued locally (offline or DB unavailable) — still trigger
      // WhatsApp / notification so help can be sought via other channels
      showBrowserNotification(lat, lng);
      sendWhatsAppAlert(lat, lng);
      setSosQueued(true); // show "queued" banner instead of "dispatched"
      setPhase("sent");
    } else if (result.rateLimited) {
      setRateLimited(true);
      setPhase("error");
      setErrorMsg(result.error || "Too many SOS requests. Please wait.");
    } else if (!result.error?.includes("CERT-In")) {
      // Don't show error if we already redirected to CERT-In
      setPhase("error");
      setErrorMsg(result.error || "Failed to send SOS. Please call 112 directly.");
    }
  };


  // ─── Button label & disabled state ────────────────────────────────────────
  const buttonLabel =
    phase === "locating" ? "📡 Getting GPS..."
    : phase === "sending" ? "📤 Sending SOS..."
    : "SOS";

  const isDisabled = ["locating", "sending"].includes(phase);

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="sos-page">
      <div className="sos-header">
        <h1>🚨 Emergency SOS Center</h1>
        <p>Quick access to emergency assistance and safety actions.</p>
      </div>

      {/* ── SOS Card ──────────────────────────────────────────────────────── */}
      <div className="sos-main-card">
        <div className="sos-icon">🆘</div>
        <h2>Emergency SOS</h2>
        <p>Use this button only when you need immediate emergency assistance.</p>

        <button className="sos-button" onClick={sendSOS} disabled={isDisabled}>
          {buttonLabel}
        </button>

        {/* Success / queued state */}
        {phase === "sent" && (
          <div
            className="sos-message"
            style={{
              backgroundColor: sosQueued ? "#1c1917" : "#450a0a",
              border: `1px solid ${sosQueued ? "#f97316" : "#dc2626"}`,
              borderRadius: "8px",
              padding: "16px",
              marginTop: "16px",
              color: sosQueued ? "#fdba74" : "#fca5a5",
            }}
          >
            <strong>
              {sosQueued
                ? "📡 SOS QUEUED — WILL SYNC WHEN SERVICE RESTORES"
                : "🚨 SOS DISPATCHED SUCCESSFULLY"}
            </strong>
            <br />
            {sosLocation ? (
              <>
                GPS Location:{" "}
                <strong>
                  {sosLocation.lat}, {sosLocation.lng}
                </strong>
                <br />
              </>
            ) : (
              <>⚠️ GPS unavailable — SOS sent without coordinates.<br /></>
            )}
            {sosQueued
              ? "SOS saved locally. WhatsApp alert sent. Call 112 if urgent."
              : "Emergency teams notified. WhatsApp alert sent."}
            <div
              style={{
                marginTop: "12px",
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
              }}
            >
              <a
                href="tel:112"
                style={{
                  backgroundColor: "#dc2626",
                  color: "white",
                  padding: "8px 14px",
                  borderRadius: "6px",
                  textDecoration: "none",
                  fontWeight: "bold",
                }}
              >
                📞 Call 112
              </a>
              <button
                onClick={() => { setPhase("idle"); setSosQueued(false); }}
                style={{
                  backgroundColor: "#334155",
                  color: "white",
                  border: "none",
                  padding: "8px 14px",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                Reset
              </button>
            </div>
          </div>
        )}


        {/* Error / rate-limit state */}
        {phase === "error" && (
          <div
            style={{
              backgroundColor: "#1c1917",
              border: "1px solid #f97316",
              borderRadius: "8px",
              padding: "16px",
              marginTop: "16px",
              color: "#fdba74",
            }}
          >
            <strong>⚠️ {rateLimited ? "Rate Limited" : "Send Failed"}</strong>
            <br />
            {errorMsg}
            <br />
            <a
              href="tel:112"
              style={{
                display: "inline-block",
                marginTop: "10px",
                backgroundColor: "#ea580c",
                color: "white",
                padding: "8px 14px",
                borderRadius: "6px",
                textDecoration: "none",
                fontWeight: "bold",
              }}
            >
              📞 Call 112 Directly
            </a>
          </div>
        )}
      </div>

      {/* ── Emergency Contacts ────────────────────────────────────────────── */}
      <h2 className="section-title">📞 Emergency Contacts</h2>
      <div className="emergency-contacts">
        {CONTACTS.map((contact) => (
          <div className="emergency-contact-card" key={contact.number}>
            <div className="contact-icon">{contact.icon}</div>
            <div>
              <h3>{contact.name}</h3>
              <p style={{ fontSize: "1.1rem", fontWeight: "bold", color: "#38bdf8" }}>
                {contact.number}
              </p>
            </div>
            <a
              href={`tel:${contact.number}`}
              className="call-btn"
              style={{
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              📞 Call
            </a>
          </div>
        ))}
      </div>

      {/* ── Quick Emergency Actions ───────────────────────────────────────── */}
      <h2 className="section-title">⚡ Quick Emergency Actions</h2>
      <div className="quick-actions">
        <button onClick={() => navigate("/shelter-finder")}>🏠 Find Shelter</button>
        <button onClick={() => navigate("/map")}>🗺️ Open Disaster Map</button>
        <button onClick={() => navigate("/notifications")}>📞 Emergency Alerts</button>
        <button onClick={() => navigate("/safety-guides")}>🛡️ Safety Guide</button>
      </div>

      {/* ── Safety Tips ──────────────────────────────────────────────────── */}
      <div className="sos-safety-card">
        <h2>🛡️ Emergency Safety Tips</h2>
        <ul>
          <li>Stay calm and assess your surroundings.</li>
          <li>Follow official emergency instructions.</li>
          <li>Move to a safe location when instructed.</li>
          <li>Keep your phone charged if possible.</li>
          <li>Help others when it is safe to do so.</li>
        </ul>
      </div>
    </div>
  );
}

export default SOSCenter;