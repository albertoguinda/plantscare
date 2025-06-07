import React, { useState } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const MySwal = withReactContent(Swal);

const endpoints = {
  stream: "http://192.168.15.165/stream",
  capture: "http://192.168.15.165/capture",
  restart: "http://192.168.15.165/restart",
  wifi: "http://192.168.15.165/wifi",
};

const VideoComponent = ({ title }: { title: string }) => {
  const [isLoading, setIsLoading] = useState(false);

  const showToast = (mensaje: string, tipo: "success" | "error" | "info" = "success") => {
    toast[tipo](mensaje, {
      position: "top-right",
      autoClose: 3000,
      theme: "light",
      style: {
        background:
          tipo === "success"
            ? "linear-gradient(to right, #a8e063, #56ab2f)"
            : tipo === "error"
            ? "linear-gradient(to right, #f85032, #e73827)"
            : "linear-gradient(to right, #2193b0, #6dd5ed)",
        color: "#fff",
        fontWeight: "bold",
        borderRadius: "10px",
      },
    });
  };

  const ejecutarAccion = async (url: string, metodo = "GET", body: object | null = null) => {
    setIsLoading(true);
    try {
      const options: RequestInit = {
        method: metodo,
        headers: { "Content-Type": "application/json" },
        ...(body ? { body: JSON.stringify(body) } : {}),
      };
      const response = await fetch(url, options);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      showToast("✅ Acción ejecutada correctamente");
    } catch (error) {
      console.error(`Error en ${url}:`, error);
      showToast("❌ Error al ejecutar la acción", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleWifiModal = async () => {
    const { value: formValues } = await MySwal.fire({
      title: "Cambiar WiFi",
      html: `
        <input id="swal-ssid" class="swal2-input" placeholder="🔗 SSID">
        <input id="swal-password" type="password" class="swal2-input" placeholder="🔐 Contraseña">
      `,
      focusConfirm: false,
      confirmButtonText: "Enviar",
      cancelButtonText: "Cancelar",
      showCancelButton: true,
      preConfirm: () => {
        const ssid = (document.getElementById("swal-ssid") as HTMLInputElement)?.value.trim();
        const password = (document.getElementById("swal-password") as HTMLInputElement)?.value.trim();
        if (!ssid || !password) {
          Swal.showValidationMessage("Por favor, completa ambos campos");
          return;
        }
        return { ssid, password };
      },
    });

    if (formValues) {
      await ejecutarAccion(endpoints.wifi, "POST", formValues);
      showToast("📡 Datos WiFi enviados");
    }
  };

  return (
    <div className="w-full max-w-full px-4 sm:px-6 lg:px-8 py-8 bg-white dark:bg-gray-900 rounded-none sm:rounded-2xl shadow-none sm:shadow-2xl overflow-hidden">
      <ToastContainer />
      <h3 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 dark:text-white mb-6 sm:mb-10">
        {title}
      </h3>

      {/* Botones */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6 sm:mb-8 text-sm">
        <button
          onClick={() => showToast("🎥 Streaming embebido cargado", "info")}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-xl shadow-md transition-all w-full">
          🎥 Ver Streaming
        </button>
        <button
          onClick={() => ejecutarAccion(endpoints.capture)}
          className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-xl shadow-md transition-all w-full">
          📸 Tomar Foto
        </button>
        <button
          onClick={() => ejecutarAccion(endpoints.restart)}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-xl shadow-md transition-all w-full">
          🔄 Reiniciar
        </button>
        <button
          onClick={handleWifiModal}
          className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-xl shadow-md transition-all w-full">
          📶 Cambiar WiFi
        </button>
      </div>

      {/* Estado de carga */}
      {isLoading && (
        <div className="text-center text-base sm:text-lg text-green-600 font-medium animate-pulse mb-4">
          🔄 Ejecutando acción...
        </div>
      )}

      {/* Streaming */}
      <div className="overflow-hidden rounded-xl shadow-xl border border-gray-300 dark:border-gray-700">
        <iframe
          src={endpoints.stream}
          className="w-full aspect-video"
          title="ESP32-CAM Streaming"
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
        />
      </div>
    </div>
  );
};

export default VideoComponent;
