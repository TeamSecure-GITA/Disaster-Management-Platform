import React, { Suspense, lazy, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";
import DashboardLayout from "./components/DashboardLayout";
import SplashScreen from "./components/SplashScreen";
import { syncPhoneKeysFromProfile } from "./utils/phoneUtils";

// On every page load, re-sync phone localStorage keys from user profile.
// This guarantees WhatsApp SOS works correctly after page refresh / re-login.
try { syncPhoneKeysFromProfile(); } catch {}
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Alerts = lazy(() => import("./pages/Alerts"));
const Map = lazy(() => import("./pages/Map"));
const RescueCenters = lazy(() => import("./pages/Rescue"));
const ShelterFinder = lazy(() => import("./pages/ShelterFinder"));
const FamilySafety = lazy(() => import("./pages/FamilySafety"));
const EvacuationPlanner = lazy(() => import("./pages/EvacuationPlanner"));
const QRRescueID = lazy(() => import("./pages/RescueID"));
const Notifications = lazy(() => import("./pages/Notifications"));
const AIAssistant = lazy(() => import("./pages/Chatbot"));
const VoiceAssistant = lazy(() => import("./pages/VoiceAssistant"));
const DamageAssessment = lazy(() => import("./pages/DamageAssessment"));
const Analytics = lazy(() => import("./pages/Analytics"));
const SafetyGuides = lazy(() => import("./pages/SafetyGuides"));
const Statistics = lazy(() => import("./pages/Statistics"));
const IncidentReport = lazy(() => import("./pages/IncidentReport"));
const Profile = lazy(() => import("./pages/Profile"));
const Settings = lazy(() => import("./pages/Settings"));
const SOSCenter = lazy(() => import("./pages/SOSCenter"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const AdminTickets = lazy(() => import("./pages/AdminTickets"));
const ClimateChronicle = lazy(() => import("./pages/ClimateChronicle"));
const NERLandslideMonitor = lazy(() => import("./pages/NERLandslideMonitor"));
const AdministratorHub = lazy(() => import("./pages/AdministratorHub"));

function Loading() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#020617", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <img
          src="/logo.png"
          alt="Loading..."
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            marginBottom: "14px",
            boxShadow: "0 0 25px rgba(56, 189, 248, 0.4)",
            border: "1.5px solid rgba(56, 189, 248, 0.5)",
          }}
        />
        <p style={{ color: "#60a5fa", fontSize: "1rem" }}>Loading...</p>
      </div>
    </div>
  );
}

export default function App() {
  const [splashDone, setSplashDone] = useState(false);

  return (
    <ErrorBoundary>
      {!splashDone && <SplashScreen onComplete={() => setSplashDone(true)} />}
      <BrowserRouter>

      <Suspense fallback={<Loading />}>

        <Routes>

          {/* AUTH */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* ADMIN — must be BEFORE wildcard */}
          <Route path="/admin/tickets" element={<AdminTickets />} />

          {/* MAIN PLATFORM */}
          <Route element={<DashboardLayout />}>

            <Route path="/" element={<Dashboard />} />

            {/* Administrator Hub — visible/accessible only to Debasish & authorized admins */}
            <Route path="/administrator" element={<AdministratorHub />} />
            <Route path="/admin" element={<Navigate to="/administrator" replace />} />

            <Route path="/ner-landslide-monitor" element={<NERLandslideMonitor />} />
            <Route path="/landslide-monitor" element={<Navigate to="/ner-landslide-monitor" replace />} />

            <Route path="/alerts" element={<Alerts />} />

            {/* Single consolidated Map route */}
            <Route path="/map" element={<Map />} />
            <Route path="/disaster-response-map" element={<Navigate to="/map" replace />} />

            <Route path="/emergency-sos" element={<SOSCenter />} />
            <Route path="/rescue-centers" element={<RescueCenters />} />
            <Route path="/shelter-finder" element={<ShelterFinder />} />
            <Route path="/family-safety" element={<FamilySafety />} />
            <Route path="/evacuation-planner" element={<EvacuationPlanner />} />

            {/* QR Rescue ID — both route names */}
            <Route path="/qr-rescue-id" element={<QRRescueID />} />
            <Route path="/rescue-id" element={<QRRescueID />} />

            <Route path="/notifications" element={<Notifications />} />

            {/* Chatbot — both route names */}
            <Route path="/ai-assistant" element={<AIAssistant />} />
            <Route path="/chatbot" element={<AIAssistant />} />

            <Route path="/voice-assistant" element={<VoiceAssistant />} />
            <Route path="/damage-assessment" element={<DamageAssessment />} />

            {/* Analytics — both route names */}
            <Route path="/analytics-reports" element={<Analytics />} />
            <Route path="/analytics" element={<Analytics />} />

            <Route path="/safety-guides" element={<SafetyGuides />} />
            <Route path="/climate-chronicle" element={<ClimateChronicle />} />
            <Route path="/statistics" element={<Statistics />} />
            <Route path="/incident-report" element={<IncidentReport />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />

          </Route>

          {/* CATCH-ALL — must be LAST */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>

      </Suspense>

    </BrowserRouter>
    </ErrorBoundary>
  );
}