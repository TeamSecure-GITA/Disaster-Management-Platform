import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { askGemini } from "../services/geminiService";

function VoiceAssistant() {
  const navigate = useNavigate();
  const recognitionRef = useRef(null);

  const [listening, setListening] = useState(false);
  const [voiceAvailable, setVoiceAvailable] = useState(true);
  const [command, setCommand] = useState("");
  const [processing, setProcessing] = useState(false);
  const [response, setResponse] = useState(
    "Hello! I am your Disaster Voice Assistant. Speak or type any emergency question or navigation command."
  );

  // ─── FEMALE / CLEAR VOICE SPEECH SYNTHESIS ──────────────────────────────────
  const speak = (text) => {
    if (!("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();

    // Clean markdown asterisks and symbols for cleaner vocalization
    const cleanSpeech = text
      .replace(/[*_#`~]/g, "")
      .replace(/https?:\/\/\S+/g, "")
      .replace(/\n+/g, ". ");

    const utterance = new SpeechSynthesisUtterance(cleanSpeech);
    utterance.pitch = 1.05;
    utterance.rate = 1.0;
    utterance.lang = "en-IN";

    const setFemaleVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(
        (v) =>
          v.name.includes("Google UK English Female") ||
          v.name.includes("Google US English") ||
          v.name.includes("Microsoft Zira") ||
          v.name.includes("Samantha") ||
          v.name.includes("Victoria") ||
          (v.lang.startsWith("en") && v.name.toLowerCase().includes("female"))
      );

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      window.speechSynthesis.speak(utterance);
    };

    if (window.speechSynthesis.getVoices().length !== 0) {
      setFemaleVoice();
    } else {
      window.speechSynthesis.onvoiceschanged = setFemaleVoice;
    }
  };

  useEffect(() => {
    const loadVoices = () => {
      window.speechSynthesis?.getVoices();
    };

    loadVoices();
    window.speechSynthesis?.addEventListener("voiceschanged", loadVoices);

    return () => {
      window.speechSynthesis?.removeEventListener("voiceschanged", loadVoices);
      window.speechSynthesis?.cancel();
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // ─── COMMAND & GEMINI PROCESSOR ─────────────────────────────────────────────
  const processCommand = async (input) => {
    const text = input.toLowerCase().trim();
    if (!text) return;

    setCommand(input);

    // 1. Direct Page Navigation Commands
    if (text.includes("dashboard") || text.includes("home")) {
      const msg = "Opening the disaster management dashboard.";
      setResponse(msg);
      speak(msg);
      setTimeout(() => navigate("/"), 600);
      return;
    }

    if (text.includes("alert") || text.includes("disaster alert")) {
      const msg = "Opening disaster alerts and early warnings.";
      setResponse(msg);
      speak(msg);
      setTimeout(() => navigate("/alerts"), 600);
      return;
    }

    if (text.includes("map") || text.includes("hospital") || text.includes("rescue map")) {
      const msg = "Opening the Live Disaster Response Map with hospitals and rescue centers.";
      setResponse(msg);
      speak(msg);
      setTimeout(() => navigate("/map"), 600);
      return;
    }

    if (text.includes("emergency") || text.includes("sos") || text.includes("danger")) {
      const msg = "Opening Emergency SOS. Please stay calm, help is being organized.";
      setResponse(msg);
      speak(msg);
      setTimeout(() => navigate("/emergency-sos"), 600);
      return;
    }

    if (text.includes("shelter") || text.includes("refuge") || text.includes("camp")) {
      const msg = "Opening the Emergency Shelter Finder.";
      setResponse(msg);
      speak(msg);
      setTimeout(() => navigate("/shelter-finder"), 600);
      return;
    }

    if (text.includes("family") || text.includes("family safety")) {
      const msg = "Opening Family Safety Tracker.";
      setResponse(msg);
      speak(msg);
      setTimeout(() => navigate("/family-safety"), 600);
      return;
    }

    if (text.includes("notification") || text.includes("notifications")) {
      const msg = "Opening emergency notifications.";
      setResponse(msg);
      speak(msg);
      setTimeout(() => navigate("/notifications"), 600);
      return;
    }

    if (text.includes("profile") || text.includes("my profile")) {
      const msg = "Opening your Disaster Responder Profile.";
      setResponse(msg);
      speak(msg);
      setTimeout(() => navigate("/profile"), 600);
      return;
    }

    if (text.includes("settings")) {
      const msg = "Opening settings.";
      setResponse(msg);
      speak(msg);
      setTimeout(() => navigate("/settings"), 600);
      return;
    }

    // 2. Query AI for Disaster Safety Answers
    setProcessing(true);
    setResponse("✨ Consulting AI Assistant for disaster response guidance...");

    try {
      const answer = await askGemini(input);
      setResponse(answer);
      speak(answer);
    } catch {
      const fallbackMsg = "For immediate emergencies, please dial 112 or 108. Stay calm and follow official local evacuation guidance.";
      setResponse(fallbackMsg);
      speak(fallbackMsg);
    } finally {
      setProcessing(false);
    }
  };

  // ─── SPEECH RECOGNITION ─────────────────────────────────────────────────────
  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceAvailable(false);
      setResponse(
        "Voice recognition is not supported in this browser. You can type your command or question in the box below."
      );
      return;
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }

      const recognition = new SpeechRecognition();
      recognition.lang = "en-IN";
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setListening(true);
        setResponse("🎙️ Listening... Ask any disaster question or say a navigation command (e.g. 'Open Map', 'How to prepare for cyclone').");
      };

      recognition.onresult = (event) => {
        const spokenText = event.results[0][0].transcript;
        setListening(false);
        setCommand(spokenText);
        processCommand(spokenText);
      };

      recognition.onerror = (event) => {
        console.warn("Speech recognition notice:", event.error);
        setListening(false);
        setResponse("🎙️ Did not catch speech clearly. Click to speak again or type below.");
      };

      recognition.onend = () => {
        setListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (error) {
      console.warn("Voice assistant error:", error);
      setListening(false);
      setResponse("Voice recognition is ready. Click the microphone button to start.");
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setListening(false);
  };

  const handleTextCommand = (event) => {
    event.preventDefault();
    if (!command.trim() || processing) return;
    processCommand(command);
  };

  const quickCommand = (text) => {
    setCommand(text);
    processCommand(text);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "30px 20px",
        background: "linear-gradient(135deg, #07111f, #0b1f3a, #123b63)",
        color: "#ffffff",
        fontFamily: "Arial, Helvetica, sans-serif",
        boxSizing: "border-box",
      }}
    >
      <div style={{ maxWidth: "860px", margin: "0 auto" }}>
        {/* HEADER */}
        <div style={{ textAlign: "center", marginBottom: "26px" }}>
          <div style={{ fontSize: "50px", marginBottom: "8px" }}>🎙️</div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
            <h1 style={{ margin: 0, fontSize: "30px", fontWeight: "800" }}>
              AI Voice Assistant
            </h1>
            <span
              style={{
                backgroundColor: "#2563eb",
                color: "#fff",
                fontSize: "0.75rem",
                fontWeight: "700",
                padding: "3px 10px",
                borderRadius: "999px",
              }}
            >
              ✨ Voice Active
            </span>
          </div>
          <p style={{ color: "#c9d8ea", fontSize: "15px", marginTop: "8px" }}>
            Speak naturally to navigate the platform or receive real-time AI emergency instructions
          </p>
        </div>

        {/* ASSISTANT RESPONSE CARD */}
        <div
          style={{
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.18)",
            borderRadius: "18px",
            padding: "24px",
            marginBottom: "22px",
            boxShadow: "0 15px 40px rgba(0,0,0,0.3)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <h2 style={{ margin: 0, fontSize: "18px", color: "#38bdf8" }}>
              🤖 AI Assistant Response
            </h2>
            {processing && (
              <span style={{ fontSize: "0.8rem", color: "#60a5fa" }}>
                ⏳ Generating AI speech...
              </span>
            )}
          </div>

          <div
            style={{
              fontSize: "16px",
              lineHeight: "1.6",
              color: "#e8f1ff",
              whiteSpace: "pre-wrap",
            }}
          >
            {response}
          </div>
        </div>

        {/* VOICE BUTTON */}
        <div style={{ textAlign: "center", marginBottom: "25px" }}>
          {!listening ? (
            <button
              onClick={startListening}
              disabled={processing}
              style={{
                padding: "16px 36px",
                border: "none",
                borderRadius: "14px",
                background: "linear-gradient(135deg, #ef4444, #dc2626)",
                color: "#ffffff",
                fontSize: "17px",
                fontWeight: "700",
                cursor: processing ? "wait" : "pointer",
                boxShadow: "0 8px 25px rgba(239, 68, 68, 0.4)",
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                transition: "transform 0.1s",
              }}
            >
              <span>🎤</span>
              <span>Start Speaking</span>
            </button>
          ) : (
            <button
              onClick={stopListening}
              style={{
                padding: "16px 36px",
                border: "none",
                borderRadius: "14px",
                background: "#b91c1c",
                color: "#ffffff",
                fontSize: "17px",
                fontWeight: "700",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                animation: "pulse 1.5s infinite",
              }}
            >
              <span>🔴</span>
              <span>Stop Listening</span>
            </button>
          )}
        </div>

        {/* TEXT COMMAND INPUT */}
        <form
          onSubmit={handleTextCommand}
          style={{
            background: "rgba(255,255,255,0.06)",
            padding: "20px",
            borderRadius: "16px",
            marginBottom: "24px",
          }}
        >
          <h3 style={{ marginTop: 0, fontSize: "15px", color: "#93c5fd" }}>
            💬 Or Type Your Emergency Question / Command:
          </h3>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <input
              type="text"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              disabled={processing}
              placeholder="Example: What are the flood survival steps? or 'Open map'"
              style={{
                flex: "1",
                minWidth: "250px",
                padding: "13px 16px",
                borderRadius: "10px",
                border: "1px solid #3b82f6",
                background: "#08182c",
                color: "#ffffff",
                fontSize: "15px",
                outline: "none",
              }}
            />

            <button
              type="submit"
              disabled={processing || !command.trim()}
              style={{
                padding: "13px 24px",
                border: "none",
                borderRadius: "10px",
                background: "#2563eb",
                color: "#ffffff",
                fontWeight: "700",
                fontSize: "15px",
                cursor: processing ? "wait" : "pointer",
              }}
            >
              {processing ? "Asking..." : "Ask Assistant ➤"}
            </button>
          </div>
        </form>

        {/* QUICK COMMANDS */}
        <div
          style={{
            background: "rgba(255,255,255,0.06)",
            padding: "22px",
            borderRadius: "16px",
          }}
        >
          <h2 style={{ marginTop: 0, fontSize: "16px", color: "#93c5fd" }}>
            ⚡ Voice & Navigation Shortcuts
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
              gap: "10px",
            }}
          >
            {[
              ["🗺️", "Open Disaster Map"],
              ["🏥", "Find Nearest Hospital"],
              ["🚨", "Show Disaster Alerts"],
              ["🆘", "Emergency Help SOS"],
              ["⛺", "Find Cyclone Shelter"],
              ["🎒", "Emergency Kit Checklist"],
              ["🌊", "Flood Survival Steps"],
              ["🌀", "Cyclone Safety Rules"],
            ].map(([icon, label]) => (
              <button
                key={label}
                type="button"
                onClick={() => quickCommand(label)}
                disabled={processing}
                style={{
                  padding: "14px",
                  borderRadius: "10px",
                  border: "1px solid rgba(255,255,255,0.15)",
                  background: "rgba(255,255,255,0.08)",
                  color: "#ffffff",
                  fontSize: "13.5px",
                  fontWeight: "600",
                  cursor: processing ? "wait" : "pointer",
                  textAlign: "left",
                  transition: "background 0.15s",
                }}
              >
                {icon} {label}
              </button>
            ))}
          </div>
        </div>

        {/* STATUS */}
        <div
          style={{
            marginTop: "18px",
            textAlign: "center",
            color: "#94a3b8",
            fontSize: "13px",
          }}
        >
          {voiceAvailable
            ? "🎙️ Audio Synthesis & Speech Engine Online"
            : "💬 Text input mode active"}
        </div>
      </div>
    </div>
  );
}

export default VoiceAssistant;