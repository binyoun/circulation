# Circuit simulation (Wokwi)

Runs `hardware/cup/cup.ino` completely unmodified against a virtual ESP32,
so the firmware's sensor-to-LED pipeline (read, compute the Five Elements
colour, drive the ring, print the serial CSV) can be exercised with no
hardware, before or alongside a real build. This is a firmware-logic check,
not a stand-in for the bench experiments in `hardware/TECHNICIAN_BRIEF.txt`
(palm PPG under seal pressure is a real-hand question no simulator answers).

## What's real vs. a stand-in

- **ESP32, LED ring**: `board-esp32-devkit-c-v4` and `wokwi-led-ring` (16 px)
  are real Wokwi parts; the ring visibly lights up with the firmware's own
  colours.
- **Pressure (FSR)**: Wokwi has no FSR part, so a potentiometer stands in on
  `GPIO34`. `analogRead()` can't tell the difference; turning the knob is
  "squeezing" the cup.
- **Pulse (MAX30102)**: `chip-max30102` is Wokwi's built-in simulated pulse
  oximeter, wired over the same I2C bus (`GPIO21`/`22`) the SparkFun MAX3010x
  library expects. This is a real part, not a stand-in — but I built this
  diagram from Wokwi's documentation and public example projects, without
  being able to actually run it end-to-end myself (no Wokwi account/CLI token
  in this environment). **The first thing to check when you open it**: does
  `checkForBeat()` ever fire (watch the serial CSV's `bpm` field move off its
  startup value)? If not, this specific chip's I2C register behaviour may not
  fully match what the SparkFun library expects — in which case the
  pressure → colour → LED half of the circuit is still fully useful on its
  own; report back and we'll adjust.

## Out of scope for this pass

OSC reaching `hub.ts` on your laptop. `cup.ino`'s own `WIFI_SSID` won't
resolve inside Wokwi's network, so the firmware falls back to serial-only —
exactly its real-world behaviour when Wi-Fi drops, and the "one architecture
rule" this project is built on (each cup stands alone). That's enough to
validate standalone behaviour without any code change.

## How to run it

**Browser (no install, do this first):**

1. Go to wokwi.com, sign in, "New Project" → ESP32.
2. Replace the sketch with the contents of `hardware/cup/cup.ino`.
3. Open the "diagram.json" tab in the project editor and replace its
   contents with `wokwi/diagram.json` from this repo.
4. Open the Library Manager (the books icon) and install the three
   libraries `cup.ino` needs: "SparkFun MAX3010x Pulse and Proximity Sensor
   Library", "Adafruit NeoPixel", and "OSC" by CNMAT — same three named in
   `hardware/cup/README.md`.
5. Press the green run button. Watch the ring, and open the Serial Monitor
   for the CSV line (`id,pressure,bpm,confidence,element,r,g,b`).
6. Uncomment `#define RAW_LOG` in the sketch and re-run to see raw
   `fsr=`/`ir=` values — the same calibration step `MANUAL.md` has you do on
   real hardware, so the practice transfers directly to Khang's prototype.

**VS Code + Wokwi extension (optional, for later CI):** needs the Wokwi
extension, a local ESP32 Arduino toolchain (arduino-cli, per
`hardware/cup/README.md`'s libraries) to produce `build/cup.ino.bin`/`.elf`
that `wokwi.toml` points at, and a free `WOKWI_CLI_TOKEN` for headless runs.
Not needed for a first pass; the browser route above is faster with no local
toolchain, matching how the rest of this project is built.
