// ─────────────────────────────────────────────────────────────────────────────
// src/services/geminiService.js
//
// Google Gemini AI service for Disaster Management & Emergency Response.
// Connects to Google Gemini API (gemini-2.5-flash / gemini-1.5-flash)
// with backend proxy support and local emergency response fallbacks.
// ─────────────────────────────────────────────────────────────────────────────

const GEMINI_API_KEY =
  import.meta.env.VITE_GEMINI_API_KEY ||
  import.meta.env.VITE_FIREBASE_API_KEY ||
  "";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const SYSTEM_PROMPT = `
You are the Official AI Disaster Management & Emergency Response Assistant for the Disaster Management Platform.
Your purpose is to provide immediate, clear, life-saving, and actionable emergency advice for natural and man-made disasters:
- Cyclones, Floods, Earthquakes, Landslides, Wildfires, Tsunamis, Heatwaves, Chemical Spills, Building Collapses.

Key Guidelines:
1. Always prioritize immediate human life safety first.
2. Provide concise, step-by-step, bulleted instructions that are fast and easy to read during stressful emergencies.
3. Mention official emergency contact numbers where relevant:
   - 112: National Emergency Number (All-in-one: Police, Fire, Ambulance)
   - 108: Emergency Medical & Ambulance Service
   - 1070: State Disaster Management Authority (SDMA)
   - 1077: District Disaster Management Control Room
   - 1091: Women Safety & Distress Helpline
4. Remind users to stay tuned to local official alerts, follow official evacuation orders, and avoid fake news.
5. If the user asks general questions, provide helpful, well-structured, professional responses tailored to disaster preparedness, survival kits, and emergency recovery.
6. Identity Directive: Never identify yourself as Gemini, Google Gemini, or mention any Google/Gemini branding in your answers. If asked who you are or what system you use, always identify yourself strictly as the "Disaster Management & Emergency AI Assistant".
`;

// ─── Local Knowledge Base Fallback ──────────────────────────────────────────
const LOCAL_DISASTER_KNOWLEDGE = {
  flood:
    "🌊 **Flood Safety Instructions:**\n1. Move to higher ground immediately.\n2. Do NOT walk, swim, or drive through floodwater ('Turn Around, Don't Drown').\n3. Switch off main electrical supplies and gas valves.\n4. Keep your Emergency Kit with drinking water, dry food, and medicines ready.\n5. Call **112** (Emergency) or **108** (Ambulance) for urgent rescue.",
  cyclone:
    "🌀 **Cyclone Safety Instructions:**\n1. Stay indoors away from windows, glass doors, and tin roofs.\n2. Keep battery radios, power banks, and torches charged.\n3. Secure loose outdoor objects or move to the nearest Cyclone Shelter.\n4. Do not venture outdoors during the calm 'eye of the storm'.\n5. Call **1070** (Disaster Control) or **112** for emergency evacuation.",
  earthquake:
    "🌍 **Earthquake Safety Instructions:**\n1. **DROP, COVER, and HOLD ON** under a sturdy desk or table.\n2. Stay away from windows, heavy furniture, and exterior walls.\n3. If outdoors, move to an open area away from power lines and tall buildings.\n4. Do NOT use elevators.\n5. After shaking stops, check for gas leaks and structural damage.",
  fire:
    "🔥 **Fire Safety Instructions:**\n1. Get out immediately and stay low under smoke.\n2. Check door handles with the back of your hand before opening.\n3. Call **101** (Fire) or **112** immediately.\n4. If clothes catch fire: **STOP, DROP, and ROLL**.\n5. Never use elevators during a fire.",
  kit:
    "🎒 **Emergency Survival Kit Checklist:**\n- 💧 Drinking water (at least 3 liters/person/day for 3 days)\n- 🥫 Non-perishable dry food & energy bars\n- 🔦 LED Flashlight + extra batteries\n- 🩹 First-aid kit & essential prescription medications\n- 🔋 Power bank & emergency whistle\n- 📄 Sealed waterproof pouch with IDs & vital documents\n- 📻 Battery-operated emergency radio",
  shelter:
    "⛺ **Shelter & Evacuation Guidance:**\n- Check the **Shelter Finder** or **Live Map** tab in this platform to locate nearest active shelter camps.\n- Bring your emergency kit, photo ID, essential medicines, and blankets.\n- Follow designated evacuation routes; avoid waterlogged bridges and damaged roads.",
};

/**
 * Send a message to AI Engine (Gemini API or Backend Proxy)
 * @param {string} userMessage - User query
 * @param {Array} history - Previous messages array [{ sender: 'user'|'bot', text: string }]
 * @returns {Promise<string>}
 */
export async function askGemini(userMessage, history = []) {
  if (!userMessage || !userMessage.trim()) {
    return "Please enter a question or emergency topic.";
  }

  const query = userMessage.trim();

  // 1. Try Backend Chat API first if backend is reachable
  try {
    const res = await fetch(`${API_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: query }),
    });

    if (res.ok) {
      const json = await res.json();
      if (json.data?.message && !json.data?.fallback) {
        return json.data.message;
      }
    }
  } catch {
    // Backend unavailable, proceed to direct client API or local fallback
  }

  // 2. Direct Gemini REST API call (runs internally)
  const keyToUse =
    GEMINI_API_KEY ||
    localStorage.getItem("custom_gemini_api_key") ||
    localStorage.getItem("gemini_api_key");

  if (keyToUse) {
    try {
      const formattedContents = [
        {
          role: "user",
          parts: [{ text: `${SYSTEM_PROMPT}\n\nUser Question: ${query}` }],
        },
      ];

      // Format previous history (last 4 turns for context)
      if (history.length > 0) {
        const recentHistory = history.slice(-4);
        const historyParts = recentHistory.map((msg) => ({
          role: msg.sender === "user" ? "user" : "model",
          parts: [{ text: msg.text }],
        }));
        formattedContents.unshift(...historyParts);
      }

      // Try gemini-2.0-flash / gemini-1.5-flash
      const endpoints = [
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${keyToUse}`,
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${keyToUse}`,
      ];

      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: formattedContents,
              generationConfig: {
                temperature: 0.4,
                maxOutputTokens: 800,
              },
            }),
          });

          if (response.ok) {
            const data = await response.json();
            const candidateText =
              data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (candidateText && candidateText.trim()) {
              return candidateText.trim();
            }
          }
        } catch {}
      }
    } catch (err) {
      console.warn("[AI Assistant] Direct API call error:", err);
    }
  }

  // 3. Intelligent Local Fallback
  const lower = query.toLowerCase();
  for (const [key, answer] of Object.entries(LOCAL_DISASTER_KNOWLEDGE)) {
    if (lower.includes(key)) {
      return answer;
    }
  }

  return (
    `🤖 **Disaster Response Guidance for "${query}":**\n\n` +
    `1. For immediate life danger, call **112** (Emergency) or **108** (Medical Ambulance).\n` +
    `2. Keep calm, stay tuned to official government weather bulletins (NDMA/SDMA).\n` +
    `3. Check the **Live Disaster Map** or **Shelter Finder** on this platform to navigate to safe zones.\n` +
    `4. Keep your Emergency Kit accessible with water, torch, and medicines.`
  );
}
