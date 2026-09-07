// ─────────────────────────────────────────────────────────────────────────────
// src/services/geminiService.js
//
// Multilingual AI Engine for Disaster Management & General Knowledge
// Capabilities:
// 1. Answers any disaster management & emergency life-safety questions.
// 2. Answers any general questions (identity, science, math, geography, technology, everyday queries).
// 3. Multi-language bidirectional translation:
//    - Accepts input in ANY language from user.
//    - Translates input to English for AI comprehension.
//    - Generates high-quality intelligent response.
//    - Translates response back to the user's language of asking (or English by default).
// 4. Multi-tier AI execution (Gemini API -> Free AI Engine -> Intelligent Conversational KB).
// ─────────────────────────────────────────────────────────────────────────────

import { detectLanguage, translateText } from "./translateService";

const GEMINI_API_KEY =
  import.meta.env.VITE_GEMINI_API_KEY ||
  import.meta.env.VITE_FIREBASE_API_KEY ||
  "";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const SYSTEM_PROMPT = `
You are the Official AI Disaster Management & Emergency Response Assistant for the Disaster Management Platform, created by TeamSecure.

**Your Identity:**
- Your name is "Disaster Management & Emergency AI Assistant" (or "DM AI Assistant" for short).
- You were developed by TeamSecure to protect lives, provide disaster guidance, and answer user questions.
- If asked "What is your name?", "Who are you?", or about your identity, always introduce yourself proudly as the Disaster Management & Emergency AI Assistant built by TeamSecure.

**Your Capabilities:**
1. **Disaster Management & Safety:** Comprehensive step-by-step life safety instructions for cyclones, floods, earthquakes, landslides, fires, heatwaves, and chemical hazards. Mention emergency hotlines (112, 108, 1070) where appropriate.
2. **General Questions:** Answer general knowledge questions clearly, accurately, and politely (science, mathematics, geography, history, health, weather, education, coding, and general conversation).
3. **Format:** Use clean markdown, bullet points, and concise language.
`;

// ─── Local Disaster Knowledge ────────────────────────────────────────────────
const LOCAL_DISASTER_KNOWLEDGE = {
  flood:
    "🌊 **Flood Safety Instructions:**\n1. Move to higher ground immediately.\n2. Do NOT walk, swim, or drive through floodwater ('Turn Around, Don't Drown').\n3. Switch off main electrical supplies and gas valves.\n4. Keep your Emergency Kit with drinking water, dry food, and medicines ready.\n5. Call **112** (Emergency) or **108** (Ambulance) for urgent rescue.",
  cyclone:
    "🌀 **Cyclone Safety Instructions:**\n1. Stay indoors away from windows, glass doors, and tin roofs.\n2. Keep battery radios, power banks, and torches charged.\n3. Secure loose outdoor objects or move to the nearest Cyclone Shelter.\n4. Do not venture outdoors during the calm 'eye of the storm'.\n5. Call **1070** (Disaster Control) or **112** for emergency evacuation.",
  earthquake:
    "🌍 **Earthquake Safety Instructions:**\n1. **DROP, COVER, and HOLD ON** under a sturdy desk or table.\n2. Stay away from windows, heavy furniture, and exterior walls.\n3. If outdoors, move to an open area away from power lines and tall buildings.\n4. Do NOT use elevators.\n5. After shaking stops, check for gas leaks and structural damage.",
  fire:
    "🔥 **Fire Safety Instructions:**\n1. Get out immediately and stay low under smoke.\n2. Check door handles with the back of your hand before opening.\n3. Call **101** (Fire) or **112** immediately.\n4. If clothes catch fire: **STOP, DROP, and ROLL**.\n5. Never use elevators during a fire.",
  landslide:
    "🏔️ **Landslide Safety Instructions:**\n1. Stay alert during intense rainfall, especially in steep terrain.\n2. Watch for sudden increases or decreases in stream water levels.\n3. Move away from the path of debris or landslide immediately.\n4. Inform district disaster authorities and check the platform's NER Landslide Monitor.",
  kit:
    "🎒 **Emergency Survival Kit Checklist:**\n- 💧 Drinking water (at least 3 liters/person/day for 3 days)\n- 🥫 Non-perishable dry food & energy bars\n- 🔦 LED Flashlight + extra batteries\n- 🩹 First-aid kit & essential prescription medications\n- 🔋 Power bank & emergency whistle\n- 📄 Sealed waterproof pouch with IDs & vital documents\n- 📻 Battery-operated emergency radio",
  shelter:
    "⛺ **Shelter & Evacuation Guidance:**\n- Check the **Shelter Finder** or **Live Map** tab on this platform to locate nearest active shelter camps.\n- Bring your emergency kit, photo ID, essential medicines, and blankets.\n- Follow designated evacuation routes; avoid waterlogged bridges and damaged roads.",
};

/**
 * Safe Math Expression Evaluator
 */
function tryEvaluateMath(text) {
  const clean = text.toLowerCase().replace(/what is|calculate|solve|\?|=/g, "").trim();
  if (/^[\d\s\+\-\*\/\(\)\.\%\^]+$/.test(clean) && /\d/.test(clean)) {
    try {
      // Safe sanitized eval for simple arithmetic
      const sanitized = clean.replace(/\^/g, "**");
      // eslint-disable-next-line no-new-func
      const result = Function(`"use strict"; return (${sanitized})`)();
      if (typeof result === "number" && !isNaN(result)) {
        return `The answer to ${clean} is **${result}**.`;
      }
    } catch {}
  }
  return null;
}

/**
 * Handle direct identity & quick conversational queries
 */
function handleQuickQueries(query) {
  const q = query.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim();

  // Identity questions
  if (
    q.includes("what is your name") ||
    q.includes("whats your name") ||
    q.includes("who are you") ||
    q.includes("what are you") ||
    q.includes("who created you") ||
    q.includes("who made you") ||
    q.includes("who built you") ||
    q.includes("introduce yourself") ||
    q.includes("tell me about yourself") ||
    q === "name" ||
    q === "your name"
  ) {
    return (
      "I am the **AI Chatbot for Disaster Management & Emergency Response**, created by **TeamSecure**.\n\n" +
      "I am here to provide you with:\n" +
      "• 🚨 Instant life-saving instructions during natural and man-made disasters.\n" +
      "• 🗺️ Guidance for finding shelters, evacuation routes, and emergency medical centers.\n" +
      "• 📞 Official emergency helpline numbers (112, 108, 1070).\n" +
      "• 💡 Accurate answers to any general questions (science, math, geography, facts, and more) in your preferred language.\n\n" +
      "How can I assist you right now?"
    );
  }

  // Greetings
  if (["hi", "hello", "hey", "greetings", "good morning", "good afternoon", "good evening"].includes(q)) {
    return "Hello! 👋 I am your Disaster Management & Emergency AI Assistant. How can I help you today? You can ask me about disaster safety protocols, weather alerts, emergency kits, or any general question!";
  }

  // How are you
  if (q.includes("how are you") || q.includes("how r u")) {
    return "I am operating at full capacity, connected to live emergency services and ready to assist you with any questions or disaster alerts! How are you doing?";
  }

  // Capabilities / Help
  if (q === "help" || q.includes("what can you do") || q.includes("how can you help")) {
    return (
      "Here is how I can help you:\n" +
      "1. **Disaster Emergencies:** Guide you through cyclones, floods, earthquakes, landslides, and fires.\n" +
      "2. **Evacuation & Shelters:** Assist in locating safe shelters and emergency routes.\n" +
      "3. **Helplines:** Provide direct emergency contact numbers like 112 (National Emergency), 108 (Ambulance), and 101 (Fire).\n" +
      "4. **General Knowledge:** Answer everyday questions on science, math, technology, geography, and education.\n" +
      "5. **Multilingual:** You can chat with me in Odia, Hindi, Bengali, Assamese, English, or any other regional language!"
    );
  }

  return null;
}

/**
 * Return response in user's asking language
 */
async function returnInUserLanguage(englishText, targetLang) {
  if (!targetLang || targetLang === "en" || !englishText) {
    return englishText;
  }
  try {
    const translated = await translateText(englishText, "en", targetLang);
    return translated || englishText;
  } catch {
    return englishText;
  }
}

/**
 * Main AI query processor
 * 1. Detects input language
 * 2. Translates to English if needed
 * 3. Answers general & disaster queries
 * 4. Translates response back to user's language
 *
 * @param {string} userMessage - User query in any language
 * @param {Array} history - Previous conversation history
 * @returns {Promise<string>}
 */
export async function askGemini(userMessage, history = []) {
  if (!userMessage || !userMessage.trim()) {
    return "Please enter a question or emergency topic.";
  }

  const rawInput = userMessage.trim();

  // ── Step 1: Detect Input Language ──────────────────────────────────────────
  let detectedLang = "en";
  try {
    detectedLang = await detectLanguage(rawInput);
  } catch {
    detectedLang = "en";
  }

  // ── Step 2: Translate to English for AI understanding ───────────────────────
  let englishQuery = rawInput;
  if (detectedLang && detectedLang !== "en") {
    try {
      const translated = await translateText(rawInput, detectedLang, "en");
      if (translated && translated.trim()) {
        englishQuery = translated.trim();
      }
    } catch {}
  }

  // ── Step 3: Check Quick Queries (Identity, Greetings, Math) ────────────────
  const quickAnswer = handleQuickQueries(englishQuery);
  if (quickAnswer) {
    return await returnInUserLanguage(quickAnswer, detectedLang);
  }

  const mathAnswer = tryEvaluateMath(englishQuery);
  if (mathAnswer) {
    return await returnInUserLanguage(mathAnswer, detectedLang);
  }

  // ── Step 4: Check Local Disaster Knowledge ─────────────────────────────────
  const lowerQuery = englishQuery.toLowerCase();
  for (const [key, answer] of Object.entries(LOCAL_DISASTER_KNOWLEDGE)) {
    if (lowerQuery.includes(key)) {
      return await returnInUserLanguage(answer, detectedLang);
    }
  }

  let finalEnglishResponse = "";

  // ── Step 5: Try Free High-Speed Generative AI Engine ───────────────────────
  try {
    const aiMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...history.slice(-4).map((msg) => ({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.text,
      })),
      { role: "user", content: englishQuery },
    ];

    const aiRes = await fetch("https://text.pollinations.ai/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: aiMessages,
        model: "openai",
        seed: 42,
      }),
    });

    if (aiRes.ok) {
      const text = await aiRes.text();
      if (text && text.trim() && !text.includes("Error") && !text.includes("rate limit")) {
        finalEnglishResponse = text.trim();
      }
    }
  } catch {}

  // ── Step 6: Try Gemini API directly if key is configured ───────────────────
  if (!finalEnglishResponse) {
    const keyToUse =
      GEMINI_API_KEY ||
      localStorage.getItem("custom_gemini_api_key") ||
      localStorage.getItem("gemini_api_key");

    if (keyToUse) {
      try {
        const formattedContents = [
          {
            role: "user",
            parts: [{ text: `${SYSTEM_PROMPT}\n\nUser Question: ${englishQuery}` }],
          },
        ];

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
                generationConfig: { temperature: 0.5, maxOutputTokens: 600 },
              }),
            });

            if (response.ok) {
              const data = await response.json();
              const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
              if (candidate && candidate.trim()) {
                finalEnglishResponse = candidate.trim();
                break;
              }
            }
          } catch {}
        }
      } catch {}
    }
  }

  // ── Step 7: Try Backend Chat API ───────────────────────────────────────────
  if (!finalEnglishResponse) {
    try {
      const res = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: englishQuery }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.data?.message && !json.data?.fallback) {
          finalEnglishResponse = json.data.message;
        }
      }
    } catch {}
  }

  // ── Step 8: Intelligent Conversational General Fallback ───────────────────
  if (!finalEnglishResponse) {
    // If it's a general question, answer helpfully rather than forcing a disaster template
    finalEnglishResponse =
      `Thank you for asking about "${englishQuery}".\n\n` +
      `As the Disaster Management & Emergency AI Assistant, I can confirm that for any immediate danger or life safety concerns, you can contact **112** (National Emergency Hotline) or **108** (Medical Ambulance).\n\n` +
      `For specialized questions on this topic, I recommend checking official national portals or asking me about specific emergency preparedness steps, cyclone warnings, flood evacuation, or survival kits!`;
  }

  // ── Step 9: Translate response back to the user's asking language ───────────
  return await returnInUserLanguage(finalEnglishResponse, detectedLang);
}
