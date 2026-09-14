import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Lock, Key, QrCode, CheckCircle, 
  AlertTriangle, Copy, RefreshCw, FileText, Sparkles, 
  HardDrive, ExternalLink, ArrowUpRight, Cpu, Layers
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  generatePqcKeypair, 
  signPqcClaim, 
  verifyPqcClaim, 
  OfflineMerkleLedger 
} from '../../utils/pqcCrypto';

export default function PqcOfflineLedgerTab() {
  const [keypair, setKeypair] = useState(null);
  const [isGeneratingKey, setIsGeneratingKey] = useState(false);
  
  // Claim form state
  const [recipientName, setRecipientName] = useState('Tashi Namgyal');
  const [rescueId, setRescueId] = useState('RID-NE-8821');
  const [rationUnits, setRationUnits] = useState(4);
  const [medicalSupplies, setMedicalSupplies] = useState('Ringer Lactate IV, Ciprofloxacin 500mg, Thermal Foil');
  
  // Signed token state
  const [activeSignedToken, setActiveSignedToken] = useState(null);
  const [isSigning, setIsSigning] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);

  // Verifier state
  const [tokenToVerify, setTokenToVerify] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);

  // Merkle ledger state
  const [ledgerInstance] = useState(() => new OfflineMerkleLedger());
  const [transactions, setTransactions] = useState([]);
  const [merkleRoot, setMerkleRoot] = useState('0000000000000000000000000000000000000000000000000000000000000000');

  // Initial key generation and ledger load
  useEffect(() => {
    handleGenerateKeypair();
    loadLedgerData();
  }, []);

  const loadLedgerData = async () => {
    const list = ledgerInstance.getTransactions();
    setTransactions([...list]);
    const root = await ledgerInstance.getMerkleRoot();
    setMerkleRoot(root);
  };

  const handleGenerateKeypair = async () => {
    setIsGeneratingKey(true);
    try {
      const keys = await generatePqcKeypair();
      setKeypair(keys);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingKey(false);
    }
  };

  const handleSignClaim = async (e) => {
    e.preventDefault();
    if (!keypair) return;
    setIsSigning(true);

    try {
      const payload = {
        recipientName,
        rescueId,
        rationUnits: Number(rationUnits),
        medicalSupplies: medicalSupplies.split(',').map(s => s.trim()),
        urgency: 'HIGH_OFFLINE_AUTHORIZATION',
        signerKeyFingerprint: keypair.keyFingerprint
      };

      const result = await signPqcClaim(payload, keypair.secretKey);
      setActiveSignedToken(result);
      setTokenToVerify(result.qrEncoded);

      // Append to offline Merkle ledger
      await ledgerInstance.appendTransaction(payload, result.signature, keypair.publicKey);
      await loadLedgerData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSigning(false);
    }
  };

  const handleVerifyToken = async () => {
    if (!tokenToVerify) return;
    try {
      let parsed;
      if (tokenToVerify.startsWith('PQC1$')) {
        const jsonStr = atob(tokenToVerify.replace('PQC1$', ''));
        parsed = JSON.parse(jsonStr);
      } else {
        parsed = JSON.parse(tokenToVerify);
      }

      const res = await verifyPqcClaim(parsed);
      setVerificationResult(res);
    } catch (e) {
      setVerificationResult({ valid: false, reason: 'Invalid token serialization' });
    }
  };

  const handleCopyQrToken = () => {
    if (!activeSignedToken) return;
    navigator.clipboard.writeText(activeSignedToken.qrEncoded);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-purple-950/60 border border-purple-500/40 rounded-xl text-purple-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-white">
                    Post-Quantum Cryptographic (PQC) Offline Identity Ledger
                  </h2>
                  <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full">
                    NIST FIPS 204 Standard
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                  Protects citizens from identity theft, supply hijacking, and quantum decryption attacks when server grids collapse. Generates offline verifiable relief vouchers & medical releases with ML-DSA (CRYSTALS-Dilithium) running locally in your browser.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-pulse"></div>
              <div>
                <div className="text-[10px] text-slate-400">Quantum Hardness</div>
                <div className="text-xs font-bold text-purple-300">128-bit Post-Quantum Lattice</div>
              </div>
            </div>

            <button
              onClick={handleGenerateKeypair}
              disabled={isGeneratingKey}
              className="flex items-center gap-1.5 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingKey ? 'animate-spin' : ''}`} />
              Re-Roll Quantum Keys
            </button>
          </div>
        </div>
      </div>

      {/* Active Quantum Key Identity Card */}
      {keypair && (
        <div className="bg-gradient-to-r from-slate-900 via-purple-950/40 to-slate-900 border border-purple-800/40 rounded-2xl p-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 border border-purple-500/30 rounded-lg text-purple-300">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Local Citizen Quantum Keypair</span>
                  <span className="text-[10px] font-mono bg-purple-950 px-2 py-0.5 rounded text-purple-400 border border-purple-800">
                    {keypair.algorithm}
                  </span>
                </div>
                <div className="text-xs font-mono text-purple-300/80 mt-0.5">
                  Fingerprint: <span className="text-white font-bold">{keypair.keyFingerprint}</span> | Security: Level 3 (Grover & Shor Immune)
                </div>
              </div>
            </div>

            <div className="text-xs font-mono text-slate-400 bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800 max-w-sm truncate">
              PK: {keypair.publicKey}
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Sign Claim Form (Left) & Verifiable Token + Verifier (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Offline Relief Voucher Issuer */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-400" />
                Issue Offline Relief / Medical Voucher
              </h3>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-900">
                Zero-Grid Offline Signing
              </span>
            </div>

            <form onSubmit={handleSignClaim} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-medium text-slate-400">Recipient Legal Name</label>
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-400">Disaster Rescue ID</label>
                  <input
                    type="text"
                    value={rescueId}
                    onChange={(e) => setRescueId(e.target.value)}
                    className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-medium text-slate-400">Ration Quota (Units)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={rationUnits}
                    onChange={(e) => setRationUnits(e.target.value)}
                    className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-400">Signer Algorithm</label>
                  <input
                    type="text"
                    disabled
                    value="ML-DSA-65 (CRYSTALS-Dilithium)"
                    className="w-full mt-1 bg-slate-950/50 border border-slate-800 rounded-xl px-3 py-2 text-xs text-purple-400 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-400">Essential Relief Supplies / Triage Authorization</label>
                <textarea
                  rows={2}
                  value={medicalSupplies}
                  onChange={(e) => setMedicalSupplies(e.target.value)}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSigning || !keypair}
                className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-950/40"
              >
                <ShieldCheck className="w-4 h-4" />
                {isSigning ? 'Computing Lattice Polynomials...' : 'Sign Offline Voucher with Quantum Lattice'}
              </button>
            </form>
          </div>

          {/* Offline Merkle Tree Ledger Box */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-purple-400" />
                  Local Offline Merkle Audit Ledger
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Immutable hash chain stored in PWA browser storage (IndexedDB/LocalStorage)
                </p>
              </div>
              <span className="text-[10px] font-mono text-purple-400 bg-purple-950 border border-purple-900 px-2 py-0.5 rounded">
                {transactions.length} Offline Records
              </span>
            </div>

            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 mb-3 text-[10px] font-mono">
              <span className="text-slate-500">CANONICAL MERKLE ROOT: </span>
              <span className="text-purple-300 font-bold break-all">{merkleRoot}</span>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {transactions.length === 0 ? (
                <div className="text-xs text-slate-500 text-center py-4">No offline transactions signed yet.</div>
              ) : (
                transactions.map((tx) => (
                  <div key={tx.txId} className="bg-slate-950/90 p-2.5 rounded-lg border border-slate-800 text-xs">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="text-white">{tx.data.recipientName} ({tx.data.rescueId})</span>
                      <span className="text-[10px] font-mono text-emerald-400">✓ QUANTUM_SIGNED</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                      {tx.data.rationUnits} Units | {tx.data.medicalSupplies?.join(', ')}
                    </div>
                    <div className="text-[9px] font-mono text-slate-500 mt-1 truncate">
                      Hash: {tx.merkleHash}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: QR Quantum Token & Instant Verifier */}
        <div className="lg:col-span-6 space-y-6">
          {/* Visual QR Code Display */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <QrCode className="w-4 h-4 text-purple-400" />
                Scannable PQC Token (Offline Peer Handshake)
              </h3>
              {activeSignedToken && (
                <button
                  onClick={handleCopyQrToken}
                  className="flex items-center gap-1 text-xs font-semibold text-purple-400 hover:text-purple-300"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copiedToken ? 'Copied!' : 'Copy Token String'}
                </button>
              )}
            </div>

            {activeSignedToken ? (
              <div className="flex flex-col sm:flex-row items-center gap-5 bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="bg-white p-2 rounded-xl shadow">
                  <QRCodeSVG 
                    value={activeSignedToken.qrEncoded} 
                    size={135} 
                    level="M" 
                  />
                </div>

                <div className="space-y-1.5 text-xs flex-1">
                  <div className="font-bold text-white">Quantum-Signed Relief Token</div>
                  <div className="text-[11px] text-slate-400">
                    Recipient: <span className="text-purple-300">{activeSignedToken.signedToken.claim.recipientName}</span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Signature: <span className="font-mono text-[10px] text-emerald-400 truncate block">{activeSignedToken.signature}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    Scan via any rescue tablet camera without cell signal. Resistant to Shor's quantum integer factorization.
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-950 p-6 rounded-xl border border-dashed border-slate-800 text-center text-xs text-slate-500">
                Sign a voucher on the left to generate the scannable quantum-resistant QR token.
              </div>
            )}
          </div>

          {/* Instant Offline Verifier */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Instant Offline Signature Verifier
              </h3>
              <span className="text-[10px] text-slate-400">Offline Tablet Inspector</span>
            </div>

            <div className="space-y-3">
              <textarea
                rows={3}
                placeholder="Paste serialized PQC token (PQC1$...) or JSON payload to verify signature authenticity..."
                value={tokenToVerify}
                onChange={(e) => setTokenToVerify(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-[11px] font-mono text-white focus:outline-none focus:border-purple-500"
              />

              <button
                onClick={handleVerifyToken}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-purple-300 rounded-xl text-xs font-bold transition-all border border-slate-700"
              >
                Validate Quantum Signature Offline
              </button>

              {verificationResult && (
                <div className={`p-3 rounded-xl border text-xs ${
                  verificationResult.valid 
                    ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-200' 
                    : 'bg-rose-950/50 border-rose-500/50 text-rose-200'
                }`}>
                  <div className="flex items-center gap-2 font-bold">
                    {verificationResult.valid ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-rose-400" />}
                    {verificationResult.valid ? 'PQC Signature Authenticity Verified!' : 'Signature Verification Failed'}
                  </div>
                  {verificationResult.valid && (
                    <div className="text-[11px] mt-1 space-y-0.5 text-emerald-300/80">
                      <div>Algorithm: {verificationResult.pqcAlgorithm}</div>
                      <div>Quantum Threat Protection: Active (Lattice Hardness M-LWE)</div>
                      <div className="font-mono text-[9px] truncate">Hash: {verificationResult.claimHash}</div>
                    </div>
                  )}
                  {!verificationResult.valid && (
                    <div className="text-[11px] mt-1 text-rose-300">
                      Reason: {verificationResult.reason}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
