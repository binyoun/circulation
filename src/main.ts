import { readElement, ELEMENTS, ELEMENT_INFO, type Element, type CupSignal } from './fiveElements';
import { syncScore, roomColour, elementAgreement, type CupState } from './sync';

// Browser simulator for Circulation. Three virtual cups run the real Five
// Elements engine and the real synchronisation metric, so the interaction can be
// designed and tuned before any hardware exists (and this ships on the site as
// living documentation). Pressure trend and sustained-hold are derived from how
// you move the sliders over time, exactly as they will be on the cup.

const CUP_COUNT = 3;

interface Cup {
  // raw slider values
  pressure: number;
  bpm: number;
  regularity: number;
  confidence: number;
  // derived over time
  prevPressure: number;
  trend: number;
  holdT: number;
  // dom
  disc: HTMLElement;
  name: HTMLElement;
  meta: HTMLElement;
  bars: HTMLElement[];
  // last reading (for room)
  rgb: [number, number, number];
  element: Element;
}

const cupsEl = document.getElementById('cups')!;
const roomBar = document.getElementById('room-bar')!;
const roomMeta = document.getElementById('room-meta')!;
const cups: Cup[] = [];

function rgbCss([r, g, b]: [number, number, number]): string {
  return `rgb(${r},${g},${b})`;
}

for (let i = 0; i < CUP_COUNT; i++) {
  const panel = document.createElement('div');
  panel.className = 'cup';
  panel.innerHTML = `
    <div class="disc"></div>
    <div class="el"><div class="name">-</div><div class="meta">-</div></div>
    <div class="weights">${ELEMENTS.map((e) => `<div class="wb" data-el="${e}" style="background:${rgbCss(ELEMENT_INFO[e].rgb)}"></div>`).join('')}</div>
    <div class="ctl">
      ${ctl('pressure', 0, 1, 0.01, 0)}
      ${ctl('pulse bpm', 40, 120, 1, 68)}
      ${ctl('regularity', 0, 1, 0.01, 0.7)}
      ${ctl('pulse confidence', 0, 1, 0.01, 0.9)}
    </div>`;
  cupsEl.appendChild(panel);

  const inputs = panel.querySelectorAll('input');
  const cup: Cup = {
    pressure: 0, bpm: 68, regularity: 0.7, confidence: 0.9,
    prevPressure: 0, trend: 0, holdT: 0,
    disc: panel.querySelector('.disc')!,
    name: panel.querySelector('.el .name')!,
    meta: panel.querySelector('.el .meta')!,
    bars: [...panel.querySelectorAll<HTMLElement>('.wb')],
    rgb: [20, 20, 24], element: 'earth',
  };
  (inputs[0] as HTMLInputElement).addEventListener('input', (e) => { cup.pressure = parseFloat((e.target as HTMLInputElement).value); });
  (inputs[1] as HTMLInputElement).addEventListener('input', (e) => { cup.bpm = parseFloat((e.target as HTMLInputElement).value); });
  (inputs[2] as HTMLInputElement).addEventListener('input', (e) => { cup.regularity = parseFloat((e.target as HTMLInputElement).value); });
  (inputs[3] as HTMLInputElement).addEventListener('input', (e) => { cup.confidence = parseFloat((e.target as HTMLInputElement).value); });
  cups.push(cup);
}

function ctl(label: string, min: number, max: number, step: number, value: number): string {
  return `<label><span>${label}</span></label><input type="range" min="${min}" max="${max}" step="${step}" value="${value}" />`;
}

let last = performance.now();
function loop(now: number): void {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;

  for (const c of cups) {
    // derive trend from slider motion (rising = building/Wood, falling = releasing/Metal)
    const dp = c.pressure - c.prevPressure;
    c.trend = Math.max(-1, Math.min(1, c.trend * 0.86 + dp * 9));
    c.prevPressure = c.pressure;
    // derive sustained-hold: accumulates on a steady, present grip
    if (c.pressure > 0.15 && Math.abs(c.trend) < 0.12) c.holdT += dt; else c.holdT *= 0.7;
    const hold = Math.min(1, c.holdT / 4);

    const signal: CupSignal = {
      pressure: c.pressure, pressureTrend: c.trend, bpm: c.bpm,
      regularity: c.regularity, hold, confidence: c.confidence,
    };
    const r = readElement(signal);
    c.rgb = r.rgb; c.element = r.element;

    c.disc.style.background = `radial-gradient(circle at 38% 34%, ${rgbCss(r.rgb)}, rgba(0,0,0,0.25))`;
    c.disc.style.boxShadow = `0 0 26px ${rgbCss(r.rgb)}66, inset 0 0 14px rgba(0,0,0,0.4)`;
    const info = ELEMENT_INFO[r.element];
    c.name.textContent = `${r.element} ${info.hanja}`;
    c.name.style.color = rgbCss(info.rgb);
    c.meta.textContent = `${info.organ} · ${info.state}`;
    for (const bar of c.bars) {
      const el = bar.dataset.el as Element;
      bar.style.height = `${Math.max(2, r.weights[el] * 26)}px`;
      bar.style.opacity = String(0.35 + 0.65 * r.weights[el]);
    }
  }

  // collective
  const states: CupState[] = cups.map((c) => ({ bpm: c.bpm, pressure: c.pressure }));
  const sync = syncScore(states);
  const room = roomColour(cups.map((c) => c.rgb), sync);
  const agree = elementAgreement(cups.map((c) => c.element));
  roomBar.style.background = rgbCss(room);
  roomMeta.innerHTML =
    `<div>synchronisation <b>${Math.round(sync * 100)}</b></div>` +
    `<div>element agreement <b>${Math.round(agree * 100)}</b></div>` +
    `<div>${sync > 0.7 ? 'the room blooms' : sync > 0.35 ? 'beginning to harmonise' : 'three separate bodies'}</div>`;

  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
