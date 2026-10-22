# Workshop kit: one finger pad

Each participant (or pair) builds a single Circulation pad: press the sensor and
the light glows in their element's colour. The kit then goes inside their own
transparent cupping cup for the "glowing cup" they make in clay.

## Per kit

- Arduino Uno or Nano (borrowed from the AV team's basic sets where possible)
- 1 FSR (about 12 mm round) + 10k resistor
- 1 WS2812B pixel (cut from a strip), or the RGB LED + 3 × 220 ohm resistors from a basic set
- USB cable; jumper leads pre-wired into plug-in connectors

## Before the workshop (technician or Patrick)

1. Install the Adafruit NeoPixel library (Arduino IDE: Library Manager).
2. Upload `workshop_kit.ino` to every board, and test each kit by pressing the FSR.
3. Pre-wire the FSR + resistor and the LED onto plug-in leads, so participants only plug in. No soldering or breadboarding on the day.
4. Check `FIRM` against a real press for your FSRs; lower it if the light never reaches full brightness.
5. Label each kit 1–9 and pack it in a bag with its cable.

## On the day

- Participants plug in the sensor and light, press, and watch the colour respond.
- Anyone curious can open Tools > Serial Plotter to see their pressure as a line, and change `ELEMENT` (0–4) to choose their colour.
- The board sits under the cup and the light inside it; the clay grip goes around the cup.
- Kits are returned at the end. Participants keep the cup and the clay.

Low voltage only (5 V USB). Power from laptops or USB power banks.
