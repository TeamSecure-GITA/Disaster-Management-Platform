'use client';

import React from 'react';
import { Radio, Volume2, ShieldCheck, Share2 } from 'lucide-react';

export default function DecentralizedPage() {
  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-slate-800">
        <h1 className="text-xl font-bold font-mono tracking-tight text-slate-100 flex items-center gap-2">
          <Radio className="w-5 h-5 text-sky-400" />
          <span>DECENTRALIZED P2P MESH & ULTRASONIC AUDIO CHIRP MODEM</span>
        </h1>
        <p className="text-xs text-slate-400 font-mono mt-0.5">
          Zero-radio fallback transmitting tactical coordinates via speaker-to-microphone ultrasonic frequency-shift keying (18-20 kHz)
        </p>
      </div>

      <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 font-mono text-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <span className="text-slate-200 font-bold">Acoustic WebAudio FSK Modem</span>
          <span className="px-2.5 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
            AUDIO MODEM ACTIVE (18.5 kHz)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <span className="text-sky-400 font-bold flex items-center gap-1.5">
              <Volume2 className="w-4 h-4" /> Near-Ultrasonic Broadcast Carrier
            </span>
            <p className="text-slate-400">Modulation: 16-Tone FSK (Near-Ultrasonic)</p>
            <p className="text-slate-400">Data Throughput: 120 bps (Coordinates + SOS ID)</p>
            <p className="text-slate-400">Air Gap Range: Up to 15 meters in rubble/confined space</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <span className="text-emerald-400 font-bold flex items-center gap-1.5">
              <Share2 className="w-4 h-4" /> WebRTC Direct P2P Gossip
            </span>
            <p className="text-slate-400">Signaling: Bluetooth Low Energy & Multicast mDNS</p>
            <p className="text-slate-400">Active Peer Connections: 6 Local Mobile Terminals</p>
            <p className="text-slate-400">Encryption: End-to-End X25519</p>
          </div>
        </div>
      </div>
    </div>
  );
}
