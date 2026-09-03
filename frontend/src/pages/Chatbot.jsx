import React, { useState, useRef, useEffect } from "react";
import { askGemini } from "../services/geminiService";

const SUGGESTED_QUERIES = [
  "🌊 What should I do during a sudden flood?",
  "🌀 Cyclone safety: immediate steps",
  "🎒 What items should be in my emergency kit?",
  "🌍 How to survive an earthquake?",
  "⛺ How to find the nearest cyclone shelter?",
  "📞 National emergency helpline numbers in India",
];

function Chatbot() {
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hello! 👋 I am your Disaster Management & Emergency AI Assistant.\n\nAsk me anything about cyclone warnings, flood evacuation, earthquake safety, emergency survival kits, or first-aid guidance.",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

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
          text: "⚠️ I encountered an issue connecting to the AI service. Please call emergency hotline 112 for immediate life-safety assistance.",
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
    setMessages([
      {
        sender: "bot",
        text: "Chat cleared. How can I help you with disaster preparedness and emergency response?",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  return (
    <div className="chatbot-page">
      <div className="chatbot-header">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ margin: 0 }}>🤖 AI Disaster Assistant</h1>
            <span
              style={{
                backgroundColor: "#059669",
                color: "#ffffff",
                fontSize: "0.72rem",
                padding: "2px 8px",
                borderRadius: "999px",
                fontWeight: "700",
              }}
            >
              ● AI Live
            </span>
          </div>
          <p>
            Real-time AI emergency instructions, disaster safety protocols, and preparedness advice.
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
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                <strong>
                  {message.sender === "user" ? "👤 You" : "✨ AI Assistant"}
                </strong>
                <span style={{ fontSize: "0.7rem", color: "#64748b" }}>
                  {message.timestamp}
                </span>
              </div>

              <div style={{ whiteSpace: "pre-wrap", lineHeight: "1.5" }}>
                {message.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="message bot-message" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <strong>✨ AI Assistant:</strong>
              <span style={{ color: "#38bdf8", fontStyle: "italic" }}>
                Thinking and retrieving life-safety protocols...
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="chatbot-input-area">
          <input
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            placeholder="Ask AI Assistant about cyclone, flood evacuation, first aid, kit checklist..."
          />

          <button onClick={() => sendMessage()} disabled={loading || !input.trim()}>
            {loading ? "Thinking..." : "Send ➤"}
          </button>
        </div>
      </div>

      <div className="chatbot-warning">
        🚨 <strong>Emergency Disclaimer:</strong> For immediate life danger, call <strong>112</strong> (All Emergencies) or <strong>108</strong> (Ambulance). Always obey evacuation orders from local authorities.
      </div>
    </div>
  );
}

export default Chatbot;
