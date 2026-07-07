# Cup firmware (Circulation)

One cupping-form device. Reads grip pressure and pulse from the hand holding it,
computes its own Five Elements colour, drives an LED ring, and streams the
reading to the sync hub / TouchDesigner over OSC, with a serial fallback. The cup
works with no network; the hub and TouchDesigner sit on top of a system that
already glows on its own.

The colour logic mirrors `src/fiveElements.ts` exactly, so what you tune in the
browser simulator is what runs here.

## Parts (per cup)

- ESP32 dev board (USB-serial bridge).
- MAX30102 pulse (PPG) breakout, I2C.
- Force-sensitive resistor (FSR) plus a fixed resistor as a voltage divider.
- Addressable LED ring (NeoPixel / WS2812, 16 px default).
- LiPo + battery management, for the untethered build.

## Wiring (defaults, set in the config block)

| Part | ESP32 |
| --- | --- |
| MAX30102 VIN / GND | 3V3 / GND |
| MAX30102 SDA / SCL | GPIO21 / GPIO22 |
| FSR divider midpoint | GPIO34 (ADC) |
| NeoPixel data | GPIO5 |
| NeoPixel + / - | 5V (or 3V3) / GND |

FSR divider: 3V3 to FSR, FSR to the junction, junction to GPIO34, and a 10k from
the junction to GND. Grip pulls the reading up.

## Libraries

Arduino Library Manager: "SparkFun MAX3010x Pulse and Proximity Sensor Library",
"Adafruit NeoPixel", and "OSC" by CNMAT (`OSCMessage.h`).

## Calibrate before use

1. Flash with `#define RAW_LOG` uncommented.
2. Open Serial Monitor at 115200. Note the `fsr=` value with no grip and with a
   firm grip; set `FSR_MIN` and `FSR_MAX` to those.
3. Set `CUP_ID`, `WIFI_SSID`/`WIFI_PASS`, and `HUB_HOST`/`HUB_PORT`.
4. Re-comment `RAW_LOG` and flash.

## The week-1 test (the one that decides the design)

Hold the cup so a fingertip rests on the MAX30102 window while gripping. Watch
the `confidence` field and the pulse `bpm` in the serial stream. Try the sensor
at the thumb pad, an index-fingertip notch, and the palm heel. If a gripping hand
cannot give a usable pulse at any placement, the design pivots now: the reading
leans on pressure, and a short "hold and be still" phase captures the pulse (which
is coherent with the practice). Better to learn this in week 1 than in August.

## OSC schema (cup to hub)

```
/cup  <id:int> <pressure:float 0..1> <bpm:float> <confidence:float 0..1>
      <element:int 0..4> <r:int 0..255> <g:int 0..255> <b:int 0..255>
```

Element index order: 0 wood, 1 fire, 2 earth, 3 metal, 4 water. Freeze this
contract early so the firmware, the hub, and TouchDesigner never renegotiate. The
serial fallback prints the same fields as CSV.
