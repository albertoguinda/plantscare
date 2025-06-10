# -*- coding: utf-8 -*-
#!/usr/bin/env python3
# servidor_modelo.py — Flask + ONNX + SQLite

import os
import sqlite3
from datetime import datetime, timedelta
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
import numpy as np
import onnxruntime as ort
import logging

# ——— Configuración de rutas y constantes ———
BASE_DIR    = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH  = os.path.join(BASE_DIR, "efficientnet_tomates.onnx")
IMAGES_DIR  = os.path.join(BASE_DIR, "imagenes")
DB_PATH     = os.path.join(BASE_DIR, "imagenes.db")
SERVER_PORT = 8000

CLASSES = [
    'acaros_arana', 'danado', 'maduro', 'mancha_bacteriana',
    'mancha_foliar_de_septoria', 'mancha_ocular', 'mildiu_polvoriento', 'moho',
    'pasado', 'sanos', 'tizon_tardio', 'tizon_temprano',
    'verde', 'virus_del_mosaico', 'virus_del_rizado_amarillo'
]

# Asegura que exista la carpeta de imágenes
os.makedirs(IMAGES_DIR, exist_ok=True)

# Logging a consola
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)

# Carga y prueba del modelo ONNX
try:
    session    = ort.InferenceSession(MODEL_PATH)
    input_name = session.get_inputs()[0].name
    logging.info("Modelo ONNX cargado: %s", MODEL_PATH)
    logging.info("Input shape: %s", session.get_inputs()[0].shape)
except Exception as e:
    logging.error("Error cargando ONNX: %s", e)
    raise

# Inicializa Flask y habilita CORS para cualquier origen
app = Flask(__name__)
CORS(app)

# Si existe la base antigua, elimínala para recrear un esquema limpio
if os.path.exists(DB_PATH):
    os.remove(DB_PATH)
    logging.info("Base de datos eliminada: %s", DB_PATH)

# Crea la tabla SQLite
def init_db():
    conn = sqlite3.connect(DB_PATH)
    try:
        conn.execute("""
            CREATE TABLE clasificaciones (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nombre_archivo TEXT NOT NULL,
                clasificacion TEXT NOT NULL,
                probabilidad REAL NOT NULL,
                timestamp TEXT NOT NULL
            )
        """)
        conn.commit()
        logging.info("Tabla SQLite creada: %s", DB_PATH)
    finally:
        conn.close()

init_db()

def guardar_en_db(nombre, clasif, prob, ts):
    conn = sqlite3.connect(DB_PATH)
    try:
        conn.execute("""
            INSERT INTO clasificaciones (nombre_archivo, clasificacion, probabilidad, timestamp)
            VALUES (?, ?, ?, ?)
        """, (nombre, clasif, prob, ts))
        conn.commit()
        logging.info("Guardada en DB: %s → %s (%.4f) en %s", nombre, clasif, prob, ts)
    finally:
        conn.close()

def clasificar_imagen(path):
    img = Image.open(path).convert("RGB").resize((256, 256))
    arr = np.array(img, dtype=np.float32) / 255.0
    arr = np.transpose(arr, (2, 0, 1))[None, ...]  # shape (1,3,256,256)
    out = session.run(None, {input_name: arr})[0]
    idx = int(np.argmax(out))
    prob = float(np.max(out))
    return CLASSES[idx], prob

@app.route("/clasificar", methods=["POST"])
def endpoint_clasificar():
    logging.info("/clasificar called, received files: %s", list(request.files.keys()))
    if 'imagen' not in request.files:
        return jsonify({"error": "Falta campo imagen"}), 400

    img_file = request.files['imagen']
    if img_file.filename == '':
        return jsonify({"error": "Nombre de archivo vacio"}), 400

    if not img_file.filename.lower().endswith(('.jpg', '.jpeg', '.png')):
        return jsonify({"error": "Formato no permitido"}), 400

    # Genera timestamp con +2 horas
    ts_dt = datetime.now() + timedelta(hours=2)
    ts    = ts_dt.strftime("%Y%m%d_%H%M%S")
    fname = f"{ts}.jpg"
    save_path = os.path.join(IMAGES_DIR, fname)

    try:
        img_file.save(save_path)
        logging.info("Imagen guardada: %s", fname)
    except Exception as e:
        logging.error("Error guardando en disco: %s", e)
        return jsonify({"error": f"Save failed: {e}"}), 500

    try:
        clasif, prob = clasificar_imagen(save_path)
        guardar_en_db(fname, clasif, prob, ts)
        return jsonify({
            "archivo": fname,
            "clasificacion": clasif,
            "probabilidad": round(prob, 4),
            "timestamp": ts
        }), 200
    except Exception as e:
        logging.error("Error en clasificacion ONNX: %s", e)
        return jsonify({"error": "Error interno"}), 500

@app.route("/ultimas", methods=["GET"])
def ultimas_clasificaciones():
    """Devuelve las últimas 10 clasificaciones."""
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.execute("""
            SELECT nombre_archivo, clasificacion, probabilidad, timestamp
              FROM clasificaciones
             ORDER BY id DESC
             LIMIT 10
        """)
        rows = cursor.fetchall()
        resultado = [
            {
                "archivo": r[0],
                "clasificacion": r[1],
                "probabilidad": r[2],
                "timestamp": r[3]
            }
            for r in rows
        ]
        return jsonify(resultado), 200
    except Exception as e:
        logging.error("Error al leer DB: %s", e)
        return jsonify({"error": "Error interno"}), 500
    finally:
        conn.close()

if __name__ == "__main__":
    logging.info("Iniciando servidor en 0.0.0.0:%d", SERVER_PORT)
    app.run(host="0.0.0.0", port=SERVER_PORT)
