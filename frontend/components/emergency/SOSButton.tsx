'use client';

import React, { useState } from 'react';
import { AlertTriangle, Radio, CheckCircle, Loader2 } from 'lucide-react';
import { EmergencyService } from '../../services/emergency.service';

interface SOSButtonProps {
  onTriggered?: (incidentId: string) => void;
  className?: string;
}

export function SOSButton({ onTriggered, className = '' }: SOSButtonProps) {
  const [isPressing, setIsPressing] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  const handleTrigger = async () => {
    setIsSending(true);
    try {
      const result = await EmergencyService.triggerSOS({
        lat: 25.5788,
        lng: 91.8933,
        emergencyType: 'IMMINENT_LANDSLIDE_BREACH',
        medicalConditions: 'Civilians trapped in residential perimeter',
      });
      setSentSuccess(true);
      if (onTriggered) onTriggered(result.incidentId);
      setTimeout(() => setSentSuccess(false), 5000);
    } catch (err) {
      console.error('SOS Trigger failed:', err);
    } finally {
      setIsSending(false);
      setIsPressing(false);
    }
  };

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      {sentSuccess ? (
        <div className="flex items-center space-x-2 px-6 py-3 rounded-full bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 font-semibold animate-pulse">
          <CheckCircle className="w-5 h-5 text-emerald-400" />
          <span>SOS BEACON TRANSMITTED (LORA + CELL)</span>
        </div>
      ) : (
        <button
          onClick={handleTrigger}
          disabled={isSending}
          className={`relative group overflow-hidden px-7 py-3.5 rounded-full font-bold uppercase tracking-wider text-sm transition-all duration-300 flex items-center space-x-3 text-white shadow-lg ${
            isSending
              ? 'bg-rose-900 cursor-not-allowed opacity-80'
              : 'bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 hover:from-rose-500 hover:to-red-600 hover:shadow-glow-danger active:scale-95'
          }`}
        >
          <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          {isSending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Broadcasting SOS...</span>
            </>
          ) : (
            <>
              <div className="relative flex items-center justify-center">
                <span className="animate-ping absolute inline-flex h-4 w-4 rounded-full bg-rose-400 opacity-75"></span>
                <AlertTriangle className="w-5 h-5 text-white relative z-10" />
              </div>
              <span>Emergency SOS</span>
              <Radio className="w-4 h-4 ml-1 opacity-70 group-hover:opacity-100" />
            </>
          )}
        </button>
      )}
    </div>
  );
}
