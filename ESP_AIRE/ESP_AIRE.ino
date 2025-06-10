#include <Wire.h>
#include <Adafruit_TSL2561_U.h>
#include <DHT.h>
#include <ESP8266WiFi.h>
#include <WiFiUdp.h>
#include <NTPClient.h>
#include <coap-simple.h>

// WiFi y CoAP
const char* ssid     = "ITA_Free";
WiFiUDP udp;
Coap coap(udp);
IPAddress serverIP(192,168,14,140);
const char* resource = "aire";

// NTP
NTPClient ntp(udp, "pool.ntp.org", 0, 60000);

// Sensores
DHT dht(14, DHT22);
Adafruit_TSL2561_Unified light(0x39);
#define MQ135_PIN A0

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid);
  while (WiFi.status()!=WL_CONNECTED) delay(200);
  ntp.begin();
  coap.start();
  light.begin();
  light.setGain(TSL2561_GAIN_16X);
  light.setIntegrationTime(TSL2561_INTEGRATIONTIME_101MS);
  dht.begin();
}

void loop() {
  ntp.update();
  unsigned long ts = ntp.getEpochTime();        // seconds since 1970

  float t = dht.readTemperature();
  float h = dht.readHumidity();
  sensors_event_t ev;
  light.getEvent(&ev);
  int co2 = analogRead(MQ135_PIN);
  float lux = ev.light;

  if (!isnan(t)&&!isnan(h)&&co2>0&&lux>=0) {
    String p = "{";
    p += "\"ts\":"+ String(ts) +",";
    p += "\"t\":"+ String(t,1) +",";
    p += "\"h\":"+ String(h,1) +",";
    p += "\"co2\":"+ String(co2) +",";
    p += "\"lux\":"+ String(lux,1);
    p += "}";
    coap.put(serverIP,5683,resource,p.c_str());
    Serial.println(p);
  }
  delay(30000); // 30 segundos
}
