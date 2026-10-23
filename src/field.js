// The light field shared by the home page and Circulation: three sources of five-colour threads
// flowing inward to one centre (the Hap), breathing at 6 per minute. The visitor's cursor parts the
// threads like water around a finger; pressing makes the centre bloom. Lines and rings only.
export function startField(cv) {

  // Five elements, thumb to little finger: wood, fire, earth, metal, water.
  const INK = [[108, 194, 122], [240, 100, 90], [240, 194, 74], [233, 237, 240], [91, 149, 220]];
  const ctx = cv.getContext('2d');
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const SOURCES = [-Math.PI / 2 - 0.35, Math.PI / 6 - 0.35, Math.PI * 5 / 6 - 0.35];
  const K = 8, N = 200, SPIN = Math.PI * 1.55;
  const smooth = (a, b, x) => { const u = Math.max(0, Math.min(1, (x - a) / (b - a))); return u * u * (3 - 2 * u); };
  let W, H, C, R0, RC, S;
  // the visitor's hand: threads part around the cursor like water around a finger; pressing brightens the centre
  const P = { x: 0, y: 0, tx: 0, ty: 0, a: 0, ta: 0, press: 0, down: false };

  // fixed per-thread offsets so the field is the same on every load
  let seed = 7;
  const rnd = () => { seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const threads = [[], [], [], [], []];   // grouped by element
  SOURCES.forEach(a => { for (let i = 0; i < 5; i++) for (let j = 0; j < K; j++) threads[i].push({ a, j, ph: (rnd() - .5) * 8, sw: rnd() * Math.PI * 2, w: .8 + rnd() * 1.2, sp: .8 + rnd() * .5, off: rnd() * 400 }); });

  function size() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    W = cv.clientWidth; H = cv.clientHeight;
    cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    C = W > 900 ? [W * .7, H * .42] : [W * .5, H * .3];  // the centre sits clear of the headline
    S = Math.min(W, H);
    R0 = Math.hypot(W, H) * .62; RC = S * .035;
  }

  // t = 0 beyond the edge (the well), t = 1 the centre (the Hap)
  function point(th0, i, j, ph, sw, t, time) {
    const r = RC + (R0 - RC) * Math.pow(1 - t, 1.35);
    const merge = 1 - smooth(.3, .8, t);
    const spread = S * .085;
    const lat = (i - 2) * spread * (.25 + .75 * merge) * (1 - .8 * t)
      + S * .05 * Math.sin(t * Math.PI * 3 + th0 * 2 + time * .07) * Math.pow(1 - t, 1.4)
      + S * .012 * Math.sin(time * .13 + sw + t * 4) * (1 - t)            // slow sway, like weed in a current
      + (j - (K - 1) / 2) * 3.4 * (.4 + (1 - t)) + ph;
    const th = th0 + SPIN * Math.pow(t, 2.1);
    let x = C[0] + Math.cos(th) * r - Math.sin(th) * lat, y = C[1] + Math.sin(th) * r + Math.cos(th) * lat;
    if (P.a > .001) {
      const dx = x - P.x, dy = y - P.y, d = Math.hypot(dx, dy) + 1, sg = S * .17;
      const push = S * .12 * P.a * Math.exp(-d * d / (2 * sg * sg));
      x += dx / d * push; y += dy / d * push;
    }
    return [x, y];
  }

  function frame(ms) {
    const time = ms / 1000, dt = Math.min(.05, time - (last || time)); last = time;
    P.x += (P.tx - P.x) * .08; P.y += (P.ty - P.y) * .08; P.a += (P.ta - P.a) * .05;
    P.press += ((P.down ? 1 : 0) - P.press) * (P.down ? .04 : .02);
    flow += dt * (.035 + .08 * P.press);   // light drifts inward faster while pressed
    const breath = .5 - .5 * Math.cos(time * Math.PI * 2 / 10);   // 6 breaths a minute
    spinT += dt * (.008 + .05 * P.press); const rot = spinT;
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#0b0f14'; ctx.fillRect(0, 0, W, H);

    // soft five-colour haze, turning slowly
    const conic = (r0, a) => { const g = ctx.createConicGradient(r0, C[0], C[1]); INK.concat([INK[0]]).forEach((c, k) => g.addColorStop(k / 5, `rgba(${c},${a})`)); return g; };
    ctx.save(); ctx.filter = `blur(${S * .09}px)`; ctx.fillStyle = conic(rot * 3 + time * .05, .14 + .1 * breath);
    ctx.beginPath(); ctx.arc(C[0], C[1], S * .44, 0, Math.PI * 2); ctx.fill(); ctx.restore();

    // rings drift inward like ripples drawn toward the centre, each turning through the five colours
    const RINGS = 7;
    for (let k = 0; k < RINGS; k++) {
      const u = ((k / RINGS) + time * (.022 + .05 * P.press)) % 1;      // 0 at the rim, 1 at the core
      const r = S * .46 * Math.pow(1 - u, 1.25) + RC;
      const env = Math.sin(Math.PI * u);                                // fade in at the rim, out at the core
      ctx.strokeStyle = conic(k * 1.3 + time * (k % 2 ? .18 : -.14), .55 * env);
      ctx.lineWidth = 1 + 1.4 * u;
      ctx.beginPath(); ctx.arc(C[0], C[1], r, 0, Math.PI * 2); ctx.stroke();
    }

    // threads: a faint path, with colour travelling along it toward the centre
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    threads.forEach((group, i) => {
      const c = INK[i];
      for (const th of group) {
        ctx.beginPath();
        for (let n = 0; n <= N; n++) {
          const [x, y] = point(th.a + rot, i, th.j, th.ph, th.sw, n / N, time);
          n ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
        }
        ctx.setLineDash([]); ctx.lineWidth = th.w; ctx.strokeStyle = `rgba(${c},.14)`; ctx.stroke();
        ctx.setLineDash([S * .18, S * .3]); ctx.lineDashOffset = th.off - flow * S * 2.2 * th.sp;
        ctx.lineWidth = th.w * 1.5; ctx.strokeStyle = `rgba(${c},.5)`; ctx.stroke();
      }
    });
    ctx.setLineDash([]);

    // the Hap: three colours orbit inside the core and fuse with the breath
    const rr = S * (.1 + .025 * breath + .07 * P.press);
    for (let m = 0; m < 3; m++) {
      const ang = time * (.6 + .9 * P.press) + m * Math.PI * 2 / 3;
      const orb = S * (.034 - .02 * breath) * (1 - .6 * P.press);       // the three draw together on each in-breath
      const ox = C[0] + Math.cos(ang) * orb, oy = C[1] + Math.sin(ang) * orb;
      const c = INK[[1, 2, 4][m]], lr = S * .07;
      const lg = ctx.createRadialGradient(ox, oy, 0, ox, oy, lr);
      lg.addColorStop(0, `rgba(${c},.55)`); lg.addColorStop(1, `rgba(${c},0)`);
      ctx.fillStyle = lg; ctx.beginPath(); ctx.arc(ox, oy, lr, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
    const g = ctx.createRadialGradient(C[0], C[1], 0, C[0], C[1], rr);
    g.addColorStop(0, `rgba(255,252,244,${.75 + .25 * breath})`); g.addColorStop(.3, `rgba(255,246,228,${.3 + .2 * breath})`); g.addColorStop(1, 'rgba(255,246,228,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(C[0], C[1], rr, 0, Math.PI * 2); ctx.fill();
    if (P.press > .01) {   // pressing: the centre blooms in all five colours
      ctx.globalCompositeOperation = 'lighter';
      const br = S * (.12 + .2 * P.press);
      const bg = ctx.createRadialGradient(C[0], C[1], 0, C[0], C[1], br);
      bg.addColorStop(0, `rgba(255,250,238,${.45 * P.press})`); bg.addColorStop(1, 'rgba(255,250,238,0)');
      ctx.fillStyle = bg; ctx.beginPath(); ctx.arc(C[0], C[1], br, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = conic(-spinT * 6, .6 * P.press); ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(C[0], C[1], S * (.05 + .06 * P.press), 0, Math.PI * 2); ctx.stroke();
    }
    if (P.a > .01) {       // a soft light where the hand is
      ctx.globalCompositeOperation = 'lighter';
      const hr = S * .16;
      const hg = ctx.createRadialGradient(P.x, P.y, 0, P.x, P.y, hr);
      hg.addColorStop(0, `rgba(255,246,228,${.07 * P.a})`); hg.addColorStop(1, 'rgba(255,246,228,0)');
      ctx.fillStyle = hg; ctx.beginPath(); ctx.arc(P.x, P.y, hr, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  let last = 0, flow = 0, spinT = 0;
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
  addEventListener('resize', () => { size(); if (still) frame(4000); });
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) start(); }).observe(cv);
  document.addEventListener('visibilitychange', () => { visible = !document.hidden; if (visible) start(); });
}

const cv = document.getElementById('field');
if (cv) startField(cv);
