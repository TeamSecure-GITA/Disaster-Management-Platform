'use client';

import React from 'react';
import { useSensors } from '../../../hooks/useSensors';
import { Activity, Battery, Signal, Clock } from 'lucide-react';
import { formatDateTime } from '../../../utils/dates';

export default function SensorsTelemetryPage() {
  const { sensors } = useSensors();

  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-slate-800">
        <h1 className="text-xl font-bold font-mono tracking-tight text-slate-100 flex items-center gap-2">
          <Activity className="w-5 h-5 text-amber-400" />
          <span>REAL-TIME RAW SENSOR TELEMETRY FEEDS</span>
        </h1>
        <p className="text-xs text-slate-400 font-mono mt-0.5">
          Live stream from tiltmeters, pore-pressure probes, and seismic geophones
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sensors.map((sensor) => (
          <div key={sensor.id} className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 text-xs space-y-3 font-mono">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-slate-100">{sensor.name}</span>
              <span
                className={`px-2 py-0.5 rounded font-bold ${
                  sensor.status === 'ALERT_TRIGGERED'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                    : 'bg-emerald-500/15 text-emerald-400'
                }`}
              >
                {sensor.status}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 block">CURRENT VALUE</span>
                <span className="text-xl font-bold text-sky-400">
                  {sensor.lastReading.value} {sensor.lastReading.unit}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-500 block">THRESHOLD</span>
                <span className="text-sm font-bold text-slate-300">
                  {sensor.criticalThreshold} {sensor.lastReading.unit}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 pt-1">
              <div className="flex items-center gap-1.5">
                <Battery className="w-3.5 h-3.5 text-emerald-400" />
                <span>Battery: {sensor.lastReading.batteryPct}%</span>
              </div>
              <div className="flex items-center gap-1.5 justify-end">
                <Signal className="w-3.5 h-3.5 text-sky-400" />
                <span>RSSI: {sensor.lastReading.signalStrengthDbm} dBm</span>
              </div>
            </div>

            <div className="text-[9px] text-slate-500 pt-2 border-t border-slate-800 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>Timestamp: {formatDateTime(sensor.lastReading.timestamp)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
