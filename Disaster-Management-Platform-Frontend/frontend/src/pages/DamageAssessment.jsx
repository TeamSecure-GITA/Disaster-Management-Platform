import React, { useState } from "react";

function DamageAssessment() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [assessment, setAssessment] = useState(null);

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

    // Frontend demonstration only
    setAssessment({
      damageLevel: "Moderate",
      affectedArea: "Building / Infrastructure",
      confidence: "Demo Result",
      recommendation:
        "Keep people away from potentially unsafe structures and follow instructions from local emergency authorities.",
    });
  };

  return (
    <div className="damage-page">
      <h1>🛰️ AI Damage Assessment</h1>

      <p>
        Upload a disaster image to view a simulated damage assessment.
      </p>

      <div className="damage-card">
        <label className="upload-box">
          📷
          <span>Upload Disaster Image</span>

          <input
            type="file"
            accept="image/*"
            onChange={handleImage}
          />
        </label>

        {preview && (
          <div className="image-preview">
            <h3>📸 Selected Image</h3>

            <img src={preview} alt="Disaster preview" />
          </div>
        )}

        <button
          className="analyze-btn"
          onClick={analyzeDamage}
        >
          🤖 Analyze Damage
        </button>
      </div>

      {assessment && (
        <div className="assessment-result">
          <h2>📊 Assessment Result</h2>

          <div className="assessment-item">
            <strong>Damage Level:</strong>
            <span>{assessment.damageLevel}</span>
          </div>

          <div className="assessment-item">
            <strong>Affected Area:</strong>
            <span>{assessment.affectedArea}</span>
          </div>

          <div className="assessment-item">
            <strong>Analysis:</strong>
            <span>{assessment.confidence}</span>
          </div>

          <div className="recommendation">
            <strong>⚠️ Recommendation</strong>
            <p>{assessment.recommendation}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default DamageAssessment;