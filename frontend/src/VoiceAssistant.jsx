import React, { useState } from "react";

function VoiceAssistant() {
  const [listening, setListening] = useState(false);
  const [text, setText] = useState("");
  const [response, setResponse] = useState(
    "Hello! 👋 I am your voice disaster assistant. Press the microphone and ask a safety question."
  );

  const speak = (message) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();

      const speech = new SpeechSynthesisUtterance(message);
      speech.lang = "en-IN";
      speech.rate = 0.9;

      window.speechSynthesis.speak(speech);
    }
  };

  const getResponse = (question) => {
    const q = question.toLowerCase();

    if (q.includes("flood")) {
      return "During a flood, move to higher ground, avoid floodwater, and follow official evacuation instructions.";
    }

    if (q.includes("cyclone")) {
      return "During a cyclone, stay indoors away from windows and follow official warnings and evacuation instructions.";
    }

    if (q.includes("earthquake")) {
      return "During an earthquake, Drop, Cover and Hold On. Stay away from windows and elevators.";
    }

    if (q.includes("fire")) {
      return "During a fire, leave the danger area using a safe exit and contact emergency services when safe.";
    }

    if (q.includes("emergency") || q.includes("help")) {
      return "If you are in immediate danger, contact local emergency services and seek help from nearby emergency personnel.";
    }

    if (q.includes("kit") || q.includes("prepare")) {
      return "An emergency kit can include water, non-perishable food, a flashlight, first-aid supplies, essential medicines, important documents and a charged phone.";
    }

    return "I can help with general disaster preparedness. Try asking about floods, cyclones, earthquakes, fires, emergency kits, or evacuation.";
  };

  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.continuous = false;

    setListening(true);

    recognition.onresult = (event) => {
      const spokenText = event.results[0][0].transcript;

      setText(spokenText);

      const botResponse = getResponse(spokenText);
      setResponse(botResponse);

      speak(botResponse);
    };

    recognition.onerror = () => {
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognition.start();
  };

  return (
    <div className="voice-page">
      <h1>🎙️ Voice Disaster Assistant</h1>

      <p>
        Speak your disaster-related question and receive a safety response.
      </p>

      <div className="voice-card">
        <div className={`microphone ${listening ? "listening" : ""}`}>
          🎙️
        </div>

        <h2>
          {listening ? "Listening..." : "Tap the microphone"}
        </h2>

        <button
          className="voice-button"
          onClick={startListening}
          disabled={listening}
        >
          {listening ? "🎙️ Listening..." : "🎤 Start Voice Assistant"}
        </button>

        {text && (
          <div className="voice-result">
            <h3>🗣️ You said:</h3>
            <p>{text}</p>
          </div>
        )}

        <div className="voice-response">
          <h3>🤖 Assistant:</h3>
          <p>{response}</p>

          <button
            className="speak-button"
            onClick={() => speak(response)}
          >
            🔊 Read Response
          </button>
        </div>
      </div>

      <div className="voice-examples">
        <h3>Try asking:</h3>

        <p>🌊 "What should I do during a flood?"</p>
        <p>🌀 "How should I prepare for a cyclone?"</p>
        <p>🌍 "What should I do during an earthquake?"</p>
        <p>🎒 "What should I keep in an emergency kit?"</p>
      </div>
    </div>
  );
}

export default VoiceAssistant;