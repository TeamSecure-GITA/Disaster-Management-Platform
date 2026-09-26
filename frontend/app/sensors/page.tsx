'use client';

import React from 'react';
import Link from 'next/link';
import { SensorLayer } from '../../components/maps/SensorLayer';
import { AnomalyChart } from '../../components/analytics/AnomalyChart';
import { useSensors } from '../../hooks/useSensors';
import { Cpu, Radio, Activity, ShieldCheck, Battery, Wifi } from 'lucide-react';

export default function SensorsPage() {
  const { sensors, networkStatus } = useSensors();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-slate-100 flex items-center gap-2">
            <Cpu className="w-6 h-6 text-amber-400" />
            <span>IOT GEOTECHNICAL SENSOR NETWORK</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            LoRaWAN Inclinometers, Acoustic Geophones, Piezometers & Weather Stations
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono">
          <Link href="/sensors/telemetry" className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800">
            Telemetry
          </Link>
          <Link href="/sensors/anomalies" className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800">
            Anomalies
          </Link>
          <Link href="/sensors/sensor-health" className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800">
            Node Health
          </Link>
          <Link href="/sensors/lora" className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800">
            LoRa Mesh
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-center">
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
          <span className="text-[10px] text-slate-500 uppercase block">Total Sensor Nodes</span>
          <span className="text-2xl font-bold text-slate-100">{networkStatus.onlineNodes} / {networkStatus.totalNodes}</span>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
          <span className="text-[10px] text-slate-500 uppercase block">Mesh Packet Integrity</span>
          <span className="text-2xl font-bold text-emerald-400">{networkStatus.meshHealthPct}%</span>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
          <span className="text-[10px] text-slate-500 uppercase block">Primary Gateway Protocol</span>
          <span className="text-2xl font-bold text-sky-400">LoRa 865 MHz (IN)</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800">
          <SensorLayer sensors={sensors} />
        </div>
        <AnomalyChart />
      </div>
    </div>
  );
}
