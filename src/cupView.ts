// Shared rendering pieces for the cup pages (index.html's interaction
// simulator and sim.html's physical computing simulation): the cup panel
// skeleton, colour helpers, and the flow layer (light travelling cup to cup
// along active generating edges). Both pages drive this with their own model
// of where a reading comes from; only the drawing is shared.

import { ELEMENTS, ELEMENT_INFO, type Element, type ElementReading } from './fiveElements';

export function rgbCss([r, g, b]: [number, number, number]): string {
  return `rgb(${r},${g},${b})`;
}

export function mixRgb(a: [number, number, number], b: [number, number, number], t: number): [number, number, number] {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

export interface CupDom {
  panel: HTMLElement;
  disc: HTMLElement;
  name: HTMLElement;
  meta: HTMLElement;
  bars: HTMLElement[];
  controls: HTMLElement;
}

/** Builds the shared disc/name/meta/weight-bar skeleton; the caller fills `controls`. */
export function createCupPanel(container: HTMLElement): CupDom {
  const panel = document.createElement('div');
  panel.className = 'cup';
  panel.innerHTML = `
    <div class="disc"></div>
    <div class="el"><div class="name">-</div><div class="meta">-</div></div>
    <div class="weights">${ELEMENTS.map((e) => `<div class="wb" data-el="${e}" style="background:${rgbCss(ELEMENT_INFO[e].rgb)}"></div>`).join('')}</div>
    <div class="ctl"></div>`;
  container.appendChild(panel);
  return {
    panel,
    disc: panel.querySelector('.disc')!,
    name: panel.querySelector('.el .name')!,
    meta: panel.querySelector('.el .meta')!,
    bars: [...panel.querySelectorAll<HTMLElement>('.wb')],
    controls: panel.querySelector('.ctl')!,
  };
}

/** A labelled range input, the shape both pages' idealised sliders use. */
export function ctl(label: string, min: number, max: number, step: number, value: number): string {
  return `<label><span>${label}</span></label><input type="range" min="${min}" max="${max}" step="${step}" value="${value}" />`;
}

// --- Flow layer: light travelling cup to cup along active generating edges ---

export interface FlowCup {
  disc: HTMLElement;
  shown: [number, number, number];
}

interface FlowParticle {
  from: number;
  to: number;
  t: number; // 0..1 along the arc
  speed: number;
  alpha: number;
}

/** Creates a flow-layer renderer bound to a stage/canvas and a live cup list. */
export function createFlow(stageEl: HTMLElement, flowEl: HTMLCanvasElement, cups: FlowCup[]) {
  const flowCtx = flowEl.getContext('2d')!;
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

  function draw(dt: number, edges: Array<{ from: number; to: number }>): void {
    const dpr = window.devicePixelRatio || 1;
    const w = stageEl.clientWidth;
    const h = stageEl.clientHeight;
    if (flowEl.width !== Math.round(w * dpr) || flowEl.height !== Math.round(h * dpr)) {
      flowEl.width = Math.round(w * dpr);
      flowEl.height = Math.round(h * dpr);
    }
    flowCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    flowCtx.clearRect(0, 0, w, h);

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
      const dx = x1 - x0, dy = y1 - y0;
      const len = Math.hypot(dx, dy) || 1;
      const cx = (x0 + x1) / 2 - (dy / len) * len * 0.16;
      const cy = (y0 + y1) / 2 + (dx / len) * len * 0.16;
      const col = mixRgb(cups[p.from]!.shown, cups[p.to]!.shown, p.t);
      const ends = Math.sin(Math.PI * p.t) ** 0.5;
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

  return { draw };
}

// --- Presence + afterglow display state: mirrors hardware/cup/cup.ino's
// mark-fading behaviour, and is identical whether the reading comes from
// clean sliders (main.ts) or simulated sensors (sim.ts). ---

export const IDLE_RGB: [number, number, number] = [20, 20, 24];
export const MARK_FADE_S = 40; // a cupping mark's days of fading, compressed to seconds

interface Mark {
  rgb: [number, number, number];
  element: Element;
  age: number;
}

export interface CupVisual extends CupDom {
  present: boolean;
  heldRgb: [number, number, number] | null; // sampled at steady moments; becomes the mark
  heldElement: Element | null;
  mark: Mark | null; // the afterglow left behind after release
  shown: [number, number, number]; // displayed colour (smoothed live, or fading mark)
  glow: number; // displayed glow strength 0..1
  rgb: [number, number, number]; // last live reading (for room + circulation)
  element: Element;
}

export function createCupVisual(dom: CupDom): CupVisual {
  return {
    ...dom,
    present: false, heldRgb: null, heldElement: null, mark: null,
    shown: [...IDLE_RGB] as [number, number, number], glow: 0,
    rgb: [...IDLE_RGB] as [number, number, number], element: 'earth',
  };
}

/**
 * Advances one cup's presence/afterglow display from a fresh reading (or
 * none, if released) and paints its DOM. `trend` decides when the mark
 * samples: the flick of letting go (fast negative trend, reads as Metal)
 * should not decide what lingers, only the steady moments of the hold do.
 */
export function stepCupVisual(c: CupVisual, dt: number, present: boolean, reading: ElementReading | null, trend: number): void {
  let target: [number, number, number];
  let glowTarget: number;

  if (present && reading) {
    c.rgb = reading.rgb; c.element = reading.element;
    if (!c.present) { c.mark = null; c.heldRgb = null; c.heldElement = null; }
    if (Math.abs(trend) < 0.35 || !c.heldRgb) { c.heldRgb = reading.rgb; c.heldElement = reading.element; }
    target = reading.rgb;
    glowTarget = 1;

    const info = ELEMENT_INFO[reading.element];
    c.name.textContent = `${reading.element} ${info.hanja}`;
    c.name.style.color = rgbCss(info.rgb);
    c.name.style.opacity = '1';
    c.meta.textContent = `${info.organ} · ${info.state}`;
    for (const bar of c.bars) {
      const el = bar.dataset.el as Element;
      bar.style.height = `${Math.max(2, reading.weights[el] * 26)}px`;
      bar.style.opacity = String(0.35 + 0.65 * reading.weights[el]);
    }
  } else {
    if (c.present && c.heldRgb && c.heldElement) c.mark = { rgb: c.heldRgb, element: c.heldElement, age: 0 };
    if (c.mark) {
      c.mark.age += dt;
      if (c.mark.age / MARK_FADE_S >= 1) c.mark = null;
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
