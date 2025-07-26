# 🌱 PlantsCare

> **Sistema IoT integral para cultivos hidropónicos e invernaderos**  
> Monitorización en tiempo real, visión artificial y control automatizado.

---

[🌐 Live Demo](https://plantscareweb.vercel.app) | [💻 Código en GitHub](https://github.com/albertoguinda/plantscare)  
[![GitHub](https://img.shields.io/badge/GitHub-albertoguinda-181717?logo=github)](https://github.com/albertoguinda)  
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Alberto-0A66C2?logo=linkedin)](https://www.linkedin.com/in/albertoguindasevilla/)

---

## 📋 Contenido

1. [Resumen](#-resumen)
2. [Tecnologías](#-tecnologías)
3. [Arquitectura & Flujo de Datos](#-arquitectura--flujo-de-datos)
4. [Instalación & Ejecución](#-instalación--ejecución)
5. [Estructura del Proyecto](#-estructura-del-proyecto)
6. [Futuras Mejoras](#-futuras-mejoras)
7. [Licencia & Créditos](#-licencia--créditos)

---

## 🔭 Resumen

PlantsCare es una plataforma modular que:

- **Captura** datos de sensores (temperatura, humedad, CO₂, luz, pH, EC) con ESP8266 vía CoAP y SensorTile.box Pro vía BLE.
- **Envía** imágenes desde ESP32-CAM al servidor mediante HTTP POST para clasificación de plagas y madurez.
- **Procesa** y almacena lecturas en InfluxDB y resultados de IA en SQLite, todo en un backend Flask/ONNX desplegado en AWS EC2.
- **Ofrece** un dashboard ultrarrápido con Astro + React + TypeScript + TailwindCSS que consume endpoints REST/Express y muestra gráficas en tiempo real (Recharts).
- **Permite** integración con paneles de Grafana para analítica avanzada y visualización histórica.
- **Mantiene** comunicación fiable mediante MQTT (Mosquitto) y es extensible a nuevos dispositivos.

---

## 🛠️ Tecnologías

- **Frontend:** Astro · React · TypeScript · TailwindCSS · Recharts
- **Backend IoT:** Node.js + Express · Flask (Python) + ONNX · MQTT (Mosquitto) · CoAP · HTTP POST
- **Dispositivos:** ESP8266 · ESP32-CAM · SensorTile.box Pro · Raspberry Pi 4
- **Cloud & Base de datos:** AWS EC2 · InfluxDB · SQLite
- **DevOps:** Vercel · GitHub Actions · Docker (opcional)

---

## 🏗️ Arquitectura & Flujo de Datos

```text
/
├─ Sensores
│   ├─ ESP8266 (CoAP) ───▶ Raspberry Pi
│   ├─ SensorTile.box Pro (BLE) ───▶ Raspberry Pi
│   └─ ESP32-CAM (HTTP POST imágenes) ───▶ Raspberry Pi
│
├─ Raspberry Pi ───▶ MQTT (Mosquitto) ───▶ AWS EC2
│
├─ AWS EC2
│   ├─ InfluxDB
│   ├─ SQLite
│   └─ Flask + ONNX (EfficientNet_B0)
│
└─ Frontend (Astro + React) ───▶ Consume REST `/api/*` → Gráficas (Recharts)
Muestreo cada 30 s; el dashboard puede alternar entre datos reales y simulados.

🚀 Instalación & Ejecución

git clone https://github.com/albertoguinda/plantscare.git
cd plantscare

# Backend IoT y ML
cd EC2_AWS
pip install -r requirements.txt
mosquitto -c mosquitto.conf &

cd ../RASPBERRY
python servidorcoap.py &
python mqtt_to_influx.py &
python servidorflask.py &

# Frontend
cd src
npm install
npm run dev

# Abre en el navegador:
http://localhost:4321

📂 Estructura del Proyecto

/
├── DATASHEETS/            # Datasheets de sensores y microcontroladores
├── EC2_AWS/               # Backend ML & scripts MQTT → InfluxDB
├── ESP_AGUA/              # Firmware ESP8266 (sensor de agua)
├── ESP_AIRE/              # Firmware ESP8266 (sensor de aire)
├── ESP_CAMARA/            # Código ESP32-CAM (streaming via HTTP POST)
├── RASPBERRY/             # Scripts Python CoAP, MQTT e integración
├── docs/                  # Diagramas, BMC, DAFO, presentaciones
├── dist/                  # Build estático del frontend
├── public/                # Assets estáticos para Astro
├── src/                   # Código fuente Astro + React + TailwindCSS
└── README.md

🔧 Futuras Mejoras
Añadir conectividad LoRaWAN/NB-IoT para entornos remotos.

Implementar cifrado TLS/DTLS en MQTT/CoAP.

Panel web para configurar umbrales y actuadores.

Integración de actuadores automáticos para cuidado de cultivos y prevención de plagas.

📜 Licencia & Créditos

MIT © Alberto Guinda Sevilla

GitHub: github.com/albertoguinda

LinkedIn: linkedin.com/in/albertoguindasevilla

```
