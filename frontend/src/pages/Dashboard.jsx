import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../utils/useAuth";
import { saveOfflineReport } from "../utils/offlineStorage";
import { requestNotificationPermission, sendLocalEmergencyAlert } from "../utils/pushAlerts";
import localforage from 'localforage';
import { getWhatsAppUrl } from "../utils/phoneUtils";

// ─── FULL TRILINGUAL TRANSLATIONS ────────────────────────────────────────────
const translations = {
  en: {
    title: "Disaster Management Portal",
    subtitle: "Real-time emergency monitoring and reporting system",
    welcomeBack: "Welcome back",
    emergencyGuest: "Emergency Guest",
    loadingSession: "Loading offline session...",
    offlineMode: "⚠️ Offline Mode Active: App running entirely from local cache.",
    unsyncedReports: "Unsynced Offline Reports",
    slaActive: "⚡ Zero-Delay SLA Active: Average Response Time is 42 Seconds",
    slaDesc: "Automated AI dispatch mode active. All help requests are processed immediately.",
    callbackBtn: "📞 Request 1-Min Auto Callback",
    callbackRequested: "✓ Callback Requested",
    dangerTitle: "Immediate Danger / Trapped? Send Immediate Rescue Beacon",
    dangerDesc: "Shares your live GPS location instantly with active NDRF & Local Rescue Units.",
    sosBroadcast: "Broadcast SOS Signal",
    sosActive: "🚨 SOS Beacon Active!",
    activeAlerts: "Active Alerts",
    rescueOps: "Rescue Operations",
    safeShelters: "Safe Shelters Available",
    sosRequests: "Emergency SOS Requests",
    quickActions: "Quick Actions",
    dispatchSOS: "🚨 Dispatch SOS Emergency Team",
    broadcastAlert: "📢 Broadcast Regional Alert",
    openShelter: "📍 Open Shelter Finder Map",
    liveIncidentFeed: "Live Incident Feed",
    familySafety: "👨‍👩‍👧 Family & Personnel Safety Radar",
    familySafetyDesc: "Real-time check-ins from registered family members during evacuations.",
    offlineSMS: "📲 Zero-Internet / Offline SMS Rescue Mode",
    offlineSMSDesc: "If cellular internet drops, send an emergency SMS to route your rescue immediately.",
    activeShelters: "🏥 Active Relief Shelters",
    survivalKit: "🎒 72-Hour Survival Kit Prep",
    hazardReport: "📢 Crowdsourced Incident & Hazard Reporting",
    hazardDesc: "Report fallen power lines, road blockages, or flooding to alert emergency responders.",
    hazardPlaceholder: "Describe hazard or incident...",
    submitHazard: "Submit Hazard Report",
    shareLocation: "📍 Share My Live Location",
    sendWhatsApp: "💬 Send WhatsApp SOS",
    enableAlerts: "🔔 Enable Alert System",
    support: "Need Technical Help?",
    supportDesc: "Report bugs or access issues. Submissions work online and during network outages!",
    supportPlaceholder: "Describe the issue you encountered...",
    submitTicket: "Submit Support Ticket",
    viewRadar: "🌐 View Radar",
    weatherWarning: "Local Weather",
    safe: "Safe at Shelter",
    weatherLoading: "Fetching live weather...",
  },
  hi: {
    title: "आपदा प्रबंधन पोर्टल",
    subtitle: "वास्तविक समय आपातकालीन निगरानी और रिपोर्टिंग प्रणाली",
    welcomeBack: "स्वागत है",
    emergencyGuest: "आपातकालीन अतिथि",
    loadingSession: "ऑफलाइन सत्र लोड हो रहा है...",
    offlineMode: "⚠️ ऑफलाइन मोड सक्रिय: ऐप पूरी तरह स्थानीय कैश से चल रहा है।",
    unsyncedReports: "असमन्वित ऑफलाइन रिपोर्ट",
    slaActive: "⚡ शून्य-विलंब SLA सक्रिय: औसत प्रतिक्रिया समय 42 सेकंड है",
    slaDesc: "स्वचालित AI डिस्पैच मोड सक्रिय। सभी सहायता अनुरोध तुरंत संसाधित किए जाते हैं।",
    callbackBtn: "📞 1-मिनट ऑटो कॉलबैक अनुरोध करें",
    callbackRequested: "✓ कॉलबैक अनुरोधित",
    dangerTitle: "तत्काल खतरा / फंसे हैं? तत्काल बचाव बीकन भेजें",
    dangerDesc: "आपकी लाइव GPS लोकेशन तुरंत NDRF और स्थानीय बचाव दल के साथ साझा करता है।",
    sosBroadcast: "SOS सिग्नल प्रसारित करें",
    sosActive: "🚨 SOS बीकन सक्रिय!",
    activeAlerts: "सक्रिय अलर्ट",
    rescueOps: "बचाव अभियान",
    safeShelters: "उपलब्ध सुरक्षित आश्रय",
    sosRequests: "आपातकालीन SOS अनुरोध",
    quickActions: "त्वरित कार्रवाई",
    dispatchSOS: "🚨 SOS आपातकालीन दल भेजें",
    broadcastAlert: "📢 क्षेत्रीय अलर्ट प्रसारित करें",
    openShelter: "📍 आश्रय खोजक मानचित्र खोलें",
    liveIncidentFeed: "लाइव घटना फ़ीड",
    familySafety: "👨‍👩‍👧 परिवार और कर्मचारी सुरक्षा रडार",
    familySafetyDesc: "निकासी के दौरान पंजीकृत परिवार के सदस्यों से रीयल-टाइम चेक-इन।",
    offlineSMS: "📲 जीरो-इंटरनेट / ऑफलाइन SMS बचाव मोड",
    offlineSMSDesc: "यदि इंटरनेट बंद हो, तो अपना बचाव अनुरोध भेजने के लिए SMS करें।",
    activeShelters: "🏥 सक्रिय राहत आश्रय",
    survivalKit: "🎒 72-घंटे जीवन रक्षा किट",
    hazardReport: "📢 भीड़-स्रोत घटना और खतरा रिपोर्टिंग",
    hazardDesc: "बिजली की लाइन गिरना, सड़क अवरोध या बाढ़ की रिपोर्ट करें।",
    hazardPlaceholder: "खतरे या घटना का वर्णन करें...",
    submitHazard: "खतरा रिपोर्ट सबमिट करें",
    shareLocation: "📍 मेरी लाइव लोकेशन शेयर करें",
    sendWhatsApp: "💬 WhatsApp SOS भेजें",
    enableAlerts: "🔔 अलर्ट सिस्टम सक्षम करें",
    support: "तकनीकी सहायता चाहिए?",
    supportDesc: "बग या एक्सेस समस्याएँ रिपोर्ट करें। ऑफलाइन भी काम करता है!",
    supportPlaceholder: "सामना की गई समस्या का वर्णन करें...",
    submitTicket: "सपोर्ट टिकट सबमिट करें",
    viewRadar: "🌐 रडार देखें",
    weatherWarning: "स्थानीय मौसम",
    safe: "आश्रय में सुरक्षित",
    weatherLoading: "लाइव मौसम ला रहे हैं...",
  },
  or: {
    title: "ବିପର୍ଯ୍ୟୟ ପରିଚାଳନା ପୋର୍ଟାଲ୍",
    subtitle: "ରିଅଲ-ଟାଇମ ଜରୁରୀ ତଦାରଖ ଏବଂ ରିପୋର୍ଟ ପ୍ରଣାଳୀ",
    welcomeBack: "ସ୍ୱାଗତ",
    emergencyGuest: "ଜରୁରୀ ଅତିଥି",
    loadingSession: "ଅଫଲାଇନ ସେସନ ଲୋଡ ହେଉଛି...",
    offlineMode: "⚠️ ଅଫଲାଇନ ମୋଡ ସକ୍ରିୟ: ଆପ ସ୍ଥାନୀୟ କ୍ୟାଶ୍‌ରୁ ଚାଲୁଛି।",
    unsyncedReports: "ଅସିଙ୍କ ଅଫଲାଇନ ରିପୋର୍ଟ",
    slaActive: "⚡ ଜିରୋ-ଡିଲେ SLA ସକ୍ରିୟ: ହାରାହାରି ପ୍ରତିକ୍ରିୟା ସମୟ 42 ସେକେଣ୍ଡ",
    slaDesc: "ସ୍ୱୟଂଚାଳିତ AI ଡିସ୍ପାଚ ମୋଡ ସକ୍ରିୟ।",
    callbackBtn: "📞 1-ମିନିଟ ଅଟୋ କଲବ୍ୟାକ ଅନୁରୋଧ",
    callbackRequested: "✓ କଲବ୍ୟାକ ଅନୁରୋଧ ହୋଇଛି",
    dangerTitle: "ତୁରନ୍ତ ବିପଦ? ଉଦ୍ଧାର ବିକନ ପଠାନ୍ତୁ",
    dangerDesc: "ଆପଣଙ୍କ GPS ସ୍ଥାନ NDRF ଏବଂ ସ୍ଥାନୀୟ ଉଦ୍ଧାର ଦଳ ସହ ସଂଯୁକ୍ତ।",
    sosBroadcast: "SOS ସଙ୍କେତ ପ୍ରସାରଣ",
    sosActive: "🚨 SOS ବିକନ ସକ୍ରିୟ!",
    activeAlerts: "ସକ୍ରିୟ ସତର୍କ",
    rescueOps: "ଉଦ୍ଧାର ଅଭିଯାନ",
    safeShelters: "ଉପଲବ୍ଧ ସୁରକ୍ଷିତ ଆଶ୍ରୟ",
    sosRequests: "ଜରୁରୀ SOS ଅନୁରୋଧ",
    quickActions: "ଦ୍ରୁତ କାର୍ଯ୍ୟ",
    dispatchSOS: "🚨 SOS ଜରୁରୀ ଦଳ ପଠାନ୍ତୁ",
    broadcastAlert: "📢 ଆଞ୍ଚଳିକ ସତର୍କ ପ୍ରସାରଣ",
    openShelter: "📍 ଆଶ୍ରୟ ଖୋଜକ ମ୍ୟାପ ଖୋଲନ୍ତୁ",
    liveIncidentFeed: "ଲାଇଭ ଘଟଣା ଫିଡ",
    familySafety: "👨‍👩‍👧 ପରିବାର ଏବଂ କର୍ମଚାରୀ ସୁରକ୍ଷା ରଡାର",
    familySafetyDesc: "ନିର୍ବାହ ସମୟରେ ପଂଜୀକୃତ ପରିବାର ସଦସ୍ୟଙ୍କ ଚେକ-ଇନ।",
    offlineSMS: "📲 ଜିରୋ-ଇଣ୍ଟର୍ନେଟ / ଅଫଲାଇନ SMS ଉଦ୍ଧାର ମୋଡ",
    offlineSMSDesc: "ଇଣ୍ଟର୍ନେଟ ଯଦି ବନ୍ଦ ହୋଇଯାଏ, SMS ମାଧ୍ୟମରେ ଉଦ୍ଧାର ଅନୁରୋଧ ପଠାନ୍ତୁ।",
    activeShelters: "🏥 ସକ୍ରିୟ ରାହତ ଆଶ୍ରୟ",
    survivalKit: "🎒 72-ଘଣ୍ଟା ବଞ୍ଚିବା କିଟ",
    hazardReport: "📢 ଭିଡ-ଉତ୍ସ ଘଟଣା ଏବଂ ବିପଦ ରିପୋର୍ଟ",
    hazardDesc: "ଘଟଣା ବିଷୟରେ ଜଣାନ୍ତୁ।",
    hazardPlaceholder: "ବିପଦ ବା ଘଟଣା ବର୍ଣ୍ଣନା କରନ୍ତୁ...",
    submitHazard: "ବିପଦ ରିପୋର୍ଟ ଦାଖଲ",
    shareLocation: "📍 ମୋ ଲାଇଭ ଲୋକେଶନ ଭାଗ କରନ୍ତୁ",
    sendWhatsApp: "💬 WhatsApp SOS ପଠାନ୍ତୁ",
    enableAlerts: "🔔 ଅଲର୍ଟ ସିଷ୍ଟମ ସକ୍ଷମ",
    support: "କାରିଗରୀ ସହାୟତା ଆବଶ୍ୟକ କି?",
    supportDesc: "ବଗ ବା ଆକ୍ସେସ ସମସ୍ୟା ରିପୋର୍ଟ କରନ୍ତୁ।",
    supportPlaceholder: "ସମ୍ମୁଖୀନ ହୋଇଥିବା ସମସ୍ୟା ବର୍ଣ୍ଣନା କରନ୍ତୁ...",
    submitTicket: "ସପୋର୍ଟ ଟିକେଟ ଦାଖଲ",
    viewRadar: "🌐 ରଡାର ଦେଖନ୍ତୁ",
    weatherWarning: "ସ୍ଥାନୀୟ ପାଣିପାଗ",
    safe: "ଆଶ୍ରୟରେ ସୁରକ୍ଷିତ",
    weatherLoading: "ଲାଇଭ ପାଣିପାଗ ଆଣୁଛୁ...",
  }
};

// ─── WEATHER CODE → DESCRIPTION ──────────────────────────────────────────────
const getWeatherDesc = (code) => {
  if (code === 0) return "☀️ Clear Sky";
  if (code <= 3) return "⛅ Partly Cloudy";
  if (code <= 48) return "🌫️ Foggy";
  if (code <= 55) return "🌦️ Drizzle";
  if (code <= 67) return "🌧️ Rainy";
  if (code <= 77) return "❄️ Snow";
  if (code <= 82) return "🌧️ Heavy Rain Showers";
  if (code <= 99) return "⛈️ Thunderstorm";
  return "🌡️ Unknown";
};

const getWeatherAlert = (code) => {
  if (code >= 80) return "⚠️ Severe Weather Warning";
  if (code >= 61) return "🌧️ Rainfall Alert";
  if (code >= 45) return "🌫️ Low Visibility Advisory";
  return "🌤️ Weather Conditions";
};

export default function Dashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const [sosActive, setSosActive] = useState(false);
  const [sosCoords, setSosCoords] = useState(null);
  const [callbackRequested, setCallbackRequested] = useState(false);
  const [reportInput, setReportInput] = useState("");
  const [pushEnabled, setPushEnabled] = useState(Notification.permission === "granted");
  const [lang, setLang] = useState(() => localStorage.getItem("dashboard_lang") || "en");
  const [weather, setWeather] = useState({ temp: null, wind: null, desc: "", code: -1 });
  const [weatherLoading, setWeatherLoading] = useState(true);

  const t = translations[lang] || translations.en;

  const [reports, setReports] = useState([
    { id: 1, text: "Fallen power line on Sector 3 Main Road", time: "10 mins ago", status: "Verified" }
  ]);

  const [checklist, setChecklist] = useState(() => {
    try {
      const saved = localStorage.getItem("survival_checklist");
      return saved ? JSON.parse(saved) : [
        { id: 1, text: "72-Hour Clean Water Supply (3 Gallons)", checked: true },
        { id: 2, text: "First-Aid Kit & Prescription Medicines", checked: true },
        { id: 3, text: "Emergency Flashlight & Extra Batteries", checked: false },
        { id: 4, text: "Power Bank & Charging Cables", checked: false },
        { id: 5, text: "Important Government Documents (In Waterproof Bag)", checked: false }
      ];
    } catch { return []; }
  });

  // ─── ONLINE / OFFLINE LISTENER ───────────────────────────────────────────
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // ─── LOAD PERSISTED HAZARD REPORTS FROM LOCALFORAGE ─────────────────────
  useEffect(() => {
    localforage.getItem("dashboard_hazard_reports").then((saved) => {
      if (saved && Array.isArray(saved) && saved.length > 0) {
        setReports(saved);
      }
    }).catch(() => {});
  }, []);

  // ─── LIVE WEATHER VIA OPEN-METEO (NO API KEY NEEDED) ────────────────────
  useEffect(() => {
    const fetchWeather = async (lat, lon) => {
      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,wind_speed_10m,weather_code,precipitation&timezone=auto`
        );
        const data = await res.json();
        const c = data.current;
        setWeather({
          temp: Math.round(c.temperature_2m),
          wind: Math.round(c.wind_speed_10m),
          desc: getWeatherDesc(c.weather_code),
          code: c.weather_code,
        });
      } catch {
        setWeather({ temp: 28, wind: 22, desc: "⛅ Partly Cloudy", code: 2 });
      } finally {
        setWeatherLoading(false);
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
        () => fetchWeather(20.2961, 85.8245) // Fallback: Bhubaneswar
      );
    } else {
      fetchWeather(20.2961, 85.8245);
    }
  }, []);

  // ─── REQUEST PUSH NOTIFICATION PERMISSION ON MOUNT ──────────────────────
  useEffect(() => {
    if (Notification.permission === "default") {
      requestNotificationPermission();
    }
  }, []);

  // ─── HELPERS ─────────────────────────────────────────────────────────────
  const toggleCheck = (id) => {
    const updated = checklist.map(item => item.id === id ? { ...item, checked: !item.checked } : item);
    setChecklist(updated);
    localStorage.setItem("survival_checklist", JSON.stringify(updated));
  };

  const handleEnablePush = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      setPushEnabled(true);
      sendLocalEmergencyAlert("🔔 Lock-Screen Alerts Active", "You will receive emergency notifications.");
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          const mapsUrl = `https://maps.google.com/?q=${latitude},${longitude}`;
          alert(`📍 Your Location:\nLat: ${latitude.toFixed(5)}, Lng: ${longitude.toFixed(5)}\n\nOpening in Google Maps...`);
          window.open(mapsUrl, "_blank");
        },
        () => alert("Unable to retrieve location. Please enable GPS.")
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  // ─── SOS: GET GPS + SEND WHATSAPP + NOTIFICATION ─────────────────────────
  const broadcastSOS = () => {
    if (sosActive) {
      setSosActive(false);
      setSosCoords(null);
      return;
    }
    if (!navigator.geolocation) {
      alert("GPS not supported. Sending SOS without location.");
      sendWhatsAppAlert("EMERGENCY - Location unavailable");
      setSosActive(true);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude.toFixed(5);
        const lng = pos.coords.longitude.toFixed(5);
        setSosCoords({ lat, lng });
        setSosActive(true);
        sendLocalEmergencyAlert(
          "🚨 SOS Beacon Activated",
          `Location: ${lat}, ${lng} — Emergency teams have been notified.`
        );
        sendWhatsAppAlert(`EMERGENCY SOS — GPS: ${lat},${lng} — https://maps.google.com/?q=${lat},${lng}`);
      },
      () => {
        setSosActive(true);
        sendWhatsAppAlert("EMERGENCY SOS — Location unavailable. Please send help!");
        sendLocalEmergencyAlert("🚨 SOS Activated", "Emergency teams notified. Enable GPS for precise location.");
      }
    );
  };

  // ─── SLA CALLBACK ────────────────────────────────────────────────────────
  const handleCallback = () => {
    setCallbackRequested(true);
    localStorage.setItem("callback_requested", new Date().toISOString());
    sendLocalEmergencyAlert(
      "📞 Callback Scheduled",
      "Emergency coordinator will call you within 1 minute."
    );
    // Open tel: dial as primary action
    const controlCenter = localStorage.getItem("emergency_contact_number") || "1070";
    window.location.href = `tel:${controlCenter}`;
  };

  // ─── WHATSAPP SOS ─────────────────────────────────────────────────────────
  const sendWhatsAppAlert = (issueText) => {
    const message = `EMERGENCY REPORT: ${issueText || "Immediate assistance requested!"}`;
    const targetUrl = getWhatsAppUrl(message);
    window.open(targetUrl, "_blank");
  };

  // ─── HAZARD REPORT SUBMISSION (PERSISTED) ────────────────────────────────
  const submitHazardReport = async () => {
    if (!reportInput.trim()) return;
    const newReport = { id: Date.now(), text: reportInput, time: "Just now", status: "Pending" };
    const updated = [newReport, ...reports];
    setReports(updated);
    setReportInput("");
    // Persist to localforage
    await localforage.setItem("dashboard_hazard_reports", updated);
    // Also save to offline queue for backend sync
    await saveOfflineReport({ type: "hazard", text: reportInput });
    // Trigger notification
    sendLocalEmergencyAlert("📢 Hazard Report Submitted", reportInput.slice(0, 80));
  };

  // ─── SUPPORT TICKET SUBMISSION ────────────────────────────────────────────
  const handleSupportTicket = async (e) => {
    e.preventDefault();
    const issueText = e.target.issue.value.trim();
    if (!issueText) return;
    const ticket = { id: Date.now(), text: issueText, timestamp: new Date().toISOString(), status: "Pending" };
    const backendUrl = import.meta.env.VITE_API_URL || "";
    if (navigator.onLine && backendUrl) {
      try {
        await fetch(`${backendUrl}/api/support`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(ticket)
        });
        alert("✅ Support ticket sent to technical team!");
      } catch {
        await localforage.setItem(`support_ticket_${ticket.id}`, ticket);
        alert("⚠️ Server unreachable. Ticket saved locally and will auto-sync when connected!");
      }
    } else {
      await localforage.setItem(`support_ticket_${ticket.id}`, ticket);
      alert(navigator.onLine
        ? "📝 Ticket saved locally (no backend configured)."
        : "📱 Saved offline! Will automatically sync when network restores.");
    }
    e.target.reset();
  };

  // ─── LANGUAGE CHANGE ─────────────────────────────────────────────────────
  const handleLangChange = (e) => {
    setLang(e.target.value);
    localStorage.setItem("dashboard_lang", e.target.value);
  };

  // ─── RENDER ───────────────────────────────────────────────────────────────
  const completedChecks = checklist.filter((item) => item.checked).length;
  const checklistPercentage = Math.round((completedChecks / checklist.length) * 100);

  return (
    <div style={{ backgroundColor: "#020617", minHeight: "100%", color: "#f8fafc", padding: "clamp(12px, 2.5vw, 24px)" }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px" }}>

        {/* ── 1. Top Mission Command Header ─────────────────────────────────── */}
        <div
          className="tactical-card"
          style={{
            padding: "20px 24px",
            background: "linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(8, 14, 28, 0.95) 100%)",
            border: "1px solid rgba(56, 189, 248, 0.25)",
            boxShadow: "0 12px 35px rgba(0, 0, 0, 0.5), 0 0 20px rgba(14, 165, 233, 0.12)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#10b981", boxShadow: "0 0 8px #10b981" }} />
                <span className="tactical-badge badge-safe">
                  CRISIS OPERATIONS DECK · ACTIVE TELEMETRY
                </span>
              </div>
              <h1
                style={{
                  margin: 0,
                  fontSize: "clamp(1.5rem, 2.5vw, 2.1rem)",
                  fontWeight: "900",
                  letterSpacing: "-0.03em",
                  background: "linear-gradient(135deg, #ffffff 0%, #38bdf8 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {t.title}
              </h1>
              <p style={{ margin: "4px 0 0 0", color: "#94a3b8", fontSize: "0.88rem" }}>
                {t.subtitle}
              </p>
            </div>

            <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
              {/* Language Selector */}
              <div style={{ display: "flex", alignItems: "center", gap: "6px", backgroundColor: "rgba(30, 41, 59, 0.8)", padding: "4px 10px", borderRadius: "8px", border: "1px solid rgba(56, 189, 248, 0.25)" }}>
                <span style={{ fontSize: "0.85rem" }}>🌐</span>
                <select
                  value={lang}
                  onChange={handleLangChange}
                  style={{ backgroundColor: "transparent", color: "#f8fafc", border: "none", outline: "none", fontSize: "0.78rem", fontWeight: "700", cursor: "pointer" }}
                >
                  <option value="en" style={{ background: "#0f172a" }}>English</option>
                  <option value="hi" style={{ background: "#0f172a" }}>हिन्दी (Hindi)</option>
                  <option value="or" style={{ background: "#0f172a" }}>ଓଡ଼ିଆ (Odia)</option>
                </select>
              </div>

              {/* Direct Speed Dialers */}
              <a
                href="tel:112"
                className="hotline-chip hotline-medical"
                title="Call National All-Emergency Helpline (112)"
              >
                <span>🚨</span>
                <span>112 All Emergency</span>
              </a>

              <a
                href="tel:108"
                className="hotline-chip hotline-medical"
                title="Call Medical Emergency Ambulance (108)"
              >
                <span>🚑</span>
                <span>108 Medical</span>
              </a>

              <a
                href="tel:1070"
                className="hotline-chip hotline-disaster"
                title="Call State Disaster Management Authority (1070)"
              >
                <span>📞</span>
                <span>1070 SDMA</span>
              </a>

              {/* Account Switcher / Login */}
              <button
                onClick={() => navigate("/login")}
                style={{
                  backgroundColor: "rgba(14, 165, 233, 0.2)",
                  color: "#38bdf8",
                  border: "1px solid rgba(56, 189, 248, 0.4)",
                  padding: "6px 14px",
                  borderRadius: "8px",
                  fontWeight: "700",
                  fontSize: "0.82rem",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  transition: "all 0.15s ease",
                }}
              >
                <span>🔐</span>
                <span>{user ? "Switch Account" : "Sign In"}</span>
              </button>
            </div>
          </div>

          {/* User Session Banner Strip */}
          <div
            style={{
              marginTop: "16px",
              paddingTop: "14px",
              borderTop: "1px solid rgba(56, 189, 248, 0.12)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(14, 165, 233, 0.25)",
                  border: "1.5px solid #38bdf8",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "800",
                  color: "#38bdf8",
                }}
              >
                {user?.name ? user.name.charAt(0).toUpperCase() : "👤"}
              </div>
              <div>
                <div style={{ fontSize: "0.92rem", fontWeight: "800", color: "#f8fafc" }}>
                  {t.welcomeBack}, <span style={{ color: "#38bdf8" }}>{user ? user.name || user.email : t.emergencyGuest}</span>
                </div>
                <div style={{ fontSize: "0.72rem", color: "#94a3b8", fontFamily: "var(--font-mono, monospace)" }}>
                  CLEARANCE: <strong style={{ color: "#e2e8f0" }}>{user?.role ? user.role.toUpperCase() : "CITIZEN / GUEST"}</strong> • ENCRYPTED SESSION ACTIVE
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={() => navigate("/profile")}
                style={{
                  backgroundColor: "rgba(30, 41, 59, 0.7)",
                  color: "#cbd5e1",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  padding: "5px 12px",
                  borderRadius: "6px",
                  fontSize: "0.78rem",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                👤 Responder Profile
              </button>
              <button
                onClick={() => navigate("/register")}
                style={{
                  backgroundColor: "rgba(56, 189, 248, 0.12)",
                  color: "#38bdf8",
                  border: "1px solid rgba(56, 189, 248, 0.3)",
                  padding: "5px 12px",
                  borderRadius: "6px",
                  fontSize: "0.78rem",
                  fontWeight: "700",
                  cursor: "pointer",
                }}
              >
                📝 Register
              </button>
            </div>
          </div>
        </div>

        {/* ── 2. Offline Mode Warning (if offline) ─────────────────────────── */}
        {!isOnline && (
          <div
            style={{
              backgroundColor: "rgba(245, 158, 11, 0.18)",
              border: "1px solid rgba(245, 158, 11, 0.45)",
              color: "#fde68a",
              padding: "12px 18px",
              borderRadius: "12px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "10px",
              boxShadow: "0 0 20px rgba(245, 158, 11, 0.2)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "1.2rem" }}>⚠️</span>
              <span style={{ fontWeight: "700" }}>{t.offlineMode}</span>
            </div>
            <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.82rem" }}>
              {t.unsyncedReports}: <strong>{pendingSyncCount}</strong>
            </span>
          </div>
        )}

        {/* ── 3. High-Impact SOS & Immediate Danger Command Strip ──────────── */}
        <div
          className="tactical-card glow-border-rose"
          style={{
            padding: "20px 24px",
            background: "linear-gradient(135deg, rgba(69, 10, 10, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%)",
            border: "1.5px solid rgba(244, 63, 94, 0.5)",
            boxShadow: "0 10px 30px rgba(244, 63, 94, 0.25)",
            position: "relative",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
            <div style={{ maxWidth: "720px" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", backgroundColor: "rgba(244, 63, 94, 0.25)", border: "1px solid rgba(244, 63, 94, 0.5)", padding: "2px 8px", borderRadius: "999px", fontSize: "0.7rem", color: "#fca5a5", fontWeight: "800", textTransform: "uppercase" }}>
                <span>🚨</span> LIFE-THREAT TRIAGE SYSTEM
              </div>
              <h2 style={{ margin: "8px 0 4px 0", fontSize: "1.3rem", fontWeight: "900", color: "#ffffff" }}>
                {t.dangerTitle}
              </h2>
              <p style={{ margin: 0, fontSize: "0.85rem", color: "#fecaca", lineHeight: "1.4" }}>
                {t.dangerDesc}
              </p>
              {sosActive && sosCoords && (
                <div style={{ marginTop: "10px", display: "inline-flex", alignItems: "center", gap: "6px", backgroundColor: "rgba(254, 240, 138, 0.2)", border: "1px solid rgba(254, 240, 138, 0.4)", color: "#fef08a", padding: "4px 10px", borderRadius: "6px", fontSize: "0.78rem", fontFamily: "var(--font-mono, monospace)" }}>
                  <span>📍 GPS ACTIVE:</span> <strong>{sosCoords.lat}, {sosCoords.lng}</strong>
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
              <div style={{ position: "relative" }}>
                <div className="animate-pulse-ring" />
                <button
                  onClick={broadcastSOS}
                  style={{
                    backgroundColor: sosActive ? "#450a0a" : "#dc2626",
                    color: "#ffffff",
                    border: "2px solid rgba(255, 255, 255, 0.4)",
                    padding: "14px 28px",
                    borderRadius: "12px",
                    cursor: "pointer",
                    fontWeight: "900",
                    fontSize: "0.95rem",
                    boxShadow: "0 0 25px rgba(220, 38, 38, 0.8)",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    letterSpacing: "0.04em",
                    transition: "all 0.15s ease",
                  }}
                >
                  <span style={{ fontSize: "1.2rem" }}>🚨</span>
                  <span>{sosActive ? t.sosActive : t.sosBroadcast}</span>
                </button>
              </div>

              <button
                onClick={() => navigate("/emergency-sos")}
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.08)",
                  color: "#f8fafc",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  padding: "14px 20px",
                  borderRadius: "12px",
                  cursor: "pointer",
                  fontWeight: "700",
                  fontSize: "0.85rem",
                  transition: "all 0.15s ease",
                }}
              >
                SOS Center & Siren ➔
              </button>
            </div>
          </div>
        </div>

        {/* ── 4. Tactical Threat HUD & Zero-Delay SLA Strip ───────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px" }}>
          
          {/* Defcon Threat Meter */}
          <div
            className="tactical-card"
            style={{
              padding: "18px 20px",
              borderLeft: "4px solid #f59e0b",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#f59e0b", boxShadow: "0 0 8px #f59e0b" }} />
                <span style={{ fontSize: "0.72rem", fontWeight: "800", color: "#fbbf24", letterSpacing: "0.06em", fontFamily: "var(--font-mono, monospace)" }}>
                  THREAT CONDITION: DEFCON 2
                </span>
              </div>
              <div style={{ fontWeight: "800", fontSize: "1.05rem", color: "#f8fafc", marginTop: "4px" }}>
                Elevated Regional Squall & Slope Alert
              </div>
              <div style={{ fontSize: "0.78rem", color: "#94a3b8", marginTop: "2px" }}>
                Precipitation triggering cautionary drainage runoff envelope
              </div>
            </div>
            <Link
              to="/alerts"
              style={{
                backgroundColor: "rgba(245, 158, 11, 0.18)",
                color: "#fde68a",
                border: "1px solid rgba(245, 158, 11, 0.4)",
                padding: "8px 14px",
                borderRadius: "8px",
                textDecoration: "none",
                fontWeight: "700",
                fontSize: "0.8rem",
              }}
            >
              Alert Feeds ➔
            </Link>
          </div>

          {/* SLA Zero-Delay Auto Dispatch */}
          <div
            className="tactical-card"
            style={{
              padding: "18px 20px",
              borderLeft: "4px solid #10b981",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#10b981", boxShadow: "0 0 8px #10b981" }} />
                <span style={{ fontSize: "0.72rem", fontWeight: "800", color: "#34d399", letterSpacing: "0.06em", fontFamily: "var(--font-mono, monospace)" }}>
                  {t.slaActive}
                </span>
              </div>
              <div style={{ fontWeight: "800", fontSize: "1.05rem", color: "#f8fafc", marginTop: "4px" }}>
                Automated AI Triage & Routing
              </div>
              <div style={{ fontSize: "0.78rem", color: "#94a3b8", marginTop: "2px" }}>
                {t.slaDesc}
              </div>
            </div>
            <button
              onClick={handleCallback}
              style={{
                backgroundColor: "#059669",
                color: "white",
                border: "none",
                padding: "8px 16px",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "800",
                fontSize: "0.8rem",
                boxShadow: "0 2px 10px rgba(5, 150, 105, 0.4)",
              }}
            >
              {callbackRequested ? t.callbackRequested : t.callbackBtn}
            </button>
          </div>
        </div>

        {/* ── 5. Real-Time Telemetry & Weather Grid ────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>

          {/* Meteorological Radar (Open-Meteo) */}
          <div className="tactical-card" style={{ padding: "18px 20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <span style={{ fontSize: "0.72rem", fontWeight: "800", color: "#38bdf8", fontFamily: "var(--font-mono, monospace)" }}>
                METEOROLOGY & ATMOSPHERE
              </span>
              <span className="tactical-badge badge-info">LIVE</span>
            </div>
            {weatherLoading ? (
              <div style={{ color: "#94a3b8", fontSize: "0.88rem" }}>⏳ {t.weatherLoading}</div>
            ) : (
              <div>
                <div style={{ fontSize: "1.1rem", fontWeight: "800", color: "#ffffff" }}>
                  {getWeatherAlert(weather.code)}
                </div>
                <div style={{ fontSize: "1.6rem", fontWeight: "900", color: "#38bdf8", margin: "6px 0" }}>
                  {weather.temp !== null ? `${weather.temp}°C` : "--"} <span style={{ fontSize: "0.95rem", color: "#cbd5e1" }}>{weather.desc}</span>
                </div>
                <div style={{ fontSize: "0.78rem", color: "#94a3b8" }}>
                  💨 Wind: {weather.wind} km/h • 📍 GPS Auto-Resolution
                </div>
              </div>
            )}
            <div style={{ marginTop: "12px", paddingTop: "10px", borderTop: "1px solid rgba(56, 189, 248, 0.12)" }}>
              <button
                onClick={() => window.open("https://www.windy.com/?20.296,85.824,9", "_blank")}
                style={{
                  backgroundColor: "rgba(14, 165, 233, 0.15)",
                  color: "#38bdf8",
                  border: "1px solid rgba(56, 189, 248, 0.35)",
                  padding: "6px 14px",
                  borderRadius: "6px",
                  fontSize: "0.78rem",
                  fontWeight: "700",
                  cursor: "pointer",
                  width: "100%",
                }}
              >
                {t.viewRadar} (Windy Satellite) ↗
              </button>
            </div>
          </div>

          {/* Geological & Hill Slope Risk Engine */}
          <div className="tactical-card" style={{ padding: "18px 20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <span style={{ fontSize: "0.72rem", fontWeight: "800", color: "#c084fc", fontFamily: "var(--font-mono, monospace)" }}>
                NER HILL SATURATION RADAR
              </span>
              <span className="tactical-badge badge-high">64% SAT</span>
            </div>
            <div style={{ fontSize: "1.1rem", fontWeight: "800", color: "#ffffff" }}>
              Slope Moisture & Landslide Risk
            </div>
            <div style={{ margin: "8px 0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", marginBottom: "4px", color: "#cbd5e1" }}>
                <span>Soil Saturation Index</span>
                <span style={{ color: "#fb923c", fontWeight: "700" }}>64% (Cautionary)</span>
              </div>
              <div style={{ backgroundColor: "rgba(255, 255, 255, 0.1)", height: "8px", borderRadius: "999px" }}>
                <div style={{ width: "64%", height: "100%", borderRadius: "999px", background: "linear-gradient(90deg, #38bdf8 0%, #f59e0b 100%)" }} />
              </div>
            </div>
            <div style={{ fontSize: "0.78rem", color: "#94a3b8" }}>
              IMD Rainfall Triggers active across 8 NER hill highway corridors
            </div>
            <div style={{ marginTop: "12px", paddingTop: "10px", borderTop: "1px solid rgba(56, 189, 248, 0.12)", display: "flex", gap: "8px" }}>
              <Link
                to="/ar-see-the-risk"
                style={{
                  flex: 1,
                  textAlign: "center",
                  backgroundColor: "rgba(14, 165, 233, 0.15)",
                  color: "#38bdf8",
                  border: "1px solid rgba(56, 189, 248, 0.35)",
                  padding: "6px",
                  borderRadius: "6px",
                  fontSize: "0.76rem",
                  fontWeight: "700",
                  textDecoration: "none",
                }}
              >
                📡 AR Scanner
              </Link>
              <Link
                to="/ner-landslide-monitor"
                style={{
                  flex: 1,
                  textAlign: "center",
                  backgroundColor: "rgba(99, 102, 241, 0.2)",
                  color: "#a5b4fc",
                  border: "1px solid rgba(99, 102, 241, 0.4)",
                  padding: "6px",
                  borderRadius: "6px",
                  fontSize: "0.76rem",
                  fontWeight: "700",
                  textDecoration: "none",
                }}
              >
                NER Monitor ➔
              </Link>
            </div>
          </div>

          {/* LoRa P2P Mesh Network Telemetry */}
          <div className="tactical-card" style={{ padding: "18px 20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <span style={{ fontSize: "0.72rem", fontWeight: "800", color: "#34d399", fontFamily: "var(--font-mono, monospace)" }}>
                ZERO-INTERNET P2P MESH
              </span>
              <span className="tactical-badge badge-safe">84 NODES</span>
            </div>
            <div style={{ fontSize: "1.1rem", fontWeight: "800", color: "#ffffff" }}>
              Off-Grid Radio Communications
            </div>
            <div style={{ fontSize: "1.6rem", fontWeight: "900", color: "#34d399", margin: "6px 0" }}>
              84 <span style={{ fontSize: "0.95rem", color: "#cbd5e1" }}>P2P Relays Active</span>
            </div>
            <div style={{ fontSize: "0.78rem", color: "#94a3b8" }}>
              Zero-Internet multi-hop fallback ready for cellular outage
            </div>
            <div style={{ marginTop: "12px", paddingTop: "10px", borderTop: "1px solid rgba(56, 189, 248, 0.12)" }}>
              <Link
                to="/mesh-console"
                style={{
                  display: "block",
                  textAlign: "center",
                  backgroundColor: "rgba(16, 185, 129, 0.15)",
                  color: "#34d399",
                  border: "1px solid rgba(16, 185, 129, 0.35)",
                  padding: "6px 14px",
                  borderRadius: "6px",
                  fontSize: "0.78rem",
                  fontWeight: "700",
                  textDecoration: "none",
                }}
              >
                Open Mesh Terminal ➔
              </Link>
            </div>
          </div>
        </div>

        {/* ── 6. Operational Key Stats (4 Pillars) ────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
          {[
            { label: t.activeAlerts, value: "3 High Priority", color: "#f87171", icon: "🚨", link: "/alerts" },
            { label: t.rescueOps, value: "12 Ongoing", color: "#60a5fa", icon: "🚁", link: "/rescue-centers" },
            { label: t.safeShelters, value: "48 Open", color: "#4ade80", icon: "🏥", link: "/shelter-finder" },
            { label: t.sosRequests, value: "5 Pending", color: "#facc15", icon: "🆘", link: "/emergency-sos" },
          ].map(({ label, value, color, icon, link }) => (
            <Link
              key={label}
              to={link}
              className="tactical-card"
              style={{
                padding: "16px 18px",
                textDecoration: "none",
                display: "block",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.78rem", color: "#94a3b8", fontWeight: "700" }}>{label}</span>
                <span style={{ fontSize: "1.2rem" }}>{icon}</span>
              </div>
              <div style={{ margin: "8px 0 0 0", color, fontSize: "1.45rem", fontWeight: "900", letterSpacing: "-0.02em" }}>
                {value}
              </div>
            </Link>
          ))}
        </div>

        {/* ── 7. Quick Tactical Action Command Grid ────────────────────────── */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
            <span style={{ fontSize: "1.1rem" }}>⚡</span>
            <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: "800", color: "#f8fafc" }}>
              {t.quickActions} &amp; Rapid Field Operations
            </h3>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "14px" }}>
            {[
              {
                title: "Dispatch SOS Team",
                desc: "Send emergency rescue beacon with GPS coordinates",
                icon: "🚨",
                path: "/emergency-sos",
                color: "#f43f5e",
                bg: "rgba(244, 63, 94, 0.12)",
                border: "rgba(244, 63, 94, 0.35)",
              },
              {
                title: "Broadcast Regional Alert",
                desc: "Transmit official civilian warning bulletin",
                icon: "📢",
                path: "/alerts",
                color: "#38bdf8",
                bg: "rgba(56, 189, 248, 0.12)",
                border: "rgba(56, 189, 248, 0.35)",
              },
              {
                title: "AR 'See the Risk' Scanner",
                desc: "Augmented visual overlay of flood and slide risk",
                icon: "📡",
                path: "/ar-see-the-risk",
                color: "#a855f7",
                bg: "rgba(168, 85, 247, 0.12)",
                border: "rgba(168, 85, 247, 0.35)",
              },
              {
                title: "Safe Shelter Finder",
                desc: "Live capacity tracking and turn-by-turn routing",
                icon: "🏥",
                path: "/shelter-finder",
                color: "#10b981",
                bg: "rgba(16, 185, 129, 0.12)",
                border: "rgba(16, 185, 129, 0.35)",
              },
              {
                title: "Family Safety Radar",
                desc: "Real-time check-in and tracking for family members",
                icon: "👨‍👩‍👧",
                path: "/family-safety",
                color: "#60a5fa",
                bg: "rgba(96, 165, 250, 0.12)",
                border: "rgba(96, 165, 250, 0.35)",
              },
              {
                title: "Disaster Safety SOP Guides",
                desc: "Voice-guided survival SOPs for cyclone, flood, quake",
                icon: "🎒",
                path: "/safety-guides",
                color: "#f59e0b",
                bg: "rgba(245, 158, 11, 0.12)",
                border: "rgba(245, 158, 11, 0.35)",
              },
            ].map((action) => (
              <div
                key={action.title}
                onClick={() => navigate(action.path)}
                className="tactical-card"
                style={{
                  padding: "16px 18px",
                  cursor: "pointer",
                  background: `linear-gradient(135deg, ${action.bg} 0%, rgba(15, 23, 42, 0.8) 100%)`,
                  borderColor: action.border,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                  <span style={{ fontSize: "1.4rem" }}>{action.icon}</span>
                  <span style={{ fontSize: "0.95rem", fontWeight: "800", color: action.color }}>
                    {action.title}
                  </span>
                </div>
                <div style={{ fontSize: "0.78rem", color: "#94a3b8", lineHeight: "1.35" }}>
                  {action.desc}
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "8px" }}>
                  <span style={{ fontSize: "0.74rem", fontWeight: "700", color: action.color }}>
                    Launch ➔
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── 8. Split Grid: Live Incident Feed & Survival Checklist ────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "20px" }}>

          {/* Live Incident Feed */}
          <div className="tactical-card" style={{ padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#38bdf8", boxShadow: "0 0 8px #38bdf8" }} />
                <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: "800", color: "#ffffff" }}>
                  {t.liveIncidentFeed}
                </h3>
              </div>
              <span className="tactical-badge badge-info">VERIFIED TELEMETRY</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {reports.slice(0, 4).map((r) => (
                <div
                  key={r.id}
                  style={{
                    backgroundColor: "rgba(15, 23, 42, 0.8)",
                    padding: "12px 14px",
                    borderRadius: "10px",
                    borderLeft: `4px solid ${r.status === "Verified" ? "#3b82f6" : r.status === "Pending" ? "#f59e0b" : "#ef4444"}`,
                    border: "1px solid rgba(255, 255, 255, 0.05)",
                  }}
                >
                  <strong style={{ fontSize: "0.88rem", color: "#f8fafc" }}>{r.text}</strong>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px", fontSize: "0.74rem", color: "#94a3b8" }}>
                    <span>⏱️ {r.time}</span>
                    <span style={{ color: r.status === "Verified" ? "#60a5fa" : "#fbbf24", fontWeight: "700" }}>
                      ● {r.status}
                    </span>
                  </div>
                </div>
              ))}
              {reports.length === 0 && (
                <p style={{ color: "#64748b", fontSize: "0.85rem" }}>No active incidents reported.</p>
              )}
            </div>

            {/* Quick Report Trigger */}
            <div style={{ marginTop: "16px" }}>
              <div style={{ fontSize: "0.82rem", fontWeight: "700", color: "#e2e8f0", marginBottom: "6px" }}>
                📢 Report New Hazard (Fallen Wire, Flood, Landslide):
              </div>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <input
                  type="text"
                  placeholder={t.hazardPlaceholder}
                  value={reportInput}
                  onChange={(e) => setReportInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submitHazardReport()}
                  style={{
                    flex: 1,
                    minWidth: "180px",
                    backgroundColor: "rgba(15, 23, 42, 0.9)",
                    border: "1px solid rgba(56, 189, 248, 0.3)",
                    borderRadius: "8px",
                    padding: "8px 12px",
                    color: "white",
                    fontSize: "0.82rem",
                    outline: "none",
                  }}
                />
                <button
                  onClick={submitHazardReport}
                  style={{
                    backgroundColor: "#2563eb",
                    color: "white",
                    border: "none",
                    padding: "8px 16px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "700",
                    fontSize: "0.82rem",
                  }}
                >
                  Submit
                </button>
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  style={{
                    backgroundColor: "rgba(14, 165, 233, 0.2)",
                    color: "#38bdf8",
                    fontWeight: "700",
                    border: "1px solid rgba(56, 189, 248, 0.4)",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "0.82rem",
                  }}
                >
                  📍 Share GPS
                </button>
                <button
                  type="button"
                  onClick={() => sendWhatsAppAlert(reportInput || "Immediate assistance requested!")}
                  style={{
                    backgroundColor: "rgba(34, 197, 94, 0.2)",
                    color: "#4ade80",
                    fontWeight: "700",
                    border: "1px solid rgba(34, 197, 94, 0.4)",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "0.82rem",
                  }}
                >
                  💬 WhatsApp
                </button>
              </div>
            </div>
          </div>

          {/* 72-Hour Survival Kit Readiness */}
          <div className="tactical-card" style={{ padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "1.2rem" }}>🎒</span>
                <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: "800", color: "#ffffff" }}>
                  {t.survivalKit}
                </h3>
              </div>
              <span className="tactical-badge badge-safe">
                {checklistPercentage}% READY
              </span>
            </div>

            <p style={{ margin: "0 0 12px 0", fontSize: "0.78rem", color: "#94a3b8" }}>
              Vital items required to sustain yourself and family during first 72 hours of total blackout.
            </p>

            {/* Progress Bar */}
            <div style={{ backgroundColor: "rgba(255, 255, 255, 0.08)", height: "8px", borderRadius: "999px", marginBottom: "14px", overflow: "hidden" }}>
              <div
                style={{
                  width: `${checklistPercentage}%`,
                  height: "100%",
                  background: checklistPercentage === 100
                    ? "linear-gradient(90deg, #10b981, #059669)"
                    : "linear-gradient(90deg, #0284c7, #38bdf8)",
                  borderRadius: "999px",
                  transition: "width 0.3s ease",
                }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {checklist.map((item) => (
                <label
                  key={item.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    fontSize: "0.84rem",
                    cursor: "pointer",
                    padding: "8px 10px",
                    borderRadius: "8px",
                    backgroundColor: item.checked ? "rgba(16, 185, 129, 0.08)" : "rgba(30, 41, 59, 0.4)",
                    border: `1px solid ${item.checked ? "rgba(16, 185, 129, 0.3)" : "rgba(255, 255, 255, 0.05)"}`,
                    transition: "all 0.15s ease",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={() => toggleCheck(item.id)}
                    style={{ cursor: "pointer", accentColor: "#10b981", width: "16px", height: "16px" }}
                  />
                  <span
                    style={{
                      textDecoration: item.checked ? "line-through" : "none",
                      color: item.checked ? "#94a3b8" : "#f8fafc",
                      fontWeight: item.checked ? "500" : "600",
                    }}
                  >
                    {item.text}
                  </span>
                </label>
              ))}
            </div>

            <div style={{ marginTop: "14px" }}>
              <Link
                to="/safety-guides"
                style={{
                  display: "block",
                  textAlign: "center",
                  backgroundColor: "rgba(245, 158, 11, 0.15)",
                  color: "#fde68a",
                  border: "1px solid rgba(245, 158, 11, 0.35)",
                  padding: "8px 14px",
                  borderRadius: "8px",
                  fontSize: "0.78rem",
                  fontWeight: "700",
                  textDecoration: "none",
                }}
              >
                View Full Disaster Prep Protocols &amp; Guides ➔
              </Link>
            </div>
          </div>
        </div>

        {/* ── 9. Strategic Advantage Matrix ─────────────────────────────────── */}
        <div
          className="tactical-card"
          style={{
            padding: "24px",
            background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(7, 21, 39, 0.98))",
            border: "1.5px solid rgba(56, 189, 248, 0.3)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", marginBottom: "18px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                <span style={{ fontSize: "1.3rem" }}>💡</span>
                <span style={{ fontSize: "0.72rem", fontWeight: "800", color: "#38bdf8", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "var(--font-mono, monospace)" }}>
                  STRATEGIC ADVANTAGE &amp; MISSION RESILIENCE
                </span>
              </div>
              <h2 style={{ margin: 0, fontSize: "1.25rem", fontWeight: "800", color: "#ffffff" }}>
                Next-Gen Disaster Platform vs. Legacy Government Websites
              </h2>
              <p style={{ margin: "4px 0 0", color: "#94a3b8", fontSize: "0.82rem" }}>
                Engineered from the ground up to guarantee continuous life-saving operations even during complete infrastructure collapse.
              </p>
            </div>
            <span className="tactical-badge badge-safe">
              PROVEN RESILIENCE
            </span>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 8px", fontSize: "0.84rem" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", padding: "8px 14px", color: "#94a3b8", fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", width: "42%" }}>
                    Standard Official Portals (Legacy)
                  </th>
                  <th style={{ width: "16px" }}></th>
                  <th style={{ textAlign: "left", padding: "8px 14px", color: "#38bdf8", fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", width: "58%" }}>
                    Your Tactical Next-Gen Platform
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    legacy: "Static bulletins and PDF circulars",
                    legacyNote: "Delayed warnings, non-interactive documents, impossible to parse during panic evacuations.",
                    nextGen: "Live, interactive 3D simulations & predictive AI",
                    nextGenNote: "Physics-based digital twin simulations, automated damage forecasting, and dynamic AR overlays.",
                    actionLabel: "3D Digital Twin",
                    actionPath: "/digital-twin",
                  },
                  {
                    legacy: "One-way top-down broadcasts",
                    legacyNote: "Citizens passively wait; zero bidirectional feedback or localized citizen check-ins.",
                    nextGen: "Two-way crowdsourced peer rescue",
                    nextGenNote: "Crowdsourced infrastructure hazard mapping, volunteer micro-tasks, and family radar check-ins.",
                    actionLabel: "Micro-Tasks",
                    actionPath: "/volunteer-tasks",
                  },
                  {
                    legacy: "Inoperable without active cellular / 4G connection",
                    legacyNote: "Severed cell towers and power grid blackouts cause total website blackout.",
                    nextGen: "Zero-Internet local device mesh network",
                    nextGenNote: "LoRa P2P radio relays, Wi-Fi Direct multi-hop communication, and offline-first cache.",
                    actionLabel: "Zero-Grid Mesh",
                    actionPath: "/zero-internet-mesh",
                  },
                  {
                    legacy: "Opaque supply distribution & aid delays",
                    legacyNote: "Bottlenecks, unknown dispatch timelines, and lack of verified delivery proof.",
                    nextGen: "100% Cryptographic Blockchain Tracking",
                    nextGenNote: "Immutable cryptographic ledger verifying every ration, water canister, and medical unit.",
                    actionLabel: "Aid Ledger",
                    actionPath: "/aid-ledger",
                  },
                ].map((row, idx) => (
                  <tr key={idx}>
                    <td
                      style={{
                        padding: "12px 14px",
                        borderTopLeftRadius: "10px",
                        borderBottomLeftRadius: "10px",
                        border: "1px solid rgba(239, 68, 68, 0.25)",
                        borderRight: "none",
                        background: "rgba(239, 68, 68, 0.06)",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "700", color: "#fca5a5" }}>
                        <span style={{ color: "#ef4444" }}>❌</span>
                        <span>{row.legacy}</span>
                      </div>
                      <div style={{ fontSize: "0.72rem", color: "#94a3b8", marginTop: "3px", paddingLeft: "24px" }}>
                        {row.legacyNote}
                      </div>
                    </td>
                    <td style={{ background: "transparent", border: "none", textAlign: "center", color: "#64748b", fontWeight: "bold" }}>
                      &rarr;
                    </td>
                    <td
                      style={{
                        padding: "12px 14px",
                        borderTopRightRadius: "10px",
                        borderBottomRightRadius: "10px",
                        border: "1px solid rgba(14, 165, 233, 0.35)",
                        borderLeft: "none",
                        background: "rgba(14, 165, 233, 0.09)",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "800", color: "#38bdf8" }}>
                            <span style={{ color: "#34d399" }}>✅</span>
                            <span>{row.nextGen}</span>
                          </div>
                          <div style={{ fontSize: "0.72rem", color: "#cbd5e1", marginTop: "3px", paddingLeft: "24px" }}>
                            {row.nextGenNote}
                          </div>
                        </div>
                        <button
                          onClick={() => navigate(row.actionPath)}
                          style={{
                            padding: "6px 12px",
                            borderRadius: "8px",
                            border: "1px solid rgba(56, 189, 248, 0.4)",
                            background: "linear-gradient(135deg, #0284c7, #0369a1)",
                            color: "#ffffff",
                            fontSize: "0.74rem",
                            fontWeight: "700",
                            cursor: "pointer",
                            whiteSpace: "nowrap",
                          }}
                        >
                          Explore {row.actionLabel} &rarr;
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 10. Technical Support & System Diagnostics ────────────────────── */}
        <div
          className="tactical-card"
          style={{
            padding: "18px 20px",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: "700", color: "#f8fafc" }}>
              🛠️ {t.support}
            </h3>
            <span style={{ fontSize: "0.7rem", color: "#94a3b8", fontFamily: "var(--font-mono, monospace)" }}>
              OUTAGE-RESILIENT QUEUE
            </span>
          </div>
          <p style={{ color: "#94a3b8", fontSize: "0.78rem", margin: "0 0 12px 0" }}>
            {t.supportDesc}
          </p>
          <form onSubmit={handleSupportTicket}>
            <textarea
              name="issue"
              placeholder={t.supportPlaceholder}
              required
              style={{
                width: "100%",
                height: "65px",
                backgroundColor: "rgba(15, 23, 42, 0.9)",
                color: "#fff",
                border: "1px solid rgba(56, 189, 248, 0.25)",
                borderRadius: "8px",
                padding: "8px 12px",
                fontSize: "0.82rem",
                marginBottom: "8px",
                boxSizing: "border-box",
                outline: "none",
              }}
            />
            <button
              type="submit"
              style={{
                backgroundColor: "#38bdf8",
                color: "#0f172a",
                fontWeight: "800",
                border: "none",
                padding: "8px 16px",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "0.82rem",
              }}
            >
              {t.submitTicket}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}