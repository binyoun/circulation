# Workshop kit circuit: spec for Flux.ai

Everything needed to draw the Circulation workshop kit as a schematic in
[Flux.ai](https://www.flux.ai): the parts, every connection, and a prompt for
Flux Copilot. One kit = one participant: a Wi-Fi board that reads touch and
pulse and answers with light, vibration and sound.

This is a breadboard kit, so the schematic documents the wiring (and could
later become a small carrier PCB). **Check every pin against the Seeed XIAO
ESP32-S3 pinout before building**; the GPIO numbers below follow Seeed's
published D-pin map.

## Parts (one kit)

| Ref | Part | Value / model | Search term in Flux |
| --- | --- | --- | --- |
| U1 | Microcontroller | Seeed Studio XIAO ESP32-S3 | `XIAO ESP32S3` |
| U2 | Pulse oximeter / heart-rate sensor breakout | MAX30102 module (VIN, GND, SDA, SCL, INT) | `MAX30102` |
| LED1 | Addressable LED stick | 8 × WS2812B (NeoPixel Stick) | `WS2812B` (place 8, chained) or `NeoPixel Stick` |
| R1 | Force-sensitive resistor | ~12 mm round FSR (e.g. Interlink FSR 402) | `FSR 402` |
| R2 | Pull-down for the FSR | 10 kΩ | `resistor 10k` |
| R3 | LED data series resistor | 330 Ω | `resistor 330` |
| C1 | LED supply reservoir | 470 µF, 10 V electrolytic | `capacitor electrolytic 470uF` |
| Q1 | Motor driver transistor | NPN, 2N2222A (or S8050) | `2N2222A` |
| R4 | Base resistor | 1 kΩ | `resistor 1k` |
| D1 | Flyback diode | 1N4148 | `1N4148` |
| M1 | Coin vibration motor | 10 mm, 3 V | `vibration motor` |
| BZ1 | Passive piezo buzzer | 12 mm | `piezo buzzer` |
| R5 | Buzzer series resistor | 100 Ω | `resistor 100` |
| RV1 | Potentiometer | 10 kΩ linear | `potentiometer 10k` |

## Power

- **5 V** comes from USB-C (or a power bank) at the XIAO's **5V / VBUS** pin.
- **3V3** is the XIAO's regulated 3.3 V output.
- **GND** is common to everything.
- The NeoPixel stick runs from **5 V** (8 LEDs can draw up to about 0.5 A at full white; brightness is capped in code). C1 sits across its 5 V and GND, close to the stick.
- Sensors, the motor and the potentiometer run from **3V3**.

## Connections (netlist)

| Net | Connects |
| --- | --- |
| `5V` | U1 5V · LED1 VCC (5V) · C1 + |
| `3V3` | U1 3V3 · U2 VIN · R1 pin 1 · RV1 end A · M1 + · D1 cathode |
| `GND` | U1 GND · U2 GND · LED1 GND · C1 − · R2 pin 2 · Q1 emitter · BZ1 − · RV1 end B |
| `FSR_SENSE` | U1 **D0 (GPIO1, ADC)** · R1 pin 2 · R2 pin 1 |
| `LED_DATA` | U1 **D1 (GPIO2)** · R3 pin 1; R3 pin 2 · LED1 DIN |
| `MOTOR_CTRL` | U1 **D2 (GPIO3)** · R4 pin 1; R4 pin 2 · Q1 base |
| `MOTOR_LOW` | Q1 collector · M1 − · D1 anode |
| `PULSE_INT` | U1 **D3 (GPIO4)** · U2 INT (optional) |
| `I2C_SDA` | U1 **D4 (GPIO5, SDA)** · U2 SDA |
| `I2C_SCL` | U1 **D5 (GPIO6, SCL)** · U2 SCL |
| `BUZZER` | U1 **D8 (GPIO7)** · R5 pin 1; R5 pin 2 · BZ1 + |
| `POT_SENSE` | U1 **D9 (GPIO8, ADC)** · RV1 wiper |
| spare | U1 D6 (GPIO43, TX), D7 (GPIO44, RX), D10 (GPIO9) left free for extensions |

Notes:

- The FSR and R2 form a voltage divider: pressing raises the voltage on `FSR_SENSE`.
- The motor is switched on its low side by Q1; D1 (cathode to 3V3) catches the motor's back-EMF.
- Most MAX30102 breakouts already carry I2C pull-ups; don't add more unless the module has none.
- WS2812B usually accepts the XIAO's 3.3 V data at 5 V supply on short leads. If an LED stick misbehaves, add a 74AHCT125 level shifter on `LED_DATA`.

## Prompt for Flux Copilot

Paste this into Flux Copilot in a new project, then check each connection against the netlist above:

> Create a schematic for a breadboard workshop kit built on a Seeed Studio XIAO ESP32-S3. Power: 5V from the XIAO 5V/VBUS pin, 3V3 from the XIAO 3V3 pin, common GND.
> 1. A force-sensitive resistor (FSR 402) from 3V3 to GPIO1 (D0), with a 10k pull-down from GPIO1 to GND.
> 2. An 8-LED WS2812B chain (NeoPixel Stick) powered from 5V and GND, data in from GPIO2 (D1) through a 330 ohm resistor, with a 470uF capacitor across 5V and GND near the LEDs.
> 3. A MAX30102 breakout powered from 3V3, SDA to GPIO5 (D4), SCL to GPIO6 (D5), INT to GPIO4 (D3).
> 4. A 3V coin vibration motor driven by a 2N2222A NPN low-side switch: GPIO3 (D2) through 1k to the base, emitter to GND, motor between 3V3 and the collector, 1N4148 flyback diode across the motor with the cathode at 3V3.
> 5. A passive piezo buzzer from GPIO7 (D8) through 100 ohm to GND.
> 6. A 10k potentiometer between 3V3 and GND with the wiper to GPIO8 (D9).
> Label the nets FSR_SENSE, LED_DATA, I2C_SDA, I2C_SCL, PULSE_INT, MOTOR_CTRL, BUZZER, POT_SENSE, 5V, 3V3 and GND. Leave GPIO43, GPIO44 and GPIO9 unconnected.

## After the schematic

- Export the schematic as PDF/PNG and add it to `docs/` and the toolkit page.
- Share the Flux project link (view-only) in this file.
- The kit sketch (`workshop_kit.ino`) will be updated to these pins: FSR on D0, LEDs on D1, motor on D2, I2C on D4/D5, buzzer on D8, potentiometer on D9.
