import React, { useState } from "react";

function Chatbot() {
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hello! 👋 I am your Disaster Management Assistant. Ask me about floods, cyclones, earthquakes, emergency preparedness, or rescue information."
    }
  ]);

  const [input, setInput] = useState("");

  const getBotResponse = (question) => {
    const text = question.toLowerCase();

    if (text.includes("flood")) {
      return "🌊 During a flood, move to higher ground, avoid walking or driving through floodwater, keep your emergency kit ready, and follow official evacuation instructions.";
    }

    if (text.includes("cyclone")) {
      return "🌀 During a cyclone, stay indoors away from windows, keep emergency supplies ready, charge essential devices, and follow official evacuation instructions.";
    }

    if (text.includes("earthquake")) {
      return "🌍 During an earthquake, Drop, Cover and Hold On. Stay away from windows and do not use elevators during the shaking.";
    }

    if (text.includes("fire")) {
      return "🔥 If there is a fire, move away from the danger area, use a safe exit, avoid smoke, and contact emergency services when it is safe to do so.";
    }

    if (
      text.includes("emergency") ||
      text.includes("help") ||
      text.includes("rescue")
    ) {
      return "🚨 For an emergency, use the Emergency Contacts page of this platform or contact your local emergency services. If you are in immediate danger, seek help from a trusted adult or nearby emergency personnel.";
    }

    if (text.includes("prepare") || text.includes("preparedness")) {
      return "🎒 Prepare an emergency kit with water, food, a flashlight, basic first-aid supplies, essential medicines, important documents, and a charged phone.";
    }

    if (text.includes("kit")) {
      return "🎒 An emergency kit can include drinking water, non-perishable food, flashlight, batteries, first-aid supplies, essential medicines, important documents, and a power bank.";
    }

    if (text.includes("hello") || text.includes("hi")) {
      return "Hello! 👋 How can I help you with disaster preparedness today?";
    }

    return "🤖 I can help with general disaster preparedness and safety information. Try asking: 'What should I do during a flood?', 'How do I prepare for a cyclone?', or 'What should be in an emergency kit?'";
  };

  const sendMessage = () => {
    if (!input.trim()) return;

    const userMessage = input.trim();

    setMessages((previous) => [
      ...previous,
      {
        sender: "user",
        text: userMessage
      },
      {
        sender: "bot",
        text: getBotResponse(userMessage)
      }
    ]);

    setInput("");
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.nativeEvent.isComposing) {
      sendMessage();
    }
  };

  return (
    <div className="chatbot-page">
      <div className="chatbot-header">
        <div>
          <h1>🤖 AI Disaster Assistant</h1>
          <p>
            Ask questions about disaster preparedness and emergency safety.
          </p>
        </div>
      </div>

      <div className="chatbot-box">
        <div className="chatbot-messages">
          {messages.map((message, index) => (
            <div
              key={index}
              className={
                message.sender === "user"
                  ? "message user-message"
                  : "message bot-message"
              }
            >
              <strong>
                {message.sender === "user" ? "You" : "🤖 Assistant"}
              </strong>

              <p>{message.text}</p>
            </div>
          ))}
        </div>

        <div className="chatbot-input-area">
          <input
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about floods, cyclones, earthquakes..."
          />

          <button onClick={sendMessage}>
            Send ➤
          </button>
        </div>
      </div>

      <div className="chatbot-warning">
        ⚠️ This assistant provides general safety information. For a
        real emergency, follow official emergency instructions and seek
        immediate help from local emergency services.
      </div>
    </div>
  );
}

export default Chatbot;
