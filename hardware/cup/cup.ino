// Circulation :: cup firmware (ESP32)
//
// One cupping-form device. Reads grip pressure (FSR) and pulse (MAX30102 PPG)
// from the hand holding it, maps the two-signal state to a Five Elements (오행)
// colour on its own, drives an LED ring, and streams the reading to the sync hub
// / TouchDesigner over OSC (with a serial fallback). The cup is self-sufficient:
// it computes and glows without any network, so the installation survives a
// dropped connection. Mirrors src/fiveElements.ts exactly.
//
// Libraries (Arduino Library Manager):
//   "SparkFun MAX3010x Pulse and Proximity Sensor Library" (MAX30105.h, heartRate.h)
//   "Adafruit NeoPixel"
//   "OSC" by CNMAT (OSCMessage.h)
//
// Wiring (defaults): FSR on a divider to GPIO34 (ADC); MAX30102 on I2C (SDA 21,
// SCL 22); NeoPixel ring data on GPIO5. Set the config block for each cup.

#include <Wire.h>
#include <WiFi.h>
#include <WiFiUdp.h>
#include <OSCMessage.h>
#include "MAX30105.h"
#include "heartRate.h"
#include <Adafruit_NeoPixel.h>

// ---------------- config (per cup) ----------------
const int   CUP_ID       = 1;
const char* WIFI_SSID    = "circulation";
const char* WIFI_PASS    = "";
const char* HUB_HOST     = "192.168.4.2"; // sync hub / TouchDesigner machine
const int   HUB_PORT     = 8000;
const int   FSR_PIN      = 34;
const int   LED_PIN      = 5;
const int   LED_COUNT    = 16;
const int   FSR_MIN      = 200;  // calibrate: raw ADC with no grip
const int   FSR_MAX      = 3200; // calibrate: raw ADC at firm grip
// #define RAW_LOG            // uncomment to print raw FSR/IR for tuning

// ---------------- globals ----------------
MAX30105 pulse;
Adafruit_NeoPixel ring(LED_COUNT, LED_PIN, NEO_GRB + NEO_KHZ800);
WiFiUDP udp;

const byte RATE_SIZE = 8;
long intervals[RATE_SIZE];
byte rateSpot = 0;
long lastBeatMs = 0;
float bpm = 0;

float pressure = 0, prevPressure = 0, trend = 0, holdT = 0;
uint8_t curR = 20, curG = 20, curB = 24;
bool wifiOk = false;

// ---------------- Five Elements engine (mirror of src/fiveElements.ts) ----------------
static const uint8_t EL_RGB[5][3] = {
  {95,174,106}, {229,84,75}, {224,178,60}, {238,241,244}, {47,93,138}
}; // wood, fire, earth, metal, water

float smoothstep(float e0, float e1, float x) {
  float t = (x - e0) / (e1 - e0);
  if (t < 0) t = 0; if (t > 1) t = 1;
  return t * t * (3 - 2 * t);
}

// returns dominant element index 0..4 and the blended colour
int computeElement(float pressure, float trend, float bpm, float regularity,
                   float hold, float confidence, uint8_t &r, uint8_t &g, uint8_t &b) {
  float bpmHi = smoothstep(70, 105, bpm);
  float bpmLo = 1 - smoothstep(55, 85, bpm);
  float pMed = 1 - min(1.0f, fabsf(pressure - 0.5f) * 2);
  float conf = constrain(confidence, 0.0f, 1.0f);
  float raw[5];
  raw[0] = max(0.0f, trend);                                        // wood  (building)
  raw[1] = pressure * bpmHi * (0.35f + 0.65f * conf);              // fire  (activation)
  raw[2] = pMed * regularity;                                      // earth (grounding)
  raw[3] = max(0.0f, -trend) * 0.7f + (1 - regularity) * 0.5f;     // metal (release)
  raw[4] = hold * bpmLo * (0.5f + 0.5f * (1 - pressure)) * (0.4f + 0.6f * conf); // water (stillness)
  float sum = 0; for (int i = 0; i < 5; i++) sum += raw[i];
  float w[5];
  if (sum < 1e-4) { for (int i = 0; i < 5; i++) w[i] = (i == 2) ? 1 : 0; }
  else { for (int i = 0; i < 5; i++) w[i] = raw[i] / sum; }
  float fr = 0, fg = 0, fb = 0; int dom = 2; float best = -1;
  for (int i = 0; i < 5; i++) {
    if (w[i] > best) { best = w[i]; dom = i; }
    fr += EL_RGB[i][0] * w[i]; fg += EL_RGB[i][1] * w[i]; fb += EL_RGB[i][2] * w[i];
  }
  r = (uint8_t)fr; g = (uint8_t)fg; b = (uint8_t)fb;
  return dom;
}

// ---------------- pulse ----------------
float regularity = 0.5f, confidence = 0;

void updatePulse() {
  long ir = pulse.getIR();
  bool finger = ir > 50000;
  confidence = finger ? constrain((float)(ir - 50000) / 70000.0f, 0.1f, 1.0f) : 0.0f;
  if (!finger) { lastBeatMs = 0; return; }

  if (checkForBeat(ir)) {
    long now = millis();
    if (lastBeatMs > 0) {
      long d = now - lastBeatMs;
      float b = 60000.0f / d;
      if (b > 30 && b < 220) {
        intervals[rateSpot++] = d; rateSpot %= RATE_SIZE;
        long sum = 0; for (byte i = 0; i < RATE_SIZE; i++) sum += intervals[i];
        float mean = sum / (float)RATE_SIZE;
        bpm = 60000.0f / mean;
        // regularity from interval variance (steady beat -> ~1)
        float var = 0; for (byte i = 0; i < RATE_SIZE; i++) { float dv = intervals[i] - mean; var += dv * dv; }
        float cv = mean > 1 ? sqrtf(var / RATE_SIZE) / mean : 1;
        regularity = 1 - constrain(cv / 0.25f, 0.0f, 1.0f);
      }
    }
    lastBeatMs = now;
  }
}

// ---------------- setup / loop ----------------
void setup() {
  Serial.begin(115200);
  delay(200);
  ring.begin(); ring.setBrightness(120); ring.show();
  if (!pulse.begin(Wire, I2C_SPEED_FAST)) Serial.println("# MAX30102 not found");
  else { pulse.setup(); pulse.setPulseAmplitudeRed(0x0A); pulse.setPulseAmplitudeGreen(0); }
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  for (int i = 0; i < 20 && WiFi.status() != WL_CONNECTED; i++) delay(250);
  wifiOk = WiFi.status() == WL_CONNECTED;
  Serial.println(wifiOk ? "# wifi ok" : "# wifi none, serial only");
}

void loop() {
  // pressure (calibrated 0..1), trend, hold
  int raw = analogRead(FSR_PIN);
  float p = constrain((float)(raw - FSR_MIN) / (FSR_MAX - FSR_MIN), 0.0f, 1.0f);
  pressure = pressure * 0.6f + p * 0.4f; // light smoothing
  float dp = pressure - prevPressure;
  trend = constrain(trend * 0.86f + dp * 9.0f, -1.0f, 1.0f);
  prevPressure = pressure;
  static unsigned long lastMs = 0;
  float dt = (millis() - lastMs) / 1000.0f; lastMs = millis();
  if (pressure > 0.15f && fabsf(trend) < 0.12f) holdT += dt; else holdT *= 0.7f;
  float hold = min(1.0f, holdT / 4.0f);

  updatePulse();

  uint8_t r, g, b;
  int dom = computeElement(pressure, trend, bpm, regularity, hold, confidence, r, g, b);
  curR = curR + (r - curR) * 0.15f; // smooth colour transition
  curG = curG + (g - curG) * 0.15f;
  curB = curB + (b - curB) * 0.15f;
  for (int i = 0; i < LED_COUNT; i++) ring.setPixelColor(i, ring.Color(curR, curG, curB));
  ring.show();

#ifdef RAW_LOG
  Serial.printf("RAW fsr=%d ir=%ld\n", raw, pulse.getIR());
#endif

  // stream the reading
  if (wifiOk) {
    OSCMessage m("/cup");
    m.add((int32_t)CUP_ID).add(pressure).add(bpm).add(confidence)
     .add((int32_t)dom).add((int32_t)r).add((int32_t)g).add((int32_t)b);
    udp.beginPacket(HUB_HOST, HUB_PORT); m.send(udp); udp.endPacket(); m.empty();
  }
  // serial fallback (CSV): id,pressure,bpm,confidence,element,r,g,b
  Serial.printf("%d,%.2f,%.0f,%.2f,%d,%d,%d,%d\n", CUP_ID, pressure, bpm, confidence, dom, r, g, b);

  delay(30);
}
