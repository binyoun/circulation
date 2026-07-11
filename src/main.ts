import { readElement, ELEMENTS, ELEMENT_INFO, type Element, type CupSignal } from './fiveElements';
import { syncScore, roomColour, elementAgreement, circulationReading, type CupState } from './sync';

// Browser simulator for Circulation. Three virtual cups run the real Five
// Elements engine, the real synchronisation metric, and the real generating-
// cycle (상생) circulation reading, so the interaction can be designed and tuned
// before any hardware exists (and this ships on the site as living
// documentation). Pressure trend and sustained-hold are derived from how you
// move the sliders over time, exactly as they will be on the cup.

const CUP_COUNT = 3;
const PRESENCE = 0.12; // grip below this reads as a released cup
const MARK_FADE_S = 40; // a cupping mark's days of fading, compressed to seconds
const IDLE_RGB: [number, number, number] = [20, 20, 24];

interface Mark {
  rgb: [number, number, number];
  element: Element;
  age: number;
}

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
  present: boolean;
  heldRgb: [number, number, number] | null; // sampled at steady moments; becomes the mark
  heldElement: Element | null;
  mark: Mark | null; // the afterglow left behind after release
  shown: [number, number, number]; // displayed colour (smoothed live, or fading mark)
  glow: number; // displayed glow strength 0..1
  // dom
  disc: HTMLElement;
  name: HTMLElement;
  meta: HTMLElement;
  bars: HTMLElement[];
  // last live reading (for room + circulation)
  rgb: [number, number, number];
  element: Element;
}

const cupsEl = document.getElementById('cups')!;
const stageEl = document.getElementById('stage')!;
const flowEl = document.getElementById('flow') as HTMLCanvasElement;
const flowCtx = flowEl.getContext('2d')!;
const roomBar = document.getElementById('room-bar')!;
const roomMeta = document.getElementById('room-meta')!;
const cups: Cup[] = [];

function rgbCss([r, g, b]: [number, number, number]): string {
  return `rgb(${r},${g},${b})`;
}

function mixRgb(a: [number, number, number], b: [number, number, number], t: number): [number, number, number] {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
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
    present: false, heldRgb: null, heldElement: null, mark: null,
    shown: [...IDLE_RGB] as [number, number, number], glow: 0,
    disc: panel.querySelector('.disc')!,
    name: panel.querySelector('.el .name')!,
    meta: panel.querySelector('.el .meta')!,
    bars: [...panel.querySelectorAll<HTMLElement>('.wb')],
    rgb: [...IDLE_RGB] as [number, number, number], element: 'earth',
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

// --- Flow layer: light travelling cup to cup along active generating edges ---

interface FlowParticle {
  from: number;
  to: number;
  t: number; // 0..1 along the arc
  speed: number;
  alpha: number;
}
let particles: FlowParticle[] = [];

function discCentre(i: number): [number, number] {
  const s = stageEl.getBoundingClientRect();
  const d = cups[i]!.disc.getBoundingClientRect();
  return [d.left - s.left + d.width / 2, d.top - s.top + d.height / 2];
}

function qbez(x0: number, y0: number, cx: number, cy: number, x1: number, y1: number, t: number): [number, number] {
  const u = 1 - t;
  return [u * u * x0 + 2 * u * t * cx + t * t * x1, u * u * y0 + 2 * u * t * cy + t * t * y1];
}

function drawFlow(dt: number, edges: Array<{ from: number; to: number }>): void {
  const dpr = window.devicePixelRatio || 1;
  const w = stageEl.clientWidth;
  const h = stageEl.clientHeight;
  if (flowEl.width !== Math.round(w * dpr) || flowEl.height !== Math.round(h * dpr)) {
    flowEl.width = Math.round(w * dpr);
    flowEl.height = Math.round(h * dpr);
  }
  flowCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  flowCtx.clearRect(0, 0, w, h);

  // spawn light along active edges, staggered so the flow breathes
  for (const ed of edges) {
    const n = particles.filter((p) => p.from === ed.from && p.to === ed.to).length;
    if (n < 2 && Math.random() < dt * (n === 0 ? 3 : 0.7)) {
      particles.push({ from: ed.from, to: ed.to, t: 0, speed: 0.28 + Math.random() * 0.12, alpha: 0 });
    }
  }

  const active = new Set(edges.map((e) => `${e.from}>${e.to}`));
  flowCtx.globalCompositeOperation = 'lighter';
  particles = particles.filter((p) => {
    p.t += dt * p.speed;
    const alive = active.has(`${p.from}>${p.to}`);
    p.alpha = Math.max(0, Math.min(1, p.alpha + (alive ? dt * 2 : -dt * 2)));
    if (p.t >= 1 || (p.alpha <= 0 && !alive)) return false;

    const [x0, y0] = discCentre(p.from);
    const [x1, y1] = discCentre(p.to);
    // a slight arc, so the flow reads as passage rather than a straight wire
    const dx = x1 - x0, dy = y1 - y0;
    const len = Math.hypot(dx, dy) || 1;
    const cx = (x0 + x1) / 2 - (dy / len) * len * 0.16;
    const cy = (y0 + y1) / 2 + (dx / len) * len * 0.16;
    const col = mixRgb(cups[p.from]!.shown, cups[p.to]!.shown, p.t);
    const ends = Math.sin(Math.PI * p.t) ** 0.5; // light leaves one disc, enters the other
    for (let g = 0; g < 5; g++) {
      const tt = p.t - g * 0.035;
      if (tt < 0) continue;
      const [x, y] = qbez(x0, y0, cx, cy, x1, y1, tt);
      const a = p.alpha * ends * (g === 0 ? 0.9 : 0.28 * (1 - g / 5));
      flowCtx.beginPath();
      flowCtx.fillStyle = `rgba(${Math.round(col[0])},${Math.round(col[1])},${Math.round(col[2])},${a})`;
      flowCtx.arc(x, y, g === 0 ? 3.4 : 2.4, 0, Math.PI * 2);
      flowCtx.fill();
    }
    return true;
  });
  flowCtx.globalCompositeOperation = 'source-over';
}

// --- Main loop ---

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

    const present = c.pressure > PRESENCE;
    let target: [number, number, number];
    let glowTarget: number;

    if (present) {
      const signal: CupSignal = {
        pressure: c.pressure, pressureTrend: c.trend, bpm: c.bpm,
        regularity: c.regularity, hold, confidence: c.confidence,
      };
      const r = readElement(signal);
      c.rgb = r.rgb; c.element = r.element;
      if (!c.present) { c.mark = null; c.heldRgb = null; c.heldElement = null; }
      // sample the mark from steady moments, so the flick of letting go
      // (which reads as Metal) does not decide what lingers
      if (Math.abs(c.trend) < 0.35 || !c.heldRgb) { c.heldRgb = r.rgb; c.heldElement = r.element; }
      target = r.rgb;
      glowTarget = 1;

      const info = ELEMENT_INFO[r.element];
      c.name.textContent = `${r.element} ${info.hanja}`;
      c.name.style.color = rgbCss(info.rgb);
      c.name.style.opacity = '1';
      c.meta.textContent = `${info.organ} · ${info.state}`;
      for (const bar of c.bars) {
        const el = bar.dataset.el as Element;
        bar.style.height = `${Math.max(2, r.weights[el] * 26)}px`;
        bar.style.opacity = String(0.35 + 0.65 * r.weights[el]);
      }
    } else {
      // afterglow: the released cup keeps a mark that fades like a cupping mark
      if (c.present && c.heldRgb && c.heldElement) c.mark = { rgb: c.heldRgb, element: c.heldElement, age: 0 };
      if (c.mark) {
        c.mark.age += dt;
        const k = Math.max(0, 1 - c.mark.age / MARK_FADE_S);
        if (k <= 0) c.mark = null;
      }
      if (c.mark) {
        const strength = Math.pow(Math.max(0, 1 - c.mark.age / MARK_FADE_S), 0.75);
        target = mixRgb(IDLE_RGB, c.mark.rgb, strength);
        glowTarget = 0.45 * strength;
        const info = ELEMENT_INFO[c.mark.element];
        c.name.textContent = `${c.mark.element} ${info.hanja}`;
        c.name.style.color = rgbCss(info.rgb);
        c.name.style.opacity = String(0.25 + 0.75 * strength);
        c.meta.textContent = 'mark, fading';
        // weight bars stay frozen: the last reading is what the mark remembers
      } else {
        target = IDLE_RGB;
        glowTarget = 0;
        c.name.textContent = '-';
        c.name.style.color = '';
        c.name.style.opacity = '0.5';
        c.meta.textContent = 'at rest';
        for (const bar of c.bars) { bar.style.height = '2px'; bar.style.opacity = '0.35'; }
      }
    }
    c.present = present;

    // displayed colour: quick to answer a hand, slow to let go
    const rate = Math.min(1, dt * (present ? 8 : 2.2));
    c.shown = mixRgb(c.shown, target, rate);
    c.glow += (glowTarget - c.glow) * rate;

    const shown: [number, number, number] = [Math.round(c.shown[0]), Math.round(c.shown[1]), Math.round(c.shown[2])];
    c.disc.style.background = `radial-gradient(circle at 38% 34%, ${rgbCss(shown)}, rgba(0,0,0,0.25))`;
    c.disc.style.boxShadow = `0 0 ${Math.round(6 + 26 * c.glow)}px rgba(${shown[0]},${shown[1]},${shown[2]},${0.15 + 0.35 * c.glow}), inset 0 0 14px rgba(0,0,0,0.4)`;
  }

  // collective
  const states: CupState[] = cups.map((c) => ({ bpm: c.bpm, pressure: c.pressure }));
  const sync = syncScore(states);
  const room = roomColour(cups.map((c) => c.shown), sync); // fading marks still tint the room
  const heldElements = cups.filter((c) => c.present).map((c) => c.element);
  const agree = elementAgreement(heldElements);
  const circ = circulationReading(cups.map((c) => (c.present ? c.element : null)));

  drawFlow(dt, circ.edges);

  const chainText = circ.chain.length >= 2
    ? circ.chain.map((i) => `${cups[i]!.element} ${ELEMENT_INFO[cups[i]!.element].hanja}`).join(' feeds ')
    : '';
  const status = circ.score >= 1 && heldElements.length >= 3
    ? `the cycle turns: ${chainText}`
    : chainText
      ? chainText
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
