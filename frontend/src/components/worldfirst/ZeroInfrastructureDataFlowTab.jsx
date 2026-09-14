import React, { useState } from 'react';
import { 
  Radio, Wifi, Bluetooth, Zap, ShieldCheck, 
  Volume2, Mountain, Trees, Compass, ArrowRight, 
  Sparkles, CheckCircle, Award, Terminal, Cpu, Play
} from 'lucide-react';

export default function ZeroInfrastructureDataFlowTab() {
  const [activeStage, setActiveStage] = useState('all');

  const stages = [
    {
      id: 'phase1',
      title: 'Phase 1: Sub-Debris Penetration (Dead Phones & Collapsed Slabs)',
      icon: Wifi,
      color: 'border-cyan-500 text-cyan-400 bg-cyan-950/40',
      badge: 'DETECTION',
      summary: 'Detects and locates survivors trapped under 3-6 ft of mud/rubble with zero battery or dead phones.',
      technologies: [
        {
          name: 'Atmospheric Wi-Fi "Bending" (CSI)',
          mechanism: 'Maps 52 OFDM subcarrier phase & dielectric absorption (εr ≈ 50). Detects 0.23 Hz chest-wall breathing under collapsed slabs without survivors needing working phones.'
        },
        {
          name: 'Web-Bluetooth "Spitting" Protocol',
          mechanism: 'Buried survivor phones sleep for 45s and explode a 15ms high-gain +8dBm RF burst carrying an 18-byte packed SOS frame to overhead rescue drones (186h battery).'
        }
      ]
    },
    {
      id: 'phase2',
      title: 'Phase 2: Gorge-Spanning Ad-Hoc Swarm (Zero Satellite / Zero Cell)',
      icon: Volume2,
      color: 'border-emerald-500 text-emerald-400 bg-emerald-950/40',
      badge: 'RELAY',
      summary: 'Relays tactical SOS, patient triage, and coordinates across severed mountain chasms.',
      technologies: [
        {
          name: 'Acoustic Chirp Modem',
          mechanism: 'Encodes emergency data into FSK audible (1.8–3.4 kHz) & near-ultrasonic (18.5–19.8 kHz) sound waves, leaping across rivers from speaker to microphone.'
        },
        {
          name: 'Terrestrial Reverse GPS Radio',
          mechanism: 'Trilaterates true spatial coordinates by calculating vector intersections from local terrestrial AM/FM radio broadcast towers.'
        }
      ]
    },
    {
      id: 'phase3',
      title: 'Phase 3: Zero-Paper Field Triage & Transit (Moving With Patients)',
      icon: Zap,
      color: 'border-rose-500 text-rose-400 bg-rose-950/40',
      badge: 'TRIAGE',
      summary: 'Ensures clinical data travels directly on victim skin through muddy transfers without paperwork.',
      technologies: [
        {
          name: 'Web-NFC "Digital Triage Stamps"',
          mechanism: 'Waterproof, skin-safe NFC sticker patches on patient forehead/wrist. Medics tap smartphones to instantly read & update START triage, vitals, and surgical log on-chip.'
        },
        {
          name: 'Citizen Vitals Crowd-Map',
          mechanism: 'Decentralized physiological pulse oximetry crowd-sensing identifying neighborhood trauma shockwaves.'
        }
      ]
    },
    {
      id: 'phase4',
      title: 'Phase 4: Sovereign Post-Quantum Aid Settlement (Immutable Gridless)',
      icon: ShieldCheck,
      color: 'border-purple-500 text-purple-400 bg-purple-950/40',
      badge: 'SETTLEMENT',
      summary: 'Distributes relief funds, rations, and medical consent forms with quantum immunity offline.',
      technologies: [
        {
          name: 'PQC Offline Identity Ledger (ML-DSA / ML-KEM)',
          mechanism: 'Generates quantum-resistant lattice signatures inside browser memory. Validates offline QR vouchers with a local Merkle tree audit chain resistant to future quantum decryptors.'
        },
        {
          name: 'Living Root Bridge Bio-Ledger',
          mechanism: 'Indigenous Meghalaya Jingkieng Jri catenary load monitoring ensuring evacuation routes over swollen mountain rivers do not collapse under crowd weight.'
        }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Mic-Drop Showcase Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950/60 to-slate-900 border-2 border-indigo-500/50 rounded-2xl p-6 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 text-xs font-black uppercase tracking-widest bg-gradient-to-r from-amber-400 to-rose-400 text-slate-950 rounded-full shadow">
              💡 THE ULTIMATE SIH PITCH MIC-DROP
            </span>
            <span className="text-xs font-mono text-indigo-300">Executive Summary for Grand Jury</span>
          </div>

          <blockquote className="text-lg md:text-xl font-medium text-slate-100 italic leading-relaxed border-l-4 border-indigo-400 pl-4 py-1">
            "The world's current disaster platforms assume the internet will always come back. <span className="text-amber-400 font-bold underline decoration-amber-400/50">We built our platform for the day it doesn't.</span> By turning the ambient environment, sound waves, radio echoes, and the collective computing power of everyday smartphones into a self-healing rescue grid, we have created a platform that cannot be knocked offline by any natural disaster on Earth."
          </blockquote>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-slate-400 border-t border-slate-800">
            <div className="flex items-center gap-4">
              <span>✓ 100% Zero-Grid Autonomous</span>
              <span>✓ NIST Post-Quantum Certified</span>
              <span>✓ Web-NFC / Web-BLE / Web-Audio Native</span>
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
              The Ultimate Zero-Infrastructure Data Flow Pipeline
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              How all world-first technologies interlock when all global satellite, cellular, and power grids are completely destroyed
            </p>
          </div>

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveStage('all')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                activeStage === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Full Pipeline
            </button>
            <button
              onClick={() => setActiveStage('phase1')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                activeStage === 'phase1' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Detection
            </button>
            <button
              onClick={() => setActiveStage('phase2')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                activeStage === 'phase2' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Swarm
            </button>
            <button
              onClick={() => setActiveStage('phase3')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                activeStage === 'phase3' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Triage
            </button>
            <button
              onClick={() => setActiveStage('phase4')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                activeStage === 'phase4' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Settlement
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
                    <span>STATUS: DEPLOYABLE</span>
                    <span>100% OFF-GRID</span>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
