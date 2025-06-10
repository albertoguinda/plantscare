#!/usr/bin/env python3
import asyncio
from aiocoap import Context, Message, resource, Code
import paho.mqtt.client as mqtt

# MQTT → EC2
BROKER_HOST = "54.147.27.198"
BROKER_PORT = 1883
mqtt_client = mqtt.Client()
mqtt_client.connect(BROKER_HOST, BROKER_PORT, keepalive=60)
mqtt_client.loop_start()

# Mapeo de tópicos
TOPICS = {
    "aire": "plantscare/aire",
    "agua": "plantscare/agua"
}

class Sensor(resource.Resource):
    def __init__(self, key):
        super().__init__()
        self.key   = key
        self.topic = TOPICS[key]

    async def render_put(self, req):
        payload = req.payload.decode()
        print(f"[{self.key}] → {payload}")
        mqtt_client.publish(self.topic, payload)
        return Message(code=Code.CHANGED)

async def main():
    site = resource.Site()
    for key in TOPICS:
        site.add_resource([key], Sensor(key))
    # bind a todas las interfaces IPv4, puerto 5683
    await Context.create_server_context(site, bind=("0.0.0.0", 5683))
    print("CoAP server escuchando en 0.0.0.0:5683")
    await asyncio.get_event_loop().create_future()

if __name__ == "__main__":
    asyncio.run(main())
