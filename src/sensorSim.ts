// Sensor-behaviour simulation for Circulation's physical computing page
// (sim.html). index.html's simulator hands readElement() clean 0..1 numbers
// to feel out the Five Elements mapping; this file stands between a body and
// that mapping the way the real hardware does, turning a ground-truth grip
// and heart rate into what the FSR and MAX30102 would actually report: raw
// ADC counts, calibration bounds, quantisation, an IR contact threshold, and
// beat-to-beat jitter. The maths mirrors hardware/cup/cup.ino exactly
// (PRESENCE, FSR_MIN/MAX, RATE_SIZE=8, the finger threshold and confidence
// formula) so tuning here is tuning the firmware's constants, not a fiction.
//
// Output is a plain CupSignal (src/fiveElements.ts), so readElement() itself
// never changes: only what feeds it does.

import type { CupSignal } from './fiveElements';

// mirrors hardware/cup/cup.ino
const PRESENCE = 0.12;
const RATE_SIZE = 8;
const TRUE_FSR_MIN = 200; // raw ADC with no grip, correctly calibrated
const TRUE_FSR_MAX = 3200; // raw ADC at firm grip, correctly calibrated
const UNCAL_FSR_MIN = 0; // an uncalibrated/default bound: never set from a RAW_LOG bench pass
const UNCAL_FSR_MAX = 4095;
const IR_FINGER_THRESHOLD = 50000;
const IR_CONFIDENCE_SPAN = 70000;

export interface SensorTruth {
  gripFirmness: number; // 0..1, ground truth: how hard the hand is actually pressing
  trueBpm: number; // ground truth heart rate
}

export interface SensorFaults {
  looseSeal: boolean; // palm isn't sealing the chamber well: weak, marginal PPG contact
  fidgeting: boolean; // an unsteady hand: FSR noise + missed/spurious beats
  uncalibrated: boolean; // FSR_MIN/MAX never set from a bench RAW_LOG pass
}

export interface SensorDiagnostics {
  rawAdc: number; // 0..4095, what the FSR ADC actually reports
  rawIr: number; // MAX30102 IR magnitude
  finger: boolean; // ir > threshold: usable optical contact
  present: boolean; // pressure > PRESENCE: the cup reads as held
  fsrMin: number;
  fsrMax: number;
}

export interface SensorTick {
  signal: CupSignal;
  diag: SensorDiagnostics;
}

function clamp(x: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, x));
}

function gaussian(std: number): number {
  // Box-Muller; std in the same units as the caller's noise budget
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return std * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

export function createSensorSim() {
  // FSR side (mirrors cup.ino's pressure/trend/holdT)
  let pressure = 0, prevPressure = 0, trend = 0, holdT = 0;
  // PPG side (mirrors cup.ino's intervals[]/rateSpot/bpm/regularity)
  const intervals = new Array<number>(RATE_SIZE).fill(60000 / 68);
  let rateSpot = 0;
  let beatClockMs = 0; // ms since the last simulated beat
  let bpm = 68;
  let regularity = 0.7;

  function tick(dtSeconds: number, truth: SensorTruth, faults: SensorFaults): SensorTick {
    const dt = Math.min(0.05, dtSeconds);
    const dtMs = dt * 1000;

    // --- FSR: ground truth -> raw ADC -> calibrated 0..1 (mirrors cup.ino:146-151) ---
    const fsrMin = faults.uncalibrated ? UNCAL_FSR_MIN : TRUE_FSR_MIN;
    const fsrMax = faults.uncalibrated ? UNCAL_FSR_MAX : TRUE_FSR_MAX;
    const trueAdc = TRUE_FSR_MIN + clamp(truth.gripFirmness, 0, 1) * (TRUE_FSR_MAX - TRUE_FSR_MIN);
    const fidgetNoise = faults.fidgeting ? gaussian(60) : 0;
    const rawAdc = Math.round(clamp(trueAdc + gaussian(8) + fidgetNoise, 0, 4095));
    const p = clamp((rawAdc - fsrMin) / (fsrMax - fsrMin), 0, 1);
    pressure = pressure * 0.6 + p * 0.4;
    const dp = pressure - prevPressure;
    trend = clamp(trend * 0.86 + dp * 9, -1, 1);
    prevPressure = pressure;
    if (pressure > 0.15 && Math.abs(trend) < 0.12) holdT += dt; else holdT *= 0.7;
    const hold = Math.min(1, holdT / 4);
    const present = pressure > PRESENCE;

    // --- PPG: ground truth heart rate -> raw IR -> finger/confidence/bpm/regularity ---
    // IR gain tracks how firmly the palm seals the chamber; a loose seal caps it
    // near the finger threshold, so contact drops in and out instead of holding.
    const sealGain = faults.looseSeal ? 0.35 : 1;
    const rawIr = Math.round(clamp(30000 + truth.gripFirmness * 90000 * sealGain + gaussian(4000), 0, 200000));
    const finger = rawIr > IR_FINGER_THRESHOLD;
    const confidence = finger ? clamp((rawIr - IR_FINGER_THRESHOLD) / IR_CONFIDENCE_SPAN, 0.1, 1) : 0;

    beatClockMs += dtMs;
    const missBeat = faults.fidgeting && Math.random() < 0.12; // a jostled sensor misses a beat
    const trueIntervalMs = 60000 / clamp(truth.trueBpm, 30, 220);
    if (finger && !missBeat && beatClockMs >= trueIntervalMs) {
      beatClockMs = 0;
      const jitterMs = gaussian(faults.fidgeting ? 55 : 12);
      const d = clamp(trueIntervalMs + jitterMs, 60000 / 220, 60000 / 30);
      intervals[rateSpot] = d;
      rateSpot = (rateSpot + 1) % RATE_SIZE;
      const mean = intervals.reduce((a, b) => a + b, 0) / RATE_SIZE;
      bpm = 60000 / mean;
      const variance = intervals.reduce((a, b) => a + (b - mean) ** 2, 0) / RATE_SIZE;
      const cv = mean > 1 ? Math.sqrt(variance) / mean : 1;
      regularity = 1 - clamp(cv / 0.25, 0, 1);
    }
    if (!finger) beatClockMs = 0; // mirrors cup.ino resetting lastBeatMs on contact loss

    return {
      signal: { pressure, pressureTrend: trend, bpm, regularity, hold, confidence },
      diag: { rawAdc, rawIr, finger, present, fsrMin, fsrMax },
    };
  }

  return { tick };
}
