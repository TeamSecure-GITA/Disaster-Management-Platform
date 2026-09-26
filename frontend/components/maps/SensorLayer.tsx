'use client';

import React from 'react';
import { DisasterSensor } from '../../types/sensor';
import { Cpu, Radio } from 'lucide-react';

interface SensorLayerProps {
  sensors: DisasterSensor[];
  onSelectSensor?: (sensor: DisasterSensor) => void;
}

export function SensorLayer({ sensors, onSelectSensor }: SensorLayerProps) {
  return (
    <div className="space-y-1.5">
      <span className="text-[10px] font-mono uppercase text-slate-400 font-bold tracking-wider">
        IoT & LoRa Telemetry Nodes
      </span>
      {sensors.map((sensor) => (
        <div
          key={sensor.id}
          onClick={() => onSelectSensor && onSelectSensor(sensor)}
          className="p-2 rounded-lg bg-slate-950/70 hover:bg-slate-900 border border-slate-800 flex items-center justify-between text-xs cursor-pointer transition-colors"
        >
          <div className="flex items-center space-x-2 truncate">
            <span
              className={`w-2 h-2 rounded-full flex-shrink-0 ${
                sensor.status === 'ALERT_TRIGGERED'
                  ? 'bg-rose-500 animate-ping'
                  : 'bg-emerald-400'
              }`}
            />
            <span className="font-medium text-slate-200 truncate">{sensor.name}</span>
          </div>
          <div className="text-right font-mono text-[11px] text-sky-400 flex-shrink-0 ml-2">
            {sensor.lastReading.value} {sensor.lastReading.unit}
          </div>
        </div>
      ))}
    </div>
  );
}
