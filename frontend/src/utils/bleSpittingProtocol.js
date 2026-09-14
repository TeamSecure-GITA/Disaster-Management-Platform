/**
 * Web-Bluetooth "Spitting" Protocol for Debris Penetration
 * 
 * Asynchronous Micro-Bursting Engine:
 * Eliminates fragile continuous BLE handshakes under 3-6 feet of wet mud/rubble.
 * Compresses SOS into an ultra-dense 18-byte binary frame and executes high-power
 * 15ms RF bursts ("spitting") every 45 seconds before returning to ultra-low-power sleep.
 */

// 18-byte packed binary encoder
export const encodeSosBurstPacket = ({
  lat = 28.0642,
  lng = 95.3318,
  survivorsCount = 1,
  batteryPercent = 100,
  crushInjury = false,
  bleeding = false,
  hypothermia = false,
  conscious = true,
  airPressureHpa = 1013,
  seqId = 1
}) => {
  const buffer = new ArrayBuffer(18);
  const view = new DataView(buffer);

  // Lat / Lng scaled to 1e5 for 1-meter precision (4 bytes each)
  view.setInt32(0, Math.round(lat * 100000), false);
  view.setInt32(4, Math.round(lng * 100000), false);

  // Byte 8: Survivors (upper 4 bits: 0-15) + Battery (lower 4 bits: 0-15 -> ~6.6% step)
  const clampedSurvivors = Math.min(15, Math.max(1, survivorsCount));
  const batteryNibble = Math.min(15, Math.round((batteryPercent / 100) * 15));
  view.setUint8(8, (clampedSurvivors << 4) | batteryNibble);

  // Byte 9: Triage flags bitmask
  let triageMask = 0;
  if (crushInjury) triageMask |= 1 << 0;
  if (bleeding) triageMask |= 1 << 1;
  if (hypothermia) triageMask |= 1 << 2;
  if (conscious) triageMask |= 1 << 3;
  view.setUint8(9, triageMask);

  // Bytes 10-11: Barometric air pocket pressure (offset from 800 hPa)
  const pressureOffset = Math.min(65535, Math.max(0, Math.round((airPressureHpa - 800) * 10)));
  view.setUint16(10, pressureOffset, false);

  // Bytes 12-13: Sequence ID
  view.setUint16(12, seqId % 65535, false);

  // Bytes 14-17: Simple CRC checksum
  let checksum = 0x5a;
  const uint8View = new Uint8Array(buffer);
  for (let i = 0; i < 14; i++) {
    checksum = (checksum ^ uint8View[i]) * 16777619;
  }
  view.setUint32(14, checksum >>> 0, false);

  // Convert to Hex string representation
  let hexString = '';
  for (let i = 0; i < 18; i++) {
    hexString += uint8View[i].toString(16).padStart(2, '0');
  }

  return {
    buffer,
    uint8Array: uint8View,
    hex: hexString,
    byteLength: 18
  };
};

// 18-byte packed binary decoder
export const decodeSosBurstPacket = (hexStringOrBuffer) => {
  let view;
  if (typeof hexStringOrBuffer === 'string') {
    const cleanHex = hexStringOrBuffer.replace(/\s+/g, '');
    const bytes = new Uint8Array(cleanHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
    view = new DataView(bytes.buffer);
  } else if (hexStringOrBuffer instanceof ArrayBuffer) {
    view = new DataView(hexStringOrBuffer);
  } else if (hexStringOrBuffer.buffer) {
    view = new DataView(hexStringOrBuffer.buffer);
  } else {
    throw new Error('Unsupported buffer input format');
  }

  const lat = view.getInt32(0, false) / 100000;
  const lng = view.getInt32(4, false) / 100000;

  const byte8 = view.getUint8(8);
  const survivorsCount = (byte8 >> 4) & 0x0f;
  const batteryPercent = Math.round(((byte8 & 0x0f) / 15) * 100);

  const triageMask = view.getUint8(9);
  const crushInjury = Boolean(triageMask & (1 << 0));
  const bleeding = Boolean(triageMask & (1 << 1));
  const hypothermia = Boolean(triageMask & (1 << 2));
  const conscious = Boolean(triageMask & (1 << 3));

  const pressureOffset = view.getUint16(10, false);
  const airPressureHpa = 800 + (pressureOffset / 10);
  const seqId = view.getUint16(12, false);

  return {
    lat,
    lng,
    survivorsCount,
    batteryPercent,
    triage: { crushInjury, bleeding, hypothermia, conscious },
    airPressureHpa,
    seqId
  };
};

/**
 * Calculate Battery Lifespan: Continuous BLE Mesh vs Asynchronous Micro-Burst Spitting
 * @param {number} batteryCapacityMah Phone battery capacity (standard: 3000 to 5000 mAh)
 * @param {number} currentBatteryPercent (0 - 100)
 * @param {number} burstIntervalSec (Standard: 45 seconds)
 * @param {number} burstDurationMs (Standard: 15 ms)
 */
export const calculateBatteryComparison = (
  batteryCapacityMah = 4000,
  currentBatteryPercent = 50,
  burstIntervalSec = 45,
  burstDurationMs = 15
) => {
  const remainingMah = (batteryCapacityMah * currentBatteryPercent) / 100;

  // 1. Continuous BLE Mesh stream (active RX/TX, scanning, keep-alive handshakes)
  // Average current draw: ~22 mA
  const continuousBleHours = remainingMah / 22;

  // 2. Micro-Bursting Spitting:
  // Sleep current: 0.025 mA (deep phone standby with timer)
  // Burst current: 35 mA for 15ms (maximum RF hardware gain +8dBm to +20dBm)
  const burstRatio = burstDurationMs / (burstIntervalSec * 1000); // 15 / 45000 = 0.00033
  const avgMicroBurstCurrent = (35 * burstRatio) + (0.025 * (1 - burstRatio)); // ~0.036 mA
  const microBurstHours = remainingMah / avgMicroBurstCurrent;

  return {
    remainingMah: Math.round(remainingMah),
    continuousBleHours: Number(continuousBleHours.toFixed(1)),
    continuousBleDays: Number((continuousBleHours / 24).toFixed(1)),
    microBurstHours: Math.round(microBurstHours),
    microBurstDays: Number((microBurstHours / 24).toFixed(1)),
    lifespanMultiplier: Math.round(microBurstHours / continuousBleHours)
  };
};

/**
 * RF Path-Loss Mud/Concrete Burial Depth Calculator for Rescue Drone Receiver
 */
export const calculateBurialDepth = (rssiDbm, txPowerDbm = 8, droneAltitudeMeters = 35, debrisType = 'WET_MUD') => {
  // Free space path loss for air gap at 2.4 GHz
  const freeSpaceLossAir = 20 * Math.log10(droneAltitudeMeters) + 20 * Math.log10(2400) - 27.55;
  const netSignalDeficit = Math.max(0, (txPowerDbm - rssiDbm) - freeSpaceLossAir);

  // Attenuation coefficient in dB/meter
  const attenuationDbPerMeter = debrisType === 'CRUSHED_CONCRETE' ? 14.2 : 18.8; // wet mud absorbs more RF
  const depthMeters = Math.min(7.5, Math.max(0.2, netSignalDeficit / attenuationDbPerMeter));

  return {
    depthMeters: Number(depthMeters.toFixed(2)),
    attenuationDbPerMeter,
    freeSpaceLossAir: Math.round(freeSpaceLossAir),
    rssiDbm,
    penetrationGrade: depthMeters > 3.0 ? 'DEEP_SUB_STRATA' : (depthMeters > 1.2 ? 'MID_DEBRIS' : 'SHALLOW_COLLAPSE')
  };
};
