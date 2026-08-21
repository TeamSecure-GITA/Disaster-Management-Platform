import React, { useState } from 'react';

const KNOWLEDGE_BASE = {
  cpr: "CPR Steps: 1. Push hard and fast on the center of the chest (100-120 bpm). 2. Tilt head back for rescue breaths if trained. 3. Continue until help arrives.",
  flood: "Flood Safety: Move to higher ground immediately. Avoid walking or driving through moving water. Disconnect electrical appliances.",
  burn: "Burn First Aid: Cool the burn under cold running water for at least 10 minutes. Cover loosely with sterile cling wrap. Do not apply ice.",
  fracture: "Fracture Response: Immobilize the injured area. Do not try to realign the bone. Apply ice packs wrapped in cloth to reduce swelling."
};

export default function OfflineChatbot() {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hello! I am your offline First Aid Assistant. Ask me about CPR, Burns, Floods, or Fractures.' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input.toLowerCase();
    let reply = "Sorry, I don't have offline instructions for that. Try asking about CPR, Floods, Burns, or Fractures.";

    if (userMsg.includes('cpr')) reply = KNOWLEDGE_BASE.cpr;
    else if (userMsg.includes('flood')) reply = KNOWLEDGE_BASE.flood;
    else if (userMsg.includes('burn')) reply = KNOWLEDGE_BASE.burn;
    else if (userMsg.includes('fracture') || userMsg.includes('bone')) reply = KNOWLEDGE_BASE.fracture;

    setMessages((prev) => [
      ...prev,
      { sender: 'user', text: input },
      { sender: 'bot', text: reply }
    ]);
    setInput('');
  };

  return (
    <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '20px', marginBottom: '1.5rem' }}>
      <h2 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '10px' }}>🤖 Offline Emergency AI Chatbot</h2>
      <div style={{ height: '180px', overflowY: 'auto', backgroundColor: '#0f172a', padding: '12px', borderRadius: '8px', marginBottom: '10px' }}>
        {messages.map((m, idx) => (
          <div key={idx} style={{ textAlign: m.sender === 'user' ? 'right' : 'left', marginBottom: '8px' }}>
            <span style={{ display: 'inline-block', padding: '6px 12px', borderRadius: '8px', backgroundColor: m.sender === 'user' ? '#2563eb' : '#334155', color: '#fff', fontSize: '0.85rem' }}>
              {m.text}
            </span>
          </div>
        ))}
      </div>
      <form onSubmit={handleSend} style={{ display: 'flex', gap: '8px' }}>
        <input
          type="text"
          placeholder="Ask for help (e.g., CPR steps)..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{ flex: 1, padding: '8px 12px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#fff' }}
        />
        <button type="submit" style={{ backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold' }}>Send</button>
      </form>
    </div>
  );
}