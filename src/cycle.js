// The home page's light field, a variation on Circulation's: Oryun, five rings. One ring of light per
// element (wood, fire, earth, metal, water) sits around the centre, overlapping its neighbours like the
// lab's mark, with light circulating along each. On every in-breath the five draw together; pressing
// closes them into one ring. Streams from beyond the edge feed each ring. Lines and rings only.
export function startCycle(cv) {

  // two grounds: light on night (added light) and ink on paper (multiplied colour), following the page theme
  const DARK = { ground: '#0b0f14', blend: 'lighter', haze: .22, glow: '255,250,240', glowA: .5, ink: [[108, 194, 122], [240, 100, 90], [240, 194, 74], [233, 237, 240], [91, 149, 220]] };
  const LIGHT = { ground: '#f3efe7', blend: 'multiply', haze: .16, glow: '255,255,255', glowA: .85, ink: [[63, 154, 82], [217, 71, 61], [214, 160, 30], [128, 138, 146], [47, 111, 192]] };
  let INK = DARK.ink;
  const ctx = cv.getContext('2d');
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const PER = 6, STEPS = 200, FEED = 5;
  let W, H, C, S, R0, RB;
  const P = { x: 0, y: 0, tx: 0, ty: 0, a: 0, ta: 0, press: 0, down: false };

  let seed = 11;
  const rnd = () => { seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const loops = [];   // PER threads for each of the five rings
  for (let e = 0; e < 5; e++) for (let k = 0; k < PER; k++) loops.push({ e, u: k / (PER - 1), ph: rnd() * 6.28, ph2: rnd() * 6.28, w: .7 + rnd() * 1.1, off: rnd() * 600, sp: .8 + rnd() * .4 });
  const feeds = [];
  for (let e = 0; e < 5; e++) for (let j = 0; j < FEED; j++) feeds.push({ e, j, ph: (rnd() - .5) * 10, w: .8 + rnd(), off: rnd() * 400, sp: .8 + rnd() * .5 });

  function size() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    W = cv.clientWidth; H = cv.clientHeight;
    cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // the rings fill the opening screen, above the subtitle
    S = Math.min(W, H);
    C = W > H ? [W * .5, H * .4] : [W * .5, H * .36];
    RB = W > H ? H * .24 : W * .36;
    R0 = Math.hypot(W, H) * .62;
  }

  // the visitor's hand parts the threads like water around a finger
  function push(x, y) {
    if (P.a < .001) return [x, y];
    const dx = x - P.x, dy = y - P.y, d = Math.hypot(dx, dy) + 1, sg = S * .15;
    const p = S * .1 * P.a * Math.exp(-d * d / (2 * sg * sg));
    return [x + dx / d * p, y + dy / d * p];
  }

  let last = 0, flow = 0, spinT = 0;
  function frame(ms) {
    const time = ms / 1000, dt = Math.min(.05, time - (last || time)); last = time;
    P.x += (P.tx - P.x) * .08; P.y += (P.ty - P.y) * .08; P.a += (P.ta - P.a) * .05;
    P.press += ((P.down ? 1 : 0) - P.press) * (P.down ? .04 : .02);
    flow += dt * (.03 + .09 * P.press);
    spinT += dt * (.012 + .06 * P.press);
    const breath = .5 - .5 * Math.cos(time * Math.PI * 2 / 10);   // 6 breaths a minute
    const a0 = -Math.PI / 2 + spinT;                               // wood's station; the rest follow clockwise
    const station = e => a0 + e * Math.PI * 2 / 5;
    const RR = RB * (1 + .045 * breath);                          // the ring breathes

    const T = document.documentElement.dataset.theme === 'light' ? LIGHT : DARK; INK = T.ink;
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = T.ground; ctx.fillRect(0, 0, W, H);
    // colour by angle, so each element owns its part of the ring and blends into the next
    const conic = (start, a) => { const g = ctx.createConicGradient(start, C[0], C[1]); INK.concat([INK[0]]).forEach((c, k) => g.addColorStop(k / 5, `rgba(${c},${a})`)); return g; };

    ctx.save(); ctx.filter = `blur(${RB * .35}px)`; ctx.strokeStyle = conic(a0, T.haze + .1 * breath);
    ctx.lineWidth = RB * .6; ctx.beginPath(); ctx.arc(C[0], C[1], RR, 0, Math.PI * 2); ctx.stroke(); ctx.restore();

    ctx.globalCompositeOperation = T.blend;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';

    // five rings, one per element, overlapping around the centre; breath and press draw them together
    const D = RB * (.5 - .07 * breath) * (1 - .85 * P.press), RO = RB * .58;
    for (const L of loops) {
      const st = station(L.e), c = INK[L.e];
      const cx = C[0] + Math.cos(st) * D, cy = C[1] + Math.sin(st) * D;
      const rb = RO + (L.u - .5) * RB * .14;
      ctx.beginPath();
      for (let n = 0; n <= STEPS; n++) {
        const th = n / STEPS * Math.PI * 2;
        const r = rb + RB * .025 * Math.sin(3 * th + L.ph + time * .23) + RB * .015 * Math.sin(5 * th - time * .17 + L.ph2);
        const [x, y] = push(cx + Math.cos(th) * r, cy + Math.sin(th) * r);
        n ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.closePath();
      ctx.setLineDash([]); ctx.lineWidth = L.w; ctx.strokeStyle = `rgba(${c},.16)`; ctx.stroke();
      const len = Math.PI * 2 * rb;
      ctx.setLineDash([len * .12, len * .09]);
      ctx.lineDashOffset = L.off - flow * RB * 4.5 * L.sp;
      ctx.lineWidth = L.w * 1.5; ctx.strokeStyle = `rgba(${c},${.5 + .2 * P.press})`; ctx.stroke();
    }
    ctx.setLineDash([]);

    // streams from beyond the edge join the ring at each station, already turning with it
    for (const f of feeds) {
      const st = station(f.e), c = INK[f.e];
      ctx.beginPath();
      for (let n = 0; n <= 140; n++) {
        const t = n / 140;
        const r = D + RO + (R0 - D - RO) * Math.pow(1 - t, 1.5);
        const th = st - 1.1 * Math.pow(1 - t, 1.2) + Math.sin(time * .1 + f.ph) * .05 * (1 - t);
        const lat = ((f.j - (FEED - 1) / 2) * S * .012 + f.ph) * (1 - .7 * t);
        const [x, y] = push(C[0] + Math.cos(th) * r - Math.sin(th) * lat, C[1] + Math.sin(th) * r + Math.cos(th) * lat);
        n ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.globalAlpha = 1;
      ctx.setLineDash([]); ctx.lineWidth = f.w; ctx.strokeStyle = `rgba(${c},.1)`; ctx.stroke();
      ctx.setLineDash([S * .14, S * .26]); ctx.lineDashOffset = f.off - flow * S * 2 * f.sp;
      ctx.lineWidth = f.w * 1.4; ctx.strokeStyle = `rgba(${c},.42)`; ctx.stroke();
    }

    ctx.globalAlpha = 1;

    // a still, breathing centre
    ctx.globalCompositeOperation = 'source-over';
    const cr = RB * (.3 + .08 * breath + .25 * P.press);
    const g = ctx.createRadialGradient(C[0], C[1], 0, C[0], C[1], cr);
    g.addColorStop(0, `rgba(${T.glow},${T.glowA * (.6 + .4 * breath)})`); g.addColorStop(.35, `rgba(${T.glow},${T.glowA * (.2 + .15 * breath)})`); g.addColorStop(1, `rgba(${T.glow},0)`);
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(C[0], C[1], cr, 0, Math.PI * 2); ctx.fill();
    if (P.press > .01) {   // pressing: the whole ring brightens and a five-colour ring opens at the centre
      ctx.globalCompositeOperation = T.blend;
      ctx.strokeStyle = conic(-spinT * 4, .7 * P.press); ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(C[0], C[1], RB * (.15 + .3 * P.press), 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = conic(a0, .25 * P.press); ctx.lineWidth = RB * .2;
      ctx.beginPath(); ctx.arc(C[0], C[1], RO, 0, Math.PI * 2); ctx.stroke();
    }
    if (P.a > .01) {
      ctx.globalCompositeOperation = T === LIGHT ? 'source-over' : 'lighter';
      const hr = S * .16;
      const hg = ctx.createRadialGradient(P.x, P.y, 0, P.x, P.y, hr);
      hg.addColorStop(0, `rgba(${T.glow},${(T === LIGHT ? .3 : .07) * P.a})`); hg.addColorStop(1, `rgba(${T.glow},0)`);
      ctx.fillStyle = hg; ctx.beginPath(); ctx.arc(P.x, P.y, hr, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  const hero = cv.parentElement;
  hero.addEventListener('pointermove', e => { const b = cv.getBoundingClientRect(); P.tx = e.clientX - b.left; P.ty = e.clientY - b.top; if (P.ta === 0) { P.x = P.tx; P.y = P.ty; } P.ta = 1; });
  hero.addEventListener('pointerleave', () => { P.ta = 0; P.down = false; });
  hero.addEventListener('pointerdown', e => { if (!e.target.closest('a')) P.down = true; });
  addEventListener('pointerup', () => { P.down = false; });
  addEventListener('pointercancel', () => { P.down = false; P.ta = 0; });
  let visible = true, raf = 0;
  const loop = ms => { frame(ms); raf = visible ? requestAnimationFrame(loop) : 0; };
  const start = () => { if (!still && !raf) raf = requestAnimationFrame(loop); };
  size(); frame(still ? 4000 : performance.now()); start();
  if (still) new MutationObserver(() => frame(4000)).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  addEventListener('resize', () => { size(); if (still) frame(4000); });
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) start(); }).observe(cv);
  document.addEventListener('visibilitychange', () => { visible = !document.hidden; if (visible) start(); });
}

const cv = document.getElementById('field');
if (cv) startCycle(cv);
