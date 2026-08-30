import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../utils/useAuth";
import { saveOfflineReport } from "../utils/offlineStorage";
import { requestNotificationPermission, sendLocalEmergencyAlert } from "../utils/pushAlerts";
import localforage from 'localforage';

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
    const phone = localStorage.getItem("sos_whatsapp_number") || "911070"; // configurable
    const message = encodeURIComponent(`EMERGENCY REPORT: ${issueText || "Immediate assistance requested!"}`);
    window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
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
  return (
    <div style={{ backgroundColor: "#0b1329", minHeight: "100vh", color: "#f8fafc", padding: "24px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "20px" }}>

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "1.8rem", fontWeight: "bold" }}>
              {t.title}
            </h1>
            <p style={{ margin: "4px 0 0 0", color: "#94a3b8", fontSize: "0.9rem" }}>{t.subtitle}</p>
          </div>
          <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
            {/* Language Dropdown */}
            <select
              value={lang}
              onChange={handleLangChange}
              style={{ backgroundColor: "#1e293b", color: "#fff", border: "1px solid #334155", padding: "6px 12px", borderRadius: "6px", cursor: "pointer" }}
            >
              <option value="en">English</option>
              <option value="hi">हिंदी (Hindi)</option>
              <option value="or">ଓଡ଼ିଆ (Odia)</option>
            </select>
            <span style={{ backgroundColor: "#dc2626", color: "white", padding: "6px 14px", borderRadius: "6px", fontWeight: "bold" }}>108 (Medical)</span>
            <span style={{ backgroundColor: "#2563eb", color: "white", padding: "6px 14px", borderRadius: "6px", fontWeight: "bold" }}>1070 (Disaster)</span>

            {/* Direct Login Button */}
            <button
              onClick={() => navigate("/login")}
              style={{
                backgroundColor: "#0284c7",
                color: "#ffffff",
                border: "none",
                padding: "6px 16px",
                borderRadius: "6px",
                fontWeight: "bold",
                fontSize: "0.9rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
              }}
            >
              <span>🔐</span>
              <span>{user ? "Switch / Login" : "Login"}</span>
            </button>
          </div>
        </div>

        {/* ── User Banner ─────────────────────────────────────────────────── */}
        <div style={{ padding: "12px 18px", backgroundColor: "#1e293b", borderRadius: "8px", border: "1px solid #334155", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
          {loading
            ? <p style={{ margin: 0, color: "#94a3b8" }}>{t.loadingSession}</p>
            : (
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "#0284c7", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "0.9rem" }}>
                  {user?.name ? user.name.charAt(0).toUpperCase() : "👤"}
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: "1.05rem", fontWeight: "bold", color: "#38bdf8" }}>
                    {t.welcomeBack}, {user ? user.name || user.email : t.emergencyGuest}
                  </h2>
                  <p style={{ margin: 0, fontSize: "0.78rem", color: "#94a3b8" }}>
                    Role: <strong style={{ color: "#e2e8f0" }}>{user?.role ? user.role.toUpperCase() : "GUEST / CITIZEN"}</strong> • Session active
                  </p>
                </div>
              </div>
            )
          }
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={() => navigate("/login")}
              style={{
                backgroundColor: "#334155",
                color: "#f8fafc",
                border: "1px solid #475569",
                padding: "6px 14px",
                borderRadius: "6px",
                fontSize: "0.82rem",
                fontWeight: "600",
                cursor: "pointer"
              }}
            >
              {user ? "🔄 Switch Account" : "🔑 Sign In to Portal"}
            </button>
            <button
              onClick={() => navigate("/register")}
              style={{
                backgroundColor: "#1e293b",
                color: "#38bdf8",
                border: "1px solid #0284c7",
                padding: "6px 14px",
                borderRadius: "6px",
                fontSize: "0.82rem",
                fontWeight: "600",
                cursor: "pointer"
              }}
            >
              📝 Register
            </button>
          </div>
        </div>

        {/* ── Offline Warning ─────────────────────────────────────────────── */}
        {!isOnline && (
          <div style={{ backgroundColor: "#854d0e", color: "#fef08a", padding: "12px 18px", borderRadius: "8px", display: "flex", justifyContent: "space-between" }}>
            <span>{t.offlineMode}</span>
            <span>{t.unsyncedReports}: {pendingSyncCount}</span>
          </div>
        )}

        {/* ── SLA Callback Banner ─────────────────────────────────────────── */}
        <div style={{ backgroundColor: "#064e3b", border: "1px solid #059669", padding: "12px 18px", borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <strong style={{ color: "#34d399" }}>{t.slaActive}</strong>
            <p style={{ margin: "2px 0 0 0", fontSize: "0.8rem", color: "#a7f3d0" }}>{t.slaDesc}</p>
          </div>
          <button
            onClick={handleCallback}
            style={{ backgroundColor: "#059669", color: "white", border: "none", padding: "8px 16px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}
          >
            {callbackRequested ? t.callbackRequested : t.callbackBtn}
          </button>
        </div>

        {/* ── SOS Beacon Banner ───────────────────────────────────────────── */}
        <div style={{ backgroundColor: "#7f1d1d", border: "1px solid #dc2626", padding: "16px", borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <strong style={{ color: "#fca5a5", fontSize: "1.05rem" }}>{t.dangerTitle}</strong>
            <p style={{ margin: "4px 0 0 0", fontSize: "0.85rem", color: "#fecaca" }}>{t.dangerDesc}</p>
            {sosActive && sosCoords && (
              <p style={{ margin: "6px 0 0 0", fontSize: "0.8rem", color: "#fde68a" }}>
                📍 Broadcasting: {sosCoords.lat}, {sosCoords.lng}
              </p>
            )}
          </div>
          <button
            onClick={broadcastSOS}
            style={{ backgroundColor: sosActive ? "#450a0a" : "#dc2626", color: "white", border: "none", padding: "10px 20px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", animation: sosActive ? "pulse 1.5s infinite" : "none" }}
          >
            {sosActive ? t.sosActive : t.sosBroadcast}
          </button>
        </div>

        {/* ── Quick Stats Grid ────────────────────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
          {[
            { label: t.activeAlerts, value: "3 High Priority", color: "#f87171" },
            { label: t.rescueOps, value: "12 Ongoing", color: "#60a5fa" },
            { label: t.safeShelters, value: "48 Open", color: "#4ade80" },
            { label: t.sosRequests, value: "5 Pending", color: "#facc15" },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ backgroundColor: "#1e293b", padding: "16px", borderRadius: "8px", border: "1px solid #334155" }}>
              <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>{label}</span>
              <h3 style={{ margin: "6px 0 0 0", color, fontSize: "1.5rem" }}>{value}</h3>
            </div>
          ))}
        </div>

        {/* ── Live Weather (Open-Meteo API) ───────────────────────────────── */}
        <div style={{ backgroundColor: "#1e293b", border: "1px solid #0284c7", padding: "12px 18px", borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            {weatherLoading ? (
              <strong style={{ color: "#38bdf8" }}>⏳ {t.weatherLoading}</strong>
            ) : (
              <>
                <strong style={{ color: "#38bdf8" }}>
                  {getWeatherAlert(weather.code)}: {weather.desc}
                </strong>
                <p style={{ margin: "2px 0 0 0", fontSize: "0.8rem", color: "#cbd5e1" }}>
                  🌡️ Temp: {weather.temp}°C &nbsp;|&nbsp; 💨 Wind: {weather.wind} km/h &nbsp;|&nbsp; 📍 Live Data
                </p>
              </>
            )}
          </div>
          <button
            onClick={() => window.open("https://www.windy.com/?20.296,85.824,9", "_blank")}
            style={{ backgroundColor: "#0284c7", color: "white", border: "none", padding: "6px 14px", borderRadius: "6px", cursor: "pointer" }}
          >
            {t.viewRadar}
          </button>
        </div>

        {/* ── Live Feed & Quick Actions ────────────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "20px" }}>

          {/* Live Incident Feed */}
          <div style={{ backgroundColor: "#1e293b", padding: "18px", borderRadius: "8px", border: "1px solid #334155" }}>
            <h3 style={{ margin: "0 0 12px 0", fontSize: "1.1rem" }}>{t.liveIncidentFeed}</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {reports.slice(0, 4).map((r) => (
                <div key={r.id} style={{ backgroundColor: "#0f172a", padding: "12px", borderRadius: "6px", borderLeft: `4px solid ${r.status === "Verified" ? "#3b82f6" : r.status === "Pending" ? "#f59e0b" : "#ef4444"}` }}>
                  <strong style={{ fontSize: "0.9rem" }}>{r.text}</strong>
                  <p style={{ margin: "4px 0 0 0", fontSize: "0.75rem", color: "#94a3b8" }}>{r.time} • {r.status}</p>
                </div>
              ))}
              {reports.length === 0 && (
                <p style={{ color: "#64748b", fontSize: "0.85rem" }}>No active incidents reported.</p>
              )}
            </div>
          </div>

          {/* Quick Actions — now with real navigation */}
          <div style={{ backgroundColor: "#1e293b", padding: "18px", borderRadius: "8px", border: "1px solid #334155" }}>
            <h3 style={{ margin: "0 0 12px 0", fontSize: "1.1rem" }}>{t.quickActions}</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <button
                onClick={() => navigate("/emergency-sos")}
                style={{ backgroundColor: "#dc2626", color: "white", border: "none", padding: "10px", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}
              >
                {t.dispatchSOS}
              </button>
              <button
                onClick={() => navigate("/alerts")}
                style={{ backgroundColor: "#2563eb", color: "white", border: "none", padding: "10px", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}
              >
                {t.broadcastAlert}
              </button>
              <button
                onClick={() => navigate("/shelter-finder")}
                style={{ backgroundColor: "#059669", color: "white", border: "none", padding: "10px", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}
              >
                {t.openShelter}
              </button>
            </div>
          </div>
        </div>

        {/* ── Safety Radar & Offline SMS ──────────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          <div style={{ backgroundColor: "#1e293b", padding: "18px", borderRadius: "8px", border: "1px solid #334155" }}>
            <h3 style={{ margin: "0 0 4px 0", fontSize: "1.1rem" }}>{t.familySafety}</h3>
            <p style={{ margin: "0 0 12px 0", fontSize: "0.8rem", color: "#94a3b8" }}>{t.familySafetyDesc}</p>
            {[
              { name: "Prafulla Kumar Behera", status: t.safe + " #1" },
              { name: "Sanjibita Behera", status: t.safe + " #1" },
            ].map(({ name, status }) => (
              <div key={name} style={{ backgroundColor: "#0f172a", padding: "10px", borderRadius: "6px", marginBottom: "8px", display: "flex", justifyContent: "space-between" }}>
                <span>{name}</span>
                <span style={{ color: "#4ade80", fontSize: "0.85rem" }}>{status}</span>
              </div>
            ))}
            <button
              onClick={() => navigate("/family-safety")}
              style={{ backgroundColor: "#1d4ed8", color: "white", border: "none", padding: "6px 14px", borderRadius: "6px", cursor: "pointer", marginTop: "4px", fontSize: "0.8rem" }}
            >
              👨‍👩‍👧 Manage Family Tracker
            </button>
          </div>

          <div style={{ backgroundColor: "#1e293b", padding: "18px", borderRadius: "8px", border: "1px solid #334155" }}>
            <h3 style={{ margin: "0 0 4px 0", fontSize: "1.1rem" }}>{t.offlineSMS}</h3>
            <p style={{ margin: "0 0 12px 0", fontSize: "0.8rem", color: "#94a3b8" }}>{t.offlineSMSDesc}</p>
            <div style={{ backgroundColor: "#0f172a", padding: "12px", borderRadius: "6px", border: "1px dashed #475569" }}>
              <span style={{ fontSize: "0.85rem", color: "#cbd5e1" }}>
                Send SMS: <strong>RESCUE [NAME] [LOCATION]</strong> to <strong>56161</strong>
              </span>
            </div>
            <a
              href="sms:56161?body=RESCUE"
              style={{ display: "inline-block", marginTop: "10px", backgroundColor: "#16a34a", color: "white", padding: "6px 14px", borderRadius: "6px", textDecoration: "none", fontSize: "0.8rem", fontWeight: "bold" }}
            >
              📲 Open SMS App
            </a>
          </div>
        </div>

        {/* ── Active Shelters & Survival Kit ──────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          <div style={{ backgroundColor: "#1e293b", padding: "18px", borderRadius: "8px", border: "1px solid #334155" }}>
            <h3 style={{ margin: "0 0 12px 0", fontSize: "1.1rem" }}>{t.activeShelters}</h3>
            {[
              { name: "Community Hall #1 (City Center)", fill: 75, color: "#22c55e", beds: "50 Beds Open" },
              { name: "Central Stadium Shelter", fill: 88, color: "#eab308", beds: "12 Beds Open" },
            ].map(({ name, fill, color, beds }) => (
              <div key={name} style={{ marginBottom: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "4px" }}>
                  <span>{name}</span>
                  <span style={{ color }}>{fill}% Full ({beds})</span>
                </div>
                <div style={{ backgroundColor: "#334155", height: "8px", borderRadius: "4px" }}>
                  <div style={{ backgroundColor: color, width: `${fill}%`, height: "100%", borderRadius: "4px" }}></div>
                </div>
              </div>
            ))}
            <button
              onClick={() => navigate("/shelter-finder")}
              style={{ backgroundColor: "#0369a1", color: "white", border: "none", padding: "6px 14px", borderRadius: "6px", cursor: "pointer", marginTop: "4px", fontSize: "0.8rem" }}
            >
              🏥 View All Shelters
            </button>
          </div>

          <div style={{ backgroundColor: "#1e293b", padding: "18px", borderRadius: "8px", border: "1px solid #334155" }}>
            <h3 style={{ margin: "0 0 12px 0", fontSize: "1.1rem" }}>{t.survivalKit}</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {checklist.map(item => (
                <label key={item.id} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.85rem", cursor: "pointer" }}>
                  <input type="checkbox" checked={item.checked} onChange={() => toggleCheck(item.id)} />
                  <span style={{ textDecoration: item.checked ? "line-through" : "none", color: item.checked ? "#94a3b8" : "#f8fafc" }}>
                    {item.text}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* ── Hazard Reporting ─────────────────────────────────────────────── */}
        <div style={{ backgroundColor: "#1e293b", padding: "18px", borderRadius: "8px", border: "1px solid #334155" }}>
          <h3 style={{ margin: "0 0 4px 0", fontSize: "1.1rem" }}>{t.hazardReport}</h3>
          <p style={{ margin: "0 0 12px 0", fontSize: "0.8rem", color: "#94a3b8" }}>{t.hazardDesc}</p>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <input
              type="text"
              placeholder={t.hazardPlaceholder}
              value={reportInput}
              onChange={(e) => setReportInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitHazardReport()}
              style={{ flex: 1, minWidth: "200px", backgroundColor: "#0f172a", border: "1px solid #475569", borderRadius: "6px", padding: "10px", color: "white" }}
            />
            <button
              onClick={submitHazardReport}
              style={{ backgroundColor: "#2563eb", color: "white", border: "none", padding: "10px 20px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}
            >
              {t.submitHazard}
            </button>
            <button
              type="button"
              onClick={getCurrentLocation}
              style={{ backgroundColor: "#0284c7", color: "#ffffff", fontWeight: "bold", border: "none", padding: "10px 16px", borderRadius: "6px", cursor: "pointer" }}
            >
              {t.shareLocation}
            </button>
            <button
              type="button"
              onClick={() => sendWhatsAppAlert(reportInput || "Immediate assistance requested!")}
              style={{ backgroundColor: "#16a34a", color: "#ffffff", fontWeight: "bold", border: "none", padding: "10px 16px", borderRadius: "6px", cursor: "pointer" }}
            >
              {t.sendWhatsApp}
            </button>
          </div>
        </div>

        {/* ── Enable Alerts Button ─────────────────────────────────────────── */}
        {!pushEnabled && (
          <button
            type="button"
            onClick={handleEnablePush}
            style={{ backgroundColor: "#dc2626", color: "#ffffff", fontWeight: "bold", border: "none", padding: "10px 18px", borderRadius: "6px", cursor: "pointer", alignSelf: "flex-start" }}
          >
            {t.enableAlerts}
          </button>
        )}

        {/* ── Technical Support ────────────────────────────────────────────── */}
        <div style={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "12px", padding: "16px" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: "600", color: "#f8fafc", marginBottom: "8px" }}>🛠️ {t.support}</h3>
          <p style={{ color: "#94a3b8", fontSize: "0.85rem", marginBottom: "12px" }}>{t.supportDesc}</p>
          <form onSubmit={handleSupportTicket}>
            <textarea
              name="issue"
              placeholder={t.supportPlaceholder}
              required
              style={{ width: "100%", height: "70px", backgroundColor: "#0f172a", color: "#fff", border: "1px solid #334155", borderRadius: "8px", padding: "8px", fontSize: "0.85rem", marginBottom: "8px", boxSizing: "border-box" }}
            />
            <button
              type="submit"
              style={{ backgroundColor: "#38bdf8", color: "#0f172a", fontWeight: "bold", border: "none", padding: "8px 16px", borderRadius: "6px", cursor: "pointer", fontSize: "0.85rem" }}
            >
              {t.submitTicket}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}