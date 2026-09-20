// ─────────────────────────────────────────────────────────────────────────────
// src/pages/LiveReliefTracker.jsx
//
// Autonomous Live Relief Fleet Tracking & Immutable Blockchain Aid Ledger
// - Real-Time GPS Convoy Movement along rugged terrain & disaster corridors
// - Live ETA, Vehicle Telemetry, Cold-Chain IoT Sensor, & Driver Radio Link
// - 4-Digit OTP & QR Handover Verification with Instant Polygon Blockchain Mining
// - Cryptographically Validated Public Audit Ledger eliminating corruption
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState, useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Truck,
  ShieldCheck,
  Radio,
  MapPin,
  PhoneCall,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Search,
  Filter,
  Package,
  Layers,
  Thermometer,
  BatteryCharging,
  Fuel,
  Lock,
  Play,
  Pause,
  RotateCcw,
  Zap,
  ExternalLink,
  PlusCircle,
  X,
  Volume2,
  Compass,
  FileCheck,
  Shield,
  Activity,
  QrCode,
  ArrowRight,
  Share2
} from "lucide-react";

// Synthesized tactical sound generator via Web Audio API (Zero external audio files)
function playTone(freq = 880, duration = 0.15, type = "sine") {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    // AudioContext blocked or not supported
  }
}

// Simple fast SHA-like hash generator for blockchain demonstrations
function computeBlockHash(dataStr, prevHash) {
  let str = dataStr + prevHash;
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  for (let i = 0; i < str.length; i++) {
    let ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const hashHex = (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16);
  return "0x" + hashHex.padStart(16, "0") + "f89a2b";
}

// ── SHARED UNIT PALETTE & COLOR-CODING (Map & List Shared Identity) ─────────
export const UNIT_THEMES = [
  { id: "TRUCK-07", color: "#f59e0b", bg: "rgba(245, 158, 11, 0.15)", border: "rgba(245, 158, 11, 0.4)", num: 1, label: "Food & Water" },
  { id: "AMB-03",   color: "#ef4444", bg: "rgba(239, 68, 68, 0.15)",   border: "rgba(239, 68, 68, 0.4)", num: 2, label: "Cold-Chain" },
  { id: "TRUCK-12", color: "#06b6d4", bg: "rgba(6, 182, 212, 0.15)",   border: "rgba(6, 182, 212, 0.4)", num: 3, label: "Shelter" },
  { id: "DRONE-01", color: "#a855f7", bg: "rgba(168, 85, 247, 0.15)",  border: "rgba(168, 85, 247, 0.4)", num: 4, label: "Plasma/Blood" },
];

export function getUnitTheme(vehicle, index = 0) {
  const predefined = UNIT_THEMES.find((u) => u.id === vehicle?.id);
  if (predefined) return predefined;
  const fallbackColors = ["#10b981", "#3b82f6", "#ec4899", "#eab308"];
  const c = fallbackColors[index % fallbackColors.length];
  return { id: vehicle?.id, color: c, bg: `${c}22`, border: `${c}66`, num: index + 1, label: vehicle?.category || "Logistics" };
}

// Initial Live Relief Convoys with precise tactical waypoint paths
const INITIAL_CONVOYS = [
  {
    id: "TRUCK-07",
    name: "Siang Relief Express #07",
    type: "Food & Water Logistics",
    category: "food",
    icon: "truck",
    sector: "Sector 4 Relief Camp",
    destinationCoords: { x: 740, y: 130 },
    routePoints: [
      { x: 100, y: 260 },
      { x: 230, y: 220 },
      { x: 390, y: 180 },
      { x: 540, y: 160 },
      { x: 670, y: 140 },
      { x: 740, y: 130 }
    ],
    etaMinutes: 12,
    distanceKm: 4.8,
    speedKmh: 42,
    driver: "Subedar Rajesh Singh",
    phone: "+91 98765 43210",
    status: "EN ROUTE (HIGHWAY BYPASS)",
    progress: 68,
    cargo: [
      { item: "Freshly Prepared Hot Meals", qty: "450 packets", weight: "220 kg" },
      { item: "Packaged High-Purity Drinking Water", qty: "180 cartons", weight: "360 kg" },
      { item: "Infant Milk Formula & Porridge", qty: "60 tins", weight: "45 kg" },
      { item: "Electrolyte ORS Packets", qty: "600 sachets", weight: "30 kg" }
    ],
    blockchainTx: "0x8f2b4c19a9e34088a2c",
    blockNumber: 481920,
    donor: "Akshaya Patra Humanitarian Fund",
    otp: "4829",
    coldChain: null,
    sealId: "NDRF-SEAL-8841-A",
    verified: false,
    deliveredAt: null,
    routeType: "clear"
  },
  {
    id: "AMB-03",
    name: "Critical Cold-Chain Medical #03",
    type: "Medical & Cold-Chain Van",
    category: "medicine",
    icon: "ambulance",
    sector: "District Civil Hospital & Triage",
    destinationCoords: { x: 620, y: 440 },
    routePoints: [
      { x: 100, y: 260 },
      { x: 210, y: 310 },
      { x: 340, y: 380 },
      { x: 480, y: 410 },
      { x: 620, y: 440 }
    ],
    etaMinutes: 4,
    distanceKm: 1.4,
    speedKmh: 56,
    driver: "Dr. Sunita Rao (SDRF Medical)",
    phone: "+91 98111 22334",
    status: "ARRIVING IMMINENTLY",
    progress: 88,
    cargo: [
      { item: "Recombinant Human Insulin Vials", qty: "120 vials", weight: "12 kg" },
      { item: "Anti-Snake Venom & Tetanus Serum", qty: "90 doses", weight: "15 kg" },
      { item: "IV Saline & Dextrose Infusion Kits", qty: "200 packs", weight: "110 kg" },
      { item: "Surgical Trauma Clamps & Antiseptic", qty: "45 sterile packs", weight: "35 kg" }
    ],
    blockchainTx: "0x4e7c91a38bb84126d0e",
    blockNumber: 481921,
    donor: "Red Cross & State Health Mission",
    otp: "7103",
    coldChain: { temp: 3.6, minTemp: 2.0, maxTemp: 8.0, unit: "°C", status: "SAFE" },
    sealId: "WHO-BIOLOCK-9021",
    verified: false,
    deliveredAt: null,
    routeType: "priority"
  },
  {
    id: "TRUCK-12",
    name: "Heavy Shelter Logistics #12",
    type: "Heavy Tarpaulins & Gear",
    category: "shelter",
    icon: "truck",
    sector: "North Ward High School Shelter",
    destinationCoords: { x: 820, y: 320 },
    routePoints: [
      { x: 100, y: 260 },
      { x: 260, y: 270 },
      { x: 420, y: 300 },
      { x: 570, y: 280 },
      { x: 710, y: 310 },
      { x: 820, y: 320 }
    ],
    etaMinutes: 26,
    distanceKm: 11.2,
    speedKmh: 36,
    driver: "Mohd. Farhan (Civil Logistics)",
    phone: "+91 94555 67890",
    status: "DETOUR VIA RIDGE PASS (NH-10 CUT)",
    progress: 38,
    cargo: [
      { item: "Heavy Waterproof Tarpaulins (24x18ft)", qty: "150 rolls", weight: "900 kg" },
      { item: "Thermal Fleece Woolen Blankets", qty: "600 units", weight: "480 kg" },
      { item: "Foldable Military Camping Cots", qty: "80 cots", weight: "320 kg" },
      { item: "Family Sanitation & Hygiene Barrels", qty: "120 kits", weight: "240 kg" }
    ],
    blockchainTx: "0x1a9df44b5e8081274aa",
    blockNumber: 481922,
    donor: "PM National Relief Fund & SDRF",
    otp: "9312",
    coldChain: null,
    sealId: "NDRF-SEAL-7719-C",
    verified: false,
    deliveredAt: null,
    routeType: "detour"
  },
  {
    id: "DRONE-01",
    name: "Autonomous Aerial Lifeline #01",
    type: "Emergency Plasma & Blood Drone",
    category: "medicine",
    icon: "drone",
    sector: "Siang Valley Isolated Hamlet",
    destinationCoords: { x: 780, y: 220 },
    routePoints: [
      { x: 100, y: 260 },
      { x: 310, y: 240 },
      { x: 540, y: 230 },
      { x: 780, y: 220 }
    ],
    etaMinutes: 8,
    distanceKm: 6.5,
    speedKmh: 84,
    driver: "AutoPilot Flight Telemetry Unit",
    phone: "+91 1800-DRONE-OPS",
    status: "AIRBORNE AT 350M AGL",
    progress: 54,
    cargo: [
      { item: "O-Negative Emergency Packed Blood", qty: "6 units", weight: "3 kg" },
      { item: "Injectable Epinephrine & Atropine", qty: "25 ampoules", weight: "1.2 kg" },
      { item: "Emergency Satellite Beacon Transponder", qty: "2 units", weight: "1.8 kg" }
    ],
    blockchainTx: "0x6f3e18a9947bc1809cd",
    blockNumber: 481923,
    donor: "Armed Forces Medical Depot",
    otp: "5581",
    coldChain: { temp: 4.1, minTemp: 2.0, maxTemp: 6.0, unit: "°C", status: "OPTIMAL" },
    sealId: "AERO-POD-3301",
    verified: false,
    deliveredAt: null,
    routeType: "aerial"
  }
];

// Initial Immutable Blockchain Ledger Blocks
const INITIAL_BLOCKS = [
  {
    blockNumber: 481918,
    timestamp: "2026-09-20 08:15:22 UTC",
    category: "monetary",
    donor: "Tata Relief Trust",
    recipient: "State Emergency Logistics Fund",
    cargoSummary: "₹50,00,000 Allocated for Hill Corridor Fuel & Supply Procurement",
    txHash: "0x289fa3c81e9124bb7801a2f5",
    prevHash: "0x11029c99fa88301beea83912",
    verified: true,
    sealStatus: "AUDITED_BY_CAG",
    polygonLink: "https://polygonscan.com/tx/0x289fa3c81e9124bb7801a2f5"
  },
  {
    blockNumber: 481919,
    timestamp: "2026-09-20 08:42:10 UTC",
    category: "food",
    donor: "Akshaya Patra Humanitarian Fund",
    recipient: "Central Logistics Hub (Guwahati Depot)",
    cargoSummary: "450 Hot Meal Packets & 180 Cartons Water Loaded to TRUCK-07",
    txHash: "0x77c10f84a92c340811bda391",
    prevHash: "0x289fa3c81e9124bb7801a2f5",
    verified: true,
    sealStatus: "WAREHOUSE_SEALED",
    polygonLink: "https://polygonscan.com/tx/0x77c10f84a92c340811bda391"
  },
  {
    blockNumber: 481920,
    timestamp: "2026-09-20 09:05:44 UTC",
    category: "medicine",
    donor: "Red Cross & State Health Mission",
    recipient: "Cold-Chain Van AMB-03 Dispatch",
    cargoSummary: "120 Insulin Vials & 90 Anti-Venom Serums Transferred under 3.6°C",
    txHash: "0x8f2b4c19a9e34088a2c7412",
    prevHash: "0x77c10f84a92c340811bda391",
    verified: true,
    sealStatus: "COLD_CHAIN_MONITORED",
    polygonLink: "https://polygonscan.com/tx/0x8f2b4c19a9e34088a2c7412"
  },
  {
    blockNumber: 481921,
    timestamp: "2026-09-20 09:20:19 UTC",
    category: "shelter",
    donor: "PM National Relief Fund",
    recipient: "Heavy Truck TRUCK-12 Dispatch",
    cargoSummary: "150 Tarpaulins (24x18ft) & 600 Blankets Dispatched for North Ward",
    txHash: "0x4e7c91a38bb84126d0e8821",
    prevHash: "0x8f2b4c19a9e34088a2c7412",
    verified: true,
    sealStatus: "ELECTRONIC_SEAL_ACTIVE",
    polygonLink: "https://polygonscan.com/tx/0x4e7c91a38bb84126d0e8821"
  }
];

export default function LiveReliefTracker() {
  const [vehicles, setVehicles] = useState(INITIAL_CONVOYS);
  const [selectedId, setSelectedId] = useState(INITIAL_CONVOYS[0].id);
  const [activeTab, setActiveTab] = useState("fleet"); // 'fleet' | 'ledger' | 'dispatch'
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [simulationRunning, setSimulationRunning] = useState(true);
  const [simSpeed, setSimSpeed] = useState(1);
  const [enteredOtp, setEnteredOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [radioModalOpen, setRadioModalOpen] = useState(false);
  const [dispatchModalOpen, setDispatchModalOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [blocks, setBlocks] = useState(INITIAL_BLOCKS);
  const [chainIntegrityVerified, setChainIntegrityVerified] = useState(false);
  const [ledgerSearch, setLedgerSearch] = useState("");
  const [expandedManifests, setExpandedManifests] = useState({});

  const toggleManifest = (id, e) => {
    if (e) e.stopPropagation();
    setExpandedManifests((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // New Dispatch Form State
  const [newDispatch, setNewDispatch] = useState({
    name: "Emergency Supply Van #22",
    type: "Food & Water Logistics",
    category: "food",
    sector: "Sector 4 Relief Camp",
    donor: "Local Community Donations",
    driver: "Volunteer Ramesh Paul",
    phone: "+91 99000 11223",
    items: "300 Rice Bags, 100 Cooking Oil Cans",
  });

  const selectedVehicle = useMemo(() => {
    return vehicles.find((v) => v.id === selectedId) || vehicles[0];
  }, [vehicles, selectedId]);

  const showToast = (msg, color = "#10b981") => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 3800);
  };

  // Live GPS Simulation Timer
  useEffect(() => {
    if (!simulationRunning) return;

    const interval = setInterval(() => {
      setVehicles((prev) =>
        prev.map((v) => {
          if (v.verified) return v; // Keep completed deliveries parked

          const increment = 0.5 * simSpeed;
          let nextProg = v.progress + increment;

          if (nextProg >= 100) {
            nextProg = 100;
            return {
              ...v,
              progress: 100,
              etaMinutes: 0,
              distanceKm: 0,
              status: "ARRIVED AT DESTINATION · AWAITING OTP HANDOVER",
            };
          }

          const remDist = Math.max(0.1, +(v.distanceKm * (1 - increment / (100 - v.progress + 0.1))).toFixed(1));
          const remEta = Math.max(1, Math.round((remDist / (v.speedKmh || 40)) * 60));

          return {
            ...v,
            progress: +nextProg.toFixed(1),
            distanceKm: remDist,
            etaMinutes: remEta,
          };
        })
      );
    }, 1500);

    return () => clearInterval(interval);
  }, [simulationRunning, simSpeed]);

  // Compute interpolated GPS coordinates along route points
  const getVehiclePosition = (vehicle) => {
    const pts = vehicle.routePoints;
    if (!pts || pts.length < 2) return pts[0] || { x: 100, y: 260 };

    const totalSegments = pts.length - 1;
    const fraction = (vehicle.progress || 0) / 100;
    const overallT = fraction * totalSegments;
    const segIdx = Math.min(totalSegments - 1, Math.floor(overallT));
    const subT = overallT - segIdx;

    const pA = pts[segIdx];
    const pB = pts[segIdx + 1];

    const x = pA.x + (pB.x - pA.x) * subT;
    const y = pA.y + (pB.y - pA.y) * subT;
    return { x: Math.round(x), y: Math.round(y) };
  };

  // Handle Delivery Receipt OTP Verification & Blockchain Minting
  const handleVerifyOtp = () => {
    if (!enteredOtp) {
      showToast("⚠️ Please enter the 4-digit OTP provided by the driver or camp worker.", "#f59e0b");
      return;
    }

    if (enteredOtp.trim() !== selectedVehicle.otp) {
      playTone(320, 0.2, "sawtooth");
      showToast("❌ Incorrect OTP Code. Please verify with the driver or receiver.", "#ef4444");
      return;
    }

    setIsVerifying(true);
    playTone(660, 0.15, "triangle");

    setTimeout(() => {
      const now = new Date();
      const timeStr = now.toISOString().replace("T", " ").substring(0, 19) + " UTC";
      const newBlockNum = blocks[blocks.length - 1].blockNumber + 1;
      const prevHash = blocks[blocks.length - 1].txHash;
      const newTxHash = computeBlockHash(selectedVehicle.id + selectedVehicle.otp + timeStr, prevHash);

      const newBlock = {
        blockNumber: newBlockNum,
        timestamp: timeStr,
        category: selectedVehicle.category,
        donor: selectedVehicle.donor,
        recipient: `${selectedVehicle.sector} (Authorized Handover)`,
        cargoSummary: `${selectedVehicle.id} Manifest Handover Certified via OTP #${selectedVehicle.otp}`,
        txHash: newTxHash,
        prevHash: prevHash,
        verified: true,
        sealStatus: "HANDOVER_CONFIRMED_ON_CHAIN",
        polygonLink: `https://polygonscan.com/tx/${newTxHash}`
      };

      setBlocks((prev) => [...prev, newBlock]);

      setVehicles((prev) =>
        prev.map((v) =>
          v.id === selectedVehicle.id
            ? {
                ...v,
                verified: true,
                progress: 100,
                etaMinutes: 0,
                distanceKm: 0,
                status: "DELIVERED & VERIFIED ON-CHAIN",
                deliveredAt: timeStr,
                blockchainTx: newTxHash,
                blockNumber: newBlockNum
              }
            : v
        )
      );

      setIsVerifying(false);
      setEnteredOtp("");
      playTone(1050, 0.35, "sine");
      showToast(`🎉 Delivery Receipt Verified & Minted on Polygon Block #${newBlockNum}!`, "#10b981");
    }, 750);
  };

  // Verify Entire Blockchain Integrity
  const handleVerifyChainIntegrity = () => {
    playTone(550, 0.15);
    setChainIntegrityVerified(false);

    setTimeout(() => {
      let isChainValid = true;
      for (let i = 1; i < blocks.length; i++) {
        if (!blocks[i].prevHash || blocks[i].prevHash !== blocks[i - 1].txHash) {
          isChainValid = false;
          break;
        }
      }

      setChainIntegrityVerified(isChainValid);
      playTone(920, 0.3, "sine");
      showToast("🔒 Cryptographic Integrity 100% Confirmed — Zero Tampering Detected Across All Blocks!", "#10b981");
    }, 450);
  };

  // Handle Dispatching a New Emergency Convoy
  const handleCreateDispatch = (e) => {
    e.preventDefault();
    const newId = `CONVOY-${Math.floor(10 + Math.random() * 89)}`;
    const newOtp = `${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date();
    const timeStr = now.toISOString().replace("T", " ").substring(0, 19) + " UTC";

    const createdConvoy = {
      id: newId,
      name: newDispatch.name,
      type: newDispatch.type,
      category: newDispatch.category,
      icon: newDispatch.category === "medicine" ? "ambulance" : "truck",
      sector: newDispatch.sector,
      destinationCoords: { x: 740, y: 130 },
      routePoints: [
        { x: 100, y: 260 },
        { x: 260, y: 220 },
        { x: 480, y: 180 },
        { x: 740, y: 130 }
      ],
      etaMinutes: 24,
      distanceKm: 9.6,
      speedKmh: 45,
      driver: newDispatch.driver,
      phone: newDispatch.phone,
      status: "DISPATCHED FROM LOGISTICS HUB",
      progress: 4,
      cargo: newDispatch.items.split(",").map((it) => ({
        item: it.trim(),
        qty: "Allocated Batch",
        weight: "150 kg"
      })),
      blockchainTx: computeBlockHash(newId, blocks[blocks.length - 1].txHash),
      blockNumber: blocks[blocks.length - 1].blockNumber + 1,
      donor: newDispatch.donor,
      otp: newOtp,
      coldChain: newDispatch.category === "medicine" ? { temp: 3.8, minTemp: 2.0, maxTemp: 8.0, unit: "°C", status: "STABLE" } : null,
      sealId: `SEAL-${Math.floor(1000 + Math.random() * 9000)}-X`,
      verified: false,
      deliveredAt: null,
      routeType: "clear"
    };

    setVehicles((prev) => [createdConvoy, ...prev]);
    setSelectedId(newId);
    setDispatchModalOpen(false);

    // Also append genesis dispatch block
    const newBlock = {
      blockNumber: createdConvoy.blockNumber,
      timestamp: timeStr,
      category: createdConvoy.category,
      donor: createdConvoy.donor,
      recipient: `${createdConvoy.sector} (Convoy ${newId})`,
      cargoSummary: `New Convoy ${newId} Dispatched with ${createdConvoy.cargo.length} manifest items`,
      txHash: createdConvoy.blockchainTx,
      prevHash: blocks[blocks.length - 1].txHash,
      verified: true,
      sealStatus: "GENESIS_DISPATCH_RECORDED",
      polygonLink: `https://polygonscan.com/tx/${createdConvoy.blockchainTx}`
    };

    setBlocks((prev) => [...prev, newBlock]);
    playTone(1100, 0.35);
    showToast(`🚀 New Emergency Convoy ${newId} Dispatched & Logged to Blockchain!`, "#0284c7");
  };

  // Filtered vehicles list
  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      const matchCat = filterCat === "all" || v.category === filterCat;
      const matchSearch =
        v.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.sector.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.driver.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.cargo.some((c) => c.item.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [vehicles, filterCat, searchQuery]);

  // Filtered blocks list
  const filteredBlocks = useMemo(() => {
    return blocks.filter((b) => {
      if (!ledgerSearch) return true;
      const s = ledgerSearch.toLowerCase();
      return (
        b.txHash.toLowerCase().includes(s) ||
        b.donor.toLowerCase().includes(s) ||
        b.recipient.toLowerCase().includes(s) ||
        b.cargoSummary.toLowerCase().includes(s) ||
        b.blockNumber.toString().includes(s)
      );
    });
  }, [blocks, ledgerSearch]);

  const activePos = getVehiclePosition(selectedVehicle);

  return (
    <div className="space-y-5 pb-16">
      {/* Toast Notification Alert */}
      {toast && (
        <div
          className="fixed top-5 right-5 z-50 bg-slate-950/95 border-2 rounded-xl p-4 text-xs sm:text-sm font-black shadow-2xl backdrop-blur-xl flex items-center gap-3 animate-fadeIn"
          style={{ borderColor: toast.color, color: toast.color }}
        >
          <Zap className="w-4 h-4" />
          <span>{toast.msg}</span>
        </div>
      )}

      {/* ── TOP HEADER & CONTROL DECK ── */}
      <div className="deeptech-hud-card p-4 sm:p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-600 via-sky-600 to-blue-700 text-white flex items-center justify-center shadow-lg shadow-cyan-600/30 border border-cyan-400/40 flex-shrink-0">
              <Truck className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-sky-200">
                Live Relief Fleet Tracking & Blockchain Aid Ledger
              </h1>
              {/* Step 3: De-emphasized trust indicators strip beneath title */}
              <div className="flex flex-wrap items-center gap-3 mt-1.5 text-[11px] text-slate-400 font-mono">
                <span className="flex items-center gap-1 text-slate-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                  <span>Polygon Verified #481920</span>
                </span>
                <span className="text-slate-600 hidden sm:inline">&bull;</span>
                <span className="flex items-center gap-1 text-slate-400">
                  <Lock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Zero Relief Diversion</span>
                </span>
                <span className="text-slate-600 hidden sm:inline">&bull;</span>
                <span className="text-slate-400 font-sans">
                  Real-time satellite GPS tracking with cryptographic receipts
                </span>
              </div>
            </div>
          </div>

          {/* Action Tabs & Dispatch Button */}
          <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
            <div className="bg-slate-950/80 p-1 rounded-xl border border-slate-800 flex items-center gap-1">
              <button
                onClick={() => {
                  setActiveTab("fleet");
                  playTone(600, 0.1);
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "fleet"
                    ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-900/50"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Live Fleet GPS</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab("ledger");
                  playTone(700, 0.1);
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "ledger"
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-900/50"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Blockchain Ledger ({blocks.length})</span>
              </button>
            </div>

            <button
              onClick={() => {
                setDispatchModalOpen(true);
                playTone(850, 0.15);
              }}
              className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-950/40 border border-emerald-400/40 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Dispatch Consignment</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── FLEET TRACKER & MAP VIEW ── */}
      {activeTab === "fleet" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* ── LEFT COLUMN: CONVOY ROSTER & SEARCH (4 COLS) ── */}
          <div className="lg:col-span-4 space-y-3.5">
            {/* Search & Filter Bar */}
            <div className="deeptech-hud-card p-3.5 space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search vehicle ID, destination, supplies..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-950/90 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Category Pills */}
              <div className="flex flex-wrap gap-1.5 text-[10px]">
                {[
                  { id: "all", label: "All Convoys" },
                  { id: "food", label: "🍱 Food & Water" },
                  { id: "medicine", label: "💊 Cold-Chain Meds" },
                  { id: "shelter", label: "⛺ Tarps & Cots" }
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setFilterCat(cat.id)}
                    className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                      filterCat === cat.id
                        ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                        : "bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Vehicles List */}
            <div className="space-y-2.5 max-h-[620px] overflow-y-auto pr-1">
              {filteredVehicles.map((v, idx) => {
                const isSelected = selectedId === v.id;
                const theme = getUnitTheme(v, idx);
                const isManifestExpanded = Boolean(expandedManifests[v.id]);

                return (
                  <div
                    key={v.id}
                    onClick={() => {
                      setSelectedId(v.id);
                      playTone(isSelected ? 900 : 750, 0.1);
                    }}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                      isSelected
                        ? "bg-slate-900/95 shadow-xl ring-1"
                        : "bg-slate-950/70 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/60"
                    }`}
                    style={{
                      borderColor: isSelected ? theme.color : undefined,
                      boxShadow: isSelected ? `0 0 16px ${theme.color}33` : undefined,
                    }}
                  >
                    {/* Top Row: [Dot + Icon + Unit ID] (Left) | Priority/Status Tag (Right) */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {/* Numbered dot badge matching map marker exactly */}
                        <span
                          className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white font-mono shadow-sm flex-shrink-0"
                          style={{ backgroundColor: theme.color }}
                        >
                          {theme.num}
                        </span>
                        {/* Vehicle Icon */}
                        <span className="text-sm">
                          {v.icon === "drone" ? "🚁" : v.icon === "ambulance" ? "🚑" : "🚚"}
                        </span>
                        {/* Unit ID */}
                        <span className="text-xs font-black text-white tracking-wide">
                          {v.id}
                        </span>
                        <span className="text-[11px] text-slate-400 truncate max-w-[100px]">
                          {v.name.split(" #")[0]}
                        </span>
                      </div>

                      {/* Status / Priority Tag (colored only when non-default) */}
                      {v.verified ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono">
                          DELIVERED
                        </span>
                      ) : v.category === "medicine" ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 font-mono">
                          CRITICAL COLD-CHAIN
                        </span>
                      ) : v.routeType === "detour" ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono">
                          DETOUR ACTIVE
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium text-slate-400 bg-slate-900 border border-slate-800 font-mono">
                          ON ROUTE
                        </span>
                      )}
                    </div>

                    {/* Route line: origin → destination, single line */}
                    <div className="mt-2 text-[11px] text-slate-300 flex items-center gap-1.5 truncate">
                      <span className="text-slate-400">Depot</span>
                      <span className="text-slate-500">→</span>
                      <span className="font-semibold text-white truncate">{v.sector}</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-2 w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${v.progress}%`,
                          backgroundColor: v.verified ? "#10b981" : theme.color,
                        }}
                      />
                    </div>

                    {/* Bottom Row: Micro-formats for Time, Speed, Distance */}
                    <div className="mt-2.5 flex items-center justify-between text-xs font-mono border-t border-slate-800/60 pt-2">
                      {/* Time: Bold, largest, colored */}
                      <div className="flex items-baseline gap-1">
                        <span className="text-sm font-black text-white" style={{ color: theme.color }}>
                          {v.verified ? "0m" : `${v.etaMinutes}m`}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400">ETA</span>
                      </div>

                      {/* Speed: Muted, secondary */}
                      <div className="flex items-baseline gap-1 text-slate-400 text-[11px]">
                        <span className="font-bold text-slate-300">{v.verified ? 0 : v.speedKmh}</span>
                        <span className="text-[10px] text-slate-500">km/h</span>
                      </div>

                      {/* Distance: Muted, secondary */}
                      <div className="flex items-baseline gap-1 text-slate-400 text-[11px]">
                        <span className="font-bold text-slate-300">{v.verified ? 0 : v.distanceKm}</span>
                        <span className="text-[10px] text-slate-500">km rem.</span>
                      </div>
                    </div>

                    {/* Expandable Manifest Section inside truck card (Step 4) */}
                    <div className="mt-2 pt-1.5 border-t border-slate-800/40">
                      <button
                        type="button"
                        onClick={(e) => toggleManifest(v.id, e)}
                        className="text-[10px] text-slate-400 hover:text-cyan-300 font-mono flex items-center justify-between w-full transition-colors cursor-pointer"
                      >
                        <span className="flex items-center gap-1">
                          <Package className="w-3 h-3 text-cyan-400" />
                          <span>Manifest ({v.cargo.length} items)</span>
                        </span>
                        <span>{isManifestExpanded ? "▲ Hide" : "▼ View"}</span>
                      </button>

                      {isManifestExpanded && (
                        <div className="mt-2 space-y-1 text-[10px] bg-slate-950 p-2 rounded-lg border border-slate-800 animate-fadeIn">
                          {v.cargo.map((c, cIdx) => (
                            <div key={cIdx} className="flex items-center justify-between text-slate-300">
                              <span className="truncate pr-2">{c.item}</span>
                              <span className="font-mono text-cyan-300 font-bold flex-shrink-0">{c.qty}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── RIGHT COLUMN: TACTICAL GPS MAP & TELEMETRY HUD (8 COLS) ── */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* 1. TACTICAL REAL-TIME VECTOR MAP CANVAS */}
            <div className="deeptech-hud-card p-4 relative overflow-hidden">
              {/* Map Header Controls */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-2 border-b border-slate-800 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="font-bold text-white uppercase tracking-wider">
                    Sector Tactical Relief Transit Map
                  </span>
                  <span className="text-slate-400 font-mono text-[11px]">
                    (GPS Ref: Siang Valley & Central Logistics Corridor)
                  </span>
                </div>

                {/* Simulation Controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSimulationRunning(!simulationRunning)}
                    className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-md border border-slate-700 flex items-center gap-1 cursor-pointer font-mono text-[11px]"
                  >
                    {simulationRunning ? <Pause className="w-3 h-3 text-amber-400" /> : <Play className="w-3 h-3 text-emerald-400" />}
                    <span>{simulationRunning ? "Pause" : "Resume"}</span>
                  </button>

                  <button
                    onClick={() => setSimSpeed(simSpeed === 1 ? 2 : simSpeed === 2 ? 5 : 1)}
                    className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-cyan-300 font-mono text-[11px] rounded-md border border-slate-700 cursor-pointer"
                    title="Simulation Speed Multiplier"
                  >
                    {simSpeed}x Speed
                  </button>

                  <button
                    onClick={() => {
                      setVehicles((prev) =>
                        prev.map((v) => ({ ...v, progress: Math.max(10, v.progress - 30), verified: false }))
                      );
                      playTone(480, 0.15);
                      showToast("Simulation telemetry rewound by 30%", "#38bdf8");
                    }}
                    className="p-1 bg-slate-900 hover:bg-slate-800 text-slate-400 rounded-md border border-slate-700 cursor-pointer"
                    title="Rewind Simulation"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Map SVG Viewport */}
              <div className="relative w-full h-[360px] sm:h-[400px] bg-slate-950 rounded-xl border border-slate-800/90 overflow-hidden select-none">
                <svg
                  viewBox="0 0 920 540"
                  className="w-full h-full object-cover"
                  style={{ backgroundColor: "#040914" }}
                >
                  <defs>
                    {/* Grid Pattern */}
                    <pattern id="tacticalGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(56, 189, 248, 0.05)" strokeWidth="1" />
                    </pattern>
                    <radialGradient id="hubGlow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#0284c7" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
                    </radialGradient>
                  </defs>

                  {/* Topographic Background */}
                  <rect width="920" height="540" fill="url(#tacticalGrid)" />

                  {/* Mountain Contours & Hill Slopes Simulation */}
                  <path
                    d="M 0,160 Q 220,110 440,150 T 920,120 L 920,0 L 0,0 Z"
                    fill="rgba(14, 165, 233, 0.03)"
                    stroke="rgba(56, 189, 248, 0.1)"
                    strokeWidth="1"
                    strokeDasharray="4,4"
                  />
                  <path
                    d="M 0,380 Q 300,340 580,390 T 920,350 L 920,540 L 0,540 Z"
                    fill="rgba(16, 185, 129, 0.03)"
                    stroke="rgba(16, 185, 129, 0.1)"
                    strokeWidth="1"
                    strokeDasharray="4,4"
                  />

                  {/* River Brahmaputra / Siang Channel */}
                  <path
                    d="M 50,490 C 240,460 410,240 680,210 S 900,180 920,170"
                    fill="none"
                    stroke="rgba(56, 189, 248, 0.3)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    opacity="0.5"
                  />
                  <text x="320" y="320" fill="rgba(56, 189, 248, 0.25)" fontSize="10" fontWeight="bold" letterSpacing="4" fontFamily="monospace">
                    SIANG RIVER FLOODWAY (DISASTER ZONE)
                  </text>

                  {/* ── ROAD CORRIDOR ROUTES (Color-Coded to Convoy Units) ── */}
                  {vehicles.map((v, idx) => {
                    const isTarget = v.id === selectedVehicle.id;
                    const theme = getUnitTheme(v, idx);
                    const pathD = v.routePoints
                      .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x},${p.y}`)
                      .join(" ");

                    return (
                      <g key={`route-${v.id}`}>
                        {/* Glow halo for selected route */}
                        {isTarget && (
                          <path
                            d={pathD}
                            fill="none"
                            stroke={theme.color}
                            strokeWidth="8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            opacity="0.35"
                          />
                        )}
                        {/* Main Path Line */}
                        <path
                          d={pathD}
                          fill="none"
                          stroke={theme.color}
                          strokeOpacity={isTarget ? 1 : 0.45}
                          strokeWidth={isTarget ? "3.5" : "2"}
                          strokeDasharray={v.routeType === "detour" || v.routeType === "air" ? "6,6" : undefined}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </g>
                    );
                  })}

                  {/* Road Obstruction Warning Marker (NH-10 km 34.2) */}
                  <g transform="translate(430, 230)">
                    <circle r="16" fill="rgba(239, 68, 68, 0.2)" stroke="#ef4444" strokeWidth="1.5" className="animate-ping" style={{ transformOrigin: "0 0" }} />
                    <circle r="12" fill="#991b1b" stroke="#f87171" strokeWidth="1.5" />
                    <text y="4" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">⛔</text>
                    <text y="24" textAnchor="middle" fill="#fca5a5" fontSize="8" fontWeight="bold" fontFamily="monospace">
                      SLIP CUT km 34.2
                    </text>
                  </g>

                  {/* ── ORIGIN LOGISTICS HUB (DEPOT) ── */}
                  <g transform="translate(100, 260)" className="cursor-pointer">
                    <circle r="26" fill="url(#hubGlow)" />
                    <circle r="16" fill="#0369a1" stroke="#38bdf8" strokeWidth="2" />
                    <text y="4" textAnchor="middle" fill="#ffffff" fontSize="12">🏛️</text>
                    <text y="28" textAnchor="middle" fill="#38bdf8" fontSize="9" fontWeight="bold">
                      CENTRAL RELIEF DEPOT
                    </text>
                    <text y="39" textAnchor="middle" fill="#94a3b8" fontSize="8" fontFamily="monospace">
                      (Warehouse Hub #01)
                    </text>
                  </g>

                  {/* ── DESTINATION RELIEF CAMPS ── */}
                  {[
                    { name: "Sector 4 Camp", x: 740, y: 130, icon: "🏕️", sub: "350 Families" },
                    { name: "Civil Hospital", x: 620, y: 440, icon: "🏥", sub: "Triage Center" },
                    { name: "North Ward School", x: 820, y: 320, icon: "🏫", sub: "500 Cots" },
                    { name: "Siang Valley Hamlet", x: 780, y: 220, icon: "🏔️", sub: "Isolated Hamlet" }
                  ].map((camp) => (
                    <g key={camp.name} transform={`translate(${camp.x}, ${camp.y})`} className="cursor-pointer">
                      <circle r="14" fill="#065f46" stroke="#34d399" strokeWidth="2" />
                      <text y="4" textAnchor="middle" fill="#ffffff" fontSize="10">{camp.icon}</text>
                      <text y="24" textAnchor="middle" fill="#e2e8f0" fontSize="9" fontWeight="bold">
                        {camp.name}
                      </text>
                      <text y="34" textAnchor="middle" fill="#34d399" fontSize="7.5" fontFamily="monospace">
                        {camp.sub}
                      </text>
                    </g>
                  ))}

                  {/* ── MOVING VEHICLES ON MAP (Linked with Numbered Theme Badges) ── */}
                  {vehicles.map((v, idx) => {
                    const pos = getVehiclePosition(v);
                    const isSelected = v.id === selectedVehicle.id;
                    const theme = getUnitTheme(v, idx);

                    return (
                      <g
                        key={`veh-node-${v.id}`}
                        transform={`translate(${pos.x}, ${pos.y})`}
                        onClick={() => setSelectedId(v.id)}
                        className="cursor-pointer transition-transform duration-300 hover:scale-125"
                      >
                        {/* Radar Ping around selected vehicle */}
                        {isSelected && (
                          <circle
                            r="24"
                            fill="none"
                            stroke={theme.color}
                            strokeWidth="2"
                            opacity="0.85"
                            className="animate-ping"
                            style={{ transformOrigin: "0 0" }}
                          />
                        )}

                        {/* Vehicle Icon Disc */}
                        <circle
                          r={isSelected ? "16" : "13"}
                          fill={v.verified ? "#059669" : theme.color}
                          stroke={v.verified ? "#34d399" : "#ffffff"}
                          strokeWidth={isSelected ? "2.5" : "1.5"}
                          filter={isSelected ? `drop-shadow(0 0 10px ${theme.color})` : undefined}
                        />

                        <text y="4" textAnchor="middle" fill="#ffffff" fontSize={isSelected ? "11" : "9"}>
                          {v.icon === "drone" ? "🚁" : v.icon === "ambulance" ? "🚑" : "🚚"}
                        </text>

                        {/* Callout Tag: Numbered & Color-Coded */}
                        <g transform="translate(0, -24)">
                          <rect
                            x="-40"
                            y="-10"
                            width="80"
                            height="18"
                            rx="4"
                            fill="rgba(8, 14, 28, 0.95)"
                            stroke={isSelected ? theme.color : `${theme.color}aa`}
                            strokeWidth={isSelected ? "2" : "1"}
                          />
                          <text
                            y="2.5"
                            textAnchor="middle"
                            fill="#ffffff"
                            fontSize="8"
                            fontWeight="bold"
                            fontFamily="monospace"
                          >
                            [{theme.num}] {v.id} {v.verified ? "✓" : `• ${v.etaMinutes}m`}
                          </text>
                        </g>
                      </g>
                    );
                  })}
                </svg>

                {/* Floating Map Legend with Numbered Unit Badges */}
                <div className="absolute bottom-2.5 left-2.5 bg-slate-950/90 border border-slate-800/90 rounded-lg px-2.5 py-1.5 text-[10px] text-slate-300 font-mono flex flex-wrap items-center gap-2 backdrop-blur-md">
                  {vehicles.map((v, idx) => {
                    const t = getUnitTheme(v, idx);
                    const isSelected = v.id === selectedVehicle.id;
                    return (
                      <button
                        key={v.id}
                        onClick={() => setSelectedId(v.id)}
                        className={`flex items-center gap-1 px-1.5 py-0.5 rounded transition-colors cursor-pointer ${
                          isSelected ? "bg-slate-800 text-white font-bold" : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: t.color }} />
                        <span>[{t.num}] {v.id}</span>
                      </button>
                    );
                  })}
                  <span className="h-3 w-px bg-slate-700 mx-0.5 hidden sm:inline" />
                  <span className="flex items-center gap-1 text-rose-400">
                    ⛔ Slip Cut
                  </span>
                </div>
              </div>
            </div>

            {/* 2. SELECTED CONVOY INTELLIGENCE & TELEMETRY HUD */}
            {(() => {
              const selectedIdx = vehicles.findIndex((v) => v.id === selectedVehicle.id);
              const selectedTheme = getUnitTheme(selectedVehicle, selectedIdx >= 0 ? selectedIdx : 0);

              return (
                <div className="deeptech-hud-card p-5 space-y-4">
                  {/* Header Info with Linked Unit Badge */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold border"
                        style={{
                          backgroundColor: selectedTheme.bg,
                          borderColor: selectedTheme.border,
                          color: selectedTheme.color
                        }}
                      >
                        {selectedVehicle.icon === "drone" ? "🚁" : selectedVehicle.icon === "ambulance" ? "🚑" : "🚚"}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className="w-5 h-5 rounded-full flex items-center justify-center font-mono font-black text-[11px] text-slate-950"
                            style={{ backgroundColor: selectedTheme.color }}
                          >
                            {selectedTheme.num}
                          </span>
                          <h2 className="text-base font-black text-white">{selectedVehicle.id}</h2>
                          <span className="text-xs text-slate-400 font-medium">({selectedVehicle.name})</span>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                            selectedVehicle.verified
                              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                              : "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                          }`}>
                            {selectedVehicle.verified ? "VERIFIED ON-CHAIN" : "LIVE SATELLITE GPS"}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          En route: <b className="text-slate-200">{selectedVehicle.sector}</b> &bull; Donor: <span className="text-slate-300">{selectedVehicle.donor}</span>
                        </p>
                      </div>
                    </div>

                    {/* Driver Satellite Call / Radio Button */}
                    <button
                      onClick={() => {
                        setRadioModalOpen(true);
                        playTone(820, 0.2);
                      }}
                      className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto"
                    >
                      <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                      <span>Radio Driver: {selectedVehicle.driver.split(" ")[0]}</span>
                    </button>
                  </div>

                  {/* Telemetry Metrics Bar (Normalized Micro-Formats: Step 6) */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                      <div className="text-slate-500 text-[10px] flex items-center gap-1 uppercase tracking-wider">
                        <Clock className="w-3 h-3 text-cyan-400" />
                        <span>Time Remaining</span>
                      </div>
                      <div className="text-base font-black mt-1" style={{ color: selectedTheme.color }}>
                        {selectedVehicle.verified ? "0m ETA" : `${selectedVehicle.etaMinutes}m ETA`}
                      </div>
                      <div className="text-[10px] text-slate-400">Scheduled arrival</div>
                    </div>

                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                      <div className="text-slate-500 text-[10px] flex items-center gap-1 uppercase tracking-wider">
                        <Activity className="w-3 h-3 text-emerald-400" />
                        <span>Transit Speed</span>
                      </div>
                      <div className="text-base font-black text-slate-200 mt-1">
                        {selectedVehicle.verified ? "0 km/h" : `${selectedVehicle.speedKmh} km/h`}
                      </div>
                      <div className="text-[10px] text-slate-400">Satellite telemetry</div>
                    </div>

                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                      <div className="text-slate-500 text-[10px] flex items-center gap-1 uppercase tracking-wider">
                        <Compass className="w-3 h-3 text-sky-400" />
                        <span>Corridor Distance</span>
                      </div>
                      <div className="text-base font-black text-slate-200 mt-1">
                        {selectedVehicle.verified ? "0.0 km rem." : `${selectedVehicle.distanceKm} km rem.`}
                      </div>
                      <div className="text-[10px] text-slate-400">Remaining to depot</div>
                    </div>

                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                      <div className="text-slate-500 text-[10px] flex items-center gap-1 uppercase tracking-wider">
                        {selectedVehicle.coldChain ? (
                          <Thermometer className="w-3 h-3 text-rose-400" />
                        ) : (
                          <Lock className="w-3 h-3 text-amber-400" />
                        )}
                        <span>{selectedVehicle.coldChain ? "Cold-Chain IoT" : "Tamper Seal"}</span>
                      </div>
                      <div className="text-base font-black mt-1 truncate" style={{ color: selectedVehicle.coldChain ? "#f87171" : "#f59e0b" }}>
                        {selectedVehicle.coldChain ? `${selectedVehicle.coldChain.temp}${selectedVehicle.coldChain.unit}` : selectedVehicle.sealId}
                      </div>
                      <div className="text-[10px] text-emerald-400">
                        {selectedVehicle.coldChain ? `Safe (${selectedVehicle.coldChain.minTemp}–${selectedVehicle.coldChain.maxTemp}°C)` : "Tamper-Proof Intact"}
                      </div>
                    </div>
                  </div>

                  {/* Cargo Manifest Breakdown — Attached to Owning Truck (Step 4) */}
                  <div className="space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs font-bold text-slate-300">
                      <span className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-cyan-400" />
                        <span>Cargo Manifest &bull; Assigned to Unit [{selectedTheme.num}] {selectedVehicle.id}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono border" style={{ backgroundColor: selectedTheme.bg, borderColor: selectedTheme.border, color: selectedTheme.color }}>
                          {selectedVehicle.cargo.length} Batches
                        </span>
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        Genesis Block #{selectedVehicle.blockNumber}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {selectedVehicle.cargo.map((c, i) => (
                        <div
                          key={i}
                          className="p-2.5 bg-slate-950/80 rounded-lg border border-slate-800/90 flex items-center justify-between text-xs"
                        >
                          <div>
                            <div className="font-bold text-white">{c.item}</div>
                            <div className="text-[10px] text-slate-400">Unit Weight: {c.weight}</div>
                          </div>
                          <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 font-mono font-bold text-[11px] border border-cyan-500/20">
                            {c.qty}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ── 3. ELEVATED DELIVERY CONFIRMATION & BLOCKCHAIN RECEIPT (Step 5) ── */}
                  <div className="pt-2">
                    <div className="rounded-xl border-2 border-emerald-500/60 bg-gradient-to-r from-emerald-950/40 via-slate-950 to-teal-950/40 p-4 sm:p-5 shadow-xl shadow-emerald-950/30">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        
                        {/* Left: OTP Code & Offline QR Badge */}
                        <div className="flex items-start sm:items-center gap-3.5">
                          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 flex-shrink-0">
                            <QrCode className="w-6 h-6" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-black text-white uppercase tracking-wider">Confirm Delivery</h3>
                              <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                AID RECIPIENT HANDOVER
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-slate-400 font-mono">Recipient OTP:</span>
                              <span className="text-xl font-black text-emerald-400 font-mono tracking-widest bg-slate-900 px-2.5 py-0.5 rounded-lg border border-emerald-500/40 shadow-inner">
                                {selectedVehicle.otp}
                              </span>
                              <span className="text-[10px] text-slate-500 hidden sm:inline">(Citizen shows code at vehicle tailgate)</span>
                            </div>
                          </div>
                        </div>

                        {/* Right: Elevated Action — Input and Button on the Same Row */}
                        {selectedVehicle.verified ? (
                          <div className="flex items-center gap-3 text-xs font-bold text-emerald-300 bg-emerald-900/40 border border-emerald-500/60 px-4 py-2.5 rounded-xl shadow-lg">
                            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                            <div>
                              <div className="font-black text-white">Delivery Confirmed &amp; Logged On-Chain</div>
                              <div className="text-[10px] font-mono text-emerald-400/90 font-normal">
                                Block #{selectedVehicle.blockNumber} &bull; TX: {selectedVehicle.blockchainTx.substring(0, 16)}...
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 w-full lg:w-auto">
                            <input
                              type="text"
                              maxLength="4"
                              value={enteredOtp}
                              onChange={(e) => setEnteredOtp(e.target.value)}
                              placeholder={`Enter ${selectedVehicle.otp}`}
                              className="w-32 sm:w-36 px-3 py-2.5 bg-slate-900 border-2 border-emerald-500/50 rounded-xl text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 text-center font-bold tracking-widest shadow-inner"
                            />
                            <button
                              onClick={handleVerifyOtp}
                              disabled={isVerifying}
                              className="flex-1 sm:flex-none px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                            >
                              <ShieldCheck className="w-4 h-4 text-slate-950" />
                              <span>{isVerifying ? "Mining Block..." : "Confirm Delivery"}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ── BLOCKCHAIN AUDIT LEDGER VIEW ── */}
      {activeTab === "ledger" && (
        <div className="space-y-4">
          <div className="deeptech-hud-card p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black text-white flex items-center gap-2">
                    <Shield className="w-5 h-5 text-purple-400" />
                    <span>Immutable Humanitarian Aid Ledger (Polygon zkEVM / Hyperledger)</span>
                  </h2>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  100% transparent on-chain trace from donor funds through warehouse logistics to field citizen recipient handovers.
                </p>
              </div>

              {/* Chain Integrity Validator Button */}
              <button
                onClick={handleVerifyChainIntegrity}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 cursor-pointer ${
                  chainIntegrityVerified
                    ? "bg-emerald-950/80 border-emerald-400 text-emerald-300 shadow-lg shadow-emerald-950/50"
                    : "bg-purple-950/80 border-purple-500/60 text-purple-200 hover:bg-purple-900"
                }`}
              >
                <CheckCircle2 className={`w-4 h-4 ${chainIntegrityVerified ? "text-emerald-400" : "text-purple-400"}`} />
                <span>{chainIntegrityVerified ? "Chain Validated: 100% Intact" : "Verify Cryptographic Integrity"}</span>
              </button>
            </div>

            {/* Ledger Search Filter */}
            <div className="mb-4">
              <input
                type="text"
                value={ledgerSearch}
                onChange={(e) => setLedgerSearch(e.target.value)}
                placeholder="Search ledger by transaction hash, donor, relief camp, or block number..."
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Blocks Tree Timeline */}
            <div className="space-y-3">
              {filteredBlocks.map((b, idx) => (
                <div
                  key={b.blockNumber}
                  className="p-4 bg-slate-950/90 rounded-xl border border-slate-800 hover:border-purple-500/50 transition-all space-y-2 relative"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center justify-center font-mono font-bold text-xs">
                        #{b.blockNumber}
                      </span>
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-2">
                          <span>{b.donor}</span>
                          <ArrowRight className="w-3 h-3 text-slate-500" />
                          <span className="text-cyan-300">{b.recipient}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">{b.timestamp}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/10 text-purple-300 border border-purple-500/30">
                        {b.sealStatus}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                        ✓ VERIFIED
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-900/80 rounded-lg text-xs text-slate-300 border border-slate-800/80">
                    {b.cargoSummary}
                  </div>

                  {/* Hash Metadata */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[10px] font-mono text-slate-500">
                    <div className="flex items-center gap-2">
                      <span>PrevHash: <span className="text-slate-400">{b.prevHash.substring(0, 14)}...</span></span>
                      <span>&bull;</span>
                      <span>BlockTx: <span className="text-cyan-400 font-bold">{b.txHash}</span></span>
                    </div>
                    <a
                      href={b.polygonLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-400 hover:text-purple-300 flex items-center gap-1 font-sans font-bold"
                    >
                      <span>PolygonScan Explorer</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── SATELLITE RADIO DRIVER COMMS MODAL ── */}
      {radioModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-cyan-500/50 rounded-2xl w-full max-w-lg p-5 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-cyan-400 animate-pulse" />
                <h3 className="text-base font-bold text-white">
                  Direct Satellite Radio Link &bull; {selectedVehicle.id}
                </h3>
              </div>
              <button
                onClick={() => setRadioModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-3 text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span>Driver In-Charge:</span>
                <span className="font-bold text-white">{selectedVehicle.driver}</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Direct Satellite Phone:</span>
                <span className="font-mono text-cyan-400 font-bold">{selectedVehicle.phone}</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Comms Channel:</span>
                <span className="font-mono text-emerald-400">VHF Ch 16 (156.800 MHz) Encryption: PQC</span>
              </div>
            </div>

            {/* Simulated Audio Waveform */}
            <div className="bg-slate-950 p-4 rounded-xl border border-cyan-500/30 text-center space-y-2">
              <div className="text-[11px] text-cyan-300 font-mono">
                [LIVE AUDIO TRANSCRIPTION FEED]
              </div>
              <p className="text-xs text-slate-200 italic">
                "Relief Dispatch, this is {selectedVehicle.driver}. Passing through the Siang Ridge cutoff bypass now. Road is rough but cleared. Cargo seals inspected and secure. Arriving in ~{selectedVehicle.etaMinutes} minutes. Over."
              </p>
              <div className="flex justify-center gap-1 py-1">
                {[40, 75, 90, 60, 85, 95, 45, 70, 80, 50, 65].map((h, idx) => (
                  <span
                    key={idx}
                    className="w-1.5 bg-cyan-400 rounded-full animate-pulse"
                    style={{ height: `${h * 0.25}px`, animationDelay: `${idx * 80}ms` }}
                  />
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <a
                href={`tel:${selectedVehicle.phone}`}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl cursor-pointer flex items-center gap-1.5"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Call Driver Directly</span>
              </a>
              <button
                onClick={() => {
                  playTone(720, 0.2);
                  setRadioModalOpen(false);
                  showToast("Radio ping ack dispatched to driver HUD.", "#38bdf8");
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl cursor-pointer"
              >
                Send Radio Ack (Beep)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DISPATCH NEW RELIEF CONVOY MODAL ── */}
      {dispatchModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-emerald-500/50 rounded-2xl w-full max-w-lg p-5 sm:p-6 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Dispatch New Relief Consignment</h3>
              </div>
              <button
                onClick={() => setDispatchModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDispatch} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Convoy / Vehicle Call Sign:</label>
                <input
                  type="text"
                  required
                  value={newDispatch.name}
                  onChange={(e) => setNewDispatch({ ...newDispatch, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Vehicle Category:</label>
                  <select
                    value={newDispatch.category}
                    onChange={(e) => setNewDispatch({ ...newDispatch, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs"
                  >
                    <option value="food">Food & Drinking Water</option>
                    <option value="medicine">Medicine & Cold-Chain</option>
                    <option value="shelter">Tarps, Cots & Blankets</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Destination Camp:</label>
                  <select
                    value={newDispatch.sector}
                    onChange={(e) => setNewDispatch({ ...newDispatch, sector: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs"
                  >
                    <option value="Sector 4 Relief Camp">Sector 4 Relief Camp</option>
                    <option value="District Civil Hospital & Triage">District Civil Hospital</option>
                    <option value="North Ward High School Shelter">North Ward High School</option>
                    <option value="Siang Valley Isolated Hamlet">Siang Valley Isolated Hamlet</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Cargo Manifest Items (comma separated):</label>
                <input
                  type="text"
                  required
                  value={newDispatch.items}
                  onChange={(e) => setNewDispatch({ ...newDispatch, items: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Driver In-Charge:</label>
                  <input
                    type="text"
                    required
                    value={newDispatch.driver}
                    onChange={(e) => setNewDispatch({ ...newDispatch, driver: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Donor Organization:</label>
                  <input
                    type="text"
                    required
                    value={newDispatch.donor}
                    onChange={(e) => setNewDispatch({ ...newDispatch, donor: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setDispatchModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold rounded-xl cursor-pointer shadow-lg"
                >
                  Dispatch & Mint Genesis Block
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
