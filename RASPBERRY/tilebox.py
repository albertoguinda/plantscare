#!/usr/bin/env python3
import time
import json
import struct
from datetime import datetime
from bluepy import btle
import paho.mqtt.client as mqtt

# Dirección BLE del SensorTile
DEVICE_ADDR = "D5:CF:7B:74:6B:3B"

# Mapeo UUID → nombre de campo
UUIDS = {
    "00040000-0001-11e1-ac36-0002a5d5c51b": "temperatura",
    "00080000-0001-11e1-ac36-0002a5d5c51b": "humedad",
    "00100000-0001-11e1-ac36-0002a5d5c51b": "presion",
    "01000000-0001-11e1-ac36-0002a5d5c51b": "luz"
}

# Configuración MQTT
MQTT_BROKER = "54.147.27.198"
MQTT_PORT   = 1883
MQTT_TOPIC  = "plantscare/tilebox"

# Intervalo de envío (segundos)
INTERVAL = 10

def decode(uuid, raw):
    """Decodifica el raw bytes según el UUID y devuelve (campo, valor)."""
    if uuid == "00040000-0001-11e1-ac36-0002a5d5c51b":       # temperatura
        return "temperatura", struct.unpack('<h', raw[2:4])[0] / 10.0
    if uuid == "00080000-0001-11e1-ac36-0002a5d5c51b":       # humedad
        return "humedad", struct.unpack('<h', raw[2:4])[0] / 10.0
    if uuid == "00100000-0001-11e1-ac36-0002a5d5c51b":       # presión
        return "presion", struct.unpack('<i', raw[0:4])[0] / 100.0
    if uuid == "01000000-0001-11e1-ac36-0002a5d5c51b":       # luz
        return "luz", struct.unpack('<H', raw[2:4])[0]
    return None, None

def main():
    # 1) Conecta MQTT
    mqtt_client = mqtt.Client()
    mqtt_client.connect(MQTT_BROKER, MQTT_PORT, keepalive=60)
    mqtt_client.loop_start()

    # 2) Conecta BLE
    print(f"Conectando a SensorTile {DEVICE_ADDR}…")
    peripheral = btle.Peripheral(DEVICE_ADDR, btle.ADDR_TYPE_RANDOM)
    print("Conectado vía BLE.\n")

    while True:
        # 3) Timestamp epoch
        ts = int(time.time())
        data = {"ts": ts}

        # 4) Lee todas las características
        for svc in peripheral.getServices():
            for ch in svc.getCharacteristics():
                u = str(ch.uuid)
                if u in UUIDS:
                    try:
                        raw = ch.read()
                        name, val = decode(u, raw)
                        if name:
                            data[name] = val
                    except Exception as e:
                        print(f"[ERROR] lectura {UUIDS[u]}: {e}")

        # 5) Publica en MQTT
        payload = json.dumps(data)
        mqtt_client.publish(MQTT_TOPIC, payload)
        print(f"{datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')} → {payload}")

        # 6) Espera antes de la siguiente medida
        time.sleep(INTERVAL)

if __name__ == "__main__":
    main()
