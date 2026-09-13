// Web Audio API Acoustic Emergency Siren Generator (100% Offline, Zero Network Dependency)
let audioCtx = null;
let oscNode = null;
let lfoNode = null;
let gainNode = null;
let isSirenPlaying = false;

export function startEmergencySiren() {
  if (isSirenPlaying) return;

  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
      console.warn("Web Audio API not supported on this device.");
      return;
    }

    if (!audioCtx || audioCtx.state === "closed") {
      audioCtx = new AudioContextClass();
    }

    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }

    const now = audioCtx.currentTime;

    // Master Gain
    gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime(0.3, now);
    gainNode.connect(audioCtx.destination);

    // Primary Tone Oscillator (440 Hz base carrier)
    oscNode = audioCtx.createOscillator();
    oscNode.type = "sawtooth";
    oscNode.frequency.setValueAtTime(650, now);

    // Low Frequency Oscillator (LFO) for the classic rising/falling emergency siren sweep
    lfoNode = audioCtx.createOscillator();
    lfoNode.type = "sine";
    lfoNode.frequency.setValueAtTime(0.7, now); // Sweep cycle ~1.4 seconds

    // LFO Gain (modulation depth: +/- 250 Hz)
    const lfoGain = audioCtx.createGain();
    lfoGain.gain.setValueAtTime(250, now);

    lfoNode.connect(lfoGain);
    lfoGain.connect(oscNode.frequency);

    oscNode.connect(gainNode);

    lfoNode.start();
    oscNode.start();

    isSirenPlaying = true;
  } catch (err) {
    console.error("Failed to start acoustic siren:", err);
  }
}

export function stopEmergencySiren() {
  if (!isSirenPlaying) return;

  try {
    if (oscNode) {
      oscNode.stop();
      oscNode.disconnect();
      oscNode = null;
    }
    if (lfoNode) {
      lfoNode.stop();
      lfoNode.disconnect();
      lfoNode = null;
    }
    if (gainNode) {
      gainNode.disconnect();
      gainNode = null;
    }
    isSirenPlaying = false;
  } catch (err) {
    console.error("Failed to stop acoustic siren:", err);
    isSirenPlaying = false;
  }
}

export function isEmergencySirenPlaying() {
  return isSirenPlaying;
}
