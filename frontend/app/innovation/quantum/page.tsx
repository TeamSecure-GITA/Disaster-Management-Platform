'use client';

import React from 'react';
import { Shield, Key, Lock, CheckCircle2 } from 'lucide-react';

export default function QuantumPage() {
  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-slate-800">
        <h1 className="text-xl font-bold font-mono tracking-tight text-slate-100 flex items-center gap-2">
          <Shield className="w-5 h-5 text-indigo-400" />
          <span>POST-QUANTUM CRYPTOGRAPHY (PQC) OFFLINE IDENTITY LEDGER</span>
        </h1>
        <p className="text-xs text-slate-400 font-mono mt-0.5">
          Quantum-safe authentication utilizing NIST ML-KEM (Kyber-1024) and ML-DSA (Dilithium-5)
        </p>
      </div>

      <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 font-mono text-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <span className="text-slate-200 font-bold">Cryptographic Primitive Status</span>
          <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            NIST FIPS 203 / 204 COMPLIANT
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <span className="text-indigo-400 font-bold flex items-center gap-1.5">
              <Key className="w-4 h-4" /> KEM Encap / Decap
            </span>
            <p className="text-slate-400">Algorithm: ML-KEM-1024</p>
            <p className="text-slate-400">Ciphertext Size: 1,568 bytes</p>
            <p className="text-slate-400">Security Category: Level 5 (Quantum Infeasible)</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <span className="text-sky-400 font-bold flex items-center gap-1.5">
              <Lock className="w-4 h-4" /> Digital Signatures (Offline SOS)
            </span>
            <p className="text-slate-400">Algorithm: ML-DSA-87 (Dilithium)</p>
            <p className="text-slate-400">Tamper-Proof Disaster Responder Tokens</p>
            <p className="text-slate-400">Status: Verifying Local Keyring Cache</p>
          </div>
        </div>
      </div>
    </div>
  );
}
