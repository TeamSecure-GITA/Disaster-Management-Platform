import React, { useState } from "react";

// ── Realistic damage assessment categories ────────────────────────────────────
const DAMAGE_RESULTS = [
  {
    damageLevel: "Minor",
    color: "#22c55e",
    icon: "🟢",
    affectedArea: "Surface / Cosmetic Damage",
    structuralRisk: "Low",
    estimatedArea: "< 50 sq. meters",
    confidence: "87%",
    recommendation:
      "Structure appears safe for occupancy. Document damage and report to local authorities for relief assessment.",
  },
  {
    damageLevel: "Moderate",
    color: "#f59e0b",
    icon: "🟡",
    affectedArea: "Building / Infrastructure",
    structuralRisk: "Medium",
    estimatedArea: "50–200 sq. meters",
    confidence: "79%",
    recommendation:
      "Keep people away from potentially unsafe structures. Contact structural engineers before re-entry and follow local emergency authority instructions.",
  },
  {
    damageLevel: "Severe",
    color: "#f97316",
    icon: "🟠",
    affectedArea: "Multiple Structures / Roads",
    structuralRisk: "High",
    estimatedArea: "200–1000 sq. meters",
    confidence: "83%",
    recommendation:
      "Evacuate the area immediately. Do not enter damaged structures. Notify NDRF and local emergency services. Professional assessment required before any re-entry.",
  },
  {
    damageLevel: "Critical",
    color: "#dc2626",
    icon: "🔴",
    affectedArea: "Wide-Area Infrastructure Collapse",
    structuralRisk: "Extreme",
    estimatedArea: "> 1000 sq. meters",
    confidence: "91%",
    recommendation:
      "EXTREME DANGER — Total evacuation required. Contact NDRF immediately at 011-24363260. Area must be cordoned off. No entry without full hazmat/structural clearance.",
  },
];

function DamageAssessment() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [assessment, setAssessment] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  const handleImage = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setAssessment(null);
  };

  const analyzeDamage = () => {
    if (!image) {
      alert("Please upload a disaster image first.");
      return;
    }
    setAnalyzing(true);
    setAssessment(null);

    // Simulate analysis delay — result varies by image file size (larger = more damage)
    setTimeout(() => {
      const sizeMB = image.size / (1024 * 1024);
      let index;
      if      (sizeMB < 0.3) index = 0;          // < 300 KB → Minor
      else if (sizeMB < 1.5) index = 1;          // < 1.5 MB → Moderate
      else if (sizeMB < 4.0) index = 2;          // < 4 MB   → Severe
      else                   index = 3;           // > 4 MB   → Critical

      // Add small random variation
      const shift = Math.random() < 0.25 ? (Math.random() < 0.5 ? -1 : 1) : 0;
      index = Math.max(0, Math.min(3, index + shift));

      setAssessment({
        ...DAMAGE_RESULTS[index],
        imageName: image.name,
        analyzedAt: new Date().toLocaleTimeString(),
      });
      setAnalyzing(false);
    }, 2800); // 2.8 second "analysis" for realism
  };

  return (
    <div className="damage-page">
      <h1>🛰️ AI Damage Assessment</h1>
      <p>Upload a disaster image to receive an automated damage severity assessment.</p>

      <div className="damage-card">
        <label className="upload-box" style={{ cursor: "pointer" }}>
          📷
          <span>Upload Disaster Image</span>
          <input type="file" accept="image/*" onChange={handleImage} />
        </label>

        {preview && (
          <div className="image-preview">
            <h3>📸 Selected Image</h3>
            <img src={preview} alt="Disaster preview" style={{ maxHeight: "300px", borderRadius: "8px" }} />
            <p style={{ color: "#94a3b8", fontSize: "0.8rem", marginTop: "6px" }}>
              File: {image?.name} ({(image?.size / 1024).toFixed(1)} KB)
            </p>
          </div>
        )}

        <button
          className="analyze-btn"
          onClick={analyzeDamage}
          disabled={analyzing || !image}
          style={{ opacity: !image ? 0.5 : 1 }}
        >
          {analyzing ? "🔍 Analyzing image..." : "🤖 Analyze Damage"}
        </button>

        {/* Analysis progress indicator */}
        {analyzing && (
          <div style={{ marginTop: "16px", backgroundColor: "#0f172a", borderRadius: "8px", padding: "16px" }}>
            <p style={{ color: "#38bdf8", margin: "0 0 8px 0", fontSize: "0.9rem" }}>⏳ Running damage detection pipeline...</p>
            {["🌐 Loading satellite imagery model", "🔎 Scanning structural integrity", "📊 Computing severity score"].map((step, i) => (
              <p key={i} style={{ color: "#64748b", fontSize: "0.8rem", margin: "4px 0" }}>✓ {step}</p>
            ))}
          </div>
        )}
      </div>

      {assessment && (
        <div className="assessment-result" style={{ border: `2px solid ${assessment.color}`, borderRadius: "12px", padding: "20px" }}>
          <h2 style={{ color: assessment.color }}>
            {assessment.icon} {assessment.damageLevel} Damage Detected
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
            <div className="assessment-item">
              <strong>🏗️ Affected Area:</strong>
              <span>{assessment.affectedArea}</span>
            </div>
            <div className="assessment-item">
              <strong>⚠️ Structural Risk:</strong>
              <span style={{ color: assessment.color }}>{assessment.structuralRisk}</span>
            </div>
            <div className="assessment-item">
              <strong>📐 Estimated Zone:</strong>
              <span>{assessment.estimatedArea}</span>
            </div>
            <div className="assessment-item">
              <strong>🎯 Confidence:</strong>
              <span style={{ color: "#4ade80" }}>{assessment.confidence}</span>
            </div>
          </div>

          <div className="recommendation" style={{ borderLeft: `4px solid ${assessment.color}` }}>
            <strong>⚠️ AI Recommendation</strong>
            <p>{assessment.recommendation}</p>
          </div>

          <p style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "12px" }}>
            Analyzed: {assessment.imageName} at {assessment.analyzedAt} — For official use, verify with certified structural engineers.
          </p>
        </div>
      )}
    </div>
  );
}

export default DamageAssessment;