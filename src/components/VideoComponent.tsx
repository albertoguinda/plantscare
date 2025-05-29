import React, { useState } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const MySwal = withReactContent(Swal);

// IP ESP32-CAM
//const host = "192.168.10.8"; //CAMPUS
const host = "192.168.1.138"; //CASA

const endpoints = {
  stream:      `http://${host}:81/`,      // MJPEG raíz
  capture:     `http://${host}/capture`,
  restart:     `http://${host}/restart`,
  flashToggle: `http://${host}/flash/toggle`,
  wifi:        `http://${host}/wifi`,
};

const VideoComponent = ({ title }: { title: string }) => {
  const [loading, setLoading] = useState(false);
  const [showStream, setShowStream] = useState(true);
  const [lastPhoto, setLastPhoto] = useState<string | null>(null);
  const [flashOn, setFlashOn] = useState(false);
  const [streamKey, setStreamKey] = useState(0);

  // Toast genérico
  const toastify = (
    msg: string,
    type: "success" | "error" | "info" = "success"
  ) =>
    toast[type](msg, {
      position: "top-right",
      autoClose: 3000,
      style: {
        background:
          type === "success"
            ? "linear-gradient(to right, #4ade80, #22c55e)"
            : type === "error"
            ? "linear-gradient(to right, #ef4444, #b91c1c)"
            : "linear-gradient(to right, #60a5fa, #3b82f6)",
        color: "#fff",
        fontWeight: "bold",
        borderRadius: "0.5rem",
      },
    });

  // Modal para WiFi
  const promptWiFi = async () => {
    const { value } = await MySwal.fire({
      title: "Cambiar WiFi",
      html: `
        <input id="ssid" class="swal2-input" placeholder="🛜 SSID">
        <input id="pwd" type="password" class="swal2-input" placeholder="🔒 Contraseña">
      `,
      showCancelButton: true,
      confirmButtonText: "Enviar",
      focusConfirm: false,
      preConfirm: () => {
        const ssid = (document.getElementById("ssid") as HTMLInputElement).value.trim();
        const password = (document.getElementById("pwd") as HTMLInputElement).value.trim();
        if (!ssid || !password) {
          Swal.showValidationMessage("Completa ambos campos");
          return;
        }
        return { ssid, password };
      },
    });
    return value;
  };

  // Ejecuta acción según endpoint
  const doAction = async (url: string) => {
    setLoading(true);
    try {
      if (url === endpoints.capture) {
        // snapshot
        const resp = await fetch(url);
        if (!resp.ok) throw new Error();
        const blob = await resp.blob();
        setLastPhoto(URL.createObjectURL(blob));
        toastify("Foto capturada");
      } else if (url === endpoints.flashToggle) {
        // toggle flash
        const resp = await fetch(url);
        if (!resp.ok) throw new Error();
        const state = await resp.text();
        setFlashOn(state === "ON");
        toastify(`Flash ${state}`, "info");
      } else if (url === endpoints.wifi) {
        // cambiar WiFi
        const creds = await promptWiFi();
        if (creds) {
          const resp = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(creds),
          });
          if (!resp.ok) throw new Error();
          toastify("WiFi enviado");
        }
      } else {
        // restart u otro GET
        const resp = await fetch(url);
        if (!resp.ok) throw new Error();
        toastify(
          url === endpoints.restart ? "Reiniciando…" : "Acción completada"
        );
        if (url === endpoints.restart) {
          setLastPhoto(null);
          setTimeout(() => setStreamKey(k => k + 1), 2000);
        }
      }
    } catch {
      toastify("Error al ejecutar", "error");
    } finally {
      setLoading(false);
    }
  };

  // Toggle stream
  const toggleStream = () => {
    setShowStream(v => !v);
    if (!showStream) setStreamKey(k => k + 1);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <ToastContainer />
      <h2 className="text-3xl font-bold text-center mb-6">{title}</h2>

      {/* Botones */}
      <div className="flex flex-wrap justify-center gap-4 mb-6">
        <button
          onClick={toggleStream}
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg"
        >
          {showStream ? "❌ Ocultar Stream" : "🎥 Ver Stream"}
        </button>

        <button
          onClick={() => doAction(endpoints.capture)}
          disabled={loading}
          className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg"
        >
          📸 Capturar Foto
        </button>

        <button
          onClick={() => doAction(endpoints.flashToggle)}
          disabled={loading}
          className={`px-6 py-2 rounded-lg text-white ${
            flashOn ? "bg-green-500 hover:bg-green-600" : "bg-green-400 hover:bg-green-500"
          }`}
        >
          💡 Flash {flashOn ? "ON" : "OFF"}
        </button>

        <button
          onClick={() => doAction(endpoints.restart)}
          disabled={loading}
          className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg"
        >
          🔄 Reiniciar
        </button>

        <button
          onClick={() => doAction(endpoints.wifi)}
          disabled={loading}
          className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg"
        >
          📶 Cambiar WiFi
        </button>
      </div>

      {/* Stream MJPEG */}
      {showStream && (
        <div className="relative w-full" style={{ paddingBottom: "75%" }}>
          <img
            key={streamKey}
            src={endpoints.stream}
            alt="ESP32-CAM Live"
            className="absolute inset-0 w-full h-full object-contain bg-black"
          />
        </div>
      )}

      {/* Última captura */}
      {lastPhoto && (
        <div className="mt-6 text-center">
          <h3 className="text-xl font-semibold mb-2">Última Captura</h3>
          <img
            src={lastPhoto}
            alt="Última captura"
            className="mx-auto border rounded-lg max-w-full"
          />
        </div>
      )}
    </div>
  );
};

export default VideoComponent;
