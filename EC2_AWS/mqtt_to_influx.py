#!/usr/bin/env python3
import json
from datetime import datetime, timezone, timedelta
import paho.mqtt.client as mqtt
from influxdb import InfluxDBClient

# --- CONFIGURACIÓN ---
MQTT_BROKER = "localhost"
MQTT_PORT = 1883
MQTT_TOPIC = "plantscare/tilebox"

INFLUX_ADDRESS = "localhost"
INFLUX_PORT = 8086
INFLUX_DB = "plantscare"

# Conexión a InfluxDB
influx = InfluxDBClient(host=INFLUX_ADDRESS, port=INFLUX_PORT)
influx.switch_database(INFLUX_DB)

def on_message(client, userdata, msg):
    try:
        payload = json.loads(msg.payload.decode())

        # Timestamp: ts + 2 horas (UTC)
        ts = payload.get("ts")
        dt = (datetime.fromtimestamp(ts, timezone.utc) + timedelta(hours=2)
              if ts else datetime.now(timezone.utc))
        time_str = dt.strftime("%Y-%m-%d %H:%M:%S")

        # Solo presion
        pres = payload.get("presion")
        if pres is None:
            return  # nada que guardar

        # Escritura en InfluxDB
        point = [{
            "measurement": "presion",
            "tags":       {"device": "tilebox"},
            "time":       time_str,
            "fields":     {"presion": float(pres)}
        }]
        influx.write_points(point)
        print(f"[InfluxDB] presion={pres} @{time_str}")

    except Exception as e:
        print(f"[ERROR] {e}")

# Inicialización MQTT
mqttc = mqtt.Client()
mqttc.on_message = on_message
mqttc.connect(MQTT_BROKER, MQTT_PORT)
mqttc.subscribe(MQTT_TOPIC)
print(f"[INFO] escuchando {MQTT_TOPIC} …")
mqttc.loop_forever()
