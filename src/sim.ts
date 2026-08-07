import { readElement, type CupSignal } from './fiveElements';
import { syncScore, roomColour, elementAgreement, circulationReading, type CupState } from './sync';
import { rgbCss, createCupPanel, createFlow, createCupVisual, stepCupVisual, type CupVisual } from './cupView';
import { createSensorSim, type SensorFaults } from './sensorSim';

// Physical computing simulation for Circulation. Same three-cup stage as
// index.html, but instead of clean sliders feeding readElement() directly,
// each cup runs sensorSim.ts: a ground-truth grip and heart rate, turned into
// what the real FSR and MAX30102 would actually report (raw ADC, calibration
// bounds, IR contact threshold, beat jitter), mirroring hardware/cup/cup.ino.
// Fault toggles rehearse the open questions from hardware/TECHNICIAN_BRIEF.txt:
// a loose palm seal, a fidgeting hand, and firmware that was never calibrated
// from a bench RAW_LOG pass.

const CUP_COUNT = 3;

interface Cup extends CupVisual {
  gripFirmness: number;
  trueBpm: number;
  faults: SensorFaults;
  sensor: ReturnType<typeof createSensorSim>;
  lastSignal: CupSignal;
  diagEl: HTMLElement;
}

const cupsEl = document.getElementById('cups')!;
const stageEl = document.getElementById('stage')!;
const flowEl = document.getElementById('flow') as HTMLCanvasElement;
const roomBar = document.getElementById('room-bar')!;
const roomMeta = document.getElementById('room-meta')!;
const cups: Cup[] = [];

function slider(label: string, min: number, max: number, step: number, value: number): string {
  return `<label><span>${label}</span></label><input type="range" min="${min}" max="${max}" step="${step}" value="${value}" />`;
}

function toggle(label: string, id: string): string {
  return `<label class="flt"><input type="checkbox" id="${id}" /><span>${label}</span></label>`;
}

for (let i = 0; i < CUP_COUNT; i++) {
  const dom = createCupPanel(cupsEl);
  const sealId = `seal-${i}`, fidgetId = `fidget-${i}`, calId = `cal-${i}`;
  dom.controls.innerHTML = `
    ${slider('grip firmness', 0, 1, 0.01, 0)}
    ${slider('heart rate (ground truth)', 40, 120, 1, 68)}
    <div class="flts">
      ${toggle('loose palm seal', sealId)}
      ${toggle('fidgeting', fidgetId)}
      ${toggle('never calibrated', calId)}
    </div>
    <div class="diag">-</div>
  `;
  const inputs = dom.controls.querySelectorAll<HTMLInputElement>('input[type=range]');
  const seal = dom.controls.querySelector<HTMLInputElement>(`#${sealId}`)!;
  const fidget = dom.controls.querySelector<HTMLInputElement>(`#${fidgetId}`)!;
  const cal = dom.controls.querySelector<HTMLInputElement>(`#${calId}`)!;
  const diagEl = dom.controls.querySelector<HTMLElement>('.diag')!;

  const cup: Cup = {
    ...createCupVisual(dom),
    gripFirmness: 0, trueBpm: 68,
    faults: { looseSeal: false, fidgeting: false, uncalibrated: false },
    sensor: createSensorSim(),
    lastSignal: { pressure: 0, pressureTrend: 0, bpm: 68, regularity: 0.7, hold: 0, confidence: 0 },
    diagEl,
  };
  inputs[0]!.addEventListener('input', (e) => { cup.gripFirmness = parseFloat((e.target as HTMLInputElement).value); });
  inputs[1]!.addEventListener('input', (e) => { cup.trueBpm = parseFloat((e.target as HTMLInputElement).value); });
  seal.addEventListener('change', (e) => { cup.faults.looseSeal = (e.target as HTMLInputElement).checked; });
  fidget.addEventListener('change', (e) => { cup.faults.fidgeting = (e.target as HTMLInputElement).checked; });
  cal.addEventListener('change', (e) => { cup.faults.uncalibrated = (e.target as HTMLInputElement).checked; });
  cups.push(cup);
}

const flow = createFlow(stageEl, flowEl, cups);

// --- Main loop ---

let last = performance.now();
function loop(now: number): void {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;

  for (const c of cups) {
    const tick = c.sensor.tick(dt, { gripFirmness: c.gripFirmness, trueBpm: c.trueBpm }, c.faults);
    c.lastSignal = tick.signal;
    stepCupVisual(c, dt, tick.diag.present, tick.diag.present ? readElement(tick.signal) : null, tick.signal.pressureTrend);

    const d = tick.diag;
    c.diagEl.textContent =
      `ADC ${d.rawAdc} (cal ${d.fsrMin}-${d.fsrMax}) · IR ${d.rawIr} ${d.finger ? 'contact' : 'no contact'} · ` +
      `confidence ${Math.round(tick.signal.confidence * 100)}% · bpm ${Math.round(tick.signal.bpm)}`;
  }

  // collective, from the sensed (not ground-truth) signals, as the hub would see it
  const states: CupState[] = cups.map((c) => ({ bpm: c.lastSignal.bpm, pressure: c.lastSignal.pressure }));
  const sync = syncScore(states);
  const room = roomColour(cups.map((c) => c.shown), sync);
  const heldElements = cups.filter((c) => c.present).map((c) => c.element);
  const agree = elementAgreement(heldElements);
  const circ = circulationReading(cups.map((c) => (c.present ? c.element : null)));

  flow.draw(dt, circ.edges);

  const status = circ.score >= 1 && heldElements.length >= 3
    ? 'the cycle turns'
    : sync > 0.7 ? 'the room blooms' : sync > 0.35 ? 'beginning to harmonise' : 'separate bodies';

  roomBar.style.background = rgbCss([Math.round(room[0]), Math.round(room[1]), Math.round(room[2])] as [number, number, number]);
  roomMeta.innerHTML =
    `<div>synchronisation <b>${Math.round(sync * 100)}</b></div>` +
    `<div>circulation <b>${Math.round(circ.score * 100)}</b></div>` +
    `<div>element agreement <b>${Math.round(agree * 100)}</b></div>` +
    `<div>${status}</div>`;

  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
