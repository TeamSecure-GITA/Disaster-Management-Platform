import React, { useState, useRef, useEffect } from "react";
import { askGemini } from "../services/geminiService";

const SUGGESTED_QUERIES = [
  "🫀 Adult CPR (Step-by-Step)",
  "🗣️ Choking (Heimlich Maneuver)",
  "🩸 Severe Bleeding & Tourniquet",
  "🌊 Trapped in Sudden Flood",
  "🌀 Cyclone Safety Protocol",
  "🌍 Earthquake Survival (Drop, Cover, Hold)",
  "🐍 Snakebite First Aid",
  "💧 How to Purify Drinking Water",
  "🎒 Emergency 72-Hour Survival Kit",
  "📞 National Emergency Helplines (India)",
];

function Chatbot() {
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hello! 👋 I am your Disaster Management & Emergency AI Assistant.\n\nI am engineered to work 100% autonomously both Online and completely Offline. Ask me anything about sudden flood survival, cyclone evacuation, earthquake safety, CPR/first-aid procedures, or water purification.",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isListening, setIsListening] = useState(false);
  const [speakingIndex, setSpeakingIndex] = useState(null);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Monitor online / offline state
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

  // Initialize Speech Recognition if supported
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-IN";

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported on this browser. You can type your query in the box below.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error("Speech recognition error:", err);
      }
    }
  };

  const handleSpeak = (text, index) => {
    if (!("speechSynthesis" in window)) {
      alert("Text-to-speech is not supported on this browser.");
      return;
    }

    if (speakingIndex === index) {
      window.speechSynthesis.cancel();
      setSpeakingIndex(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => setSpeakingIndex(null);
    utterance.onerror = () => setSpeakingIndex(null);

    setSpeakingIndex(index);
    window.speechSynthesis.speak(utterance);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const sendMessage = async (textToSend = null) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    const userMessageObj = {
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessageObj]);
    setInput("");
    setLoading(true);

    try {
      const botReply = await askGemini(text, messages);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: botReply,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "⚠️ Emergency Hotline Reminder: For immediate life threat, call 112 (National Emergency) or 108 (Ambulance). Always obey local evacuation directives.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    window.speechSynthesis?.cancel();
    setSpeakingIndex(null);
    setMessages([
      {
        sender: "bot",
        text: "Chat history cleared. How can I assist you with emergency response and disaster safety?",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  return (
    <div className="chatbot-page">
      <div className="chatbot-header">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <h1 style={{ margin: 0 }}>🤖 In-House Emergency AI Assistant</h1>
            <span
              style={{
                backgroundColor: isOnline ? "#059669" : "#d97706",
                color: "#ffffff",
                fontSize: "0.74rem",
                padding: "3px 10px",
                borderRadius: "999px",
                fontWeight: "700",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <span>{isOnline ? "●" : "⚡"}</span>
              <span>{isOnline ? "Hybrid AI (Online + Offline Brain)" : "100% Offline Autonomous AI Brain"}</span>
            </span>
          </div>
          <p>
            Autonomous life-safety engine: Answers all emergency questions, medical first-aid, evacuation instructions, and survival protocols with zero network dependency.
          </p>
        </div>
        <button
          type="button"
          onClick={clearChat}
          style={{
            background: "none",
            border: "1px solid #334155",
            color: "#94a3b8",
            padding: "6px 12px",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "0.8rem",
          }}
        >
          🗑️ Clear Chat
        </button>
      </div>

      {/* Suggestion Chips */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          flexWrap: "wrap",
          marginBottom: "16px",
        }}
      >
        {SUGGESTED_QUERIES.map((chip, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => sendMessage(chip)}
            disabled={loading}
            style={{
              padding: "6px 12px",
              backgroundColor: "#1e293b",
              border: "1px solid #334155",
              color: "#38bdf8",
              borderRadius: "999px",
              fontSize: "0.78rem",
              cursor: loading ? "wait" : "pointer",
              transition: "background 0.15s",
            }}
          >
            {chip}
          </button>
        ))}
      </div>

      <div className="chatbot-box">
        <div className="chatbot-messages" style={{ minHeight: "380px", maxHeight: "550px", overflowY: "auto" }}>
          {messages.map((message, index) => (
            <div
              key={index}
              className={
                message.sender === "user"
                  ? "message user-message"
                  : "message bot-message"
              }
              style={{ position: "relative" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <strong>
                  {message.sender === "user" ? "👤 You" : "✨ In-House AI Emergency Brain"}
                </strong>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "0.7rem", color: "#64748b" }}>
                    {message.timestamp}
                  </span>
                  {message.sender === "bot" && (
                    <button
                      type="button"
                      onClick={() => handleSpeak(message.text, index)}
                      title={speakingIndex === index ? "Stop voice" : "Read aloud"}
                      style={{
                        background: "none",
                        border: "none",
                        color: speakingIndex === index ? "#ef4444" : "#38bdf8",
                        cursor: "pointer",
                        fontSize: "0.85rem",
                        padding: "0 4px",
                      }}
                    >
                      {speakingIndex === index ? "⏹️ Stop" : "🔊 Read"}
                    </button>
                  )}
                </div>
              </div>

              <div style={{ whiteSpace: "pre-wrap", lineHeight: "1.5" }}>
                {message.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="message bot-message" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <strong>✨ In-House AI Assistant:</strong>
              <span style={{ color: "#38bdf8", fontStyle: "italic" }}>
                Retrieving life-safety emergency protocols...
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="chatbot-input-area" style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <input
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            placeholder={
              isOnline
                ? "Ask anything in any language (e.g., 'CPR steps', 'Cyclone shelter', 'Purify water')..."
                : "⚡ Offline Mode: Ask about CPR, floods, earthquakes, helplines, bleeding, water..."
            }
          />

          {/* Voice Input Mic Button */}
          <button
            type="button"
            onClick={toggleListening}
            title={isListening ? "Listening... Click to stop" : "Voice input"}
            style={{
              padding: "10px 14px",
              backgroundColor: isListening ? "#dc2626" : "#1e293b",
              border: `1px solid ${isListening ? "#ef4444" : "#334155"}`,
              borderRadius: "8px",
              color: "#fff",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              animation: isListening ? "pulse 1.2s infinite" : "none",
            }}
          >
            {isListening ? "🔴 Speak..." : "🎙️"}
          </button>

          <button onClick={() => sendMessage()} disabled={loading || !input.trim()}>
            {loading ? "Thinking..." : "Send ➤"}
          </button>
        </div>
      </div>

      <div className="chatbot-warning">
        🚨 <strong>Emergency Disclaimer:</strong> For immediate life danger, call <strong>112</strong> (National All-Emergency) or <strong>108</strong> (Ambulance). Obey all official evacuation directives.
      </div>
    </div>
  );
}

export default Chatbot;
