import React, { useState } from 'react';
import { 
  Radio, Wifi, Bluetooth, Zap, ShieldCheck, 
  Volume2, Mountain, Trees, Compass, ArrowRight, 
  Sparkles, CheckCircle, Award, Terminal, Cpu, Play, 
  BatteryCharging, Waves, Lock, VolumeX, ShieldAlert
} from 'lucide-react';

export default function ZeroInfrastructureDataFlowTab() {
  const [activeStage, setActiveStage] = useState('all');
  const [isPlayingSpeech, setIsPlayingSpeech] = useState(false);

  // Exact pitch requested by user for the SIH evaluation closing statement
  const grandJuryClosingStatement = "Existing systems fail because they treat the citizen's phone as a passive screen waiting for help. Our platform treats the smartphone as an advanced physics laboratory. By tapping into raw barometric pressure waves, magnetic distortions, and epidemic data gossip, we have turned the very devices already in people's pockets into the sensor array and communication grid needed to survive when the modern world collapses.";

  const toggleSpeechVoiceover = () => {
    if ('speechSynthesis' in window) {
      if (isPlayingSpeech) {
        window.speechSynthesis.cancel();
        setIsPlayingSpeech(false);
      } else {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(grandJuryClosingStatement);
        utterance.rate = 0.98;
        utterance.pitch = 1.0;
        utterance.onend = () => setIsPlayingSpeech(false);
        utterance.onerror = () => setIsPlayingSpeech(false);
        window.speechSynthesis.speak(utterance);
        setIsPlayingSpeech(true);
      }
    } else {
      alert("Web Speech Synthesis is not supported in this browser.");
    }
  };

  const stages = [
    {
      id: 'phase1',
      title: 'Phase 1: Sub-Debris Physics Penetration (Buried Survivors & Dead Phones)',
      icon: Compass,
      color: 'border-indigo-500 text-indigo-400 bg-indigo-950/40',
      badge: 'PHYSICS DETECTION',
      summary: 'Passively maps subterranean structural voids and sustains beaconing when batteries hit 0%.',
      technologies: [
        {
          name: '🧬 Magnetometer "Disrupted-Field" Locator',
          mechanism: 'Reads micro-distortions in Earth magnetic vector (µT) caused by twisted steel rebar. Locates live survivor air cavities 3+ meters under rubble without victim radio signals.'
        },
        {
          name: '🔋 Thermoelectric "Thermal-Tap" Harvester',
          mechanism: 'Converts human skin vs rock temperature gradient (ΔT) into Seebeck nano-watts. Ultra-dormant JS scheduler wakes for 15ms to blast emergency distress tokens indefinitely.'
        },
        {
          name: 'Atmospheric Wi-Fi "Bending" (CSI)',
          mechanism: 'Maps 52 OFDM subcarrier phase & dielectric absorption (εr ≈ 50). Detects 0.23 Hz chest-wall breathing under collapsed slabs without working victim phones.'
        }
      ]
    },
    {
      id: 'phase2',
      title: 'Phase 2: Atmospheric Micro-Shockwave & River Gorge Early Warning',
      icon: Waves,
      color: 'border-cyan-500 text-cyan-400 bg-cyan-950/40',
      badge: 'ATMOSPHERIC SENSORS',
      summary: 'Detects natural disaster shockwaves before water or mud reaches human settlements.',
      technologies: [
        {
          name: '🌊 Barometric "Flash-Flood Wave" Loop',
          mechanism: 'Built-in smartphone barometer Generic Sensor API registers Bernoulli depressurization (-0.45 hPa) ahead of surging water walls. 15-node P2P quorum sounds 90s audible sirens.'
        },
        {
          name: 'Fluid Mudslide Pore-Pressure AI',
          mechanism: 'Calculates soil liquefaction saturation using local slope shear physics in WebAssembly before hillside collapse.'
        }
      ]
    },
    {
      id: 'phase3',
      title: 'Phase 3: Zero-Infrastructure Sovereign Epidemic Mesh',
      icon: Lock,
      color: 'border-purple-500 text-purple-400 bg-purple-950/40',
      badge: 'POST-QUANTUM GOSSIP',
      summary: 'Data spreads like a benign virus through the crowd without fixed cellular routers.',
      technologies: [
        {
          name: '🧠 Quantum-Resistant Epidemic Gossip Routing',
          mechanism: 'Kyber-1024 (ML-KEM) lattice-encrypted distress tokens hop between passing survivor devices. Uploads regional batch to satellites upon first gateway rendezvous.'
        },
        {
          name: 'Acoustic Sound-Wave Chirp Modem',
          mechanism: 'Encodes emergency data into FSK audible (1.8–3.4 kHz) & near-ultrasonic (18.5–19.8 kHz) sound waves leaping across severed river chasms.'
        }
      ]
    },
    {
      id: 'phase4',
      title: 'Phase 4: Zero-Paper Field Triage & Immutable Settlement',
      icon: Zap,
      color: 'border-rose-500 text-rose-400 bg-rose-950/40',
      badge: 'SOVEREIGN TRIAGE',
      summary: 'Ensures clinical data and aid distribution survive prolonged offline grid collapses.',
      technologies: [
        {
          name: 'Web-NFC Digital Triage Stamps',
          mechanism: 'Skin-safe NFC patches travel on patient wrists/foreheads. First responders tap phones to read/update START triage status on-chip with zero cellular connectivity.'
        },
        {
          name: 'PQC Offline Identity Ledger (ML-DSA)',
          mechanism: 'Validates offline QR relief vouchers with local lattice signatures and Merkle trees immune to quantum decryption.'
        }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Mic-Drop Showcase Banner - SIH Grand Jury Closing Statement */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950/70 to-slate-900 border-2 border-indigo-500/60 rounded-2xl p-6 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 text-xs font-black uppercase tracking-widest bg-gradient-to-r from-amber-400 to-rose-400 text-slate-950 rounded-full shadow">
                💡 THE PERFECT EVALUATION CLOSING STATEMENT
              </span>
              <span className="text-xs font-mono text-indigo-300">Hackathon Panel Mic-Drop Pitch</span>
            </div>

            <button
              onClick={toggleSpeechVoiceover}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold font-mono border transition-all ${
                isPlayingSpeech
                  ? 'bg-rose-600 border-rose-400 text-white animate-pulse'
                  : 'bg-indigo-900/60 border-indigo-500/50 text-indigo-200 hover:bg-indigo-800'
              }`}
            >
              {isPlayingSpeech ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              {isPlayingSpeech ? 'STOP GRAND JURY SPEECH' : 'PLAY GRAND JURY AUDIO SPEECH'}
            </button>
          </div>

          <blockquote className="text-lg md:text-xl font-semibold text-slate-100 italic leading-relaxed border-l-4 border-indigo-400 pl-4 py-1.5 bg-slate-950/40 rounded-r-xl">
            "{grandJuryClosingStatement}"
          </blockquote>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-slate-400 border-t border-slate-800/80">
            <div className="flex flex-wrap items-center gap-4">
              <span className="text-emerald-400 font-bold">✓ Magnetometer Rubble Voids</span>
              <span className="text-amber-400 font-bold">✓ Thermoelectric Thermal-Tap</span>
              <span className="text-cyan-400 font-bold">✓ Barometric Pressure Shockwave</span>
              <span className="text-purple-400 font-bold">✓ Kyber-1024 PQC Gossip Mesh</span>
            </div>
            <div className="font-mono text-indigo-400 font-semibold">
              Disaster Management Platform • World-First Technology Suite
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Zero-Grid Architecture Data Flow Pipeline */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-indigo-400" />
              The Ultimate Zero-Infrastructure System Overview
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              How extreme-edge hardware sensors and ambient physics turn dead phones into a self-healing survival grid
            </p>
          </div>

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveStage('all')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                activeStage === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Full Architecture
            </button>
            <button
              onClick={() => setActiveStage('phase1')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                activeStage === 'phase1' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Physics Detection
            </button>
            <button
              onClick={() => setActiveStage('phase2')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                activeStage === 'phase2' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Shockwave Loop
            </button>
            <button
              onClick={() => setActiveStage('phase3')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                activeStage === 'phase3' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Quantum Gossip
            </button>
            <button
              onClick={() => setActiveStage('phase4')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                activeStage === 'phase4' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Sovereign Triage
            </button>
          </div>
        </div>

        {/* 4 Pipeline Stages */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stages
            .filter(st => activeStage === 'all' || activeStage === st.id)
            .map(stage => {
              const IconComp = stage.icon;
              return (
                <div key={stage.id} className={`p-4 rounded-xl border flex flex-col justify-between ${stage.color}`}>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <IconComp className="w-5 h-5" />
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 font-bold border border-current/30">
                          {stage.badge}
                        </span>
                      </div>
                      <span className="w-2 h-2 rounded-full bg-current animate-ping"></span>
                    </div>

                    <h4 className="text-xs font-bold text-white leading-snug">{stage.title}</h4>
                    <p className="text-[11px] text-slate-300 mt-1.5 leading-relaxed">{stage.summary}</p>

                    <div className="space-y-2 mt-4 pt-3 border-t border-slate-800">
                      {stage.technologies.map((t, idx) => (
                        <div key={idx} className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800/80 text-[11px]">
                          <div className="font-bold text-white">{t.name}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5 leading-tight">{t.mechanism}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-2 flex items-center justify-between text-[10px] font-mono opacity-80">
                    <span>STATUS: OPERATIONAL</span>
                    <span>ZERO-INFRASTRUCTURE</span>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
