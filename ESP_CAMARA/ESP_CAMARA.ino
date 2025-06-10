#include <Arduino.h>
#include "esp_camera.h"
#include <WiFi.h>
#include <HTTPClient.h>
#include "SD_MMC.h"
#include "time.h"
#include "app_httpd.h"    // startCameraServer(), camera_httpd, isStreaming
#include <ArduinoJson.h>  // para parsear JSON

#define CAMERA_MODEL_AI_THINKER
#include "camera_pins.h"

// ——— Configuración Wi-Fi & Flask ———
const char* WIFI_SSID    = "IABD";
const char* WIFI_PASS    = "HDvz7Sm#";
const char* FLASK_UPLOAD = "http://192.168.10.8:5000/upload";
// ————————————————————————————————

extern httpd_handle_t camera_httpd;
extern bool          isStreaming;

static const int FLASH_PIN      = LED_GPIO_NUM;
static bool      flashState    = false;
static unsigned long lastPeriodic = 0;

// ——— Prototipos de handlers —————————————————————————————————————————
static esp_err_t handleCapture   (httpd_req_t* req);
static esp_err_t handleRestart   (httpd_req_t* req);
static esp_err_t handleFlashToggle(httpd_req_t* req);
static esp_err_t handleWifi      (httpd_req_t* req);

// ——— URI handlers globales —————————————————————————————————————————
httpd_uri_t capture_uri = {
  .uri       = "/capture",
  .method    = HTTP_GET,
  .handler   = handleCapture,
  .user_ctx  = nullptr
};
httpd_uri_t restart_uri = {
  .uri       = "/restart",
  .method    = HTTP_GET,
  .handler   = handleRestart,
  .user_ctx  = nullptr
};
httpd_uri_t flash_uri = {
  .uri       = "/flash/toggle",
  .method    = HTTP_GET,
  .handler   = handleFlashToggle,
  .user_ctx  = nullptr
};
httpd_uri_t wifi_uri = {
  .uri       = "/wifi",
  .method    = HTTP_POST,
  .handler   = handleWifi,
  .user_ctx  = nullptr
};

// ——— Helpers SD/NTP, filename y POST a Flask ———————————————————————————

void initSDyNTP() {
  if (!SD_MMC.begin()) Serial.println("ERROR: SD init failed");
  configTime(2*3600, 0, "pool.ntp.org", "time.nist.gov");
  struct tm tm;
  while (!getLocalTime(&tm)) { Serial.print('.'); delay(200); }
  Serial.println("\n✔ SD e NTP OK");
}

String makeFilename() {
  struct tm tm;
  char buf[32];
  if (getLocalTime(&tm))
    strftime(buf, sizeof(buf), "/%Y%m%d_%H%M%S.jpg", &tm);
  else
    snprintf(buf, sizeof(buf), "/%lu.jpg", millis()/1000);
  return String(buf);
}

bool postToFlask(const camera_fb_t* fb) {
  HTTPClient http;
  
  Serial.println(">> postToFlask: iniciando HTTPClient.begin()");
  if (!http.begin(FLASK_UPLOAD)) {
    Serial.println("!! postToFlask: ERROR al inicializar HTTPClient");
    return false;
  }

  http.setTimeout(5000);
  http.addHeader("Content-Type", "image/jpeg");

  Serial.printf(">> postToFlask: POST %s (len=%u bytes)\n",
                FLASK_UPLOAD, (unsigned)fb->len);

  // envía el buffer como body
  int code = http.POST(fb->buf, fb->len);

  if (code > 0) {
    Serial.printf("✔ postToFlask: HTTP %d\n", code);
    String resp = http.getString();
    Serial.printf("  payload: %s\n", resp.c_str());
  } else {
    Serial.printf("!! postToFlask: fallo POST, error: %s\n",
                  http.errorToString(code).c_str());
  }

  http.end();
  return (code > 0 && code < 300);
}

// ——— Captura un frame + SD + Flask + opcional HTTP response —————————————

bool captureAndUpload(String* outPath = nullptr, httpd_req_t* req = nullptr) {
  sensor_t* s = esp_camera_sensor_get();
  s->set_framesize(s, FRAMESIZE_UXGA);

  camera_fb_t* fb = esp_camera_fb_get();
  if (!fb) return false;

  digitalWrite(FLASH_PIN, LOW);
  bool ok = postToFlask(fb);

  if (outPath) {
    String path = makeFilename();
    File f = SD_MMC.open(path, FILE_WRITE);
    if (f) { f.write(fb->buf, fb->len); f.close(); Serial.printf("✔ SD %s\n", path.c_str()); }
    *outPath = path;
  }

  if (req) {
    httpd_resp_set_hdr(req, "Access-Control-Allow-Origin", "*");
    httpd_resp_set_type(req, "image/jpeg");
    httpd_resp_send(req, (const char*)fb->buf, fb->len);
  }

  esp_camera_fb_return(fb);
  s->set_framesize(s, FRAMESIZE_VGA);
  digitalWrite(FLASH_PIN, flashState ? LOW : HIGH);
  return ok;
}

// ——— Handlers HTTP ————————————————————————————————————————————————

static esp_err_t handleCapture(httpd_req_t* req) {
  return captureAndUpload(nullptr, req) ? ESP_OK : httpd_resp_send_500(req);
}

static esp_err_t handleRestart(httpd_req_t* req) {
  httpd_resp_set_hdr(req,"Access-Control-Allow-Origin","*");
  httpd_resp_send(req,"OK",2);
  delay(50); esp_restart();
  return ESP_OK;
}

static esp_err_t handleFlashToggle(httpd_req_t* req) {
  httpd_resp_set_hdr(req,"Access-Control-Allow-Origin","*");
  flashState = !flashState;
  digitalWrite(FLASH_PIN, flashState ? LOW : HIGH);
  const char* msg = flashState ? "ON" : "OFF";
  httpd_resp_set_type(req,"text/plain");
  httpd_resp_send(req,msg,strlen(msg));
  Serial.printf("Flash %s\n", msg);
  return ESP_OK;
}

// Recibe JSON {ssid, password} y responde OK
static esp_err_t handleWifi(httpd_req_t* req) {
  httpd_resp_set_hdr(req,"Access-Control-Allow-Origin","*");
  int len = req->content_len;
  if (len <= 0) return httpd_resp_send_500(req);

  // lee body
  std::vector<char> buf(len+1);
  httpd_req_recv(req, buf.data(), len);
  buf[len] = '\0';

  // parsea JSON
  StaticJsonDocument<200> doc;
  DeserializationError err = deserializeJson(doc, buf.data());
  if (err) return httpd_resp_send_500(req);

  const char* ssid = doc["ssid"];
  const char* pwd  = doc["password"];
  if (!ssid || !pwd) return httpd_resp_send_500(req);

  // reconecta WiFi
  WiFi.begin(ssid, pwd);
  unsigned long t0 = millis();
  while (WiFi.status()!=WL_CONNECTED && millis()-t0<10000) delay(200);

  httpd_resp_set_type(req,"text/plain");
  return WiFi.status()==WL_CONNECTED
    ? httpd_resp_send(req,"OK",2)
    : httpd_resp_send(req,"FAIL",4);
}

// ——— Registro de URIs y arranque ——————————————————————————————————————

void registerCustomURIs() {
  httpd_register_uri_handler(camera_httpd, &capture_uri);
  httpd_register_uri_handler(camera_httpd, &restart_uri);
  httpd_register_uri_handler(camera_httpd, &flash_uri);
  httpd_register_uri_handler(camera_httpd, &wifi_uri);
}

void setup() {
  Serial.begin(115200);
  pinMode(FLASH_PIN, OUTPUT);
  digitalWrite(FLASH_PIN, HIGH);
  delay(100);

  // — Inicializa cámara —
  camera_config_t cfg;
  cfg.ledc_channel = LEDC_CHANNEL_0;
  cfg.ledc_timer   = LEDC_TIMER_0;
  cfg.pin_d0       = Y2_GPIO_NUM;  cfg.pin_d1 = Y3_GPIO_NUM;
  cfg.pin_d2       = Y4_GPIO_NUM;  cfg.pin_d3 = Y5_GPIO_NUM;
  cfg.pin_d4       = Y6_GPIO_NUM;  cfg.pin_d5 = Y7_GPIO_NUM;
  cfg.pin_d6       = Y8_GPIO_NUM;  cfg.pin_d7 = Y9_GPIO_NUM;
  cfg.pin_xclk     = XCLK_GPIO_NUM;
  cfg.pin_pclk     = PCLK_GPIO_NUM;
  cfg.pin_vsync    = VSYNC_GPIO_NUM;
  cfg.pin_href     = HREF_GPIO_NUM;
  cfg.pin_sccb_sda = SIOD_GPIO_NUM;
  cfg.pin_sccb_scl = SIOC_GPIO_NUM;
  cfg.pin_pwdn     = PWDN_GPIO_NUM;
  cfg.pin_reset    = RESET_GPIO_NUM;
  cfg.xclk_freq_hz = 20000000;
  cfg.pixel_format = PIXFORMAT_JPEG;
  cfg.frame_size   = FRAMESIZE_VGA;
  cfg.jpeg_quality = 10;
  cfg.fb_location  = CAMERA_FB_IN_PSRAM;
  cfg.fb_count     = 2;
  cfg.grab_mode    = CAMERA_GRAB_WHEN_EMPTY;

  if (esp_camera_init(&cfg) != ESP_OK) {
    Serial.println("ERROR: init cámara");
    while(true) delay(100);
  }
  Serial.println("✔ Cámara lista");

  // — Conexión Wi-Fi inicial —
  Serial.printf("Conectando a %s …", WIFI_SSID);
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  WiFi.setSleep(false);
  unsigned long t0 = millis();
  while (WiFi.status()!=WL_CONNECTED && millis()-t0<10000) { Serial.print('.'); delay(200); }
  if (WiFi.status()==WL_CONNECTED)
    Serial.printf("\n✔ IP: %s\n", WiFi.localIP().toString().c_str());
  else
    Serial.println("\nERROR: no conectó");

  // — Servidor HTTP y SD/NTP —
  startCameraServer();
  registerCustomURIs();
  initSDyNTP();
  lastPeriodic = millis();
}

void loop() {
  // **Captura periódica** cada 5 min, solo si no hay streaming
  if (!isStreaming && millis() - lastPeriodic >= 30000) { // 30 segundos
    lastPeriodic = millis();
    Serial.println("⏱ Captura periódica");
    if (!captureAndUpload()) Serial.println("ERROR captura periódica");
  }
  delay(500);
}
