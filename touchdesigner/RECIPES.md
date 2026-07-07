# TouchDesigner recipes

A targeted path from zero, for exactly what Circulation and the ISEA workshop
need. Not general mastery. Each recipe ends with one concrete artifact. Budget
about 40 hours over 10 weeks, roughly 4 to 5 per week, protected like a class.

Two ideas make everything below make sense:
- **Operator families.** CHOP (channels, i.e. numbers over time, our sensor
  data), TOP (textures, i.e. images and colour), SOP/POP (geometry and points),
  DAT (text and tables), COMP (containers). Wires only connect within a family;
  you cross families with converter operators.
- **The core Circulation pattern is one sentence:** sensor numbers arrive as a
  CHOP, and drive the colour of a TOP.

The hub must be running for the OSC recipes (`npm run hub`). The simulator can
stand in for the cups before hardware exists: point the hub at TD and drag the
simulator, or send test OSC.

---

## Recipe 0, setup (30 min)

Install TouchDesigner (2025 build, needed for POPs in Recipe F) and the licence
(commercial or educational, budgeted). Learn only: the network editor (Tab to
add an operator, wire outlet to inlet), the parameter window (P), a viewer
(right-click, View), and Perform mode (F1 for the output window, Esc back).
Artifact: an empty project saved as `circulation.toe`.

## Recipe A, survival, a fake pulse (weeks 1 to 2)

Goal: get comfortable making and shaping a signal, no hardware.
- `LFO CHOP` (a slow sine, set Frequency 1). This is a stand-in heartbeat.
- `Math CHOP` after it to rescale (Range).
- `Lag CHOP` or `Filter CHOP` to smooth.
- `Trail CHOP` to see it scroll.
Artifact: a smooth oscillating value you can watch and reshape. You now read a
CHOP.

## Recipe B, OSC in, the cups arrive (weeks 3 to 4)

Goal: live sensor data inside TD.
- `OSC In CHOP`. Set Network Port to **9000** (matches the hub's `TD_PORT`). With
  the hub running, its channels appear: `circulation/sync`, `circulation/room1..3`,
  `circulation/cup/1..3/...` (OSC In flattens addresses into channel names).
- `Select CHOP` to pull just the channels you want (e.g. Channel Names
  `circulation/sync`), and rename with `Rename CHOP` for tidy names.
- `Null CHOP` at the end of any chain you will reference elsewhere (a stable
  handle; always end a chain with a Null).
Artifact: the live sync score as a channel in TD, moving when you drag the
simulator. If nothing arrives: check the hub is running, the port is 9000, and
firewall allows local UDP.

## Recipe C, colour out, the room field (weeks 3 to 4, the core)

Goal: the generative colour field that is the room, tinted by the room colour and
alive with the sync score. This is the grant's "generative colour across the
sensing zones."
- `OSC In CHOP` to `Select CHOP` for `circulation/room1`, `room2`, `room3` (the
  RGB, 0..255). `Math CHOP` to divide by 255 (TOP colour is 0..1).
- `Noise TOP` (Type Sparse or Simplex, animate by exporting `absTime.seconds` to
  its Transform, or use a `Constant CHOP` ramped into an offset). This is the
  living field.
- `Level TOP` after the Noise, and drive its **Black Level / Gamma** or a
  `Composite TOP` tint from the room RGB: on the Level TOP's colour parameters,
  right-drag from the room CHOP channels onto the R, G, B parameter fields to
  create a CHOP Reference (an export). The field now wears the room colour.
- Multiply overall brightness by the sync score (another CHOP Reference into the
  Level TOP's Opacity or a final `Multiply`), so an unsynced room stays dim and a
  synced room blooms.
Artifact: a full-screen colour field that is muted grey when the three simulator
cups disagree and a vivid unified colour when you bring their pulses and grips
together. Put it in Perform mode. This is the show.

## Recipe D, the room layer, physical light (weeks 5 to 6, cut-able)

Only if the venue confirms space and power (the pre-decided first cut).
- `DMX Out CHOP` (or the wireless controller's protocol) driven from the same
  room RGB and sync channels. Map the room colour to the fixtures; map sync to
  intensity.
Artifact: a physical RGB panel following the room colour. If cut, this recipe is
simply not loaded; nothing else changes.

## Recipe E, the show patch, hardening (weeks 7 to 8)

Goal: something that survives a festival.
- Wrap the network in a `Container COMP` with a small control panel (a few
  `Slider` and `Button` COMPs) for brightness, master colour, and a manual
  override in case a cup fails.
- Startup: `Execute DAT`, in its `onStart` write `me.time.play = 1` and load the
  performance layout. Keep Python to parameter glue only, for example an Execute
  DAT that watches OSC In for staleness:

```python
# CHOP Execute DAT on the OSC In CHOP, offToOn/whileOn
def onValueChange(channel, sampleIndex, val, prev):
    # if no cups for 2s, fall back to a calm default colour
    op('room_fallback').par.display = (op('oscin').numChans == 0)
    return
```

- Test the failure you will actually have: pull the hub (a cup drops), confirm
  the field falls back to a calm default instead of freezing or flashing.
Artifact: `circulation_show.toe` that boots into Perform mode and degrades
gracefully. Week 8 rehearsal is the exam.

## Recipe F, POPs for ISEA, handwriting to constellation (weeks 9 to 12, after VFCD freeze)

The ISEA "Counting Cultural Stars" toolkit. Separate skill track; the CHOP/TOP
fundamentals transfer. Needs the 2025 build (POPs).
- `Movie File In TOP` (a scanned handwritten word) to `Threshold TOP` (isolate
  the ink) to `Monochrome TOP` (luminance).
- Convert the bright pixels to points: a `POP` network that samples the TOP and
  emits a point per sampled pixel, mapping pixel XY (and luminance) to XYZ. In the
  current build this is the TOP-to-POP sampling path; follow the POP "image to
  points" example and swap in the thresholded word.
- Animate: turbulence and attraction on the points (noise field, force), so the
  constellation drifts and clusters.
- `Render TOP` with a `Camera COMP` and a `Geometry/POP` render.
- Expose three parameters on the container (threshold, point density, animation
  amount) and save as a `.tox` so workshop participants only touch those three.
Artifact: a `constellation.tox` that turns a photo of a handwritten word into a
drifting 3D point cloud. Test it on Korean, Vietnamese, Arabic, and Latin
handwriting before the UAE workshop. The web reference (built separately in
September) validates the algorithm first and is the participant fallback.

---

## The two contracts to freeze early

- **Hub to TD OSC:** port 9000, addresses `/circulation/sync`, `/circulation/agreement`,
  `/circulation/room`, `/circulation/cup/<id>` (see `hub/README.md`). Do not
  rename these once the show patch references them.
- **The colour is authoritative in the engine, not in TD.** TD receives the
  already-computed room colour and makes it generative and physical; it never
  re-decides the Five Elements. That stays in `src/fiveElements.ts` and the cup.
