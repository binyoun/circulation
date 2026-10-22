// Circulation workshop kit: one finger pad, by hand.
//
// Press the sensor and the light glows in your element's colour, brighter as
// you press harder. This is a single pad of the Circulation cup, small enough
// to build in ten minutes. Open Tools > Serial Plotter to see your pressure as
// a live line.
//
// Wiring (5 V boards such as Uno or Nano):
//   FSR: one leg to 5V, other leg to A0; 10k resistor from A0 to GND.
//   NeoPixel (WS2812B): 5V, GND, DIN to pin 6.
//   Or a common-cathode RGB LED: R to pin 9, G to pin 10, B to pin 11,
//   each through a 220 ohm resistor, long leg to GND. Set USE_NEOPIXEL to 0.
//
// The one line to change: ELEMENT, 0 to 4.

#define USE_NEOPIXEL 1

#if USE_NEOPIXEL
#include <Adafruit_NeoPixel.h>
Adafruit_NeoPixel pixel(1, 6, NEO_GRB + NEO_KHZ800);
#endif

// 0 Wood (thumb)  1 Fire (index)  2 Earth (middle)  3 Metal (ring)  4 Water (little)
const int ELEMENT = 1;

const uint8_t COLOURS[5][3] = {
  {95, 174, 106},   // Wood, green
  {229, 84, 75},    // Fire, red
  {224, 178, 60},   // Earth, yellow
  {238, 241, 244},  // Metal, white
  {47, 93, 138},    // Water, deep blue
};

const int FSR_PIN = A0;
const int TOUCH = 40;    // raw reading below this counts as not pressed
const int FIRM = 800;    // raw reading for a firm press; adjust per sensor

float level = 0;         // smoothed 0..1

void show(float k) {
  uint8_t r = COLOURS[ELEMENT][0] * k, g = COLOURS[ELEMENT][1] * k, b = COLOURS[ELEMENT][2] * k;
#if USE_NEOPIXEL
  pixel.setPixelColor(0, pixel.Color(r, g, b));
  pixel.show();
#else
  analogWrite(9, r); analogWrite(10, g); analogWrite(11, b);
#endif
}

void setup() {
  Serial.begin(9600);
#if USE_NEOPIXEL
  pixel.begin();
  pixel.setBrightness(120);
#endif
}

void loop() {
  int raw = analogRead(FSR_PIN);
  float target = raw < TOUCH ? 0 : constrain((raw - TOUCH) / float(FIRM - TOUCH), 0, 1);
  level += (target - level) * 0.15;   // ease in and out, like breath rather than a switch
  show(level);
  Serial.print("pressure:"); Serial.println(level * 100);
  delay(20);
}
