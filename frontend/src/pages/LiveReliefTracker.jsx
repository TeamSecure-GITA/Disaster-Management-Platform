// ─────────────────────────────────────────────────────────────────────────────
// src/pages/LiveReliefTracker.jsx
//
// "Swiggy-Style" Live Resource Tracking & Blockchain Aid Ledger
// - For Citizens: Real-time GPS movement of relief trucks, food vans, ambulances,
//   live ETA, cargo manifest, driver contacts, and OTP delivery verification.
// - For Judges/Auditors: Hyperledger/Polygon blockchain verification of donations.
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const RELIEF_VEHICLES = [
  {
    id: "TRUCK-07",
    type: "Food & Water Van",
    sector: "Sector 4 Relief Camp",
    etaMinutes: 12,
    driver: "Rajesh Singh",
    phone: "+91 98765 43210",
    status: "ON THE WAY (2.4 km away)",
    progress: 68,
    cargo: [
      { item: "Prepared Hot Meals", qty: "350 packets" },
      { item: "Packaged Drinking Water", qty: "120 cartons" },
      { item: "Baby Milk Formula", qty: "45 cans" },
    ],
    blockchainTx: "0x8f2b...9a12",
    blockNumber: 481920,
    donor: "Akshaya Patra Disaster Relief",
    otp: "4829",
  },
  {
    id: "AMB-03",
    type: "Critical Medical Unit",
    sector: "Community Hall Shelter",
    etaMinutes: 4,
    driver: "Dr. Sunita Rao",
    phone: "+91 98111 22334",
    status: "ARRIVING NOW (450m away)",
    progress: 92,
    cargo: [
      { item: "Insulin & Cold-Chain Vials", qty: "80 units" },
      { item: "IV Saline Fluids", qty: "150 bottles" },
      { item: "Trauma Gauze & Antiseptics", qty: "40 kits" },
    ],
    blockchainTx: "0x4e7c...3b88",
    blockNumber: 481921,
    donor: "Red Cross Medical Aid",
    otp: "7103",
  },
  {
    id: "TRUCK-12",
    type: "Heavy Blanket & Tarp Logistics",
    sector: "North Ward School Shelter",
    etaMinutes: 28,
    driver: "Mohd. Farhan",
    phone: "+91 94555 67890",
    status: "EN ROUTE VIA HIGHWAY BYPASS",
    progress: 40,
    cargo: [
      { item: "Thermal Blankets", qty: "500 pcs" },
      { item: "Waterproof Heavy Tarpaulins", qty: "120 rolls" },
      { item: "Sanitary Hygiene Kits", qty: "300 sets" },
    ],
    blockchainTx: "0x1a9d...5e44",
    blockNumber: 481922,
    donor: "PM Relief & State SDRF",
    otp: "9312",
  },
];

export default function LiveReliefTracker() {
  const [vehicles, setVehicles] = useState(RELIEF_VEHICLES);
  const [selectedVehicle, setSelectedVehicle] = useState(RELIEF_VEHICLES[0]);
  const [activeTab, setActiveTab] = useState("citizen"); // 'citizen' | 'audit'
  const [enteredOtp, setEnteredOtp] = useState("");
  const [verifiedState, setVerifiedState] = useState(false);
  const [toast, setToast] = useState(null);

  // Live ETA simulation
  useEffect(() => {
    const id = setInterval(() => {
      setVehicles((prev) =>
        prev.map((v) => {
          const nextProg = Math.min(100, v.progress + 1);
          const nextEta = Math.max(1, Math.round(v.etaMinutes * (1 - nextProg / 100)));
          return { ...v, progress: nextProg, etaMinutes: nextEta };
        })
      );
    }, 4000);
    return () => clearInterval(id);
  }, []);

  const showToast = (msg, color = "#10b981") => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 3000);
  };

  const verifyDelivery = () => {
    if (enteredOtp.trim() === selectedVehicle.otp) {
      setVerifiedState(true);
      showToast(`🎉 Delivery Receipt Verified on Polygon Blockchain! Block #${selectedVehicle.blockNumber + 1}`, "#10b981");
    } else {
      showToast("❌ Invalid OTP code. Please ask the driver.", "#ef4444");
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #020617, #0b1c36, #07192f)", color: "#e2e8f0", fontFamily: "'Inter','Segoe UI',sans-serif", padding: "24px" }}>
      {toast && (
        <div style={{ position: "fixed", top: "20px", right: "20px", zIndex: 9999, background: "#0f172a", border: `2px solid ${toast.color}`, borderRadius: "12px", padding: "14px 22px", color: toast.color, fontWeight: "800", fontSize: "0.9rem", boxShadow: `0 8px 30px ${toast.color}40` }}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "14px", marginBottom: "22px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: "linear-gradient(135deg, #ea580c, #c2410c)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.7rem", boxShadow: "0 4px 20px rgba(234,88,12,0.4)" }}>
            🚚
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: "800", background: "linear-gradient(90deg, #fb923c, #fbbf24)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                "Swiggy-Style" Live Relief Tracking & Blockchain Ledger
              </h1>
              <span style={{ fontSize: "0.68rem", fontWeight: "800", padding: "3px 9px", borderRadius: "999px", background: "rgba(249,115,22,0.15)", color: "#fb923c", border: "1px solid rgba(249,115,22,0.3)" }}>
                LIVE GPS DISPATCH
              </span>
            </div>
            <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.85rem" }}>
              Live real-time delivery ETA for citizens &bull; 100% transparent Hyperledger/Polygon audit for public trust
            </p>
          </div>
        </div>

        {/* View Switcher */}
        <div style={{ display: "flex", gap: "8px", background: "#0f172a", border: "1px solid #334155", padding: "4px", borderRadius: "10px" }}>
          <button
            onClick={() => setActiveTab("citizen")}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              fontWeight: "700",
              fontSize: "0.82rem",
              background: activeTab === "citizen" ? "linear-gradient(135deg, #ea580c, #c2410c)" : "transparent",
              color: activeTab === "citizen" ? "#fff" : "#94a3b8",
            }}
          >
            🛵 Citizen Live Tracker
          </button>
          <button
            onClick={() => setActiveTab("audit")}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              fontWeight: "700",
              fontSize: "0.82rem",
              background: activeTab === "audit" ? "linear-gradient(135deg, #0284c7, #0369a1)" : "transparent",
              color: activeTab === "audit" ? "#fff" : "#94a3b8",
            }}
          >
            ⛓️ Blockchain Audit Ledger
          </button>
        </div>
      </div>

      {/* Main Content Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: "20px" }}>
        {/* Left Column: Active Delivery List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <h3 style={{ margin: "0 0 4px", fontSize: "0.88rem", fontWeight: "700", color: "#fb923c", textTransform: "uppercase" }}>
            Active Relief Convoys ({vehicles.length})
          </h3>

          {vehicles.map((v) => (
            <div
              key={v.id}
              onClick={() => {
                setSelectedVehicle(v);
                setVerifiedState(false);
              }}
              style={{
                background: selectedVehicle.id === v.id ? "rgba(234, 88, 12, 0.15)" : "rgba(15, 23, 42, 0.75)",
                border: `1.5px solid ${selectedVehicle.id === v.id ? "#f97316" : "rgba(255,255,255,0.08)"}`,
                borderRadius: "14px",
                padding: "16px",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                <div>
                  <span style={{ fontWeight: "800", fontSize: "0.95rem", color: "#f8fafc" }}>{v.id}</span>
                  <div style={{ fontSize: "0.78rem", color: "#fb923c", fontWeight: "600" }}>{v.type}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "1.2rem", fontWeight: "900", color: "#34d399" }}>{v.etaMinutes}m</div>
                  <div style={{ fontSize: "0.68rem", color: "#94a3b8" }}>ETA ARRIVAL</div>
                </div>
              </div>

              <div style={{ fontSize: "0.78rem", color: "#cbd5e1", marginBottom: "10px" }}>
                Destination: <b>{v.sector}</b>
              </div>

              {/* Progress Bar */}
              <div style={{ height: "6px", background: "rgba(255,255,255,0.08)", borderRadius: "3px", overflow: "hidden", marginBottom: "8px" }}>
                <div style={{ height: "100%", width: `${v.progress}%`, background: "linear-gradient(90deg, #f97316, #34d399)", borderRadius: "3px", transition: "width 0.5s" }} />
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", color: "#94a3b8" }}>
                <span>Driver: {v.driver}</span>
                <span>{v.status}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Right Column: Live Tracker Screen or Blockchain View */}
        <div>
          {activeTab === "citizen" ? (
            /* Swiggy-Style Citizen Delivery Screen */
            <div style={{ background: "rgba(15,23,42,0.75)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "24px", backdropFilter: "blur(10px)" }}>
              {/* Delivery Status Banner */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "16px", marginBottom: "20px" }}>
                <div>
                  <span style={{ fontSize: "0.75rem", color: "#38bdf8", fontWeight: "700" }}>DISASTER RELIEF TRUCK LIVE GPS</span>
                  <h2 style={{ margin: "4px 0 0", fontSize: "1.4rem", fontWeight: "800", color: "#ffffff" }}>
                    Arriving in {selectedVehicle.etaMinutes} mins at {selectedVehicle.sector}
                  </h2>
                  <div style={{ fontSize: "0.82rem", color: "#34d399", marginTop: "2px" }}>
                    &bull; Live GPS tracking active &bull; Vehicle speed: 38 km/h
                  </div>
                </div>

                <div style={{ background: "rgba(249,115,22,0.15)", border: "1px solid #f97316", padding: "10px 18px", borderRadius: "12px", textAlign: "center" }}>
                  <div style={{ fontSize: "0.7rem", color: "#fb923c", fontWeight: "700" }}>DELIVERY OTP</div>
                  <div style={{ fontSize: "1.6rem", fontWeight: "900", color: "#ffffff", letterSpacing: "2px" }}>{selectedVehicle.otp}</div>
                  <div style={{ fontSize: "0.65rem", color: "#94a3b8" }}>Show to driver upon arrival</div>
                </div>
              </div>

              {/* Driver & Contact Card */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.03)", padding: "14px 18px", borderRadius: "12px", marginBottom: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "42px", height: "42px", borderRadius: "50%", background: "#0284c7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem" }}>
                    👨‍✈️
                  </div>
                  <div>
                    <div style={{ fontWeight: "700", fontSize: "0.92rem", color: "#fff" }}>{selectedVehicle.driver}</div>
                    <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Official NDRF Logistics Vehicle ({selectedVehicle.id})</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                  <a href={`tel:${selectedVehicle.phone}`} style={{ padding: "8px 16px", borderRadius: "8px", background: "#16a34a", color: "#fff", textDecoration: "none", fontWeight: "700", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "6px" }}>
                    📞 Call Driver
                  </a>
                </div>
              </div>

              {/* Cargo Manifest (What's in the truck) */}
              <div style={{ marginBottom: "22px" }}>
                <h3 style={{ margin: "0 0 10px", fontSize: "0.9rem", fontWeight: "700", color: "#38bdf8" }}>
                  📦 Cargo Manifest (Supplies on this Vehicle):
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px" }}>
                  {selectedVehicle.cargo.map((c, i) => (
                    <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "10px", padding: "12px" }}>
                      <div style={{ fontWeight: "700", fontSize: "0.85rem", color: "#e2e8f0" }}>{c.item}</div>
                      <div style={{ fontSize: "0.85rem", color: "#34d399", fontWeight: "800", marginTop: "4px" }}>{c.qty}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Receipt Confirmation & OTP Entry */}
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "16px" }}>
                <div style={{ fontSize: "0.85rem", fontWeight: "700", color: "#f8fafc", marginBottom: "8px" }}>
                  Confirm Delivery Handover (Driver / Camp Worker Verification):
                </div>
                {verifiedState ? (
                  <div style={{ background: "rgba(16,185,129,0.2)", border: "1px solid #10b981", borderRadius: "10px", padding: "12px", color: "#34d399", fontWeight: "800", textAlign: "center" }}>
                    ✅ HANDOVER VERIFIED & RECORDED ON POLYGON BLOCKCHAIN!
                  </div>
                ) : (
                  <div style={{ display: "flex", gap: "10px" }}>
                    <input
                      type="text"
                      placeholder="Enter 4-digit OTP to confirm handover..."
                      value={enteredOtp}
                      onChange={(e) => setEnteredOtp(e.target.value)}
                      style={{ flex: 1, padding: "10px 14px", borderRadius: "8px", background: "#0b1329", border: "1px solid #334155", color: "#fff", fontSize: "0.85rem" }}
                    />
                    <button
                      onClick={verifyDelivery}
                      style={{ padding: "10px 22px", borderRadius: "8px", border: "none", background: "linear-gradient(135deg, #16a34a, #15803d)", color: "#fff", fontWeight: "700", fontSize: "0.85rem", cursor: "pointer" }}
                    >
                      Verify & Log to Blockchain
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Blockchain Public Audit View for Judges & Citizens */
            <div style={{ background: "rgba(15,23,42,0.75)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "24px", backdropFilter: "blur(10px)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: "1.25rem", fontWeight: "800", color: "#38bdf8" }}>
                    ⛓️ Hyperledger / Polygon Public Aid Ledger
                  </h2>
                  <p style={{ margin: "2px 0 0", color: "#94a3b8", fontSize: "0.8rem" }}>
                    100% transparent cryptographic tracing eliminating relief theft and diversion
                  </p>
                </div>
                <span style={{ background: "rgba(56,189,248,0.15)", color: "#38bdf8", padding: "4px 12px", borderRadius: "999px", fontSize: "0.75rem", fontWeight: "700" }}>
                  POLYGON MAINNET #481920
                </span>
              </div>

              {/* Blockchain Trace Stepper */}
              <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "24px" }}>
                {[
                  { step: "1. DONOR CONTRIBUTION", desc: `Registered from ${selectedVehicle.donor}`, hash: selectedVehicle.blockchainTx, status: "VERIFIED" },
                  { step: "2. WAREHOUSE INVENTORY PACKED", desc: "Goods inspected and loaded into sealed container", hash: "0x39a1...bb02", status: "VERIFIED" },
                  { step: "3. VEHICLE DISPATCH & TELEMETRY", desc: `Convoy ${selectedVehicle.id} moving to ${selectedVehicle.sector}`, hash: "0x77ec...fa41", status: "LIVE" },
                  { step: "4. RECIPIENT QR / OTP HANDOVER", desc: verifiedState ? "Confirmed by relief camp worker" : "Pending delivery arrival", hash: verifiedState ? "0xbc12...8889" : "Awaiting OTP", status: verifiedState ? "COMPLETE" : "IN_PROGRESS" },
                ].map((s, i) => (
                  <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "10px", padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontWeight: "800", fontSize: "0.85rem", color: "#e2e8f0" }}>{s.step}</div>
                      <div style={{ fontSize: "0.78rem", color: "#94a3b8", marginTop: "2px" }}>{s.desc}</div>
                      <div style={{ fontSize: "0.7rem", color: "#38bdf8", fontFamily: "monospace", marginTop: "4px" }}>TX: {s.hash}</div>
                    </div>
                    <span style={{ fontSize: "0.7rem", fontWeight: "800", padding: "3px 9px", borderRadius: "6px", background: s.status === "VERIFIED" || s.status === "COMPLETE" ? "rgba(16,185,129,0.15)" : "rgba(245,158,11,0.15)", color: s.status === "VERIFIED" || s.status === "COMPLETE" ? "#34d399" : "#fbbf24" }}>
                      {s.status}
                    </span>
                  </div>
                ))}
              </div>

              <div style={{ textAlign: "right" }}>
                <Link to="/aid-ledger" style={{ color: "#38bdf8", fontSize: "0.82rem", fontWeight: "700", textDecoration: "none" }}>
                  View Full Master Blockchain Ledger &rarr;
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
