import React, { Suspense, lazy, useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";
import DashboardLayout from "./components/DashboardLayout";
import SplashScreen from "./components/SplashScreen";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import ApprovedMemberProtectedRoute from "./components/ApprovedMemberProtectedRoute";
import { syncPhoneKeysFromProfile } from "./utils/phoneUtils";
import { LanguageProvider } from "./i18n/LanguageContext";
import { initDevToolsGuard } from "./utils/devToolsGuard";

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
const NERTopographySuite = lazy(() => import("./pages/NERTopographySuite"));
const WorldFirstInnovationsSuite = lazy(() => import("./pages/WorldFirstInnovationsSuite"));
const HyperSpeedRescueSuite = lazy(() => import("./pages/HyperSpeedRescueSuite"));
const DecentralizedResilienceSuite = lazy(() => import("./pages/DecentralizedResilienceSuite"));
const ExtremeResilienceSuite = lazy(() => import("./pages/ExtremeResilienceSuite"));
const ARSeeTheRisk = lazy(() => import("./pages/ARSeeTheRisk"));
const AdministratorHub = lazy(() => import("./pages/AdministratorHub"));
const FAQ = lazy(() => import("./pages/FAQ"));
const UserReview = lazy(() => import("./pages/UserReview"));
const MeshConsole = lazy(() => import("./pages/MeshConsole"));
// ── New Hyper-Platform Features ─────────────────────────────────────────
const DigitalTwinSimulation    = lazy(() => import("./pages/DigitalTwinSimulation"));
const VulnerabilityMap         = lazy(() => import("./pages/VulnerabilityMap"));
const SmartAlerts              = lazy(() => import("./pages/SmartAlerts"));
const SafeZoneTracker          = lazy(() => import("./pages/SafeZoneTracker"));
const DynamicEvacuationRouter  = lazy(() => import("./pages/DynamicEvacuationRouter"));
const MicroTasking             = lazy(() => import("./pages/MicroTasking"));
const AidLedger                = lazy(() => import("./pages/AidLedger"));
const ReconstructionMap        = lazy(() => import("./pages/ReconstructionMap"));
const ZeroInternetMesh         = lazy(() => import("./pages/ZeroInternetMesh"));
const DroneVideoAnalytics      = lazy(() => import("./pages/DroneVideoAnalytics"));
const LiveReliefTracker        = lazy(() => import("./pages/LiveReliefTracker"));
const LowBandwidthPortal       = lazy(() => import("./pages/LowBandwidthPortal"));
import { LowBandwidthProvider } from "./utils/LowBandwidthContext";

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

  // Initialize DevTools protection (blocks inspect for non-admin users)
  useEffect(() => {
    const cleanup = initDevToolsGuard();
    return cleanup;
  }, []);

  return (
    <ErrorBoundary>
      <LanguageProvider>
      <LowBandwidthProvider>
      {!splashDone && <SplashScreen onComplete={() => setSplashDone(true)} />}
      <BrowserRouter>

      <Suspense fallback={<Loading />}>

        <Routes>

          {/* ULTRA-LOW BANDWIDTH 2G MODE — ZERO HEAVY LAYOUT OVERHEAD */}
          <Route path="/low-bandwidth" element={<LowBandwidthPortal />} />

          {/* AUTH */}
          <Route path="/login" element={<Login />} />

          <Route path="/register" element={<Register />} />

          {/* ADMIN — must be BEFORE wildcard */}
          <Route path="/admin/tickets" element={<AdminTickets />} />

          {/* MAIN PLATFORM */}
          <Route element={<DashboardLayout />}>

            <Route path="/" element={<Dashboard />} />

            {/* Administrator Hub — locked to Head Admin + explicitly authorized admins ONLY */}
            <Route
              path="/administrator"
              element={
                <AdminProtectedRoute>
                  <AdministratorHub />
                </AdminProtectedRoute>
              }
            />
            <Route path="/admin" element={<Navigate to="/administrator" replace />} />

            {/* ── Tactical Command Intelligence (Admin & Approved Members Only) ── */}
            <Route path="/ner-landslide-monitor" element={<NERLandslideMonitor />} />
            <Route
              path="/ner-topography-suite"
              element={
                <ApprovedMemberProtectedRoute featureName="NER Topography Command Suite">
                  <NERTopographySuite />
                </ApprovedMemberProtectedRoute>
              }
            />
            <Route path="/ner-killer-features" element={<Navigate to="/ner-topography-suite" replace />} />
            <Route
              path="/world-first-innovations"
              element={
                <ApprovedMemberProtectedRoute featureName="World-First Deep Tech Suite">
                  <WorldFirstInnovationsSuite />
                </ApprovedMemberProtectedRoute>
              }
            />
            <Route path="/deep-tech-suite" element={<Navigate to="/world-first-innovations" replace />} />
            <Route path="/magnetometer-rubble-locator" element={<Navigate to="/world-first-innovations?tab=magnetometer" replace />} />
            <Route path="/magnetometer-locator" element={<Navigate to="/world-first-innovations?tab=magnetometer" replace />} />
            <Route path="/thermoelectric-thermal-tap" element={<Navigate to="/world-first-innovations?tab=thermal-tap" replace />} />
            <Route path="/thermal-tap" element={<Navigate to="/world-first-innovations?tab=thermal-tap" replace />} />
            <Route path="/barometric-flash-flood" element={<Navigate to="/world-first-innovations?tab=barometric" replace />} />
            <Route path="/barometric-flood" element={<Navigate to="/world-first-innovations?tab=barometric" replace />} />
            <Route path="/quantum-gossip-routing" element={<Navigate to="/world-first-innovations?tab=quantum-gossip" replace />} />
            <Route path="/quantum-gossip" element={<Navigate to="/world-first-innovations?tab=quantum-gossip" replace />} />
            <Route path="/sound-wave-chirp" element={<Navigate to="/world-first-innovations" replace />} />
            <Route path="/reverse-gps-radio" element={<Navigate to="/world-first-innovations" replace />} />
            <Route path="/citizen-vitals-triage" element={<Navigate to="/world-first-innovations" replace />} />
            <Route path="/mudslide-fluid-dynamics" element={<Navigate to="/world-first-innovations" replace />} />
            <Route path="/living-infrastructure-ledger" element={<Navigate to="/world-first-innovations" replace />} />
            <Route
              path="/hyper-speed-rescue"
              element={
                <ApprovedMemberProtectedRoute featureName="Hyper-Speed Rescue Suite">
                  <HyperSpeedRescueSuite />
                </ApprovedMemberProtectedRoute>
              }
            />
            <Route path="/future-rescue-tech" element={<Navigate to="/hyper-speed-rescue" replace />} />
            <Route path="/drone-swarm-dispatch" element={<Navigate to="/hyper-speed-rescue" replace />} />
            <Route path="/rescue-ar-hud" element={<Navigate to="/hyper-speed-rescue" replace />} />
            <Route path="/acoustic-scream-triangulation" element={<Navigate to="/hyper-speed-rescue" replace />} />
            <Route path="/leo-satellite-bridge" element={<Navigate to="/hyper-speed-rescue" replace />} />
            <Route path="/pre-deployment-engine" element={<Navigate to="/hyper-speed-rescue" replace />} />
            <Route
              path="/decentralized-resilience"
              element={
                <ApprovedMemberProtectedRoute featureName="Decentralized Resilience Suite">
                  <DecentralizedResilienceSuite />
                </ApprovedMemberProtectedRoute>
              }
            />
            <Route path="/ultrasonic-mesh-relay" element={<Navigate to="/decentralized-resilience" replace />} />
            <Route path="/radio-triangulation" element={<Navigate to="/decentralized-resilience" replace />} />
            <Route path="/triage-heatmaps" element={<Navigate to="/decentralized-resilience" replace />} />
            <Route path="/ipfs-mirroring" element={<Navigate to="/decentralized-resilience" replace />} />
            <Route path="/sar-render-engine" element={<Navigate to="/decentralized-resilience" replace />} />
            <Route
              path="/extreme-resilience"
              element={
                <ApprovedMemberProtectedRoute featureName="Extreme Resilience Grid">
                  <ExtremeResilienceSuite />
                </ApprovedMemberProtectedRoute>
              }
            />
            <Route path="/wasm-supercomputer" element={<Navigate to="/extreme-resilience" replace />} />
            <Route path="/e-ink-canvas" element={<Navigate to="/extreme-resilience" replace />} />
            <Route path="/nfc-relief-lockers" element={<Navigate to="/extreme-resilience" replace />} />
            <Route path="/lifi-optical-receiver" element={<Navigate to="/extreme-resilience" replace />} />
            <Route
              path="/ar-see-the-risk"
              element={
                <ApprovedMemberProtectedRoute featureName="AR See the Risk">
                  <ARSeeTheRisk />
                </ApprovedMemberProtectedRoute>
              }
            />
            <Route path="/ar-risk" element={<Navigate to="/ar-see-the-risk" replace />} />
            <Route path="/see-the-risk" element={<Navigate to="/ar-see-the-risk" replace />} />
            <Route path="/ar-slope-scanner" element={<Navigate to="/ar-see-the-risk" replace />} />

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
            <Route path="/faq" element={<FAQ />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/reviews" element={<UserReview />} />
            <Route path="/mesh-console" element={<MeshConsole />} />

            {/* ── Before the Disaster (Admin & Approved Members Only) ── */}
            <Route
              path="/digital-twin"
              element={
                <ApprovedMemberProtectedRoute featureName="AI Digital Twin 3D Simulation">
                  <DigitalTwinSimulation />
                </ApprovedMemberProtectedRoute>
              }
            />
            <Route
              path="/vulnerability-map"
              element={
                <ApprovedMemberProtectedRoute featureName="Infrastructure Vulnerability Heatmap">
                  <VulnerabilityMap />
                </ApprovedMemberProtectedRoute>
              }
            />
            <Route
              path="/smart-alerts"
              element={
                <ApprovedMemberProtectedRoute featureName="Multi-Sensory Decentralized Alerts">
                  <SmartAlerts />
                </ApprovedMemberProtectedRoute>
              }
            />

            {/* ── During the Disaster (Admin & Approved Members Only) ── */}
            <Route
              path="/zero-internet-mesh"
              element={
                <ApprovedMemberProtectedRoute featureName="Zero-Internet P2P Mesh Protocol">
                  <ZeroInternetMesh />
                </ApprovedMemberProtectedRoute>
              }
            />
            <Route
              path="/safe-zones"
              element={
                <ApprovedMemberProtectedRoute featureName="Autonomous Safe Zone Tracker">
                  <SafeZoneTracker />
                </ApprovedMemberProtectedRoute>
              }
            />
            <Route
              path="/dynamic-evacuation"
              element={
                <ApprovedMemberProtectedRoute featureName="Anti-Herd Dynamic Evacuation Router">
                  <DynamicEvacuationRouter />
                </ApprovedMemberProtectedRoute>
              }
            />
            <Route
              path="/drone-analytics"
              element={
                <ApprovedMemberProtectedRoute featureName="Live Drone Video Analytics">
                  <DroneVideoAnalytics />
                </ApprovedMemberProtectedRoute>
              }
            />
            <Route
              path="/relief-tracker"
              element={
                <ApprovedMemberProtectedRoute featureName="Live Relief Tracker & Blockchain Ledger">
                  <LiveReliefTracker />
                </ApprovedMemberProtectedRoute>
              }
            />

            {/* ── After the Disaster (Admin & Approved Members Only) ── */}
            <Route
              path="/volunteer-tasks"
              element={
                <ApprovedMemberProtectedRoute featureName="Decentralized Volunteer Micro-Tasking">
                  <MicroTasking />
                </ApprovedMemberProtectedRoute>
              }
            />
            <Route
              path="/aid-ledger"
              element={
                <ApprovedMemberProtectedRoute featureName="Blockchain Aid Distribution Ledger">
                  <AidLedger />
                </ApprovedMemberProtectedRoute>
              }
            />
            <Route
              path="/reconstruction"
              element={
                <ApprovedMemberProtectedRoute featureName="Community Reconstruction Map">
                  <ReconstructionMap />
                </ApprovedMemberProtectedRoute>
              }
            />

          </Route>

          {/* CATCH-ALL — must be LAST */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>

      </Suspense>

    </BrowserRouter>
    </LowBandwidthProvider>
    </LanguageProvider>
    </ErrorBoundary>
  );
}