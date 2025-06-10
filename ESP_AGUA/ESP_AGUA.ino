#include <ESP8266WiFi.h>
#include <WiFiUdp.h>
#include <NTPClient.h>
#include <coap-simple.h>
#include <OneWire.h>
#include <DallasTemperature.h>

// ————— WiFi + CoAP —————
const char* ssid     = "ITA_Free";
WiFiUDP udp;
Coap   coap(udp);
IPAddress serverIP(192, 168, 14, 140);
const char* resource = "agua";

// ————— NTP para timestamp —————
NTPClient ntp(udp, "pool.ntp.org", 0, 60000);

// ————— DS18B20 en GPIO14 (D5) —————
#define ONE_WIRE_BUS 14
OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);

void setup() {
  Serial.begin(115200);
  // Wi-Fi
  WiFi.begin(ssid);
  while (WiFi.status() != WL_CONNECTED) delay(200);
  Serial.println("WiFi OK: " + WiFi.localIP().toString());
  // NTP & CoAP init
  ntp.begin();
  coap.start();
  // DS18B20 init
  sensors.begin();
}

void loop() {
  ntp.update();
  unsigned long ts = ntp.getEpochTime();  // unix epoch UTC

  sensors.requestTemperatures();
  delay(750);
  float temp = sensors.getTempCByIndex(0);

  if (!isnan(temp) && temp != DEVICE_DISCONNECTED_C) {
    String p = "{";
    p += "\"ts\":" + String(ts) + ",";
    p += "\"t\":"  + String(temp, 2);
    p += "}";
    coap.put(serverIP, 5683, resource, p.c_str());
    Serial.println("Enviado: " + p);
  } else {
    Serial.println("[ERROR] Temp inválida");
  }

  delay(30000);  // 30 segundos
}
