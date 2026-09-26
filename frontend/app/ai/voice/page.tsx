'use client';

import React, { useState } from 'react';
import { Mic, MicOff, Volume2, Globe, Radio } from 'lucide-react';

export default function VoiceDispatchPage() {
  const [isListening, setIsListening] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('Khasi');

  const languages = ['Khasi', 'Garo', 'Assamese', 'Bengali', 'Hindi', 'English', 'Mizo', 'Bodo'];

  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-slate-800">
        <h1 className="text-xl font-bold font-mono tracking-tight text-slate-100 flex items-center gap-2">
          <Mic className="w-5 h-5 text-rose-500" />
          <span>INDIGENOUS VOICE DISPATCH & AUDIO SOS ASSISTANT</span>
        </h1>
        <p className="text-xs text-slate-400 font-mono mt-0.5">
          Low-latency edge speech recognition supporting 8 North East India indigenous dialects
        </p>
      </div>

      <div className="max-w-2xl mx-auto p-8 rounded-3xl bg-slate-900/80 border border-slate-800 text-center space-y-6 shadow-2xl backdrop-blur-md">
        <div className="flex justify-center items-center space-x-2 font-mono text-xs text-slate-400">
          <Globe className="w-4 h-4 text-sky-400" />
          <span>Select Recognition Model Language:</span>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {languages.map((lang) => (
            <button
              key={lang}
              onClick={() => setSelectedLanguage(lang)}
              className={`px-3 py-1.5 rounded-full text-xs font-mono transition-all ${
                selectedLanguage === lang
                  ? 'bg-sky-500 text-white font-bold shadow-glow'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>

        <div className="py-8 flex flex-col items-center justify-center">
          <button
            onClick={() => setIsListening(!isListening)}
            className={`w-28 h-28 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl ${
              isListening
                ? 'bg-rose-600 text-white shadow-glow-danger animate-pulse scale-105'
                : 'bg-slate-800 hover:bg-slate-700 text-sky-400 border-2 border-sky-500/40'
            }`}
          >
            {isListening ? <MicOff className="w-10 h-10" /> : <Mic className="w-10 h-10" />}
          </button>
          <span className="font-mono text-xs text-slate-400 mt-4 block">
            {isListening ? 'LISTENING ON HAM/AUDIO CHANNEL...' : 'CLICK TO BROADCAST VOICE COMMAND'}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs font-mono text-left space-y-2">
          <div className="text-slate-500 flex items-center gap-1.5 uppercase font-bold">
            <Radio className="w-3.5 h-3.5 text-cyan-400" /> Transcribed Speech Feed
          </div>
          <p className="text-slate-300 italic">
            "{selectedLanguage}: Emergency medical evacuation requested for family trapped near Umtru bridge cut-off point."
          </p>
        </div>
      </div>
    </div>
  );
}
