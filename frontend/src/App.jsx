import React, { Suspense, lazy } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";
import DashboardLayout from "./components/DashboardLayout";
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
const DisasterResponseMap = lazy(() => import("./pages/Map"));
const IncidentReport = lazy(() => import("./pages/IncidentReport"));
const Profile = lazy(() => import("./pages/Profile"));
const Settings = lazy(() => import("./pages/Settings"));
const SOSCenter = lazy(() => import("./pages/SOSCenter"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const AdminTickets = lazy(() => import("./pages/AdminTickets"));

function Loading() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-3">🛡️</div>
        <p className="text-blue-400">Loading...</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
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

            <Route path="/alerts" element={<Alerts />} />

            {/* Map — two route names for compatibility */}
            <Route path="/map" element={<Map />} />
            <Route path="/disaster-response-map" element={<DisasterResponseMap />} />

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