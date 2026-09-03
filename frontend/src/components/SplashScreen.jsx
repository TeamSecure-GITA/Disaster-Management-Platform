import React, { useEffect, useState } from "react";
import logoImg from "../assets/logo.png";

/**
 * SplashScreen — WhatsApp-style logo intro animation.
 * Shows on every fresh page load; fades out after ~2.8 seconds.
 * Calls onComplete() so the parent can unmount it cleanly.
 */
export default function SplashScreen({ onComplete }) {
  // Phase: "in" → logo scales/fades in | "hold" → stays | "out" → overlay fades out
  const [phase, setPhase] = useState("in");

  useEffect(() => {
    // Scale in for 700ms → hold for 1200ms → fade out for 900ms
    const holdTimer = setTimeout(() => setPhase("out"), 1900);
    const doneTimer = setTimeout(() => {
      if (onComplete) onComplete();
    }, 2800);

    return () => {
      clearTimeout(holdTimer);
      clearTimeout(doneTimer);
    };
  }, [onComplete]);

  const overlayStyle = {
    position: "fixed",
    inset: 0,
    zIndex: 99999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    background: "radial-gradient(ellipse at center, #0b1f3a 0%, #020617 70%)",
    opacity: phase === "out" ? 0 : 1,
    transition: phase === "out" ? "opacity 0.9s cubic-bezier(0.4, 0, 0.2, 1)" : "none",
    pointerEvents: "none",
  };

  const logoWrapStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "20px",
    animation:
      phase === "in"
        ? "splash-logo-in 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) forwards"
        : "none",
  };

  const logoImgStyle = {
    width: "160px",
    height: "160px",
    objectFit: "contain",
    borderRadius: "50%",
    boxShadow: "0 0 60px rgba(56, 189, 248, 0.35), 0 0 120px rgba(37, 99, 235, 0.2)",
    filter: "drop-shadow(0 0 20px rgba(56, 189, 248, 0.4))",
  };

  const taglineStyle = {
    color: "#60a5fa",
    fontSize: "0.9rem",
    letterSpacing: "0.3em",
    textTransform: "uppercase",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    fontWeight: 500,
    opacity: phase === "in" ? 0 : 1,
    animation: phase === "in" ? "none" : "splash-tagline-in 0.5s ease 0.4s forwards",
  };

  const dotsStyle = {
    marginTop: "40px",
    display: "flex",
    gap: "8px",
  };

  return (
    <>
      <style>{`
        @keyframes splash-logo-in {
          0% { opacity: 0; transform: scale(0.55); }
          60% { opacity: 1; transform: scale(1.08); }
          80% { transform: scale(0.97); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes splash-tagline-in {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes splash-dot-bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-8px); opacity: 1; }
        }
        .splash-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #3b82f6;
          animation: splash-dot-bounce 1.2s ease-in-out infinite;
        }
        .splash-dot:nth-child(1) { animation-delay: 0s; }
        .splash-dot:nth-child(2) { animation-delay: 0.2s; }
        .splash-dot:nth-child(3) { animation-delay: 0.4s; }
      `}</style>

      <div style={overlayStyle} aria-hidden="true">
        <div style={logoWrapStyle}>
          <img src={logoImg} alt="Disaster Management" style={logoImgStyle} />
          <span style={taglineStyle}>Disaster Management Platform</span>
        </div>
        <div style={dotsStyle}>
          <span className="splash-dot" />
          <span className="splash-dot" />
          <span className="splash-dot" />
        </div>
      </div>
    </>
  );
}
