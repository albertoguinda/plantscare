# ![PlantsCare Logo](./public/PLANTSCARE.png)

# PLANTSCARE

Sistema IoT integral para monitorizar, automatizar y cuidar cultivos hidropónicos e invernaderos.  
Combina sensores, visión artificial e inteligencia artificial para ofrecer una plataforma web moderna y escalable.

[🌐 Demo online](https://plantscareweb.vercel.app)

> ⚠️ Solo puedes iniciar sesión usando el botón de Google. Los demás métodos de autenticación están desactivados.

---

## 🌟 Características principales

- Monitorización 24/7 de parámetros: temperatura, humedad, CO₂, luz, agua, etc.
- Detección automática de plagas y madurez mediante visión artificial (IA).
- Dashboard web responsive con datos en tiempo real, gráficas, alertas y sugerencias.
- Arquitectura modular y escalable: añade sensores y dispositivos fácilmente.
- Analítica descriptiva, predictiva y prescriptiva.
- Cloud y Edge Computing: procesamiento local (Raspberry Pi) y en la nube (AWS EC2).
- Notificaciones y sugerencias automáticas.
- Fácil instalación y puesta en marcha plug & play.

---

## 🏗️ Arquitectura general

[Sensores IoT (ESP8266, ESP32-CAM, SensorTile.box Pro)]
│ (CoAP, MQTT, HTTP, BLE)
│
[Raspberry Pi (Gateway, MQTT Broker, scripts Python)]
│
[Cloud AWS EC2 (Node.js, InfluxDB, Flask, SQLite, IA)]
│
[Dashboard web (Astro, React, TailwindCSS, TypeScript)]
│
[Usuario final: Visualización, alertas, gestión]

---

## 💻 Tecnologías utilizadas

- **Frontend:** Astro, React, TypeScript, TailwindCSS
- **Backend:** Node.js, Flask (Python), MQTT, CoAP
- **IoT:** ESP8266, ESP32-CAM, SensorTile.box Pro, Raspberry Pi 4
- **Cloud:** AWS EC2 (Ubuntu), InfluxDB, SQLite, Python scripts, ONNX
- **Otros:** Grafana, Recharts, Mosquitto MQTT Broker

---

## 🛠️ Instalación y puesta en marcha

> **Requisitos:** Node.js, Python 3.x, Raspberry Pi (para gateway), cuenta de AWS (opcional para despliegue cloud), sensores compatibles (ESP8266, ESP32-CAM...)

1. **Clona el repositorio:**
   ```bash
   git clone https://github.com/albertoguinda/plantscare.git
   cd plantscare
   Instala dependencias del frontend:
   ```

bash
cd frontend
npm install
npm run dev

# Accede a http://localhost:4321

Backend y scripts:
(Incluye instrucciones específicas para Node.js, Flask, etc.)

Configura el entorno IoT:

Flashea los sensores con el firmware (ESP8266, ESP32-CAM…).

Edita las IPs y claves en los scripts de configuración.

Lanza el gateway en la Raspberry Pi.

Opcional:

Configura la nube en AWS EC2.

Instala y ejecuta InfluxDB, SQLite y el modelo IA.

Para instrucciones detalladas, revisa la documentación incluida en el repositorio.

📋 Guía de uso
Accede a la demo online usando Google.

Visualiza el estado de los cultivos, gráficas, alertas y sugerencias desde el panel web.

Sube imágenes desde sensores/cámaras para que la IA analice plagas y madurez.

Gestiona notificaciones y revisa históricos.

Amplía el sistema con nuevos sensores fácilmente (modularidad total).

🌱 Roadmap
Soporte para más sensores (pH, EC, NPK, actuadores…)

IA más avanzada y datasets personalizados.

Panel solar y conectividad NB-IoT/LoRaWAN.

Apps móviles (iOS, Android).

Automatización de riego y fertilización.

Integración con servicios de terceros (Telegram, WhatsApp, APIs meteorológicas, etc.).

Instaladores automáticos y asistentes de configuración.

👤 Autores y contacto
Alberto Guinda Sevilla
LinkedIn
Portfolio
albertoguinda@gmail.com

📝 Licencia
Este proyecto está licenciado bajo la licencia MIT. Ver LICENSE para más detalles.

🙌 Agradecimientos
Instituto Tecnológico de Aragón (ITA)

Profesores y mentores

Comunidad open-source IoT y agrotech
