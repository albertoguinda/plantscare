#!/usr/bin/env python3
from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import os
import requests
import logging

app = Flask(__name__)
CORS(app)

# ——— Configuración ———
# Carpeta en el Escritorio de la Pi donde se guardan las imágenes
IMAGES_DIR = os.path.join(os.path.expanduser("~"), "Desktop", "imagenes")
# Endpoint de tu EC2 que ejecuta servidor_modelo.py
EC2_URL = "http://54.147.27.198:8000/clasificar"
# ————————————————————

# Asegurarse de que exista la carpeta
os.makedirs(IMAGES_DIR, exist_ok=True)

# Logging a consola
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")

@app.route("/upload", methods=["POST"])
def upload():
    # 1) Leer cuerpo como JPEG crudo
    img_bytes = request.get_data()
    if not img_bytes:
        logging.error("No se recibió ningún dato en el POST")
        return jsonify({"error": "No data"}), 400

    # 2) Guardar respaldo en la Pi
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{timestamp}.jpg"
    filepath = os.path.join(IMAGES_DIR, filename)
    try:
        with open(filepath, "wb") as f:
            f.write(img_bytes)
        logging.info(f"✔ Imagen guardada en Pi: {filepath}")
    except Exception as e:
        logging.error(f"!! Error al guardar imagen en Pi: {e}")
        return jsonify({"error": f"Save failed: {e}"}), 500

    # 3) Reenviar a la EC2
    try:
        with open(filepath, "rb") as f_img:
            files = {"imagen": (filename, f_img, "image/jpeg")}
            resp = requests.post(EC2_URL, files=files, timeout=15)
        logging.info(f"→ Reenvío a EC2: HTTP {resp.status_code}")
        return (resp.text, resp.status_code, {"Content-Type": "application/json"})
    except Exception as e:
        logging.error(f"!! Error reenviando a EC2: {e}")
        return jsonify({"error": f"Forward failed: {e}"}), 502

if __name__ == "__main__":
    logging.info("Arrancando servidor Flask en puerto 5000...")
    app.run(host="0.0.0.0", port=5000)
