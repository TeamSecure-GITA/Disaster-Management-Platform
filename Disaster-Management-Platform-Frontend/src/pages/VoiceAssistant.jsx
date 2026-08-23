import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

function VoiceAssistant() {
  const navigate = useNavigate();

  const recognitionRef = useRef(null);

  const [listening, setListening] = useState(false);
  const [voiceAvailable, setVoiceAvailable] = useState(true);
  const [command, setCommand] = useState("");
  const [response, setResponse] = useState(
    "Hello! I am your Disaster Voice Assistant. How can I help you?"
  );

  // -----------------------------------
  // FEMALE / CLEAR VOICE
  // -----------------------------------
  const speak = (text) => {
    if (!window.speechSynthesis) {
      return;
    }

    window.speechSynthesis.cancel();

    const voices = window.speechSynthesis.getVoices();

    const preferredVoice =
      voices.find((voice) =>
        /female|zira|samantha|karen|susan|google uk english female|google us english/i.test(
          voice.name
        )
      ) ||
      voices.find((voice) =>
        /en-IN|en-US|en-GB/i.test(voice.lang)
      ) ||
      voices[0];

    const speech = new SpeechSynthesisUtterance(text);

    if (preferredVoice) {
      speech.voice = preferredVoice;
    }

    speech.lang = "en-IN";
    speech.rate = 0.9;
    speech.pitch = 1.08;
    speech.volume = 1;

    window.speechSynthesis.speak(speech);
  };

  // -----------------------------------
  // LOAD VOICES
  // -----------------------------------
  useEffect(() => {
    const loadVoices = () => {
      window.speechSynthesis?.getVoices();
    };

    loadVoices();

    window.speechSynthesis?.addEventListener(
      "voiceschanged",
      loadVoices
    );

    return () => {
      window.speechSynthesis?.removeEventListener(
        "voiceschanged",
        loadVoices
      );

      window.speechSynthesis?.cancel();

      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // -----------------------------------
  // COMMAND PROCESSOR
  // -----------------------------------
  const processCommand = (input) => {
    const text = input.toLowerCase().trim();

    if (!text) {
      return;
    }

    setCommand(input);

    // Dashboard
    if (
      text.includes("dashboard") ||
      text.includes("home")
    ) {
      const message = "Opening the disaster management dashboard.";

      setResponse(message);
      speak(message);

      setTimeout(() => {
        navigate("/");
      }, 500);

      return;
    }

    // Alerts
    if (
      text.includes("alert") ||
      text.includes("disaster alert")
    ) {
      const message = "Opening disaster alerts.";

      setResponse(message);
      speak(message);

      setTimeout(() => {
        navigate("/alerts");
      }, 500);

      return;
    }

    // Map
    if (
      text.includes("map") ||
      text.includes("disaster map") ||
      text.includes("response map")
    ) {
      const message = "Opening the disaster response map.";

      setResponse(message);
      speak(message);

      setTimeout(() => {
        navigate("/map");
      }, 500);

      return;
    }

    // Emergency
    if (
      text.includes("emergency") ||
      text.includes("emergency help") ||
      text.includes("sos")
    ) {
      const message =
        "Opening Emergency Help. Please stay calm and follow the emergency instructions.";

      setResponse(message);
      speak(message);

      setTimeout(() => {
        navigate("/emergency");
      }, 500);

      return;
    }

    // Family Safety
    if (
      text.includes("family") ||
      text.includes("family safety")
    ) {
      const message = "Opening Family Safety Tracker.";

      setResponse(message);
      speak(message);

      setTimeout(() => {
        navigate("/family-safety");
      }, 500);

      return;
    }

    // Shelter
    if (
      text.includes("shelter") ||
      text.includes("shelter finder")
    ) {
      const message = "Opening the Shelter Finder.";

      setResponse(message);
      speak(message);

      setTimeout(() => {
        navigate("/shelter-finder");
      }, 500);

      return;
    }

    // Notifications
    if (
      text.includes("notification") ||
      text.includes("notifications")
    ) {
      const message = "Opening notifications.";

      setResponse(message);
      speak(message);

      setTimeout(() => {
        navigate("/notifications");
      }, 500);

      return;
    }

    // Settings
    if (text.includes("settings")) {
      const message = "Opening settings.";

      setResponse(message);
      speak(message);

      setTimeout(() => {
        navigate("/settings");
      }, 500);

      return;
    }

    // Help
    if (
      text.includes("what can you do") ||
      text.includes("help me")
    ) {
      const message =
        "I can open the dashboard, disaster alerts, disaster map, emergency help, family safety, shelter finder, notifications and settings.";

      setResponse(message);
      speak(message);

      return;
    }

    // Greeting
    if (
      text === "hi" ||
      text === "hello" ||
      text === "hey"
    ) {
      const message =
        "Hello! I am your Disaster Voice Assistant. How can I help you today?";

      setResponse(message);
      speak(message);

      return;
    }

    // Unknown command
    const message =
      "I could not understand that command. Please use one of the commands shown below.";

    setResponse(message);
    speak(message);
  };

  // -----------------------------------
  // MICROPHONE
  // -----------------------------------
  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceAvailable(false);

      setResponse(
        "Voice recognition is not available in this browser. You can type your command below."
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
        setResponse("🎙️ I am listening. Please speak your command.");
      };

      recognition.onresult = (event) => {
        const spokenText =
          event.results[0][0].transcript;

        setListening(false);
        setCommand(spokenText);

        processCommand(spokenText);
      };

      recognition.onerror = (event) => {
        console.log(
          "Voice recognition unavailable:",
          event.error
        );

        setListening(false);

        // Do NOT show the confusing network error.
        setVoiceAvailable(false);

        setResponse(
          "Voice recognition is temporarily unavailable. Please type your command below."
        );
      };

      recognition.onend = () => {
        setListening(false);
      };

      recognitionRef.current = recognition;

      recognition.start();
    } catch (error) {
      console.log(error);

      setListening(false);
      setVoiceAvailable(false);

      setResponse(
        "Voice recognition is unavailable. Please use the text command box below."
      );
    }
  };

  // -----------------------------------
  // STOP MICROPHONE
  // -----------------------------------
  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    setListening(false);
  };

  // -----------------------------------
  // TEXT COMMAND
  // -----------------------------------
  const handleTextCommand = (event) => {
    event.preventDefault();

    processCommand(command);
  };

  // -----------------------------------
  // QUICK COMMAND
  // -----------------------------------
  const quickCommand = (text) => {
    setCommand(text);
    processCommand(text);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "30px",
        background:
          "linear-gradient(135deg, #07111f, #0b1f3a, #123b63)",
        color: "#ffffff",
        fontFamily:
          "Arial, Helvetica, sans-serif",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
        }}
      >
        {/* HEADER */}
        <div
          style={{
            textAlign: "center",
            marginBottom: "30px",
          }}
        >
          <div
            style={{
              fontSize: "55px",
              marginBottom: "10px",
            }}
          >
            🎙️
          </div>

          <h1
            style={{
              margin: "0",
              fontSize: "32px",
              fontWeight: "800",
            }}
          >
            Disaster Voice Assistant
          </h1>

          <p
            style={{
              color: "#c9d8ea",
              fontSize: "16px",
            }}
          >
            Your intelligent frontend emergency navigation assistant
          </p>
        </div>

        {/* ASSISTANT RESPONSE */}
        <div
          style={{
            background:
              "rgba(255,255,255,0.08)",
            border:
              "1px solid rgba(255,255,255,0.15)",
            borderRadius: "18px",
            padding: "25px",
            marginBottom: "20px",
            boxShadow:
              "0 15px 40px rgba(0,0,0,0.25)",
          }}
        >
          <h2
            style={{
              marginTop: 0,
              fontSize: "20px",
            }}
          >
            🤖 Assistant
          </h2>

          <p
            style={{
              fontSize: "17px",
              lineHeight: "1.6",
              color: "#e8f1ff",
            }}
          >
            {response}
          </p>
        </div>

        {/* VOICE BUTTON */}
        <div
          style={{
            textAlign: "center",
            marginBottom: "25px",
          }}
        >
          {!listening ? (
            <button
              onClick={startListening}
              style={{
                padding: "16px 30px",
                border: "none",
                borderRadius: "12px",
                background:
                  "linear-gradient(135deg, #ff4d5a, #d9263d)",
                color: "#ffffff",
                fontSize: "17px",
                fontWeight: "700",
                cursor: "pointer",
                boxShadow:
                  "0 8px 25px rgba(255,60,80,0.35)",
              }}
            >
              🎤 Start Voice Assistant
            </button>
          ) : (
            <button
              onClick={stopListening}
              style={{
                padding: "16px 30px",
                border: "none",
                borderRadius: "12px",
                background: "#b91c1c",
                color: "#ffffff",
                fontSize: "17px",
                fontWeight: "700",
                cursor: "pointer",
              }}
            >
              🔴 Stop Listening
            </button>
          )}
        </div>

        {/* TEXT FALLBACK */}
        <form
          onSubmit={handleTextCommand}
          style={{
            background:
              "rgba(255,255,255,0.06)",
            padding: "22px",
            borderRadius: "18px",
            marginBottom: "25px",
          }}
        >
          <h3
            style={{
              marginTop: 0,
            }}
          >
            💬 Type a command
          </h3>

          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            <input
              type="text"
              value={command}
              onChange={(e) =>
                setCommand(e.target.value)
              }
              placeholder="Example: Open disaster alerts"
              style={{
                flex: "1",
                minWidth: "250px",
                padding: "14px",
                borderRadius: "10px",
                border:
                  "1px solid #4777a8",
                background: "#08182c",
                color: "#ffffff",
                fontSize: "15px",
                outline: "none",
              }}
            />

            <button
              type="submit"
              style={{
                padding: "14px 22px",
                border: "none",
                borderRadius: "10px",
                background: "#2563eb",
                color: "#ffffff",
                fontWeight: "700",
                cursor: "pointer",
              }}
            >
              Send
            </button>
          </div>
        </form>

        {/* QUICK COMMANDS */}
        <div
          style={{
            background:
              "rgba(255,255,255,0.06)",
            padding: "25px",
            borderRadius: "18px",
          }}
        >
          <h2
            style={{
              marginTop: 0,
            }}
          >
            ⚡ Quick Commands
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(190px, 1fr))",
              gap: "12px",
            }}
          >
            {[
              ["📊", "Open Dashboard"],
              ["🚨", "Show Disaster Alerts"],
              ["🗺️", "Open Disaster Map"],
              ["🆘", "Emergency Help"],
              ["👨‍👩‍👧", "Family Safety"],
              ["🏠", "Find Shelter"],
              ["🔔", "Notifications"],
              ["⚙️", "Open Settings"],
            ].map(([icon, label]) => (
              <button
                key={label}
                onClick={() =>
                  quickCommand(label)
                }
                style={{
                  padding: "16px",
                  borderRadius: "12px",
                  border:
                    "1px solid rgba(255,255,255,0.15)",
                  background:
                    "rgba(255,255,255,0.08)",
                  color: "#ffffff",
                  fontSize: "14px",
                  fontWeight: "700",
                  cursor: "pointer",
                  textAlign: "left",
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
            marginTop: "20px",
            textAlign: "center",
            color: "#b9c9dc",
            fontSize: "13px",
          }}
        >
          {voiceAvailable
            ? "🎙️ Voice mode available"
            : "💬 Text command mode active"}
        </div>
      </div>
    </div>
  );
}

export default VoiceAssistant;