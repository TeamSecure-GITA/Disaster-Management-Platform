import React, { useState, useRef } from 'react';

export default function SirenBeacon() {
  const [sirenPlaying, setSirenPlaying] = useState(false);
  const audioCtxRef = useRef(null);
  const oscRef = useRef(null);

  const toggleSiren = () => {
    if (sirenPlaying) {
      if (oscRef.current) oscRef.current.stop();
      setSirenPlaying(false);
    } else {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(800, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, audioCtx.currentTime + 0.5);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();

      audioCtxRef.current = audioCtx;
      oscRef.current = osc;
      setSirenPlaying(true);
    }
  };

  return (
    <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '20px', marginBottom: '1.5rem', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
      <button
        onClick={toggleSiren}
        style={{
          backgroundColor: sirenPlaying ? '#dc2626' : '#ef4444',
          color: '#fff',
          border: 'none',
          padding: '12px 20px',
          borderRadius: '8px',
          fontWeight: 'bold',
          cursor: 'pointer',
          flex: 1
        }}
      >
        {sirenPlaying ? '🔊 Stop Alarm Siren' : '📢 Play Audio Siren'}
      </button>
    </div>
  );
}