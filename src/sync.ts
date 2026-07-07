// Collective synchronisation: the metric that makes three cups become one.
//
// As participants synchronise (pulses converging, grip pressures aligning), the
// score rises toward 1 and the room colour blooms from the three cup colours.
// The metric is kept deliberately legible and slow so convergence feels earned,
// not arbitrary: the risk this project must avoid is synchronisation reading as
// mood lighting. Tune the two windows below against real triads.

import { ELEMENTS, type Element } from './fiveElements';

export interface CupState {
  bpm: number;
  pressure: number; // 0..1
}

const BPM_CONVERGE = 22; // within this spread, pulses count as converging
const PRESSURE_ALIGN = 0.45; // within this spread, grips count as aligned

/** 0..1 collective synchronisation from the current cup states (before smoothing). */
export function syncScore(cups: CupState[]): number {
  const active = cups.filter((c) => c.bpm > 20);
  if (active.length < 2) return 0;
  const bpms = active.map((c) => c.bpm);
  const ps = active.map((c) => c.pressure);
  const bpmSpread = Math.max(...bpms) - Math.min(...bpms);
  const pSpread = Math.max(...ps) - Math.min(...ps);
  const bpmConv = 1 - Math.min(1, bpmSpread / BPM_CONVERGE);
  const pAlign = 1 - Math.min(1, pSpread / PRESSURE_ALIGN);
  const pairs = active.length / cups.length; // 2 of 3 present counts less than 3 of 3
  return Math.max(0, Math.min(1, (0.6 * bpmConv + 0.4 * pAlign) * pairs));
}

/**
 * The room colour: the average of the cup colours, brought to life by the sync
 * score. Low sync leaves it muted and grey; high sync makes it a vivid, unified
 * field. The cups are the seed; the room is the bloom.
 */
export function roomColour(cupRgb: Array<[number, number, number]>, sync: number): [number, number, number] {
  if (cupRgb.length === 0) return [20, 20, 24];
  const avg: [number, number, number] = [0, 0, 0];
  for (const c of cupRgb) { avg[0] += c[0]; avg[1] += c[1]; avg[2] += c[2]; }
  avg[0] /= cupRgb.length; avg[1] /= cupRgb.length; avg[2] /= cupRgb.length;
  // desaturate toward grey when unsynced, saturate + brighten when synced
  const grey = (avg[0] + avg[1] + avg[2]) / 3;
  const k = 0.25 + 0.75 * sync;
  return [
    Math.round((grey + (avg[0] - grey) * k) * (0.55 + 0.45 * sync)),
    Math.round((grey + (avg[1] - grey) * k) * (0.55 + 0.45 * sync)),
    Math.round((grey + (avg[2] - grey) * k) * (0.55 + 0.45 * sync)),
  ];
}

/** How aligned the three cups' dominant elements are, for a readout (0..1). */
export function elementAgreement(elements: Element[]): number {
  if (elements.length < 2) return 0;
  const counts = {} as Record<Element, number>;
  for (const e of ELEMENTS) counts[e] = 0;
  for (const e of elements) counts[e]++;
  const top = Math.max(...ELEMENTS.map((e) => counts[e]));
  return (top - 1) / (elements.length - 1);
}
